// ============================================================
// StudyBloom 🌸 — App Router & Global Controller
// ============================================================

const App = {
  currentPage: 'dashboard',
  _particleCanvas: null,
  _particles: [],
  _animFrame: null,

  // Page registry — maps route name → page module
  pages: {
    dashboard:  () => DashboardPage,
    subjects:   () => SubjectsPage,
    exams:      () => ExamsPage,
    flashcards: () => FlashcardsPage,
    quiz:       () => QuizPage,
    notes:      () => NotesPage,
    planner:    () => PlannerPage,
    timer:      () => TimerPage,
    ai:         () => AIPage,
    prompt:     () => PromptPage,
    diagrams:   () => DiagramsPage,
  },

  // ── Initialization ─────────────────────────────────────────
  init() {
    const settings = Storage.getSettings();
    I18N.lang = settings.language || 'vi';

    this._initParticles();
    this._initSidebar();
    this._initNav();
    this._initLangToggle();
    this._initModal();
    this._updateBadges();
    this._updateStreak();

    // Route to current hash or default
    const hash = window.location.hash.slice(1) || 'dashboard';
    this.navigate(hash, false);

    window.addEventListener('hashchange', () => {
      const page = window.location.hash.slice(1) || 'dashboard';
      this.navigate(page, false);
    });

    // Update greeting every minute
    setInterval(() => this._updateGreeting(), 60000);

    console.log('🌸 StudyBloom initialized!');
  },

  // ── Routing ───────────────────────────────────────────────
  navigate(pageName, updateHash = true) {
    if (!this.pages[pageName]) pageName = 'dashboard';

    // Cleanup current page
    if (this.currentPageInstance && this.currentPageInstance.destroy) {
      this.currentPageInstance.destroy();
    }

    this.currentPage = pageName;

    if (updateHash) {
      window.location.hash = pageName;
    }

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === pageName);
    });

    // Render page
    const pageModule = this.pages[pageName]();
    const container = document.getElementById('page-container');
    container.innerHTML = '';
    container.style.animation = 'none';
    container.offsetHeight; // reflow
    container.style.animation = '';

    try {
      const html = pageModule.render();
      container.innerHTML = html;
      if (pageModule.init) pageModule.init();
      this.currentPageInstance = pageModule;
    } catch (e) {
      console.error('[App] Page render error:', e);
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <h3>Lỗi hiển thị trang</h3>
          <p>${e.message}</p>
        </div>`;
    }

    // Render Lucide icons + KaTeX
    if (window.lucide) lucide.createIcons();
    this._renderMath();

    // Update lang attributes
    I18N.apply();

    // Scroll to top
    container.scrollTop = 0;
    window.scrollTo(0, 0);
  },

  // ── Sidebar ───────────────────────────────────────────────
  _initSidebar() {
    this._updateGreeting();

    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        const icon = sidebar.classList.contains('collapsed') ? 'panel-left-open' : 'panel-left-close';
        toggleBtn.innerHTML = `<i data-lucide="${icon}"></i>`;
        if (window.lucide) lucide.createIcons();
      });
    }
  },

  _updateGreeting() {
    const settings = Storage.getSettings();
    const greetEl = document.getElementById('sidebar-greeting');
    if (greetEl) greetEl.textContent = I18N.greeting(settings.name || 'Thơ');
  },

  // ── Nav ───────────────────────────────────────────────────
  _initNav() {
    document.querySelectorAll('.nav-item[data-page]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        this.navigate(el.dataset.page);
      });
    });
  },

  // ── Language Toggle ───────────────────────────────────────
  _initLangToggle() {
    const btn = document.getElementById('lang-toggle');
    const label = document.getElementById('lang-label');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const newLang = I18N.lang === 'vi' ? 'en' : 'vi';
      I18N.lang = newLang;
      if (label) label.textContent = newLang.toUpperCase();

      const settings = Storage.getSettings();
      settings.language = newLang;
      Storage.saveSettings(settings);

      this._updateGreeting();

      // Re-render current page with new language
      this.navigate(this.currentPage, false);

      App.toast(newLang === 'vi' ? 'Đã chuyển sang Tiếng Việt 🇻🇳' : 'Switched to English 🇬🇧', 'info');
    });

    // Set initial label
    if (label) label.textContent = I18N.lang.toUpperCase();
  },

  // ── Badges ────────────────────────────────────────────────
  _updateBadges() {
    // Flashcard due count
    const dueCount = Storage.countDueCards();
    const fcBadge = document.getElementById('fc-badge');
    if (fcBadge) {
      fcBadge.textContent = dueCount > 0 ? dueCount : '';
    }

    // Upcoming exam count
    const examCount = Storage.getUpcomingExams().length;
    const examBadge = document.getElementById('exam-badge');
    if (examBadge) {
      examBadge.textContent = examCount > 0 ? examCount : '';
    }
  },

  // ── Streak ────────────────────────────────────────────────
  _updateStreak() {
    const streak = Storage.getStreak();
    const el = document.getElementById('streak-count');
    if (el) el.textContent = streak.current;
  },

  // ── Modal ─────────────────────────────────────────────────
  _initModal() {
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close');

    if (closeBtn) closeBtn.addEventListener('click', () => App.closeModal());
    if (overlay)  overlay.addEventListener('click', e => {
      if (e.target === overlay) App.closeModal();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') App.closeModal();
    });
  },

  openModal(html, title = '') {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    if (!overlay || !content) return;

    content.innerHTML = (title ? `<div class="modal-title">${title}</div>` : '') + html;
    overlay.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
    this._renderMath();
  },

  closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.add('hidden');
  },

  // ── Toast ─────────────────────────────────────────────────
  toast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: '✅', error: '❌', info: '💜', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || '💜'}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // ── Math Rendering ────────────────────────────────────────
  _renderMath() {
    if (!window.renderMathInElement) return;
    try {
      renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true },
        ],
        throwOnError: false,
      });
    } catch(e) {}
  },

  // ── Particle Background ───────────────────────────────────
  _initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    this._particleCanvas = canvas;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    this._particles = Array.from({ length: 60 }, () => this._createParticle(canvas));
    this._animateParticles();
  },

  _createParticle(canvas) {
    const colors = ['rgba(167,139,250,', 'rgba(251,113,133,', 'rgba(110,231,183,', 'rgba(96,165,250,'];
    const color  = colors[Math.floor(Math.random() * colors.length)];
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      color,
      alpha: Math.random() * 0.5 + 0.1,
    };
  },

  _animateParticles() {
    const canvas = this._particleCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this._particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.fill();
      });
      this._animFrame = requestAnimationFrame(draw);
    };
    draw();
  },

  // ── Helpers ───────────────────────────────────────────────
  formatDate(dateStr, lang = null) {
    if (!dateStr) return '';
    const l = lang || I18N.lang;
    const d = new Date(dateStr);
    if (l === 'vi') {
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  daysUntil(dateStr) {
    const now  = new Date(); now.setHours(0,0,0,0);
    const date = new Date(dateStr); date.setHours(0,0,0,0);
    return Math.ceil((date - now) / 86400000);
  },

  subjectColor(subjectId) {
    const subject = Storage.getSubjectById(subjectId);
    return subject ? subject.color : '#94a3b8';
  },

  subjectLabel(subjectId, lang = null) {
    const l = lang || I18N.lang;
    const subject = Storage.getSubjectById(subjectId);
    if (!subject) return subjectId;
    return l === 'vi' ? (subject.nameVi || subject.name) : subject.name;
  },

  subjectPill(subjectId) {
    const subject = Storage.getSubjectById(subjectId);
    if (!subject) return '';
    const c = subject.color;
    return `<span class="subject-pill" style="background:${c}22;color:${c};border-color:${c}44">
      ${subject.emoji} ${I18N.lang === 'vi' ? (subject.nameVi || subject.name) : subject.name}
    </span>`;
  },

  // Confirm dialog (using modal)
  confirm(message, onYes) {
    this.openModal(`
      <div style="text-align:center;padding:1rem 0">
        <div style="font-size:2rem;margin-bottom:1rem">⚠️</div>
        <p style="color:var(--text-secondary);margin-bottom:2rem">${message}</p>
        <div style="display:flex;gap:1rem;justify-content:center">
          <button class="btn btn-ghost" onclick="App.closeModal()">${I18N.t('common_no')}</button>
          <button class="btn btn-danger" id="confirm-yes-btn">${I18N.t('common_yes')}</button>
        </div>
      </div>
    `);
    document.getElementById('confirm-yes-btn').addEventListener('click', () => {
      App.closeModal();
      onYes();
    });
  },
};

// ── Boot ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
