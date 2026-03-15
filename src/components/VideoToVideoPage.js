import { navigate } from '../lib/router.js';

const VIDEO_TO_VIDEO_MODELS = [
  { name: 'AI Video Style Transfer', description: 'Apply artistic styles to your videos', category: 'AI Tools' },
  { name: 'AI Video Color Grading', description: 'Professional color grading for videos', category: 'AI Tools' },
  { name: 'AI Video Slow Motion', description: 'Create smooth slow motion effects', category: 'AI Tools' },
  { name: 'AI Video Speed Ramping', description: 'Dynamic speed changes', category: 'AI Tools' },
];

const EXAMPLE_PROMPTS = [
  { prompt: 'Transform to anime/cartoon style', model: 'AI Video Style Transfer' },
  { prompt: 'Apply cinematic color grading with teal and orange tones', model: 'AI Video Color Grading' },
  { prompt: 'Convert to dramatic slow motion at 60fps', model: 'AI Video Slow Motion' },
];

export function VideoToVideoPage() {
  const container = document.createElement('div');
  container.className = 'w-full h-full overflow-y-auto bg-app-bg';

  const inner = document.createElement('div');
  inner.className = 'max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12';

  inner.innerHTML = `
    <div class="mb-10 animate-fade-in-up">
      <div class="flex items-center gap-3 mb-4">
        <span class="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">AI Video Editing</span>
        <span class="text-muted text-xs">Video Transformation Tools</span>
      </div>
      <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">Video to Video</h1>
      <p class="text-secondary text-sm md:text-base max-w-xl">Transform and enhance your videos with AI-powered tools</p>
      <button class="mt-6 px-6 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-colors start-btn">
        Start Editing
      </button>
    </div>
  `;

  inner.querySelector('.start-btn').onclick = () => navigate('video');

  const modelsSection = document.createElement('div');
  modelsSection.className = 'mb-12 animate-fade-in-up';
  modelsSection.style.animationDelay = '0.1s';
  modelsSection.innerHTML = '<h2 class="text-lg font-bold text-white mb-4">Available Tools</h2>';

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3';

  VIDEO_TO_VIDEO_MODELS.forEach(model => {
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
      <h3 class="text-xl font-bold text-white mb-2">Ready to transform?</h3>
      <p class="text-secondary mb-6">Edit and enhance your videos with AI</p>
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
