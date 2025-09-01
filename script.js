(function () {
  const startBtn = document.getElementById('startBtn');
  const countLabel = document.getElementById('countLabel');
  const countdownWrapper = document.getElementById('countdownWrapper');
  const statusEl = document.getElementById('status');
  const modal = document.getElementById('launchModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const confettiCanvas = document.getElementById('confettiCanvas');
  const fireworksCanvas = document.getElementById('fireworksCanvas');

  const REDIRECT_URL = 'https://cs-tech-hub.vercel.app/';
  const START_VALUE = 10;
  const REDIRECT_DELAY = 5000; // 5 seconds
  const CELEBRATION_INTENSITY = 1.5; // Adjust (0.5 low – 1 normal – 1.5 high)
  let current = START_VALUE;
  let timerId = null;
  let started = false;
  let autoRedirectTimeout = null;

  // Multi-color backgrounds (index 0 for initial 10)
  const bgGradients = [
    'linear-gradient(145deg,#140b24,#201334 55%,#0e091a)',
    'linear-gradient(140deg,#1a0f33,#303560 60%,#141b32)',
    'linear-gradient(140deg,#112c38,#15545b 55%,#0c1f2c)',
    'linear-gradient(145deg,#1e2d40,#253f66 60%,#141e2c)',
    'linear-gradient(145deg,#311a39,#5a2d5f 55%,#1d0f23)',
    'linear-gradient(145deg,#2d1c20,#703036 55%,#1a1012)',
    'linear-gradient(145deg,#162c2e,#235e63 55%,#0c1e20)',
    'linear-gradient(145deg,#2d1c31,#68407e 55%,#190f22)',
    'linear-gradient(145deg,#1d253e,#3d4d82 55%,#12192b)',
    'linear-gradient(145deg,#2c2d18,#6e6b25 55%,#191a0d)',
    'linear-gradient(145deg,#1e2330,#343c5a 55%,#10141d)'
  ];

  // Multi-color number gradients per tick
  const numberGradients = [
    'linear-gradient(90deg,#ff005d,#ff8a00)',
    'linear-gradient(90deg,#ff8a00,#ffd500)',
    'linear-gradient(90deg,#ffd500,#27ff66)',
    'linear-gradient(90deg,#27ff66,#00e8ff)',
    'linear-gradient(90deg,#00e8ff,#007bff)',
    'linear-gradient(90deg,#007bff,#8a2fff)',
    'linear-gradient(90deg,#8a2fff,#ff00c8)',
    'linear-gradient(90deg,#ff00c8,#ff005d)',
    'linear-gradient(90deg,#ff005d,#ff7c38)',
    'linear-gradient(90deg,#ff7c38,#ffdd00)',
    'linear-gradient(90deg,#ffdd00,#27ff66)'
  ];

  function setBackground(index) {
    const i = Math.max(0, Math.min(index, bgGradients.length - 1));
    document.body.classList.add('dynamic-bg');
    document.body.style.background = bgGradients[i];
  }

  function setNumberGradient(index) {
    const i = Math.max(0, Math.min(index, numberGradients.length - 1));
    const gradient = numberGradients[i];
    countLabel.style.background = gradient;
    countLabel.style.webkitBackgroundClip = 'text';
    countLabel.style.backgroundClip = 'text';
    countLabel.style.color = 'transparent';
  }

  function updateDisplay() {
    countLabel.textContent = current.toString();
    const stepIndex = START_VALUE - current;
    setBackground(stepIndex);
    setNumberGradient(stepIndex);
    countLabel.classList.remove('tick-animate');
    void countLabel.offsetWidth;
    countLabel.classList.add('tick-animate');
  }

  function announce(message) { statusEl.textContent = message; }

  function tick() {
    current -= 1;
    if (current >= 0) updateDisplay();
    if (current <= 0) {
      clearInterval(timerId);
      timerId = null;
      launch();
    }
  }

  function showModal() {
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('show');
    modalCloseBtn.focus({ preventScroll: true });
    startCelebration();
  }

  function hideModal() {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    stopCelebration();
  }

  function launch() {
    announce('Website launched!');
    countLabel.textContent = '0';
    setNumberGradient(numberGradients.length - 1);
    showModal();
    autoRedirectTimeout = setTimeout(() => {
      window.location.href = REDIRECT_URL;
    }, REDIRECT_DELAY);
  }

  function startCountdown() {
    if (started) return;
    started = true;
    startBtn.disabled = true;
    countdownWrapper.classList.remove('hidden');
    current = START_VALUE;
    updateDisplay();
    announce('Countdown started.');
    timerId = setInterval(tick, 1000);
  }

  modalCloseBtn.addEventListener('click', () => {
    hideModal();
    if (autoRedirectTimeout) clearTimeout(autoRedirectTimeout);
  });

  modal.addEventListener('click', (e) => {
    if (e.target.dataset.close) {
      hideModal();
      if (autoRedirectTimeout) clearTimeout(autoRedirectTimeout);
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      hideModal();
      if (autoRedirectTimeout) clearTimeout(autoRedirectTimeout);
    }
  });

  startBtn.addEventListener('click', startCountdown);

  /* Celebration Effects */
  // CONFETTI (rect, circle, star) with hue drift
  let confettiCtx, confettiPieces = [], confettiAnimId = null, lastConfettiTime = 0;

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function createStarPath(ctx, spikes, outerR, innerR) {
    let rot = Math.PI / 2 * 3;
    let x = 0;
    let y = 0;
    ctx.moveTo(0, -outerR);
    for (let i = 0; i < spikes; i++) {
      x = Math.cos(rot) * outerR;
      y = Math.sin(rot) * outerR;
      ctx.lineTo(x, y);
      rot += Math.PI / spikes;
      x = Math.cos(rot) * innerR;
      y = Math.sin(rot) * innerR;
      ctx.lineTo(x, y);
      rot += Math.PI / spikes;
    }
    ctx.lineTo(0, -outerR);
  }

  function initConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    confettiCtx = confettiCanvas.getContext('2d');
    confettiPieces = [];
    const baseCount = Math.min(320, Math.floor((window.innerWidth * window.innerHeight) / 6500));
    const count = Math.round(baseCount * CELEBRATION_INTENSITY);
    for (let i = 0; i < count; i++) {
      const hue = rand(0, 360);
      confettiPieces.push({
        x: rand(0, confettiCanvas.width),
        y: rand(-confettiCanvas.height, 0),
        w: rand(6, 16),
        h: rand(8, 26),
        shape: (() => {
          const r = Math.random();
            if (r < 0.25) return 'circle';
            if (r < 0.35) return 'star';
            return 'rect';
        })(),
        hue,
        sat: rand(60, 90),
        light: rand(48, 70),
        hueShift: rand(-0.35, 0.35),
        vy: rand(2.2, 6.5),
        vx: rand(-2.8, 2.8),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.28, 0.28),
        opacity: rand(0.55, 0.95),
        tilt: rand(-0.5, 0.5)
      });
    }
  }

  function drawConfetti(ts) {
    if (!confettiCtx) return;
    const delta = lastConfettiTime ? (ts - lastConfettiTime) : 16;
    lastConfettiTime = ts;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiPieces.forEach(p => {
      p.x += p.vx * (delta / 16);
      p.y += p.vy * (delta / 16);
      p.rot += p.vr * (delta / 16);
      p.tilt += 0.012 * (delta / 16);
      p.hue += p.hueShift * (delta / 16);
      if (p.hue < 0) p.hue += 360;
      if (p.hue > 360) p.hue -= 360;

      if (p.y > confettiCanvas.height + 40) {
        p.y = -20;
        p.x = rand(0, confettiCanvas.width);
      }

      confettiCtx.save();
      confettiCtx.globalAlpha = p.opacity;
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rot);
      confettiCtx.transform(1, Math.sin(p.tilt) * 0.4, 0, 1, 0, 0);
      confettiCtx.fillStyle = `hsl(${p.hue} ${p.sat}% ${p.light}%)`;

      if (p.shape === 'circle') {
        confettiCtx.beginPath();
        confettiCtx.arc(0, 0, p.w * 0.5, 0, Math.PI * 2);
        confettiCtx.fill();
      } else if (p.shape === 'star') {
        confettiCtx.beginPath();
        createStarPath(confettiCtx, 5, p.w * 0.55, p.w * 0.25);
        confettiCtx.fill();
      } else {
        confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      confettiCtx.restore();
    });

    confettiAnimId = requestAnimationFrame(drawConfetti);
  }

  // FIREWORKS (rockets + bursts + trails) full spectrum
  let fwCtx, fireworks = [], rockets = [], fwAnimId = null, burstTimer = 0, rocketTimer = 0;

  function initFireworks() {
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
    fwCtx = fireworksCanvas.getContext('2d');
    fireworks = [];
    rockets = [];
    burstTimer = 0;
    rocketTimer = 0;
  }

  function spawnBurst(x, y, baseHue) {
    const particles = [];
    const count = rand(28, 46) * CELEBRATION_INTENSITY;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + rand(-0.25, 0.25);
      const speed = rand(1.6, 3.9);
      const life = rand(45, 78);
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        size: rand(1.6, 3.5),
        hue: baseHue + rand(-28, 28),
        sat: rand(55, 90),
        light: rand(55, 72),
        fade: rand(0.75, 1),
        trail: []
      });
    }
    fireworks.push({ particles });
  }

  function spawnRandomBurst() {
    const cx = rand(0.12, 0.88) * fireworksCanvas.width;
    const cy = rand(0.12, 0.55) * fireworksCanvas.height;
    const baseHue = rand(0, 360);
    spawnBurst(cx, cy, baseHue);
  }

  function spawnRocket() {
    const x = rand(0.12, 0.88) * fireworksCanvas.width;
    const y = fireworksCanvas.height + 12;
    const targetY = rand(0.18, 0.45) * fireworksCanvas.height;
    const baseHue = rand(0, 360);
    rockets.push({
      x, y,
      vx: rand(-0.25, 0.25),
      vy: rand(-7.6, -8.6),
      targetY,
      hue: baseHue,
      trail: []
    });
  }

  function updateRockets() {
    rockets.forEach(r => {
      r.x += r.vx;
      r.y += r.vy;
      r.vy += 0.1; // gravity decelerates
      r.trail.push({ x: r.x, y: r.y, alpha: 1 });
      if (r.trail.length > 22) r.trail.shift();
      if (r.y <= r.targetY || r.vy > 0) {
        spawnBurst(r.x, r.y, r.hue);
        r.dead = true;
      }
    });
    rockets = rockets.filter(r => !r.dead);
  }

  function drawFireworks() {
    if (!fwCtx) return;
    fwCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    burstTimer++;
    rocketTimer++;

    if (burstTimer % Math.round(50 / CELEBRATION_INTENSITY) === 0) spawnRandomBurst();
    if (rocketTimer % Math.round(42 / CELEBRATION_INTENSITY) === 0) spawnRocket();

    updateRockets();

    // Rockets
    rockets.forEach(r => {
      r.trail.forEach((t, i) => {
        fwCtx.globalAlpha = t.alpha * (i / r.trail.length);
        fwCtx.fillStyle = `hsl(${r.hue} 70% 65%)`;
        fwCtx.beginPath();
        fwCtx.arc(t.x, t.y, 2, 0, Math.PI * 2);
        fwCtx.fill();
        t.alpha -= 0.045;
      });
      fwCtx.globalAlpha = 1;
      fwCtx.fillStyle = `hsl(${r.hue} 80% 75%)`;
      fwCtx.beginPath();
      fwCtx.arc(r.x, r.y, 3, 0, Math.PI * 2);
      fwCtx.fill();
    });

    // Bursts
    fireworks.forEach(b => {
      b.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.018;
        p.life -= 1;
        const alpha = (p.life / p.maxLife) * p.fade;
        if (alpha > 0) {
          p.trail = p.trail || [];
          p.trail.push({ x: p.x, y: p.y, alpha: alpha * 0.6 });
          if (p.trail.length > 12) p.trail.shift();
          // trail
          p.trail.forEach((t, i) => {
            fwCtx.globalAlpha = t.alpha * (i / p.trail.length);
            fwCtx.fillStyle = `hsl(${p.hue} ${p.sat}% ${p.light}%)`;
            fwCtx.fillRect(t.x - 1, t.y - 1, 2, 2);
          });
          // particle
          fwCtx.globalAlpha = alpha;
          fwCtx.fillStyle = `hsl(${p.hue} ${p.sat}% ${p.light}%)`;
          fwCtx.beginPath();
          fwCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          fwCtx.fill();
        }
      });
      b.particles = b.particles.filter(p => p.life > 0);
    });
    fireworks = fireworks.filter(b => b.particles.length > 0);

    fwAnimId = requestAnimationFrame(drawFireworks);
  }

  function startCelebration() {
    initConfetti();
    confettiCanvas.classList.add('active');
    drawConfetti(performance.now());
    initFireworks();
    fireworksCanvas.classList.add('active');
    drawFireworks();
    window.addEventListener('resize', handleResize);
  }

  function stopCelebration() {
    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    if (fwAnimId) cancelAnimationFrame(fwAnimId);
    confettiCanvas.classList.remove('active');
    fireworksCanvas.classList.remove('active');
    window.removeEventListener('resize', handleResize);
  }

  function handleResize() {
    initConfetti();
    initFireworks();
  }
})();
