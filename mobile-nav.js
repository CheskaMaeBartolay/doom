// Kafka Hub mobile navigation
(() => {
  const nav = document.querySelector('.nav');
  const button = document.querySelector('.mobile-menu-btn');
  if (!nav || !button) return;

  button.addEventListener('click', () => {
    const open = nav.classList.toggle('mobile-open');
    button.textContent = open ? '✕' : '☰';
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('mobile-open');
      button.textContent = '☰';
      button.setAttribute('aria-expanded', 'false');
    });
  });
})();
