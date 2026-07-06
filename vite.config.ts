import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    // Base public path. Defaults to "/" (custom domain / root deploy).
    // Set BASE_PATH=/goriasno/ when deploying to a project subpath such as
    // GitHub Pages (lamantinX.github.io/goriasno/). Trailing slash required.
    base: process.env.BASE_PATH ?? '/',
    plugins: [react(), tailwindcss()],
    // Пререндер '/' в статический HTML при `vite-react-ssg build`.
    ssgOptions: {
      script: 'async' as const,
      format: 'esm' as const,
      // '/anthracite' → dist/anthracite/index.html (совместимо с nginx try_files $uri $uri/).
      dirStyle: 'nested' as const,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        }
      }
    },
  };
});
