import path from 'path';
import { defineConfig } from '@lark‑apaas/fullstack‑vite‑preset';

export default defineConfig({
  base: '/lab-of-love/',  // ✅新增这一行，注意前后斜杠不能丢
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
    },
  },
});
