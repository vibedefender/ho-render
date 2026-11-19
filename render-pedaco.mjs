// Roda NA NUVEM (GitHub Actions): renderiza um pedaço de quadros do bundle já montado, com o áudio em PCM (sem emenda audível).
// node render-pedaco.mjs <i> <partes> <total de quadros>
import { cpus } from 'node:os';
import { resolve } from 'node:path';
import { renderMedia, renderStill, selectComposition, openBrowser } from '@remotion/renderer';
import { readFileSync } from 'node:fs';
const modo = ['audio', 'quadros'].includes(process.argv[5]) ? process.argv[5] : 'video';
const [i, partes, total] = process.argv.slice(2, 5).map(Number), passo = Math.ceil(total / partes), a = i * passo, b = Math.min(total, (i + 1) * passo) - 1;
// 19/11 (Lil: "tudo que usa o PC vai para as máquinas do GitHub"): modo QUADROS — imagens soltas (animatic, oficina); a lista vem em quadros.txt
if (modo === 'quadros') {
  const todos = readFileSync('quadros.txt', 'utf8').split(',').map(Number).filter(n => Number.isFinite(n)), meus = todos.filter((_, k) => k % partes === i);
  if (!meus.length) { console.log('nada para este pedaço'); process.exit(0); }
  const serveUrl = resolve('bundle'), browser = await openBrowser('chrome', { chromiumOptions: { headless: true } });
  const composition = await selectComposition({ serveUrl, id: 'Capitulo', inputProps: { marca: false }, puppeteerInstance: browser }), t0 = Date.now();
  for (const f of meus) await renderStill({ composition, serveUrl, inputProps: { marca: false }, puppeteerInstance: browser, frame: Math.min(f, composition.durationInFrames - 1), output: resolve('saida', `q-${String(f).padStart(5, '0')}.png`) });
  await browser.close({ silent: true }); console.log(`quadros ${i}: ${meus.length} em ${((Date.now() - t0) / 1000).toFixed(0)} s`); process.exit(0);
}
if (a > b) { console.log('nada para este pedaço'); process.exit(0); }
const serveUrl = resolve('bundle');
const composition = await selectComposition({ serveUrl, id: 'Capitulo', inputProps: { marca: false }, chromiumOptions: { headless: true } });
const t0 = Date.now();
if (modo === 'audio') { // 19/11 (dublagem PT-BR): só o áudio deste pedaço, em WAV (emenda sem estalo)
  await renderMedia({ composition, serveUrl, inputProps: { marca: false }, codec: 'wav', frameRange: [a, b], outputLocation: resolve('saida', `p-${String(i).padStart(3, '0')}.wav`), concurrency: cpus().length, logLevel: 'error', chromiumOptions: { headless: true } });
  console.log(`pedaço de áudio ${i}: quadros ${a}-${b} em ${((Date.now() - t0) / 1000).toFixed(0)} s`); process.exit(0);
}
await renderMedia({ composition, serveUrl, inputProps: { marca: false }, codec: 'h264-mkv', audioCodec: 'pcm-16', frameRange: [a, b], outputLocation: resolve('saida', `p-${String(i).padStart(3, '0')}.mkv`),
  imageFormat: 'jpeg', jpegQuality: 94, pixelFormat: 'yuv420p', concurrency: cpus().length, logLevel: 'error', chromiumOptions: { headless: true } });
console.log(`pedaço ${i}: quadros ${a}-${b} em ${((Date.now() - t0) / 1000).toFixed(0)} s`);
