// Lee el contenido (data/site.json, data/about.json, projects/<slug>/project.json)
// y lo pasa a la forma de antes con house.js.
//
// Las páginas que escribe el build llevan data-built en <html>. Sin él es la
// vista previa (Live Server, sin build): cada JSON se revisa con su esquema
// (schema/) como hace el build, y lo que esté mal sale en pantalla.

import { aboutOld, categoriesOld, homeOld, projectOld, slugsOf } from './house.js';
import { leerJSON, validar } from './validar.js';

export const BUILT = document.documentElement.hasAttribute('data-built');
const cache = new Map();

function get(path) {
  if (!cache.has(path)) {
    cache.set(path, fetch(path, { cache: BUILT ? 'default' : 'no-store' }).then(async (res) => {
      if (!res.ok) throw new Error(`no encuentro ${path}`);
      try { return leerJSON(await res.text(), path); } catch (e) { showErrors([e.message]); throw e; }
    }));
  }
  return cache.get(path);
}

async function checked(path, type) {
  const data = await get(path);
  if (!BUILT) {
    const errors = validar(data, await get(`schema/${type}.json`), path);
    if (errors.length) { showErrors(errors); throw new Error(errors.join('\n')); }
  }
  return data;
}

function showErrors(errors) {
  let box = document.getElementById('errores-vista-previa');
  if (!box) {
    box = document.createElement('pre');
    box.id = 'errores-vista-previa';
    box.style.cssText = 'position:fixed;inset:0;z-index:99999;margin:0;padding:2rem;overflow:auto;white-space:pre-wrap;'
      + 'background:#fff;color:#000;font:15px/1.5 monospace;';
    box.textContent = 'esto no se publicaría:\n\n';
    document.body.append(box);
  }
  box.textContent += errors.map((e) => `✗ ${e}`).join('\n') + '\n\narréglalo, guarda, y la página se recarga sola.\n';
}

const site = () => checked('data/site.json', 'site');
const project = (slug) => checked(`projects/${slug}/project.json`, 'project');

export async function getCategories() { return categoriesOld(await site()); }

export async function getHome() {
  const s = await site();
  const slugs = slugsOf(s);
  const projects = Object.fromEntries(await Promise.all(slugs.map(async (slug) => [slug, await project(slug)])));
  return homeOld(s, projects);
}

export async function getProject(slug) { return projectOld(slug, await project(slug)); }

export async function getAbout() { return aboutOld(await checked('data/about.json', 'about')); }
