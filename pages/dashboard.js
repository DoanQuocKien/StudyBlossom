// ============================================================
// StudyBlossom 🌸 — Dashboard Page
// ============================================================

const DashboardPage = {
  _quoteInterval: null,

  render() {
    const settings   = Storage.getSettings();
    const name       = settings.name || 'Thơ';
    const streak     = Storage.getStreak();
    const sessions   = Storage.getStudySessions();
    const totalMins  = sessions.reduce((s, x) => s + (x.minutes || 0), 0);
    const dueCards   = Storage.countDueCards();
    const exams      = Storage.getUpcomingExams().slice(0, 3);
    const subjects   = Storage.getSubjects();

    return `
    <div class="animate-fadeIn">
      <!-- Hero greeting -->
      <div class="dash-greeting">${I18N.greeting(name)}</div>
      <div class="dash-quote" id="dash-quote">${I18N.randomQuote()}</div>

      <!-- Stat cards -->
      <div class="stat-grid mb-6">
        <div class="stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-value" style="color:var(--coral)">${streak.current}</div>
          <div class="stat-label">${I18N.t('dash_study_streak')} (${I18N.t('dash_days')})</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-value" style="color:var(--purple)">${Math.floor(totalMins / 60)}</div>
          <div class="stat-label">${I18N.t('dash_total_hours')}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🃏</div>
          <div class="stat-value" style="color:var(--amber)">${dueCards}</div>
          <div class="stat-label">${I18N.t('dash_cards_due')}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-value" style="color:var(--mint)">${subjects.length}</div>
          <div class="stat-label">${I18N.lang === 'vi' ? 'Môn đang học' : 'Subjects'}</div>
        </div>
      </div>

      <div class="grid-2" style="gap:1.5rem">
        <!-- Left column -->
        <div>
          <!-- Upcoming Exams -->
          <div class="card mb-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-outfit font-bold" style="font-size:1.1rem">${I18N.t('dash_upcoming_exams')}</h2>
              <button class="btn btn-ghost btn-sm" onclick="App.navigate('exams')">
                ${I18N.t('dash_add_exam')}
              </button>
            </div>
            <div id="dash-exams">
              ${exams.length === 0
                ? `<div class="empty-state" style="padding:1.5rem">
                    <div class="empty-state-icon">📅</div>
                    <p>${I18N.t('dash_no_exams')}</p>
                   </div>`
                : exams.map(e => this._renderExamRow(e)).join('')
              }
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card">
            <h2 class="font-outfit font-bold mb-4" style="font-size:1.1rem">${I18N.t('dash_quick_actions')}</h2>
            <div class="grid-2" style="gap:0.75rem">
              <button class="btn btn-primary" onclick="App.navigate('flashcards')">
                <i data-lucide="layers"></i> ${I18N.t('dash_review_cards')}
              </button>
              <button class="btn btn-coral" onclick="App.navigate('timer')">
                <i data-lucide="timer"></i> ${I18N.t('dash_start_timer')}
              </button>
              <button class="btn btn-ghost" onclick="App.navigate('quiz')">
                <i data-lucide="file-check-2"></i>
                ${I18N.lang === 'vi' ? 'Làm bài kiểm tra' : 'Take a Quiz'}
              </button>
              <button class="btn btn-ghost" onclick="App.navigate('ai')">
                <i data-lucide="bot"></i>
                ${I18N.lang === 'vi' ? 'Hỏi Trợ lý AI' : 'Ask AI'}
              </button>
            </div>
          </div>
        </div>

        <!-- Right column -->
        <div>
          <!-- Study Activity Heatmap -->
          <div class="card mb-4">
            <h2 class="font-outfit font-bold mb-1" style="font-size:1.1rem">${I18N.t('dash_study_heatmap')}</h2>
            <p class="text-xs text-muted mb-3">${I18N.lang === 'vi' ? '13 tuần qua' : 'Last 13 weeks'}</p>
            <div id="heatmap-container"></div>
          </div>

          <!-- Subject Progress -->
          <div class="card">
            <h2 class="font-outfit font-bold mb-4" style="font-size:1.1rem">
              ${I18N.lang === 'vi' ? 'Tiến độ môn học' : 'Subject Progress'}
            </h2>
            <div id="subject-progress-list">
              ${subjects.map(s => `
                <div style="margin-bottom:1rem">
                  <div class="flex items-center justify-between mb-1">
                    <span style="font-size:0.875rem;font-weight:500">${s.emoji} ${I18N.lang === 'vi' ? (s.nameVi || s.name) : s.name}</span>
                    <span style="font-size:0.75rem;color:var(--text-muted)">${s.progress || 0}%</span>
                  </div>
                  <div class="progress-bar-wrap">
                    <div class="progress-bar-fill" style="width:${s.progress || 0}%;background:linear-gradient(90deg,${s.color},${s.color}88)"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Weekly Study Chart -->
      <div class="card mt-4">
        <h2 class="font-outfit font-bold mb-4" style="font-size:1.1rem">
          ${I18N.lang === 'vi' ? 'Thời gian học 7 ngày qua' : 'Study Time — Last 7 Days'}
        </h2>
        <div style="height:200px;position:relative">
          <canvas id="weekly-chart"></canvas>
        </div>
      </div>
    </div>
    `;
  },

  _renderExamRow(exam) {
    const days = App.daysUntil(exam.date);
    const urgency = days <= 3 ? 'urgent' : days <= 7 ? '' : 'far';
    const subject = Storage.getSubjectById(exam.subjectId);
    const subjectColor = subject ? subject.color : '#94a3b8';

    return `
      <div class="exam-countdown" style="border-left:3px solid ${subjectColor}">
        <div>
          <div style="font-weight:600;font-size:0.9rem">${exam.name}</div>
          <div style="font-size:0.75rem;color:var(--text-secondary)">${App.formatDate(exam.date)}</div>
          ${subject ? `<div style="font-size:0.7rem;color:${subjectColor};margin-top:2px">${subject.emoji} ${I18N.lang === 'vi' ? (subject.nameVi || subject.name) : subject.name}</div>` : ''}
        </div>
        <div class="exam-countdown-days ${urgency}">
          ${days === 0 ? I18N.t('exam_today') : days < 0 ? I18N.t('exam_passed') : `${days} ${I18N.t('exam_days_left')}`}
        </div>
      </div>
    `;
  },

  init() {
    this._renderHeatmap();
    this._renderWeeklyChart();

    // Rotate quote every 30s
    this._quoteInterval = setInterval(() => {
      const el = document.getElementById('dash-quote');
      if (el) {
        el.style.opacity = '0';
        setTimeout(() => {
          el.textContent = I18N.randomQuote();
          el.style.opacity = '1';
        }, 300);
      }
    }, 30000);
  },

  destroy() {
    if (this._quoteInterval) clearInterval(this._quoteInterval);
  },

  _renderHeatmap() {
    const container = document.getElementById('heatmap-container');
    if (!container) return;

    const heatmap = Storage.getStudyHeatmap(91);
    const cells = [];
    const today = new Date();

    // Start from 91 days ago
    for (let i = 90; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().substring(0, 10);
      const mins = heatmap[key] || 0;
      const level = mins === 0 ? 0 : mins < 30 ? 1 : mins < 60 ? 2 : mins < 120 ? 3 : 4;
      cells.push(`<div class="heatmap-cell" data-level="${level}" title="${key}: ${mins} min" style="transition-delay:${(90-i)*5}ms"></div>`);
    }

    container.innerHTML = `<div class="heatmap-grid">${cells.join('')}</div>
    <div class="flex justify-between mt-2">
      <span class="text-xs text-muted">${I18N.lang === 'vi' ? 'Ít hơn' : 'Less'}</span>
      <div class="flex gap-1">
        ${[0,1,2,3,4].map(l => `<div class="heatmap-cell" data-level="${l}" style="width:12px;height:12px"></div>`).join('')}
      </div>
      <span class="text-xs text-muted">${I18N.lang === 'vi' ? 'Nhiều hơn' : 'More'}</span>
    </div>`;
  },

  _renderWeeklyChart() {
    const canvas = document.getElementById('weekly-chart');
    if (!canvas || !window.Chart) return;

    const labels = [];
    const data   = [];
    const dayNames = I18N.days[I18N.lang];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().substring(0, 10);
      labels.push(dayNames[d.getDay()]);
      data.push(Math.round(Storage.getStudyMinutesForDate(key)));
    }

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: I18N.lang === 'vi' ? 'Phút học' : 'Study Minutes',
          data,
          backgroundColor: 'rgba(167,139,250,0.4)',
          borderColor: '#a78bfa',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 11 } }, beginAtZero: true },
        },
      },
    });
  },
};
