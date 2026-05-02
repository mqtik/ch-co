import type { CommandCallback } from '../types';
import { parseCommand } from './parseCommand';

export class VoiceController {
  private callback: CommandCallback | null = null;
  private active = false;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly Ctor: (new () => SpeechRecognition) | null;

  constructor() {
    this.Ctor = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  start(): void {
    if (!this.Ctor) return;
    this.active = true;

    const recognition = new this.Ctor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (!result.isFinal) {
          const cmd = parseCommand(transcript);
          if (cmd && this.callback) { this.callback(cmd); recognition.abort(); return; }
          continue;
        }
        const cmd = parseCommand(transcript);
        if (cmd && this.callback) this.callback(cmd);
      }
    };

    recognition.onend = () => {
      if (this.active && !this.restartTimer) {
        this.restartTimer = setTimeout(() => {
          this.restartTimer = null;
          if (this.active) this.start();
        }, 300);
      }
    };

    recognition.onerror = (event: Event & { error: string }) => {
      if ((event as any).error === 'not-allowed') this.active = false;
    };

    recognition.start();
  }

  stop(): void {
    this.active = false;
    if (this.restartTimer) { clearTimeout(this.restartTimer); this.restartTimer = null; }
  }

  onCommand(cb: CommandCallback): void { this.callback = cb; }
  isSupported(): boolean { return this.Ctor !== null; }
}
