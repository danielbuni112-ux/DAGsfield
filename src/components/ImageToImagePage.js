import { navigate } from '../lib/router.js';

const IMAGE_TO_IMAGE_MODELS = [
  { name: 'Nano Banana Edit', description: 'Edit images with Nano Banana', category: 'Nano' },
  { name: 'Nano Banana Pro Edit', description: 'Pro-level image editing', category: 'Nano' },
  { name: 'Nano Banana 2 Edit', description: 'Next-gen image editing', category: 'Nano' },
  { name: 'Flux Kontext Dev I2I', description: 'Flux Kontext development I2I', category: 'Flux' },
  { name: 'Flux Kontext Pro I2I', description: 'Flux Kontext Pro I2I', category: 'Flux' },
  { name: 'Flux Kontext Max I2I', description: 'Flux Kontext Max I2I', category: 'Flux' },
  { name: 'Flux Redux', description: 'Flux Redux image transformation', category: 'Flux' },
  { name: 'Flux Pulid', description: 'Flux Pulid image editing', category: 'Flux' },
  { name: 'GPT-4o Edit', description: 'OpenAI GPT-4o image editing', category: 'OpenAI' },
  { name: 'GPT Image 1.5 Edit', description: 'OpenAI GPT Image 1.5 Edit', category: 'OpenAI' },
  { name: 'Midjourney v7 I2I', description: 'Midjourney v7 image-to-image', category: 'Midjourney' },
  { name: 'Seededit v3', description: 'Seededit v3 image editing', category: 'Seedream' },
  { name: 'Bytedance Seedream Edit', description: 'Bytedance Seedream editing', category: 'Seedream' },
  { name: 'Qwen Image Edit', description: 'Alibaba Qwen image editing', category: 'Qwen' },
  { name: 'Wan Image Edit', description: 'Wan image editing', category: 'Wan' },
  { name: 'Ideogram Character', description: 'Ideogram character creation', category: 'Ideogram' },
  { name: 'AI Background Remover', description: 'Remove backgrounds from images', category: 'AI Tools' },
  { name: 'AI Face Swap', description: 'Swap faces in images', category: 'AI Tools' },
  { name: 'AI Dress Change', description: 'Change clothing in images', category: 'AI Tools' },
  { name: 'AI Skin Enhancer', description: 'Enhance skin in portraits', category: 'AI Tools' },
  { name: 'AI Product Shot', description: 'Create professional product shots', category: 'AI Tools' },
];

const EXAMPLE_PROMPTS = [
  { prompt: 'Transform into a cyberpunk style with neon lights and futuristic elements', model: 'Flux Redux' },
  { prompt: 'Convert to watercolor painting style with soft colors', model: 'Nano Banana Edit' },
  { prompt: 'Make it look like a professional fashion magazine cover', model: 'GPT Image 1.5 Edit' },
  { prompt: 'Add dramatic sunset lighting and warm colors', model: 'Midjourney v7 I2I' },
  { prompt: 'Convert to black and white film noir style', model: 'Seededit v3' },
];

export function ImageToImagePage() {
  const container = document.createElement('div');
  container.className = 'w-full h-full overflow-y-auto bg-app-bg';

  const inner = document.createElement('div');
  inner.className = 'max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12';

  inner.innerHTML = `
    <div class="mb-10 animate-fade-in-up">
      <div class="flex items-center gap-3 mb-4">
        <span class="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">AI Image Editing</span>
        <span class="text-muted text-xs">55+ Models Available</span>
      </div>
      <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">Image to Image</h1>
      <p class="text-secondary text-sm md:text-base max-w-xl">Transform and edit your images with powerful AI models</p>
      <button class="mt-6 px-6 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-colors start-btn">
        Start Editing
      </button>
    </div>
  `;

  inner.querySelector('.start-btn').onclick = () => navigate('edit');

  const modelsSection = document.createElement('div');
  modelsSection.className = 'mb-12 animate-fade-in-up';
  modelsSection.style.animationDelay = '0.1s';
  modelsSection.innerHTML = '<h2 class="text-lg font-bold text-white mb-4">Available Models</h2>';

  const categories = {};
  IMAGE_TO_IMAGE_MODELS.forEach(model => {
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
        navigate('edit');
      };
      grid.appendChild(card);
    });

    modelsSection.appendChild(grid);
  });

  inner.appendChild(modelsSection);

  const promptsSection = document.createElement('div');
  promptsSection.className = 'mb-12 animate-fade-in-up';
  promptsSection.style.animationDelay = '0.2s';
  promptsSection.innerHTML = '<h2 class="text-lg font-bold text-white mb-4">Example Transformations</h2>';

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
      navigate('edit');
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
      <h3 class="text-xl font-bold text-white mb-2">Ready to transform?</h3>
      <p class="text-secondary mb-6">Edit and enhance your images with AI</p>
      <button class="px-8 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-colors">
        Open Edit Studio
      </button>
    </div>
  `;
  ctaSection.querySelector('button').onclick = () => navigate('edit');
  inner.appendChild(ctaSection);

  container.appendChild(inner);
  return container;
}
