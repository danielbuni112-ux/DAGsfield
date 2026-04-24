// fal.ai model registry — maps logical model IDs (from models.js) to fal endpoints.
// ─────────────────────────────────────────────────────────────────────────────
// This is the source of truth for which models work via fal.ai.
// Models NOT listed here will throw "Coming soon" when user tries to generate.
//
// Adding a new model:
//   1. Find fal endpoint at https://fal.ai/models
//   2. Add entry below with input format mapping
//   3. Rebuild + deploy
// ─────────────────────────────────────────────────────────────────────────────

// ─── Image generation (text-to-image) ───────────────────────────────────────
export const IMAGE_MODELS = {
  'nano-banana': {
    fal_endpoint: 'fal-ai/nano-banana',
    label: 'Nano Banana (Google)',
    default_size: 'square_hd',
  },
  'nano-banana-pro': {
    fal_endpoint: 'fal-ai/nano-banana-pro',
    label: 'Nano Banana Pro',
    default_size: 'landscape_16_9',
  },
  'flux-dev': {
    fal_endpoint: 'fal-ai/flux/dev',
    label: 'Flux Dev',
    default_size: 'landscape_4_3',
  },
  'flux-schnell': {
    fal_endpoint: 'fal-ai/flux/schnell',
    label: 'Flux Schnell (fast)',
    default_size: 'square_hd',
  },
  'flux-pro': {
    fal_endpoint: 'fal-ai/flux-pro/v1.1',
    label: 'Flux Pro v1.1',
    default_size: 'landscape_4_3',
  },
  'flux-pro-ultra': {
    fal_endpoint: 'fal-ai/flux-pro/v1.1-ultra',
    label: 'Flux Pro Ultra',
    default_size: 'landscape_16_9',
  },
  'sdxl': {
    fal_endpoint: 'fal-ai/fast-sdxl',
    label: 'Fast SDXL',
    default_size: 'square_hd',
  },
  'ideogram-v2': {
    fal_endpoint: 'fal-ai/ideogram/v2',
    label: 'Ideogram v2',
    default_size: 'square_hd',
  },
  'hidream-i1-fast': {
    fal_endpoint: 'fal-ai/hidream-i1-fast',
    label: 'HiDream I1 Fast',
    default_size: 'square_hd',
  },
};

// ─── Image-to-Image ─────────────────────────────────────────────────────────
export const I2I_MODELS = {
  'flux-kontext': {
    fal_endpoint: 'fal-ai/flux-kontext/dev',
    label: 'Flux Kontext',
    imageField: 'image_url',
  },
  'nano-banana-edit': {
    fal_endpoint: 'fal-ai/nano-banana/edit',
    label: 'Nano Banana Edit',
    imageField: 'image_urls',
  },
  'flux-dev-i2i': {
    fal_endpoint: 'fal-ai/flux/dev/image-to-image',
    label: 'Flux Dev I2I',
    imageField: 'image_url',
  },
};

// ─── Text-to-Video ──────────────────────────────────────────────────────────
export const VIDEO_MODELS = {
  'kling-v2': {
    fal_endpoint: 'fal-ai/kling-video/v2/master/text-to-video',
    label: 'Kling v2 Master',
    supports_duration: true,
  },
  'kling-v2-pro': {
    fal_endpoint: 'fal-ai/kling-video/v2.1/master/text-to-video',
    label: 'Kling v2.1 Master',
    supports_duration: true,
  },
  'hailuo-02': {
    fal_endpoint: 'fal-ai/minimax/hailuo-02/standard/text-to-video',
    label: 'Hailuo 02 Standard',
    supports_duration: false,
  },
  'hailuo-02-pro': {
    fal_endpoint: 'fal-ai/minimax/hailuo-02/pro/text-to-video',
    label: 'Hailuo 02 Pro (1080p)',
    supports_duration: false,
  },
  'seedance-v1-pro': {
    fal_endpoint: 'fal-ai/bytedance/seedance/v1/pro/text-to-video',
    label: 'Seedance v1 Pro',
    supports_duration: true,
  },
};

// ─── Image-to-Video ─────────────────────────────────────────────────────────
export const I2V_MODELS = {
  'kling-v2-i2v': {
    fal_endpoint: 'fal-ai/kling-video/v2/master/image-to-video',
    label: 'Kling v2 I2V',
    imageField: 'image_url',
  },
  'hailuo-02-i2v': {
    fal_endpoint: 'fal-ai/minimax/hailuo-02/standard/image-to-video',
    label: 'Hailuo 02 I2V',
    imageField: 'image_url',
  },
  'hailuo-02-pro-i2v': {
    fal_endpoint: 'fal-ai/minimax/hailuo-02/pro/image-to-video',
    label: 'Hailuo 02 Pro I2V (1080p)',
    imageField: 'image_url',
  },
  'seedance-v1-pro-i2v': {
    fal_endpoint: 'fal-ai/bytedance/seedance/v1/pro/image-to-video',
    label: 'Seedance v1 Pro I2V',
    imageField: 'image_url',
  },
};

// ─── Lip Sync ───────────────────────────────────────────────────────────────
export const LIPSYNC_MODELS = {
  'sync-lipsync': {
    fal_endpoint: 'fal-ai/sync-lipsync',
    label: 'Sync LipSync',
  },
  'veed-lipsync': {
    fal_endpoint: 'fal-ai/veed/lipsync',
    label: 'Veed LipSync',
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────
// Lookup in any registry by model ID. Returns null if not found (→ Coming Soon).
export function getFalModel(modelId) {
  return (
    IMAGE_MODELS[modelId] ||
    I2I_MODELS[modelId] ||
    VIDEO_MODELS[modelId] ||
    I2V_MODELS[modelId] ||
    LIPSYNC_MODELS[modelId] ||
    null
  );
}

// If the given endpoint string already looks like a fal path (fal-ai/...),
// return it as-is. Otherwise try to resolve through our registry.
export function resolveFalEndpoint(modelIdOrEndpoint) {
  if (!modelIdOrEndpoint) return null;
  if (modelIdOrEndpoint.startsWith('fal-ai/')) return modelIdOrEndpoint;
  const model = getFalModel(modelIdOrEndpoint);
  return model?.fal_endpoint || null;
}

// Convert muapi aspect_ratio + resolution into fal's image_size parameter.
// For default/HD → returns preset string (e.g. "landscape_16_9").
// For 2K/4K      → returns custom object {width, height} so fal generates higher res.
//
// Note: not all fal models accept custom {width,height} for image_size. Pro models
// (Nano Banana Pro, Flux Pro Ultra, etc.) support it. Standard models cap at ~1.5MP.
export function aspectToImageSize(aspect, resolution = null) {
  const res = (resolution || '').toString().toLowerCase();

  // 4K — custom pixel dimensions
  if (res === '4k' || res === '2160p' || res === '3840') {
    const map4K = {
      '1:1':  { width: 2048, height: 2048 },
      '16:9': { width: 3840, height: 2160 },
      '9:16': { width: 2160, height: 3840 },
      '4:3':  { width: 2880, height: 2160 },
      '3:4':  { width: 2160, height: 2880 },
      '21:9': { width: 3840, height: 1644 },
    };
    if (map4K[aspect]) return map4K[aspect];
  }

  // 2K / 1080p — custom pixel dimensions
  if (res === '2k' || res === '1080p' || res === '1920') {
    const map2K = {
      '1:1':  { width: 1920, height: 1920 },
      '16:9': { width: 1920, height: 1080 },
      '9:16': { width: 1080, height: 1920 },
      '4:3':  { width: 1440, height: 1080 },
      '3:4':  { width: 1080, height: 1440 },
      '21:9': { width: 1920, height: 822 },
    };
    if (map2K[aspect]) return map2K[aspect];
  }

  // Default / HD — fal preset string
  const map = {
    '1:1':  'square_hd',
    '16:9': 'landscape_16_9',
    '9:16': 'portrait_16_9',
    '4:3':  'landscape_4_3',
    '3:4':  'portrait_4_3',
    '21:9': 'landscape_16_9',
  };
  return map[aspect] || 'square_hd';
}
