import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// base: './' 让构建产物可部署在任意子路径（如 GitHub Pages）
export default defineConfig({
  base: './',
  plugins: [svelte()],
  server: { port: 5173, open: false },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1600,
  },
});
