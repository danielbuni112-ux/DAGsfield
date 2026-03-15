import { navigate } from '../lib/router.js';

const TEXT_TO_IMAGE_MODELS = [
  { name: 'Flux Dev', description: 'High-quality text-to-image generation', category: 'Flux' },
  { name: 'Flux Schnell', description: 'Fast text-to-image generation', category: 'Flux' },
  { name: 'Flux 2 Dev', description: 'Advanced Flux 2 development model', category: 'Flux' },
  { name: 'Flux 2 Flex', description: 'Flexible Flux 2 model', category: 'Flux' },
  { name: 'Flux 2 Pro', description: 'Professional Flux 2 model', category: 'Flux' },
  { name: 'Nano Banana', description: 'Efficient image generation', category: 'Nano' },
  { name: 'Nano Banana Pro', description: 'Pro-level Nano Banana', category: 'Nano' },
  { name: 'Nano Banana 2', description: 'Next-gen Nano Banana', category: 'Nano' },
  { name: 'Seedream 5.0', description: 'Dream-like image generation', category: 'Seedream' },
  { name: 'Bytedance Seedream v3', description: 'Bytedance Seedream v3', category: 'Seedream' },
  { name: 'Bytedance Seedream v4', description: 'Bytedance Seedream v4', category: 'Seedream' },
  { name: 'Bytedance Seedream v4.5', description: 'Bytedance Seedream v4.5', category: 'Seedream' },
  { name: 'Midjourney v7', description: 'Midjourney v7 image generation', category: 'Midjourney' },
  { name: 'GPT-4o', description: 'OpenAI GPT-4o image model', category: 'OpenAI' },
  { name: 'GPT Image 1.5', description: 'OpenAI GPT Image 1.5', category: 'OpenAI' },
  { name: 'Ideogram v3', description: 'Ideogram v3 text-to-image', category: 'Ideogram' },
  { name: 'Google Imagen4', description: 'Google Imagen 4', category: 'Google' },
  { name: 'SDXL', description: 'Stable Diffusion XL', category: 'SD' },
  { name: 'Wan 2.1', description: 'Wan 2.1 text-to-image', category: 'Wan' },
  { name: 'Wan 2.5', description: 'Wan 2.5 text-to-image', category: 'Wan' },
  { name: 'Wan 2.6', description: 'Wan 2.6 text-to-image', category: 'Wan' },
  { name: 'Hunyuan Image 2.1', description: 'Tencent Hunyuan Image 2.1', category: 'Hunyuan' },
  { name: 'Hunyuan Image 3.0', description: 'Tencent Hunyuan Image 3.0', category: 'Hunyuan' },
  { name: 'Kling O1', description: 'Kling O1 image generation', category: 'Kling' },
  { name: 'Qwen Image', description: 'Alibaba Qwen Image', category: 'Qwen' },
  { name: 'Sora', description: 'OpenAI Sora image model', category: 'OpenAI' },
  { name: 'Veo 3', description: 'Google Veo 3', category: 'Google' },
];

const EXAMPLE_PROMPTS = [
  { prompt: 'A futuristic cityscape at sunset with flying cars and neon lights, cinematic lighting, photorealistic', model: 'Flux Dev' },
  { prompt: 'Portrait of a warrior queen with elaborate golden armor, dramatic lighting, epic fantasy style', model: 'Nano Banana Pro' },
  { prompt: 'Steampunk mechanical owl with brass gears and glowing eyes, intricate details, vintage illustration', model: 'SDXL' },
  { prompt: 'Underwater alien civilization with bioluminescent architecture, crystal clear water, surreal', model: 'Midjourney v7' },
  { prompt: 'Minimalist product shot of a luxury watch on marble, professional photography, studio lighting', model: 'GPT Image 1.5' },
];

export function TextToImagePage() {
  const container = document.createElement('div');
  container.className = 'w-full h-full overflow-y-auto bg-app-bg';

  const inner = document.createElement('div');
  inner.className = 'max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12';

  inner.innerHTML = `
    <div class="mb-10 animate-fade-in-up">
      <div class="flex items-center gap-3 mb-4">
        <span class="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">AI Image Generation</span>
        <span class="text-muted text-xs">50+ Models Available</span>
      </div>
      <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">Text to Image</h1>
      <p class="text-secondary text-sm md:text-base max-w-xl">Transform your ideas into stunning images with our powerful text-to-image models</p>
      <button class="mt-6 px-6 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-colors start-btn">
        Start Creating
      </button>
    </div>
  `;

  inner.querySelector('.start-btn').onclick = () => navigate('image');

  const modelsSection = document.createElement('div');
  modelsSection.className = 'mb-12 animate-fade-in-up';
  modelsSection.style.animationDelay = '0.1s';
  modelsSection.innerHTML = '<h2 class="text-lg font-bold text-white mb-4">Available Models</h2>';

  const categories = {};
  TEXT_TO_IMAGE_MODELS.forEach(model => {
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
        navigate('image');
      };
      grid.appendChild(card);
    });

    modelsSection.appendChild(grid);
  });

  inner.appendChild(modelsSection);

  const promptsSection = document.createElement('div');
  promptsSection.className = 'mb-12 animate-fade-in-up';
  promptsSection.style.animationDelay = '0.2s';
  promptsSection.innerHTML = '<h2 class="text-lg font-bold text-white mb-4">Example Prompts</h2>';

  const promptsGrid = document.createElement('div');
  promptsGrid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3';

  EXAMPLE_PROMPTS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:bg-white/[0.06] hover:border-white/10 transition-all group';
    card.innerHTML = `
      <div class="text-xs text-muted mb-2">${p.model}</div>
      <div class="text-sm text-white leading-relaxed mb-3">${p.prompt}</div>
      <button class="text-xs font-bold text-primary hover:underline try-btn">Try this prompt</button>
    `;
    card.querySelector('.try-btn').onclick = () => {
      localStorage.setItem('prefill_prompt', p.prompt);
      localStorage.setItem('prefill_model', p.model);
      navigate('image');
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
      <h3 class="text-xl font-bold text-white mb-2">Ready to create?</h3>
      <p class="text-secondary mb-6">Start generating amazing images with our AI models</p>
      <button class="px-8 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-colors">
        Open Image Studio
      </button>
    </div>
  `;
  ctaSection.querySelector('button').onclick = () => navigate('image');
  inner.appendChild(ctaSection);

  container.appendChild(inner);
  return container;
}
