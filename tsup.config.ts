import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  external: ['@almadar/server', 'hono', '@hono/zod-validator', 'firebase-admin', '@almadar-io/agent'],
});
