// Estado global
let categoriesData = null;
let projectData = null;
let currentLanguage = 'cat';
let projectSlug = null;

// Elementos del DOM
const projectTitle = document.getElementById('project-title');
const mainImageContainer = document.getElementById('main-image-container');
const creditsContainer = document.getElementById('credits-container');
const galleryContainer = document.getElementById('gallery-container');
const menuToggle = document.getElementById('menu-toggle');
const menuPanel = document.getElementById('menu-panel');
const backBtn = document.getElementById('back-btn');
const moreCategoryBtn = document.getElementById('more-category-btn');
const langButtons = document.querySelectorAll('.lang-btn');
const mainEl = document.querySelector('main');
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
const HTML_LANG_MAP = {
  cat: 'ca',
  es: 'es',
  en: 'en'
};
const OG_LOCALE_MAP = {
  cat: 'ca_ES',
  es: 'es_ES',
  en: 'en_US'
};
const PROJECT_META_SUFFIX = {
  cat: 'Paula Barjau maquilladora a Barcelona',
  es: 'Paula Barjau maquilladora en Barcelona',
  en: 'Paula Barjau makeup artist in Barcelona'
};
const PROJECT_DESCRIPTION_TEMPLATES = {
  cat: (title, category) => `${title}. Projecte de ${category} de Paula Barjau, maquilladora i hairstylist a Barcelona.`,
  es: (title, category) => `${title}. Proyecto de ${category} de Paula Barjau, maquilladora y hairstylist en Barcelona.`,
  en: (title, category) => `${title}. ${category} project by Paula Barjau, makeup artist and hairstylist in Barcelona.`
};
const DEFAULT_SOCIAL_IMAGE = 'data/aitanaBonmati/img/fake_1.webp';

function setImageAlt(img, text) {
  img.alt = text || '';
}

function resolveMediaSrc(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path) || path.startsWith('//')) return path;
  return `data/${projectSlug}/img/${path}`;
}

function isValidLanguage(lang) {
  return Boolean(HTML_LANG_MAP[lang]);
}

function resolveLangFromUrl() {
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  return isValidLanguage(urlLang) ? urlLang : 'cat';
}

function getCanonicalProjectUrl() {
  return `${window.location.origin}${window.location.pathname}?slug=${encodeURIComponent(projectSlug)}`;
}

function getProjectSocialImageUrl() {
  if (!projectData) {
    return new URL(DEFAULT_SOCIAL_IMAGE, window.location.href).href;
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

  return new URL(imagePath, window.location.href).href;
}

function updateUrlState() {
  const params = new URLSearchParams(window.location.search);
  params.set('slug', projectSlug);
  if (currentLanguage !== 'cat') {
    params.set('lang', currentLanguage);
  } else {
    params.delete('lang');
  }

  const query = params.toString();
  window.history.replaceState({}, '', `${window.location.pathname}?${query}`);
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
  const title = `${projectData.titulo} | ${PROJECT_META_SUFFIX[currentLanguage] || PROJECT_META_SUFFIX.cat}`;
  const canonicalUrl = getCanonicalProjectUrl();
  const imageUrl = getProjectSocialImageUrl();

  document.title = title;
  document.documentElement.lang = HTML_LANG_MAP[currentLanguage] || 'ca';

  if (metaDescriptionEl) metaDescriptionEl.content = description;
  if (canonicalLinkEl) canonicalLinkEl.href = canonicalUrl;
  if (ogTitleEl) ogTitleEl.content = title;
  if (ogDescriptionEl) ogDescriptionEl.content = description;
  if (ogUrlEl) ogUrlEl.content = canonicalUrl;
  if (ogImageEl) ogImageEl.content = imageUrl;
  if (ogLocaleEl) ogLocaleEl.content = OG_LOCALE_MAP[currentLanguage] || OG_LOCALE_MAP.cat;
  if (twitterTitleEl) twitterTitleEl.content = title;
  if (twitterDescriptionEl) twitterDescriptionEl.content = description;
  if (twitterImageEl) twitterImageEl.content = imageUrl;

  updateProjectSchema(description, canonicalUrl, imageUrl, categoryName);
}

// Inicialización
async function init() {
  try {
    currentLanguage = resolveLangFromUrl();

    // Obtener slug de la URL
    const urlParams = new URLSearchParams(window.location.search);
    projectSlug = urlParams.get('slug');
    
    if (!projectSlug) {
      console.error('No se encontró el slug del proyecto');
      window.location.href = 'index.html';
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
    updateUrlState();
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
  
  // Imagen principal
  renderMainImage();
  
  // Créditos
  renderCredits();
  
  // Galería
  renderGallery();
  
  // Botón "ver más [categoría]"
  updateMoreCategoryButton();
  updateProjectSeo();
}

// Renderizar imagen principal
function renderMainImage() {
  mainImageContainer.innerHTML = '';
  const media = projectData.imatge_principal;
  if (!media) return;

  const renderBlock = (bloque) => {
    if (!bloque) return;
    const type = bloque.tipo || 'fotos';
    const firstUrl = Array.isArray(bloque.url) ? bloque.url[0] : bloque.url;
    if (!firstUrl) return;

    if (type === 'youtube') {
      const videoId = extractYouTubeId(firstUrl);
      if (!videoId) return;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      mainImageContainer.appendChild(iframe);
      return;
    }

    if (type === 'video' || type === 'webm') {
      const videoSrc = resolveMediaSrc(firstUrl);
      if (!videoSrc) return;
      const video = document.createElement('video');
      video.src = videoSrc;
      video.controls = true;
      video.preload = 'metadata';
      mainImageContainer.appendChild(video);
      return;
    }

    const imgSrc = resolveMediaSrc(firstUrl);
    if (!imgSrc) return;
    const img = document.createElement('img');
    img.src = imgSrc;
    setImageAlt(img, projectData.titulo);
    mainImageContainer.appendChild(img);
  };

  if (typeof media === 'string') {
    renderBlock({ tipo: 'fotos', url: media });
  } else if (Array.isArray(media)) {
    renderBlock(media[0]);
  } else if (media && typeof media === 'object') {
    renderBlock(media);
  }
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

// Renderizar galería
function renderGallery() {
  galleryContainer.innerHTML = '';
  
  projectData.galeria.forEach(bloque => {
    if (bloque.tipo === 'fotos') {
      // Renderizar fotos
      bloque.url.forEach(foto => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.src = `data/${projectSlug}/img/${foto}`;
        setImageAlt(img, projectData.titulo);
        img.loading = 'lazy';
        
        item.appendChild(img);
        galleryContainer.appendChild(item);
      });
    } else if (bloque.tipo === 'youtube') {
      // Renderizar videos de YouTube
      bloque.url.forEach(videoUrl => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const videoId = extractYouTubeId(videoUrl);
        if (videoId) {
          const iframe = document.createElement('iframe');
          iframe.src = `https://www.youtube.com/embed/${videoId}`;
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          iframe.allowFullscreen = true;
          
          item.appendChild(iframe);
          galleryContainer.appendChild(item);
        }
      });
    } else if (bloque.tipo === 'video' || bloque.tipo === 'webm') {
      // Renderizar videos locales (webm)
      bloque.url.forEach(videoFile => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const video = document.createElement('video');
        video.src = `data/${projectSlug}/img/${videoFile}`;
        video.controls = true;
        video.preload = 'metadata';
        
        item.appendChild(video);
        galleryContainer.appendChild(item);
      });
    }
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
  document.title = ERROR_TEXTS.title[currentLanguage] || ERROR_TEXTS.title.cat;
  if (metaDescriptionEl) {
    metaDescriptionEl.content = ERROR_TEXTS.message[currentLanguage] || ERROR_TEXTS.message.cat;
  }
  projectTitle.textContent = ERROR_TEXTS.title[currentLanguage] || ERROR_TEXTS.title.cat;
  
  mainImageContainer.innerHTML = '';
  creditsContainer.innerHTML = '';
  galleryContainer.innerHTML = '';
  mainImageContainer.style.display = 'none';
  creditsContainer.style.display = 'none';
  galleryContainer.style.display = 'none';
  
  const message = document.createElement('p');
  message.textContent = ERROR_TEXTS.message[currentLanguage] || ERROR_TEXTS.message.cat;
  
  const homeLink = document.createElement('a');
  const homeParams = new URLSearchParams();
  if (currentLanguage !== 'cat') {
    homeParams.set('lang', currentLanguage);
  }
  const homeQuery = homeParams.toString();
  homeLink.href = `index.html${homeQuery ? `?${homeQuery}` : ''}`;
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

// Toggle del menú
function toggleMenu() {
  const isOpen = menuPanel.classList.toggle('open');
  menuToggle.classList.toggle('menu-open', isOpen);
  
  if (isOpen) {
    const menuHeight = menuPanel.offsetHeight;
    document.documentElement.style.setProperty('--menu-height', `${menuHeight}px`);
  }
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
  updateUrlState();
}

// Configurar event listeners
function setupEventListeners() {
  // Toggle del menú
  menuToggle.addEventListener('click', toggleMenu);
  
  // Botón back
  backBtn.addEventListener('click', () => {
    const params = new URLSearchParams();
    if (currentLanguage !== 'cat') {
      params.set('lang', currentLanguage);
    }
    const query = params.toString();
    window.location.href = `index.html${query ? `?${query}` : ''}`;
  });
  
  // Botón ver más de esta categoría
  moreCategoryBtn.addEventListener('click', () => {
    const params = new URLSearchParams({ category: projectData.categoria });
    if (currentLanguage !== 'cat') {
      params.set('lang', currentLanguage);
    }
    window.location.href = `index.html?${params.toString()}`;
  });
  
  // Cambio de idioma
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      changeLanguage(btn.dataset.lang);
    });
  });
  
  // Cerrar menú al hacer click fuera
  document.addEventListener('click', (e) => {
    if (menuPanel.classList.contains('open') && 
        !menuPanel.contains(e.target) && 
        !menuToggle.contains(e.target)) {
      toggleMenu();
    }
  });
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
