// El contenido a la manera del estudio (JAMstack) → el de antes
//
// El contenido vive así: data/site.json (los textos del menú, las categorías y
// "lists": qué proyectos salen en la portada), data/about.json, y cada proyecto
// en projects/<slug>/project.json con sus imágenes en img/. Campos en inglés;
// el catalán, "ca".
//
// El resto del JS sigue trabajando con la forma de antes (home_categories.json,
// home_projects.json, data/<slug>/<slug>.json con titulo, galeria, creditos…, y
// el catalán como "cat"); estas funciones pasan de una a otra. Las usan el
// navegador (carga.js) y el build: sin DOM ni disco.

const LANG = { ca: 'cat', es: 'es', en: 'en' };
// { ca, es, en } → { cat, es, en }
const old = (v) => (v && typeof v === 'object' && !Array.isArray(v)
  ? Object.fromEntries(Object.entries(v).map(([k, x]) => [LANG[k] || k, x])) : v);

export const slugsOf = (site) => Object.values(site.lists || {}).flatMap((l) => l.projects || []);

export function categoriesOld(site) {
  return {
    text_menu: old(site.ui.menu),
    text_see_more: old(site.ui.seeMore),
    text_back: old(site.ui.back),
    home_categories: Object.fromEntries(Object.entries(site.categories).map(([code, c]) =>
      [code, { code, name_cat: c.name.ca, name_es: c.name.es, name_en: c.name.en, color: c.color, bg: c.bg }])),
  };
}

export function homeOld(site, projects) {
  return {
    home_projects: Object.fromEntries(slugsOf(site).map((slug) => {
      const p = projects[slug];
      return [slug, { sinopsis: old(p.summary), categoria: p.category, date: p.date, relevance: p.relevance, imatge_home: p.cover }];
    })),
  };
}

export function projectOld(slug, p) {
  return {
    slug,
    titulo: p.title,
    categoria: p.category,
    imatge_principal: typeof p.main === 'string' ? p.main : { tipo: 'youtube', url: p.main.youtube },
    galeria: [{ tipo: 'fotos', url: p.photos || [] }],
    creditos: (p.credits || []).map((c) => (c.text
      ? { tipo: c.kind || 'extra', texto: old(c.text) }
      : { titulo: old(c.role), nombre: c.name, link: c.url ?? null })),
  };
}

export function aboutOld(a) {
  return { title: old(a.title), paragraphs: old(a.text), contact: (a.contact || []).map((c) => ({ text: c.text, link: c.url })) };
}
