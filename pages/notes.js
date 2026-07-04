// ============================================================
// StudyBloom 🌸 — Notes Page
// ============================================================

const NotesPage = {
  _activeNoteId: null,
  _unsaved: false,
  _autosaveTimeout: null,

  render() {
    const notes    = Storage.getNotes();
    const subjects = Storage.getSubjects();

    return `
    <div class="animate-fadeIn">
      <div class="page-header">
        <div>
          <h1 class="page-title">📓 ${I18N.t('notes_title')}</h1>
          <p class="page-subtitle">${I18N.lang==='vi'?'Ghi chú thông minh với OCR và xuất PDF':'Smart notes with OCR and PDF export'}</p>
        </div>
        <button class="btn btn-primary" onclick="NotesPage.newNote()">
          <i data-lucide="plus"></i> ${I18N.t('notes_new')}
        </button>
      </div>

      <div class="notes-layout">
        <!-- Notes List (sidebar) -->
        <div>
          <div class="search-bar mb-3">
            <i data-lucide="search"></i>
            <input type="text" id="notes-search" placeholder="${I18N.t('notes_search')}" oninput="NotesPage.search(this.value)">
          </div>

          <div class="notes-list" id="notes-list">
            ${notes.length === 0
              ? `<div class="empty-state" style="padding:2rem 0.5rem">
                  <div class="empty-state-icon">📝</div>
                  <h3>${I18N.t('notes_no_notes')}</h3>
                </div>`
              : notes.map(n => this._renderNoteListItem(n)).join('')}
          </div>
        </div>

        <!-- Editor -->
        <div class="notes-editor-area">
          ${this._activeNoteId ? this._renderEditor(Storage.getNoteById(this._activeNoteId)) : `
            <div style="flex:1;display:flex;align-items:center;justify-content:center;background:var(--glass-bg);border:1px solid var(--border);border-radius:var(--r-lg)">
              <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <h3>${I18N.lang==='vi'?'Chọn hoặc tạo ghi chú':'Select or create a note'}</h3>
              </div>
            </div>`}
        </div>
      </div>
    </div>`;
  },

  _renderNoteListItem(note) {
    const subject = Storage.getSubjectById(note.subjectId);
    const color   = subject ? subject.color : 'transparent';
    const isActive = note.id === this._activeNoteId;

    return `
    <div class="note-list-item ${isActive?'active':''}" onclick="NotesPage.openNote('${note.id}')" style="border-left:3px solid ${color}">
      <div class="note-list-title">${note.title || (I18N.lang==='vi'?'Ghi chú chưa có tiêu đề':'Untitled Note')}</div>
      <div class="note-list-meta">
        ${subject ? `${subject.emoji} ` : ''}${App.formatDate(note.updatedAt)}
      </div>
    </div>`;
  },

  _renderEditor(note) {
    const subjects = Storage.getSubjects();
    if (!note) return '';

    return `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;flex-wrap:wrap">
      <input class="form-input" id="note-title" value="${note.title || ''}" placeholder="${I18N.t('notes_title_ph')}" 
        style="font-size:1.1rem;font-weight:600;flex:1" oninput="NotesPage._triggerAutosave()">
      <select class="form-select" id="note-subject" style="width:auto" onchange="NotesPage._triggerAutosave()">
        <option value="">${I18N.lang==='vi'?'Chọn môn':'Subject'}</option>
        ${subjects.map(s => `<option value="${s.id}" ${note.subjectId===s.id?'selected':''}>${s.emoji} ${I18N.lang==='vi'?(s.nameVi||s.name):s.name}</option>`).join('')}
      </select>
    </div>

    <!-- Toolbar -->
    <div class="editor-toolbar">
      <button class="editor-btn" onclick="NotesPage.format('bold')" title="Bold"><b>B</b></button>
      <button class="editor-btn" onclick="NotesPage.format('italic')" title="Italic"><i>I</i></button>
      <button class="editor-btn" onclick="NotesPage.format('underline')" title="Underline"><u>U</u></button>
      <div style="width:1px;background:var(--border);margin:0 0.25rem"></div>
      <button class="editor-btn" onclick="NotesPage.format('insertUnorderedList')" title="Bullet list">• List</button>
      <button class="editor-btn" onclick="NotesPage.format('insertOrderedList')" title="Numbered list">1. List</button>
      <div style="width:1px;background:var(--border);margin:0 0.25rem"></div>
      <button class="editor-btn" onclick="NotesPage.insertMath()" title="Insert math">∑ Math</button>
      <button class="editor-btn" onclick="NotesPage.format('hiliteColor','#fbbf2444')" title="Highlight">🖊</button>
      <div style="width:1px;background:var(--border);margin:0 0.25rem"></div>
      <button class="editor-btn" onclick="NotesPage.openDiagramPicker()" title="${I18N.lang==='vi'?'Chèn biểu đồ':'Insert diagram'}">
        📐 ${I18N.lang==='vi'?'Biểu đồ':'Diagram'}
      </button>
      <button class="editor-btn" onclick="NotesPage.openOCRModal()" title="${I18N.t('notes_ocr')}">
        📷 OCR
      </button>
      <button class="editor-btn" onclick="NotesPage.printNote()" title="${I18N.t('notes_export')}">
        📄 PDF
      </button>
      <div style="margin-left:auto;font-size:0.7rem;color:var(--text-muted)" id="autosave-status">
        ${I18N.lang==='vi'?'Tự lưu':'Auto-saved'}
      </div>
    </div>

    <!-- Editor content -->
    <div id="note-editor-content" contenteditable="true" 
      data-placeholder="${I18N.t('notes_content_ph')}"
      oninput="NotesPage._triggerAutosave()"
      style="flex:1;min-height:400px">${note.content || ''}</div>

    <div style="display:flex;gap:0.5rem;justify-content:flex-end">
      <button class="btn btn-danger btn-sm" onclick="NotesPage.deleteNote('${note.id}')">
        <i data-lucide="trash-2"></i> ${I18N.t('notes_delete')}
      </button>
      <button class="btn btn-primary btn-sm" onclick="NotesPage.save()">
        <i data-lucide="save"></i> ${I18N.t('notes_save')}
      </button>
    </div>`;
  },

  init() {
    // Auto-open first note if none selected
    if (!this._activeNoteId) {
      const notes = Storage.getNotes();
      if (notes.length > 0) this._activeNoteId = notes[0].id;
    }
    // Bind editor paste event (for image paste)
    const editor = document.getElementById('note-editor-content');
    if (editor) {
      editor.addEventListener('paste', e => this._handlePaste(e));
    }
    App._renderMath();

    // Auto-insert pending diagram from Diagrams page
    if (window._pendingDiagramInsert) {
      const pendingId = window._pendingDiagramInsert;
      window._pendingDiagramInsert = null;
      // Small delay so the editor fully renders first
      setTimeout(() => {
        if (this._activeNoteId) {
          this.insertDiagramIntoNote(pendingId);
        } else {
          App.toast(I18N.lang==='vi'?'Mở hoặc tạo ghi chú để chèn biểu đồ!':'Open or create a note to insert the diagram!', 'info', 3000);
        }
      }, 400);
    }
  },

  newNote() {
    const note = {
      id:        Storage.generateId(),
      title:     '',
      content:   '',
      subjectId: null,
    };
    Storage.upsertNote(note);
    this._activeNoteId = note.id;
    App.navigate('notes', false);
  },

  openNote(id) {
    if (this._unsaved) this.save(true); // Silent save before switching
    this._activeNoteId = id;
    App.navigate('notes', false);
    App._renderMath();
  },

  save(silent = false) {
    const note = Storage.getNoteById(this._activeNoteId);
    if (!note) return;
    note.title     = document.getElementById('note-title')?.value.trim() || '';
    note.content   = document.getElementById('note-editor-content')?.innerHTML || '';
    note.subjectId = document.getElementById('note-subject')?.value || null;
    Storage.upsertNote(note);
    this._unsaved = false;
    const status = document.getElementById('autosave-status');
    if (status) status.textContent = `✓ ${I18N.lang==='vi'?'Đã lưu':'Saved'}`;
    if (!silent) App.toast(I18N.t('common_success'), 'success');
  },

  _triggerAutosave() {
    this._unsaved = true;
    const status = document.getElementById('autosave-status');
    if (status) status.textContent = I18N.lang==='vi'?'Đang lưu...':'Saving...';
    clearTimeout(this._autosaveTimeout);
    this._autosaveTimeout = setTimeout(() => this.save(true), 1200);
  },

  deleteNote(id) {
    App.confirm(I18N.t('common_confirm_delete'), () => {
      Storage.deleteNote(id);
      if (this._activeNoteId === id) this._activeNoteId = null;
      App.navigate('notes', false);
      App.toast(I18N.lang==='vi'?'Đã xóa ghi chú':'Note deleted','success');
    });
  },

  search(query) {
    const results = query.trim() ? Storage.searchNotes(query) : Storage.getNotes();
    const list = document.getElementById('notes-list');
    if (list) {
      list.innerHTML = results.length === 0
        ? `<p class="text-sm text-muted" style="padding:1rem">${I18N.lang==='vi'?'Không tìm thấy':'No results'}</p>`
        : results.map(n => this._renderNoteListItem(n)).join('');
    }
  },

  format(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('note-editor-content')?.focus();
    this._triggerAutosave();
  },

  insertMath() {
    const formula = prompt(I18N.lang==='vi'?'Nhập công thức LaTeX (vd: \\frac{a}{b}):':'Enter LaTeX formula (e.g. \\frac{a}{b}):');
    if (!formula) return;
    document.execCommand('insertHTML', false, ` $${formula}$ `);
    this._triggerAutosave();
    setTimeout(() => App._renderMath(), 200);
  },

  printNote() {
    const title   = document.getElementById('note-title')?.value || I18N.lang==='vi'?'Ghi chú':'Note';
    const content = document.getElementById('note-editor-content')?.innerHTML || '';
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
      <style>body{font-family:Georgia,serif;max-width:800px;margin:2rem auto;line-height:1.8;color:#1a1a1a}h1{margin-bottom:1rem}</style>
      </head><body><h1>${title}</h1>${content}</body></html>`);
    win.document.close();
    win.print();
  },

  _handlePaste(e) {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = ev => {
          document.execCommand('insertHTML', false, `<img src="${ev.target.result}" style="max-width:100%;border-radius:8px;margin:0.5rem 0">`);
          this._triggerAutosave();
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  },

  openOCRModal() {
    const settings = Storage.getSettings();
    App.openModal(`
      <div class="ocr-dropzone" onclick="document.getElementById('notes-ocr-file').click()">
        <div class="ocr-dropzone-icon">📷</div>
        <h3>${I18N.lang==='vi'?'Tải ảnh ghi tay':'Upload handwritten notes'}</h3>
        <p>${I18N.lang==='vi'?'JPG, PNG — Backend cần chạy trước':'JPG, PNG — Backend must be running'}</p>
        <input type="file" id="notes-ocr-file" accept=".jpg,.jpeg,.png,.pdf" style="display:none"
          onchange="NotesPage.processOCR(this.files[0])">
      </div>
      <div id="notes-ocr-result" style="display:none;margin-top:1rem">
        <label class="form-label">${I18N.lang==='vi'?'Văn bản nhận dạng (chỉnh sửa nếu cần):':'Recognized text:'}</label>
        <textarea class="form-textarea" id="notes-ocr-text" style="min-height:200px"></textarea>
        <button class="btn btn-primary w-full mt-2" onclick="NotesPage.insertOCRText()">
          <i data-lucide="file-text"></i> ${I18N.lang==='vi'?'Chèn vào ghi chú':'Insert into note'}
        </button>
      </div>
      <div id="notes-ocr-loading" style="display:none;text-align:center;padding:2rem">
        <div style="font-size:2rem">⚙️</div>
        <p>${I18N.lang==='vi'?'Đang nhận dạng chữ...':'Running OCR...'}</p>
      </div>
    `, `📷 ${I18N.t('notes_ocr')}`);
  },

  async processOCR(file) {
    if (!file) return;
    document.getElementById('notes-ocr-loading').style.display = 'block';
    document.querySelector('.ocr-dropzone').style.display = 'none';

    const settings = Storage.getSettings();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${settings.backendUrl}/api/ocr/image`, { method:'POST', body:formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      document.getElementById('notes-ocr-loading').style.display = 'none';
      document.getElementById('notes-ocr-result').style.display  = 'block';
      document.getElementById('notes-ocr-text').value = data.text || '';
    } catch {
      document.getElementById('notes-ocr-loading').style.display = 'none';
      document.querySelector('.ocr-dropzone').style.display = 'block';
      App.toast(I18N.t('ai_backend_off'), 'error', 5000);
    }
  },

  insertOCRText() {
    const text = document.getElementById('notes-ocr-text')?.value.trim();
    if (!text) return;
    const editor = document.getElementById('note-editor-content');
    if (editor) {
      editor.focus();
      document.execCommand('insertHTML', false, `<p>${text.replace(/\n/g, '</p><p>')}</p>`);
      this._triggerAutosave();
    }
    App.closeModal();
    App._renderMath();
  },

  openDiagramPicker() {
    const lang = I18N.lang;
    const saved = Storage.getDiagrams();

    App.openModal(`
      <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem">
        ${lang==='vi'
          ? 'Chọn một biểu đồ đã lưu để chèn vào ghi chú. Biểu đồ sẽ được chèn dưới dạng hình ảnh SVG.'
          : 'Pick a saved diagram to insert. It will be embedded as an SVG image.'}
      </p>
      ${saved.length === 0
        ? `<div class="empty-state">
            <div class="empty-state-icon">📐</div>
            <p>${lang==='vi'?'Chưa có biểu đồ nào. Hãy tạo biểu đồ trong trang Biểu đồ trước.':'No saved diagrams yet. Create one on the Diagrams page first.'}</p>
           </div>`
        : `<div style="display:flex;flex-direction:column;gap:0.5rem;max-height:340px;overflow-y:auto">
            ${saved.map(d => `
              <div class="card card-sm card-clickable flex items-center gap-3" onclick="NotesPage.insertDiagramIntoNote('${d.id}')">
                <span style="font-size:1.5rem">📐</span>
                <div style="flex:1">
                  <div style="font-weight:600;font-size:0.9rem">${d.name}</div>
                  <div style="font-size:0.7rem;color:var(--text-muted)">${App.formatDate(d.updatedAt)}</div>
                </div>
                <i data-lucide="corner-down-left" style="width:14px;height:14px;color:var(--purple)"></i>
              </div>`).join('')}
          </div>`
      }

      <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border)">
        <button class="btn btn-ghost w-full" onclick="App.closeModal();App.navigate('diagrams',false)">
          <i data-lucide="external-link"></i> ${lang==='vi'?'Mở trang Biểu đồ':'Go to Diagrams page'}
        </button>
      </div>
    `, `📐 ${lang==='vi'?'Chèn biểu đồ vào ghi chú':'Insert Diagram into Note'}`);
    if (window.lucide) lucide.createIcons();
  },

  async insertDiagramIntoNote(diagramId) {
    const d = Storage.getDiagrams().find(d => d.id === diagramId);
    if (!d || !d.code) return;

    const editor = document.getElementById('note-editor-content');
    App.closeModal();

    // Load Mermaid if not loaded yet
    const loadMermaid = () => new Promise((resolve) => {
      if (window.mermaid && window.mermaid.render) return resolve();
      const existing = document.getElementById('mermaid-script');
      if (existing) {
        existing.addEventListener('load', resolve);
        return;
      }
      const s = document.createElement('script');
      s.id = 'mermaid-script';
      s.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
      s.onload = resolve;
      document.head.appendChild(s);
    });

    App.toast(I18N.lang==='vi'?'Đang chèn biểu đồ...':'Inserting diagram...', 'info', 2000);

    try {
      await loadMermaid();
      window.mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
      const id = 'notes-mermaid-' + Date.now();
      const { svg } = await window.mermaid.render(id, d.code);

      // Wrap in a styled figure so it looks good in the note
      const figure = `<figure style="margin:1rem 0;padding:1rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:12px;text-align:center">
        ${svg}
        <figcaption style="font-size:0.75rem;color:#94a3b8;margin-top:0.5rem">📐 ${d.name}</figcaption>
      </figure>`;

      if (editor) {
        editor.focus();
        document.execCommand('insertHTML', false, figure);
        this._triggerAutosave();
      }
      App.toast(I18N.lang==='vi'?'Đã chèn biểu đồ!':'Diagram inserted!', 'success');
    } catch (err) {
      App.toast(I18N.lang==='vi'?'Không thể render biểu đồ: lỗi cú pháp Mermaid.':'Could not render diagram: Mermaid syntax error.', 'error', 4000);
    }
  },

  destroy() {
    clearTimeout(this._autosaveTimeout);
    if (this._unsaved) this.save(true);
  },
};
