export function PlaceholderPage(pageName) {
  const container = document.createElement('div');
  container.className = 'w-full h-full flex flex-col items-center justify-center bg-app-bg';
  container.innerHTML = `
    <div class="text-center animate-fade-in-up">
      <div class="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 mb-4 mx-auto">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-muted">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h2 class="text-xl font-bold text-white mb-2">${pageName.charAt(0).toUpperCase() + pageName.slice(1)}</h2>
      <p class="text-secondary text-sm">Coming soon</p>
    </div>
  `;
  return container;
}
