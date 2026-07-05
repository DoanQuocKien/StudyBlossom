// ============================================================
// StudyBlossom 🌸 — Timer Page (Pomodoro)
// ============================================================

const TimerPage = {
  _interval: null,
  _totalSeconds: 0,
  _remaining: 0,
  _mode: 'work',    // 'work' | 'short' | 'long'
  _running: false,
  _session: 0,
  _subjectId: null,
  _audio: null,
  _soundType: 'none',

  render() {
    const settings = Storage.getSettings();
    const subjects = Storage.getSubjects();
    const sessions = Storage.getStudySessions().filter(s => s.date && s.date.startsWith(new Date().toISOString().substring(0,10)));
    const todayMins = sessions.reduce((t,s) => t + (s.minutes||0), 0);

    const work  = settings.pomodoroWork  || 25;
    const short = settings.pomodoroShort || 5;
    const long  = settings.pomodoroLong  || 15;

    if (!this._totalSeconds) {
      this._totalSeconds = work * 60;
      this._remaining    = work * 60;
    }

    const mins = String(Math.floor(this._remaining / 60)).padStart(2, '0');
    const secs = String(this._remaining % 60).padStart(2, '0');
    const pct  = this._totalSeconds > 0 ? (this._remaining / this._totalSeconds) : 1;
    const R    = 100;
    const circ = 2 * Math.PI * R;
    const dash = pct * circ;
    const offset = circ - dash;

    const modeLabel = {
      work:  I18N.t('timer_work'),
      short: I18N.t('timer_short_break'),
      long:  I18N.t('timer_long_break'),
    }[this._mode];

    return `
    <div class="animate-fadeIn" style="max-width:640px;margin:0 auto">
      <div class="page-header">
        <div>
          <h1 class="page-title">⏱️ ${I18N.t('timer_title')}</h1>
          <p class="page-subtitle">${I18N.lang === 'vi' ? 'Tập trung, nghỉ ngơi, lặp lại!' : 'Focus, rest, repeat!'}</p>
        </div>
      </div>

      <!-- Mode tabs -->
      <div class="tab-bar mb-4" style="margin:0 auto 1.5rem;width:fit-content">
        <button class="tab-btn ${this._mode==='work'?'active':''}" onclick="TimerPage.setMode('work')">
          🧠 ${I18N.t('timer_work')}
        </button>
        <button class="tab-btn ${this._mode==='short'?'active':''}" onclick="TimerPage.setMode('short')">
          ☕ ${I18N.t('timer_short_break')}
        </button>
        <button class="tab-btn ${this._mode==='long'?'active':''}" onclick="TimerPage.setMode('long')">
          🌿 ${I18N.t('timer_long_break')}
        </button>
      </div>

      <!-- Timer ring -->
      <div class="timer-ring-wrap">
        <div class="timer-ring">
          <svg viewBox="0 0 240 240" width="240" height="240">
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:var(--purple)"/>
                <stop offset="100%" style="stop-color:var(--coral)"/>
              </linearGradient>
            </defs>
            <circle cx="120" cy="120" r="${R}" class="timer-ring-bg"/>
            <circle cx="120" cy="120" r="${R}" class="timer-ring-progress"
              stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
              style="transform-origin:center;transform:rotate(-90deg)"/>
          </svg>
          <div class="timer-display">
            <div class="timer-time" id="timer-display">${mins}:${secs}</div>
            <div class="timer-mode-label">${modeLabel}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem">
              ${I18N.t('timer_session')} #${this._session + 1}
            </div>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div style="display:flex;justify-content:center;gap:1rem;margin-bottom:2rem">
        <button class="btn btn-ghost btn-lg" onclick="TimerPage.reset()">
          <i data-lucide="rotate-ccw"></i> ${I18N.t('timer_reset')}
        </button>
        <button class="btn btn-primary btn-lg" id="timer-start-btn" onclick="TimerPage.toggle()">
          <i data-lucide="${this._running ? 'pause' : 'play'}"></i>
          ${this._running ? I18N.t('timer_pause') : I18N.t('timer_start')}
        </button>
      </div>

      <!-- Options row -->
      <div class="card mb-4">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">🎓 ${I18N.t('timer_subject_tag')}</label>
            <select class="form-select" id="timer-subject" onchange="TimerPage._subjectId=this.value">
              <option value="">${I18N.t('common_none')}</option>
              ${subjects.map(s => `<option value="${s.id}" ${this._subjectId===s.id?'selected':''}>${s.emoji} ${I18N.lang==='vi'?(s.nameVi||s.name):s.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">🔊 ${I18N.t('timer_sound')}</label>
            <select class="form-select" id="timer-sound" onchange="TimerPage.setSound(this.value)">
              <option value="none">${I18N.t('timer_sound_none')}</option>
              <option value="rain"  ${this._soundType==='rain'?'selected':''}>${I18N.t('timer_sound_rain')}</option>
              <option value="white" ${this._soundType==='white'?'selected':''}>${I18N.t('timer_sound_white')}</option>
              <option value="cafe"  ${this._soundType==='cafe'?'selected':''}>${I18N.t('timer_sound_cafe')}</option>
            </select>
          </div>
        </div>

        <!-- Custom durations -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem">
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label" style="font-size:0.7rem">${I18N.t('timer_work')} (min)</label>
            <input class="form-input" type="number" id="pomo-work" value="${work}" min="1" max="90" oninput="TimerPage.updateSettings()">
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label" style="font-size:0.7rem">${I18N.t('timer_short_break')} (min)</label>
            <input class="form-input" type="number" id="pomo-short" value="${short}" min="1" max="30" oninput="TimerPage.updateSettings()">
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label" style="font-size:0.7rem">${I18N.t('timer_long_break')} (min)</label>
            <input class="form-input" type="number" id="pomo-long" value="${long}" min="1" max="60" oninput="TimerPage.updateSettings()">
          </div>
        </div>
      </div>

      <!-- Today's log -->
      <div class="card">
        <div class="flex items-center justify-between mb-3">
          <h3 style="font-weight:600">📋 ${I18N.t('timer_today_log')}</h3>
          <span class="badge badge-purple">
            ${todayMins >= 60 ? `${Math.floor(todayMins/60)}h ${todayMins%60}m` : `${todayMins} ${I18N.t('common_min')}`}
          </span>
        </div>
        ${sessions.length === 0
          ? `<p class="text-sm text-muted">${I18N.lang==='vi'?'Chưa có phiên học nào hôm nay':'No sessions today yet'}</p>`
          : `<div style="display:flex;flex-direction:column;gap:0.5rem">
              ${sessions.slice(0,8).map(s => {
                const subj = Storage.getSubjectById(s.subjectId);
                return `<div class="flex items-center justify-between" style="padding:0.4rem;background:var(--bg-overlay);border-radius:var(--r-sm)">
                  <span style="font-size:0.8rem">${subj ? `${subj.emoji} ${I18N.lang==='vi'?(subj.nameVi||subj.name):subj.name}` : (I18N.lang==='vi'?'Học chung':'General')}</span>
                  <span class="badge badge-purple">${s.minutes} ${I18N.t('common_min')}</span>
                </div>`;
              }).join('')}
             </div>`}
      </div>
    </div>`;
  },

  init() {
    // Restore running state after re-render
    if (this._running) {
      this._startInterval();
    }
  },

  destroy() {
    this._stopInterval();
  },

  toggle() {
    if (this._running) this.pause();
    else               this.start();
  },

  start() {
    this._running = true;
    Storage.touchStreak();
    App._updateStreak();
    this._startInterval();
    this._updateBtn();
  },

  pause() {
    this._running = false;
    this._stopInterval();
    this._updateBtn();
  },

  reset() {
    this._stopInterval();
    this._running = false;
    const settings = Storage.getSettings();
    const mins = {
      work:  settings.pomodoroWork  || 25,
      short: settings.pomodoroShort || 5,
      long:  settings.pomodoroLong  || 15,
    }[this._mode];
    this._totalSeconds = mins * 60;
    this._remaining    = mins * 60;
    this._updateDisplay();
    this._updateBtn();
  },

  setMode(mode) {
    this._stopInterval();
    this._running = false;
    this._mode = mode;
    const settings = Storage.getSettings();
    const mins = {
      work:  settings.pomodoroWork  || 25,
      short: settings.pomodoroShort || 5,
      long:  settings.pomodoroLong  || 15,
    }[mode];
    this._totalSeconds = mins * 60;
    this._remaining    = mins * 60;
    App.navigate('timer', false);
  },

  setSound(type) {
    this._soundType = type;
    if (this._audio) { this._audio.pause(); this._audio = null; }
    if (type === 'none') return;

    // Use Web Audio API to generate simple ambient sounds
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.05;
    gainNode.connect(ctx.destination);

    if (type === 'white') {
      const bufferSize = 4096;
      const source = ctx.createScriptProcessor(bufferSize, 1, 1);
      source.onaudioprocess = e => {
        const out = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) out[i] = Math.random() * 2 - 1;
      };
      source.connect(gainNode);
      this._audio = { pause: () => { source.disconnect(); ctx.close(); } };
    } else {
      // For rain/cafe: show info that actual audio files would be needed
      App.toast(I18N.lang==='vi'?'Tính năng âm thanh cần file audio (xem README)':'Sound feature needs audio files (see README)','info',4000);
    }
  },

  updateSettings() {
    const work  = parseInt(document.getElementById('pomo-work')?.value) || 25;
    const short = parseInt(document.getElementById('pomo-short')?.value) || 5;
    const long  = parseInt(document.getElementById('pomo-long')?.value) || 15;
    const settings = Storage.getSettings();
    settings.pomodoroWork  = work;
    settings.pomodoroShort = short;
    settings.pomodoroLong  = long;
    Storage.saveSettings(settings);
    if (!this._running) this.reset();
  },

  _startInterval() {
    this._stopInterval();
    this._interval = setInterval(() => {
      this._remaining--;
      this._updateDisplay();
      if (this._remaining <= 0) this._onComplete();
    }, 1000);
  },

  _stopInterval() {
    if (this._interval) { clearInterval(this._interval); this._interval = null; }
  },

  _updateDisplay() {
    const el = document.getElementById('timer-display');
    if (!el) return;
    const mins = String(Math.floor(this._remaining / 60)).padStart(2, '0');
    const secs = String(this._remaining % 60).padStart(2, '0');
    el.textContent = `${mins}:${secs}`;
    document.title = `${mins}:${secs} — StudyBlossom 🌸`;

    // Update ring
    const pct = this._totalSeconds > 0 ? (this._remaining / this._totalSeconds) : 1;
    const R = 100, circ = 2 * Math.PI * R;
    const offset = circ - pct * circ;
    const ring = document.querySelector('.timer-ring-progress');
    if (ring) ring.style.strokeDashoffset = offset;
  },

  _updateBtn() {
    const btn  = document.getElementById('timer-start-btn');
    if (!btn) return;
    btn.innerHTML = `<i data-lucide="${this._running?'pause':'play'}"></i> ${this._running ? I18N.t('timer_pause') : I18N.t('timer_start')}`;
    if (window.lucide) lucide.createIcons();
  },

  _onComplete() {
    this._stopInterval();
    this._running = false;
    document.title = 'StudyBlossom 🌸';

    // Log completed work session
    if (this._mode === 'work') {
      const settings = Storage.getSettings();
      const minutes  = settings.pomodoroWork || 25;
      const subjectId = document.getElementById('timer-subject')?.value || this._subjectId;
      Storage.addStudySession({ minutes, subjectId, type: 'pomodoro' });
      this._session++;
      Storage.touchStreak();
      App._updateStreak();
      App.toast(`🎉 ${I18N.lang==='vi'?'Hoàn thành phiên tập trung!':'Focus session complete!'} +${minutes} min`, 'success', 4000);

      // Auto switch to break
      const nextMode = this._session % 4 === 0 ? 'long' : 'short';
      setTimeout(() => this.setMode(nextMode), 1000);
    } else {
      App.toast(`✅ ${I18N.lang==='vi'?'Hết giờ nghỉ! Sẵn sàng học tiếp chưa?':'Break over! Ready to focus?'}`, 'info', 4000);
      setTimeout(() => this.setMode('work'), 1000);
    }

    // Browser notification
    if (Notification.permission === 'granted') {
      new Notification('StudyBlossom 🌸', {
        body: this._mode === 'work'
          ? (I18N.lang==='vi'?'Phiên học hoàn thành! Nghỉ ngơi nhé~':'Session done! Take a break~')
          : (I18N.lang==='vi'?'Hết giờ nghỉ! Tiếp tục nào!':'Break over! Let\'s go!'),
      });
    } else {
      Notification.requestPermission();
    }
  },
};
