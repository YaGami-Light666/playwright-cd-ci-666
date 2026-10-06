import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Port 4174 on purpose: the week 10 booking app owns 4173, so both teaching
// apps can run at the same time.
export default defineConfig({
  plugins: [vue()],
  server: { port: 4174, strictPort: true },
  preview: { port: 4174, strictPort: true },
});
