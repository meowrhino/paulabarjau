# paula barjau — portfolio

Web de Paula Barjau, maquilladora y hairstylist en Barcelona. En tres idiomas:
catalán (el de por defecto), castellano e inglés.

Sigue la receta de [meowrhino/JAMstack](https://github.com/meowrhino/JAMstack)
desde el 2026-10-18. **Para Paula: [GUIA.md](GUIA.md).** Traspaso:
[TRASPASO.md](TRASPASO.md). Si el build falla: [CLAUDE.md](CLAUDE.md).

## Cómo está hecho

```
data/site.json         los textos del menú, las categorías (nombre y colores) y "lists": los proyectos de la portada
data/about.json        el sobre mí: título, texto y contacto (ca/es/en)
projects/<slug>/       un proyecto: project.json (title, category, date, relevance, cover, summary,
                       main, photos, credits) + img/ (las imágenes, con su nombre)
schema/                qué campos lleva cada JSON (VS Code, el build y la vista previa)
index.html, project.html, about.html, 404.html   las plantillas, y la vista previa con Live Server
build/build.mjs        → dist/: la portada, /about/ y /p/<slug>/ con su contenido dentro, en catalán y bajo /es/ y /en/
js/lib/house.js        la forma de la casa → la de antes (home_categories, home_projects, <slug>.json)
js/lib/carga.js        lee los JSON (y en la vista previa los revisa con schema/)
js/lib/validar.js      el JSON Schema sin dependencias (de JAMstack)
js/main.js, project.js, about.js, js/lib/{i18n,menu,seo,site}.js   como antes
```

- **El build** (`npm ci && node build/build.mjs`) escribe en `dist/` (no se commitea) la portada,
  `/about/` y `/p/<slug>/` con sus meta y el contenido ya en el HTML, una vez por idioma: el catalán
  en la raíz y lo mismo bajo `/es/` y `/en/`, cada página con `canonical` y `hreflang` a las otras
  dos; og 1200×630 con **sharp**, sitemap (con todas) y robots. Al cargar, el JS vuelve a pintar lo
  mismo. Sustituye al generador y a la Action que commiteaban `p/`, `about/` y `sitemap.xml` en el
  repo. Las direcciones viejas llevan a las nuevas: `/p/siMurieraMañana/` a `/p/siMurieraManana/`
  (la ñ fuera del nombre de la carpeta), `project.html?slug=x` a `/p/x/`, y un `?lang=es` a la
  página en `/es/` (un script en el `<head>`, antes de pintar).
- **Vista previa**: Live Server sobre la carpeta. Sin `data-built` en `<html>`, `carga.js` revisa
  los JSON y enseña los errores en pantalla, y los enlaces van a `project.html?slug=` y `about.html`
  (las páginas `/p/` y `/about/` solo existen en `dist/`).
- **Publicar, una en cada copia**: la nuestra, `.github/workflows/deploy.yml` a GitHub Pages (solo
  corre en `meowrhino`; si falla, un issue). La de Paula, Workers Builds (`wrangler.jsonc`). El build
  mira dónde está: con `GITHUB_ACTIONS`, base `/paulabarjau` y `noindex`; si no, la raíz y el `url`
  de `site.json`.

## Idiomas

Una dirección por idioma: el catalán, el de por defecto, en la raíz (`/`,
`/p/<slug>/`, `/about/`) y lo mismo bajo `/es/` y `/en/`. En la web construida el
idioma sale de `<html lang>`, el selector del menú y "tornar" son enlaces (el build
los escribe: a la misma página en el otro idioma, y a la portada de ese idioma) y el
JS no lo cambia. Toda la lógica está en `js/lib/i18n.js`: en la web construida
(`data-built`) pone la carpeta del idioma delante de cada enlace; en la vista
previa (Live Server) sigue con `?lang=es` y el cambio de idioma se hace en la
página, sin recargar: no se recrean los nodos, se reescriben los textos
(`updateCategoryButtonsText`, `updateProjectCardsText`), para no perder el estado
de la rejilla ni las imágenes ya cargadas. También resuelve el slug tanto de la
ruta limpia (`/p/<slug>/`) como del `?slug=<slug>` de la vista previa.

## El menú, que es la parte con más CSS

Tres piezas en `css/style.css`:

- **`.menu-toggle`** — botón `position: fixed`, pegado al borde derecho de la
  ventana en todos los tamaños, justo encima de los idiomas. Lleva
  `padding-inline: 0` para que el borde derecho de la palabra caiga donde el de
  los idiomas y no 32px antes. Al abrirse sube con
  `bottom: calc(var(--menu-height) + var(--menu-gap))`.
- **`.menu-panel`** — la lengüeta, de todo el ancho de la ventana, escondida con
  `translateY(100%)` (el 100% es de su propia altura, así que se esconde exacta
  sin necesidad de una altura fija).
- **`.menu-content`** — tres huecos con el mismo criterio en los dos tamaños:
  volver a la izquierda, categorías o "ver más" centradas y los idiomas a la
  derecha. En móvil es una columna, y cada cosa se coloca con márgenes
  automáticos (`#back-btn` con `margin-right: auto`, `.languages-container` con
  `margin-left: auto`), que ganan al `align-items: center` del contenedor. A
  partir de 700px pasa a una sola fila con áreas de grid (`"izq medio der"`): al
  ser áreas con nombre, el hueco que no se usa no descoloca a los demás, y eso
  importa porque la portada no tiene "volver" y el about no tiene nada en medio.

**El color lo manda una sola variable.** `--page-bg` se declara en `:root` y el
JS la reescribe sobre `<html>` según la categoría o el proyecto. La lengüeta,
`html`, `body` y `main` leen `var(--page-bg)`; ninguno tiene color propio. Para
cambiar cómo se colorea el sitio se toca esa variable y nada más.

**El botón no tiene fondo, y por eso la letra se invierte.** Al no haber caja, la
palabra tiene que leerse igual sobre el fondo claro de la página que sobre una
foto oscura, así que va en blanco con `mix-blend-mode: difference`: el resultado
es el inverso de lo que tenga detrás (negra sobre claro, blanca sobre oscuro).
Tiene una contrapartida medida: sobre un gris medio la letra sale también gris
medio. En `/p/torito/` cae sobre una zona de luminancia 171 y el contraste baja a
3,3:1, cuando en negro plano habrían sido 9,1:1. A cambio rescata los fondos
oscuros, donde en negro era literalmente invisible (1:1 sobre una zona de
luminancia 4). Si algún día molesta más de lo que arregla, la alternativa es
letra negra con `text-shadow: 0 0 8px var(--page-bg)`.

**`--menu-height` la calcula el JS**, no el CSS: `js/lib/menu.js` mide
`menuPanel.offsetHeight` al abrir y la escribe en `<html>`, porque el botón
necesita saber cuánto tiene que subir y el CSS no puede medir a un hermano. Un
`ResizeObserver` la vuelve a medir si el panel cambia de alto con el menú ya
abierto (girar el móvil, redimensionar cruzando los 700px); sin eso el botón se
quedaba a la altura vieja y llegaba a solaparse 31px con la lengüeta.

**El menú se cierra al usarlo.** `closeMenu()` en `js/lib/menu.js` lo llaman los
idiomas (dentro del propio módulo, así vale para las tres páginas) y las
categorías (en `main.js`). Comprueba que esté abierto antes de cerrar, porque
`toggleCategory()` también se llama al cargar la página con `?category=` y sin
esa comprobación abriría el menú al entrar. Volver y "ver más" no lo necesitan
porque navegan a otra página.

## Cosas pendientes / a tener en cuenta

- **El área de toque del botón del menú es de 36x40px**, por debajo de los ~44
  que se recomiendan para el dedo, y es la única manera de abrir el menú. Es
  consecuencia de quitarle el padding lateral para alinearlo con los idiomas. Se
  puede agrandar sin mover la palabra con un pseudoelemento:
  `.menu-toggle::after { content: ""; position: absolute; inset: -4px -20px; }`
- **El `mix-blend-mode: difference` del botón flojea sobre grises medios** (ver
  la sección del menú). No está probado en Safari ni en iOS, solo en Chromium.
- **El botón del menú lleva `outline: none`** sin alternativa visible, así que
  quien navegue con teclado no ve dónde tiene el foco. Tampoco hay
  `aria-expanded` en el botón ni `aria-hidden` en el panel.
- **Dos breakpoints distintos**: el menú usa 700px y los tamaños de letra 600px.
  No es un error, pero conviene saberlo antes de añadir un tercero.
- **`.DS_Store` está rastreado en git** aunque `.gitignore` lo liste (se
  commiteó antes de ignorarlo). Se limpia con
  `git rm --cached .DS_Store`.
