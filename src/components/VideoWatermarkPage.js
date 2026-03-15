import { navigate } from '../lib/router.js';

const WATERMARK_TOOLS = [
  { name: 'AI Video Watermark Remover', description: 'Remove watermarks from videos using AI', category: 'Watermark' },
  { name: 'AI Video Object Remover', description: 'Remove unwanted objects from videos', category: 'Removal' },
  { name: 'AI Video Logo Remover', description: 'Remove logos and branding from videos', category: 'Removal' },
];

export function VideoWatermarkPage() {
  const container = document.createElement('div');
  container.className = 'w-full h-full overflow-y-auto bg-app-bg';

  const inner = document.createElement('div');
  inner.className = 'max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12';

  inner.innerHTML = `
    <div class="mb-10 animate-fade-in-up">
      <div class="flex items-center gap-3 mb-4">
        <span class="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">AI Video Tools</span>
        <span class="text-muted text-xs">Professional Video Editing</span>
      </div>
      <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">Video Watermark Remover</h1>
      <p class="text-secondary text-sm md:text-base max-w-xl">Remove watermarks, logos, and unwanted elements from your videos</p>
      <button class="mt-6 px-6 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-colors start-btn">
        Start Removing
      </button>
    </div>
  `;

  inner.querySelector('.start-btn').onclick = () => navigate('video');

  const featuresSection = document.createElement('div');
  featuresSection.className = 'mb-12 animate-fade-in-up';
  featuresSection.style.animationDelay = '0.1s';
  featuresSection.innerHTML = '<h2 class="text-lg font-bold text-white mb-4">Available Tools</h2>';

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3';

  WATERMARK_TOOLS.forEach(tool => {
    const card = document.createElement('div');
    card.className = 'bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:bg-white/[0.06] hover:border-white/10 transition-all group cursor-pointer';
    card.innerHTML = `
      <div class="text-sm font-bold text-white group-hover:text-primary transition-colors">${tool.name}</div>
      <div class="text-xs text-muted mt-1">${tool.description}</div>
    `;
    card.onclick = () => {
      localStorage.setItem('prefill_model', tool.name);
      navigate('video');
    };
    grid.appendChild(card);
  });

  featuresSection.appendChild(grid);
  inner.appendChild(featuresSection);

  const howItWorks = document.createElement('div');
  howItWorks.className = 'mb-12 animate-fade-in-up';
  howItWorks.style.animationDelay = '0.2s';
  howItWorks.innerHTML = `
    <h2 class="text-lg font-bold text-white mb-6">How It Works</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white/[0.03] border border-white/5 rounded-xl p-6">
        <div class="text-2xl font-bold text-primary mb-2">1</div>
        <div class="text-white font-bold mb-2">Upload Video</div>
        <div class="text-muted text-sm">Upload your video with watermark or unwanted content</div>
      </div>
      <div class="bg-white/[0.03] border border-white/5 rounded-xl p-6">
        <div class="text-2xl font-bold text-primary mb-2">2</div>
        <div class="text-white font-bold mb-2">AI Processing</div>
        <div class="text-muted text-sm">Our AI analyzes and removes the watermark intelligently</div>
      </div>
      <div class="bg-white/[0.03] border border-white/5 rounded-xl p-6">
        <div class="text-2xl font-bold text-primary mb-2">3</div>
        <div class="text-white font-bold mb-2">Download</div>
        <div class="text-muted text-sm">Download your clean video without watermark</div>
      </div>
    </div>
  `;
  inner.appendChild(howItWorks);

  const ctaSection = document.createElement('div');
  ctaSection.className = 'animate-fade-in-up';
  ctaSection.style.animationDelay = '0.3s';
  ctaSection.innerHTML = `
    <div class="bg-gradient-to-r from-primary/20 to-purple-500/20 border border-white/10 rounded-2xl p-8 text-center">
      <h3 class="text-xl font-bold text-white mb-2">Clean your videos today</h3>
      <p class="text-secondary mb-6">Remove watermarks and unwanted content with AI</p>
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
