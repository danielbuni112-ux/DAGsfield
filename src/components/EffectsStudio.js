import { muapi } from '../lib/muapi.js';
import { AuthModal } from './AuthModal.js';
import { createUploadPicker } from './UploadPicker.js';
import { i2iModels, i2vModels } from '../lib/models.js';

const EFFECT_TABS = [
  { id: 'image-effects', label: 'Image Effects', type: 'i2i', field: 'name' },
  { id: 'nano-banana-effects', label: 'Nano Banana', type: 'i2i', field: 'name' },
  { id: 'flux-kontext-effects', label: 'Kontext Effects', type: 'i2i', field: 'name' },
  { id: 'ai-video-effects', label: 'Video Effects', type: 'i2v', field: 'name' },
  { id: 'motion-controls', label: 'Motion Controls', type: 'i2v', field: 'name' },
  { id: 'video-effects', label: 'Video FX v2', type: 'i2v', field: 'name' },
];

function getEffectsForModel(modelId) {
  const allModels = [...i2iModels, ...i2vModels];
  const model = allModels.find(m => m.id === modelId);
  if (!model) return [];
  const nameField = model.inputs?.name;
  if (nameField?.enum) return nameField.enum;
  return [];
}

export function EffectsStudio() {
  const container = document.createElement('div');
  container.className = 'w-full h-full flex flex-col bg-app-bg overflow-hidden';

  let activeTab = EFFECT_TABS[0];
  let selectedEffect = null;
  let uploadedUrl = null;

  const topBar = document.createElement('div');
  topBar.className = 'px-4 md:px-8 pt-6 pb-4 shrink-0';
  topBar.innerHTML = `
    <h1 class="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">Effects Studio</h1>
    <p class="text-secondary text-xs mb-4">Apply 350+ visual effects to your photos and videos</p>
  `;

  const tabRow = document.createElement('div');
  tabRow.className = 'flex gap-2 overflow-x-auto no-scrollbar pb-2';

  const tabButtons = {};
  EFFECT_TABS.forEach(tab => {
    const btn = document.createElement('button');
    const count = getEffectsForModel(tab.id).length;
    btn.className = 'px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all';
    btn.textContent = `${tab.label} (${count})`;
    btn.onclick = () => switchTab(tab);
    tabButtons[tab.id] = btn;
    tabRow.appendChild(btn);
  });

  topBar.appendChild(tabRow);
  container.appendChild(topBar);

  const bodyArea = document.createElement('div');
  bodyArea.className = 'flex flex-1 overflow-hidden px-4 md:px-8 pb-6 gap-6';

  const effectsPanel = document.createElement('div');
  effectsPanel.className = 'flex-1 overflow-y-auto pr-2';

  const rightPanel = document.createElement('div');
  rightPanel.className = 'w-80 shrink-0 flex flex-col gap-4 hidden lg:flex';

  const uploadSection = document.createElement('div');
  uploadSection.className = 'bg-white/[0.03] border border-white/5 rounded-xl p-4';
  uploadSection.innerHTML = '<div class="text-xs font-bold text-secondary uppercase tracking-wider mb-3">Upload Image</div>';

  const picker = createUploadPicker({
    anchorContainer: container,
    onSelect: ({ url }) => { uploadedUrl = url; },
    onClear: () => { uploadedUrl = null; },
  });
  uploadSection.appendChild(picker.trigger);
  container.appendChild(picker.panel);

  const promptInput = document.createElement('input');
  promptInput.type = 'text';
  promptInput.placeholder = 'Optional prompt...';
  promptInput.className = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors mt-3';
  uploadSection.appendChild(promptInput);

  rightPanel.appendChild(uploadSection);

  const selectedLabel = document.createElement('div');
  selectedLabel.className = 'bg-white/[0.03] border border-white/5 rounded-xl p-4';
  selectedLabel.innerHTML = '<div class="text-xs font-bold text-muted">Select an effect from the grid</div>';
  rightPanel.appendChild(selectedLabel);

  const generateBtn = document.createElement('button');
  generateBtn.className = 'w-full bg-primary text-black py-3 rounded-xl font-black text-sm hover:shadow-glow transition-all';
  generateBtn.textContent = 'Apply Effect';
  rightPanel.appendChild(generateBtn);

  const resultArea = document.createElement('div');
  resultArea.className = 'hidden';
  rightPanel.appendChild(resultArea);

  bodyArea.appendChild(effectsPanel);
  bodyArea.appendChild(rightPanel);
  container.appendChild(bodyArea);

  const mobileControls = document.createElement('div');
  mobileControls.className = 'lg:hidden px-4 pb-4 shrink-0 flex flex-col gap-3';
  const mobileUpload = document.createElement('div');
  mobileUpload.className = 'flex items-center gap-3';
  const mobilePicker = createUploadPicker({
    anchorContainer: container,
    onSelect: ({ url }) => { uploadedUrl = url; },
    onClear: () => { uploadedUrl = null; },
  });
  mobileUpload.appendChild(mobilePicker.trigger);
  container.appendChild(mobilePicker.panel);

  const mobilePrompt = document.createElement('input');
  mobilePrompt.type = 'text';
  mobilePrompt.placeholder = 'Optional prompt...';
  mobilePrompt.className = 'flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder:text-muted focus:outline-none focus:border-primary/50';
  mobileUpload.appendChild(mobilePrompt);
  mobileControls.appendChild(mobileUpload);

  const mobileGenBtn = document.createElement('button');
  mobileGenBtn.className = 'w-full bg-primary text-black py-3 rounded-xl font-black text-sm';
  mobileGenBtn.textContent = 'Apply Effect';
  mobileControls.appendChild(mobileGenBtn);
  container.appendChild(mobileControls);

  function switchTab(tab) {
    activeTab = tab;
    selectedEffect = null;
    Object.entries(tabButtons).forEach(([id, btn]) => {
      if (id === tab.id) {
        btn.className = 'px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all bg-primary text-black';
      } else {
        btn.className = 'px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all bg-white/5 text-secondary hover:bg-white/10';
      }
    });
    renderEffects();
  }

  function renderEffects() {
    const effects = getEffectsForModel(activeTab.id);
    effectsPanel.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2';

    effects.forEach(name => {
      const card = document.createElement('div');
      card.className = 'bg-white/[0.03] border border-white/5 rounded-xl p-3 cursor-pointer hover:bg-white/[0.06] hover:border-white/10 transition-all group';
      card.innerHTML = `
        <div class="text-xs font-bold text-white group-hover:text-primary transition-colors truncate">${name}</div>
        <div class="text-[10px] text-muted mt-0.5">${activeTab.type === 'i2v' ? 'Video' : 'Image'}</div>
      `;
      card.onclick = () => {
        selectedEffect = name;
        effectsPanel.querySelectorAll('.border-primary').forEach(el => {
          el.classList.remove('border-primary');
          el.classList.add('border-white/5');
        });
        card.classList.remove('border-white/5');
        card.classList.add('border-primary');
        selectedLabel.innerHTML = `
          <div class="text-xs font-bold text-primary mb-1">${name}</div>
          <div class="text-[10px] text-muted">${activeTab.label} - ${activeTab.type === 'i2v' ? 'Video output' : 'Image output'}</div>
        `;
      };
      grid.appendChild(card);
    });

    effectsPanel.appendChild(grid);
  }

  async function handleGenerate() {
    if (!selectedEffect) { alert('Select an effect first'); return; }
    if (!uploadedUrl) { alert('Upload an image first'); return; }
    const apiKey = localStorage.getItem('muapi_key');
    if (!apiKey) { AuthModal(() => handleGenerate()); return; }

    generateBtn.disabled = true;
    mobileGenBtn.disabled = true;
    generateBtn.innerHTML = '<span class="animate-spin inline-block mr-2">&#9711;</span> Processing...';
    mobileGenBtn.innerHTML = generateBtn.innerHTML;

    try {
      const params = {
        model: activeTab.id,
        image_url: uploadedUrl,
        [activeTab.field]: selectedEffect,
      };
      const prompt = promptInput.value.trim() || mobilePrompt.value.trim();
      if (prompt) params.prompt = prompt;

      let result;
      if (activeTab.type === 'i2v') {
        params.resolution = '720p';
        params.duration = 5;
        result = await muapi.generateI2V(params);
      } else {
        result = await muapi.generateI2I(params);
      }

      if (result?.url) {
        resultArea.classList.remove('hidden');
        resultArea.innerHTML = '';
        if (activeTab.type === 'i2v') {
          resultArea.innerHTML = `<video src="${result.url}" controls autoplay loop class="w-full rounded-xl border border-white/10"></video>`;
        } else {
          resultArea.innerHTML = `<img src="${result.url}" class="w-full rounded-xl border border-white/10">`;
        }
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      generateBtn.disabled = false;
      mobileGenBtn.disabled = false;
      generateBtn.textContent = 'Apply Effect';
      mobileGenBtn.textContent = 'Apply Effect';
    }
  }

  generateBtn.onclick = handleGenerate;
  mobileGenBtn.onclick = handleGenerate;

  switchTab(EFFECT_TABS[0]);
  return container;
}
