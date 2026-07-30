// Menú deslizable compartido: toggle, cierre al clicar fuera y cambio de idioma

export function setupMenu({ menuToggle, menuPanel, langButtons, onLanguageChange }) {
  function toggleMenu() {
    const isOpen = menuPanel.classList.toggle('open');
    menuToggle.classList.toggle('menu-open', isOpen);

    if (isOpen) {
      // Calcular altura del menú para ajustar el botón
      const menuHeight = menuPanel.offsetHeight;
      document.documentElement.style.setProperty('--menu-height', `${menuHeight}px`);
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
