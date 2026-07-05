// ============================================================
// StudyBlossom 🌸 — Study Planner Page
// ============================================================

const PlannerPage = {
  _weekOffset: 0,

  render() {
    const today     = new Date();
    const monday    = this._getMonday(today, this._weekOffset);
    const subjects  = Storage.getSubjects();
    const events    = Storage.getPlannerEvents();
    const settings  = Storage.getSettings();
    const lang      = I18N.lang;
    const days      = I18N.days[lang];

    // Build week days array
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });

    const weekLabel = `${weekDays[0].getDate()}/${weekDays[0].getMonth()+1} — ${weekDays[6].getDate()}/${weekDays[6].getMonth()+1}`;

    return `
    <div class="animate-fadeIn">
      <div class="page-header">
        <div>
          <h1 class="page-title">📅 ${I18N.t('plan_title')}</h1>
          <p class="page-subtitle">${I18N.t('plan_week_of')}: ${weekLabel}</p>
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <button class="btn btn-ghost btn-sm" onclick="PlannerPage.changeWeek(-1)">
            <i data-lucide="chevron-left"></i>
          </button>
          <button class="btn btn-ghost btn-sm" onclick="PlannerPage.changeWeek(0)">
            ${lang==='vi'?'Tuần này':'This Week'}
          </button>
          <button class="btn btn-ghost btn-sm" onclick="PlannerPage.changeWeek(1)">
            <i data-lucide="chevron-right"></i>
          </button>
          <button class="btn btn-primary btn-sm" onclick="PlannerPage.openAddModal()">
            <i data-lucide="plus"></i> ${I18N.t('plan_add_session')}
          </button>
        </div>
      </div>

      <!-- Weekly goal -->
      <div class="card mb-4">
        <div class="flex items-center justify-between">
          <div style="display:flex;align-items:center;gap:0.75rem">
            <span style="font-size:1.5rem">🎯</span>
            <div>
              <div style="font-weight:600">${I18N.t('plan_goal_weekly')}</div>
              <div style="font-size:0.75rem;color:var(--text-muted)">${lang==='vi'?'Đã hoàn thành tuần này':'Completed this week'}</div>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:1.5rem;font-weight:700;color:var(--purple)" id="week-hours">
              ${this._getWeekHours(weekDays, events)}h
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted)">${lang==='vi'?'/ mục tiêu':'/ goal'} ${settings.weeklyGoal || 20}h</div>
          </div>
        </div>
        <div class="progress-bar-wrap mt-2">
          <div class="progress-bar-fill" style="width:${Math.min(100, (this._getWeekHours(weekDays, events) / (settings.weeklyGoal||20)) * 100)}%"></div>
        </div>
      </div>

      <!-- Weekly calendar grid -->
      <div class="card" style="padding:1rem;overflow-x:auto">
        <div style="min-width:700px">
          <!-- Header row -->
          <div style="display:grid;grid-template-columns:60px repeat(7,1fr);gap:2px;margin-bottom:2px">
            <div></div>
            ${weekDays.map((d, i) => {
              const isToday = d.toDateString() === today.toDateString();
              return `<div style="text-align:center;padding:0.5rem;font-size:0.8rem;font-weight:600;${isToday?'color:var(--purple)':'color:var(--text-secondary)'}">
                <div>${days[d.getDay()]}</div>
                <div style="font-size:1.1rem;font-weight:700;margin-top:2px;${isToday?'background:var(--purple);color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;margin:2px auto 0':''}">${d.getDate()}</div>
              </div>`;
            }).join('')}
          </div>

          <!-- Time slots -->
          ${Array.from({ length: 14 }, (_, hour) => hour + 7).map(hour => `
            <div style="display:grid;grid-template-columns:60px repeat(7,1fr);gap:2px;margin-bottom:2px">
              <div style="font-size:10px;color:var(--text-muted);text-align:right;padding-right:8px;padding-top:4px">${hour}:00</div>
              ${weekDays.map(d => {
                const dateStr = d.toISOString().substring(0,10);
                const slotEvents = events.filter(e => e.date === dateStr && e.hour === hour);
                return `<div style="background:var(--bg-overlay);border:1px solid var(--border);border-radius:4px;min-height:44px;padding:2px;cursor:pointer;transition:background 0.15s"
                  onmouseenter="this.style.background='var(--bg-hover)'" onmouseleave="this.style.background='var(--bg-overlay)'"
                  onclick="PlannerPage.openAddModal('${dateStr}',${hour})">
                  ${slotEvents.map(ev => {
                    const subj = Storage.getSubjectById(ev.subjectId);
                    const c = subj ? subj.color : '#a78bfa';
                    return `<div class="planner-event" style="background:${c};cursor:pointer" 
                      onclick="event.stopPropagation();PlannerPage.deleteEvent(${ev.id})" 
                      title="${ev.name} — ${lang==='vi'?'Click để xóa':'Click to delete'}">
                      ${subj?subj.emoji:''} ${ev.name}
                    </div>`;
                  }).join('')}
                </div>`;
              }).join('')}
            </div>`).join('')}
        </div>
      </div>

      <!-- Subject daily goals -->
      <div class="card mt-4">
        <h3 style="font-weight:600;margin-bottom:1rem">📊 ${lang==='vi'?'Phân bổ thời gian theo môn (tuần này)':'Time distribution by subject (this week)'}</h3>
        <div class="grid-3" style="gap:0.75rem">
          ${subjects.map(s => {
            const subjectEvents = events.filter(e => e.subjectId === s.id && weekDays.some(d => d.toISOString().substring(0,10) === e.date));
            const mins = subjectEvents.reduce((t, e) => t + (e.duration || 60), 0);
            return `<div style="text-align:center;padding:0.75rem;background:var(--bg-overlay);border-radius:var(--r-md);border:1px solid ${s.color}22">
              <div style="font-size:1.25rem">${s.emoji}</div>
              <div style="font-size:0.75rem;font-weight:600;margin:0.25rem 0;color:${s.color}">${lang==='vi'?(s.nameVi||s.name):s.name}</div>
              <div style="font-size:0.875rem;font-weight:700">${Math.floor(mins/60)}h ${mins%60}m</div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
  },

  _getMonday(date, offset = 0) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff + (offset * 7));
    d.setHours(0,0,0,0);
    return d;
  },

  _getWeekHours(weekDays, events) {
    const dates = new Set(weekDays.map(d => d.toISOString().substring(0,10)));
    const mins = events.filter(e => dates.has(e.date)).reduce((t,e) => t+(e.duration||60), 0);
    return (mins/60).toFixed(1);
  },

  init() {},

  changeWeek(direction) {
    if (direction === 0) this._weekOffset = 0;
    else this._weekOffset += direction;
    App.navigate('planner', false);
  },

  openAddModal(date = null, hour = null) {
    const subjects = Storage.getSubjects();
    const today = date || new Date().toISOString().substring(0,10);

    App.openModal(`
      <div class="form-group">
        <label class="form-label">📝 ${I18N.t('plan_session_name')}</label>
        <input class="form-input" id="ev-name" placeholder="${I18N.lang==='vi'?'vd: Học OOP Chương 5':'e.g. Study DSA Trees'}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">📚 ${I18N.t('exam_subject')}</label>
          <select class="form-select" id="ev-subject">
            <option value="">${I18N.t('common_none')}</option>
            ${subjects.map(s => `<option value="${s.id}">${s.emoji} ${I18N.lang==='vi'?(s.nameVi||s.name):s.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">📅 ${I18N.t('plan_day')}</label>
          <input class="form-input" type="date" id="ev-date" value="${today}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">🕐 ${I18N.t('plan_time')}</label>
          <input class="form-input" type="number" id="ev-hour" value="${hour !== null ? hour : 8}" min="0" max="23" placeholder="7">
        </div>
        <div class="form-group">
          <label class="form-label">⏱️ ${I18N.t('plan_duration')}</label>
          <input class="form-input" type="number" id="ev-duration" value="60" min="15" max="480" step="15">
        </div>
      </div>
      <button class="btn btn-primary w-full" onclick="PlannerPage.addEvent()">
        <i data-lucide="plus"></i> ${I18N.lang==='vi'?'Thêm buổi học':'Add Session'}
      </button>
    `, `➕ ${I18N.t('plan_add_session')}`);
  },

  addEvent() {
    const name = document.getElementById('ev-name')?.value.trim();
    const date = document.getElementById('ev-date')?.value;
    if (!name || !date) { App.toast(I18N.lang==='vi'?'Nhập tên và ngày!':'Enter name and date!','error'); return; }

    Storage.addPlannerEvent({
      name,
      date,
      hour:      parseInt(document.getElementById('ev-hour')?.value) || 8,
      duration:  parseInt(document.getElementById('ev-duration')?.value) || 60,
      subjectId: document.getElementById('ev-subject')?.value || null,
    });
    App.closeModal();
    App.navigate('planner', false);
    App.toast(I18N.t('common_success'), 'success');
  },

  deleteEvent(id) {
    Storage.deletePlannerEvent(id);
    App.navigate('planner', false);
  },
};
