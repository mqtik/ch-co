import type { VoiceCommand, CommandCallback } from '../types';
import { VoiceController } from './VoiceController';

const KEY_MAP: Record<string, VoiceCommand> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  c: 'cut', C: 'cut',
  p: 'toggle_proximal', P: 'toggle_proximal',
  m: 'toggle_middle', M: 'toggle_middle',
  d: 'toggle_distal', D: 'toggle_distal',
};

export function bindInput(onCommand: CommandCallback): () => void {
  window.addEventListener('keydown', (e) => {
    const cmd = KEY_MAP[e.key];
    if (cmd) { e.preventDefault(); onCommand(cmd); }
  });

  document.querySelectorAll<HTMLButtonElement>('#controls-bar button[data-cmd]').forEach((btn) => {
    btn.addEventListener('click', () => { btn.blur(); onCommand(btn.dataset.cmd as VoiceCommand); });
  });

  const voice = new VoiceController();
  voice.onCommand(onCommand);

  if (voice.isSupported()) {
    const startOnGesture = () => {
      voice.start();
      document.removeEventListener('click', startOnGesture);
      document.removeEventListener('keydown', startOnGesture);
    };
    document.addEventListener('click', startOnGesture);
    document.addEventListener('keydown', startOnGesture);
  }

  return () => voice.stop();
}
