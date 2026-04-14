import * as muapi from './muapi.js';
import * as fal from './fal.js';
import { 
  getModelById, 
  getVideoModelById, 
  getI2IModelById, 
  getI2VModelById, 
  getLipSyncModelById 
} from './models.js';

/**
 * Mapping for Flux Fill model on fal.ai
 */
const mapFluxFillInput = (inputs) => ({
  prompt: inputs.prompt,
  image_url: inputs.image_url,
  mask_url: inputs.mask_url,
  image_size: inputs.image_size || "square_hd",
  seed: inputs.seed,
  enable_safety_checker: true
});

/**
 * Mapping for Flux Kontext model on fal.ai
 */
const mapFluxKontextInput = (inputs) => ({
  prompt: inputs.prompt,
  image_url: inputs.image_url, // Optional for T2I, Required for I2I
  seed: inputs.seed,
  aspect_ratio: inputs.aspect_ratio || "1:1"
});

const mapAspectRatioToFalImageSize = (aspectRatio) => {
  const sizeMap = {
    "1:1": "square_hd",
    "16:9": "landscape_16_9",
    "9:16": "portrait_16_9",
    "4:3": "landscape_4_3",
    "3:4": "portrait_4_5",
    "4:5": "portrait_4_5",
    "3:2": "landscape_4_3",
    "21:9": "landscape_16_9",
  };

  return sizeMap[aspectRatio] || aspectRatio || "landscape_4_3";
};

/**
 * Mapping for FLUX.1 [dev] with LoRAs on fal.ai
 */
const mapFluxLoraInput = (inputs) => {
  const mapped = {
    prompt: inputs.prompt,
    seed: inputs.seed,
    num_images: inputs.num_images,
    image_size: inputs.image_size || mapAspectRatioToFalImageSize(inputs.aspect_ratio),
  };

  if (Array.isArray(inputs.loras) && inputs.loras.length > 0) {
    mapped.loras = inputs.loras;
  } else if (typeof inputs.loraPath === "string" && inputs.loraPath.trim()) {
    const numericScale = Number(inputs.loraScale);
    mapped.loras = [
      {
        path: inputs.loraPath.trim(),
        scale: Number.isFinite(numericScale) ? numericScale : 1,
      },
    ];
  }

  return mapped;
};

/**
 * Unified client for AI generation across different providers.
 * Implements the Adapter Pattern to route requests and standardize outputs.
 */
export async function generate(params, config = {}) {
  const { 
    provider, 
    model, 
    onStatusUpdate, 
    onRequestId,
    ...rest 
  } = params;
  
  const apiKey = config.apiKey || params.apiKey;

  if (!provider) {
    throw new Error('Provider is required (muapi or fal)');
  }

  if (!apiKey) {
    throw new Error(`API Key for ${provider} is required`);
  }

  // 1. Select the appropriate adapter
  const adapter = provider === 'fal' ? fal : muapi;

  // 2. Identify the generation method based on model type
  let method = 'generateImage';
  if (getI2IModelById(model)) {
    method = 'generateI2I';
  } else if (getVideoModelById(model)) {
    method = 'generateVideo';
  } else if (getI2VModelById(model)) {
    method = 'generateI2V';
  } else if (getLipSyncModelById(model)) {
    method = 'processLipSync';
  }

  // 3. Standardize parameters for the provider
  let generationParams = {
    model,
    onRequestId,
    onStatusUpdate, // Pass through if adapter supports it
    ...rest
  };

  // Provider-specific parameter mapping
  if (provider === 'fal') {
    if (model === 'fal-ai/flux-pro/v1/fill') {
      generationParams = { 
        ...generationParams, 
        ...mapFluxFillInput(rest) 
      };
    } else if (model === 'fal-ai/flux-lora') {
      generationParams = {
        ...generationParams,
        ...mapFluxLoraInput(rest),
      };
    } else if (model === 'fal-ai/flux-pro/kontext') {
      generationParams = { 
        ...generationParams, 
        ...mapFluxKontextInput(rest) 
      };
    } else if (generationParams.aspect_ratio && !generationParams.image_size) {
      generationParams.image_size = mapAspectRatioToFalImageSize(generationParams.aspect_ratio);
    }
  }

  try {
    if (onStatusUpdate) {
      onStatusUpdate({ status: 'starting', message: 'Initializing generation...' });
    }

    // 4. Execute generation through the adapter
    const result = await adapter[method](apiKey, generationParams);

    if (onStatusUpdate) {
      onStatusUpdate({ status: 'completed', message: 'Generation complete!' });
    }

    // 5. Return standardized result object
    return {
      url: result.url,
      provider,
      id: result.request_id || result.id,
      metadata: result,
    };
  } catch (error) {
    if (onStatusUpdate) {
      onStatusUpdate({ status: 'error', message: error.message });
    }
    throw error;
  }
}

/**
 * Standardized file upload across providers.
 */
export async function uploadFile(provider, apiKey, file, onProgress) {
  if (provider !== 'fal' && provider !== 'muapi') {
    throw new Error("uploadFile requires 'fal' or 'muapi' as the first argument");
  }
  if (!apiKey) {
    throw new Error(`API Key for ${provider} is required`);
  }
  const adapter = provider === 'fal' ? fal : muapi;
  return adapter.uploadFile(apiKey, file, onProgress);
}

/**
 * Standardized balance check.
 */
export async function getBalance(provider, apiKey) {
  if (provider === 'fal') {
    return fal.getFalBalance(apiKey);
  }
  return muapi.getUserBalance(apiKey);
}
