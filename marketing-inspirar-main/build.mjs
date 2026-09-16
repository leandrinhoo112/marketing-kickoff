// Gera um index.html único a partir de src/.
// Uso: node build.mjs [saida.html]   (padrão: dist/index.html)
//      BG=/caminho/foto.jpg node build.mjs index.html   → troca a foto de fundo (sips, macOS)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const src = (...p) => path.join(root, 'src', ...p);
const read = (f) => fs.readFileSync(src(f), 'utf8');
const byPattern = (re) => fs.readdirSync(src()).filter((f) => re.test(f)).sort();

if (process.env.BG) {
  execFileSync('sips', ['-Z', '1920', '-s', 'format', 'jpeg', '-s', 'formatOptions', '70', process.env.BG, '--out', src('bg.jpg')], { stdio: 'ignore' });
}

const DATA = ['data-base.js', 'data-iniciativas.js', 'data-entregas.js', 'data-calendario.js'];
const CSS = byPattern(/^styles\d.*\.css$/);
const APP = byPattern(/^app\d.*\.js$/);
const dataUri = (file, type) => `data:${type};base64,${fs.readFileSync(src(file)).toString('base64')}`;

const out = read('template.html')
  .replace('/*__CSS__*/', () => CSS.map(read).join('\n'))
  .replace('/*__DATA__*/', () => DATA.map(read).join('\n'))
  .replace('/*__APP__*/', () => APP.map(read).join('\n'))
  .replaceAll('__LOGO__', dataUri('logo.webp', 'image/webp'))
  .replaceAll('__BG__', dataUri('bg.jpg', 'image/jpeg'));

const dest = path.resolve(process.argv[2] || path.join(root, 'dist', 'index.html'));
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);
console.log(`gerado ${dest} (${(out.length / 1024).toFixed(0)} KB) · css: ${CSS.join(', ')} · app: ${APP.join(', ')}`);
