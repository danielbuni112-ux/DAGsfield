import { getNovitaImageModelById, getNovitaVideoModelById } from './models.js';

export class NovitaClient {
    constructor() {
        this.baseUrl = 'https://api.novita.ai/v3/async';
    }

    getKey() {
        const key = localStorage.getItem('novita_api_key');
        if (!key) throw new Error('API Key missing. Please set it in Settings.');
        return key;
    }

    getDimensionsFromAR(ar) {
        switch (ar) {
            case '1:1': return [1024, 1024];
            case '16:9': return [1280, 720];
            case '9:16': return [720, 1280];
            case '4:3': return [1152, 864];
            case '3:4': return [864, 1152];
            case '3:2': return [1216, 832];
            case '2:3': return [832, 1216];
            case '21:9': return [1536, 640];
            default: return [1024, 1024];
        }
    }

    applyResolution(payload, resolution) {
        if (resolution === '1k') {
            payload.width = 1024;
            payload.height = 1024;
        } else if (resolution === '2k') {
            payload.width = 1440;
            payload.height = 1440;
        } else if (resolution === '4k') {
            payload.width = 2048;
            payload.height = 2048;
        }
    }

    async submitTask(path, payload, key) {
        const url = `${this.baseUrl}/${path}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API Request Failed: ${response.status} ${response.statusText} - ${errText.slice(0, 140)}`);
        }

        const data = await response.json();
        const taskId = data.task_id;
        if (!taskId) throw new Error('Novita async API did not return task_id.');
        return taskId;
    }

    async pollTaskResult(taskId, key, maxAttempts = 180, interval = 2000) {
        const url = `${this.baseUrl}/task-result?task_id=${encodeURIComponent(taskId)}`;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            await new Promise(resolve => setTimeout(resolve, interval));

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`
                }
            });

            if (!response.ok) {
                const errText = await response.text();
                if (response.status >= 500) continue;
                throw new Error(`Poll Failed: ${response.status} - ${errText.slice(0, 140)}`);
            }

            const data = await response.json();
            const status = data?.task?.status;

            if (status === 'TASK_STATUS_SUCCEED') return data;
            if (status === 'TASK_STATUS_FAILED') {
                throw new Error(`Generation failed: ${data?.task?.reason || 'Unknown error'}`);
            }
        }

        throw new Error('Generation timed out after polling.');
    }

    async generateImage(params) {
        const key = this.getKey();
        const modelInfo = getNovitaImageModelById(params.model);
        const modelName = modelInfo?.endpoint || params.model;

        const request = {
            model_name: modelName,
            prompt: params.prompt,
            width: 1024,
            height: 1024,
            image_num: 1,
            steps: params.steps || 20,
            guidance_scale: params.guidance_scale || 7.5,
            sampler_name: params.sampler_name || 'Euler a'
        };

        if (params.aspect_ratio) {
            const [width, height] = this.getDimensionsFromAR(params.aspect_ratio);
            request.width = width;
            request.height = height;
        }
        if (params.resolution) this.applyResolution(request, params.resolution);
        if (params.negative_prompt) request.negative_prompt = params.negative_prompt;
        if (typeof params.seed === 'number') request.seed = params.seed;

        const taskId = await this.submitTask('txt2img', { request }, key);
        if (params.onRequestId) params.onRequestId(taskId);

        const result = await this.pollTaskResult(taskId, key);
        const imageUrl = result.images?.[0]?.image_url;
        return { ...result, request_id: taskId, url: imageUrl };
    }

    async generateVideo(params) {
        const key = this.getKey();
        const modelInfo = getNovitaVideoModelById(params.model);
        const modelName = modelInfo?.endpoint || params.model;

        let width = 1024;
        let height = 576;
        if (params.aspect_ratio) {
            [width, height] = this.getDimensionsFromAR(params.aspect_ratio);
        }

        const duration = Number(params.duration) || 5;
        const frames = Math.max(8, Math.min(128, duration * 16));

        const payload = {
            model_name: modelName,
            width,
            height,
            steps: params.steps || 20,
            prompts: [{ frames, prompt: params.prompt }]
        };

        if (params.negative_prompt) payload.negative_prompt = params.negative_prompt;
        if (typeof params.seed === 'number') payload.seed = params.seed;
        if (params.resolution) this.applyResolution(payload, params.resolution);

        const taskId = await this.submitTask('txt2video', payload, key);
        if (params.onRequestId) params.onRequestId(taskId);

        const result = await this.pollTaskResult(taskId, key, 360, 2500);
        const videoUrl = result.videos?.[0]?.video_url;
        return { ...result, request_id: taskId, url: videoUrl };
    }

    async generateI2I(params) {
        if (!params.image_base64) {
            throw new Error('Novita i2i requires image_base64 for /v3/async/img2img.');
        }

        const key = this.getKey();
        const modelInfo = getNovitaImageModelById(params.model);
        const modelName = modelInfo?.endpoint || params.model;

        const request = {
            model_name: modelName,
            image_base64: params.image_base64,
            prompt: params.prompt || '',
            width: 1024,
            height: 1024,
            image_num: 1,
            steps: params.steps || 20,
            guidance_scale: params.guidance_scale || 7.5,
            sampler_name: params.sampler_name || 'Euler a'
        };

        if (params.aspect_ratio) {
            const [width, height] = this.getDimensionsFromAR(params.aspect_ratio);
            request.width = width;
            request.height = height;
        }
        if (params.resolution) this.applyResolution(request, params.resolution);
        if (typeof params.seed === 'number') request.seed = params.seed;

        const taskId = await this.submitTask('img2img', { request }, key);
        if (params.onRequestId) params.onRequestId(taskId);

        const result = await this.pollTaskResult(taskId, key);
        const imageUrl = result.images?.[0]?.image_url;
        return { ...result, request_id: taskId, url: imageUrl };
    }

    async generateI2V() {
        throw new Error('Novita i2v in this client is not implemented yet. Use txt2video or extend with /v3/async/img2video + base64.');
    }

    async uploadFile() {
        throw new Error('Novita v3 media APIs require base64 inputs for i2i/i2v; uploadFile is not supported in this client.');
    }

    async processV2V() {
        throw new Error('Novita v3 video-edit endpoint is not implemented yet in this client.');
    }

    async processLipSync() {
        throw new Error('Novita lipsync endpoint is not implemented yet in this client.');
    }
}

export const novita = new NovitaClient();
