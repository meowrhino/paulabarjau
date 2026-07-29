import { SITE_ORIGIN, TAB_TITLE, DEFAULT_SOCIAL_IMAGE, applyMeta } from './lib/seo.js';
import { isValidLanguage, resolveLangFromUrl, updateUrlState, buildUrl } from './lib/i18n.js';
import { setupMenu } from './lib/menu.js';

// Estado
let aboutData = null;
let categoriesData = null;
let currentLanguage = 'cat';

// DOM
const aboutTitleEl = document.getElementById('about-title');
const aboutTextEl = document.getElementById('about-text');
const aboutContactEl = document.getElementById('about-contact');
const menuToggle = document.getElementById('menu-toggle');
const menuPanel = document.getElementById('menu-panel');
const backBtn = document.getElementById('back-btn');
const langButtons = document.querySelectorAll('.lang-btn');

const ABOUT_LABELS = {
  cat: 'sobre mi',
  es: 'sobre mí',
  en: 'about me'
};
const ABOUT_TITLE_SUFFIX = {
  cat: 'Paula Barjau maquilladora a Barcelona',
  es: 'Paula Barjau maquilladora en Barcelona',
  en: 'Paula Barjau makeup artist in Barcelona'
};
const ABOUT_FALLBACK_DESCRIPTION = {
  cat: 'Coneix Paula Barjau, maquilladora i hairstylist basada a Barcelona especialitzada en moda, retrat i audiovisual.',
  es: 'Conoce a Paula Barjau, maquilladora y hairstylist en Barcelona especializada en moda, retrato y audiovisual.',
  en: 'Meet Paula Barjau, Barcelona-based makeup artist and hairstylist focused on fashion, portrait and film.'
};

function setMenuTexts() {
  if (categoriesData) {
    menuToggle.textContent = categoriesData.text_menu[currentLanguage] || categoriesData.text_menu.cat;
    backBtn.textContent = categoriesData.text_back[currentLanguage] || categoriesData.text_back.cat;
  }
}

function updateAboutSeo() {
  const label = aboutData?.title?.[currentLanguage] || ABOUT_LABELS[currentLanguage];
  const description = aboutData?.paragraphs?.[currentLanguage]?.[0] || ABOUT_FALLBACK_DESCRIPTION[currentLanguage];
  const seoTitle = `${label} | ${ABOUT_TITLE_SUFFIX[currentLanguage]}`;
  const canonicalUrl = `${SITE_ORIGIN}/about.html`;
  const imageUrl = new URL(DEFAULT_SOCIAL_IMAGE, `${SITE_ORIGIN}/`).href;

  applyMeta({
    title: seoTitle,
    description,
    canonicalUrl,
    imageUrl,
    lang: currentLanguage
  });
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

  const title = aboutData.title?.[currentLanguage] || aboutData.title?.cat || ABOUT_LABELS.cat;
  aboutTitleEl.textContent = title;

  aboutTextEl.innerHTML = '';
  const paragraphs = aboutData.paragraphs?.[currentLanguage] || [];
  paragraphs.forEach(text => {
    const p = document.createElement('p');
    p.textContent = text;
    aboutTextEl.appendChild(p);
  });

  renderContact();
  updateAboutSeo();
}

// Instagram y correo, uno por línea, debajo del texto
function renderContact() {
  if (!aboutContactEl) return;
  aboutContactEl.innerHTML = '';

  (aboutData.contact || []).forEach(item => {
    if (!item?.text) return;
    const line = document.createElement('div');
    line.className = 'about-contact-line';

    if (item.link) {
      const link = document.createElement('a');
      link.href = item.link;
      link.textContent = item.text;
      if (!item.link.startsWith('mailto:')) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      line.appendChild(link);
    } else {
      line.textContent = item.text;
    }

    aboutContactEl.appendChild(line);
  });
}

function changeLanguage(lang) {
  if (!isValidLanguage(lang)) return;
  currentLanguage = lang;
  langButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  setMenuTexts();
  renderAbout();
  updateUrlState(currentLanguage);
}

function setupListeners() {
  setupMenu({ menuToggle, menuPanel, langButtons, onLanguageChange: changeLanguage });

  backBtn.addEventListener('click', () => {
    window.location.href = buildUrl('index.html', { lang: currentLanguage });
  });
}

async function init() {
  try {
    currentLanguage = resolveLangFromUrl();
    await loadData();

    langButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLanguage);
    });

    setMenuTexts();
    renderAbout();
    updateUrlState(currentLanguage);
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
