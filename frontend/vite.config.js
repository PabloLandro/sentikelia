import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
	  https: {
		key: fs.readFileSync('./certs/server.key'),
		cert: fs.readFileSync('./certs/server.crt')
	  },
	  proxy: {
		'/api': {
			target: 'https://serverkelia.landro.pro', // Replace with your FastAPI server's address
			changeOrigin: true,
			rewrite: (path) => path.replace(/^\/api/, ''), // Remove '/api' prefix when forwarding
			secure: false,
      		},
	  },
  },
  preview: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [react()],
})
