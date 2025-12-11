// Estado global
let categoriesData = null;
let projectsData = null;
let currentLanguage = 'cat';
let activeCategory = null;

// Elementos del DOM
const projectsContainer = document.getElementById('projects-container');
const menuToggle = document.getElementById('menu-toggle');
const menuPanel = document.getElementById('menu-panel');
const categoriesContainer = document.getElementById('categories-container');
const langButtons = document.querySelectorAll('.lang-btn');

// Helpers
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

function closeAllOverlays() {
  document.querySelectorAll('.project-overlay.active').forEach(o => o.classList.remove('active'));
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

// Renderizar proyectos
function renderProjects() {
  projectsContainer.innerHTML = '';
  
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
  });
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
  
  // Click en "ver más" para ir al proyecto
  seeMore.addEventListener('click', (e) => {
    e.stopPropagation();
    window.location.href = `project.html?slug=${project.slug}`;
  });
  
  // Click en imagen para toggle del overlay
  img.addEventListener('click', (e) => {
    e.stopPropagation();
    // Desactivar otros overlays
    document.querySelectorAll('.project-overlay.active').forEach(o => {
      if (o !== overlay) o.classList.remove('active');
    });
    overlay.classList.toggle('active');
  });
  
  return card;
}

// Convertir hex a rgba
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Toggle de categoría
function toggleCategory(categoryCode, options = {}) {
  const { keepActive = false } = options;
  const categoryButtons = document.querySelectorAll('.category-btn');
  const projectCards = document.querySelectorAll('.project-card');
  closeAllOverlays();
  
  // Si se clickea la categoría activa, desactivar
  if (activeCategory === categoryCode && !keepActive) {
    activeCategory = null;
    
    // Restaurar todos los botones
    categoryButtons.forEach(btn => {
      btn.style.color = btn.dataset.color;
      btn.classList.remove('active', 'inactive');
    });
    
    // Mostrar todos los proyectos
    projectCards.forEach(card => {
      card.classList.remove('hidden');
    });
    
    // Restaurar fondo
    document.documentElement.style.setProperty('--page-bg', '#fff');
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
    
    // Filtrar proyectos
    projectCards.forEach(card => {
      if (card.dataset.category === categoryCode) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
    
    // Cambiar fondo al color de la categoría
    const categoryBg = categoriesData.home_categories[categoryCode].bg;
    document.documentElement.style.setProperty('--page-bg', categoryBg);
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
  closeAllOverlays();
  
  // Actualizar botones de idioma
  langButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  
  // Actualizar texto del botón del menú
  menuToggle.textContent = categoriesData.text_menu[lang];
  
  // Re-renderizar categorías y proyectos
  renderCategories();
  renderProjects();
  
  // Mantener el filtro activo si existe
  if (activeCategory) {
    toggleCategory(activeCategory, { keepActive: true });
  }
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
    
    // Cerrar overlays al hacer click fuera
    if (!e.target.closest('.project-card')) {
      document.querySelectorAll('.project-overlay.active').forEach(o => {
        o.classList.remove('active');
      });
    }
  });
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
