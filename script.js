// script.js
//
// Este archivo contiene código para añadir interactividad y
// animaciones a la página de Anubis AI Agency. En concreto,
// implementamos efectos de aparición progresiva de los sectores
// y de los pasos del proceso cuando entran en el viewport y un
// retraso incremental para que aparezcan uno tras otro.

document.addEventListener('DOMContentLoaded', () => {
  // Animaciones de aparición para las tarjetas de sectores
  const sectors = document.querySelectorAll('.sector');
  // Asignar un retraso incremental para cada sector
  sectors.forEach((el, idx) => {
    el.style.transitionDelay = `${idx * 0.15}s`;
  });
  const sectorObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  sectors.forEach(el => sectorObserver.observe(el));

  // Animaciones de aparición para los pasos del proceso
  const pasos = document.querySelectorAll('.paso');
  pasos.forEach((el, idx) => {
    el.style.transitionDelay = `${idx * 0.2}s`;
  });
  const pasoObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  pasos.forEach(el => pasoObserver.observe(el));

  // ----- Quiénes somos: fragmentar el texto y animar cada línea -----
  const aboutSection = document.querySelector('#quienes .section-text');
  if (aboutSection) {
    // Dividir por dobles saltos de línea (<br><br>)
    const rawHTML = aboutSection.innerHTML;
    // Expresión regular para dividir por dos o más etiquetas <br>
    const lines = rawHTML.split(/<br\s*\/?>\s*<br\s*\/?>/i).map(l => l.trim()).filter(Boolean);
    // Vaciar el contenido original
    aboutSection.innerHTML = '';
    // Crear una línea para cada segmento y asignar retraso de transición
    lines.forEach((line, idx) => {
      const div = document.createElement('div');
      div.className = 'about-line';
      div.innerHTML = line;
      div.style.transitionDelay = `${idx * 0.2}s`;
      aboutSection.appendChild(div);
    });
    // Observer para activar la animación cuando la sección sea visible
    const aboutObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          aboutSection.querySelectorAll('.about-line').forEach(el => el.classList.add('visible'));
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    aboutObserver.observe(aboutSection);
  }

  // ----- Tema oscuro: añadir la posibilidad de alternar entre claro y oscuro -----
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    // Comprobar el tema guardado en localStorage y aplicarlo
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      themeToggle.textContent = '☀';
    }
    // Al pulsar el botón se alterna la clase en el body y se guarda la preferencia
    themeToggle.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-theme');
      themeToggle.textContent = isDark ? '🌞' : '🌙';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }
});
