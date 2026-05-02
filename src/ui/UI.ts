import type { AppState, VoiceCommand } from '../types';

const STATE_TEXT: Record<AppState, string> = {
  loading: 'Loading...',
  listening: 'Listening...',
  plane_active: 'Active',
  first_cut_done: 'First Cut',
  cut_executed: 'Cut Executed',
};

export class UI {
  private statusBar: HTMLElement;
  private stateEl: Element;
  private lastCommandEl: Element;
  private clearTimer: ReturnType<typeof setTimeout> | null = null;
  private modeToggle: HTMLButtonElement;
  private toggleMiddleBtn: HTMLButtonElement;
  private modeToggleHandler: (() => void) | null = null;
  private recordBtn: HTMLElement;

  constructor() {
    this.statusBar = document.getElementById('status-bar')!;
    this.recordBtn = document.getElementById('record-btn')!;
    this.stateEl = this.statusBar.querySelector('.state')!;
    this.lastCommandEl = this.statusBar.querySelector('.last-command')!;
    this.modeToggle = document.getElementById('mode-toggle')! as HTMLButtonElement;
    this.toggleMiddleBtn = document.querySelector<HTMLButtonElement>('[data-cmd="toggle_middle"]')!;
    this.toggleMiddleBtn.hidden = true;
  }

  setState(state: AppState): void {
    this.stateEl.textContent = STATE_TEXT[state];
  }

  setLoading(loading: boolean): void {
    this.recordBtn.classList.toggle('loading', loading);
  }

  setLastCommand(text: string): void {
    this.lastCommandEl.textContent = text;
    this.statusBar.classList.add('command-visible');
    if (this.clearTimer) clearTimeout(this.clearTimer);
    this.clearTimer = setTimeout(() => {
      this.statusBar.classList.remove('command-visible');
    }, 3000);
  }

  syncButtons(enabled: Set<VoiceCommand>, modeToggleEnabled: boolean): void {
    const cmds: VoiceCommand[] = ['up', 'down', 'cut', 'toggle_proximal', 'toggle_middle', 'toggle_distal'];
    for (const cmd of cmds) {
      const btn = document.querySelector<HTMLButtonElement>(`[data-cmd="${cmd}"]`);
      if (!btn) continue;
      btn.disabled = !enabled.has(cmd);
    }
    this.modeToggle.disabled = !modeToggleEnabled;
  }

  onModeToggle(handler: () => void): void {
    if (this.modeToggleHandler) {
      this.modeToggle.removeEventListener('click', this.modeToggleHandler);
    }
    this.modeToggleHandler = handler;
    this.modeToggle.addEventListener('click', handler);
  }

  setTwoCutMode(active: boolean): void {
    this.modeToggle.dataset.tooltip = active ? 'Two Cuts' : 'Single Cut';
    this.modeToggle.classList.toggle('active', active);
    this.toggleMiddleBtn.hidden = !active;
  }
}
