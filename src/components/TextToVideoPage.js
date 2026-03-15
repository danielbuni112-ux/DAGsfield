import { navigate } from '../lib/router.js';

const TEXT_TO_VIDEO_MODELS = [
  { name: 'Kling v2.1', description: 'Kling v2.1 text-to-video', category: 'Kling' },
  { name: 'Kling v2.5', description: 'Kling v2.5 text-to-video', category: 'Kling' },
  { name: 'Kling v2.6', description: 'Kling v2.6 text-to-video', category: 'Kling' },
  { name: 'Kling v3.0', description: 'Kling v3.0 text-to-video', category: 'Kling' },
  { name: 'Sora', description: 'OpenAI Sora text-to-video', category: 'OpenAI' },
  { name: 'Sora 2', description: 'OpenAI Sora 2 text-to-video', category: 'OpenAI' },
  { name: 'Veo 3', description: 'Google Veo 3 text-to-video', category: 'Google' },
  { name: 'Veo 3.1', description: 'Google Veo 3.1 text-to-video', category: 'Google' },
  { name: 'Seedance Lite', description: 'Seedance Lite text-to-video', category: 'Seedance' },
  { name: 'Seedance Pro', description: 'Seedance Pro text-to-video', category: 'Seedance' },
  { name: 'Seedance v1.5', description: 'Seedance v1.5 text-to-video', category: 'Seedance' },
  { name: 'Seedance v2.0', description: 'Seedance v2.0 text-to-video', category: 'Seedance' },
  { name: 'Seedance 2.0 Extend', description: 'Seedance 2.0 Extend', category: 'Seedance' },
  { name: 'Wan 2.1', description: 'Wan 2.1 text-to-video', category: 'Wan' },
  { name: 'Wan 2.2', description: 'Wan 2.2 text-to-video', category: 'Wan' },
  { name: 'Wan 2.5', description: 'Wan 2.5 text-to-video', category: 'Wan' },
  { name: 'Wan 2.6', description: 'Wan 2.6 text-to-video', category: 'Wan' },
  { name: 'Hunyuan', description: 'Tencent Hunyuan text-to-video', category: 'Hunyuan' },
  { name: 'Hailuo 02', description: 'Hailuo 02 text-to-video', category: 'Hailuo' },
  { name: 'Hailuo 2.3', description: 'Hailuo 2.3 text-to-video', category: 'Hailuo' },
  { name: 'Runway Gen-3', description: 'Runway Gen-3 text-to-video', category: 'Runway' },
  { name: 'Pixverse v4.5', description: 'Pixverse v4.5 text-to-video', category: 'Pixverse' },
  { name: 'Pixverse v5', description: 'Pixverse v5 text-to-video', category: 'Pixverse' },
  { name: 'Pixverse v5.5', description: 'Pixverse v5.5 text-to-video', category: 'Pixverse' },
  { name: 'Vidu v2.0', description: 'Vidu v2.0 text-to-video', category: 'Vidu' },
  { name: 'LTX 2 Pro', description: 'LTX 2 Pro text-to-video', category: 'LTX' },
  { name: 'OVI', description: 'OVI text-to-video', category: 'OVI' },
  { name: 'Grok Imagine', description: 'Grok Imagine text-to-video', category: 'Grok' },
];

const EXAMPLE_PROMPTS = [
  { prompt: 'A drone shot flying over a futuristic city at sunset, neon lights, cinematic', model: 'Kling v2.1' },
  { prompt: 'Close-up of waves crashing on rocky coastline, dramatic ocean, 4K', model: 'Sora' },
  { prompt: 'Timelapse of a flower blooming in supernatural colors, magical lighting', model: 'Veo 3' },
  { prompt: 'Character walking through a cyberpunk street, rain reflections, epic', model: 'Runway Gen-3' },
  { prompt: 'Aerial view of mountains covered in snow, morning mist, nature documentary', model: 'Hunyuan' },
];

export function TextToVideoPage() {
  const container = document.createElement('div');
  container.className = 'w-full h-full overflow-y-auto bg-app-bg';

  const inner = document.createElement('div');
  inner.className = 'max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12';

  inner.innerHTML = `
    <div class="mb-10 animate-fade-in-up">
      <div class="flex items-center gap-3 mb-4">
        <span class="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">AI Video Generation</span>
        <span class="text-muted text-xs">40+ Models Available</span>
      </div>
      <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">Text to Video</h1>
      <p class="text-secondary text-sm md:text-base max-w-xl">Create stunning videos from text descriptions with our powerful AI models</p>
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
  TEXT_TO_VIDEO_MODELS.forEach(model => {
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
      <h3 class="text-xl font-bold text-white mb-2">Ready to create?</h3>
      <p class="text-secondary mb-6">Generate amazing videos from text</p>
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
