/* ============================================================
   build.mjs — data/ + projects/ + index.html, project.html y about.html
   (las plantillas) → dist/, la web tal cual se publica.
       node build/build.mjs

   La portada, /about/ y una página por proyecto (/p/<slug>/), cada una con
   sus meta (title, description, og:image, canonical) y el contenido en
   catalán ya escrito (los proyectos, el título, los créditos, la galería, el
   texto del about), para que Google y WhatsApp lo lean sin JS. Al cargar, el
   JS de siempre vuelve a pintar lo mismo, y el idioma sigue en ?lang=.
   Sustituye a scripts/generate-project-pages.mjs y a la Action que
   commiteaba p/, about/ y sitemap.xml en el repo.

   Si algo está mal (una coma, un campo mal escrito, una imagen que no está)
   para y dice qué, y no se publica nada: la web se queda como estaba.
   ============================================================ */

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aboutOld, categoriesOld, projectOld, slugsOf } from '../js/lib/house.js';
import { leerJSON, validar } from '../js/lib/validar.js';
import { HTML_LANG_MAP, OG_LOCALE_MAP, TAB_TITLE, projectDescription, projectSocialImagePath } from '../js/lib/site.js';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const OUT = join(ROOT, 'dist');
const at = (...p) => join(ROOT, ...p);
const fail = (msg) => { console.error(`\n✗ ${msg}\n\nNo se ha publicado nada: la web sigue como estaba.\n`); process.exit(1); };
const LANG = 'cat';   // las páginas se escriben en el idioma por defecto (sin ?lang)

/* ---------- leer y revisar ---------- */

const read = (rel) => {
  if (!existsSync(at(rel))) fail(`no encuentro ${rel}`);
  try { return leerJSON(readFileSync(at(rel), 'utf8'), rel); } catch (e) { fail(e.message); }
};
const schema = (t) => JSON.parse(readFileSync(at('schema', `${t}.json`), 'utf8'));
const site = read('data/site.json');
const about = read('data/about.json');
const errors = [...validar(site, schema('site'), 'data/site.json'), ...validar(about, schema('about'), 'data/about.json')];
const slugs = errors.length ? [] : slugsOf(site);
const projects = {};
for (const slug of slugs) {
  const rel = `projects/${slug}/project.json`;
  if (projects[slug]) { errors.push(`data/site.json: "${slug}" está dos veces en "lists"`); continue; }
  if (!existsSync(at(rel))) { errors.push(`data/site.json: "lists" dice "${slug}", y no hay ningún ${rel}`); continue; }
  const p = projects[slug] = read(rel);
  const before = errors.length;
  errors.push(...validar(p, schema('project'), rel));
  if (errors.length > before) continue;
  if (!site.categories[p.category]) errors.push(`${rel}: la categoría "${p.category}" no está en data/site.json → categories`);
  for (const f of [p.cover, typeof p.main === 'string' ? p.main : null, ...p.photos].filter(Boolean)) {
    if (!existsSync(at('projects', slug, 'img', f))) errors.push(`${rel}: no encuentro projects/${slug}/img/${f}`);
  }
}
if (errors.length) fail(errors.join('\n✗ '));
const categories = categoriesOld(site);

/* Dónde se publica, según dónde se construye (JAMstack, patrones §5): en la
   Action de GitHub (nuestra copia), meowrhino.github.io/<repo>/ y sin
   indexar; en cualquier otro sitio (Cloudflare, en la copia de Paula), la
   raíz con el dominio de site.json → "url", y se indexa si lo hay. */
const github = process.env.GITHUB_ACTIONS === 'true';
const [owner, repo] = (process.env.GITHUB_REPOSITORY || '/').split('/');
const BASE = github ? `/${repo}` : '';
const SITE = github ? `https://${owner}.github.io${BASE}` : String(site.url || '').replace(/\/+$/, '');
const INDEX = !github && !!site.url;

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const enc = (p) => p.split('/').map(encodeURIComponent).join('/');
const abs = (p) => (/^https?:\/\//i.test(p) ? p : `${SITE}/${enc(p)}`);

/* ---------- la imagen al compartir, con sharp ---------- */

let sharp = null;
try { sharp = (await import('sharp')).default; } catch (e) {
  console.warn(`⚠ sin sharp (${e.code || e.message}): al compartir sale la foto tal cual. Se arregla con: npm ci`);
}
const ogs = new Map();
for (const slug of slugs) {
  const src = projectSocialImagePath(projectOld(slug, projects[slug]), slug);
  if (!sharp || /^https?:/.test(src) || !existsSync(at(src))) continue;
  const cached = at('.cache', 'og', `${slug}.jpg`);
  try {
    if (!(existsSync(cached) && statSync(cached).mtimeMs >= statSync(at(src)).mtimeMs)) {
      mkdirSync(dirname(cached), { recursive: true });
      await sharp(at(src)).resize(1200, 630, { fit: 'cover' }).flatten({ background: '#ffffff' })
        .jpeg({ quality: 85, mozjpeg: true }).toFile(cached);
    }
    ogs.set(slug, cached);
  } catch (e) {
    console.warn(`⚠ ${src}: sharp no la puede leer (${e.message}); al compartir sale tal cual`);
  }
}

/* ---------- las páginas ---------- */

function swap(html, find, replace, file) {
  if (!find.test(html)) fail(`no encuentro ${find} en ${file}: el build lo necesita para escribir las páginas.`);
  return html.replace(find, replace);
}
// el content="" del <meta> que lleva `marker` (un id o un name)
const meta = (html, marker, value, file) => swap(html,
  new RegExp(`(<meta[^>]*${marker}[^>]*content=")[^"]*(")|(<meta[^>]*content=")[^"]*("[^>]*${marker})`),
  (_, a, b, c, d) => (a ? `${a}${esc(value)}${b}` : `${c}${esc(value)}${d}`), file);

function common(html, file, { url, base, image }) {
  html = swap(html, /<html lang="[^"]*">/, `<html lang="${HTML_LANG_MAP[LANG]}" data-built>`, file);
  if (base) html = swap(html, /<meta charset="utf-8" \/>/, `<meta charset="utf-8" />\n    <base href="${base}" />`, file);
  html = swap(html, /(<link rel="canonical" id="canonical-link" href=")[^"]*(")/, `$1${esc(url)}$2`, file);
  html = meta(html, 'id="og-url"', url, file);
  if (image) { html = meta(html, 'id="og-image"', image, file); html = meta(html, 'id="twitter-image"', image, file); }
  // robots: en github.io, o sin dominio, no se indexa
  return INDEX ? html : html.replace(/(<meta charset="utf-8" \/>)/, '$1\n    <meta name="robots" content="noindex" />');
}

const t = (v) => (v && typeof v === 'object' ? v[LANG] ?? v.cat ?? '' : v ?? '');

function projectPage(slug) {
  const file = 'project.html';
  const p = projectOld(slug, projects[slug]);
  const category = categories.home_categories[p.categoria];
  const description = projectDescription(p.titulo, category?.[`name_${LANG}`] || p.categoria, LANG);
  const url = `${SITE}/p/${encodeURIComponent(slug)}/`;
  const image = ogs.has(slug) ? `${SITE}/og/${slug}.jpg` : abs(projectSocialImagePath(p, slug));
  let html = common(readFileSync(at(file), 'utf8'), file, { url, base: '../../', image });
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(TAB_TITLE)}</title>`);
  for (const [m, v] of [['id="meta-description"', description], ['id="og-title"', TAB_TITLE], ['id="og-description"', description],
    ['id="og-locale"', OG_LOCALE_MAP[LANG]], ['id="twitter-title"', TAB_TITLE], ['id="twitter-description"', description]]) html = meta(html, m, v, file);
  html = html.replace(/(<script type="application\/ld\+json" id="project-schema">)[\s\S]*?(<\/script>)/, `$1${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'CreativeWork', name: p.titulo, description, url, inLanguage: HTML_LANG_MAP[LANG],
    genre: category?.[`name_${LANG}`], image,
    creator: { '@type': 'Person', name: 'Paula Barjau', jobTitle: 'Maquilladora y hairstylist', address: { '@type': 'PostalAddress', addressLocality: 'Barcelona', addressCountry: 'ES' } },
  }).replace(/</g, '\\u003c')}$2`);
  // el contenido, como lo pinta js/project.js (que vacía los contenedores y vuelve a pintar)
  const credits = p.creditos.map((c) => (c.texto
    ? `<div class="credit-extra">${esc(t(c.texto))}</div>`
    : `<div class="credit-item"><span class="credit-title">${esc(t(c.titulo))}</span> <span class="credit-name">${c.link
      ? `<a href="${esc(c.link)}" target="_blank" rel="noopener noreferrer">${esc(c.nombre)}</a>` : esc(c.nombre)}</span></div>`)).join('');
  const main = typeof p.imatge_principal === 'string' ? [p.imatge_principal] : [];
  const photos = [...main, ...p.galeria[0].url].map((f) => `<img src="projects/${enc(slug)}/img/${enc(f)}" alt="${esc(p.titulo)}" loading="lazy">`).join('');
  html = swap(html, /<h1 id="project-title">[^<]*<\/h1>/, `<h1 id="project-title">${esc(p.titulo)}</h1>`, file);
  html = swap(html, /(<div id="credits-container">)[\s\S]*?(<\/div>)/, `$1${credits}$2`, file);
  return swap(html, /(<div id="gallery-container">)[\s\S]*?(<\/div>)/, `$1${photos}$2`, file);
}

function aboutPage() {
  const file = 'about.html';
  const a = aboutOld(about);
  let html = common(readFileSync(at(file), 'utf8'), file, { url: `${SITE}/about/`, base: '../' });
  html = swap(html, /<h1 id="about-title">[^<]*<\/h1>/, `<h1 id="about-title">${esc(t(a.title))}</h1>`, file);
  html = swap(html, /<div id="about-text" class="about-text"><\/div>/, `<div id="about-text" class="about-text">${(a.paragraphs[LANG] || []).map((x) => `<p>${esc(x)}</p>`).join('')}</div>`, file);
  return swap(html, /<div id="about-contact" class="about-contact"><\/div>/, `<div id="about-contact" class="about-contact">${a.contact.map((c) =>
    `<div class="about-contact-line">${c.link ? `<a href="${esc(c.link)}">${esc(c.text)}</a>` : esc(c.text)}</div>`).join('')}</div>`, file);
}

function homePage() {
  const file = 'index.html';
  let html = common(readFileSync(at(file), 'utf8'), file, { url: `${SITE}/` });
  html = swap(html, /<a id="about-link" href="about.html">/, '<a id="about-link" href="about/">', file);
  // los proyectos, para quien no ejecuta JS (main.js vacía el contenedor y pinta las tarjetas)
  const cards = slugs.map((s) => `<a href="p/${encodeURIComponent(s)}/">${esc(projects[s].title)}</a>`).join('\n            ');
  return swap(html, /(<section id="projects-container">)[\s\S]*?(<\/section>)/, `$1\n            ${cards}\n        $2`, file);
}

// una dirección vieja que lleva a la nueva (GitHub Pages no hace 301)
const redirect = (to) => `<!DOCTYPE html>
<html lang="ca"><head><meta charset="utf-8" /><meta name="robots" content="noindex" />
<link rel="canonical" href="${SITE}/${to}" /><meta http-equiv="refresh" content="0; url=../../${to}" /><title>${TAB_TITLE}</title></head>
<body><a href="../../${to}">${SITE}/${to}</a></body></html>
`;

/* ---------- escribir dist/ ---------- */

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const f of ['css', 'js', 'fonts', 'data', 'projects', '404.html']) cpSync(at(f), join(OUT, f), { recursive: true, filter: (x) => !x.endsWith('.DS_Store') });
// project.html y about.html siguen valiendo (?slug=, enlaces viejos), ya construidas
for (const f of ['project.html', 'about.html']) writeFileSync(join(OUT, f), readFileSync(at(f), 'utf8').replace('<html lang="ca">', '<html lang="ca" data-built>'));
writeFileSync(join(OUT, 'index.html'), homePage());
mkdirSync(join(OUT, 'about'), { recursive: true });
writeFileSync(join(OUT, 'about', 'index.html'), aboutPage());
mkdirSync(join(OUT, 'og'), { recursive: true });
for (const [slug, cached] of ogs) cpSync(cached, join(OUT, 'og', `${slug}.jpg`));
for (const slug of slugs) {
  mkdirSync(join(OUT, 'p', slug), { recursive: true });
  writeFileSync(join(OUT, 'p', slug, 'index.html'), projectPage(slug));
}
// las de antes del 2026-10-18 (la ñ fuera del nombre de la carpeta)
for (const [old, now] of [['siMurieraMañana', 'siMurieraManana']]) {
  if (!projects[now]) continue;
  mkdirSync(join(OUT, 'p', old), { recursive: true });
  writeFileSync(join(OUT, 'p', old, 'index.html'), redirect(`p/${now}/`));
}
const urls = [`${SITE}/`, `${SITE}/about/`, ...slugs.map((s) => `${SITE}/p/${encodeURIComponent(s)}/`)];
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(OUT, 'robots.txt'), INDEX ? `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
writeFileSync(join(OUT, '.nojekyll'), '');

console.log(`✓ dist/: portada, about y ${slugs.length} proyectos${INDEX ? ` · se indexa (${SITE})` : ' · sin indexar'}`);
