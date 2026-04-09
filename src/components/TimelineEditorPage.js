export function TimelineEditorPage() {
  const container = document.createElement('div');
  container.className = 'w-full h-full';
  container.style.cssText = 'background: #05070b; color: white; padding: 20px; font-family: Arial, sans-serif;';

  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h1>Simple Timeline</h1>
    </div>
    <div style="border: 1px solid #333; background: #111; padding: 10px;">
      <div style="margin-bottom: 10px;">
        <div style="display: inline-block; background: #333; padding: 5px; margin-right: 10px; border-radius: 5px;">Clip 1</div>
        <div style="display: inline-block; background: #333; padding: 5px; margin-right: 10px; border-radius: 5px;">Clip 2</div>
      </div>
      <div style="margin-bottom: 10px;">
        <div style="display: inline-block; background: #333; padding: 5px; margin-right: 10px; border-radius: 5px;">Audio 1</div>
      </div>
    </div>
  `;

  return container;
}