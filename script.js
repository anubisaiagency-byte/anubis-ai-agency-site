document.addEventListener('DOMContentLoaded', () => {
  // ----- Sectores -----
  const sectors = document.querySelectorAll('.sector');
  // Asignamos un retraso incremental para que aparezcan uno tras otro
  sectors.forEach((el, idx) => {
    el.style.transitionDelay = `${idx * 0.15}s`;
  });
  // Creamos un observador para detectar cuándo entran en pantalla
  const sectorObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Deja de observarlo tras animarlo
      }
    });
  }, { threshold: 0.2 }); // 0.2 = se activa cuando el 20% del elemento es visible
  sectors.forEach(el => sectorObserver.observe(el));

  // ----- Pasos del proceso -----
  const steps = document.querySelectorAll('.paso');
  steps.forEach((el, idx) => {
    el.style.transitionDelay = `${idx * 0.2}s`;
  });
  const stepObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  steps.forEach(el => stepObserver.observe(el));
    // ----- Quiénes somos: fragmentar el texto y animar cada línea -----
  const aboutSection = document.querySelector('#quienes .section-text');
  if (aboutSection) {
    // Dividir por dos o más etiquetas <br> para separar los párrafos
    const rawHTML = aboutSection.innerHTML;
    const lines = rawHTML
      .split(/<br\\s*\\/?>\\s*<br\\s*\\/?>/i)
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

