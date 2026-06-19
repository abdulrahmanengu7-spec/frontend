import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages project URL: https://abdulrahmanengu7-spec.github.io/frontend/
// Agar repository name change ho to base ko /new-repo-name/ kar dena.
export default defineConfig({
  base: '/frontend/',
  plugins: [react()],
});
