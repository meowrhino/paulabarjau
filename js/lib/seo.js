// Aplicación de las meta etiquetas SEO/social al DOM.
// Las constantes y los textos viven en site.js, que no toca el DOM y por eso
// también lo puede importar el generador de páginas desde Node.

import { HTML_LANG_MAP, OG_LOCALE_MAP, TAB_TITLE } from './site.js';

export {
  HTML_LANG_MAP,
  OG_LOCALE_MAP,
  SITE_ORIGIN,
  TAB_TITLE,
  DEFAULT_SOCIAL_IMAGE,
  projectDescription,
  projectSocialImagePath
} from './site.js';

const metaDescriptionEl = document.getElementById('meta-description');
const canonicalLinkEl = document.getElementById('canonical-link');
const ogTitleEl = document.getElementById('og-title');
const ogDescriptionEl = document.getElementById('og-description');
const ogUrlEl = document.getElementById('og-url');
const ogImageEl = document.getElementById('og-image');
const ogLocaleEl = document.getElementById('og-locale');
const twitterTitleEl = document.getElementById('twitter-title');
const twitterDescriptionEl = document.getElementById('twitter-description');
const twitterImageEl = document.getElementById('twitter-image');

// Aplica título, descripción, canonical, imagen social e idioma a las meta etiquetas de la página
export function applyMeta({ title, description, canonicalUrl, imageUrl, lang }) {
  document.title = TAB_TITLE;
  document.documentElement.lang = HTML_LANG_MAP[lang] || 'ca';

  if (metaDescriptionEl) metaDescriptionEl.content = description;
  if (canonicalLinkEl) canonicalLinkEl.href = canonicalUrl;
  if (ogTitleEl) ogTitleEl.content = title;
  if (ogDescriptionEl) ogDescriptionEl.content = description;
  if (ogUrlEl) ogUrlEl.content = canonicalUrl;
  if (ogImageEl) ogImageEl.content = imageUrl;
  if (ogLocaleEl) ogLocaleEl.content = OG_LOCALE_MAP[lang] || OG_LOCALE_MAP.cat;
  if (twitterTitleEl) twitterTitleEl.content = title;
  if (twitterDescriptionEl) twitterDescriptionEl.content = description;
  if (twitterImageEl) twitterImageEl.content = imageUrl;
}
