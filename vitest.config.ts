import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node', // arba 'jsdom', jei testuojate React komponentus
    globals: true,
    setupFiles: [],
    // 1. Sprendžiame "next/server" importo problemą
    alias: {
      'next/server': 'next/server.js',
    },
    // 2. Nurodome, kad next-auth ir next būtų apdorojami kaip išoriniai (external)
    server: {
      deps: {
        inline: ['next-auth'], // Leidžiame Vitest apdoroti next-auth
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
