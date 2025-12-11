// Estado global
let categoriesData = null;
let projectsData = null;
let currentLanguage = 'cat';
let activeCategory = null;
let projectCards = [];

// Elementos del DOM
const projectsContainer = document.getElementById('projects-container');
const menuToggle = document.getElementById('menu-toggle');
const menuPanel = document.getElementById('menu-panel');
const categoriesContainer = document.getElementById('categories-container');
const langButtons = document.querySelectorAll('.lang-btn');

// Helpers
const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function setImageAlt(img, text) {
  img.alt = text || '';
}

function compareProjects(a, b) {
  const relevanceA = Number.isFinite(Number(a.relevance)) ? Number(a.relevance) : Number.MAX_SAFE_INTEGER;
  const relevanceB = Number.isFinite(Number(b.relevance)) ? Number(b.relevance) : Number.MAX_SAFE_INTEGER;
  
  if (relevanceA !== relevanceB) {
    return relevanceA - relevanceB;
  }
  
  return new Date(b.date) - new Date(a.date);
}

function clearInlineLayout(card) {
  card.style.position = '';
  card.style.top = '';
  card.style.left = '';
  card.style.width = '';
  card.style.height = '';
  card.style.pointerEvents = '';
  card.style.opacity = '';
  card.style.transform = '';
}

// Inicialización
async function init() {
  try {
    await loadData();
    renderCategories();
    renderProjects();
    setupEventListeners();
    
    // Verificar si hay una categoría en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
      toggleCategory(categoryParam);
    }
    
    console.log('Aplicación inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error);
  }
}

// Cargar datos desde JSON
async function loadData() {
  try {
    const [categoriesResponse, projectsResponse] = await Promise.all([
      fetch('data/home_categories.json'),
      fetch('data/home_projects.json')
    ]);
    
    categoriesData = await categoriesResponse.json();
    projectsData = await projectsResponse.json();
    
    console.log('Datos cargados:', { categoriesData, projectsData });
  } catch (error) {
    console.error('Error al cargar los datos:', error);
    throw error;
  }
}

// Renderizar categorías en el menú
function renderCategories() {
  categoriesContainer.innerHTML = '';
  
  const categories = categoriesData.home_categories;
  
  Object.keys(categories).forEach(categoryKey => {
    const category = categories[categoryKey];
    const button = document.createElement('button');
    button.className = 'category-btn';
    button.dataset.category = category.code;
    button.textContent = category[`name_${currentLanguage}`];
    button.dataset.color = category.color;
    button.style.color = category.color;
    
    button.addEventListener('click', () => toggleCategory(category.code));
    
    categoriesContainer.appendChild(button);
  });
}

// Actualizar textos de categorías sin recrear nodos
function updateCategoryButtonsText() {
  const categories = categoriesData.home_categories;
  document.querySelectorAll('.category-btn').forEach(btn => {
    const code = btn.dataset.category;
    const category = categories[code];
    if (category) {
      btn.textContent = category[`name_${currentLanguage}`];
    }
  });
}

// Renderizar proyectos
function renderProjects() {
  projectsContainer.innerHTML = '';
  projectCards = [];
  
  const projects = projectsData.home_projects;
  
  // Convertir a array y ordenar por fecha (más reciente primero)
  const projectsArray = Object.keys(projects).map(key => ({
    slug: key,
    ...projects[key]
  }));
  
  projectsArray.sort(compareProjects);
  
  // Renderizar cada proyecto
  projectsArray.forEach(project => {
    const card = createProjectCard(project);
    projectsContainer.appendChild(card);
    card.dataset.visible = 'true';
    card.style.display = '';
    projectCards.push(card);
  });
  
  applyFilter(); // asegurar estado inicial coherente
}

// Crear tarjeta de proyecto
function createProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'project-card';
  card.dataset.category = project.categoria;
  card.dataset.slug = project.slug;
  
  // Obtener el color de la categoría
  const categoryColor = categoriesData.home_categories[project.categoria].color;
  
  // Imagen
  const img = document.createElement('img');
  img.src = `data/${project.slug}/img/${project.imatge_home}`;
  setImageAlt(img, project.sinopsis[currentLanguage]);
  img.loading = 'lazy';
  
  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'project-overlay';
  overlay.style.backgroundColor = hexToRgba(categoryColor, 0.5);
  overlay.dataset.category = project.categoria;
  
  // Sinopsis
  const sinopsis = document.createElement('div');
  sinopsis.className = 'project-sinopsis';
  sinopsis.textContent = project.sinopsis[currentLanguage];
  
  // Ver más
  const seeMore = document.createElement('div');
  seeMore.className = 'project-see-more';
  seeMore.textContent = categoriesData.text_see_more[currentLanguage];
  
  overlay.appendChild(sinopsis);
  overlay.appendChild(seeMore);
  
  card.appendChild(img);
  card.appendChild(overlay);
  card.addEventListener('click', () => {
    window.location.href = `project.html?slug=${project.slug}`;
  });
  
  return card;
}

// Actualizar textos y alt de las tarjetas existentes
function updateProjectCardsText() {
  projectCards.forEach(card => {
    const slug = card.dataset.slug;
    const project = projectsData.home_projects[slug];
    if (!project) return;
    
    const sinopsisText = project.sinopsis[currentLanguage];
    const seeMoreText = categoriesData.text_see_more[currentLanguage];
    
    const img = card.querySelector('img');
    if (img) setImageAlt(img, sinopsisText);
    
    const sinopsisEl = card.querySelector('.project-sinopsis');
    if (sinopsisEl) sinopsisEl.textContent = sinopsisText;
    
    const seeMoreEl = card.querySelector('.project-see-more');
    if (seeMoreEl) seeMoreEl.textContent = seeMoreText;
  });
}

// Convertir hex a rgba
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Animación FLIP del filtrado
function applyFilter() {
  const reduceMotion = reduceMotionQuery.matches;
  const shouldShow = (card) => !activeCategory || card.dataset.category === activeCategory;
  
  const staying = [];
  const entering = [];
  const exiting = [];
  const initialRects = new Map();
  
  // 1) Medir estado inicial de las cards visibles
  if (!reduceMotion) {
    projectCards.forEach(card => {
      if (card.style.display !== 'none') {
        initialRects.set(card, card.getBoundingClientRect());
      }
    });
  }
  
  // 2) Clasificar cards según si se quedan, entran o salen
  projectCards.forEach(card => {
    const wasVisible = card.dataset.visible !== 'false';
    const willBeVisible = shouldShow(card);
    
    if (wasVisible && willBeVisible) {
      staying.push(card);
    } else if (!wasVisible && willBeVisible) {
      entering.push(card);
    } else if (wasVisible && !willBeVisible) {
      exiting.push(card);
    }
  });
  
  if (reduceMotion) {
    entering.forEach(card => {
      card.dataset.visible = 'true';
      clearInlineLayout(card);
      card.style.display = '';
    });
    
    exiting.forEach(card => {
      card.dataset.visible = 'false';
      clearInlineLayout(card);
      card.style.display = 'none';
    });
    
    staying.forEach(clearInlineLayout);
    return;
  }
  
  const containerRect = projectsContainer.getBoundingClientRect();
  
  // 3) Sacar del flujo las que salen, fijando su tamaño/posición para animar la salida
  exiting.forEach(card => {
    const rect = initialRects.get(card);
    if (!rect) return;
    card.dataset.visible = 'false';
    card.style.position = 'absolute';
    card.style.top = `${rect.top - containerRect.top}px`;
    card.style.left = `${rect.left - containerRect.left}px`;
    card.style.width = `${rect.width}px`;
    card.style.height = `${rect.height}px`;
    card.style.pointerEvents = 'none';
    card.style.opacity = '1';
    card.style.transform = '';
  });
  
  // 4) Añadir las nuevas al flujo con estado inicial discreto
  entering.forEach(card => {
    card.dataset.visible = 'true';
    clearInlineLayout(card);
    card.style.display = '';
    card.style.opacity = '0';
    card.style.transform = 'translateY(12px) scale(0.98)';
  });
  
  // 5) Medir posiciones finales de las que se quedan
  const finalRects = new Map();
  staying.forEach(card => finalRects.set(card, card.getBoundingClientRect()));
  
  // 6) FLIP para las que permanecen
  staying.forEach(card => {
    const initial = initialRects.get(card);
    const final = finalRects.get(card);
    if (!initial || !final) return;
    
    const dx = initial.left - final.left;
    const dy = initial.top - final.top;
    if (dx === 0 && dy === 0) return;
    
    card.style.transition = 'none';
    card.style.transform = `translate(${dx}px, ${dy}px)`;
    card.getBoundingClientRect(); // fuerza reflow
    card.style.transition = '';
    card.style.transform = '';
  });
  
  // Animar entradas
  requestAnimationFrame(() => {
    entering.forEach(card => {
      card.style.opacity = '';
      card.style.transform = '';
    });
  });
  
  // Animar salidas y limpiar estilos al terminar
  exiting.forEach(card => {
    requestAnimationFrame(() => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(12px) scale(0.98)';
    });
    
    const onEnd = (event) => {
      if (event.propertyName !== 'opacity') return;
      if (card.dataset.visible === 'true') return; // ya ha vuelto a ser visible
      card.style.display = 'none';
      clearInlineLayout(card);
      card.removeEventListener('transitionend', onEnd);
    };
    
    card.addEventListener('transitionend', onEnd);
  });
}

// Toggle de categoría
function toggleCategory(categoryCode, options = {}) {
  const { keepActive = false } = options;
  const categoryButtons = document.querySelectorAll('.category-btn');
  
  // Si se clickea la categoría activa, desactivar
  if (activeCategory === categoryCode && !keepActive) {
    activeCategory = null;
    
    // Restaurar todos los botones
    categoryButtons.forEach(btn => {
      btn.style.color = btn.dataset.color;
      btn.classList.remove('active', 'inactive');
    });
    
    // Restaurar fondo
    document.documentElement.style.setProperty('--page-bg', '#fff');
    applyFilter();
  } else {
    // Activar nueva categoría
    activeCategory = categoryCode;
    
    // Actualizar botones
    categoryButtons.forEach(btn => {
      const cat = btn.dataset.category;
      if (cat === categoryCode) {
        btn.classList.add('active');
        btn.classList.remove('inactive');
        btn.style.color = '#fff';
      } else {
        btn.classList.add('inactive');
        btn.classList.remove('active');
        btn.style.color = '#000';
      }
    });
    
    // Cambiar fondo al color de la categoría
    const categoryBg = categoriesData.home_categories[categoryCode].bg;
    document.documentElement.style.setProperty('--page-bg', categoryBg);
    
    applyFilter();
  }
}

// Toggle del menú
function toggleMenu() {
  const isOpen = menuPanel.classList.toggle('open');
  menuToggle.classList.toggle('menu-open', isOpen);
  
  if (isOpen) {
    // Calcular altura del menú para ajustar el botón
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
  
  updateCategoryButtonsText();
  updateProjectCardsText();
  applyFilter();
}

// Configurar event listeners
function setupEventListeners() {
  // Toggle del menú
  menuToggle.addEventListener('click', toggleMenu);
  
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
