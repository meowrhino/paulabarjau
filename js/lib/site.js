// Datos y lógica de SEO que NO tocan el DOM.
//
// Está separado de seo.js a propósito: seo.js lee elementos con
// document.getElementById al cargarse, así que Node no lo puede importar.
// Este módulo es pura función, y lo usan tanto el navegador (js/project.js)
// como el generador de páginas (scripts/generate-project-pages.mjs), para que
// las descripciones no se escriban dos veces y acaben divergiendo.

export const SITE_ORIGIN = 'https://paulabarjau.studio';
export const TAB_TITLE = 'paula barjau';
export const DEFAULT_SOCIAL_IMAGE = 'data/aitanaBonmati/img/aitanaBonmati_1.webp';

export const HTML_LANG_MAP = {
  cat: 'ca',
  es: 'es',
  en: 'en'
};

export const OG_LOCALE_MAP = {
  cat: 'ca_ES',
  es: 'es_ES',
  en: 'en_US'
};

// En català "de" s'apostrofa davant de vocal o h: d'editorial, però de moda
function catDe(word) {
  return /^[aeiouàèéíòóúh]/i.test(word) ? `d'${word}` : `de ${word}`;
}

const DESCRIPTION_TEMPLATES = {
  cat: (title, category) =>
    `${title}. Projecte ${catDe(category)} de Paula Barjau, maquilladora i hairstylist a Barcelona.`,
  es: (title, category) =>
    `${title}. Proyecto de ${category} de Paula Barjau, maquilladora y hairstylist en Barcelona.`,
  en: (title, category) =>
    `${title}. ${category} project by Paula Barjau, makeup artist and hairstylist in Barcelona.`
};

export function projectDescription(title, categoryName, lang) {
  const template = DESCRIPTION_TEMPLATES[lang] || DESCRIPTION_TEMPLATES.cat;
  return template(title, categoryName);
}

// Ruta de la imagen para compartir en redes: la principal si es una foto; si es
// un vídeo, la primera de la galería. Devuelve una ruta relativa a la raíz del
// sitio (o la URL tal cual si ya era absoluta).
export function projectSocialImagePath(project, slug) {
  const resolve = (file) =>
    !file ? null : /^https?:\/\//i.test(file) || file.startsWith('//') ? file : `data/${slug}/img/${file}`;

  const media = project?.imatge_principal;
  const block = typeof media === 'string'
    ? { tipo: 'fotos', url: media }
    : Array.isArray(media) ? media[0] : media;

  if (block && block.tipo !== 'youtube') {
    const first = Array.isArray(block.url) ? block.url[0] : block.url;
    const path = resolve(first);
    if (path) return path;
  }

  const photos = (project?.galeria || []).find(
    (b) => b.tipo === 'fotos' && Array.isArray(b.url) && b.url.length > 0
  );
  if (photos) return resolve(photos.url[0]);

  return DEFAULT_SOCIAL_IMAGE;
}
