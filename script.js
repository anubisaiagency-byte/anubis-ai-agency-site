document.addEventListener('DOMContentLoaded', () => {
  // ----- Sectores -----
  const sectors = document.querySelectorAll('.sector');
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

  // ----- Pasos del proceso -----
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
    // Dividir por dos etiquetas <br> consecutivas para separar párrafos
    const rawHTML = aboutSection.innerHTML;
    const lines = rawHTML
      .split(/<br\\s*\\/?>\\s*<br\\s*\\/?>/i) // <-- en el archivo real debe quedar así: /<br\\s*\\/?>\\s*<br\\s*\\/?>/
      .map(l => l.trim())
      .filter(Boolean);

    // Vaciar el contenido original
    aboutSection.innerHTML = '';

    // Crear un contenedor por línea y asignar un retraso incremental
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
});
