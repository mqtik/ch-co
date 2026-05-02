import { describe, it, expect, beforeEach } from 'vitest';
import { UI } from '../UI';

describe('UI', () => {
  let stateEl: HTMLElement;
  let lastCommandEl: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="status-bar">
        <div class="state"></div>
        <div class="last-command"></div>
      </div>
      <div id="controls-bar">
        <button id="mode-toggle">Single Cut</button>
        <button data-cmd="toggle_middle">Toggle Middle</button>
      </div>
    `;
    stateEl = document.querySelector('#status-bar .state') as HTMLElement;
    lastCommandEl = document.querySelector('#status-bar .last-command') as HTMLElement;
  });

  it('sets listening state text', () => {
    const ui = new UI();
    ui.setState('listening');
    expect(stateEl.textContent).toBe('Listening for commands...');
  });

  it('sets plane_active state text', () => {
    const ui = new UI();
    ui.setState('plane_active');
    expect(stateEl.textContent).toBe('Plane Active');
  });

  it('sets cut_executed state text', () => {
    const ui = new UI();
    ui.setState('cut_executed');
    expect(stateEl.textContent).toBe('Cut Executed');
  });

  it('displays last command text', () => {
    const ui = new UI();
    ui.setLastCommand('Heard: "up"');
    expect(lastCommandEl.textContent).toBe('Heard: "up"');
  });
});
