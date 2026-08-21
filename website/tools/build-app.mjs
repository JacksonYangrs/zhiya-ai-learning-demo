import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const source = join(root, 'app', 'demo');
const business = join(root, 'app', 'business');
const dist = join(root, 'build');
const server = join(dist, 'server');
const pages = join(dist, 'site');

const [html, css, javascript, businessHtml] = await Promise.all([
  readFile(join(source, 'index.html'), 'utf8'),
  readFile(join(source, 'styles.css'), 'utf8'),
  readFile(join(source, 'app.js'), 'utf8'),
  readFile(join(business, 'revenue-model.html'), 'utf8'),
]);

const assets = {
  '/': { body: html, type: 'text/html; charset=utf-8' },
  '/index.html': { body: html, type: 'text/html; charset=utf-8' },
  '/styles.css': { body: css, type: 'text/css; charset=utf-8' },
  '/app.js': { body: javascript, type: 'application/javascript; charset=utf-8' },
  '/revenue-model.html': { body: businessHtml, type: 'text/html; charset=utf-8' },
};

const worker = `const assets = ${JSON.stringify(assets)};

export default {
  async fetch(request) {
    const pathname = new URL(request.url).pathname;
    const asset = assets[pathname];
    if (!asset) return new Response('Not found', { status: 404 });
    return new Response(asset.body, {
      headers: {
        'content-type': asset.type,
        'cache-control': pathname === '/' || pathname === '/index.html' ? 'no-cache' : 'public, max-age=3600',
        'x-content-type-options': 'nosniff'
      }
    });
  }
};
`;

await rm(dist, { recursive: true, force: true });
await mkdir(server, { recursive: true });
await writeFile(join(server, 'index.js'), worker);
await rm(pages, { recursive: true, force: true });
await mkdir(pages, { recursive: true });
await Promise.all([
  writeFile(join(pages, 'index.html'), html),
  writeFile(join(pages, 'styles.css'), css),
  writeFile(join(pages, 'app.js'), javascript),
  writeFile(join(pages, 'revenue-model.html'), businessHtml),
  writeFile(join(pages, '.nojekyll'), ''),
]);
console.log('Built mobile app demo + business model page for deployment.');
