import { t2iModels, t2vModels, i2iModels, i2vModels, lipsyncModels, v2vModels } from '../models.js';

describe('Model Registry', () => {
  test('should contain at least 150 fal.ai models', () => {
    const allModels = [
      ...t2iModels,
      ...t2vModels,
      ...i2iModels,
      ...i2vModels,
      ...v2vModels,
      ...lipsyncModels,
    ];
    
    const falModels = allModels.filter(m => m.provider === 'fal');
    expect(falModels.length).toBeGreaterThanOrEqual(150);
  });

  test('fal-ai/flux-pro/v1/fill should have correct inputs', () => {
    const fillModel = i2iModels.find(m => m.id === 'fal-ai/flux-pro/v1/fill');
    expect(fillModel).toBeDefined();
    expect(fillModel.provider).toBe('fal');
    expect(fillModel.inputs.image_url).toBeDefined();
    expect(fillModel.inputs.mask_url).toBeDefined();
  });

  test('fal-ai/flux-pro/kontext should have correct inputs', () => {
    const kontextModel = i2iModels.find(m => m.id === 'fal-ai/flux-pro/kontext');
    expect(kontextModel).toBeDefined();
    expect(kontextModel.provider).toBe('fal');
    expect(kontextModel.inputs.prompt).toBeDefined();
  });
});
