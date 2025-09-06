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
});

