import { getPageThumbnail, createThumbnailImg } from '../lib/thumbnails.js';

export function PlaceholderPage(pageName) {
  const container = document.createElement('div');
  container.className = 'w-full h-full flex flex-col items-center justify-center bg-app-bg p-6';

  const wrapper = document.createElement('div');
  wrapper.className = 'text-center animate-fade-in-up max-w-md w-full';

  const placeholderThumb = getPageThumbnail('placeholder');
  if (placeholderThumb) {
    const bannerWrapper = document.createElement('div');
    bannerWrapper.className = 'relative w-full h-40 md:h-52 rounded-2xl overflow-hidden mb-6';
    bannerWrapper.innerHTML = '<div class="thumb-skeleton absolute inset-0"></div>';
    const img = createThumbnailImg(placeholderThumb, 'Coming Soon', 'w-full h-full object-cover');
    bannerWrapper.appendChild(img);
    const overlay = document.createElement('div');
    overlay.className = 'absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent';
    bannerWrapper.appendChild(overlay);
    const textOverlay = document.createElement('div');
    textOverlay.className = 'absolute bottom-0 left-0 right-0 p-5 z-10';
    textOverlay.innerHTML = `<h2 class="text-xl font-bold text-white mb-1">${pageName.charAt(0).toUpperCase() + pageName.slice(1)}</h2><p class="text-white/60 text-sm">Coming soon</p>`;
    bannerWrapper.appendChild(textOverlay);
    wrapper.appendChild(bannerWrapper);
  }

  container.appendChild(wrapper);
  return container;
}
