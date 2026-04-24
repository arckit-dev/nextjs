import { readFileSync, writeFileSync } from 'node:fs';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    client: 'src/client/index.ts',
    i18n: 'src/i18n/index.ts'
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  outDir: 'dist',
  target: 'es2022',
  async onSuccess() {
    for (const file of ['dist/client.js', 'dist/client.cjs']) {
      const content = readFileSync(file, 'utf-8');
      if (!content.startsWith('"use client"')) {
        writeFileSync(file, `"use client";\n${content}`);
      }
    }
  }
});
