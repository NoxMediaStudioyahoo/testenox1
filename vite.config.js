import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0'
  },
  preview: {
    allowedHosts: ['noxv1.onrender.com', 'noxmedia.onrender.com']
  }
});
