#!/usr/bin/env node
// Genera una página estática p/<slug>/index.html por proyecto, más el sitemap.
//
// Por qué: los buscadores y los previsualizadores de enlaces (WhatsApp,
// Twitter, Slack) no ejecutan JS, así que con project.html?slug=X todos veían
// las mismas meta genéricas. Cada página generada lleva sus propias meta ya
// escritas en el HTML, y de paso la URL queda limpia: /p/torito/
//
// Lleva <base href="../../"> para que las rutas relativas (css, js, fetch de
// los json y las imágenes) sigan resolviendo desde la raíz del sitio.
//
// Ejecutar después de añadir, quitar o renombrar proyectos:
//   node scripts/generate-project-pages.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(rootDir, 'p');
const templatePath = path.join(rootDir, 'project.html');

// Duplicados de js/lib/seo.js a propósito: ese módulo toca `document` y no se
// puede importar desde Node. Si cambian allí, cambiarlos aquí.
const SITE_ORIGIN = 'https://paulabarjau.studio';
const TAB_TITLE = 'paula barjau';
const DEFAULT_SOCIAL_IMAGE = 'data/aitanaBonmati/img/aitanaBonmati_1.webp';

// Las páginas se generan en el idioma por defecto del sitio (catalán), que es
// lo que ve quien entra sin ?lang. Al cargar, el JS reescribe las meta si el
// visitante cambia de idioma.
const LANG = 'cat';
const HTML_LANG = 'ca';
const OG_LOCALE = 'ca_ES';

const describe = (title, category) =>
  `${title}. Projecte de ${category} de Paula Barjau, maquilladora i hairstylist a Barcelona.`;

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

const escapeHtml = (text) =>
  String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

// Sustituye el content="" del <meta> que contenga `marker` (un id o un name)
function setMeta(html, marker, value) {
  const withIdFirst = new RegExp(`(<meta[^>]*${marker}[^>]*content=")[^"]*(")`);
  const withContentFirst = new RegExp(`(<meta[^>]*content=")[^"]*("[^>]*${marker})`);
  if (withIdFirst.test(html)) return html.replace(withIdFirst, `$1${escapeHtml(value)}$2`);
  return html.replace(withContentFirst, `$1${escapeHtml(value)}$2`);
}

// Imagen social: la principal si es una foto; si es un vídeo, la primera de la
// galería. Misma lógica que getProjectSocialImageUrl() en js/project.js.
function socialImagePath(project, slug) {
  const media = project.imatge_principal;
  const block = typeof media === 'string' ? { tipo: 'fotos', url: media } : Array.isArray(media) ? media[0] : media;

  if (block && block.tipo !== 'youtube') {
    const first = Array.isArray(block.url) ? block.url[0] : block.url;
    if (first) return /^https?:\/\//i.test(first) ? first : `data/${slug}/img/${first}`;
  }

  for (const b of project.galeria || []) {
    if (b.tipo === 'fotos' && b.url?.length) return `data/${slug}/img/${b.url[0]}`;
  }
  return DEFAULT_SOCIAL_IMAGE;
}

const absolute = (relPath) =>
  /^https?:\/\//i.test(relPath)
    ? relPath
    : `${SITE_ORIGIN}/${relPath.split('/').map(encodeURIComponent).join('/')}`;

function buildPage(template, slug, project, categories) {
  const category = categories.home_categories[project.categoria];
  const categoryName = category?.[`name_${LANG}`] || project.categoria;
  const description = describe(project.titulo, categoryName);
  const canonical = `${SITE_ORIGIN}/p/${encodeURIComponent(slug)}/`;
  const image = absolute(socialImagePath(project, slug));

  let html = template;

  html = html.replace('<html lang="ca">', `<html lang="${HTML_LANG}">`);
  html = html.replace(
    '<meta charset="utf-8" />',
    '<meta charset="utf-8" />\n    <base href="../../" />'
  );
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(TAB_TITLE)}</title>`);

  html = setMeta(html, 'id="meta-description"', description);
  html = setMeta(html, 'id="og-title"', TAB_TITLE);
  html = setMeta(html, 'id="og-description"', description);
  html = setMeta(html, 'id="og-url"', canonical);
  html = setMeta(html, 'id="og-image"', image);
  html = setMeta(html, 'id="og-locale"', OG_LOCALE);
  html = setMeta(html, 'id="twitter-title"', TAB_TITLE);
  html = setMeta(html, 'id="twitter-description"', description);
  html = setMeta(html, 'id="twitter-image"', image);

  html = html.replace(
    /(<link rel="canonical" id="canonical-link" href=")[^"]*(")/,
    `$1${escapeHtml(canonical)}$2`
  );

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.titulo,
    description,
    url: canonical,
    inLanguage: HTML_LANG,
    genre: categoryName,
    image,
    creator: {
      '@type': 'Person',
      name: 'Paula Barjau',
      jobTitle: 'Maquilladora y hairstylist',
      address: { '@type': 'PostalAddress', addressLocality: 'Barcelona', addressCountry: 'ES' }
    }
  };
  html = html.replace(
    /(<script type="application\/ld\+json" id="project-schema">)[\s\S]*?(<\/script>)/,
    `$1${JSON.stringify(schema)}$2`
  );

  return html;
}

function writeSitemap(slugs) {
  const urls = [
    `${SITE_ORIGIN}/`,
    `${SITE_ORIGIN}/about.html`,
    ...slugs.map((s) => `${SITE_ORIGIN}/p/${encodeURIComponent(s)}/`)
  ];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((u) => `  <url>\n    <loc>${u}</loc>\n  </url>`),
    '</urlset>',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), xml, 'utf8');
}

// ===== Generar =====
const template = fs.readFileSync(templatePath, 'utf8');
const categories = readJson(path.join(rootDir, 'data', 'home_categories.json'));
const slugs = Object.keys(readJson(path.join(rootDir, 'data', 'home_projects.json')).home_projects);

// Borrar páginas de slugs que ya no existen
if (fs.existsSync(outputDir)) {
  const current = new Set(slugs);
  for (const entry of fs.readdirSync(outputDir)) {
    if (!current.has(entry)) {
      fs.rmSync(path.join(outputDir, entry), { recursive: true, force: true });
      console.log(`Eliminada página obsoleta: p/${entry}/`);
    }
  }
}

for (const slug of slugs) {
  const project = readJson(path.join(rootDir, 'data', slug, `${slug}.json`));
  const dir = path.join(outputDir, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), buildPage(template, slug, project, categories), 'utf8');
}

writeSitemap(slugs);
console.log(`Generadas ${slugs.length} páginas en p/ y actualizado sitemap.xml`);
