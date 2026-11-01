// Versiona recursos por contenido antes de publicar; no se ejecuta en el navegador.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, extname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const processed = new Map();
const visiting = new Set();
const changed = [];
const assetTypes = new Set(['.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.ico', '.woff2']);

function version(url, owner) {
  if (/^(?:[a-z]+:|\/\/|#)/i.test(url)) return url;
  const [path, fragment] = url.split('#', 2);
  const [pathname, query = ''] = path.split('?', 2);
  if (!assetTypes.has(extname(pathname))) return url;
  const target = pathname.startsWith('/') ? resolve(root, '.' + pathname) : resolve(dirname(owner), pathname);
  if (!target.startsWith(root + sep) || !existsSync(target)) throw new Error(`Recurso inválido: ${url} en ${relative(root, owner)}`);
  const hash = processFile(target);
  const params = new URLSearchParams(query);
  params.set('v', hash);
  return `${pathname}?${params}${fragment === undefined ? '' : '#' + fragment}`;
}

function processFile(file) {
  if (processed.has(file)) return processed.get(file);
  if (visiting.has(file)) throw new Error(`Dependencia circular: ${relative(root, file)}`);
  visiting.add(file);
  const original = readFileSync(file);
  const ext = extname(file);
  let result = original;
  if (['.html', '.js', '.css'].includes(ext)) {
    let text = original.toString('utf8');
    if (ext === '.html') text = text.replace(/\b(src|href)=(['"])([^'"<>]+)\2/g, (all, attr, quote, url) => `${attr}=${quote}${version(url, file)}${quote}`);
    if (ext === '.js') text = text.replace(/(\bfrom\s*|\bimport\s*)(['"])([^'"\n]+)\2/g, (all, prefix, quote, url) => `${prefix}${quote}${version(url, file)}${quote}`);
    if (ext === '.css') text = text.replace(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/g, (all, quote, url) => `url(${quote}${version(url, file)}${quote})`);
    result = Buffer.from(text);
    if (!result.equals(original)) {
      changed.push(relative(root, file));
      if (!check) writeFileSync(file, result);
    }
  }
  // Git puede convertir LF/CRLF en Windows sin cambiar el recurso funcional.
  const hashInput = ['.html', '.js', '.css', '.svg'].includes(ext)
    ? result.toString('utf8').replace(/\r\n/g, '\n') : result;
  const hash = createHash('sha256').update(hashInput).digest('hex').slice(0, 12);
  visiting.delete(file);
  processed.set(file, hash);
  return hash;
}

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'tools', 'data'].includes(entry.name)) continue;
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (extname(path) === '.html') processFile(path);
  }
}
walk(root);
console.log(changed.length ? `${check ? 'Versiones pendientes' : 'Versionados'}: ${changed.join(', ')}` : 'Versiones de recursos al día.');
if (check && changed.length) process.exitCode = 1;
