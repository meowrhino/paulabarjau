// Menú deslizable compartido: toggle, cierre al clicar fuera y cambio de idioma

export function setupMenu({ menuToggle, menuPanel, langButtons, onLanguageChange }) {
  // El botón sube por encima del panel con --menu-height, y el CSS no puede
  // medir a un hermano, así que la altura se mide aquí.
  function syncMenuHeight() {
    document.documentElement.style.setProperty('--menu-height', `${menuPanel.offsetHeight}px`);
  }

  function toggleMenu() {
    const isOpen = menuPanel.classList.toggle('open');
    menuToggle.classList.toggle('menu-open', isOpen);

    if (isOpen) {
      syncMenuHeight();
    }
  }

  // Cerrar tras usar una opción del menú, para no tener que cerrarlo a mano.
  // Comprueba que esté abierto: así los llamados desde la carga de la página
  // (por ejemplo aplicar ?category= al entrar) no lo abren sin querer.
  function closeMenu() {
    if (menuPanel.classList.contains('open')) {
      toggleMenu();
    }
  }

  menuToggle.addEventListener('click', toggleMenu);

  // Si el panel cambia de alto con el menú ya abierto (girar el móvil,
  // redimensionar la ventana cruzando el breakpoint), hay que volver a medir: si
  // no, el botón se queda a la altura vieja y llega a solaparse con la lengüeta.
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(() => {
      if (menuPanel.classList.contains('open')) {
        syncMenuHeight();
      }
    }).observe(menuPanel);
  }

  document.addEventListener('click', (e) => {
    if (menuPanel.classList.contains('open') &&
        !menuPanel.contains(e.target) &&
        !menuToggle.contains(e.target)) {
      toggleMenu();
    }
  });

  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      onLanguageChange(btn.dataset.lang);
      closeMenu();
    });
  });

  return { toggleMenu, closeMenu };
}
