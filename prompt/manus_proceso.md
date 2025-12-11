# web paula barjau - implementación completa

## resumen de la implementación

se ha construido la web completa de paula barjau siguiendo las especificaciones proporcionadas, con diseño mobile-first (max-width 800px) y funcionalidad completa.

## estructura del proyecto

```
paulabarjau/
├── index.html              # página principal (home)
├── project.html            # página de detalle de proyecto
├── style.css               # estilos globales
├── css/
│   └── project.css         # estilos específicos de proyecto
├── js/
│   ├── main.js             # lógica de la home
│   └── project.js          # lógica de la página de proyecto
└── data/
    ├── home_categories.json    # categorías y textos del menú
    ├── home_projects.json      # listado de proyectos
    └── [slug]/
        ├── [slug].json         # datos del proyecto
        └── img/                # imágenes del proyecto
```

## características implementadas

### página home (index.html)

- **título centrado**: "paula barjau" en h1
- **galería de proyectos**: muestra todos los proyectos con sus imágenes
- **hover/click overlay**: al pasar el ratón o hacer click, aparece un velo del 50% del color de la categoría con:
  - sinopsis del proyecto (arriba izquierda)
  - texto "ver más" (abajo derecha)
- **menú deslizable**: botón "menú" fijo en la parte inferior que abre un panel desde abajo con:
  - categorías en su color correspondiente (filtrado activo/inactivo)
  - selector de idioma (cat/es/en)
- **filtrado por categorías**: al hacer click en una categoría se filtran los proyectos visibles
- **multiidioma**: soporte completo para catalán (por defecto), español e inglés

### página de proyecto (project.html)

- **título del proyecto**: en lugar de "paula barjau"
- **color de fondo**: según la categoría del proyecto
- **imagen principal**: debajo del título
- **créditos**: alineados a la izquierda, con links subrayados (sin azul)
- **galería multimedia**: soporta:
  - fotos (webp, jpg, png)
  - videos de youtube (embebidos)
  - videos locales (webm)
- **menú específico**: con botones:
  - "back" (volver a la home)
  - "ver más [categoría]" (volver a la home con filtro de categoría)
  - selector de idioma

## datos json

### home_categories.json

contiene:
- `text_menu`: texto del botón del menú en cada idioma
- `text_see_more`: texto "ver más" en cada idioma
- `text_back`: texto "volver" en cada idioma
- `home_categories`: objeto con las categorías, cada una con:
  - `code`: código de la categoría
  - `name_cat`, `name_es`, `name_en`: nombres en cada idioma
  - `color`: color principal de la categoría
  - `bg`: color de fondo para la página de proyecto

### home_projects.json

contiene el listado de proyectos con:
- `sinopsis`: objeto con textos en cat/es/en
- `categoria`: código de la categoría
- `date`: fecha del proyecto (para ordenar)
- `relevance`: relevancia del proyecto
- `imatge_home`: nombre del archivo de imagen para la home

### [slug].json (datos del proyecto)

contiene:
- `slug`: identificador del proyecto
- `titulo`: título del proyecto
- `categoria`: código de la categoría
- `imatge_principal`: imagen principal del proyecto
- `galeria`: array de bloques con:
  - `tipo`: "fotos", "youtube" o "webm"
  - `url`: array de urls o nombres de archivo
- `creditos`: array de créditos con:
  - `titulo`: objeto con textos en cat/es/en
  - `nombre`: nombre del crédito
  - `link`: url del link (opcional)
  - `tipo`: "extra" para texto especial (opcional)
  - `texto`: objeto con textos en cat/es/en (solo para tipo "extra")

## funcionalidades técnicas

- **vanilla javascript**: sin frameworks, código limpio y modular
- **responsive design**: mobile-first con breakpoint a 600px
- **lazy loading**: imágenes con carga diferida
- **navegación fluida**: transiciones suaves en menú y overlays
- **url parameters**: soporte para filtrado por categoría desde url
- **youtube embeds**: extracción automática de id de video
- **console logging**: mensajes de estado en consola para debugging

## cómo usar

1. subir todos los archivos al repositorio manteniendo la estructura
2. acceder a `index.html` para ver la home
3. los proyectos se cargan automáticamente desde los json
4. para añadir un nuevo proyecto:
   - crear carpeta en `data/[slug]/`
   - añadir `[slug].json` con los datos
   - añadir carpeta `img/` con las imágenes
   - añadir entrada en `home_projects.json`

## pruebas realizadas

- ✓ navegación entre home y proyectos
- ✓ filtrado por categorías
- ✓ cambio de idioma
- ✓ overlay en proyectos con hover
- ✓ menú deslizable
- ✓ página de detalle con imagen principal
- ✓ créditos con links
- ✓ galería con fotos
- ✓ video de youtube embebido
- ✓ responsive design
- ✓ color de fondo según categoría

## notas técnicas

- el idioma por defecto es catalán
- los colores de categoría se aplican dinámicamente
- el menú se cierra al hacer click fuera
- el filtro de categoría se mantiene al cambiar idioma
- los links de créditos mantienen el subrayado pero no el color azul
- las imágenes usan lazy loading para mejor rendimiento
