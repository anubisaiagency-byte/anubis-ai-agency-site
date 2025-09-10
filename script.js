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
// Partículas del hero – minimalistas, calmadas e interactivas
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;

  const hero = canvas.parentElement;
  const ctx = canvas.getContext('2d', { alpha: true });

  let w, h, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let dots = [];

  // —— Ajustes suaves (menos caos)
  const AREA_PER_DOT = 11000; // px² por partícula (↑ = menos densidad)
  const SPEED        = 0.10;  // velocidad base ↓
  const R_MIN = 1.3, R_MAX = 2.6;
  const LINK_DIST    = 140;    // conexiones cortas
  const MOUSE_RADIUS = 110;   // repulsión sutil
  const PARALLAX     = 0.008; // parallax sutil

  const mouse = { x: -9999, y: -9999, inside: false };

  function setSize(){
    const r = hero.getBoundingClientRect();
    w = canvas.width  = Math.floor(r.width * dpr);
    h = canvas.height = Math.floor(r.height * dpr);
    canvas.style.width  = r.width  + 'px';
    canvas.style.height = r.height + 'px';
  }
  function cssVar(name, fallback){
    return getComputedStyle(document.body).getPropertyValue(name).trim() || fallback;
  }
  function makeDot(){
    return {
      x: Math.random()*w, y: Math.random()*h,
      vx: (-SPEED + Math.random()*(2*SPEED))*dpr,
      vy: (-SPEED + Math.random()*(2*SPEED))*dpr,
      r: (R_MIN + Math.random()*(R_MAX - R_MIN))*dpr,
      tw: Math.random()*Math.PI*2
    };
  }
  function init(){
    setSize();
    dots = [];
    const area = (w*h)/(dpr*dpr);
    const count = Math.max(34, Math.round(area / AREA_PER_DOT));
    for (let i=0;i<count;i++) dots.push(makeDot());
    loop();
  }

  function step(d){
    // parallax + repulsión suaves
    if (mouse.inside){
      d.x += (mouse.x - d.x) * PARALLAX * 0.002;
      d.y += (mouse.y - d.y) * PARALLAX * 0.002;

      const dx = d.x - mouse.x, dy = d.y - mouse.y;
      const dist2 = dx*dx + dy*dy, rad2 = (MOUSE_RADIUS*dpr)*(MOUSE_RADIUS*dpr);
      if (dist2 < rad2){
        const m = Math.sqrt(dist2) || 1;
        const f = (1 - dist2/rad2) * 0.08; // fuerza baja
        d.vx += (dx/m) * f;
        d.vy += (dy/m) * f;
      }
    }

    d.x += d.vx; d.y += d.vy;

    // fricción para estabilizar y evitar caótico
    d.vx *= 0.985; d.vy *= 0.985;

    // límite de velocidad
    const vmax = 0.35 * dpr;
    if (d.vx >  vmax) d.vx =  vmax; if (d.vx < -vmax) d.vx = -vmax;
    if (d.vy >  vmax) d.vy =  vmax; if (d.vy < -vmax) d.vy = -vmax;

    // rebote suave en bordes
    if (d.x < -20 || d.x > w+20) d.vx *= -1;
    if (d.y < -20 || d.y > h+20) d.vy *= -1;

    // twinkle discreto
    d.tw += 0.012;
  }

  function draw(){
    ctx.clearRect(0,0,w,h);
    const dotColor  = cssVar('--particle-color', 'rgba(0,0,0,.8)');
    const lineColor = cssVar('--link-color',     'rgba(0,0,0,.12)');

    // puntos
    for (let i=0;i<dots.length;i++){
      const d = dots[i];
      const tw = 0.92 + Math.sin(d.tw)*0.08; // brillo muy sutil
      ctx.fillStyle = dotColor;
      ctx.globalAlpha = tw;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
      step(d);
    }

    // líneas
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1 * dpr;
    const max2 = (LINK_DIST*dpr)*(LINK_DIST*dpr);
    for (let i=0;i<dots.length;i++){
      for (let j=i+1;j<dots.length;j++){
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const d2 = dx*dx + dy*dy;
        if (d2 < max2){
          ctx.globalAlpha = 1 - d2 / max2;
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function loop(){ draw(); requestAnimationFrame(loop); }

  // interacción
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) * dpr;
    mouse.y = (e.clientY - rect.top)  * dpr;
    mouse.inside = true;
  });
  hero.addEventListener('mouseleave', () => { mouse.inside = false; mouse.x = mouse.y = -9999; });

  // resize robusto
  const ro = new ResizeObserver(() => setTimeout(init, 60));
  ro.observe(hero);
  window.addEventListener('resize', () => setTimeout(init, 60), {passive:true});

  init();
});
// ----- QUIÉNES SOMOS – Carrusel de tarjetas -----
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.about-slider');
  if (!slider) return;

  const viewport = slider.querySelector('.about-viewport');
  const track    = slider.querySelector('.about-track');
  const slides   = Array.from(track.children);
  const btnPrev  = slider.querySelector('.about-nav.prev');
  const btnNext  = slider.querySelector('.about-nav.next');
  const dotsWrap = slider.querySelector('.about-dots');

  let index = 0;
  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;

  // Crear puntos de paginación
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Ir a la tarjeta ${i+1}`);
    b.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(b);
  });

  function updateDots(){
    dotsWrap.querySelectorAll('button').forEach((b, i) => {
      b.setAttribute('aria-selected', i === index ? 'true' : 'false');
      b.tabIndex = i === index ? 0 : -1;
    });
  }

  function autoHeight(){
    // Ajusta la altura del viewport a la tarjeta actual para evitar saltos
    const h = slides[index].offsetHeight;
    viewport.style.height = h + 'px';
  }

  function goTo(i){
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    updateDots();
    autoHeight();
  }

  // Navegación con botones
  btnPrev.addEventListener('click', () => goTo(index - 1));
  btnNext.addEventListener('click', () => goTo(index + 1));

  // Navegación con teclado
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  goTo(index - 1);
    if (e.key === 'ArrowRight') goTo(index + 1);
  });
  // Permite enfocar el slider para teclas
  slider.tabIndex = 0;

  // Gestos (drag / swipe)
  function pointerDown(e){
    isDragging = true;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    track.style.transition = 'none';
  }
  function pointerMove(e){
    if (!isDragging) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    const dx = x - startX;
    const percent = dx / viewport.clientWidth * 100;
    track.style.transform = `translateX(calc(-${index * 100}% + ${percent}%))`;
  }
  function pointerUp(e){
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = '';
    const x = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX);
    const dx = x - startX;
    if (Math.abs(dx) > viewport.clientWidth * 0.15){
      if (dx < 0) goTo(index + 1);
      else        goTo(index - 1);
    } else {
      goTo(index); // vuelve a su sitio
    }
  }

  track.addEventListener('mousedown', pointerDown);
  track.addEventListener('mousemove', pointerMove);
  window.addEventListener('mouseup', pointerUp);
  track.addEventListener('touchstart', pointerDown, {passive:true});
  track.addEventListener('touchmove',  pointerMove,  {passive:true});
  track.addEventListener('touchend',   pointerUp);

  // Recalcular al redimensionar
  const ro = new ResizeObserver(() => autoHeight());
  ro.observe(viewport);
  window.addEventListener('resize', autoHeight, {passive:true});

  // Init
  goTo(0);
});


