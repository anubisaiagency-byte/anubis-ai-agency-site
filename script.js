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
      themeToggle.textContent = '🌞';
    }
    // Al pulsar el botón se alterna la clase en el body y se guarda la preferencia
    themeToggle.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-theme');
      themeToggle.textContent = isDark ? '🌞' : '🌙';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }
});
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let w, h, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let dots = [];

  // Ajusta la densidad a tu gusto (cuanto mayor, más partículas)
  const BASE_DENSITY = 14000;    // px² por partícula (↑ = menos partículas)
  const SPEED = 0.18;            // velocidad base
  const R_MIN = 1.0, R_MAX = 2.4;

  const hero = canvas.parentElement;

  function setSize(){
    const r = hero.getBoundingClientRect();
    w = canvas.width  = Math.floor(r.width * dpr);
    h = canvas.height = Math.floor(r.height * dpr);
    canvas.style.width  = r.width  + 'px';
    canvas.style.height = r.height + 'px';
  }

  function makeDot(){
    return {
      x: Math.random()*w,
      y: Math.random()*h,
      vx: (-SPEED + Math.random()*(2*SPEED))*dpr,
      vy: (-SPEED + Math.random()*(2*SPEED))*dpr,
      r: (R_MIN + Math.random()*(R_MAX - R_MIN))*dpr
    };
  }

  function init(){
    setSize();
    dots = [];
    const area = (w*h)/(dpr*dpr);
    const count = Math.max(24, Math.round(area / BASE_DENSITY));
    for (let i=0;i<count;i++) dots.push(makeDot());
    loop();
  }

  function step(d){
    d.x += d.vx; d.y += d.vy;
    if (d.x < -20 || d.x > w+20) d.vx *= -1;
    if (d.y < -20 || d.y > h+20) d.vy *= -1;
  }

  function draw(){
    ctx.clearRect(0,0,w,h);
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue('--particle-color').trim() || 'rgba(0,0,0,.8)';
    ctx.fillStyle = color;
    for (let i=0;i<dots.length;i++){
      const d = dots[i];
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
      ctx.fill();
      step(d);
    }
  }

  function loop(){ draw(); requestAnimationFrame(loop); }

  // Resize robusto
  const ro = new ResizeObserver(() => setTimeout(init, 60));
  ro.observe(hero);
  window.addEventListener('resize', () => setTimeout(init, 60), {passive:true});

  init();
});
