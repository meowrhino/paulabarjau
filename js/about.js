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
const DEFAULT_SOCIAL_IMAGE = 'data/aitanaBonmati/img/fake_1.webp';

function isValidLanguage(lang) {
  return Boolean(HTML_LANG_MAP[lang]);
}

function resolveLangFromUrl() {
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  return isValidLanguage(urlLang) ? urlLang : 'cat';
}

function setMenuTexts() {
  if (categoriesData) {
    menuToggle.textContent = categoriesData.text_menu[currentLanguage] || categoriesData.text_menu.cat;
    backBtn.textContent = categoriesData.text_back[currentLanguage] || categoriesData.text_back.cat;
  }
}

function updateUrlState() {
  const params = new URLSearchParams(window.location.search);
  if (currentLanguage !== 'cat') {
    params.set('lang', currentLanguage);
  } else {
    params.delete('lang');
  }

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}`;
  window.history.replaceState({}, '', nextUrl);
}

function updateAboutSeo() {
  const label = aboutData?.title?.[currentLanguage] || ABOUT_LABELS[currentLanguage];
  const description = aboutData?.paragraphs?.[currentLanguage]?.[0] || ABOUT_FALLBACK_DESCRIPTION[currentLanguage];
  const title = `${label} | ${ABOUT_TITLE_SUFFIX[currentLanguage]}`;
  const pageUrl = `${window.location.origin}${window.location.pathname}`;
  const imageUrl = new URL(DEFAULT_SOCIAL_IMAGE, window.location.href).href;

  document.title = title;
  document.documentElement.lang = HTML_LANG_MAP[currentLanguage] || 'ca';

  if (metaDescriptionEl) metaDescriptionEl.content = description;
  if (canonicalLinkEl) canonicalLinkEl.href = pageUrl;
  if (ogTitleEl) ogTitleEl.content = title;
  if (ogDescriptionEl) ogDescriptionEl.content = description;
  if (ogUrlEl) ogUrlEl.content = pageUrl;
  if (ogImageEl) ogImageEl.content = imageUrl;
  if (ogLocaleEl) ogLocaleEl.content = OG_LOCALE_MAP[currentLanguage] || OG_LOCALE_MAP.cat;
  if (twitterTitleEl) twitterTitleEl.content = title;
  if (twitterDescriptionEl) twitterDescriptionEl.content = description;
  if (twitterImageEl) twitterImageEl.content = imageUrl;
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

  updateAboutSeo();
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
  if (!isValidLanguage(lang)) return;
  currentLanguage = lang;
  langButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  setMenuTexts();
  renderAbout();
  updateUrlState();
}

function setupListeners() {
  menuToggle.addEventListener('click', toggleMenu);
  backBtn.addEventListener('click', () => {
    const params = new URLSearchParams();
    if (currentLanguage !== 'cat') {
      params.set('lang', currentLanguage);
    }
    const query = params.toString();
    window.location.href = `index.html${query ? `?${query}` : ''}`;
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
    currentLanguage = resolveLangFromUrl();
    await loadData();

    langButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLanguage);
    });

    setMenuTexts();
    renderAbout();
    updateUrlState();
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
