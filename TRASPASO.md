# Traspaso: la versión nueva a la copia de Paula

Paula ya tiene su copia, `paulabarjau/web`, que publica `paulabarjau.studio`
con GitHub Pages (*legacy*); la edita poco (5 commits suyos; los demás, nuestros,
hasta el 2026-07-30). Tiene una Action que regenera `p/`, `about/` y el sitemap y
los commitea en el repo; las páginas llevan las meta, pero el contenido lo pinta el
JS y Google lo ve vacío. Podemos escribir en su repo (no somos admin).

**Su copia y la nuestra eran iguales** el 2026-10-18. Lo que haya cambiado desde
entonces hay que traerlo antes.

La nueva la publica su Cloudflare con Workers Builds; el DNS de
`paulabarjau.studio` ya está en Cloudflare. En su copia la Action de publicar no
corre (lleva `if: github.repository_owner == 'meowrhino'`) y el build, al no
estar en GitHub, publica en la raíz con el `url` de `site.json`.

Tiempo: unos 30 minutos, y un rato con ella: **cambia cómo edita** (de `data/<slug>/` y
`home_projects.json` a una carpeta por proyecto con todo dentro). Hablarlo antes.

## Antes

- [ ] `main` de meowrhino al día y sin cambios a medias (`git status` limpio).
- [ ] ¿Ha tocado algo Paula en su copia desde el 2026-10-18 (cuando se trajo su contenido; su último commit era del 2026-07-30)?
      `gh api repos/paulabarjau/web/commits --jq '.[0:3][].commit.message'`. Si sí, pasar
      sus cambios aquí antes de seguir (`data/<slug>/<slug>.json` y `home_projects.json` → `projects/<slug>/project.json`; `home_categories.json` → `data/site.json`).
- [ ] El DNS de `paulabarjau.studio` está en Cloudflare (`*.ns.cloudflare.com`). Mirar **en
      qué cuenta**: tiene que ser la de Paula.

## 1. La versión nueva, en una rama de su copia

Las dos copias no comparten historia. Se sube a una rama aparte para que su web
siga igual mientras se prepara Cloudflare:

- [ ] `git push https://github.com/paulabarjau/web.git main:receta`

## 2. Cloudflare (con Paula, en su cuenta)

- [ ] **Workers & Pages → Create → Import a repository** → `paulabarjau/web`, rama de
      producción **`receta`**. Lo demás lo lee de `wrangler.jsonc` (instala sharp con
      `npm install`, build `node build/build.mjs`, sale `dist/`).
- [ ] Mirar la web en su `*.workers.dev`: la portada, un proyecto (`/p/torito/`: el vídeo, los
      créditos) y `/about/`.
- [ ] **Settings → Domains & Routes → Add → Custom domain**: `paulabarjau.studio` (y `www`).
      Cloudflare cambia los registros que apuntaban a GitHub Pages.

## 3. `main` pasa a ser la versión nueva

- [ ] Guardar la de antes: `git push https://github.com/paulabarjau/web.git <sha-de-su-main>:refs/heads/antes`.
- [ ] `git push --force-with-lease=main:<sha-de-su-main> https://github.com/paulabarjau/web.git main`
      (desde nuestra `main`).
- [ ] En Cloudflare, rama de producción → **`main`**. Borrar la rama `receta`.
- [ ] Paula, en su repo: Settings → Pages → **Unpublish site** (ya no sirve nada).

## 4. Que nos deje entrar en Cloudflare

- [ ] Manage account → Members → nos invita. Ahí se ve el error entero de un build que falla.

## 5. Comprobar en su dominio

- [ ] La portada, un proyecto, `/about/` y `/es/`.
- [ ] `view-source:` de un proyecto: el título, los créditos y la galería están en el HTML (antes, vacío).
- [ ] `view-source:`: `canonical` y `og:url` con `paulabarjau.studio`, y **sin**
      `<meta name="robots" content="noindex">`.
- [ ] `/robots.txt` dice `Allow` y `/sitemap.xml` tiene las direcciones de su dominio.
- [ ] Compartir un proyecto por WhatsApp: sale su foto (la og).

## 6. Search Console, con su cuenta de Google

- [ ] Dar de alta el dominio (el registro TXT, en el DNS de Cloudflare) y enviar `sitemap.xml`.

## 7. Paula en su ordenador

Con ella delante, siguiendo [GUIA.md](GUIA.md) ("La primera vegada"):

- [ ] Clona **su** repositorio, no el de meowrhino (si ya lo tenía, **Sincronizar**: la
      estructura cambia entera).
- [ ] Live Server: **Go Live** y ve la vista previa.
- [ ] Un cambio pequeño (una coma en el about), Confirmar → Sincronizar, y la bolita verde.

## 8. Al acabar

- [ ] Fila de paulabarjau en `JAMstack/inventario.md` con las dos direcciones (github.io y su dominio).
- [ ] La copia de meowrhino sigue en github.io con `noindex`: no compite en Google.
