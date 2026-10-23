/* Build-time prerenderer for ToolNest.
   Runs after `vite build` (client) and `vite build --ssr` (server bundle).
   For every URL in public/sitemap.xml it renders the route with
   react-dom/server, swaps the page's real title / description / canonical /
   OG + Twitter tags into the built index.html, injects the collected
   JSON-LD, fills #root with the rendered markup, and writes a static
   dist/<path>/index.html. Vercel serves those files ahead of the SPA
   rewrite, so crawlers and no-JS visitors get full content while the
   client bundle hydrates the same markup for real users. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');

const { render } = await import(join(root, 'dist-server', 'entry-server.js'));

const sitemap = readFileSync(join(root, 'public', 'sitemap.xml'), 'utf8');
const routes = [...sitemap.matchAll(/<loc>https:\/\/toolnest-sage\.vercel\.app(\/[^<]*)<\/loc>/g)]
  .map((m) => (m[1] === '' ? '/' : m[1]));

const template = readFileSync(join(distDir, 'index.html'), 'utf8');

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;');

function setAttr(html, regex, value) {
  if (regex.test(html)) return html.replace(regex, (m, pre, post) => pre + esc(value) + post);
  return html;
}

function buildPage(route) {
  const { html: appHtml, head } = render(route);
  if (!head || !head.seo) throw new Error(`No SEO collected for ${route}`);
  const { seo, jsonLd } = head;
  let out = template;

  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(seo.title)}</title>`);
  out = setAttr(out, /(<meta name="description" content=")[^"]*(")/, seo.description);
  out = setAttr(out, /(<link rel="canonical" href=")[^"]*(")/, `https://toolnest-sage.vercel.app${seo.path === '/' ? '/' : seo.path}`);
  out = setAttr(out, /(<meta property="og:title" content=")[^"]*(")/, seo.title);
  out = setAttr(out, /(<meta property="og:description" content=")[^"]*(")/, seo.description);
  out = setAttr(out, /(<meta property="og:url" content=")[^"]*(")/, `https://toolnest-sage.vercel.app${seo.path}`);
  out = setAttr(out, /(<meta name="twitter:title" content=")[^"]*(")/, seo.title);
  out = setAttr(out, /(<meta name="twitter:description" content=")[^"]*(")/, seo.description);
  if (seo.robots) {
    out = setAttr(out, /(<meta name="robots" content=")[^"]*(")/, seo.robots);
  }

  const ldScripts = jsonLd
    .map(({ id, data }) => `<script type="application/ld+json" id="${id}">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`)
    .join('\n    ');
  if (ldScripts) out = out.replace('</head>', `    ${ldScripts}\n  </head>`);

  if (!out.includes('<div id="root"></div>')) throw new Error('Template #root div not found');
  out = out.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
  return { out, seo, appHtml };
}

let failures = 0;
for (const route of routes) {
  try {
    const { out, seo, appHtml } = buildPage(route);
    const file = route === '/' ? join(distDir, 'index.html') : join(distDir, route.slice(1), 'index.html');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, out);
    const hasH1 = /<h1[\s>]/.test(appHtml);
    console.log(`prerendered ${route}  title=${seo.title.length}ch  h1=${hasH1 ? 'yes' : 'NO'}  ${(out.length / 1024).toFixed(1)}KB`);
    if (!hasH1) failures += 1;
  } catch (e) {
    failures += 1;
    console.error(`FAILED ${route}: ${e.message}`);
  }
}

/* Also emit a static 404 page (noindex) for direct /404 hits; unknown URLs
   still fall through to the SPA, whose NotFound view applies the same
   noindex + its own canonical at runtime. */
try {
  const { out } = buildPage('/404');
  mkdirSync(join(distDir, '404'), { recursive: true });
  writeFileSync(join(distDir, '404', 'index.html'), out);
  console.log('prerendered /404 (noindex)');
} catch (e) {
  failures += 1;
  console.error(`FAILED /404: ${e.message}`);
}

console.log(`\nPrerender complete: ${routes.length} sitemap routes, ${failures} failure(s).`);
if (failures > 0) process.exit(1);
