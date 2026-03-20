import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { existsSync } from 'node:fs';

const staticTargets = [
  { src: 'css', dest: '' },
  { src: 'js', dest: '' },
  { src: 'images', dest: '' },
  { src: 'data', dest: '' },
  { src: 'config.js', dest: '' },
  { src: 'config.example.js', dest: '' },
  { src: 'config.local.example.js', dest: '' }
];

if (existsSync('config.local.js')) {
  staticTargets.push({ src: 'config.local.js', dest: '' });
}

export default defineConfig({
  base: './',
  plugins: [vue(), viteStaticCopy({ targets: staticTargets })],
  server: {
    port: 5173,
    open: true
  },
  preview: {
    port: 4173
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets'
  }
});
