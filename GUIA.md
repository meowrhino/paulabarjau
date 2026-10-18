# Guía de la web

> **Regla de oro: solo se tocan `data/` y `projects/`.** Lo demás es el código.

## Qué hay

```
data/site.json             los textos del menú, las categorías (nombre y colores) y los proyectos de la portada
data/about.json            el "sobre mí": título, texto y contacto
projects/<nombre>/         un proyecto, una carpeta:
  project.json               su título, su categoría, sus textos y créditos, y qué imágenes usa
  img/                       sus imágenes y vídeos, cada uno con su nombre
```

El **nombre de la carpeta** es también el de la dirección: `projects/torito/` →
`paulabarjau.studio/p/torito/`. Letras sin acentos ni `ñ`, números y guiones, sin espacios.
Mejor no cambiarlo una vez publicado: rompería los enlaces que ya circulan.

## La primera vez: preparar VS Code

Solo se hace una vez.

1. En VS Code: **Archivo → Nueva ventana** y, en la bienvenida, **Clonar repositorio Git…** →
   **Clonar desde GitHub**. Entra con tu cuenta, elige tu repositorio y una carpeta.
2. Al abrirla, VS Code propone instalar **Live Server** (abajo a la derecha): **Instalar**.
3. Abajo a la derecha sale **Go Live**: es la vista previa.

**VS Code te ayuda con los campos**: si pasas el ratón por encima de uno (`"title"`, `"credits"`…)
te dice qué es, y si escribes uno mal o pones algo que no toca, lo subraya en rojo. Para ver
qué campos puedes poner, dentro de las llaves pulsa **Ctrl+Espacio**. Lo sabe por la primera
línea de cada JSON (`"$schema": …`): **no la borres**.

## Añadir un proyecto, paso a paso

1. **Copia una carpeta** de `projects/` que se parezca y ponle el nombre nuevo:
   `projects/ainara/` → `projects/vogueItalia/`. Borra sus imágenes.
2. **Las imágenes**: pásalas por [imgToWeb](https://meowrhino.github.io/imgToWeb/), **en Chrome o
   Firefox** (Safari no sabe hacer `.webp`), y ponlas en `img/`, con nombres sin espacios ni
   acentos: `vogueItalia_1.webp`, `vogueItalia_2.webp`…
3. **Los textos**: abre `project.json` y cambia lo que toque (los campos, abajo).
4. **En la portada**: en `data/site.json`, añade el nombre de la carpeta a la lista de `lists`.
   El orden lo deciden `relevance` y `date` de cada proyecto.
5. **Go Live** para verlo, y después **Subir los cambios**.

Para **quitar** un proyecto de la web, quítalo de la lista de `data/site.json`: la carpeta se
puede quedar.

## Los campos de un proyecto (`project.json`)

| campo | qué hace |
|---|---|
| `title` | el título del proyecto |
| `category` | la categoría: `fashion`, `commercial`, `videoclip` o `editorial` (las de `data/site.json`) |
| `date` | la fecha, `AAAA-MM-DD`: con la misma relevancia, sale antes el más nuevo |
| `relevance` | el orden en la portada, sin comillas: `1` sale antes que `2` |
| `cover` | la imagen de la portada, de `img/`: `"vogueItalia_1.webp"` |
| `summary` | lo que sale encima de la imagen en la portada: `{ "ca": "…", "es": "…", "en": "…" }` |
| `main` | lo de arriba del proyecto: una imagen de `img/` (`"vogueItalia_1.webp"`) o un vídeo de YouTube: `{ "youtube": ["https://www.youtube.com/watch?v=…"] }` |
| `photos` | las fotos de la galería, de `img/`, en orden: `["vogueItalia_2.webp", "vogueItalia_3.webp"]` |
| `credits` | los créditos, una persona por línea: `{ "role": { "ca": "Fotografia", "es": "Fotografía", "en": "Photography" }, "name": "Nombre", "url": "https://…" }` (`url` es opcional). Para una línea de texto: `{ "text": { "ca": "…", "es": "…", "en": "…" } }` |

Los textos van en los tres idiomas: `ca` (catalán), `es` y `en`.

## Verlo antes de subirlo

**Go Live** abajo a la derecha de VS Code. Se abre la web en el navegador y se refresca sola
cada vez que guardas. Si hay algo que no se publicaría (una coma, un campo mal escrito), sale
en pantalla, y dice dónde.

## Subir los cambios

1. Pestaña **Control de código fuente** (las tres bolitas unidas, a la izquierda).
2. Escribe qué has hecho (`proyecto nuevo: vogueItalia`) y **Confirmar** (*Commit*). Si
   pregunta si quieres añadir todos los cambios: **Sí**.
3. **Sincronizar cambios** (*Sync*).
4. En un par de minutos está en la web. En GitHub, al lado del último cambio sale una bolita:
   amarilla es que se está publicando, verde que ya está, roja que algo no cuadra.

**Antes de empezar a tocar**, dale también a **Sincronizar**, para bajar lo que haya cambiado.

## Qué sale en Google y al compartir

| dónde | de dónde sale |
|---|---|
| el texto de debajo, en Google | se escribe solo con el título y la categoría |
| la imagen al compartir el enlace | la de `main` si es una foto; si es un vídeo, la primera de `photos` |

## Si sale en rojo

La web no se rompe: se queda como estaba hasta que se arregla. Pincha la bolita roja, luego
**Details**, y lee el último mensaje, que dice el fichero y qué pasa:

- **"no es un JSON válido, línea 12"** → casi siempre **una coma**: que falta entre dos cosas,
  o que sobra después de la última. O unas comillas sin cerrar.
- **"\"titulo\" no es un campo de aquí (¿mal escrito?). Los que hay: title, category…"** →
  un campo mal escrito: cópialo de la lista que sale en el mensaje.
- **"no encuentro projects/vogueItalia/img/vogueItalia_3.webp"** → el nombre de la imagen no es
  igual (mayúsculas, espacios, la extensión) o no se ha subido.
- **"la categoría \"moda\" no está en data/site.json → categories"** → la categoría va con su
  código: `fashion`, `commercial`, `videoclip` o `editorial`.
