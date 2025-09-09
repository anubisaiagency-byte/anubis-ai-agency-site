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
  const hero   = canvas.parentElement;
  const ctx    = canvas.getContext('2d', { alpha: true });

  let w, h, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let dots = [];
  // Config (ajusta a tu gusto)
  const AREA_PER_DOT = 18000; // ↑ área por partícula => menos cantidad
  const SPEED = 0.10;         // ↓ velocidad
  const R_MIN = 1.0, R_MAX = 2.2;
  const LINK_DIST = 90;       // ↓ distancia para líneas
  const MOUSE_RADIUS = 110;   // ↓ radio de repulsión
  const PARALLAX = 0.008;     // ↓ parallax

  const mouse = { x: -9999, y: -9999, inside: false };

  function setSize(){
    const r = hero.getBoundingClientRect();
    w = canvas.width  = Math.floor(r.width * dpr);
    h = canvas.height = Math.floor(r.height * dpr);
    canvas.style.width  = r.width  + 'px';
    canvas.style.height = r.height + 'px';
  }

  function colorVar(name, fallback){
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name).trim() || fallback;
  }

  function makeDot(){
    return {
      x: Math.random()*w, y: Math.random()*h,
      vx: (-SPEED + Math.random()*(2*SPEED))*dpr,
      vy: (-SPEED + Math.random()*(2*SPEED))*dpr,
      r: (R_MIN + Math.random()*(R_MAX - R_MIN))*dpr,
      tw: Math.random()*Math.PI*2, // twinkle fase
    };
  }

  function init(){
    setSize();
    dots = [];
    const area = (w*h)/(dpr*dpr);
    const count = Math.max(36, Math.round(area / AREA_PER_DOT));
    for (let i=0;i<count;i++) dots.push(makeDot());
    loop();
  }

  function step(d){
     // parallax y repulsión suaves
    if (mouse.inside){
      d.x += (mouse.x - d.x) * PARALLAX * 0.002;
      d.y += (mouse.y - d.y) * PARALLAX * 0.002;
  
      const dx = d.x - mouse.x, dy = d.y - mouse.y;
      const dist2 = dx*dx + dy*dy, rad2 = (MOUSE_RADIUS*dpr)*(MOUSE_RADIUS*dpr);
      if (dist2 < rad2){
        const m = Math.sqrt(dist2) || 1;
        const f = (1 - dist2/rad2) * 0.08;  // fuerza más baja
        d.vx += (dx/m) * f;
        d.vy += (dy/m) * f;
      }
    }
  
    // movimiento base
    d.x += d.vx; d.y += d.vy;
  
    // fricción para evitar “caos” y estabilizar
    d.vx *= 0.985;
    d.vy *= 0.985;
  
    // límite de velocidad máxima
    const max = 0.35 * dpr;
    if (d.vx >  max) d.vx =  max; if (d.vx < -max) d.vx = -max;
    if (d.vy >  max) d.vy =  max; if (d.vy < -max) d.vy = -max;
  
    // rebote suave
    if (d.x < -20 || d.x > w+20) d.vx *= -1;
    if (d.y < -20 || d.y > h+20) d.vy *= -1;
  
    // twinkle más sutil
    d.tw += 0.012;
    }

  function draw(){
    ctx.clearRect(0,0,w,h);
    const dotColor  = colorVar('--particle-color', 'rgba(0,0,0,.8)');
    const lineColor = colorVar('--link-color',     'rgba(0,0,0,.12)');

    // PUNTOS
    for (let i=0;i<dots.length;i++){
      const d = dots[i];
      const tw = 0.85 + Math.sin(d.tw)*0.15; // brillo sutil
      ctx.fillStyle = dotColor;
      ctx.globalAlpha = tw;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
      step(d);
    }

    // LÍNEAS
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1 * dpr;
    for (let i=0;i<dots.length;i++){
      for (let j=i+1;j<dots.length;j++){
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist2 = dx*dx + dy*dy;
        const max2 = (LINK_DIST*dpr)*(LINK_DIST*dpr);
        if (dist2 < max2){
          ctx.globalAlpha = 1 - dist2 / max2;
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

  // Eventos de interacción
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) * dpr;
    mouse.y = (e.clientY - rect.top)  * dpr;
    mouse.inside = true;
  });
  hero.addEventListener('mouseleave', () => { mouse.inside = false; mouse.x = mouse.y = -9999; });

  // Resize robusto
  const ro = new ResizeObserver(() => setTimeout(init, 60));
  ro.observe(hero);
  window.addEventListener('resize', () => setTimeout(init, 60), {passive:true});

  // Reaccionar a cambios de tema (clase/atributo en <html> o <body>)
  const mo = new MutationObserver(() => { /* colores se leen cada frame; no hace falta reiniciar */ });
  mo.observe(document.documentElement, { attributes:true, attributeFilter:['class','data-theme'] });

  init();
});
