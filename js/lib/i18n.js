// Helpers de idioma y construcción de URLs compartidos entre páginas
//
// En la web construida (data-built en <html>, build/build.mjs) cada idioma tiene su
// carpeta (/, /es/, /en/): el idioma sale de <html lang>, los enlaces llevan la carpeta
// y ?lang= no se usa (un enlace viejo con ?lang= lo manda el <head> a la página de ese
// idioma). En la vista previa (Live Server) sigue en ?lang=, como siempre.

const VALID_LANGUAGES = ['cat', 'es', 'en'];
const BUILT = typeof document !== 'undefined' && document.documentElement.hasAttribute('data-built');
const LANG_DIR = { cat: '', es: 'es/', en: 'en/' };

export function isValidLanguage(lang) {
  return VALID_LANGUAGES.includes(lang);
}

export function resolveLangFromUrl() {
  const l = BUILT ? document.documentElement.lang.replace(/^ca$/, 'cat') : new URLSearchParams(window.location.search).get('lang');
  return isValidLanguage(l) ? l : 'cat';
}

// La carpeta del idioma en la web construida ('' en la vista previa), para canonical y og:url
export const langDir = (lang) => (BUILT ? LANG_DIR[lang] : '');

// Sincroniza la URL actual con el idioma y parámetros extra (category, slug, ...).
// Un valor null/undefined/false en extraParams elimina ese parámetro.
export function updateUrlState(lang, extraParams = {}) {
  const params = new URLSearchParams(window.location.search);

  Object.entries(extraParams).forEach(([key, value]) => {
    if (value === null || value === undefined || value === false) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });

  if (lang !== 'cat' && !BUILT) {
    params.set('lang', lang);
  } else {
    params.delete('lang');
  }

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}`;
  window.history.replaceState({}, '', nextUrl);
}

// URL limpia de un proyecto: p/<slug>/ en vez de project.html?slug=<slug>
// En la vista previa (Live Server, sin build: falta data-built en <html>) no
// existen p/<slug>/ ni about/, que solo escribe el build: ahí van a project.html y about.html.
export function projectUrl(slug, lang) {
  return BUILT ? buildUrl(`p/${encodeURIComponent(slug)}/`, { lang }) : buildUrl('project.html', { slug, lang });
}

export const aboutPage = () => (BUILT ? 'about/' : 'about.html');

// Saca el slug de la URL, venga de la ruta limpia (/p/<slug>/) o del
// ?slug=<slug> antiguo, que se mantiene para no romper enlaces ya publicados.
export function resolveSlugFromUrl() {
  const fromQuery = new URLSearchParams(window.location.search).get('slug');
  if (fromQuery) return fromQuery;
  const match = window.location.pathname.match(/\/p\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function isCleanProjectUrl() {
  return /\/p\/[^/]+\/?$/.test(window.location.pathname);
}

// Navega a una página relativa. Hace falta resolver contra document.baseURI
// porque las páginas de p/<slug>/ llevan <base href="../../">, y a diferencia
// de un href, asignar location.href ignora el <base>.
export function navigateTo(page, params = {}) {
  try { sessionStorage.setItem('transicion', '{}'); } catch {} // la siguiente página llega tapada (transición de la casa)
  window.location.href = new URL(buildUrl(page, params), document.baseURI).href;
}

// Construye la URL de una página: en la web construida, params.lang es la carpeta
// del idioma delante (y la portada, la raíz); en la vista previa, ?lang= si no es "cat"
export function buildUrl(page, params = {}) {
  const searchParams = new URLSearchParams();
  let path = BUILT && page === 'index.html' ? '' : page;

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (key === 'lang') {
      if (BUILT) path = LANG_DIR[value] + path;
      else if (value !== 'cat') searchParams.set(key, value);
      return;
    }
    searchParams.set(key, value);
  });

  const query = searchParams.toString();
  return `${path}${query ? `?${query}` : ''}`;
}
