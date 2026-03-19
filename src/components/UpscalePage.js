import { navigate } from '../lib/router.js';

const UPSCALE_METHODS = [
  { name: 'AI Upscaler', description: 'General-purpose AI upscaling with 2x/4x factor', factors: ['2x', '4x'] },
  { name: 'Topaz Upscale', description: 'Premium Topaz-quality enhancement', factors: ['2x', '4x', '8x'] },
  { name: 'Seed Upscale', description: 'SeedVR2 high-fidelity upscaling', factors: ['2x', '4x'] },
];

const FEATURES = [
  { icon: '🔍', title: '2x - 8x Upscale', description: 'Increase image resolution up to 8 times original size' },
  { icon: '✨', title: 'AI Enhanced', description: 'Smart detail enhancement during upscaling' },
  { icon: '🎨', title: 'Quality Preserved', description: 'Maintain and enhance image quality and details' },
  { icon: '⚡', title: 'Fast Processing', description: 'Quick and efficient upscaling with AI' },
];

const LOGOS = ['Adobe', 'Topaz Labs', 'Photoshop', 'Lightroom', 'Capture One', 'Affinity'];

export function UpscalePage() {
  const container = document.createElement('div');
  container.className = 'w-full min-h-full bg-black';

  container.innerHTML = `
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-black to-green-900/20"></div>
      <div class="absolute inset-0" style="background-image: radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);"></div>
      <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 50px 50px;"></div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div class="flex justify-center mb-8">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span class="text-sm text-gray-300">AI-Powered Image Enhancement</span>
          </div>
        </div>
        
        <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-center text-white tracking-tight mb-6">
          <span class="bg-gradient-to-r from-white via-emerald-200 to-green-200 bg-clip-text text-transparent">
            Upscale
          </span>
        </h1>
        
        <p class="text-xl sm:text-2xl text-gray-400 text-center max-w-3xl mx-auto mb-10">
          Enhance and upscale images with AI-powered methods
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button class="start-btn group relative px-8 py-4 bg-white text-black font-bold rounded-full text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/25">
            <span class="relative z-10 flex items-center gap-2">
              Upscale Images
              <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </span>
          </button>
          <button class="px-8 py-4 bg-white/5 text-white font-semibold rounded-full text-lg border border-white/10 hover:bg-white/10 transition-all backdrop-blur-sm">
            View Documentation
          </button>
        </div>
        
        <div class="relative max-w-4xl mx-auto">
          <div class="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl blur opacity-30"></div>
          <div class="relative bg-gray-900 rounded-2xl overflow-hidden border border-white/10" style="aspect-ratio: 16/9;">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                </div>
                <p class="text-gray-500 text-sm">AI Upscaled Image</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <section class="py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">Super Resolution</h2>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">Upscale your images without quality loss</p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${FEATURES.map(f => `
            <div class="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:bg-white/[0.07]">
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
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">Upscale Methods</h2>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">Choose the best method for your needs</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-6">
          ${UPSCALE_METHODS.map(m => `
            <div class="method-card group p-6 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all duration-300">
              <h3 class="text-lg font-semibold text-white mb-2">${m.name}</h3>
              <p class="text-gray-400 text-sm mb-4">${m.description}</p>
              <div class="flex gap-2">
                ${m.factors.map(f => `
                  <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium">${f}</span>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    
    <section class="py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">Upscale Factors</h2>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">Increase resolution up to 8x</p>
        </div>
        
        <div class="flex flex-wrap justify-center gap-4">
          <div class="factor-card group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 text-center cursor-pointer min-w-[150px]">
            <span class="text-3xl font-bold text-white">2x</span>
            <span class="text-gray-500 text-sm block mt-1">Standard</span>
          </div>
          <div class="factor-card group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 text-center cursor-pointer min-w-[150px]">
            <span class="text-3xl font-bold text-white">4x</span>
            <span class="text-gray-500 text-sm block mt-1">High Quality</span>
          </div>
          <div class="factor-card group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 text-center cursor-pointer min-w-[150px]">
            <span class="text-3xl font-bold text-white">8x</span>
            <span class="text-gray-500 text-sm block mt-1">Maximum</span>
          </div>
        </div>
      </div>
    </section>
    
    <section class="py-12 border-y border-white/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-gray-500 mb-8">POWERED BY LEADING TECHNOLOGY</p>
        <div class="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-50">
          ${LOGOS.map(logo => `<span class="text-xl font-bold text-gray-400">${logo}</span>`).join('')}
        </div>
      </div>
    </section>
    
    <section class="py-24">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 p-1">
          <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          <div class="relative bg-black/40 backdrop-blur-xl rounded-3xl p-12 text-center">
            <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">Upscale Your Images</h2>
            <p class="text-xl text-white/80 mb-8 max-w-xl mx-auto">Enhance resolution with AI-powered upscaling</p>
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

  container.querySelector('.start-btn').onclick = () => navigate('upscale');
  container.querySelector('.cta-btn').onclick = () => navigate('upscale');

  return container;
}
