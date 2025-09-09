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

  const hero = canvas.parentElement;
  const ctx = canvas.getContext('2d', { alpha:true });

  let w, h, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let dots = [];
  const mouse = { x:-9999, y:-9999, inside:false };

  // ---------- Ajustes neutrales, elegantes y visibles ----------
  const DENSITY_BASE  = 14500; // px² por partícula (↓ = más)
  const LAYERS        = [      // dos capas para sensación de profundidad
    { speed:0.06, r:[1.2,2.2], alpha:1.00 },
    { speed:0.12, r:[0.9,1.6], alpha:0.85 },
  ];
  const LINK_DIST     = 110;
  const PARALLAX      = 0.010;
  const MOUSE_RADIUS  = 120;
  const FRICTION      = 0.986;
  const VMAX          = 0.35;

  // ---------- Utils ----------
  const cssVar = (n,f)=>getComputedStyle(document.body).getPropertyValue(n).trim()||f;

  function setSize(){
    const r = hero.getBoundingClientRect();
    w = canvas.width  = Math.floor(r.width  * dpr);
    h = canvas.height = Math.floor(r.height * dpr);
    canvas.style.width  = r.width  + 'px';
    canvas.style.height = r.height + 'px';
  }

  function makeDot(layer){
    const [rmin,rmax] = layer.r;
    const s = layer.speed;
    return {
      x: Math.random()*w, y: Math.random()*h,
      vx: (-s + Math.random()*(2*s))*dpr,
      vy: (-s + Math.random()*(2*s))*dpr,
      r: (rmin + Math.random()*(rmax-rmin))*dpr,
      a: layer.alpha, tw: Math.random()*Math.PI*2, layer
    };
  }

  function init(){
    setSize();
    dots = [];
    const area = (w*h)/(dpr*dpr);
    const baseCount = Math.max(36, Math.round(area / DENSITY_BASE));
    // repartir entre capas (60% delante, 40% fondo)
    const counts = [Math.round(baseCount*0.6), Math.round(baseCount*0.4)];
    dots.push(...Array.from({length:counts[0]}, ()=>makeDot(LAYERS[0])));
    dots.push(...Array.from({length:counts[1]}, ()=>makeDot(LAYERS[1])));
    loop();
  }

  function step(d){
    if (mouse.inside){
      d.x += (mouse.x - d.x) * PARALLAX * d.layer.speed; // parallax por capa
      d.y += (mouse.y - d.y) * PARALLAX * d.layer.speed;

      const dx=d.x-mouse.x, dy=d.y-mouse.y;
      const dist2=dx*dx+dy*dy, rad2=(MOUSE_RADIUS*dpr)*(MOUSE_RADIUS*dpr);
      if (dist2 < rad2){
        const m=Math.sqrt(dist2)||1, f=(1-dist2/rad2)*0.08;
        d.vx += (dx/m)*f; d.vy += (dy/m)*f;
      }
    }

    d.x+=d.vx; d.y+=d.vy;
    d.vx*=FRICTION; d.vy*=FRICTION;

    const vmax = VMAX*dpr;
    if (d.vx>vmax) d.vx=vmax; if (d.vx<-vmax) d.vx=-vmax;
    if (d.vy>vmax) d.vy=vmax; if (d.vy<-vmax) d.vy=-vmax;

    if (d.x<-20||d.x>w+20) d.vx*=-1;
    if (d.y<-20||d.y>h+20) d.vy*=-1;

    d.tw += 0.012; // twinkle suave
  }

  function draw(){
    ctx.clearRect(0,0,w,h);
    const dotColor  = cssVar('--particle-color','rgba(10,14,20,.8)');
    const lineColor = cssVar('--link-color','rgba(10,14,20,.18)');

    // PUNTOS (las dos capas en un pasado)
    for (let i=0;i<dots.length;i++){
      const d = dots[i];
      const tw = 0.92 + Math.sin(d.tw)*0.08;
      ctx.fillStyle = dotColor;
      ctx.globalAlpha = tw * d.a;
      ctx.beginPath();
      ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
      step(d);
    }

    // LÍNEAS
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1*dpr;
    const max2 = (LINK_DIST*dpr)*(LINK_DIST*dpr);
    for (let i=0;i<dots.length;i++){
      for (let j=i+1;j<dots.length;j++){
        const dx=dots[i].x-dots[j].x, dy=dots[i].y-dots[j].y;
        const d2=dx*dx+dy*dy;
        if (d2<max2){
          ctx.globalAlpha = 1 - d2/max2;
          ctx.beginPath(); ctx.moveTo(dots[i].x,dots[i].y); ctx.lineTo(dots[j].x,dots[j].y); ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function loop(){ draw(); requestAnimationFrame(loop); }

  // Interacción
  hero.addEventListener('mousemove', e=>{
    const r = hero.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * dpr;
    mouse.y = (e.clientY - r.top)  * dpr;
    mouse.inside = true;
  });
  hero.addEventListener('mouseleave', ()=>{ mouse.inside=false; mouse.x=mouse.y=-9999; });

  // Resize robusto
  const ro = new ResizeObserver(()=>setTimeout(init,80));
  ro.observe(hero);
  addEventListener('resize', ()=>setTimeout(init,80), {passive:true});

  init();
});


