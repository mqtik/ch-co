import './style.css';
import { createScene } from './scene/createScene';
import { loadBone } from './mesh/loadBone';
import { CutManager } from './planning/CutManager';
import { bindInput } from './input/InputController';
import { UI } from './ui/UI';
import { initDock } from './ui/dock';

async function init() {
  initDock();
  const { scene } = createScene(document.getElementById('app')!);
  const ui = new UI();

  ui.setState('loading');
  ui.setLoading(true);
  let bone;
  try {
    bone = await loadBone('./Femur_lightweight.stl');
  } catch (err) {
    ui.setLoading(false);
    ui.setState('listening');
    console.error('Failed to load bone STL:', err);
    return;
  }
  ui.setLoading(false);

  let manager = new CutManager(scene, bone, ui);
  bindInput((cmd) => manager.handleCommand(cmd));

  document.getElementById('record-btn')!.addEventListener('click', async () => {
    manager.dispose();
    ui.setState('loading');
    ui.setLoading(true);
    try {
      const freshBone = await loadBone('./Femur_lightweight.stl');
      manager = new CutManager(scene, freshBone, ui);
    } catch (err) {
      ui.setState('listening');
      console.error('Failed to reload bone:', err);
    }
    ui.setLoading(false);
  });
}

init();
