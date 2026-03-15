import { navigate } from '../lib/router.js';

const IMAGE_TO_VIDEO_MODELS = [
  { name: 'Kling I2V', description: 'Kling image-to-video', category: 'Kling' },
  { name: 'Kling I2V 1.2', description: 'Kling I2V 1.2', category: 'Kling' },
  { name: 'Kling I2V 1.5', description: 'Kling I2V 1.5', category: 'Kling' },
  { name: 'Kling I2V 1.6', description: 'Kling I2V 1.6', category: 'Kling' },
  { name: 'Kling I2V 2.0', description: 'Kling I2V 2.0', category: 'Kling' },
  { name: 'Veo3 I2V', description: 'Google Veo3 image-to-video', category: 'Google' },
  { name: 'Runway I2V', description: 'Runway image-to-video', category: 'Runway' },
  { name: 'Wan I2V', description: 'Wan image-to-video', category: 'Wan' },
  { name: 'Midjourney v7 I2V', description: 'Midjourney v7 image-to-video', category: 'Midjourney' },
  { name: 'Hunyuan I2V', description: 'Tencent Hunyuan image-to-video', category: 'Hunyuan' },
  { name: 'Seedance I2V', description: 'Seedance image-to-video', category: 'Seedance' },
  { name: 'Pixverse I2V', description: 'Pixverse image-to-video', category: 'Pixverse' },
  { name: 'Vidu Q1 Reference', description: 'Vidu Q1 reference', category: 'Vidu' },
  { name: 'Vidu Q2 Reference', description: 'Vidu Q2 reference', category: 'Vidu' },
  { name: 'Hailuo I2V', description: 'Hailuo image-to-video', category: 'Hailuo' },
  { name: 'Sora 2 I2V', description: 'Sora 2 image-to-video', category: 'OpenAI' },
  { name: 'OVI I2V', description: 'OVI image-to-video', category: 'OVI' },
  { name: 'LTX 2 I2V', description: 'LTX 2 image-to-video', category: 'LTX' },
  { name: 'Leonardoai Motion 2.0', description: 'Leonardoai Motion 2.0', category: 'Leonardo' },
];

const EXAMPLE_PROMPTS = [
  { prompt: 'Animate this image with a smooth camera pan left', model: 'Kling I2V' },
  { prompt: 'Add subtle movement to the subject, gentle breathing animation', model: 'Runway I2V' },
  { prompt: 'Create a dynamic zoom out effect', model: 'Veo3 I2V' },
  { prompt: 'Add rain and reflections on surfaces', model: 'Hunyuan I2V' },
  { prompt: 'Animate with floating particles and magical glow', model: 'Seedance I2V' },
];

export function ImageToVideoPage() {
  const container = document.createElement('div');
  container.className = 'w-full h-full overflow-y-auto bg-app-bg';

  const inner = document.createElement('div');
  inner.className = 'max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12';

  inner.innerHTML = `
    <div class="mb-10 animate-fade-in-up">
      <div class="flex items-center gap-3 mb-4">
        <span class="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">AI Video Generation</span>
        <span class="text-muted text-xs">60+ Models Available</span>
      </div>
      <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">Image to Video</h1>
      <p class="text-secondary text-sm md:text-base max-w-xl">Bring your images to life with AI-powered video generation</p>
      <button class="mt-6 px-6 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-colors start-btn">
        Start Creating
      </button>
    </div>
  `;

  inner.querySelector('.start-btn').onclick = () => navigate('video');

  const modelsSection = document.createElement('div');
  modelsSection.className = 'mb-12 animate-fade-in-up';
  modelsSection.style.animationDelay = '0.1s';
  modelsSection.innerHTML = '<h2 class="text-lg font-bold text-white mb-4">Available Models</h2>';

  const categories = {};
  IMAGE_TO_VIDEO_MODELS.forEach(model => {
    if (!categories[model.category]) categories[model.category] = [];
    categories[model.category].push(model);
  });

  Object.entries(categories).forEach(([category, models]) => {
    const catHeader = document.createElement('div');
    catHeader.className = 'text-sm font-bold text-muted mb-3 mt-6';
    catHeader.textContent = category;
    modelsSection.appendChild(catHeader);

    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3';

    models.forEach(model => {
      const card = document.createElement('div');
      card.className = 'bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:bg-white/[0.06] hover:border-white/10 transition-all group cursor-pointer';
      card.innerHTML = `
        <div class="text-sm font-bold text-white group-hover:text-primary transition-colors">${model.name}</div>
        <div class="text-xs text-muted mt-1">${model.description}</div>
      `;
      card.onclick = () => {
        localStorage.setItem('prefill_model', model.name);
        navigate('video');
      };
      grid.appendChild(card);
    });

    modelsSection.appendChild(grid);
  });

  inner.appendChild(modelsSection);

  const promptsSection = document.createElement('div');
  promptsSection.className = 'mb-12 animate-fade-in-up';
  promptsSection.style.animationDelay = '0.2s';
  promptsSection.innerHTML = '<h2 class="text-lg font-bold text-white mb-4">Example Animations</h2>';

  const promptsGrid = document.createElement('div');
  promptsGrid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3';

  EXAMPLE_PROMPTS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:bg-white/[0.06] hover:border-white/10 transition-all group';
    card.innerHTML = `
      <div class="text-xs text-muted mb-2">${p.model}</div>
      <div class="text-sm text-white leading-relaxed mb-3">${p.prompt}</div>
      <button class="text-xs font-bold text-primary hover:underline try-btn">Try this</button>
    `;
    card.querySelector('.try-btn').onclick = () => {
      localStorage.setItem('prefill_prompt', p.prompt);
      localStorage.setItem('prefill_model', p.model);
      navigate('video');
    };
    promptsGrid.appendChild(card);
  });

  promptsSection.appendChild(promptsGrid);
  inner.appendChild(promptsSection);

  const ctaSection = document.createElement('div');
  ctaSection.className = 'animate-fade-in-up';
  ctaSection.style.animationDelay = '0.3s';
  ctaSection.innerHTML = `
    <div class="bg-gradient-to-r from-primary/20 to-purple-500/20 border border-white/10 rounded-2xl p-8 text-center">
      <h3 class="text-xl font-bold text-white mb-2">Ready to animate?</h3>
      <p class="text-secondary mb-6">Transform your images into videos</p>
      <button class="px-8 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-colors">
        Open Video Studio
      </button>
    </div>
  `;
  ctaSection.querySelector('button').onclick = () => navigate('video');
  inner.appendChild(ctaSection);

  container.appendChild(inner);
  return container;
}
