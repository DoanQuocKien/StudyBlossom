// ============================================================
// StudyBlossom 🌸 — Subjects Page
// ============================================================

const SubjectsPage = {
  render() {
    const subjects = Storage.getSubjects();
    return `
    <div class="animate-fadeIn">
      <div class="page-header">
        <div>
          <h1 class="page-title">📚 ${I18N.t('subj_title')}</h1>
          <p class="page-subtitle">${I18N.lang === 'vi' ? 'Quản lý các môn học của bạn' : 'Manage your subjects'}</p>
        </div>
        <button class="btn btn-primary" onclick="SubjectsPage.openAddModal()">
          <i data-lucide="plus"></i> ${I18N.t('subj_add')}
        </button>
      </div>

      <div class="grid-auto" id="subjects-grid">
        ${subjects.map(s => this._renderSubjectCard(s)).join('')}
      </div>
    </div>`;
  },

  _renderSubjectCard(s) {
    const decks  = Storage.getDecks().filter(d => d.subjectId === s.id);
    const notes  = Storage.getNotes().filter(n => n.subjectId === s.id);
    const quizzes = Storage.getQuizzes().filter(q => q.subjectId === s.id);

    return `
    <div class="subject-card animate-slideUp" style="--subject-color:${s.color}">
      <div class="subject-emoji">${s.emoji}</div>
      <div class="subject-name">${s.name}</div>
      <div class="subject-name-vi">${s.nameVi}</div>

      <div class="subject-stats">
        <span>🃏 ${decks.length} ${I18N.lang === 'vi' ? 'bộ thẻ' : 'decks'}</span>
        <span>📝 ${notes.length} ${I18N.lang === 'vi' ? 'ghi chú' : 'notes'}</span>
        <span>✏️ ${quizzes.length} quiz</span>
      </div>

      <div class="mb-4">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs text-muted">${I18N.t('subj_progress')}</span>
          <span class="text-xs" style="color:${s.color}">${s.progress || 0}%</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width:${s.progress || 0}%;background:linear-gradient(90deg,${s.color},${s.color}88)"></div>
        </div>
      </div>

      <!-- Topics -->
      <div style="margin-bottom:1rem">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-muted font-bold" style="text-transform:uppercase;letter-spacing:0.05em">${I18N.t('subj_topics')}</span>
          <button class="btn btn-ghost btn-sm" onclick="SubjectsPage.addTopic('${s.id}')" style="padding:2px 8px;font-size:11px">+</button>
        </div>
        <div id="topics-${s.id}">
          ${(s.topics || []).length === 0
            ? `<p class="text-xs text-muted">${I18N.t('subj_no_topics')}</p>`
            : (s.topics || []).map((t, i) => `
              <div class="flex items-center justify-between" style="padding:0.25rem 0;border-bottom:1px solid var(--border)">
                <label class="flex items-center gap-2 cursor-pointer" style="flex:1">
                  <input type="checkbox" ${t.done ? 'checked' : ''} 
                    onchange="SubjectsPage.toggleTopic('${s.id}', ${i}, this.checked)"
                    style="accent-color:${s.color}">
                  <span class="text-sm" style="${t.done ? 'text-decoration:line-through;color:var(--text-muted)' : ''}">${t.name}</span>
                </label>
                <button onclick="SubjectsPage.deleteTopic('${s.id}', ${i})" class="btn btn-icon" style="color:var(--text-muted);padding:2px">
                  <i data-lucide="x" style="width:12px;height:12px"></i>
                </button>
              </div>`).join('')
          }
        </div>
      </div>

      <!-- Progress slider -->
      <div style="margin-bottom:1rem">
        <input type="range" min="0" max="100" value="${s.progress || 0}" 
          style="width:100%;accent-color:${s.color};height:4px"
          oninput="SubjectsPage.updateProgress('${s.id}', this.value)"
          title="${I18N.t('subj_progress')}">
      </div>

      <div class="subject-actions">
        <button class="btn btn-ghost btn-sm" onclick="App.navigate('flashcards')">
          🃏 ${I18N.t('subj_go_flashcards')}
        </button>
        <button class="btn btn-ghost btn-sm" onclick="App.navigate('notes')">
          📝 ${I18N.t('subj_go_notes')}
        </button>
        <button class="btn btn-ghost btn-sm" onclick="App.navigate('quiz')">
          ✏️ ${I18N.t('subj_go_quiz')}
        </button>
      </div>

      <div class="flex gap-2 mt-2">
        <button class="btn btn-ghost btn-sm flex-1" onclick="SubjectsPage.openEditModal('${s.id}')">
          <i data-lucide="pencil"></i> ${I18N.t('subj_edit')}
        </button>
        ${!['oop','dsa','dc','dm','ps'].includes(s.id) ? `
        <button class="btn btn-danger btn-sm" onclick="SubjectsPage.deleteSubject('${s.id}')">
          <i data-lucide="trash-2"></i>
        </button>` : ''}
      </div>
    </div>`;
  },

  _renderForm(subject = null) {
    const isEdit = !!subject;
    const emojis = ['💻','🌳','⚡','🔢','📊','📐','🧮','🔬','📖','🧪','🌐','🎯','💡','🧠','📡'];
    const colors = ['#a78bfa','#6ee7b7','#fbbf24','#fb7185','#60a5fa','#f472b6','#34d399','#f97316','#a3e635','#e879f9'];

    return `
    <div class="form-group">
      <label class="form-label">${I18N.t('subj_name')}</label>
      <input class="form-input" id="subj-name" value="${isEdit ? subject.name : ''}" placeholder="e.g. Linear Algebra">
    </div>
    <div class="form-group">
      <label class="form-label">${I18N.t('subj_name_vi')}</label>
      <input class="form-input" id="subj-name-vi" value="${isEdit ? subject.nameVi : ''}" placeholder="vd: Đại số tuyến tính">
    </div>
    <div class="form-group">
      <label class="form-label">${I18N.t('subj_emoji')}</label>
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
        ${emojis.map(e => `
          <button type="button" onclick="this.parentNode.querySelectorAll('.emoji-pick').forEach(b=>b.classList.remove('active'));this.classList.add('active');document.getElementById('subj-emoji-val').value='${e}'"
            class="emoji-pick btn btn-ghost btn-sm" ${isEdit && subject.emoji === e ? 'style="border-color:var(--purple)"' : ''}>
            ${e}
          </button>`).join('')}
      </div>
      <input type="hidden" id="subj-emoji-val" value="${isEdit ? subject.emoji : '💡'}">
    </div>
    <div class="form-group">
      <label class="form-label">${I18N.t('subj_color')}</label>
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
        ${colors.map(c => `
          <button type="button" onclick="this.parentNode.querySelectorAll('.color-pick').forEach(b=>b.style.outline='none');this.style.outline='2px solid #fff';document.getElementById('subj-color-val').value='${c}'"
            class="color-pick" style="width:28px;height:28px;border-radius:50%;background:${c};border:none;cursor:pointer;${isEdit && subject.color === c ? 'outline:2px solid #fff' : ''}"></button>`).join('')}
      </div>
      <input type="hidden" id="subj-color-val" value="${isEdit ? subject.color : '#a78bfa'}">
    </div>
    <button class="btn btn-primary w-full" onclick="SubjectsPage.${isEdit ? `saveEdit('${subject.id}')` : 'saveNew()'}">
      <i data-lucide="save"></i> ${I18N.t('common_save')}
    </button>`;
  },

  init() {},

  openAddModal() {
    App.openModal(this._renderForm(), `➕ ${I18N.t('subj_add')}`);
  },

  openEditModal(id) {
    const subject = Storage.getSubjectById(id);
    if (!subject) return;
    App.openModal(this._renderForm(subject), `✏️ ${I18N.t('subj_edit')}`);
  },

  saveNew() {
    const name   = document.getElementById('subj-name')?.value.trim();
    const nameVi = document.getElementById('subj-name-vi')?.value.trim();
    const emoji  = document.getElementById('subj-emoji-val')?.value || '💡';
    const color  = document.getElementById('subj-color-val')?.value || '#a78bfa';

    if (!name) { App.toast(I18N.lang === 'vi' ? 'Nhập tên môn học!' : 'Enter subject name!', 'error'); return; }

    Storage.upsertSubject({ id: Storage.generateId(), name, nameVi: nameVi || name, emoji, color, progress: 0, topics: [] });
    App.closeModal();
    App.toast(I18N.t('common_success'), 'success');
    App.navigate('subjects', false);
  },

  saveEdit(id) {
    const subject = Storage.getSubjectById(id);
    if (!subject) return;
    subject.name   = document.getElementById('subj-name')?.value.trim() || subject.name;
    subject.nameVi = document.getElementById('subj-name-vi')?.value.trim() || subject.nameVi;
    subject.emoji  = document.getElementById('subj-emoji-val')?.value || subject.emoji;
    subject.color  = document.getElementById('subj-color-val')?.value || subject.color;
    Storage.upsertSubject(subject);
    App.closeModal();
    App.toast(I18N.t('common_success'), 'success');
    App.navigate('subjects', false);
  },

  deleteSubject(id) {
    App.confirm(I18N.t('common_confirm_delete'), () => {
      Storage.deleteSubject(id);
      App.navigate('subjects', false);
      App.toast(I18N.lang === 'vi' ? 'Đã xóa môn học' : 'Subject deleted', 'success');
    });
  },

  addTopic(subjectId) {
    const name = prompt(I18N.lang === 'vi' ? 'Tên chủ đề:' : 'Topic name:');
    if (!name) return;
    const subject = Storage.getSubjectById(subjectId);
    if (!subject) return;
    subject.topics = [...(subject.topics || []), { name: name.trim(), done: false }];
    Storage.upsertSubject(subject);
    App.navigate('subjects', false);
  },

  toggleTopic(subjectId, idx, done) {
    const subject = Storage.getSubjectById(subjectId);
    if (!subject || !subject.topics[idx]) return;
    subject.topics[idx].done = done;
    const doneCount = subject.topics.filter(t => t.done).length;
    subject.progress = subject.topics.length > 0 ? Math.round((doneCount / subject.topics.length) * 100) : 0;
    Storage.upsertSubject(subject);
    // Update progress bar inline without full re-render
    const fill = document.querySelector(`[data-subject-progress="${subjectId}"]`);
    if (fill) fill.style.width = subject.progress + '%';
  },

  deleteTopic(subjectId, idx) {
    const subject = Storage.getSubjectById(subjectId);
    if (!subject) return;
    subject.topics.splice(idx, 1);
    Storage.upsertSubject(subject);
    App.navigate('subjects', false);
  },

  updateProgress(subjectId, value) {
    const subject = Storage.getSubjectById(subjectId);
    if (!subject) return;
    subject.progress = parseInt(value);
    Storage.upsertSubject(subject);
  },
};
