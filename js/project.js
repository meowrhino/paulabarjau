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

function setImageAlt(img, text) {
  img.alt = text || '';
}

// Inicialización
async function init() {
  try {
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
}

// Renderizar imagen principal
function renderMainImage() {
  const img = document.createElement('img');
  img.src = `data/${projectSlug}/img/${projectData.imatge_principal}`;
  setImageAlt(img, projectData.titulo);
  mainImageContainer.appendChild(img);
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
  homeLink.href = 'index.html';
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
}

// Configurar event listeners
function setupEventListeners() {
  // Toggle del menú
  menuToggle.addEventListener('click', toggleMenu);
  
  // Botón back
  backBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
  
  // Botón ver más de esta categoría
  moreCategoryBtn.addEventListener('click', () => {
    window.location.href = `index.html?category=${projectData.categoria}`;
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
