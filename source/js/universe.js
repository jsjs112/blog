(() => {
  if (window.__meteorTrailEffectInited) return;
  window.__meteorTrailEffectInited = true;

  const html = document.documentElement;
  const canvas = document.createElement('canvas');
  canvas.id = 'meteor-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });

  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars = [];
  let meteors = [];
  let trails = [];
  let pointer = { x: -9999, y: -9999, active: false, movedAt: 0 };
  let frame = 0;

  const rand = (min, max) => Math.random() * (max - min) + min;

  const palettes = {
    light: {
      clear: 'rgba(246,250,255,0.20)',
      star: ['rgba(120,164,255,0.35)', 'rgba(175,133,255,0.48)', 'rgba(255,255,255,0.75)'],
      meteor: ['rgba(255,255,255,0.95)', 'rgba(206,170,255,0.8)', 'rgba(139,195,255,0.7)'],
      trail: ['rgba(224,179,255,0.44)', 'rgba(186,157,255,0.28)', 'rgba(154,223,255,0.20)']
    },
    dark: {
      clear: 'rgba(8,11,26,0.30)',
      star: ['rgba(151,180,255,0.45)', 'rgba(203,167,255,0.55)', 'rgba(255,255,255,0.85)'],
      meteor: ['rgba(255,255,255,0.98)', 'rgba(214,177,255,0.9)', 'rgba(125,186,255,0.82)'],
      trail: ['rgba(212,160,255,0.50)', 'rgba(173,135,255,0.36)', 'rgba(140,212,255,0.24)']
    }
  };

  const getPalette = () => html.getAttribute('data-theme') === 'dark' ? palettes.dark : palettes.light;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const starCount = Math.max(90, Math.floor(width * 0.16));
    stars = Array.from({ length: starCount }, () => ({
      x: rand(0, width),
      y: rand(0, height),
      r: rand(0.4, 1.9),
      twinkle: rand(0.004, 0.015),
      alpha: rand(0.2, 1),
      drift: rand(-0.015, 0.03)
    }));

    meteors = [];
    trails = [];
  }

  function spawnMeteor(force = false) {
    const chance = html.getAttribute('data-theme') === 'dark' ? 0.18 : 0.14;
    if (!force && Math.random() > chance) return;

    const x = rand(width * 0.5, width * 1.1);
    const y = rand(-height * 0.2, height * 0.25);
    const speed = rand(10, 16);
    const angle = rand(Math.PI * 0.72, Math.PI * 0.82);

    meteors.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: rand(180, 320),
      width: rand(1.2, 2.6),
      life: 0,
      ttl: rand(70, 120)
    });
  }

  function updatePointer(x, y, active) {
    pointer.x = x;
    pointer.y = y;
    pointer.active = active;
    pointer.movedAt = performance.now();
    for (let i = 0; i < 2; i++) {
      trails.push({
        x: x + rand(-4, 4),
        y: y + rand(-4, 4),
        vx: rand(-0.25, 0.25),
        vy: rand(-0.3, 0.3),
        life: 0,
        ttl: rand(18, 34),
        size: rand(1.8, 3.4)
      });
    }
  }

  function drawStars(palette) {
    for (const s of stars) {
      s.alpha += s.twinkle * (Math.random() > 0.5 ? 1 : -1);
      if (s.alpha < 0.18 || s.alpha > 1) s.twinkle *= -1;
      s.y += s.drift;
      if (s.y > height + 2) s.y = -2;
      if (s.y < -2) s.y = height + 2;

      const color = palette.star[(Math.random() * palette.star.length) | 0].replace(/\d?\.?\d+\)$/u, `${Math.max(0.12, Math.min(1, s.alpha))})`);
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawMeteors(palette) {
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx;
      m.y += m.vy;
      m.life += 1;

      const fade = 1 - m.life / m.ttl;
      if (fade <= 0 || m.x < -m.len || m.y > height + m.len) {
        meteors.splice(i, 1);
        continue;
      }

      const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 11, m.y - m.vy * 11);
      grad.addColorStop(0, palette.meteor[0].replace(/\d?\.?\d+\)$/u, `${fade})`));
      grad.addColorStop(0.3, palette.meteor[1].replace(/\d?\.?\d+\)$/u, `${fade * 0.8})`));
      grad.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.beginPath();
      ctx.lineWidth = m.width;
      ctx.strokeStyle = grad;
      ctx.lineCap = 'round';
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * (m.len / 18), m.y - m.vy * (m.len / 18));
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = palette.meteor[0].replace(/\d?\.?\d+\)$/u, `${fade * 0.95})`);
      ctx.arc(m.x, m.y, m.width * 0.95, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawTrails(palette) {
    for (let i = trails.length - 1; i >= 0; i--) {
      const p = trails[i];
      p.life += 1;
      p.x += p.vx;
      p.y += p.vy;
      const k = 1 - p.life / p.ttl;

      if (k <= 0) {
        trails.splice(i, 1);
        continue;
      }

      const color = palette.trail[(i + frame) % palette.trail.length].replace(/\d?\.?\d+\)$/u, `${k})`);
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = color;
      ctx.arc(p.x, p.y, p.size * k, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function loop() {
    frame += 1;
    const palette = getPalette();

    ctx.clearRect(0, 0, width, height);

    drawStars(palette);
    if (frame % 2 === 0) spawnMeteor();
    if (frame % 4 === 0) spawnMeteor();
    drawMeteors(palette);
    drawTrails(palette);

    if (pointer.active && performance.now() - pointer.movedAt < 90) {
      updatePointer(pointer.x, pointer.y, true);
    }

    requestAnimationFrame(loop);
  }

  const onMove = (evt) => {
    if (evt.touches && evt.touches[0]) {
      updatePointer(evt.touches[0].clientX, evt.touches[0].clientY, true);
    } else {
      updatePointer(evt.clientX, evt.clientY, true);
    }
  };

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('mouseout', () => { pointer.active = false; }, { passive: true });
  window.addEventListener('touchend', () => { pointer.active = false; }, { passive: true });

  const observer = new MutationObserver(() => {
    spawnMeteor(true);
  });
  observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });

  resize();
  for (let i = 0; i < 4; i++) spawnMeteor(true);
  loop();
})();