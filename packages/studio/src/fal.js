import { getModelById, getVideoModelById, getI2IModelById, getI2VModelById, getV2VModelById, getLipSyncModelById } from './models.js';

const QUEUE_URL = 'https://queue.fal.run';
const REST_URL = 'https://rest.fal.ai';

async function pollForResult(requestId, modelId, key, onStatusUpdate, maxAttempts = 900, interval = 2000) {
    const pollUrl = `${QUEUE_URL}/${modelId}/requests/${requestId}/status`;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await new Promise(resolve => setTimeout(resolve, interval));
        try {
            const response = await fetch(pollUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Key ${key}`
                }
            });
            if (!response.ok) {
                const errText = await response.text();
                if (response.status >= 500) continue;
                throw new Error(`Poll Failed: ${response.status} - ${errText.slice(0, 100)}`);
            }
            const data = await response.json();
            const status = data.status;

            if (onStatusUpdate) {
                onStatusUpdate({
                    status: status === 'COMPLETED' ? 'completed' : (status === 'IN_QUEUE' ? 'queued' : 'processing'),
                    message: `Status: ${status}`,
                    progress: data.progress
                });
            }

            if (status === 'COMPLETED') {
                if (data.response_url) {
                    const resultResponse = await fetch(data.response_url, {
                        headers: { 'Authorization': `Key ${key}` }
                    });
                    if (!resultResponse.ok) {
                        throw new Error(`Failed to fetch result from ${data.response_url}`);
                    }
                    return await resultResponse.json();
                }
                return data.payload || data;
            }
            if (status === 'FAILED') {
                throw new Error(`Generation failed: ${data.error || 'Unknown error'}`);
            }
            // Other statuses like 'IN_QUEUE', 'IN_PROGRESS' continue polling
        } catch (error) {
            if (attempt === maxAttempts) throw error;
        }
    }
    throw new Error('Generation timed out after polling.');
}

export async function submitAndPoll(modelId, payload, key, onRequestId, onStatusUpdate, maxAttempts = 60) {
    const url = `${QUEUE_URL}/${modelId}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Key ${key}`
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Request Failed: ${response.status} ${response.statusText} - ${errText.slice(0, 100)}`);
    }
    const submitData = await response.json();
    const requestId = submitData.request_id;
    if (!requestId) return submitData;
    if (onRequestId) onRequestId(requestId);

    if (onStatusUpdate) {
        onStatusUpdate({ status: 'queued', message: 'In queue...' });
    }

    const result = await pollForResult(requestId, modelId, key, onStatusUpdate, maxAttempts);

    // Standardize output URL similar to muapi.js
    const outputUrl = result.images?.[0]?.url || result.video?.url || result.url || result.output?.url || result.file?.url;
    return { ...result, url: outputUrl };
}

export async function generateImage(apiKey, params) {
    const modelInfo = getModelById(params.model);
    const modelId = modelInfo?.endpoint || params.model;
    const payload = { ...params };
    delete payload.model;
    delete payload.onRequestId;
    delete payload.onStatusUpdate;

    // Map common params if they are named differently in the app vs fal.ai
    if (params.prompt) payload.prompt = params.prompt;
    if (params.aspect_ratio && !payload.image_size) payload.image_size = params.aspect_ratio;

    return submitAndPoll(modelId, payload, apiKey, params.onRequestId, params.onStatusUpdate, 60);
}

export async function generateI2I(apiKey, params) {
    const modelInfo = getI2IModelById(params.model);
    const modelId = modelInfo?.endpoint || params.model;
    const payload = { ...params };
    delete payload.model;
    delete payload.onRequestId;
    delete payload.onStatusUpdate;

    if (params.image_url && !payload.image) payload.image = params.image_url;

    return submitAndPoll(modelId, payload, apiKey, params.onRequestId, params.onStatusUpdate, 60);
}

export async function generateVideo(apiKey, params) {
    const modelInfo = getVideoModelById(params.model);
    const modelId = modelInfo?.endpoint || params.model;
    const payload = { ...params };
    delete payload.model;
    delete payload.onRequestId;
    delete payload.onStatusUpdate;

    return submitAndPoll(modelId, payload, apiKey, params.onRequestId, params.onStatusUpdate, 900);
}

export async function generateI2V(apiKey, params) {
    const modelInfo = getI2VModelById(params.model);
    const modelId = modelInfo?.endpoint || params.model;
    const payload = { ...params };
    delete payload.model;
    delete payload.onRequestId;
    delete payload.onStatusUpdate;

    return submitAndPoll(modelId, payload, apiKey, params.onRequestId, params.onStatusUpdate, 900);
}

export async function processLipSync(apiKey, params) {
    const modelInfo = getLipSyncModelById(params.model);
    const modelId = modelInfo?.endpoint || params.model;
    const payload = { ...params };
    delete payload.model;
    delete payload.onRequestId;
    delete payload.onStatusUpdate;

    return submitAndPoll(modelId, payload, apiKey, params.onRequestId, params.onStatusUpdate, 900);
}

export function uploadFile(apiKey, file, onProgress) {
    return new Promise((resolve, reject) => {
        const url = `${REST_URL}/storage/upload`;
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader('Authorization', `Key ${apiKey}`);

        if (onProgress) {
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    onProgress(percentComplete);
                }
            };
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    const fileUrl = data.url || data.file_url;
                    if (!fileUrl) {
                        reject(new Error('No URL returned from file upload'));
                    } else {
                        resolve(fileUrl);
                    }
                } catch (e) {
                    reject(new Error('Failed to parse upload response'));
                }
            } else {
                let detail = xhr.statusText;
                try {
                    const errObj = JSON.parse(xhr.responseText);
                    detail = errObj.detail || detail;
                } catch (e) {
                    // fallback
                }
                reject(new Error(`File upload failed: ${xhr.status} - ${detail}`));
            }
        };

        xhr.onerror = () => reject(new Error('Network error during file upload'));
        xhr.send(formData);
    });
}

export async function getFalBalance(apiKey) {
    const response = await fetch(`https://api.fal.ai/v1/account/billing?expand=credits`, {
        headers: {
            'Authorization': `Key ${apiKey}`
        }
    });
    if (!response.ok) {
        let detail = '';
        try {
            const errData = await response.json();
            detail = errData.error?.message || errData.detail || errData.message || '';
        } catch (e) {}
        
        if (response.status === 401 || response.status === 403) {
            if (detail.includes('ADMIN keys')) {
                throw new Error('fal balance requires an ADMIN key. Create one at fal.ai/dashboard/keys');
            }
            throw new Error(`Invalid fal API key or insufficient permissions: ${detail}`);
        }
        throw new Error(`Failed to fetch fal balance (${response.status}): ${detail}`);
    }
    const data = await response.json();
    return {
        balance: data.credits?.current_balance ?? 0,
        currency: data.credits?.currency ?? 'USD'
    };
}
