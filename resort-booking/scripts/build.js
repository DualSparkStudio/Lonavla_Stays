import { build } from 'vite';
import { runPrerender } from './prerender.js';

async function main() {
  console.log('Building project with Vite...');
  await build();
  console.log('Vite build successful. Starting static pre-rendering...');
  runPrerender();
  console.log('All pages pre-rendered successfully!');
}

main().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
