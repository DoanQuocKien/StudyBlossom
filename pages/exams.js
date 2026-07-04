// ============================================================
// StudyBloom 🌸 — Exams Page
// ============================================================

const ExamsPage = {
  _tab: 'upcoming',

  render() {
    return `
    <div class="animate-fadeIn">
      <div class="page-header">
        <div>
          <h1 class="page-title">🎓 ${I18N.t('exam_title')}</h1>
          <p class="page-subtitle">${I18N.lang === 'vi' ? 'Theo dõi và chuẩn bị cho các kỳ thi' : 'Track and prepare for your exams'}</p>
        </div>
        <button class="btn btn-primary" onclick="ExamsPage.openAddModal()">
          <i data-lucide="plus"></i> ${I18N.t('exam_add')}
        </button>
      </div>

      <div class="tab-bar">
        <button class="tab-btn ${this._tab === 'upcoming' ? 'active' : ''}" onclick="ExamsPage.setTab('upcoming')">
          📅 ${I18N.lang === 'vi' ? 'Sắp tới' : 'Upcoming'}
        </button>
        <button class="tab-btn ${this._tab === 'history' ? 'active' : ''}" onclick="ExamsPage.setTab('history')">
          📋 ${I18N.t('exam_history')}
        </button>
      </div>

      <div id="exam-tab-content">
        ${this._renderTab()}
      </div>
    </div>`;
  },

  _renderTab() {
    const exams   = Storage.getExams();
    const now     = new Date();
    const upcoming = exams.filter(e => new Date(e.date) >= now).sort((a,b) => new Date(a.date)-new Date(b.date));
    const past     = exams.filter(e => new Date(e.date) < now).sort((a,b) => new Date(b.date)-new Date(a.date));

    if (this._tab === 'upcoming') {
      if (upcoming.length === 0) return `
        <div class="empty-state">
          <div class="empty-state-icon">🎓</div>
          <h3>${I18N.t('exam_no_upcoming')}</h3>
          <p>${I18N.lang === 'vi' ? 'Thêm kỳ thi để theo dõi đếm ngược!' : 'Add an exam to start the countdown!'}</p>
          <button class="btn btn-primary mt-4" onclick="ExamsPage.openAddModal()">
            ${I18N.t('exam_add')}
          </button>
        </div>`;

      return `<div style="display:flex;flex-direction:column;gap:1rem">${upcoming.map(e => this._renderExamCard(e)).join('')}</div>`;
    } else {
      if (past.length === 0) return `<div class="empty-state"><p>${I18N.lang === 'vi' ? 'Chưa có kỳ thi nào đã qua' : 'No past exams'}</p></div>`;
      return `<div style="display:flex;flex-direction:column;gap:1rem">${past.map(e => this._renderExamCard(e, true)).join('')}</div>`;
    }
  },

  _renderExamCard(exam, isPast = false) {
    const days = App.daysUntil(exam.date);
    const subject = Storage.getSubjectById(exam.subjectId);
    const color   = subject ? subject.color : '#94a3b8';

    let daysText, daysColor;
    if (isPast)        { daysText = I18N.t('exam_passed'); daysColor = 'var(--text-muted)'; }
    else if (days === 0) { daysText = I18N.t('exam_today');  daysColor = '#ef4444'; }
    else if (days <= 3)  { daysText = days;                   daysColor = '#ef4444'; }
    else if (days <= 7)  { daysText = days;                   daysColor = 'var(--coral)'; }
    else                 { daysText = days;                   daysColor = 'var(--mint)'; }

    return `
    <div class="exam-card" style="border-left:4px solid ${color}">
      <div class="exam-days-badge">
        <div class="exam-days-number" style="color:${daysColor}">${daysText}</div>
        ${!isPast && days > 0 ? `<div class="exam-days-label">${I18N.t('exam_days_left')}</div>` : ''}
      </div>

      <div class="exam-info">
        <div class="exam-title-text">${exam.name}</div>
        <div class="exam-meta">
          ${subject ? `${subject.emoji} ${I18N.lang === 'vi' ? (subject.nameVi||subject.name) : subject.name} · ` : ''}
          📅 ${App.formatDate(exam.date)}
          ${exam.location ? ` · 📍 ${exam.location}` : ''}
        </div>
        ${exam.notes ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem">${exam.notes}</div>` : ''}
        ${isPast && exam.score != null ? `
          <div style="margin-top:0.5rem">
            <span class="badge badge-mint">🏆 ${I18N.t('exam_score')}: ${exam.score}</span>
          </div>` : ''}
      </div>

      <div style="display:flex;flex-direction:column;gap:0.5rem;align-items:flex-end">
        ${!isPast ? `
          <button class="btn btn-primary btn-sm" onclick="ExamsPage.prepareExam('${exam.id}')">
            <i data-lucide="book-open"></i> ${I18N.t('exam_prepare')}
          </button>` : `
          <button class="btn btn-ghost btn-sm" onclick="ExamsPage.logScore('${exam.id}')">
            🏆 ${I18N.t('exam_score')}
          </button>`}
        <button class="btn btn-ghost btn-sm" onclick="ExamsPage.openEditModal('${exam.id}')">
          <i data-lucide="pencil"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="ExamsPage.deleteExam('${exam.id}')">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    </div>`;
  },

  _renderForm(exam = null) {
    const isEdit   = !!exam;
    const subjects = Storage.getSubjects();

    return `
    <div class="form-group">
      <label class="form-label">${I18N.t('exam_name')}</label>
      <input class="form-input" id="exam-name" value="${isEdit ? exam.name : ''}" placeholder="${I18N.lang === 'vi' ? 'vd: Thi cuối kỳ OOP' : 'e.g. Final Exam OOP'}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">${I18N.t('exam_subject')}</label>
        <select class="form-select" id="exam-subject">
          <option value="">${I18N.t('common_none')}</option>
          ${subjects.map(s => `<option value="${s.id}" ${isEdit && exam.subjectId === s.id ? 'selected' : ''}>${s.emoji} ${I18N.lang === 'vi' ? (s.nameVi||s.name) : s.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">${I18N.t('exam_date')}</label>
        <input class="form-input" type="datetime-local" id="exam-date" value="${isEdit ? exam.date.slice(0,16) : ''}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">${I18N.t('exam_location')}</label>
      <input class="form-input" id="exam-location" value="${isEdit ? (exam.location||'') : ''}" placeholder="${I18N.lang === 'vi' ? 'Phòng thi, địa điểm...' : 'Room, location...'}">
    </div>
    <div class="form-group">
      <label class="form-label">${I18N.t('exam_notes')}</label>
      <textarea class="form-textarea" id="exam-notes" style="min-height:80px">${isEdit ? (exam.notes||'') : ''}</textarea>
    </div>
    <button class="btn btn-primary w-full" onclick="ExamsPage.${isEdit ? `saveEdit('${exam.id}')` : 'saveNew()'}">
      <i data-lucide="save"></i> ${I18N.t('common_save')}
    </button>`;
  },

  init() {},

  setTab(tab) {
    this._tab = tab;
    const content = document.getElementById('exam-tab-content');
    if (content) {
      content.innerHTML = this._renderTab();
      if (window.lucide) lucide.createIcons();
    }
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const idx = tab === 'upcoming' ? 0 : 1;
    document.querySelectorAll('.tab-btn')[idx]?.classList.add('active');
  },

  openAddModal() {
    App.openModal(this._renderForm(), `➕ ${I18N.t('exam_add')}`);
  },

  openEditModal(id) {
    const exam = Storage.getExams().find(e => e.id === id);
    if (!exam) return;
    App.openModal(this._renderForm(exam), `✏️ ${I18N.lang === 'vi' ? 'Chỉnh sửa kỳ thi' : 'Edit Exam'}`);
  },

  saveNew() {
    const name = document.getElementById('exam-name')?.value.trim();
    const date = document.getElementById('exam-date')?.value;
    if (!name || !date) { App.toast(I18N.lang === 'vi' ? 'Nhập tên và ngày thi!' : 'Enter name and date!', 'error'); return; }

    Storage.upsertExam({
      id:        Storage.generateId(),
      name,
      date,
      subjectId: document.getElementById('exam-subject')?.value || null,
      location:  document.getElementById('exam-location')?.value.trim() || '',
      notes:     document.getElementById('exam-notes')?.value.trim() || '',
      score:     null,
    });
    App.closeModal();
    App._updateBadges();
    App.toast(I18N.t('common_success'), 'success');
    App.navigate('exams', false);
  },

  saveEdit(id) {
    const exam = Storage.getExams().find(e => e.id === id);
    if (!exam) return;
    exam.name      = document.getElementById('exam-name')?.value.trim() || exam.name;
    exam.date      = document.getElementById('exam-date')?.value || exam.date;
    exam.subjectId = document.getElementById('exam-subject')?.value || exam.subjectId;
    exam.location  = document.getElementById('exam-location')?.value.trim() || '';
    exam.notes     = document.getElementById('exam-notes')?.value.trim() || '';
    Storage.upsertExam(exam);
    App.closeModal();
    App.toast(I18N.t('common_success'), 'success');
    App.navigate('exams', false);
  },

  deleteExam(id) {
    App.confirm(I18N.t('common_confirm_delete'), () => {
      Storage.deleteExam(id);
      App._updateBadges();
      App.navigate('exams', false);
      App.toast(I18N.lang === 'vi' ? 'Đã xóa kỳ thi' : 'Exam deleted', 'success');
    });
  },

  prepareExam(id) {
    const exam = Storage.getExams().find(e => e.id === id);
    if (!exam) return;
    App.openModal(`
      <div style="text-align:center;padding:1rem 0">
        <div style="font-size:2rem;margin-bottom:1rem">📚</div>
        <h3 style="margin-bottom:0.5rem">${I18N.lang === 'vi' ? 'Ôn tập cho' : 'Preparing for'}: ${exam.name}</h3>
        <p style="color:var(--text-secondary);margin-bottom:2rem;font-size:0.875rem">
          ${I18N.lang === 'vi' ? 'Chọn phương thức ôn tập:' : 'Choose how to study:'}
        </p>
        <div style="display:flex;flex-direction:column;gap:0.75rem">
          <button class="btn btn-primary" onclick="App.closeModal();App.navigate('flashcards')">
            🃏 ${I18N.lang === 'vi' ? 'Ôn flashcard' : 'Review Flashcards'}
          </button>
          <button class="btn btn-coral" onclick="App.closeModal();App.navigate('quiz')">
            ✏️ ${I18N.lang === 'vi' ? 'Làm bài kiểm tra' : 'Take a Quiz'}
          </button>
          <button class="btn btn-ghost" onclick="App.closeModal();App.navigate('ai')">
            🤖 ${I18N.lang === 'vi' ? 'Hỏi Trợ lý AI' : 'Ask AI Assistant'}
          </button>
          <button class="btn btn-ghost" onclick="App.closeModal();App.navigate('timer')">
            ⏱️ ${I18N.lang === 'vi' ? 'Bắt đầu Pomodoro' : 'Start Pomodoro'}
          </button>
        </div>
      </div>
    `);
  },

  logScore(id) {
    const exam = Storage.getExams().find(e => e.id === id);
    if (!exam) return;
    App.openModal(`
      <div>
        <div class="form-group">
          <label class="form-label">🏆 ${I18N.t('exam_score')} — ${exam.name}</label>
          <input class="form-input" type="text" id="exam-score-input" placeholder="${I18N.lang === 'vi' ? 'vd: 8.5/10 hoặc A+' : 'e.g. 85/100 or A+'}" value="${exam.score || ''}">
        </div>
        <button class="btn btn-primary w-full" onclick="ExamsPage._saveScore('${id}')">
          <i data-lucide="save"></i> ${I18N.t('common_save')}
        </button>
      </div>
    `, `🏆 ${I18N.lang === 'vi' ? 'Nhập điểm số' : 'Log Score'}`);
  },

  _saveScore(id) {
    const score = document.getElementById('exam-score-input')?.value.trim();
    if (!score) return;
    const exams = Storage.getExams();
    const idx = exams.findIndex(e => e.id === id);
    if (idx >= 0) { exams[idx].score = score; Storage.saveExams(exams); }
    App.closeModal();
    App.toast(I18N.t('common_success'), 'success');
    App.navigate('exams', false);
  },
};
