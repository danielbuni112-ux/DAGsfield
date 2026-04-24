// ─────────────────────────────────────────────────────────────────────────────
// fal.ai client (historically named muapi.js for backwards-compat with the
// rest of the codebase). All requests are routed through our server proxy at
// /api/fal/<fal-endpoint>, which injects FAL_KEY from env.
//
// Client function signatures preserved from the original muapi.js so that
// studio components (ImageStudio, VideoStudio, etc.) work without changes.
// The `apiKey` parameter is accepted but ignored — server handles auth.
//
// Features NOT supported in fal.ai (muapi-only):
//   - Workflow Builder  → stubs return empty arrays
//   - Agents system     → stubs return empty arrays
//   - getUserBalance    → returns null (fal doesn't expose this via API)
// UI shows "Coming Soon" banners on these tabs.
// ─────────────────────────────────────────────────────────────────────────────

import {
  getModelById,
  getVideoModelById,
  getI2IModelById,
  getI2VModelById,
  getV2VModelById,
  getLipSyncModelById,
} from './models.js';
import {
  resolveFalEndpoint,
  aspectToImageSize,
} from './fal-models.js';

const BASE_URL = '/api/fal';

// ─── Core helpers ────────────────────────────────────────────────────────────

// Throws a user-friendly "Coming Soon" error for models not yet mapped to fal.
function notSupported(modelId, kind = 'model') {
  const err = new Error(
    `Модель "${modelId}" пока не доступна через fal.ai. Coming soon!\n` +
    `Сейчас доступны: Nano Banana, Flux Dev/Pro/Schnell, SDXL, Ideogram, ` +
    `Kling, Hailuo, Seedance, Sync LipSync.`
  );
  err.code = 'MODEL_NOT_SUPPORTED';
  err.kind = kind;
  return err;
}

// Main request function. Server uses fal.subscribe which polls internally,
// so one HTTP request from the client = one final result (no client-side polling).
async function requestFal(endpoint, input, onRequestId) {
  const url = `${BASE_URL}/${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    let errText = '';
    try {
      const errJson = await response.json();
      errText = errJson?.error || JSON.stringify(errJson);
    } catch {
      errText = await response.text();
    }
    throw new Error(`API ${response.status}: ${errText.slice(0, 300)}`);
  }

  const body = await response.json();
  // fal proxy returns { data: {...}, requestId: null }
  const data = body?.data || body;
  if (onRequestId && body?.requestId) onRequestId(body.requestId);
  return data;
}

// Normalize fal response to have { url, outputs } for legacy UI components.
function normalizeResult(falResult) {
  const imageUrl = falResult?.images?.[0]?.url || falResult?.image?.url;
  const videoUrl = falResult?.video?.url || falResult?.video_url;
  const audioUrl = falResult?.audio?.url || falResult?.audio_url;
  const primary = imageUrl || videoUrl || audioUrl || falResult?.url;

  return {
    ...falResult,
    url: primary,
    outputs: [primary],
  };
}

// ─── Image generation ────────────────────────────────────────────────────────

export async function generateImage(apiKey, params) {
  const modelInfo = getModelById(params.model);
  const endpoint = resolveFalEndpoint(params.model) || resolveFalEndpoint(modelInfo?.endpoint);
  if (!endpoint) throw notSupported(params.model, 'image');

  const input = { prompt: params.prompt };

  // image_size understands aspect_ratio + resolution together.
  // For 2K/4K it returns {width,height}, for default — a preset string.
  if (params.aspect_ratio) {
    input.image_size = aspectToImageSize(params.aspect_ratio, params.resolution);
  }
  // Some fal Pro models (e.g. Nano Banana Pro) also accept a separate
  // `resolution` param. Pass it through if provided — harmless for models
  // that ignore it.
  if (params.resolution) input.resolution = params.resolution;

  if (params.seed && params.seed !== -1) input.seed = params.seed;
  if (params.num_images) input.num_images = params.num_images;

  // Image reference for edit/i2i models that accept it alongside text prompt
  if (params.image_url) input.image_url = params.image_url;
  if (params.images_list?.length) input.image_urls = params.images_list;

  const result = await requestFal(endpoint, input, params.onRequestId);
  return normalizeResult(result);
}

// ─── Image-to-Image ──────────────────────────────────────────────────────────

export async function generateI2I(apiKey, params) {
  const modelInfo = getI2IModelById(params.model);
  const endpoint = resolveFalEndpoint(params.model) || resolveFalEndpoint(modelInfo?.endpoint);
  if (!endpoint) throw notSupported(params.model, 'i2i');

  const input = {};
  if (params.prompt) input.prompt = params.prompt;
  if (params.aspect_ratio) {
    input.image_size = aspectToImageSize(params.aspect_ratio, params.resolution);
  }
  if (params.resolution) input.resolution = params.resolution;
  if (params.seed && params.seed !== -1) input.seed = params.seed;

  const imagesList = params.images_list?.length > 0
    ? params.images_list
    : (params.image_url ? [params.image_url] : null);

  if (imagesList) {
    // Different fal models expect different fields; try generic ones
    input.image_url = imagesList[0];
    if (imagesList.length > 1) input.image_urls = imagesList;
  }

  const result = await requestFal(endpoint, input, params.onRequestId);
  return normalizeResult(result);
}

// ─── Video generation (text-to-video) ────────────────────────────────────────

export async function generateVideo(apiKey, params) {
  const modelInfo = getVideoModelById(params.model);
  const endpoint = resolveFalEndpoint(params.model) || resolveFalEndpoint(modelInfo?.endpoint);
  if (!endpoint) throw notSupported(params.model, 'video');

  const input = {};
  if (params.prompt) input.prompt = params.prompt;
  if (params.aspect_ratio) input.aspect_ratio = params.aspect_ratio;
  if (params.duration) input.duration = String(params.duration);
  if (params.resolution) input.resolution = params.resolution;
  if (params.image_url) input.image_url = params.image_url;

  const result = await requestFal(endpoint, input, params.onRequestId);
  return normalizeResult(result);
}

// ─── Image-to-Video ──────────────────────────────────────────────────────────

export async function generateI2V(apiKey, params) {
  const modelInfo = getI2VModelById(params.model);
  const endpoint = resolveFalEndpoint(params.model) || resolveFalEndpoint(modelInfo?.endpoint);
  if (!endpoint) throw notSupported(params.model, 'i2v');

  const input = {};
  if (params.prompt) input.prompt = params.prompt;
  if (params.image_url) input.image_url = params.image_url;
  if (params.aspect_ratio) input.aspect_ratio = params.aspect_ratio;
  if (params.duration) input.duration = String(params.duration);
  if (params.resolution) input.resolution = params.resolution;

  const result = await requestFal(endpoint, input, params.onRequestId);
  return normalizeResult(result);
}

// ─── Marketing Studio (advanced video with multiple refs) ────────────────────

export async function generateMarketingStudioAd(apiKey, params) {
  // Seedance v1 Pro supports multiple reference images
  const endpoint = 'fal-ai/bytedance/seedance/v1/pro/reference-to-video';
  const input = {
    prompt: params.prompt,
    aspect_ratio: params.aspect_ratio || '16:9',
    duration: String(params.duration || 5),
    reference_image_urls: params.images_list || [],
  };
  const result = await requestFal(endpoint, input, params.onRequestId);
  return normalizeResult(result);
}

// ─── Lip Sync ────────────────────────────────────────────────────────────────

export async function processLipSync(apiKey, params) {
  const modelInfo = getLipSyncModelById(params.model);
  const endpoint = resolveFalEndpoint(params.model) || resolveFalEndpoint(modelInfo?.endpoint) || 'fal-ai/sync-lipsync';

  const input = {};
  if (params.audio_url) input.audio_url = params.audio_url;
  if (params.video_url) input.video_url = params.video_url;
  if (params.image_url) input.image_url = params.image_url;
  if (params.prompt) input.prompt = params.prompt;
  if (params.seed !== undefined && params.seed !== -1) input.seed = params.seed;

  const result = await requestFal(endpoint, input, params.onRequestId);
  return normalizeResult(result);
}

// ─── File Upload ─────────────────────────────────────────────────────────────
// fal.ai provides file upload via their storage service. We proxy this
// through a dedicated server endpoint that uses fal.storage.upload().
// For now, fallback: send file as base64 or use a public image hosting.

export function uploadFile(apiKey, file, onProgress) {
  return new Promise(async (resolve, reject) => {
    try {
      // Upload via our server — server uses fal.storage.upload under the hood
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/fal-upload');

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const pct = Math.round((event.loaded / event.total) * 100);
            onProgress(pct);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            const url = data.url || data.file_url;
            if (!url) reject(new Error('No URL returned from upload'));
            else resolve(url);
          } catch (e) {
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      };
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(formData);
    } catch (err) {
      reject(err);
    }
  });
}

// ─── Balance / Account ───────────────────────────────────────────────────────
// fal.ai doesn't expose account balance via public API.
// Return null so UI shows "---" or a link to the fal dashboard.

export async function getUserBalance(apiKey) {
  try {
    const response = await fetch(`${BASE_URL}/balance`);
    if (!response.ok) return { balance: null };
    const data = await response.json();
    return { balance: data.balance };
  } catch {
    return { balance: null };
  }
}

export async function calculateDynamicCost(apiKey, taskName, payload) {
  // fal has per-model prices (not dynamic). Return a stub — UI that uses this
  // can treat null/undefined as "cost not available, proceed anyway".
  return { cost: null, currency: 'USD' };
}

// ─── Workflow Builder (muapi-only, stubs) ────────────────────────────────────

const workflowsNotSupported = 'Workflow Builder пока не поддерживается. Coming Soon!';

export async function getTemplateWorkflows() { return []; }
export async function getUserWorkflows() { return []; }
export async function getPublishedWorkflows() { return []; }
export async function getWorkflowInputs() { return null; }
export async function getAllNodeSchemas() { return []; }
export async function getWorkflowData() { return null; }
export async function getNodeSchemas() { return []; }
export async function getNodeStatus() { return { status: 'not_supported' }; }

export async function createWorkflow() { throw new Error(workflowsNotSupported); }
export async function updateWorkflowName() { throw new Error(workflowsNotSupported); }
export async function deleteWorkflow() { throw new Error(workflowsNotSupported); }
export async function executeWorkflow() { throw new Error(workflowsNotSupported); }
export async function runSingleNode() { throw new Error(workflowsNotSupported); }
export async function deleteNodeRun() { throw new Error(workflowsNotSupported); }

// ─── Agents (muapi-only, stubs) ──────────────────────────────────────────────

const agentsNotSupported = 'AI Agents пока не поддерживаются. Coming Soon!';

export async function getTemplateAgents() { return []; }
export async function getUserAgents() { return []; }
export async function getPublishedAgents() { return []; }
export async function getUserConversations() { return []; }

// ─── Server-side helpers (used by legacy proxy routes — kept for compat) ─────
// These are used by the old /api/muapi/* and /api/agents/* proxy routes which
// still exist in the repo. They are not reached in the fal.ai architecture,
// but we keep them to avoid import errors if something still calls them.

export async function handleProxyRequest() {
  throw new Error('muapi proxy disabled — migrated to fal.ai');
}

export async function handleServerSideProxy() {
  throw new Error('muapi proxy disabled — migrated to fal.ai');
}
