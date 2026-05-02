import { describe, it, expect } from 'vitest';
import { validateCommand } from '../stateMachine';

const defaultContext = { hasBone: true, hasProximal: true, hasDistal: true, hasMiddle: false, twoCutMode: false };
const twoCutContext = { ...defaultContext, twoCutMode: true };

describe('validateCommand', () => {
  describe('LISTENING state', () => {
    it('allows up and transitions to plane_active', () => {
      const result = validateCommand('listening', 'up', defaultContext);
      expect(result).toEqual({ allowed: true, newState: 'plane_active' });
    });

    it('allows down and transitions to plane_active', () => {
      const result = validateCommand('listening', 'down', defaultContext);
      expect(result).toEqual({ allowed: true, newState: 'plane_active' });
    });

    it('allows cut when bone exists', () => {
      const result = validateCommand('listening', 'cut', defaultContext);
      expect(result).toEqual({ allowed: true, newState: 'cut_executed' });
    });

    it('rejects cut when bone is missing', () => {
      const result = validateCommand('listening', 'cut', { ...defaultContext, hasBone: false });
      expect(result.allowed).toBe(false);
    });

    it('rejects toggle_proximal', () => {
      const result = validateCommand('listening', 'toggle_proximal', defaultContext);
      expect(result.allowed).toBe(false);
    });

    it('rejects toggle_distal', () => {
      const result = validateCommand('listening', 'toggle_distal', defaultContext);
      expect(result.allowed).toBe(false);
    });
  });

  describe('PLANE_ACTIVE state', () => {
    it('allows up and stays plane_active', () => {
      const result = validateCommand('plane_active', 'up', defaultContext);
      expect(result).toEqual({ allowed: true, newState: 'plane_active' });
    });

    it('allows down and stays plane_active', () => {
      const result = validateCommand('plane_active', 'down', defaultContext);
      expect(result).toEqual({ allowed: true, newState: 'plane_active' });
    });

    it('allows cut and transitions to cut_executed', () => {
      const result = validateCommand('plane_active', 'cut', defaultContext);
      expect(result).toEqual({ allowed: true, newState: 'cut_executed' });
    });

    it('rejects cut when bone is missing', () => {
      const result = validateCommand('plane_active', 'cut', { ...defaultContext, hasBone: false });
      expect(result.allowed).toBe(false);
    });

    it('rejects toggle_proximal', () => {
      const result = validateCommand('plane_active', 'toggle_proximal', defaultContext);
      expect(result.allowed).toBe(false);
    });

    it('rejects toggle_distal', () => {
      const result = validateCommand('plane_active', 'toggle_distal', defaultContext);
      expect(result.allowed).toBe(false);
    });
  });

  describe('CUT_EXECUTED state', () => {
    it('rejects up', () => {
      const result = validateCommand('cut_executed', 'up', defaultContext);
      expect(result.allowed).toBe(false);
    });

    it('rejects down', () => {
      const result = validateCommand('cut_executed', 'down', defaultContext);
      expect(result.allowed).toBe(false);
    });

    it('rejects cut', () => {
      const result = validateCommand('cut_executed', 'cut', defaultContext);
      expect(result.allowed).toBe(false);
    });

    it('allows toggle_proximal when proximal exists', () => {
      const result = validateCommand('cut_executed', 'toggle_proximal', defaultContext);
      expect(result).toEqual({ allowed: true, newState: 'cut_executed' });
    });

    it('rejects toggle_proximal when proximal is gone', () => {
      const result = validateCommand('cut_executed', 'toggle_proximal', { ...defaultContext, hasProximal: false });
      expect(result.allowed).toBe(false);
    });

    it('allows toggle_distal when distal exists', () => {
      const result = validateCommand('cut_executed', 'toggle_distal', defaultContext);
      expect(result).toEqual({ allowed: true, newState: 'cut_executed' });
    });

    it('rejects toggle_distal when distal is gone', () => {
      const result = validateCommand('cut_executed', 'toggle_distal', { ...defaultContext, hasDistal: false });
      expect(result.allowed).toBe(false);
    });

    it('allows toggle_middle when middle exists', () => {
      const ctx = { ...defaultContext, hasMiddle: true };
      const result = validateCommand('cut_executed', 'toggle_middle', ctx);
      expect(result).toEqual({ allowed: true, newState: 'cut_executed' });
    });

    it('rejects toggle_middle when middle is gone', () => {
      const result = validateCommand('cut_executed', 'toggle_middle', defaultContext);
      expect(result.allowed).toBe(false);
    });
  });

  describe('TWO-CUT mode', () => {
    it('first cut transitions to first_cut_done', () => {
      const result = validateCommand('plane_active', 'cut', twoCutContext);
      expect(result).toEqual({ allowed: true, newState: 'first_cut_done' });
    });

    it('allows up/down in first_cut_done state', () => {
      expect(validateCommand('first_cut_done', 'up', twoCutContext)).toEqual({ allowed: true, newState: 'first_cut_done' });
      expect(validateCommand('first_cut_done', 'down', twoCutContext)).toEqual({ allowed: true, newState: 'first_cut_done' });
    });

    it('second cut transitions to cut_executed', () => {
      const result = validateCommand('first_cut_done', 'cut', twoCutContext);
      expect(result).toEqual({ allowed: true, newState: 'cut_executed' });
    });

    it('rejects toggle commands in first_cut_done state', () => {
      expect(validateCommand('first_cut_done', 'toggle_proximal', twoCutContext).allowed).toBe(false);
      expect(validateCommand('first_cut_done', 'toggle_distal', twoCutContext).allowed).toBe(false);
    });
  });
});
