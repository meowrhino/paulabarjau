// Estado
let aboutData = null;
let categoriesData = null;
let currentLanguage = 'cat';

// DOM
const aboutTitleEl = document.getElementById('about-title');
const aboutTextEl = document.getElementById('about-text');
const menuToggle = document.getElementById('menu-toggle');
const menuPanel = document.getElementById('menu-panel');
const backBtn = document.getElementById('back-btn');
const langButtons = document.querySelectorAll('.lang-btn');

function setMenuTexts() {
  if (categoriesData) {
    menuToggle.textContent = categoriesData.text_menu[currentLanguage] || categoriesData.text_menu.cat;
    backBtn.textContent = categoriesData.text_back[currentLanguage] || categoriesData.text_back.cat;
  }
}

async function loadData() {
  const [aboutRes, categoriesRes] = await Promise.allSettled([
    fetch('data/about.json'),
    fetch('data/home_categories.json')
  ]);

  if (aboutRes.status === 'fulfilled' && aboutRes.value.ok) {
    aboutData = await aboutRes.value.json();
  } else {
    throw new Error('No se pudo cargar about.json');
  }

  if (categoriesRes.status === 'fulfilled' && categoriesRes.value.ok) {
    categoriesData = await categoriesRes.value.json();
  }
}

function renderAbout() {
  if (!aboutData) return;

  const title = (aboutData.title && aboutData.title[currentLanguage]) || aboutData.title?.cat || 'sobre mi';
  aboutTitleEl.textContent = title;

  aboutTextEl.innerHTML = '';
  const paragraphs = aboutData.paragraphs?.[currentLanguage] || [];
  paragraphs.forEach(text => {
    const p = document.createElement('p');
    p.textContent = text;
    aboutTextEl.appendChild(p);
  });
}

function toggleMenu() {
  const isOpen = menuPanel.classList.toggle('open');
  menuToggle.classList.toggle('menu-open', isOpen);
  if (isOpen) {
    const menuHeight = menuPanel.offsetHeight;
    document.documentElement.style.setProperty('--menu-height', `${menuHeight}px`);
  }
}

function changeLanguage(lang) {
  currentLanguage = lang;
  langButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  setMenuTexts();
  renderAbout();
}

function setupListeners() {
  menuToggle.addEventListener('click', toggleMenu);
  backBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      changeLanguage(btn.dataset.lang);
    });
  });

  document.addEventListener('click', (e) => {
    if (menuPanel.classList.contains('open') &&
        !menuPanel.contains(e.target) &&
        !menuToggle.contains(e.target)) {
      toggleMenu();
    }
  });
}

async function init() {
  try {
    await loadData();
    setMenuTexts();
    renderAbout();
    setupListeners();
  } catch (err) {
    console.error('Error cargando about:', err);
    aboutTitleEl.textContent = 'Error';
    aboutTextEl.textContent = 'No se pudo cargar la información.';
    menuToggle.style.display = 'none';
    menuPanel.style.display = 'none';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
