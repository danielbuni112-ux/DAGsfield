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
// aspectMode: how this endpoint accepts aspect control
//   'native'     — pass params.aspect_ratio directly as "21:9", "16:9", etc.
//   'image_size' — map to fal preset (landscape_16_9, portrait_4_3, ...)
//   'flux_ultra' — pass aspect_ratio but only from a limited preset set
export const IMAGE_MODELS = {
  'nano-banana': {
    fal_endpoint: 'fal-ai/nano-banana',
    label: 'Nano Banana (Google)',
    default_size: 'square_hd',
    aspectMode: 'image_size',
  },
  'nano-banana-pro': {
    fal_endpoint: 'fal-ai/nano-banana-pro',
    label: 'Nano Banana Pro',
    default_size: 'landscape_16_9',
    // Google Imagen-style endpoint. Accepts aspect_ratio natively for all
    // 10 presets: 1:1, 3:4, 4:3, 9:16, 16:9, 3:2, 2:3, 4:5, 5:4, 21:9.
    aspectMode: 'native',
  },
  'flux-dev': {
    fal_endpoint: 'fal-ai/flux/dev',
    label: 'Flux Dev',
    default_size: 'landscape_4_3',
    aspectMode: 'image_size',
  },
  'flux-schnell': {
    fal_endpoint: 'fal-ai/flux/schnell',
    label: 'Flux Schnell (fast)',
    default_size: 'square_hd',
    aspectMode: 'image_size',
  },
  'flux-pro': {
    fal_endpoint: 'fal-ai/flux-pro/v1.1',
    label: 'Flux Pro v1.1',
    default_size: 'landscape_4_3',
    aspectMode: 'image_size',
  },
  'flux-pro-ultra': {
    fal_endpoint: 'fal-ai/flux-pro/v1.1-ultra',
    label: 'Flux Pro Ultra',
    default_size: 'landscape_16_9',
    // Flux Pro Ultra accepts aspect_ratio string directly.
    aspectMode: 'flux_ultra',
  },
  'sdxl': {
    fal_endpoint: 'fal-ai/fast-sdxl',
    label: 'Fast SDXL',
    default_size: 'square_hd',
    aspectMode: 'image_size',
  },
  'ideogram-v2': {
    fal_endpoint: 'fal-ai/ideogram/v2',
    label: 'Ideogram v2',
    default_size: 'square_hd',
    aspectMode: 'image_size',
  },
  'hidream-i1-fast': {
    fal_endpoint: 'fal-ai/hidream-i1-fast',
    label: 'HiDream I1 Fast',
    default_size: 'square_hd',
    aspectMode: 'image_size',
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

// Convert UI aspect_ratio into fal's image_size preset string OR a custom
// {width, height} object for ratios without a matching fal preset.
//
// fal supports these presets natively (verified from fal schema):
//   square_hd, square, portrait_4_3, portrait_16_9, landscape_4_3, landscape_16_9
//
// For 3:2, 2:3, 5:4, 4:5, 21:9 (and any future ratio) there is no preset,
// so we fall back to a custom {width, height}. Most fal image endpoints
// accept this object form (flux/*, fast-sdxl, ideogram, hidream).
//
// NOTE: Nano Banana Pro is special — it ignores image_size entirely and
// uses its own `aspect_ratio` string param. Use aspectMode: 'native' on that
// model and pass aspect_ratio directly from muapi.js (not through this fn).
export function aspectToImageSize(aspect, resolution = null) {
  const preset = {
    '1:1':  'square_hd',
    '16:9': 'landscape_16_9',
    '9:16': 'portrait_16_9',
    '4:3':  'landscape_4_3',
    '3:4':  'portrait_4_3',
  };
  if (preset[aspect]) return preset[aspect];

  // Base dimensions by requested resolution
  // (1K ≈ 1024px long side, 2K ≈ 2048, 4K ≈ 3840).
  const longSide = (() => {
    const r = String(resolution || '').toLowerCase();
    if (r === '4k' || r === '4K') return 3840;
    if (r === '2k' || r === '2K') return 2048;
    return 1024;
  })();

  const parsed = parseRatio(aspect);
  if (!parsed) return 'square_hd';

  const { w, h } = parsed;
  // Place longer side at longSide, round to multiples of 32 (safe for diffusion models).
  const scale = longSide / Math.max(w, h);
  const roundTo = (n) => Math.max(256, Math.round(n * scale / 32) * 32);
  return { width: roundTo(w), height: roundTo(h) };
}

// Parse "21:9" → { w: 21, h: 9 }. Returns null on bad input.
function parseRatio(str) {
  if (!str || typeof str !== 'string') return null;
  const m = str.match(/^(\d+)\s*:\s*(\d+)$/);
  if (!m) return null;
  const w = Number(m[1]);
  const h = Number(m[2]);
  if (!w || !h) return null;
  return { w, h };
}

// List of aspect ratios natively supported by Nano Banana Pro (Google Imagen).
const NANO_BANANA_PRO_RATIOS = new Set([
  '1:1', '3:4', '4:3', '9:16', '16:9',
  '3:2', '2:3', '4:5', '5:4', '21:9', '9:21',
]);

// Flux Pro Ultra accepts a limited set of aspect_ratio strings.
const FLUX_ULTRA_RATIOS = new Set([
  '21:9', '16:9', '4:3', '3:2', '1:1', '2:3', '3:4', '9:16', '9:21',
]);

// Pick the nearest supported aspect_ratio string for a given model.
// Used when the endpoint has a `native` aspectMode.
export function nativeAspectRatio(modelId, aspect) {
  if (!aspect) return null;
  const model = IMAGE_MODELS[modelId];
  if (!model) return aspect;

  if (model.aspectMode === 'native' && modelId.startsWith('nano-banana-pro')) {
    return NANO_BANANA_PRO_RATIOS.has(aspect) ? aspect : closestRatio(aspect, NANO_BANANA_PRO_RATIOS);
  }
  if (model.aspectMode === 'flux_ultra') {
    return FLUX_ULTRA_RATIOS.has(aspect) ? aspect : closestRatio(aspect, FLUX_ULTRA_RATIOS);
  }
  return aspect;
}

// Find the supported ratio closest (by numeric value) to the requested one.
function closestRatio(aspect, supportedSet) {
  const target = parseRatio(aspect);
  if (!target) return [...supportedSet][0];
  const targetVal = target.w / target.h;
  let best = null;
  let bestDiff = Infinity;
  for (const r of supportedSet) {
    const p = parseRatio(r);
    if (!p) continue;
    const diff = Math.abs(p.w / p.h - targetVal);
    if (diff < bestDiff) { bestDiff = diff; best = r; }
  }
  return best;
}
