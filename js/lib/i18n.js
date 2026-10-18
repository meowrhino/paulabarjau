// Helpers de idioma y construcción de URLs compartidos entre páginas

const VALID_LANGUAGES = ['cat', 'es', 'en'];

export function isValidLanguage(lang) {
  return VALID_LANGUAGES.includes(lang);
}

export function resolveLangFromUrl() {
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  return isValidLanguage(urlLang) ? urlLang : 'cat';
}

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

  if (lang !== 'cat') {
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
const BUILT = typeof document !== 'undefined' && document.documentElement.hasAttribute('data-built');

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
  window.location.href = new URL(buildUrl(page, params), document.baseURI).href;
}

// Construye la URL de una página añadiendo params.lang solo cuando no es "cat"
export function buildUrl(page, params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (key === 'lang' && value === 'cat') return;
    searchParams.set(key, value);
  });

  const query = searchParams.toString();
  return `${page}${query ? `?${query}` : ''}`;
}
