import { navigate } from '../lib/router.js';

const EFFECT_TABS = [
  { label: 'Image Effects', count: '150+' },
  { label: 'Nano Banana', count: '50+' },
  { label: 'Kontext Effects', count: '75+' },
  { label: 'Video Effects', count: '100+' },
];

const FEATURES = [
  { icon: '✨', title: '350+ Effects', description: 'Access a massive library of visual effects for images and videos' },
  { icon: '🎬', title: 'Video Support', description: 'Apply effects to both static images and video content' },
  { icon: '⚡', title: 'Real-time Preview', description: 'See your effects instantly before applying' },
  { icon: '🎨', title: 'Customizable', description: 'Fine-tune each effect to match your vision' },
];

const LOGOS = ['Adobe', 'After Effects', 'DaVinci', 'Topaz', 'Filmora', 'CapCut'];

const EXAMPLE_EFFECTS = [
  { name: 'Cyberpunk Neon', category: 'Image Effects' },
  { name: 'Vintage Film Grain', category: 'Image Effects' },
  { name: 'Motion Blur', category: 'Video Effects' },
  { name: 'Glitch Effect', category: 'Video Effects' },
];

export function EffectsPage() {
  const container = document.createElement('div');
  container.className = 'w-full min-h-full bg-black';

  container.innerHTML = `
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-black to-teal-900/20"></div>
      <div class="absolute inset-0" style="background-image: radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.1) 0%, transparent 50%);"></div>
      <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 50px 50px;"></div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div class="flex justify-center mb-8">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span class="text-sm text-gray-300">350+ Visual Effects</span>
          </div>
        </div>
        
        <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-center text-white tracking-tight mb-6">
          <span class="bg-gradient-to-r from-white via-cyan-200 to-teal-200 bg-clip-text text-transparent">
            Vibe Motion
          </span>
        </h1>
        
        <p class="text-xl sm:text-2xl text-gray-400 text-center max-w-3xl mx-auto mb-10">
          Apply stunning visual effects to your photos and videos
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button class="start-btn group relative px-8 py-4 bg-white text-black font-bold rounded-full text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25">
            <span class="relative z-10 flex items-center gap-2">
              Browse Effects
              <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </span>
          </button>
          <button class="px-8 py-4 bg-white/5 text-white font-semibold rounded-full text-lg border border-white/10 hover:bg-white/10 transition-all backdrop-blur-sm">
            View Documentation
          </button>
        </div>
        
        <div class="relative max-w-4xl mx-auto">
          <div class="absolute -inset-1 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 rounded-2xl blur opacity-30"></div>
          <div class="relative bg-gray-900 rounded-2xl overflow-hidden border border-white/10" style="aspect-ratio: 16/9;">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                  <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <p class="text-gray-500 text-sm">AI Effects Preview</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <section class="py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">Unlimited Creativity</h2>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">Powerful effects for every type of content</p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${FEATURES.map(f => `
            <div class="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 hover:bg-white/[0.07]">
              <div class="text-4xl mb-4">${f.icon}</div>
              <h3 class="text-lg font-semibold text-white mb-2">${f.title}</h3>
              <p class="text-gray-400 text-sm">${f.description}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    
    <section class="py-24 bg-white/[0.02]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">Effect Categories</h2>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">Explore effects by category</p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${EFFECT_TABS.map(tab => `
            <div class="category-card group p-6 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 text-center cursor-pointer">
              <h3 class="text-lg font-semibold text-white mb-1">${tab.label}</h3>
              <span class="text-xs text-cyan-400 font-medium">${tab.count} Effects</span>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    
    <section class="py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">Popular Effects</h2>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">Most used effects by our community</p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${EXAMPLE_EFFECTS.map((e, i) => `
            <div class="effect-card group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer">
              <div class="h-24 rounded-lg bg-gradient-to-br from-cyan-500/20 to-teal-500/20 mb-3 flex items-center justify-center">
                <span class="text-2xl">✨</span>
              </div>
              <span class="text-sm font-medium text-white">${e.name}</span>
              <span class="text-xs text-gray-500 block">${e.category}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    
    <section class="py-12 border-y border-white/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-gray-500 mb-8">TRUSTED BY CREATORS WORLDWIDE</p>
        <div class="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-50">
          ${LOGOS.map(logo => `<span class="text-xl font-bold text-gray-400">${logo}</span>`).join('')}
        </div>
      </div>
    </section>
    
    <section class="py-24">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-600 p-1">
          <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          <div class="relative bg-black/40 backdrop-blur-xl rounded-3xl p-12 text-center">
            <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">Explore Effects</h2>
            <p class="text-xl text-white/80 mb-8 max-w-xl mx-auto">Apply stunning visual effects to your content</p>
            <button class="cta-btn px-10 py-4 bg-white text-black font-bold rounded-full text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105">
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    </section>
    
    <section class="py-12 border-t border-white/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-gray-500 text-sm">Part of</span>
            <span class="text-white font-bold">MUAPI</span>
          </div>
          <div class="flex gap-6">
            <a href="#" class="text-gray-500 hover:text-white text-sm transition-colors">Pricing</a>
            <a href="#" class="text-gray-500 hover:text-white text-sm transition-colors">Documentation</a>
            <a href="#" class="text-gray-500 hover:text-white text-sm transition-colors">API</a>
            <a href="#" class="text-gray-500 hover:text-white text-sm transition-colors">Support</a>
          </div>
        </div>
      </div>
    </section>
  `;

  container.querySelector('.start-btn').onclick = () => navigate('effects');
  container.querySelector('.cta-btn').onclick = () => navigate('effects');

  return container;
}
