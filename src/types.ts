export type AppState = 'loading' | 'listening' | 'plane_active' | 'first_cut_done' | 'cut_executed';

export type VoiceCommand = 'up' | 'down' | 'cut' | 'toggle_proximal' | 'toggle_distal' | 'toggle_middle';

export type CommandCallback = (command: VoiceCommand) => void;
