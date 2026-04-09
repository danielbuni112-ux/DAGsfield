/**
 * Media Library Module
 * Handles media asset management, upload, and library interactions
 */

export function renderMediaGrid(mediaItems, container, onMediaSelect, showToast) {
  if (!container) return;

  container.innerHTML = '';
  mediaItems.forEach((media, index) => {
    const item = document.createElement('button');
    item.className = 'media-item';
    item.innerHTML = `
      <span class="media-icon">${media.icon}</span>
      <span class="media-copy">
        <div class="media-label">${media.label}</div>
        <div class="media-desc">${media.desc}</div>
      </span>
    `;
    item.addEventListener('click', () => onMediaSelect(media, index, showToast));
    container.appendChild(item);
  });
}

export function addMediaToTimeline(media, index, state, showToast) {
  const targetTrack = getTargetTrackForMedia(media, state.tracks);
  const newId = Date.now() + index;
  const startTime = Math.min(state.timelineSeconds - 10, 5 + targetTrack.items.length * 8);
  const duration = getDurationForMedia(media);

  const newItem = {
    id: newId,
    assetId: 'asset-' + (index + 1),
    type: getTypeForMedia(media),
    start: startTime,
    end: startTime + duration,
    sourceStart: 0,
    sourceEnd: duration,
    lane: 0,
    trimIn: 0,
    trimOut: duration,
    volume: 1,
    playbackRate: 1,
    effects: [],
    name: `${media.label} ${targetTrack.items.length + 1}`
  };

  targetTrack.items.push(newItem);
  state.selectedClipId = newId;

  return { newItem, targetTrack };
}

function getTargetTrackForMedia(media, tracks) {
  if (media.label === 'Audio Track') {
    return tracks.find(t => t.name === 'Audio') || tracks[1] || tracks[0];
  }
  if (media.label === 'Image Frame') {
    return tracks.find(t => t.name === 'Text') || tracks[0];
  }
  if (media.label === 'B-Roll Asset') {
    return tracks.find(t => t.name === 'B-Roll') || tracks[0];
  }
  return tracks.find(t => t.name === 'Video') || tracks[0];
}

function getTypeForMedia(media) {
  if (media.label === 'Audio Track') return 'audio';
  if (media.label === 'Image Frame') return 'text';
  if (media.label === 'B-Roll Asset') return 'broll';
  return 'video';
}

function getDurationForMedia(media) {
  if (media.label === 'Audio Track') return 20;
  if (media.label === 'Image Frame') return 5;
  if (media.label === 'B-Roll Asset') return 8;
  return 10;
}

export function addGeneratedAssetToLibrary(asset, state) {
  const newAsset = {
    id: `asset-${Date.now()}`,
    type: asset.type,
    name: asset.name || `${asset.type.charAt(0).toUpperCase() + asset.type.slice(1)} Asset`,
    url: asset.url,
    duration: asset.duration || 0,
    ...(asset.type === 'audio' && asset.waveformData && { waveformData: asset.waveformData })
  };

  state.assets.push(newAsset);
  return newAsset;
}

export function handleUpload(showToast) {
  // Placeholder for upload functionality
  showToast('Upload flow placeholder triggered');
}

export function searchMedia(query, mediaItems) {
  if (!query.trim()) return mediaItems;

  const searchTerm = query.toLowerCase();
  return mediaItems.filter(media =>
    media.label.toLowerCase().includes(searchTerm) ||
    media.desc.toLowerCase().includes(searchTerm)
  );
}

export function filterMediaByType(type, mediaItems) {
  if (!type || type === 'all') return mediaItems;

  return mediaItems.filter(media => {
    if (type === 'video') return ['Video Clip', 'Generated Video', 'Webcam Recording', 'B-Roll Asset'].includes(media.label);
    if (type === 'audio') return ['Audio Track', 'Generated Speech'].includes(media.label);
    if (type === 'image') return ['Generated Image', 'Edited Image'].includes(media.label);
    if (type === 'text') return media.label === 'Image Frame';
    return false;
  });
}