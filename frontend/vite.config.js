import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The backend only allows browser requests from http://localhost:5173 and :3000 (CORS),
// so keep the dev server on 5173 and fail loudly if that port is taken.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
