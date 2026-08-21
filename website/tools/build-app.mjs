import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const landing = join(root, 'app', 'landing');
const demo = join(root, 'app', 'demo');
const business = join(root, 'app', 'business');
const dist = join(root, 'build');
const pages = join(dist, 'site');
const demoOut = join(pages, 'demo');

const [landingHtml, landingCss, landingJs, demoHtml, demoCss, demoJs, businessHtml] = await Promise.all([
  readFile(join(landing, 'index.html'), 'utf8'),
  readFile(join(landing, 'styles.css'), 'utf8'),
  readFile(join(landing, 'app.js'), 'utf8'),
  readFile(join(demo, 'index.html'), 'utf8'),
  readFile(join(demo, 'styles.css'), 'utf8'),
  readFile(join(demo, 'app.js'), 'utf8'),
  readFile(join(business, 'revenue-model.html'), 'utf8'),
]);

await rm(dist, { recursive: true, force: true });
await mkdir(pages, { recursive: true });
await mkdir(demoOut, { recursive: true });

await Promise.all([
  writeFile(join(pages, 'index.html'), landingHtml),
  writeFile(join(pages, 'styles.css'), landingCss),
  writeFile(join(pages, 'app.js'), landingJs),
  writeFile(join(pages, 'revenue-model.html'), businessHtml),
  writeFile(join(demoOut, 'index.html'), demoHtml),
  writeFile(join(demoOut, 'styles.css'), demoCss),
  writeFile(join(demoOut, 'app.js'), demoJs),
  writeFile(join(pages, '.nojekyll'), ''),
]);

console.log('Built commercial site: landing (root) + embedded demo (/demo/) + business model.');
