# paula barjau — portfolio

Web de Paula Barjau, maquilladora y hairstylist en Barcelona.

Es un sitio **estático y sin dependencias**: HTML, CSS y JavaScript a pelo. No hay
que instalar nada, no hay que compilar nada, no hay `npm install`. El contenido
vive en archivos JSON dentro de `data/`, y las páginas de cada proyecto se generan
solas con una GitHub Action cuando ese contenido cambia.

Está en tres idiomas: catalán (el de por defecto), castellano e inglés.

---

# Parte 1 — Para quien lleva la web

Esta parte no necesita saber programar ni instalar nada: se puede hacer todo
desde la web de GitHub, editando archivos y subiendo imágenes con el ratón.

## La idea general

Todo el contenido está en la carpeta `data/`. Se edita un archivo de texto (los
`.json`), se guarda, y al cabo de un minuto o dos la web ya lo muestra. No hay
que tocar nada más.

Los `.json` son archivos de texto con una forma muy estricta: **si te comes una
coma o una comilla, la web deja de cargar**. Dos consejos:

- Copia siempre un bloque que ya funcione y cámbiale el contenido, en vez de
  escribirlo desde cero.
- Antes de guardar, pega el texto en <https://jsonlint.com> y comprueba que
  dice "Valid JSON".

## Qué hay en cada archivo

| Archivo | Para qué |
|---|---|
| `data/home_projects.json` | La lista de proyectos de la portada: en qué orden salen, con qué foto y qué texto |
| `data/<proyecto>/<proyecto>.json` | La ficha de un proyecto: título, galería y créditos |
| `data/<proyecto>/img/` | Las imágenes y vídeos de ese proyecto |
| `data/home_categories.json` | Las categorías (moda, comercial, videoclip, editorial), sus colores y los textos del menú |
| `data/about.json` | El texto del "sobre mí" y los datos de contacto |

**No toques estas carpetas**: `p/`, `about/` y `sitemap.xml`. Las escribe el robot
automáticamente y cualquier cambio a mano se pierde en la siguiente publicación.

## Añadir un proyecto nuevo

Digamos que el proyecto se llama "Vogue Italia" y le pones de nombre corto
(*slug*) `vogueItalia`.

**1. Crea la carpeta con las imágenes.**

En GitHub, entra en `data/`, botón *Add file* → *Upload files*, y arrastra las
imágenes. Para crear la carpeta, escribe en el nombre del archivo
`vogueItalia/img/` antes de subirlas.

Sobre el nombre corto (*slug*):

- Sin espacios, sin acentos y sin eñes. Usa `vogueItalia`, no `Vogue Italia` ni
  `vogueItaliá`. Es el nombre que acaba en la dirección de la página
  (`paulabarjau.studio/p/vogueItalia/`), y los caracteres raros dan problemas.
- Tiene que ser **exactamente el mismo** en la carpeta, en el archivo `.json` de
  dentro y en la lista de la portada. Si no coinciden, el proyecto no carga.

Sobre las imágenes: en `.webp` si puede ser (pesan mucho menos que los `.jpg`) y
con nombres sin espacios ni acentos, del tipo `vogueItalia_1.webp`,
`vogueItalia_2.webp`.

**2. Crea la ficha del proyecto.**

Un archivo llamado `data/vogueItalia/vogueItalia.json`. Lo más práctico es abrir
`data/stoicMagazine/stoicMagazine.json`, copiarlo entero y cambiarle los datos:

```json
{
    "slug": "vogueItalia",
    "titulo": "VOGUE ITALIA",
    "categoria": "editorial",
    "imatge_principal": {
        "tipo": "fotos",
        "url": ["vogueItalia_1.webp"]
    },
    "galeria": [
        {
            "tipo": "fotos",
            "url": ["vogueItalia_2.webp", "vogueItalia_3.webp"]
        }
    ],
    "creditos": [
        {
            "titulo": { "cat": "Fotògraf", "es": "Fotógrafo", "en": "Photographer" },
            "nombre": "Nombre Apellido",
            "link": "https://www.instagram.com/usuario/"
        }
    ]
}
```

- `categoria` tiene que ser una de estas cuatro, tal cual: `fashion`,
  `commercial`, `videoclip`, `editorial`.
- En `url` va **solo el nombre del archivo**, no la ruta entera: la web ya sabe
  que está en `data/vogueItalia/img/`.
- `link` puede ser `null` (sin comillas) si esa persona no tiene Instagram.
- Para un vídeo de YouTube, usa `"tipo": "youtube"` y en `url` la dirección
  completa del vídeo. Para un vídeo subido a la carpeta, `"tipo": "video"`.

**3. Añádelo a la portada.**

En `data/home_projects.json`, copia un bloque y añádelo:

```json
"vogueItalia": {
    "sinopsis": {
        "cat": "VOGUE ITALIA",
        "es": "VOGUE ITALIA",
        "en": "VOGUE ITALIA"
    },
    "categoria": "editorial",
    "date": "2026-03-14",
    "relevance": 1,
    "imatge_home": "vogueItalia_1.webp"
},
```

- `relevance` es lo primero que manda: los números bajos salen antes (el 1 antes
  que el 2). Ahora mismo **todos los proyectos tienen `relevance: 1`**, y por eso
  parece que ordena la fecha.
- `date` desempata entre los que tienen la misma `relevance`, de más nuevo a más
  viejo. El formato es año-mes-día.
- Si quieres subir un proyecto a lo más alto de la portada sin tocarle la fecha,
  ponle `"relevance": 0`.
- Cuidado con las comas: cada bloque acaba en `},` menos el último, que acaba
  en `}` sin coma.

**4. Guarda y espera.**

Al guardar (*Commit changes*), un robot regenera la página del proyecto y el
sitemap, y publica. Tarda un par de minutos entre las dos cosas. Si a los cinco
minutos no lo ves, mira la pestaña **Actions** del repositorio: si hay una marca
roja, algo del JSON está mal escrito.

## Otros cambios habituales

**Quitar un proyecto.** Bórralo de `data/home_projects.json`. Su página se borra
sola. Puedes dejar la carpeta de `data/` si quieres guardar las fotos.

**Cambiar el orden de la portada.** Cambia las fechas (`date`), o usa `relevance`
si quieres forzar que uno vaya arriba (ver arriba).

**Cambiar el "sobre mí" o el contacto.** `data/about.json`, en los tres idiomas.

**Cambiar los colores de una categoría.** En `data/home_categories.json`, `color`
es el del texto y `bg` el del fondo que se pone al filtrar por ella.

**Cambiar los textos del menú** ("menú", "ver más", "volver"). Están arriba en
`data/home_categories.json`, en los tres idiomas.

Cualquier texto que se le ponga delante a un visitante va en los tres idiomas
(`cat`, `es`, `en`). Si te dejas uno, ahí se verá un hueco.

## El formateador de créditos

`formateador.html` es una herramienta suelta para no escribir a mano el bloque de
créditos, que es el más pesado. Se abre en el navegador, se rellenan los créditos
en un formulario (con botones para ordenarlos y borrarlos), y da el JSON ya
formateado para pegar. También funciona al revés: pegas un bloque de créditos y lo
trae al editor para retocarlo.

---

# Parte 2 — Para quien programa

## Principios

- **Sin dependencias y sin build.** Lo que hay en el repositorio es exactamente lo
  que sirve el navegador. `package.json` existe solo para que Node trate los `.js`
  como ES modules y el generador pueda importar `js/lib/site.js`.
- **El contenido son datos, no código.** Todo lo editable está en `data/*.json`,
  para que se pueda mantener sin tocar HTML.
- **Las páginas de proyecto se generan.** No es SSR ni un framework: es un script
  de Node que escribe HTML y lo commitea.

## Mapa del repositorio

```
index.html          Portada: rejilla de proyectos + filtro por categoría
project.html        Plantilla de la página de proyecto (no se sirve directamente)
about.html          Plantilla del about (no se sirve directamente)
404.html            Página de error de GitHub Pages
formateador.html    Herramienta suelta para generar el JSON de créditos

css/style.css       Todo el CSS del sitio, incluido el menú
js/
  main.js           Portada: carga, rejilla, filtro con animación FLIP, paginación
  project.js        Página de proyecto: galería, créditos, colores de categoría
  about.js          Página de about
  lib/
    menu.js         Menú compartido: abrir/cerrar, cerrar al clicar fuera, idioma
    i18n.js         Idioma y construcción de URLs (?lang=, slugs, rutas limpias)
    seo.js          Aplica las meta al DOM (solo navegador)
    site.js         Constantes y textos de SEO, sin DOM (navegador + Node)

data/               Contenido (ver Parte 1)
scripts/
  generate-project-pages.mjs   Generador de p/<slug>/, about/ y sitemap.xml
.github/workflows/
  generar-paginas.yml          Ejecuta el generador y commitea el resultado

p/<slug>/index.html   GENERADO — no editar a mano
about/index.html      GENERADO — no editar a mano
sitemap.xml           GENERADO — no editar a mano
```

## Modelo de datos

`data/home_projects.json` es el índice de la portada, y su clave es el *slug*:

```
home_projects[slug] = { sinopsis: {cat,es,en}, categoria, date, relevance, imatge_home }
```

`data/<slug>/<slug>.json` es la ficha completa:

```
{ slug, titulo, categoria, imatge_principal, galeria[], creditos[] }
```

Los bloques de media (`imatge_principal` y cada entrada de `galeria`) son
`{ tipo, url[] }`, con `tipo` en `fotos` | `youtube` | `video` | `webm`. El código
tolera formas antiguas: una cadena suelta se interpreta como `{tipo:'fotos'}`, y
`imatge_principal` acepta también un array (se usa el primer elemento). Las rutas
relativas se resuelven contra `data/<slug>/img/`.

`creditos[]` son `{ titulo: {cat,es,en}, nombre, link }`. Hay un
`tipo: 'extra'` para líneas que no son un crédito con nombre.

**El índice y la ficha duplican `categoria`.** Es intencionado —la portada no
descarga las fichas— pero significa que si cambias la categoría de un proyecto
hay que cambiarla en los dos sitios.

## Idiomas

`cat` es el de por defecto y **no** lleva parámetro en la URL; `es` y `en` van
como `?lang=es`. Toda la lógica está en `js/lib/i18n.js`, que también resuelve el
slug tanto de la ruta limpia (`/p/<slug>/`) como del viejo `?slug=<slug>`, que se
mantiene para no romper enlaces ya publicados.

Al cambiar de idioma no se recrean los nodos: se reescriben los textos
(`updateCategoryButtonsText`, `updateProjectCardsText`), para no perder el estado
de la rejilla ni las imágenes ya cargadas.

## Por qué hay un generador

Los buscadores y los previsualizadores de enlaces (WhatsApp, Slack, Twitter) no
ejecutan JavaScript. Con `project.html?slug=X` todos los proyectos compartían las
mismas meta genéricas y la misma imagen al compartir. `scripts/generate-project-pages.mjs`
escribe un `p/<slug>/index.html` por proyecto con sus meta, su canonical, su
`og:image` y su JSON-LD ya en el HTML, y de paso deja la URL limpia.

Detalles que importan:

- Cada página generada lleva `<base href="../../">` para que las rutas relativas
  (CSS, JS, `fetch` de los JSON, imágenes) sigan resolviendo desde la raíz. Por
  eso `i18n.js` resuelve contra `document.baseURI` al navegar: asignar
  `location.href` ignora el `<base>`, a diferencia de un `href`.
- Se generan **en catalán**, que es lo que ve quien entra sin `?lang`. Si el
  visitante cambia de idioma, el JS reescribe las meta.
- Los textos de las descripciones viven en `js/lib/site.js`, que no toca el DOM
  justamente para que lo puedan importar tanto el navegador como Node y no se
  escriban dos veces.
- El generador borra las páginas de slugs que ya no están en `home_projects.json`.

## La Action

`.github/workflows/generar-paginas.yml` se dispara al hacer push a `main` cuando
cambia `data/**`, `project.html`, `about.html`, `scripts/**` o el propio
workflow. Ejecuta el generador y, si hay cambios en `p/`, `about/` o
`sitemap.xml`, los commitea como `github-actions[bot]`. El disparador **no**
incluye lo que el flujo escribe, para no morderse la cola.

Dos consecuencias que conviene tener claras:

- **Cambiar CSS o JS no dispara la Action, y no hace falta.** Las páginas
  generadas enlazan los mismos `css/style.css` y `js/*`, así que un cambio de
  estilos se aplica a todas al instante.
- **Cambiar el *markup* de `project.html` o `about.html` sí exige regenerar.**
  Las páginas de `p/` son copias con las meta sustituidas: si tocas su HTML sin
  regenerar, las páginas vivas se quedan con el markup viejo. La Action ya se
  dispara con esos dos archivos; a mano es `npm run generar`.

## Desarrollo en local

Hace falta un servidor HTTP: la web usa `fetch` para los JSON y ES modules, y
ninguna de las dos cosas funciona abriendo el archivo con `file://`.

```bash
python3 -m http.server 8000
```

Y abre <http://localhost:8000>. Para regenerar las páginas a mano:

```bash
npm run generar
```

`.claude/` está en `.gitignore`: son herramientas locales, no forman parte del
sitio.

## Publicación

GitHub Pages, sirviendo la rama `main` desde la raíz. Cada push publica solo,
sin workflow de deploy propio (lo hace el `pages-build-deployment` de GitHub).

⚠️ **Hay DOS repositorios con este mismo código, y solo uno sirve el dominio.**

| repositorio | URL que sirve | papel |
|---|---|---|
| `meowrhino/paulabarjau` | <https://meowrhino.github.io/paulabarjau/> | donde se trabaja |
| `paulabarjau/web` | <https://paulabarjau.studio/> (tiene el `CNAME`) | el que ve el público |

No están conectados por git: son dos repositorios independientes con historias
distintas y los mismos cambios aplicados a mano en cada uno. **Un push al
primero no actualiza el dominio.** Comprobado el 2026-07-30: seis commits
llegaron a github.io mientras `paulabarjau.studio` seguía sirviendo el build
anterior, porque nadie los había llevado al segundo.

Para llevar los cambios de aquí al del dominio, con el repo de trabajo al día:

```bash
git remote add cliente https://github.com/paulabarjau/web.git
git fetch cliente
git cherry-pick <primer-commit-nuevo>..HEAD   # sobre una rama sacada de cliente/main
git push cliente HEAD:main
```

Conviene comprobar antes que los contenidos coinciden
(`git diff cliente/main <commit-equivalente>` sin salida), porque al ser
historias separadas git no puede avisar de una divergencia real.

`js/lib/site.js` declara `SITE_ORIGIN = 'https://paulabarjau.studio'`, y de ahí
salen los canonical, los `og:url` y el sitemap. O sea que las páginas servidas en
github.io apuntan al dominio: correcto para el SEO del sitio público, pero es la
razón de que la copia de trabajo no deba indexarse.

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
- **`categoria` está duplicada** entre el índice y la ficha de cada proyecto (ver
  *Modelo de datos*).
