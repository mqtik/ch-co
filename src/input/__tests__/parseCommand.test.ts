import { describe, it, expect } from 'vitest';
import { parseCommand } from '../parseCommand';

describe('parseCommand', () => {
  it('recognizes "up"', () => {
    expect(parseCommand('up')).toBe('up');
  });

  it('recognizes "down"', () => {
    expect(parseCommand('down')).toBe('down');
  });

  it('recognizes "cut"', () => {
    expect(parseCommand('cut')).toBe('cut');
  });

  it('recognizes "toggle proximal"', () => {
    expect(parseCommand('toggle proximal')).toBe('toggle_proximal');
  });

  it('recognizes "toggle distal"', () => {
    expect(parseCommand('toggle distal')).toBe('toggle_distal');
  });

  it('recognizes "toggle middle"', () => {
    expect(parseCommand('toggle middle')).toBe('toggle_middle');
  });

  it('is case insensitive', () => {
    expect(parseCommand('CUT')).toBe('cut');
    expect(parseCommand('Toggle Proximal')).toBe('toggle_proximal');
  });

  it('handles extra words', () => {
    expect(parseCommand('please move up now')).toBe('up');
    expect(parseCommand('go ahead and cut it')).toBe('cut');
  });

  it('returns null for unrecognized input', () => {
    expect(parseCommand('hello world')).toBeNull();
    expect(parseCommand('')).toBeNull();
  });

  it('handles "toggle" without target', () => {
    expect(parseCommand('toggle')).toBeNull();
  });

  it('handles compound matches correctly', () => {
    expect(parseCommand('toggle the distal segment')).toBe('toggle_distal');
  });

  it('recognizes "remove proximal"', () => {
    expect(parseCommand('remove proximal')).toBe('toggle_proximal');
  });

  it('recognizes "remove distal"', () => {
    expect(parseCommand('remove distal')).toBe('toggle_distal');
  });

  it('recognizes "remove middle"', () => {
    expect(parseCommand('remove middle')).toBe('toggle_middle');
  });
});
