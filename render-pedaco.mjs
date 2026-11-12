// Roda NA NUVEM (GitHub Actions): renderiza um pedaço de quadros do bundle já montado, com o áudio em PCM (sem emenda audível).
// node render-pedaco.mjs <i> <partes> <total de quadros>
import { cpus } from 'node:os';
import { resolve } from 'node:path';
import { renderMedia, selectComposition } from '@remotion/renderer';
const [i, partes, total] = process.argv.slice(2).map(Number), passo = Math.ceil(total / partes), a = i * passo, b = Math.min(total, (i + 1) * passo) - 1;
if (a > b) { console.log('nada para este pedaço'); process.exit(0); }
const serveUrl = resolve('bundle');
const composition = await selectComposition({ serveUrl, id: 'Capitulo', inputProps: { marca: false }, chromiumOptions: { headless: true } });
const t0 = Date.now();
await renderMedia({ composition, serveUrl, inputProps: { marca: false }, codec: 'h264-mkv', audioCodec: 'pcm-16', frameRange: [a, b], outputLocation: resolve('saida', `p-${String(i).padStart(3, '0')}.mkv`),
  imageFormat: 'jpeg', jpegQuality: 94, pixelFormat: 'yuv420p', concurrency: cpus().length, logLevel: 'error', chromiumOptions: { headless: true } });
console.log(`pedaço ${i}: quadros ${a}-${b} em ${((Date.now() - t0) / 1000).toFixed(0)} s`);
