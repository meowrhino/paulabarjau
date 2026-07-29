import { HTML_LANG_MAP, SITE_ORIGIN, TAB_TITLE, DEFAULT_SOCIAL_IMAGE, applyMeta } from './lib/seo.js';
import { isValidLanguage, resolveLangFromUrl, updateUrlState, buildUrl, navigateTo, resolveSlugFromUrl, isCleanProjectUrl } from './lib/i18n.js';
import { setupMenu } from './lib/menu.js';

// Estado global
let categoriesData = null;
let projectData = null;
let currentLanguage = 'cat';
let projectSlug = null;

// Elementos del DOM
const projectTitle = document.getElementById('project-title');
const creditsContainer = document.getElementById('credits-container');
const galleryContainer = document.getElementById('gallery-container');
const menuToggle = document.getElementById('menu-toggle');
const menuPanel = document.getElementById('menu-panel');
const backBtn = document.getElementById('back-btn');
const moreCategoryBtn = document.getElementById('more-category-btn');
const langButtons = document.querySelectorAll('.lang-btn');
const mainEl = document.querySelector('main');
const projectSchemaEl = document.getElementById('project-schema');

// Textos y helpers
const ERROR_TEXTS = {
  title: {
    cat: 'Projecte no trobat',
    es: 'Proyecto no encontrado',
    en: 'Project not found'
  },
  message: {
    cat: "No hem pogut carregar aquest projecte. Torna a l'inici.",
    es: 'No hemos podido cargar este proyecto. Vuelve al inicio.',
    en: 'We could not load this project. Go back home.'
  },
  home: {
    cat: "tornar a l'inici",
    es: 'volver al inicio',
    en: 'go back home'
  }
};
const PROJECT_DESCRIPTION_TEMPLATES = {
  cat: (title, category) => `${title}. Projecte de ${category} de Paula Barjau, maquilladora i hairstylist a Barcelona.`,
  es: (title, category) => `${title}. Proyecto de ${category} de Paula Barjau, maquilladora y hairstylist en Barcelona.`,
  en: (title, category) => `${title}. ${category} project by Paula Barjau, makeup artist and hairstylist in Barcelona.`
};

function setImageAlt(img, text) {
  img.alt = text || '';
}

function resolveMediaSrc(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path) || path.startsWith('//')) return path;
  return `data/${projectSlug}/img/${path}`;
}

function getCanonicalProjectUrl() {
  return `${SITE_ORIGIN}/p/${encodeURIComponent(projectSlug)}/`;
}

function getProjectSocialImageUrl() {
  if (!projectData) {
    return new URL(DEFAULT_SOCIAL_IMAGE, `${SITE_ORIGIN}/`).href;
  }

  let imagePath = null;
  const mainMedia = projectData.imatge_principal;
  if (typeof mainMedia === 'string') {
    imagePath = resolveMediaSrc(mainMedia);
  } else if (Array.isArray(mainMedia) && mainMedia.length > 0) {
    const firstBlock = mainMedia[0];
    const firstPath = Array.isArray(firstBlock?.url) ? firstBlock.url[0] : firstBlock?.url;
    if (firstBlock?.tipo !== 'youtube') {
      imagePath = resolveMediaSrc(firstPath);
    }
  } else if (mainMedia && typeof mainMedia === 'object') {
    const firstPath = Array.isArray(mainMedia.url) ? mainMedia.url[0] : mainMedia.url;
    if (mainMedia.tipo !== 'youtube') {
      imagePath = resolveMediaSrc(firstPath);
    }
  }

  if (!imagePath && Array.isArray(projectData.galeria)) {
    const photosBlock = projectData.galeria.find(block => block.tipo === 'fotos' && Array.isArray(block.url) && block.url.length > 0);
    if (photosBlock) {
      imagePath = resolveMediaSrc(photosBlock.url[0]);
    }
  }

  if (!imagePath) {
    imagePath = DEFAULT_SOCIAL_IMAGE;
  }

  return new URL(imagePath, `${SITE_ORIGIN}/`).href;
}

function updateProjectSchema(description, canonicalUrl, imageUrl, categoryName) {
  if (!projectSchemaEl || !projectData) return;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: projectData.titulo,
    description,
    url: canonicalUrl,
    inLanguage: HTML_LANG_MAP[currentLanguage] || 'ca',
    genre: categoryName,
    image: imageUrl,
    creator: {
      '@type': 'Person',
      name: 'Paula Barjau',
      jobTitle: 'Maquilladora y hairstylist',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Barcelona',
        addressCountry: 'ES'
      }
    }
  };

  projectSchemaEl.textContent = JSON.stringify(schema);
}

function updateProjectSeo() {
  if (!projectData || !categoriesData) return;

  const category = categoriesData.home_categories[projectData.categoria];
  const categoryName = category?.[`name_${currentLanguage}`] || projectData.categoria;
  const template = PROJECT_DESCRIPTION_TEMPLATES[currentLanguage] || PROJECT_DESCRIPTION_TEMPLATES.cat;
  const description = template(projectData.titulo, categoryName);
  const canonicalUrl = getCanonicalProjectUrl();
  const imageUrl = getProjectSocialImageUrl();

  applyMeta({
    title: TAB_TITLE,
    description,
    canonicalUrl,
    imageUrl,
    lang: currentLanguage
  });

  updateProjectSchema(description, canonicalUrl, imageUrl, categoryName);
}

// Inicialización
async function init() {
  try {
    currentLanguage = resolveLangFromUrl();

    // Obtener slug de la URL (ruta limpia /p/<slug>/ o ?slug= antiguo)
    projectSlug = resolveSlugFromUrl();

    if (!projectSlug) {
      console.error('No se encontró el slug del proyecto');
      navigateTo('index.html');
      return;
    }

    await loadData();
    renderProject();
    setupEventListeners();
    langButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLanguage);
    });
    menuToggle.textContent = categoriesData.text_menu[currentLanguage];
    backBtn.textContent = categoriesData.text_back[currentLanguage];
    updateProjectSeo();
    updateUrlState(currentLanguage, isCleanProjectUrl() ? {} : { slug: projectSlug });
    console.log('Página de proyecto inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la página de proyecto:', error);
    renderErrorState();
  }
}

// Cargar datos desde JSON
async function loadData() {
  try {
    const [categoriesResponse, projectResponse] = await Promise.all([
      fetch('data/home_categories.json'),
      fetch(`data/${projectSlug}/${projectSlug}.json`)
    ]);

    if (!categoriesResponse.ok) {
      throw new Error('No se pudieron cargar las categorías');
    }

    if (!projectResponse.ok) {
      throw new Error('No se encontraron datos del proyecto');
    }

    categoriesData = await categoriesResponse.json();
    projectData = await projectResponse.json();

    console.log('Datos del proyecto cargados:', { categoriesData, projectData });
  } catch (error) {
    console.error('Error al cargar los datos del proyecto:', error);
    throw error;
  }
}

// Renderizar proyecto
function renderProject() {
  // Aplicar color de fondo según categoría
  const category = categoriesData.home_categories[projectData.categoria];
  document.documentElement.style.setProperty('--page-bg', category.bg);

  // Título
  projectTitle.textContent = projectData.titulo;

  // Créditos
  renderCredits();

  // Galería (incluye la imagen principal como primer item)
  renderGallery();

  // Botón "ver más [categoría]"
  updateMoreCategoryButton();
  updateProjectSeo();
}

// Renderizar créditos
function renderCredits() {
  creditsContainer.innerHTML = '';

  projectData.creditos.forEach(credito => {
    const creditItem = document.createElement('div');
    creditItem.className = 'credit-item';

    if (credito.tipo === 'extra') {
      // Crédito extra (texto especial)
      creditItem.className = 'credit-extra';
      creditItem.textContent = credito.texto[currentLanguage];
    } else {
      // Crédito normal
      const title = document.createElement('span');
      title.className = 'credit-title';
      title.textContent = credito.titulo[currentLanguage];

      const name = document.createElement('span');
      name.className = 'credit-name';

      if (credito.link) {
        const link = document.createElement('a');
        link.href = credito.link;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = credito.nombre;
        name.appendChild(link);
      } else {
        name.textContent = credito.nombre;
      }

      creditItem.appendChild(title);
      creditItem.appendChild(name);
    }

    creditsContainer.appendChild(creditItem);
  });
}

// La imagen principal puede venir como string, como bloque o como array de bloques
function normalizeMainMedia(media) {
  if (!media) return null;
  if (typeof media === 'string') return { tipo: 'fotos', url: media };
  if (Array.isArray(media)) return media[0] || null;
  if (typeof media === 'object') return media;
  return null;
}

// Añadir un item a la galería (foto, vídeo de YouTube o vídeo local)
function appendGalleryItem(tipo, url, { lazy = true } = {}) {
  if (!url) return;

  const item = document.createElement('div');
  item.className = 'gallery-item';

  if (tipo === 'youtube') {
    const videoId = extractYouTubeId(url);
    if (!videoId) return;
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    item.appendChild(iframe);
  } else if (tipo === 'video' || tipo === 'webm') {
    const videoSrc = resolveMediaSrc(url);
    if (!videoSrc) return;
    const video = document.createElement('video');
    video.src = videoSrc;
    video.controls = true;
    video.preload = 'metadata';
    item.appendChild(video);
  } else {
    const imgSrc = resolveMediaSrc(url);
    if (!imgSrc) return;
    const img = document.createElement('img');
    img.src = imgSrc;
    setImageAlt(img, projectData.titulo);
    if (lazy) img.loading = 'lazy';
    item.appendChild(img);
  }

  galleryContainer.appendChild(item);
}

// Renderizar galería. La imagen principal va como primer item.
function renderGallery() {
  galleryContainer.innerHTML = '';

  const mainBlock = normalizeMainMedia(projectData.imatge_principal);
  const mainUrl = mainBlock ? (Array.isArray(mainBlock.url) ? mainBlock.url[0] : mainBlock.url) : null;

  if (mainUrl) {
    appendGalleryItem(mainBlock.tipo || 'fotos', mainUrl, { lazy: false });
  }

  projectData.galeria.forEach(bloque => {
    bloque.url.forEach(url => {
      // Si la imagen principal también está en la galería, no la repetimos
      if (url === mainUrl) return;
      appendGalleryItem(bloque.tipo || 'fotos', url);
    });
  });
}

// Extraer ID de video de YouTube
function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Actualizar botón "ver más [categoría]"
function updateMoreCategoryButton() {
  const category = categoriesData.home_categories[projectData.categoria];
  const seeMoreText = categoriesData.text_see_more[currentLanguage];
  const categoryName = category[`name_${currentLanguage}`];

  moreCategoryBtn.textContent = `${seeMoreText} ${categoryName}`;
  moreCategoryBtn.style.color = category.color;
}

// Mostrar error visible cuando faltan datos del proyecto
function renderErrorState() {
  document.body.style.backgroundColor = '#fff';
  document.documentElement.style.setProperty('--page-bg', '#fff');
  document.documentElement.lang = HTML_LANG_MAP[currentLanguage] || 'ca';
  document.title = TAB_TITLE;
  const metaDescriptionEl = document.getElementById('meta-description');
  if (metaDescriptionEl) {
    metaDescriptionEl.content = ERROR_TEXTS.message[currentLanguage] || ERROR_TEXTS.message.cat;
  }
  projectTitle.textContent = ERROR_TEXTS.title[currentLanguage] || ERROR_TEXTS.title.cat;

  creditsContainer.innerHTML = '';
  galleryContainer.innerHTML = '';
  creditsContainer.style.display = 'none';
  galleryContainer.style.display = 'none';

  const message = document.createElement('p');
  message.textContent = ERROR_TEXTS.message[currentLanguage] || ERROR_TEXTS.message.cat;

  const homeLink = document.createElement('a');
  homeLink.href = new URL(buildUrl('index.html', { lang: currentLanguage }), document.baseURI).href;
  homeLink.textContent = ERROR_TEXTS.home[currentLanguage] || ERROR_TEXTS.home.cat;
  homeLink.className = 'menu-action-btn';

  const errorBox = document.createElement('div');
  errorBox.className = 'error-state-box';
  errorBox.appendChild(message);
  errorBox.appendChild(homeLink);

  if (mainEl) {
    mainEl.style.display = 'flex';
    mainEl.style.flexDirection = 'column';
    mainEl.style.alignItems = 'center';
    mainEl.style.justifyContent = 'center';
    mainEl.style.minHeight = '70vh';
    mainEl.appendChild(errorBox);
  }

  menuToggle.style.display = 'none';
  menuPanel.style.display = 'none';
}

// Cambiar idioma
function changeLanguage(lang) {
  if (!isValidLanguage(lang)) return;
  currentLanguage = lang;

  // Actualizar botones de idioma
  langButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Actualizar texto del botón del menú
  menuToggle.textContent = categoriesData.text_menu[lang];

  // Actualizar texto del botón back
  backBtn.textContent = categoriesData.text_back[lang];

  // Re-renderizar créditos y botón de categoría
  renderCredits();
  updateMoreCategoryButton();
  updateProjectSeo();
  updateUrlState(currentLanguage, isCleanProjectUrl() ? {} : { slug: projectSlug });
}

// Configurar event listeners
function setupEventListeners() {
  setupMenu({ menuToggle, menuPanel, langButtons, onLanguageChange: changeLanguage });

  // Botón back
  backBtn.addEventListener('click', () => {
    navigateTo('index.html', { lang: currentLanguage });
  });

  // Botón ver más de esta categoría
  moreCategoryBtn.addEventListener('click', () => {
    navigateTo('index.html', { category: projectData.categoria, lang: currentLanguage });
  });
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
