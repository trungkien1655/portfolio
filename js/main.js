/**
 * main.js — App logic: navigation, content population, scroll effects
 * ═══════════════════════════════════════════════════════════════════════
 * Entry point. Populates DOM from content.js, handles navigation,
 * scroll animations (GSAP), skills constellation (Canvas 2D), and
 * coordinates with scene.js for WebGL.
 */

(() => {
  'use strict';

  // Lấy dữ liệu nội dung một cách an toàn
  const C =
    (typeof window !== 'undefined' && window.CONTENT) ||
    (typeof CONTENT !== 'undefined' ? CONTENT : null);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let sceneModuleRef = null;

  // ═══════════════════════════════════════════
  // HÀM TẮT LOADER AN TOÀN
  // ═══════════════════════════════════════════
  function dismissLoader() {
    if (typeof window.__dismissLoader === 'function') {
      window.__dismissLoader();
    } else {
      const loader = document.getElementById('loading-screen');
      if (loader) loader.classList.add('hidden');
    }
  }

  // ═══════════════════════════════════════════
  // KHỞI ĐỘNG (XỬ LÝ ĐÚNG READYSTATE)
  // ═══════════════════════════════════════════
  function start() {
    try {
      if (C) {
        populateContent();
      } else {
        console.warn('Cảnh báo: CONTENT chưa sẵn sàng.');
      }
      initNav();
      initScrollSpy();
      initCopyEmail();
      initAudioToggle();
      // Constellation SVG map is initialized in populateContent
    } catch (err) {
      console.error('Lỗi khi dựng nội dung trang:', err);
    }

    // Luôn tiến hành khởi tạo WebGL / Fallback và tắt loader
    initApp();
  }

  // ═══════════════════════════════════════════
  // POPULATE ALL CONTENT FROM content.js
  // ═══════════════════════════════════════════
  function populateContent() {
    if (!C) return;

    // ── Hero ──
    if (C.hero) {
      const heroNameEl = document.getElementById('hero-name');
      if (heroNameEl) {
        // Tách 2 dòng "TRẦN ĐĂNG" / "TRUNG KIÊN" vững chãi, cân đối
        heroNameEl.innerHTML = '<span class="hero-name__line">TRẦN ĐĂNG</span><span class="hero-name__line">TRUNG KIÊN</span>';
      }
      setText('hero-subtitle', C.hero.subtitle);
      const scrollText = document.querySelector('.hero-scroll__text');
      if (scrollText && C.hero.scrollCta) scrollText.textContent = C.hero.scrollCta;
    }

    // ── About ──
    if (C.about) {
      setText('about-label', C.about.label);
      setText('about-coords', C.about.coordinates);
      setText('about-bio', C.about.bio);

      const statsEl = document.getElementById('about-stats');
      if (statsEl && Array.isArray(C.about.stats)) {
        statsEl.innerHTML = '';
        C.about.stats.forEach((s, idx) => {
          const isHighlight = s.label.includes('IELTS') || s.value.includes('8.0');
          statsEl.insertAdjacentHTML(
            'beforeend',
            `<div class="stat-item telemetry-card">
              <div class="stat-header">
                <span class="stat-label mono">${esc(s.label)}</span>
                <span class="stat-code mono">SYS_0${idx + 1}</span>
              </div>
              <span class="stat-value ${isHighlight ? 'stat-value--highlight' : ''}">${esc(s.value)}</span>
            </div>`
          );
        });
      }
    }

    // ── Experience timeline ──
    if (C.experience) {
      setText('exp-label', C.experience.label);
      const timeline = document.getElementById('timeline');
      if (timeline && Array.isArray(C.experience.timeline)) {
        timeline.innerHTML = `
          <div class="timeline-track" aria-hidden="true"></div>
          <div class="timeline-progress" aria-hidden="true"></div>
        `;
        C.experience.timeline.forEach((item, idx) => {
          const el = document.createElement('div');
          el.className = 'timeline-item';
          const factor = (item.months || 3) / 3;
          el.style.setProperty('--duration-factor', factor);
          el.innerHTML = `
            <div class="timeline-planet planet-${idx}" aria-hidden="true" title="Điểm mốc: ${esc(item.title)}"></div>
            <div class="timeline-card">
              <div class="timeline-meta">
                <span class="timeline-period mono">${esc(item.period)}</span>
                <span class="timeline-dilation mono">Δt: ${esc(item.months || 2)} THÁNG</span>
              </div>
              <h3 class="timeline-title">${esc(item.title)}</h3>
              <p class="timeline-org">${esc(item.org)}</p>
              <p class="timeline-desc">${esc(item.desc)}</p>
            </div>`;
          timeline.appendChild(el);
        });
      }
    }

    // ── Activities ──
    if (C.activities) {
      setText('act-label', C.activities.label);
      const cards = document.getElementById('station-cards');
      if (cards && Array.isArray(C.activities.items)) {
        cards.innerHTML = '';
        C.activities.items.forEach(item => {
          const tasksHtml = Array.isArray(item.tasks)
            ? item.tasks.map(t => `<li>${esc(t)}</li>`).join('')
            : '';
          cards.insertAdjacentHTML(
            'beforeend',
            `<div class="station-card">
              <div class="station-corner corner-tl" aria-hidden="true"></div>
              <div class="station-corner corner-tr" aria-hidden="true"></div>
              <div class="station-corner corner-bl" aria-hidden="true"></div>
              <div class="station-corner corner-br" aria-hidden="true"></div>
              <div class="station-header">
                <span class="station-period mono">${esc(item.period)}</span>
                <span class="station-status mono">● DOCKING STATUS: ENGAGED</span>
              </div>
              <h3 class="station-title">${esc(item.title)}</h3>
              <p class="station-org">${esc(item.org)}</p>
              <div class="station-divider" aria-hidden="true"></div>
              <ul class="station-tasks">${tasksHtml}</ul>
            </div>`
          );
        });
      }
    }

    // ── Skills (4-Constellation Stellar Map) ──
    if (C.skills) {
      populateSkills();
    }

    // ── Contact ──
    if (C.contact) {
      setText('contact-label', C.contact.label);
      setText('contact-status', C.contact.status);
      const emailEl = document.getElementById('contact-email');
      if (emailEl) {
        emailEl.textContent = C.contact.email;
        emailEl.href = `mailto:${C.contact.email}`;
      }
      setText('contact-copy-text', C.contact.copyLabel);
      setText('contact-location', C.contact.location);
    }

    // ── Nav links ──
    if (Array.isArray(C.nav)) {
      const navLinks = document.getElementById('nav-links');
      if (navLinks) {
        navLinks.innerHTML = '';
        C.nav.forEach(item => {
          navLinks.insertAdjacentHTML(
            'beforeend',
            `<li><a href="#${item.target}" class="nav-link">${esc(item.label)}</a></li>`
          );
        });
      }
    }
  }

  // ═══════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════
  function initNav() {
    const nav = document.getElementById('main-nav');
    const toggle = document.querySelector('.nav-toggle');
    const links = document.getElementById('nav-links');
    if (!nav || !toggle || !links) return;

    // Background on scroll
    window.addEventListener(
      'scroll',
      () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
      },
      { passive: true }
    );

    // Mobile hamburger toggle
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      links.classList.toggle('open');
    });

    // Close menu on link click
    links.addEventListener('click', e => {
      if (e.target.classList.contains('nav-link')) {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('open');
      }
    });
  }

  // ═══════════════════════════════════════════
  // SCROLL SPY (active nav link)
  // ═══════════════════════════════════════════
  function initScrollSpy() {
    if (!('IntersectionObserver' in window)) return;
    const sections = document.querySelectorAll('.section[id]');

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${entry.target.id}`
            );
          });
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach(s => observer.observe(s));
  }

  // ═══════════════════════════════════════════
  // COPY EMAIL
  // ═══════════════════════════════════════════
  function initCopyEmail() {
    const btn = document.getElementById('contact-copy');
    const textEl = document.getElementById('contact-copy-text');
    if (!btn || !textEl || !C || !C.contact) return;

    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(C.contact.email);
      } catch {
        // Fallback cho trình duyệt cũ
        const ta = document.createElement('textarea');
        ta.value = C.contact.email;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
        } catch (e) {
          console.warn('Copy command failed', e);
        }
        document.body.removeChild(ta);
      }
      btn.classList.add('copied');
      textEl.textContent = C.contact.copySuccess;
      setTimeout(() => {
        btn.classList.remove('copied');
        textEl.textContent = C.contact.copyLabel;
      }, 2000);
    });
  }

  // ═══════════════════════════════════════════
  // WEB AUDIO API — AMBIENT SPACE SYNTHESIZER
  // ═══════════════════════════════════════════
  class SpaceAudioEngine {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.masterGain = null;
      this.tickTimer = null;
      this.nodes = [];
    }

    initContext() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
    }

    start() {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const t = this.ctx.currentTime;

      // Master Gain với đường cong fade-in êm ái
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, t);
      this.masterGain.gain.exponentialRampToValueAtTime(0.20, t + 2.0);
      this.masterGain.connect(this.ctx.destination);

      // Bộ lọc cộng hưởng vũ trụ (Cosmic Resonant Lowpass Filter)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, t);
      filter.Q.setValueAtTime(2.4, t);
      filter.connect(this.masterGain);

      // Dao động LFO tần số siêu thấp điều chế nhịp thở vũ trụ (Chu kỳ 12s)
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.08, t);
      lfoGain.gain.setValueAtTime(110, t);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      // Osc 1: Tiếng drone nền sâu A1 (55Hz)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55.0, t);
      osc1.connect(filter);
      osc1.start();

      // Osc 2: Beating binaural A1 detune (55.35Hz sóng tam giác)
      const osc2 = this.ctx.createOscillator();
      const osc2Gain = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(55.35, t);
      osc2Gain.gain.setValueAtTime(0.32, t);
      osc2.connect(osc2Gain);
      osc2Gain.connect(filter);
      osc2.start();

      // Osc 3: Âm vực siêu trầm A0 (27.5Hz) rung cảm giác cabin không gian
      const oscSub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(27.5, t);
      subGain.gain.setValueAtTime(0.25, t);
      oscSub.connect(subGain);
      subGain.connect(filter);
      oscSub.start();

      this.nodes = [osc1, osc2, oscSub, lfo, lfoGain, osc2Gain, subGain, filter];

      // Nhịp thời gian giãn nở (Time Dilation Tick — tiếng gõ vi mô chu kỳ 1.5s đặc trưng Interstellar)
      this.tickTimer = setInterval(() => {
        if (!this.isPlaying || !this.ctx || !this.masterGain) return;
        try {
          const now = this.ctx.currentTime;
          const tickOsc = this.ctx.createOscillator();
          const tickGain = this.ctx.createGain();
          const tickFilter = this.ctx.createBiquadFilter();

          tickFilter.type = 'bandpass';
          tickFilter.frequency.setValueAtTime(1400, now);
          tickFilter.Q.setValueAtTime(3.8, now);

          tickOsc.type = 'triangle';
          tickOsc.frequency.setValueAtTime(280, now);
          tickOsc.frequency.exponentialRampToValueAtTime(70, now + 0.04);

          tickGain.gain.setValueAtTime(0.014, now);
          tickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

          tickOsc.connect(tickFilter);
          tickFilter.connect(tickGain);
          tickGain.connect(this.masterGain);

          tickOsc.start(now);
          tickOsc.stop(now + 0.045);
        } catch {}
      }, 1500);

      this.isPlaying = true;
    }

    stop() {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(t);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, t);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);

      if (this.tickTimer) {
        clearInterval(this.tickTimer);
        this.tickTimer = null;
      }

      setTimeout(() => {
        this.nodes.forEach(n => {
          try {
            if (n.stop) n.stop();
            n.disconnect();
          } catch {}
        });
        this.nodes = [];
        this.isPlaying = false;
      }, 900);
    }

    toggle() {
      if (this.isPlaying) {
        this.stop();
        return false;
      } else {
        this.start();
        return true;
      }
    }
  }

  function initAudioToggle() {
    const btn = document.getElementById('audio-toggle');
    if (!btn) return;

    let audio = null;

    btn.addEventListener('click', () => {
      if (!audio) audio = new SpaceAudioEngine();
      const active = audio.toggle();
      btn.setAttribute('aria-pressed', String(active));
      btn.classList.toggle('playing', active);
      const text = btn.querySelector('.audio-text');
      if (text) {
        text.textContent = active ? 'COMM: ACTIVE' : 'COMM: MUTE';
      }
    });
  }

  // ═══════════════════════════════════════════
  // ═══════════════════════════════════════════
  // SKILLS — 4-CONSTELLATION SVG RENDERING
  // ═══════════════════════════════════════════
  function populateSkills() {
    if (!C || !C.skills) return;
    setText('skills-label', C.skills.label);
    setText('skills-coords', C.skills.coords);

    const grid = document.getElementById('constellation-grid');
    const crossPanel = document.getElementById('crosslinks-panel');
    const srList = document.getElementById('skills-accessible-list');
    if (!grid) return;

    grid.innerHTML = '';

    const groups = C.skills.groups || [];
    const SVG_WIDTH = 560;
    const SVG_HEIGHT = 350;

    groups.forEach(group => {
      // 1. Calculate unique intra-constellation lines
      const starMap = new Map();
      group.stars.forEach(s => starMap.set(s.id, s));

      const connectionPairs = new Set();
      const linesSvgArr = [];

      group.stars.forEach(star => {
        const x1 = Math.round(star.x * SVG_WIDTH);
        const y1 = Math.round(star.y * SVG_HEIGHT);
        const links = star.links || [];

        links.forEach(targetId => {
          const target = starMap.get(targetId);
          if (!target) return;
          const key = [star.id, targetId].sort().join('--');
          if (connectionPairs.has(key)) return;
          connectionPairs.add(key);

          const x2 = Math.round(target.x * SVG_WIDTH);
          const y2 = Math.round(target.y * SVG_HEIGHT);

          linesSvgArr.push(`
            <line class="constellation-line"
                  data-from="${star.id}"
                  data-to="${targetId}"
                  x1="${x1}" y1="${y1}"
                  x2="${x2}" y2="${y2}"
                  stroke="${group.accent}"
                  stroke-width="1.2"
                  stroke-opacity="0.35"
                  stroke-linecap="round" />
          `);
        });
      });

      // 2. Generate star nodes SVG
      const starsSvgArr = [];
      group.stars.forEach(star => {
        const cx = Math.round(star.x * SVG_WIDTH);
        const cy = Math.round(star.y * SVG_HEIGHT);
        const isApex = Boolean(star.isApex);

        // Smart text positioning: if cy > 270, place label above node to avoid bottom clipping
        const labelY = (cy > 270) ? -16 : (isApex ? 26 : 20);

        starsSvgArr.push(`
          <g class="constellation-node ${isApex ? 'constellation-node--apex' : ''}"
             data-star-id="${star.id}"
             data-group-id="${group.id}"
             transform="translate(${cx}, ${cy})"
             tabindex="0"
             role="button"
             aria-label="${esc(star.label)}${isApex ? ' — Apex Star (Kỹ năng đỉnh cao)' : ''}">
            
            ${isApex ? `
              <!-- Apex Star (IELTS 8.0) Concentric Pulsing Reticles -->
              <circle class="star-halo star-halo--apex" r="28" fill="url(#apex-halo)" opacity="0.65" />
              <circle class="star-ring star-ring--outer" r="16" stroke="#fde047" stroke-width="1.2" stroke-dasharray="3,3" opacity="0.8" />
              <circle class="star-ring star-ring--inner" r="10" stroke="#fef08a" stroke-width="1" opacity="0.9" />
              <circle class="star-core star-core--apex" r="5" fill="#ffffff" />
              <text class="star-label star-label--apex" x="0" y="${labelY}" text-anchor="middle">${esc(star.label)}</text>
              <text class="star-apex-badge mono" x="0" y="${labelY + 13}" text-anchor="middle">★ APEX STAR · OVERALL 8.0</text>
            ` : `
              <!-- Standard Star -->
              <circle class="star-halo" r="14" fill="url(#halo-${group.id})" opacity="0.45" />
              <circle class="star-ring" r="7.5" stroke="${group.accent}" stroke-width="1" opacity="0.65" />
              <circle class="star-core" r="3.2" fill="#ffffff" />
              <text class="star-label" x="0" y="${labelY}" text-anchor="middle">${esc(star.label)}</text>
              ${star.crossRef ? `<text class="star-crossref mono" x="0" y="${labelY + (cy > 270 ? -10 : 11)}" text-anchor="middle">[⟷ ${esc(star.crossRef)}]</text>` : ''}
            `}
          </g>
        `);
      });

      // 3. Constellation card HTML
      const cardHtml = `
        <article class="constellation-card" data-group-id="${group.id}" style="--constellation-accent: ${group.accent};">
          <header class="constellation-card__header">
            <div class="constellation-badge mono">
              <span class="constellation-code">${esc(group.code)}</span>
              <span class="constellation-star-count">${group.stars.length} STARS · ${connectionPairs.size} TETHERS</span>
            </div>
            <h3 class="constellation-title">${esc(group.title)}</h3>
            <p class="constellation-sub mono">${esc(group.subtitle)}</p>
          </header>

          <div class="constellation-card__svg-wrapper">
            <svg viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}"
                 class="constellation-svg"
                 aria-label="Chòm sao ${esc(group.title)}"
                 preserveAspectRatio="xMidYMid meet">
              <defs>
                <radialGradient id="halo-${group.id}" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="${group.accent}" stop-opacity="0.85" />
                  <stop offset="50%" stop-color="${group.accent}" stop-opacity="0.25" />
                  <stop offset="100%" stop-color="${group.accent}" stop-opacity="0" />
                </radialGradient>
                ${group.id === 'certifications' ? `
                  <radialGradient id="apex-halo" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
                    <stop offset="30%" stop-color="#fde047" stop-opacity="0.85" />
                    <stop offset="70%" stop-color="#e8a04c" stop-opacity="0.35" />
                    <stop offset="100%" stop-color="#e8a04c" stop-opacity="0" />
                  </radialGradient>
                ` : ''}
              </defs>

              <!-- Celestial Reticle / Astrometry grid -->
              <g class="constellation-reticle" opacity="0.14">
                <circle cx="${SVG_WIDTH / 2}" cy="${SVG_HEIGHT / 2}" r="135" fill="none" stroke="${group.accent}" stroke-width="0.8" stroke-dasharray="4,8" />
                <line x1="${SVG_WIDTH / 2}" y1="20" x2="${SVG_WIDTH / 2}" y2="${SVG_HEIGHT - 20}" stroke="${group.accent}" stroke-width="0.6" stroke-dasharray="2,6" />
                <line x1="40" y1="${SVG_HEIGHT / 2}" x2="${SVG_WIDTH - 40}" y2="${SVG_HEIGHT / 2}" stroke="${group.accent}" stroke-width="0.6" stroke-dasharray="2,6" />
              </g>

              <!-- Vector lines -->
              <g class="constellation-lines">
                ${linesSvgArr.join('')}
              </g>

              <!-- Star nodes -->
              <g class="constellation-stars">
                ${starsSvgArr.join('')}
              </g>
            </svg>
          </div>

          <footer class="constellation-card__footer mono">
            <span>NODES: ${group.stars.map(s => esc(s.id)).join(' · ')}</span>
          </footer>
        </article>
      `;

      grid.insertAdjacentHTML('beforeend', cardHtml);
    });

    // 4. Render Cross-links panel
    if (crossPanel && Array.isArray(C.skills.crossLinks)) {
      crossPanel.innerHTML = `
        <div class="crosslinks-panel__header">
          <span class="crosslinks-tag mono">● TETHERED CROSS-DISCIPLINARY MATRIX</span>
          <h4 class="crosslinks-title">Mạng lưới Liên kết Đa Chòm sao</h4>
          <p class="crosslinks-desc mono">Các liên kết xuyên ngành phản ánh sự tích hợp sâu giữa thương mại quốc tế, công cụ số, ngoại ngữ và năng lực tư duy.</p>
        </div>
        <div class="crosslinks-grid">
          ${C.skills.crossLinks.map(cl => `
            <div class="crosslink-card" data-from="${esc(cl.from)}" data-to="${esc(cl.to)}">
              <div class="crosslink-badge mono">
                <span class="crosslink-dot"></span>
                <span class="crosslink-name">${esc(cl.label)}</span>
              </div>
              <p class="crosslink-note mono">${esc(cl.desc || '')}</p>
            </div>
          `).join('')}
        </div>
      `;
    }

    // 5. Accessible Screen-reader list
    if (srList) {
      srList.innerHTML = `
        <h3>Danh mục Kỹ năng theo 4 Chòm sao (Trần Đăng Trung Kiên)</h3>
        ${groups.map(g => `
          <div>
            <h4>${esc(g.title)} (${esc(g.subtitle)})</h4>
            <ul>
              ${g.stars.map(s => `
                <li>
                  <strong>${esc(s.label)}</strong>
                  ${s.isApex ? ' — (Apex Star: Chứng chỉ Anh ngữ xuất sắc IELTS 8.0)' : ''}
                  ${s.crossRef ? ` — [Liên thông liên ngành: ${esc(s.crossRef)}]` : ''}
                </li>
              `).join('')}
            </ul>
          </div>
        `).join('')}
      `;
    }
  }

  // ═══════════════════════════════════════════
  // CINEMATIC INTRO CONTROLLER (GIAI ĐOẠN 1 & 2)
  // ═══════════════════════════════════════════
  class CinematicIntroController {
    constructor(sceneModule) {
      this.scene = sceneModule;
      this.overlay = document.getElementById('intro-overlay');
      this.titleEl = document.getElementById('intro-status-text');
      this.distEl = document.getElementById('intro-distance-text');
      this.skipBtn = document.getElementById('intro-skip');
      this.flashEl = document.getElementById('intro-flash');
      this.isComplete = false;
      this.timeline = null;
      this.failsafeTimer = null;
      this.keydownHandler = null;
    }

    shouldRun() {
      if (reducedMotion) return false;
      try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('force_intro')) return true;
        if (sessionStorage.getItem('visited_gargantua_intro') === '1') {
          return false;
        }
      } catch (e) {
        return false;
      }
      return true;
    }

    start() {
      if (!this.shouldRun()) {
        this.finish(true);
        return;
      }

      document.body.classList.add('intro-active');

      // Đặt camera và hố đen ở cự ly xa, chính giữa
      if (this.scene && typeof this.scene.setIntroActive === 'function') {
        this.scene.setIntroActive(true);
        this.scene.setIntroParams({
          cameraZ: 22.0,
          cameraX: 0.0,
          cameraY: 0.0,
          lookAtX: 0.0,
          lookAtY: 0.0,
          blackHoleX: 0.0,
          blackHoleY: 0.0,
          blackHoleZ: 0.0,
          blackHoleScale: 0.28,
          warpFactor: 0.0,
          cameraShake: 0.0,
        });
      }

      // Xử lý nút Skip và phím ESC
      if (this.skipBtn) {
        this.skipBtn.addEventListener('click', () => this.skip());
      }
      this.keydownHandler = (e) => {
        if (e.key === 'Escape') this.skip();
      };
      window.addEventListener('keydown', this.keydownHandler);

      // Failsafe timeout 12 giây
      this.failsafeTimer = setTimeout(() => {
        if (!this.isComplete) this.skip();
      }, 12000);

      const isMobile = window.innerWidth < 768;
      const g1Duration = isMobile ? 1.8 : 2.5;
      const g2Duration = isMobile ? 2.6 : 3.5;
      const wormholeDuration = isMobile ? 1.2 : 1.6;

      // ── Hoạt ảnh gõ chữ (Typewriter) ──
      const titleText = 'TIẾP CẬN GARGANTUA';
      if (this.titleEl) {
        this.titleEl.innerHTML = '<span class="intro-cursor">_</span>';
        let charIdx = 0;
        const typeInterval = Math.max(35, Math.floor((g1Duration * 1000 * 0.72) / titleText.length));
        const typeTimer = setInterval(() => {
          if (this.isComplete) {
            clearInterval(typeTimer);
            return;
          }
          charIdx++;
          if (charIdx <= titleText.length) {
            this.titleEl.innerHTML = titleText.slice(0, charIdx) + '<span class="intro-cursor">_</span>';
          } else {
            clearInterval(typeTimer);
          }
        }, typeInterval);
      }

      // ── Đo đạc khoảng cách Telemetry & Chuyến bay hố đen ──
      const telemetry = { dist: 1420000 };
      const updateDist = () => {
        if (!this.distEl || this.isComplete) return;
        const val = Math.max(0, Math.round(telemetry.dist));
        if (val === 0) {
          this.distEl.textContent = '0 KM · CHÂN TRỜI SỰ KIỆN';
        } else {
          this.distEl.textContent = 'KHOẢNG CÁCH: ' + val.toLocaleString('vi-VN') + ' KM';
        }
      };
      updateDist();

      const { gsap } = window;
      if (!gsap) {
        this.finish(true);
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          // Giai đoạn 3 kết thúc -> chuyển tiếp sang Hero
          this.finish(false);
        },
      });
      this.timeline = tl;

      // Giai đoạn 1 (0 -> g1Duration):
      // Khoảng cách giảm dần từ 1.420.000 xuống 980.000 KM
      tl.to(telemetry, {
        dist: 980000,
        duration: g1Duration,
        ease: 'power1.out',
        onUpdate: updateDist,
      }, 0);

      // Giai đoạn 2 (g1Duration -> g1Duration + g2Duration):
      // Khoảng cách lao dốc về 0 KM
      tl.to(telemetry, {
        dist: 0,
        duration: g2Duration,
        ease: 'power2.in',
        onUpdate: updateDist,
      }, g1Duration);

      // Three.js Camera & Black Hole Tween cho Giai đoạn 2
      const sceneParams = {
        cameraZ: 22.0,
        blackHoleScale: 0.28,
        warpFactor: 0.0,
        cameraShake: 0.0,
      };

      tl.call(() => {
        if (this.scene && typeof this.scene.setIntroParams === 'function') {
          this.scene.setIntroParams({ stage: 2 });
        }
      }, null, g1Duration);

      tl.to(sceneParams, {
        cameraZ: 1.8,
        blackHoleScale: 3.2,
        warpFactor: 1.0,
        cameraShake: 0.08,
        duration: g2Duration,
        ease: 'power2.in',
        onUpdate: () => {
          if (this.scene && typeof this.scene.setIntroParams === 'function') {
            this.scene.setIntroParams(sceneParams);
          }
        },
      }, g1Duration);

      // ── CHỚP SÁNG CHÂN TRỜI SỰ KIỆN (EVENT HORIZON FLASH) ──
      // Bắt đầu chớp sáng trước khi chạm chân trời sự kiện 0.22s
      const stage2End = g1Duration + g2Duration;
      const flashStart = Math.max(0, stage2End - 0.22);

      if (this.flashEl) {
        tl.to(this.flashEl, {
          opacity: 1,
          duration: 0.22,
          ease: 'power2.in',
        }, flashStart);
        tl.to(this.flashEl, {
          opacity: 0,
          duration: 0.40,
          ease: 'power2.out',
        }, stage2End);
      }

      // ── GIAI ĐOẠN 3: ĐƯỜNG HẦM KHÔNG-THỜI GIAN (WORMHOLE TRANSIT) ──
      const wormholeParams = {
        stage: 3,
        wormholeAlpha: 1.0,
        wormholeSpeed: 6.0,
        cameraShake: 0.02,
      };

      tl.call(() => {
        // Cập nhật trạng thái scene sang Wormhole
        if (this.scene && typeof this.scene.setIntroParams === 'function') {
          this.scene.setIntroParams(wormholeParams);
        }

        // Cập nhật giao diện HUD Telemetry
        const badgeEl = document.querySelector('.intro-badge');
        if (badgeEl) badgeEl.textContent = '● DỊCH CHUYỂN KHÔNG-THỜI GIAN';
        if (this.titleEl) {
          this.titleEl.innerHTML = 'WORMHOLE TRANSIT';
        }
        if (this.distEl) {
          this.distEl.textContent = 'VẬN TỐC: WARP 8.5 · KHÔNG-THỜI GIAN BIẾN DẠNG';
        }
      }, null, stage2End);

      // Di chuyển trong đường hầm với gia tốc tăng dần
      tl.to(wormholeParams, {
        wormholeSpeed: 7.6,
        duration: wormholeDuration,
        ease: 'power1.inOut',
        onUpdate: () => {
          if (this.scene && typeof this.scene.setIntroParams === 'function') {
            this.scene.setIntroParams(wormholeParams);
          }
        },
      }, stage2End);
    }

    skip() {
      if (this.isComplete) return;
      this.finish(false, true);
    }

    finish(immediate = false, isSkip = false) {
      if (this.isComplete) return;
      this.isComplete = true;

      const { gsap } = window;

      if (this.failsafeTimer) {
        clearTimeout(this.failsafeTimer);
        this.failsafeTimer = null;
      }
      if (this.keydownHandler) {
        window.removeEventListener('keydown', this.keydownHandler);
      }
      if (this.timeline) {
        this.timeline.kill();
      }

      // Tắt flash ngay lập tức nếu đang sáng
      if (this.flashEl) {
        if (gsap) gsap.killTweensOf(this.flashEl);
        this.flashEl.style.opacity = '0';
      }

      // Lưu cờ vào sessionStorage
      try {
        sessionStorage.setItem('visited_gargantua_intro', '1');
      } catch (e) {}

      const heroLayout = (this.scene && typeof this.scene.getHeroTargetLayout === 'function')
        ? this.scene.getHeroTargetLayout()
        : { cameraZ: 8.0, cameraX: 0, cameraY: 0, cameraRoll: 0, blackHoleX: 1.8, blackHoleY: 0, blackHoleScale: 1.0, warpFactor: 0, cameraShake: 0, wormholeAlpha: 0 };

      if (immediate || !gsap) {
        if (this.scene && typeof this.scene.setIntroActive === 'function') {
          this.scene.setIntroActive(false);
        }
        if (this.overlay) this.overlay.classList.add('hidden');
        document.body.classList.remove('intro-active');
        const nav = document.getElementById('main-nav');
        if (nav) nav.style.opacity = '1';
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) heroContent.style.opacity = '1';
        return;
      }

      // Chuyển mượt về Hero (Smooth transition)
      if (this.overlay) {
        gsap.to(this.overlay, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => {
            this.overlay.classList.add('hidden');
          },
        });
      }

      const currentParams = (this.scene && this.scene.introState)
        ? { ...this.scene.introState }
        : { cameraZ: 22, blackHoleX: 0, blackHoleY: 0, blackHoleScale: 0.28, warpFactor: 0, cameraShake: 0, wormholeAlpha: 0, cameraRoll: 0 };

      currentParams.stage = 4;
      currentParams.wormholeAlpha = 0.0;
      if (this.scene && typeof this.scene.setIntroParams === 'function') {
        this.scene.setIntroParams(currentParams);
      }

      gsap.to(currentParams, {
        cameraZ: heroLayout.cameraZ,
        cameraX: heroLayout.cameraX,
        cameraY: heroLayout.cameraY,
        cameraRoll: 0,
        blackHoleX: heroLayout.blackHoleX,
        blackHoleY: heroLayout.blackHoleY,
        blackHoleScale: heroLayout.blackHoleScale,
        warpFactor: 0,
        cameraShake: 0,
        wormholeAlpha: 0,
        duration: isSkip ? 0.65 : 1.0,
        ease: 'power2.out',
        onUpdate: () => {
          if (this.scene && typeof this.scene.setIntroParams === 'function') {
            this.scene.setIntroParams(currentParams);
          }
        },
        onComplete: () => {
          if (this.scene && typeof this.scene.setIntroActive === 'function') {
            this.scene.setIntroActive(false);
          }
          document.body.classList.remove('intro-active');
        },
      });

      const nav = document.getElementById('main-nav');
      if (nav) {
        gsap.to(nav, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.2 });
      }
      const heroContent = document.querySelector('.hero-content');
      if (heroContent) {
        gsap.to(heroContent, { opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.3 });
      }
    }
  }

  // ═══════════════════════════════════════════
  // APP INIT (WebGL + GSAP + Safe Loader Dismiss)
  // ═══════════════════════════════════════════
  async function initApp() {
    const canvas = document.getElementById('webgl-canvas');
    const fallback = document.getElementById('fallback-bg');

    let webglActive = false;
    let introCtrl = null;

    // Khởi tạo Three.js trong try/catch
    try {
      const sceneModule = await import('./scene.js');
      sceneModuleRef = sceneModule;

      introCtrl = new CinematicIntroController(sceneModule);

      if (sceneModule && sceneModule.checkWebGL && sceneModule.checkWebGL()) {
        await sceneModule.initScene(canvas, {
          static: reducedMotion,
          onFirstFrame: () => {
            // Tắt mask loader ngay khi khung hình đầu tiên vừa render xong
            dismissLoader();
            // Khởi động Cinematic Intro
            introCtrl.start();
          },
        });
        webglActive = true;
      } else {
        throw new Error('WebGL không được hỗ trợ trên thiết bị này');
      }
    } catch (err) {
      console.warn('Three.js / WebGL gặp sự cố hoặc không hỗ trợ, chuyển sang nền tĩnh:', err);
      if (canvas) canvas.style.display = 'none';
      if (fallback) fallback.classList.add('active');
      dismissLoader();
      if (introCtrl) introCtrl.finish(true);
      document.body.classList.remove('intro-active');
    }

    // GSAP scroll animations
    try {
      if (!reducedMotion) {
        initGSAP();
      } else {
        document.querySelectorAll('.timeline-item').forEach(el => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      }
    } catch (gsapErr) {
      console.warn('Lỗi GSAP animation:', gsapErr);
    }

    // Đảm bảo loader luôn tắt trong mọi trường hợp sau tối đa 400ms kể từ khi initApp hoàn tất
    setTimeout(dismissLoader, 400);
  }

  // ═══════════════════════════════════════════
  // GSAP — Scroll-triggered animations
  // ═══════════════════════════════════════════
  function initGSAP() {
    const { gsap, ScrollTrigger } = window;
    if (!gsap || !ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    // 1. Đồng bộ toàn bộ hành trình Three.js theo tiến độ cuộn trang & Wormhole warp
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        if (sceneModuleRef && typeof sceneModuleRef.setScrollProgress === 'function') {
          sceneModuleRef.setScrollProgress(self.progress);
        }
        if (sceneModuleRef && typeof sceneModuleRef.setWarpVelocity === 'function') {
          const vel = Math.abs(self.getVelocity());
          if (vel > 650) {
            sceneModuleRef.setWarpVelocity(Math.min(1.0, (vel - 650) / 2200));
          }
        }
      },
    });

    // Kích hoạt cú nhảy không-thời gian (Warp jump) khi click các anchor link
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', () => {
        if (sceneModuleRef && typeof sceneModuleRef.triggerWarp === 'function') {
          sceneModuleRef.triggerWarp(0.9, 850);
        }
      });
    });

    // 2. Sections fade-in
    document.querySelectorAll('.section:not(.section--hero)').forEach(section => {
      const inner = section.querySelector('.container');
      if (!inner) return;
      gsap.from(inner, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    // 3. About section telemetry animation
    gsap.from('#about-bio', {
      opacity: 0,
      x: -30,
      duration: 0.75,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#about-bio',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });

    gsap.from('.telemetry-card', {
      opacity: 0,
      y: 25,
      scale: 0.96,
      duration: 0.55,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#about-stats',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });

    // 4. Timeline time dilation & dynamic glowing progress line
    const timelineEl = document.getElementById('timeline');
    const progressLine = document.querySelector('.timeline-progress');
    if (timelineEl && progressLine) {
      ScrollTrigger.create({
        trigger: timelineEl,
        start: 'top 75%',
        end: 'bottom 80%',
        scrub: 0.4,
        onUpdate: (self) => {
          progressLine.style.height = `${(self.progress * 100).toFixed(1)}%`;

          const items = timelineEl.querySelectorAll('.timeline-item');
          items.forEach(item => {
            const rect = item.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 0.65) {
              item.classList.add('active');
            } else {
              item.classList.remove('active');
            }
          });
        },
      });
    }

    // 5. Timeline items stagger
    document.querySelectorAll('.timeline-item').forEach(item => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // 6. Station cards
    document.querySelectorAll('.station-card').forEach(card => {
      gsap.from(card, {
        opacity: 0,
        y: 35,
        scale: 0.98,
        duration: 0.65,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    // 7. Constellation cards & crosslinks panel
    const constellationCards = document.querySelectorAll('.constellation-card');
    if (constellationCards.length > 0) {
      gsap.from(constellationCards, {
        opacity: 0,
        y: 40,
        scale: 0.97,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#skills',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    }

    const crossPanelEl = document.querySelector('.crosslinks-panel');
    if (crossPanelEl) {
      gsap.from(crossPanelEl, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.25,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#skills',
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      });
    }

    // 8. Contact box & Tesseract
    const contactBox = document.querySelector('.contact-box');
    if (contactBox) {
      gsap.from(contactBox, {
        opacity: 0,
        y: 40,
        scale: 0.96,
        duration: 0.85,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#contact',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    }
  }

  // ═══════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el && text !== undefined && text !== null) el.textContent = text;
  }

  function esc(str) {
    if (str === undefined || str === null) return '';
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  }

  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }
 
  // Khởi động an toàn sau khi toàn bộ khai báo biến/hàm đã sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

