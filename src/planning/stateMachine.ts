import type { AppState, VoiceCommand } from '../types';

export interface CommandContext {
  hasBone: boolean;
  hasProximal: boolean;
  hasDistal: boolean;
  hasMiddle: boolean;
  twoCutMode: boolean;
}

export interface CommandResult {
  allowed: boolean;
  newState: AppState;
}

export function validateCommand(
  state: AppState,
  cmd: VoiceCommand,
  ctx: CommandContext,
): CommandResult {
  const deny: CommandResult = { allowed: false, newState: state };

  switch (cmd) {
    case 'up':
    case 'down':
      if (state === 'cut_executed') return deny;
      if (state === 'first_cut_done') return { allowed: true, newState: 'first_cut_done' };
      return { allowed: true, newState: 'plane_active' };

    case 'cut':
      if (!ctx.hasBone) return deny;
      if (state === 'first_cut_done') return { allowed: true, newState: 'cut_executed' };
      if (state !== 'plane_active' && state !== 'listening') return deny;
      return { allowed: true, newState: ctx.twoCutMode ? 'first_cut_done' : 'cut_executed' };

    case 'toggle_proximal':
      if (state !== 'cut_executed' || !ctx.hasProximal) return deny;
      return { allowed: true, newState: 'cut_executed' };

    case 'toggle_distal':
      if (state !== 'cut_executed' || !ctx.hasDistal) return deny;
      return { allowed: true, newState: 'cut_executed' };

    case 'toggle_middle':
      if (state !== 'cut_executed' || !ctx.hasMiddle) return deny;
      return { allowed: true, newState: 'cut_executed' };
  }
}
