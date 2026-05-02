/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  resolve: {
    conditions: ['import', 'module', 'default'],
  },
  test: {
    environment: 'jsdom',
  },
});
