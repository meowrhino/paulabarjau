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
