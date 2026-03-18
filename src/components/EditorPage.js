import { navigate } from '../lib/router.js';
import { showToast } from '../lib/loading.js';

const TRANSITIONS = [
    { id: 'fade', name: 'Fade', icon: '◐', duration: 0.5 },
    { id: 'dissolve', name: 'Dissolve', icon: '◑', duration: 0.8 },
    { id: 'wipe-left', name: 'Wipe Left', icon: '→', duration: 0.5 },
    { id: 'wipe-right', name: 'Wipe Right', icon: '←', duration: 0.5 },
    { id: 'wipe-up', name: 'Wipe Up', icon: '↑', duration: 0.5 },
    { id: 'wipe-down', name: 'Wipe Down', icon: '↓', duration: 0.5 },
    { id: 'slide', name: 'Slide', icon: '⇢', duration: 0.5 },
    { id: 'zoom-in', name: 'Zoom In', icon: '🔍', duration: 0.5 },
    { id: 'zoom-out', name: 'Zoom Out', icon: '🔎', duration: 0.5 },
    { id: 'blur', name: 'Blur', icon: '💧', duration: 1.0 },
    { id: 'spin', name: 'Spin', icon: '↻', duration: 0.8 },
    { id: 'custom', name: 'Custom', icon: '⚙️', duration: 1.0 },
];

const TEXT_STYLES = [
    { id: 'title', name: 'Title', font: 'Impact', size: 72, color: '#FFFFFF', bg: 'transparent' },
    { id: 'subtitle', name: 'Subtitle', font: 'Arial', size: 36, color: '#FFFFFF', bg: 'rgba(0,0,0,0.5)' },
    { id: 'lower-third', name: 'Lower Third', font: 'Arial', size: 24, color: '#FFFFFF', bg: 'rgba(0,0,0,0.7)' },
    { id: 'caption', name: 'Caption', font: 'Arial', size: 18, color: '#FFFFFF', bg: 'rgba(0,0,0,0.6)' },
    { id: 'credits', name: 'Credits', font: 'Courier', size: 24, color: '#CCCCCC', bg: 'transparent' },
];

const AUDIO_TRACKS = [
    { id: 'music', name: 'Background Music', icon: '🎵', color: 'green' },
    { id: 'voiceover', name: 'Voiceover', icon: '🎤', color: 'purple' },
    { id: 'sfx', name: 'Sound Effects', icon: '🔊', color: 'orange' },
];

export function EditorPage() {
    const container = document.createElement('div');
    container.className = 'w-full h-full flex flex-col overflow-hidden';
    
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('videoId') || '';
    const videoUrl = urlParams.get('videoUrl') || '';
    
    let selectedTool = null;
    let selectedTransition = null;
    let timelineClips = [
        { id: 'clip1', name: 'Video', start: 0, duration: 10, color: '#3B82F6' }
    ];
    
    container.innerHTML = `
        <!-- Header -->
        <div class="flex items-center justify-between p-3 border-b border-white/5 bg-black/30">
            <div class="flex items-center gap-4">
                <button id="back-btn" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                </button>
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-lg font-black text-white">EDITOR</h1>
                        <p class="text-xs text-secondary">Full Timeline Editor</p>
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button id="undo-btn" class="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Undo">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
                    </svg>
                </button>
                <button id="redo-btn" class="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Redo">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>
                    </svg>
                </button>
                <div class="h-6 w-px bg-white/10 mx-2"></div>
                <button id="save-btn" class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors">
                    Save
                </button>
                <button id="export-btn" class="px-4 py-1.5 bg-primary text-black font-bold rounded-lg hover:scale-105 transition-transform text-sm">
                    Export
                </button>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="flex-1 flex overflow-hidden">
            <!-- Video Preview Area -->
            <div class="flex-1 flex flex-col overflow-hidden">
                <!-- Preview -->
                <div class="flex-1 flex items-center justify-center bg-black p-4">
                    ${videoUrl ? `
                        <video 
                            id="editor-video" 
                            class="max-w-full max-h-full rounded-lg shadow-2xl" 
                            controls
                            src="${escapeHtml(videoUrl)}"
                        >
                            Your browser does not support video playback.
                        </video>
                    ` : `
                        <div class="text-center p-8">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-secondary mx-auto mb-4">
                                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                                <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
                                <line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/>
                                <line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/>
                                <line x1="17" y1="7" x2="22" y2="7"/>
                            </svg>
                            <p class="text-secondary">No video loaded</p>
                            <p class="text-xs text-muted mt-2">Generate a video first to use the Editor</p>
                        </div>
                    `}
                </div>
                
                <!-- Timeline -->
                <div class="h-56 border-t border-white/5 bg-black/50 flex flex-col">
                    <!-- Timeline Toolbar -->
                    <div class="h-10 px-4 border-b border-white/5 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-secondary font-bold">TIMELINE</span>
                            <span class="text-xs text-muted">00:00 / 00:10</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button class="timeline-btn p-1 hover:bg-white/10 rounded" title="Zoom Out">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M8 11h6"/>
                                </svg>
                            </button>
                            <button class="timeline-btn p-1 hover:bg-white/10 rounded" title="Zoom In">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
                                </svg>
                            </button>
                            <button class="timeline-btn p-1 hover:bg-white/10 rounded" title="Snap to Grid">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
                                    <line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/>
                                    <line x1="15" y1="3" x2="15" y2="21"/>
                                </svg>
                            </button>
                            <button class="timeline-btn p-1 hover:bg-white/10 rounded" title="Add Track">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Timeline Tracks -->
                    <div class="flex-1 overflow-auto p-2">
                        <div class="min-w-[800px]">
                            <!-- Time Ruler -->
                            <div class="h-5 flex items-end text-[10px] text-secondary mb-1 ml-24">
                                ${[0,1,2,3,4,5,6,7,8,9,10].map(t => `
                                    <div class="w-16 border-l border-white/20 pl-1">${t}:00</div>
                                `).join('')}
                            </div>
                            
                            <!-- Video Track -->
                            <div class="flex items-center h-10 mb-1">
                                <div class="w-24 text-xs text-secondary pr-2 text-right">Video</div>
                                <div class="flex-1 h-full bg-white/5 rounded relative track-container" data-track="video">
                                    <div class="clip absolute h-8 top-1 bg-blue-600/70 rounded cursor-move hover:bg-blue-600 transition-colors flex items-center px-2" 
                                         style="left: 0px; width: 160px;" data-clip="clip1">
                                        <span class="text-xs text-white truncate">Video</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Audio Track -->
                            <div class="flex items-center h-10 mb-1">
                                <div class="w-24 text-xs text-secondary pr-2 text-right">Audio</div>
                                <div class="flex-1 h-full bg-white/5 rounded relative track-container" data-track="audio">
                                </div>
                            </div>
                            
                            <!-- Text Track -->
                            <div class="flex items-center h-10">
                                <div class="w-24 text-xs text-secondary pr-2 text-right">Text</div>
                                <div class="flex-1 h-full bg-white/5 rounded relative track-container" data-track="text">
                                </div>
                            </div>
                            
                            <!-- Playhead -->
                            <div class="absolute top-0 bottom-0 w-0.5 bg-primary cursor-ew-resize ml-24 pointer-events-none" style="left: 80px;" id="playhead">
                                <div class="absolute -top-0 -left-1.5 w-3 h-3 bg-primary rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Right Panel - Tools -->
            <div class="w-72 border-l border-white/5 overflow-auto">
                <!-- Tool Tabs -->
                <div class="flex border-b border-white/5">
                    <button class="tool-tab flex-1 p-3 text-xs font-bold text-primary border-b-2 border-primary" data-tab="media">
                        MEDIA
                    </button>
                    <button class="tool-tab flex-1 p-3 text-xs font-bold text-secondary hover:text-white" data-tab="transitions">
                        TRANSITIONS
                    </button>
                    <button class="tool-tab flex-1 p-3 text-xs font-bold text-secondary hover:text-white" data-tab="text">
                        TEXT
                    </button>
                    <button class="tool-tab flex-1 p-3 text-xs font-bold text-secondary hover:text-white" data-tab="audio">
                        AUDIO
                    </button>
                </div>
                
                <!-- Media Tab -->
                <div id="tab-media" class="tool-panel p-4">
                    <h3 class="font-bold text-white mb-3 text-sm">MEDIA LIBRARY</h3>
                    <div class="grid grid-cols-3 gap-2 mb-4">
                        ${[1,2,3,4,5,6].map(i => `
                            <div class="aspect-video bg-white/5 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors group relative">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-secondary group-hover:text-white">
                                    <rect x="2" y="2" width="20" height="20" rx="2"/><path d="M10 8l6 4-6 4V8z"/>
                                </svg>
                                <span class="absolute bottom-1 right-1 text-[8px] text-white bg-black/50 px-1 rounded">0:${String(i*1.5).padStart(2,'0')}</span>
                            </div>
                        `).join('')}
                    </div>
                    <button class="w-full py-2 border border-dashed border-white/20 rounded-lg text-sm text-secondary hover:bg-white/5 hover:text-white transition-colors">
                        + Import Media
                    </button>
                    
                    <!-- Clip Properties -->
                    <div class="mt-6">
                        <h4 class="font-bold text-white text-sm mb-3">CLIP PROPERTIES</h4>
                        <div class="space-y-3">
                            <div>
                                <label class="text-xs text-secondary block mb-1">Duration</label>
                                <input type="text" value="10s" class="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white">
                            </div>
                            <div>
                                <label class="text-xs text-secondary block mb-1">Start Time</label>
                                <input type="text" value="0:00" class="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white">
                            </div>
                            <div>
                                <label class="text-xs text-secondary block mb-1">Speed</label>
                                <select class="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white">
                                    <option>1x (Normal)</option>
                                    <option>0.5x (Slow)</option>
                                    <option>2x (Fast)</option>
                                    <option>0.25x (Super Slow)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Transitions Tab -->
                <div id="tab-transitions" class="tool-panel p-4 hidden">
                    <h3 class="font-bold text-white mb-3 text-sm">TRANSITIONS</h3>
                    <p class="text-xs text-secondary mb-4">Drag a transition between clips</p>
                    <div class="grid grid-cols-3 gap-2">
                        ${TRANSITIONS.map(t => `
                            <button class="transition-btn p-2 bg-white/5 hover:bg-white/10 rounded-lg text-center transition-colors cursor-pointer" data-transition="${t.id}">
                                <div class="text-lg mb-1">${t.icon}</div>
                                <div class="text-[10px] text-secondary">${t.name}</div>
                            </button>
                        `).join('')}
                    </div>
                    
                    <!-- Transition Settings -->
                    <div class="mt-6">
                        <h4 class="font-bold text-white text-sm mb-3">SETTINGS</h4>
                        <div class="space-y-3">
                            <div>
                                <label class="text-xs text-secondary block mb-1">Duration</label>
                                <input type="range" min="0.1" max="2" step="0.1" value="0.5" class="w-full">
                                <div class="flex justify-between text-[10px] text-secondary">
                                    <span>0.1s</span><span>0.5s</span><span>2s</span>
                                </div>
                            </div>
                            <div>
                                <label class="text-xs text-secondary block mb-1">Easing</label>
                                <select class="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white">
                                    <option>Linear</option>
                                    <option selected>Ease In-Out</option>
                                    <option>Ease In</option>
                                    <option>Ease Out</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Text Tab -->
                <div id="tab-text" class="tool-panel p-4 hidden">
                    <h3 class="font-bold text-white mb-3 text-sm">TEXT STYLES</h3>
                    <div class="space-y-2 mb-4">
                        ${TEXT_STYLES.map(s => `
                            <button class="style-btn w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors cursor-pointer" data-style="${s.id}">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                        <span class="text-white font-bold text-xs">T</span>
                                    </div>
                                    <span class="text-sm text-white">${s.name}</span>
                                </div>
                            </button>
                        `).join('')}
                    </div>
                    
                    <!-- Text Properties -->
                    <div class="mt-6">
                        <h4 class="font-bold text-white text-sm mb-3">PROPERTIES</h4>
                        <div class="space-y-3">
                            <div>
                                <label class="text-xs text-secondary block mb-1">Text Content</label>
                                <textarea class="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white h-20 resize-none" placeholder="Enter text..."></textarea>
                            </div>
                            <div>
                                <label class="text-xs text-secondary block mb-1">Font</label>
                                <select class="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white">
                                    <option>Arial</option>
                                    <option>Impact</option>
                                    <option>Helvetica</option>
                                    <option>Courier New</option>
                                    <option>Georgia</option>
                                </select>
                            </div>
                            <div class="flex gap-2">
                                <div class="flex-1">
                                    <label class="text-xs text-secondary block mb-1">Size</label>
                                    <input type="number" value="36" class="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white">
                                </div>
                                <div class="flex-1">
                                    <label class="text-xs text-secondary block mb-1">Color</label>
                                    <input type="color" value="#FFFFFF" class="w-full h-9 bg-white/5 border border-white/10 rounded cursor-pointer">
                                </div>
                            </div>
                            <div>
                                <label class="text-xs text-secondary block mb-1">Position</label>
                                <div class="grid grid-cols-3 gap-1">
                                    <button class="p-2 bg-white/5 hover:bg-white/10 rounded text-xs text-secondary">Top</button>
                                    <button class="p-2 bg-white/5 hover:bg-white/10 rounded text-xs text-white">Center</button>
                                    <button class="p-2 bg-white/5 hover:bg-white/10 rounded text-xs text-secondary">Bottom</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button class="mt-4 w-full py-2 bg-primary text-black font-bold rounded-lg hover:scale-[1.02] transition-transform">
                        Add Text
                    </button>
                </div>
                
                <!-- Audio Tab -->
                <div id="tab-audio" class="tool-panel p-4 hidden">
                    <h3 class="font-bold text-white mb-3 text-sm">AUDIO TRACKS</h3>
                    <div class="space-y-2 mb-4">
                        ${AUDIO_TRACKS.map(a => `
                            <button class="audio-btn w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors cursor-pointer" data-audio="${a.id}">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 bg-${a.color}-600/20 rounded-lg flex items-center justify-center">
                                        <span class="text-lg">${a.icon}</span>
                                    </div>
                                    <span class="text-sm text-white">${a.name}</span>
                                </div>
                            </button>
                        `).join('')}
                    </div>
                    
                    <!-- Audio Library -->
                    <div class="mt-4">
                        <h4 class="font-bold text-white text-sm mb-3">AUDIO LIBRARY</h4>
                        <div class="space-y-2">
                            ${['Upbeat.mp3', 'Cinematic.mp3', 'Ambient.mp3', 'Acoustic.mp3'].map((f, i) => `
                                <div class="flex items-center gap-2 p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10">
                                    <div class="w-8 h-8 bg-green-600/20 rounded flex items-center justify-center">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="text-green-400">
                                            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                                        </svg>
                                    </div>
                                    <span class="text-xs text-white flex-1 truncate">${f}</span>
                                    <span class="text-[10px] text-secondary">${(i+1)*0.5}:${String((i+1)*15).padStart(2,'0')}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Audio Mixer -->
                    <div class="mt-6">
                        <h4 class="font-bold text-white text-sm mb-3">MIXER</h4>
                        <div class="space-y-3">
                            <div>
                                <div class="flex justify-between text-xs mb-1">
                                    <span class="text-secondary">Master Volume</span>
                                    <span class="text-white">80%</span>
                                </div>
                                <input type="range" min="0" max="100" value="80" class="w-full">
                            </div>
                            <div>
                                <div class="flex justify-between text-xs mb-1">
                                    <span class="text-secondary">Music</span>
                                    <span class="text-white">60%</span>
                                </div>
                                <input type="range" min="0" max="100" value="60" class="w-full">
                            </div>
                            <div>
                                <div class="flex justify-between text-xs mb-1">
                                    <span class="text-secondary">Voiceover</span>
                                    <span class="text-white">100%</span>
                                </div>
                                <input type="range" min="0" max="100" value="100" class="w-full">
                            </div>
                        </div>
                    </div>
                    
                    <button class="mt-4 w-full py-2 bg-green-600/20 text-green-400 font-bold rounded-lg hover:bg-green-600/30 transition-colors">
                        + Add Audio Track
                    </button>
                </div>
                
                <!-- Effects Section (always visible) -->
                <div class="p-4 border-t border-white/5">
                    <h3 class="font-bold text-white mb-3 text-sm">QUICK EFFECTS</h3>
                    <div class="grid grid-cols-4 gap-2">
                        <button class="effect-btn p-2 bg-white/5 hover:bg-white/10 rounded-lg text-center cursor-pointer" data-effect="brightness">
                            <div class="text-lg">☀️</div>
                            <div class="text-[8px] text-secondary">Bright</div>
                        </button>
                        <button class="effect-btn p-2 bg-white/5 hover:bg-white/10 rounded-lg text-center cursor-pointer" data-effect="contrast">
                            <div class="text-lg">◐</div>
                            <div class="text-[8px] text-secondary">Contrast</div>
                        </button>
                        <button class="effect-btn p-2 bg-white/5 hover:bg-white/10 rounded-lg text-center cursor-pointer" data-effect="saturation">
                            <div class="text-lg">🎨</div>
                            <div class="text-[8px] text-secondary">Saturate</div>
                        </button>
                        <button class="effect-btn p-2 bg-white/5 hover:bg-white/10 rounded-lg text-center cursor-pointer" data-effect="blur">
                            <div class="text-lg">💧</div>
                            <div class="text-[8px] text-secondary">Blur</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Event handlers
    container.querySelector('#back-btn').onclick = () => {
        navigate('render', { videoId, videoUrl });
    };
    
    container.querySelector('#undo-btn').onclick = () => {
        showToast('Undo', 'info');
    };
    
    container.querySelector('#redo-btn').onclick = () => {
        showToast('Redo', 'info');
    };
    
    container.querySelector('#save-btn').onclick = () => {
        showToast('Project saved!', 'success');
    };
    
    container.querySelector('#export-btn').onclick = () => {
        showToast('Exporting video...', 'info');
    };
    
    // Tool tabs
    container.querySelectorAll('.tool-tab').forEach(tab => {
        tab.onclick = () => {
            container.querySelectorAll('.tool-tab').forEach(t => {
                t.classList.remove('text-primary', 'border-primary');
                t.classList.add('text-secondary');
            });
            tab.classList.remove('text-secondary');
            tab.classList.add('text-primary', 'border-primary');
            
            container.querySelectorAll('.tool-panel').forEach(p => p.classList.add('hidden'));
            container.querySelector(`#tab-${tab.dataset.tab}`).classList.remove('hidden');
        };
    });
    
    // Transition buttons
    container.querySelectorAll('.transition-btn').forEach(btn => {
        btn.onclick = () => {
            container.querySelectorAll('.transition-btn').forEach(b => b.classList.remove('bg-primary/30', 'border', 'border-primary'));
            btn.classList.add('bg-primary/30', 'border', 'border-primary');
            selectedTransition = btn.dataset.transition;
            showToast(`Selected: ${btn.textContent.trim()} transition`, 'info');
        };
    });
    
    // Style buttons
    container.querySelectorAll('.style-btn').forEach(btn => {
        btn.onclick = () => {
            container.querySelectorAll('.style-btn').forEach(b => b.classList.remove('bg-primary/30'));
            btn.classList.add('bg-primary/30');
            selectedTool = 'text';
            showToast(`Selected: ${btn.textContent.trim()} style`, 'info');
        };
    });
    
    // Audio buttons
    container.querySelectorAll('.audio-btn').forEach(btn => {
        btn.onclick = () => {
            container.querySelectorAll('.audio-btn').forEach(b => b.classList.remove('bg-green-600/30'));
            btn.classList.add('bg-green-600/30');
            selectedTool = 'audio';
            showToast(`Selected: ${btn.textContent.trim()} track`, 'info');
        };
    });
    
    // Effect buttons
    container.querySelectorAll('.effect-btn').forEach(btn => {
        btn.onclick = () => {
            showToast(`Applying ${btn.dataset.effect} effect...`, 'info');
        };
    });
    
    // Clip drag functionality
    container.querySelectorAll('.clip').forEach(clip => {
        clip.onmousedown = (e) => {
            e.preventDefault();
            let startX = e.clientX;
            let startLeft = parseInt(clip.style.left || 0);
            
            const onMouseMove = (e) => {
                const diff = e.clientX - startX;
                const newLeft = Math.max(0, startLeft + diff);
                clip.style.left = newLeft + 'px';
            };
            
            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };
    });
    
    return container;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
