import { defineConfig } from 'vite';
// Browser preview can build before Creator generates its temporary TypeScript config.
export default defineConfig({ esbuild: { tsconfigRaw: { compilerOptions: { target: 'ES2020', experimentalDecorators: true } } } });
