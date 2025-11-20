import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This safely injects the API key from the build environment into the browser code
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
});