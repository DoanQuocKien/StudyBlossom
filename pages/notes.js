// ============================================================
// StudyBloom 🌸 — Notes Page (Block Editor)
// 5 block types: text | code | image | math | table
// ============================================================

const NotesPage = {
  _activeNoteId: null,
  _unsaved: false,
  _autosaveTimeout: null,
  _blocks: [],      // working copy for the open note
  _onDocClick: null,

  // ── Main layout ──────────────────────────────────────────
  render() {
    const notes    = Storage.getNotes();
    const subjects = Storage.getSubjects();
    const lang     = I18N.lang;

    return `
    <div class="animate-fadeIn">
      <div class="page-header">
        <div>
          <h1 class="page-title">📓 ${I18N.t('notes_title')}</h1>
          <p class="page-subtitle">${lang==='vi'?'Trình soạn thảo khối — văn bản, code, ảnh, toán, bảng':'Block editor — text, code, image, math, table'}</p>
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

        <!-- Editor area -->
        <div class="notes-editor-area" id="notes-editor-area">
          ${this._activeNoteId ? this._renderEditor(Storage.getNoteById(this._activeNoteId)) : `
            <div style="flex:1;display:flex;align-items:center;justify-content:center;background:var(--glass-bg);border:1px solid var(--border);border-radius:var(--r-lg)">
              <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <h3>${lang==='vi'?'Chọn hoặc tạo ghi chú':'Select or create a note'}</h3>
              </div>
            </div>`}
        </div>
      </div>
    </div>`;
  },

  // ── Note list item ───────────────────────────────────────
  _renderNoteListItem(note) {
    const subject  = Storage.getSubjectById(note.subjectId);
    const color    = subject ? subject.color : 'transparent';
    const isActive = note.id === this._activeNoteId;
    const blocks   = note.blocks || [];

    return `
    <div class="note-list-item ${isActive?'active':''}" onclick="NotesPage.openNote('${note.id}')" style="border-left:3px solid ${color}">
      <div class="note-list-title">${note.title || (I18N.lang==='vi'?'Ghi chú chưa có tiêu đề':'Untitled Note')}</div>
      <div class="note-list-meta">
        ${subject ? `${subject.emoji} ` : ''}${App.formatDate(note.updatedAt)}
        ${blocks.length > 0 ? `<span style="margin-left:0.4rem;opacity:0.6">${blocks.length}kb</span>` : ''}
      </div>
    </div>`;
  },

  // ── Editor wrapper ───────────────────────────────────────
  _renderEditor(note) {
    if (!note) return '';
    const subjects = Storage.getSubjects();
    const lang     = I18N.lang;

    return `
    <!-- Header row: title / subject / autosave -->
    <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.75rem">
      <input class="form-input" id="note-title" value="${(note.title||'').replace(/"/g,'&quot;')}" placeholder="${I18N.t('notes_title_ph')}"
        style="font-size:1.1rem;font-weight:600;flex:1" oninput="NotesPage._triggerAutosave()">
      <select class="form-select" id="note-subject" style="width:auto" onchange="NotesPage._triggerAutosave()">
        <option value="">${lang==='vi'?'Chọn môn':'Subject'}</option>
        ${subjects.map(s => `<option value="${s.id}" ${note.subjectId===s.id?'selected':''}>${s.emoji} ${lang==='vi'?(s.nameVi||s.name):s.name}</option>`).join('')}
      </select>
      <span style="font-size:0.7rem;color:var(--text-muted)" id="autosave-status">${lang==='vi'?'Tự lưu':'Auto-saved'}</span>
    </div>

    <!-- Block container -->
    <div id="note-blocks-container" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:0">
      ${this._renderInsertBar(-1)}
      ${this._blocks.map((b, i) => this._renderBlock(b, i)).join('')}
      ${this._blocks.length === 0 ? this._renderEmptyHint() : ''}
    </div>

    <!-- Footer actions -->
    <div style="display:flex;gap:0.5rem;justify-content:flex-end;margin-top:1rem;padding-top:0.75rem;border-top:1px solid var(--border)">
      <button class="btn btn-ghost btn-sm" onclick="NotesPage.printNote()">
        <i data-lucide="printer"></i> PDF
      </button>
      <button class="btn btn-danger btn-sm" onclick="NotesPage.deleteNote('${note.id}')">
        <i data-lucide="trash-2"></i> ${I18N.t('notes_delete')}
      </button>
      <button class="btn btn-primary btn-sm" onclick="NotesPage.save()">
        <i data-lucide="save"></i> ${I18N.t('notes_save')}
      </button>
    </div>`;
  },

  _renderEmptyHint() {
    const lang = I18N.lang;
    return `<div style="text-align:center;color:var(--text-muted);padding:3rem 1rem;font-size:0.9rem;border:2px dashed var(--border);border-radius:var(--r-lg);margin:0.5rem 0">
      <div style="font-size:2rem;margin-bottom:0.5rem">📝</div>
      ${lang==='vi'?'Nhấn <b>+</b> bên trên để thêm khối đầu tiên':'Click <b>+</b> above to add your first block'}
    </div>`;
  },

  // ── Insert bar ───────────────────────────────────────────
  _renderInsertBar(afterIdx) {
    const lang = I18N.lang;
    return `
    <div class="block-insert-bar" id="insert-bar-${afterIdx}">
      <div class="block-insert-line"></div>
      <button class="block-insert-btn" onclick="NotesPage._toggleInsertMenu(${afterIdx},event)">+</button>
      <div class="block-insert-line"></div>
      <div class="block-insert-menu" id="insert-menu-${afterIdx}">
        <button onclick="NotesPage.insertBlock(${afterIdx},'text')">📝 ${lang==='vi'?'Văn bản':'Text'}</button>
        <button onclick="NotesPage.insertBlock(${afterIdx},'code')">💻 Code</button>
        <button onclick="NotesPage.insertBlock(${afterIdx},'image')">🖼️ ${lang==='vi'?'Ảnh/PDF':'Image/PDF'}</button>
        <button onclick="NotesPage.insertBlock(${afterIdx},'math')">∑ ${lang==='vi'?'Toán':'Math'}</button>
        <button onclick="NotesPage.insertBlock(${afterIdx},'table')">📊 ${lang==='vi'?'Bảng/Graph':'Table/Graph'}</button>
      </div>
    </div>`;
  },

  _toggleInsertMenu(afterIdx, event) {
    event.stopPropagation();
    const id = `insert-menu-${afterIdx}`;
    document.querySelectorAll('.block-insert-menu.open').forEach(m => { if (m.id !== id) m.classList.remove('open'); });
    const menu = document.getElementById(id);
    if (menu) menu.classList.toggle('open');
  },

  // ── Block wrapper ────────────────────────────────────────
  _renderBlock(block, idx) {
    let inner = '';
    try {
      switch (block.type) {
        case 'text':  inner = this._renderTextBlock(block);  break;
        case 'code':  inner = this._renderCodeBlock(block);  break;
        case 'image': inner = this._renderImageBlock(block); break;
        case 'math':  inner = this._renderMathBlock(block);  break;
        case 'table': inner = this._renderTableBlock(block); break;
        default: inner = `<div style="color:var(--coral);padding:0.5rem">Unknown block: ${block.type}</div>`;
      }
    } catch(e) {
      inner = `<div style="color:var(--coral);padding:0.5rem">Error rendering block</div>`;
    }

    const isFirst = idx === 0;
    const isLast  = idx === this._blocks.length - 1;

    return `
    <div class="block-wrapper" data-block-id="${block.id}" data-block-idx="${idx}">
      <div class="block-handle-col">
        <button class="block-handle-btn" onclick="NotesPage.moveBlock('${block.id}',-1)" title="Move up" ${isFirst?'disabled':''}>↑</button>
        <span class="block-type-badge">${{text:'T',code:'{}',image:'🖼',math:'∑',table:'⊞'}[block.type]||'?'}</span>
        <button class="block-handle-btn" onclick="NotesPage.moveBlock('${block.id}',1)" title="Move down" ${isLast?'disabled':''}>↓</button>
        <button class="block-handle-btn block-delete-btn" onclick="NotesPage.deleteBlock('${block.id}')" title="Delete">×</button>
      </div>
      <div class="block-content-col">
        ${inner}
      </div>
    </div>
    ${this._renderInsertBar(idx)}`;
  },

  // ═══════════════════════════════════════════════════════
  // TEXT BLOCK
  // ═══════════════════════════════════════════════════════
  _renderTextBlock(block) {
    const lang = I18N.lang;
    return `
    <div class="text-block-toolbar">
      <button class="editor-btn" onclick="NotesPage._fmt('${block.id}','bold')"><b>B</b></button>
      <button class="editor-btn" onclick="NotesPage._fmt('${block.id}','italic')"><i>I</i></button>
      <button class="editor-btn" onclick="NotesPage._fmt('${block.id}','underline')"><u>U</u></button>
      <div class="tb-sep"></div>
      <button class="editor-btn" onclick="NotesPage._fmt('${block.id}','insertUnorderedList')">• List</button>
      <button class="editor-btn" onclick="NotesPage._fmt('${block.id}','insertOrderedList')">1. List</button>
      <div class="tb-sep"></div>
      <button class="editor-btn" onclick="NotesPage._fmt('${block.id}','hiliteColor','#fbbf2455')">🖊 ${lang==='vi'?'Đánh dấu':'Highlight'}</button>
      <button class="editor-btn" onclick="NotesPage._insertInlinemath('${block.id}')">∑ ${lang==='vi'?'Toán':'Math'}</button>
      <div class="tb-sep"></div>
      <button class="editor-btn" onclick="NotesPage._openOCRForBlock('${block.id}')">📷 OCR</button>
      <button class="editor-btn" onclick="NotesPage._openDiagramForBlock('${block.id}')">📐</button>
    </div>
    <div class="block-text-editor"
      contenteditable="true"
      id="text-block-${block.id}"
      data-block-id="${block.id}"
      data-placeholder="${lang==='vi'?'Nhập văn bản...':'Type something...'}"
      oninput="NotesPage._onBlockInput('${block.id}')"
    >${block.html || ''}</div>`;
  },

  _fmt(blockId, command, value = null) {
    const el = document.getElementById(`text-block-${blockId}`);
    if (!el) return;
    el.focus();
    document.execCommand(command, false, value);
    this._onBlockInput(blockId);
  },

  _insertInlinemath(blockId) {
    const formula = prompt(I18N.lang==='vi'?'Nhập công thức LaTeX (vd: \\frac{a}{b}):':'Enter LaTeX formula (e.g. \\frac{a}{b}):');
    if (!formula) return;
    const el = document.getElementById(`text-block-${blockId}`);
    if (!el) return;
    el.focus();
    document.execCommand('insertHTML', false, ` $${formula}$ `);
    this._onBlockInput(blockId);
    setTimeout(() => App._renderMath(), 200);
  },

  // ═══════════════════════════════════════════════════════
  // CODE BLOCK
  // ═══════════════════════════════════════════════════════
  _renderCodeBlock(block) {
    const langs = ['cpp','c','python','java','javascript','typescript','sql','bash','other'];
    return `
    <div class="code-block-header">
      <select class="code-lang-select" onchange="NotesPage._setCodeLang('${block.id}',this.value)">
        ${langs.map(l => `<option value="${l}" ${block.lang===l?'selected':''}>${l==='cpp'?'C++':l==='sql'?'SQL':l.charAt(0).toUpperCase()+l.slice(1)}</option>`).join('')}
      </select>
      <span style="flex:1"></span>
      <button class="editor-btn" onclick="NotesPage._copyCode('${block.id}')">📋 Copy</button>
    </div>
    <textarea class="code-block-textarea"
      id="code-block-${block.id}"
      data-block-id="${block.id}"
      spellcheck="false"
      autocomplete="off"
      placeholder="// Write code here..."
      oninput="NotesPage._onBlockInput('${block.id}');NotesPage._resizeCode(this)"
      onkeydown="NotesPage._codeKeyDown(event,'${block.id}')"
    >${(block.text||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>`;
  },

  _codeKeyDown(e, blockId) {
    const ta = e.target;
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = ta.selectionStart, end = ta.selectionEnd;
      ta.value = ta.value.substring(0,s) + '    ' + ta.value.substring(end);
      ta.selectionStart = ta.selectionEnd = s + 4;
      this._onBlockInput(blockId);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const s = ta.selectionStart;
      const textBefore = ta.value.substring(0, s);
      const lines   = textBefore.split('\n');
      const curLine = lines[lines.length - 1];
      const indent  = curLine.match(/^(\s*)/)[1];
      let newIndent = indent;
      const trimmedLine = curLine.trimEnd();
      if (trimmedLine.endsWith('{')) {
        newIndent = indent + '    ';
      }
      // If only whitespace+closing brace, de-indent the current line first
      if (/^\s*\}$/.test(curLine) && indent.length >= 4) {
        // de-indent current line too
        const lineStart = textBefore.lastIndexOf('\n') + 1;
        const beforeLine = ta.value.substring(0, lineStart);
        const afterLine  = ta.value.substring(s);
        ta.value = beforeLine + curLine.trimStart() + afterLine;
        const newPos = lineStart + curLine.trimStart().length;
        ta.selectionStart = ta.selectionEnd = newPos;
      }
      const s2 = ta.selectionStart;
      const ins = '\n' + newIndent;
      ta.value = ta.value.substring(0,s2) + ins + ta.value.substring(s2);
      ta.selectionStart = ta.selectionEnd = s2 + ins.length;
      this._resizeCode(ta);
      this._onBlockInput(blockId);
    }
  },

  _resizeCode(ta) {
    ta.style.height = 'auto';
    ta.style.height = Math.max(80, Math.min(ta.scrollHeight + 4, 600)) + 'px';
  },

  _setCodeLang(blockId, lang) {
    const b = this._blocks.find(b => b.id === blockId);
    if (b) { b.lang = lang; this._triggerAutosave(); }
  },

  _copyCode(blockId) {
    const ta = document.getElementById(`code-block-${blockId}`);
    if (!ta) return;
    navigator.clipboard.writeText(ta.value).then(() => App.toast('Copied!', 'success', 1500));
  },

  // ═══════════════════════════════════════════════════════
  // IMAGE / PDF BLOCK
  // ═══════════════════════════════════════════════════════
  _renderImageBlock(block) {
    const lang = I18N.lang;
    if (block.idbKey) {
      setTimeout(() => this._loadImageFromIDB(block), 0);
      return `<div class="image-block-wrapper" id="img-wrapper-${block.id}">
        <div class="image-block-loading">
          <span class="spinner"></span>
          <span style="margin-left:0.5rem;font-size:0.85rem;color:var(--text-muted)">${lang==='vi'?'Đang tải...':'Loading...'}</span>
        </div>
      </div>`;
    }
    return `
    <div class="image-block-upload-zone" onclick="document.getElementById('img-input-${block.id}').click()">
      <div style="font-size:2.5rem;margin-bottom:0.5rem">🖼️</div>
      <div style="font-weight:600;margin-bottom:0.25rem">${lang==='vi'?'Nhấn để chọn ảnh hoặc PDF':'Click to select image or PDF'}</div>
      <div style="font-size:0.8rem;color:var(--text-muted)">JPG, PNG, WEBP, PDF — ${lang==='vi'?'lưu cục bộ, không cần backend':'stored locally, no backend needed'}</div>
      <input type="file" id="img-input-${block.id}" accept=".jpg,.jpeg,.png,.webp,.pdf" style="display:none"
        onchange="NotesPage._onImageSelected(event,'${block.id}')">
    </div>`;
  },

  async _loadImageFromIDB(block) {
    const wrapper = document.getElementById(`img-wrapper-${block.id}`);
    if (!wrapper) return;
    try {
      const url = await IDB.getObjectURL(block.idbKey);
      if (!url) { wrapper.innerHTML = `<p style="color:var(--coral);padding:1rem">❌ File not found in storage</p>`; return; }
      if (block.mime === 'application/pdf') {
        wrapper.innerHTML = `
          <div class="image-block-pdf">
            <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.5rem">📄 ${block.name||'document.pdf'}</div>
            <embed src="${url}" type="application/pdf" style="width:100%;min-height:500px;border-radius:var(--r-md);border:1px solid var(--border)" />
          </div>`;
      } else {
        wrapper.innerHTML = `
          <div class="image-block-img">
            <img src="${url}" alt="${block.name||''}" style="max-width:100%;border-radius:var(--r-md);display:block;cursor:zoom-in"
              onclick="window.open('${url}','_blank')">
            <div style="font-size:0.7rem;color:var(--text-muted);margin-top:0.25rem">📎 ${block.name||'image'}</div>
          </div>`;
      }
    } catch(e) {
      wrapper.innerHTML = `<p style="color:var(--coral);padding:1rem">❌ Error loading file</p>`;
    }
  },

  async _onImageSelected(event, blockId) {
    const file = event.target.files[0];
    if (!file) return;
    const block = this._blocks.find(b => b.id === blockId);
    if (!block) return;
    const key = `note-img-${blockId}-${Date.now()}`;
    try {
      await IDB.storeFile(key, file);
      block.idbKey = key;
      block.name   = file.name;
      block.mime   = file.type;
      this._triggerAutosave();
      const wrapper = document.querySelector(`.block-wrapper[data-block-id="${blockId}"] .block-content-col`);
      if (wrapper) { wrapper.innerHTML = this._renderImageBlock(block); }
    } catch(e) {
      App.toast(I18N.lang==='vi'?'Lỗi lưu file':'Error saving file', 'error');
    }
  },

  // ═══════════════════════════════════════════════════════
  // MATH BLOCK
  // ═══════════════════════════════════════════════════════
  _renderMathBlock(block) {
    const lang = I18N.lang;
    const templates = [
      { l:'Fraction', t:'\\frac{a}{b}' },
      { l:'Sum',      t:'\\sum_{i=0}^{n} x_i' },
      { l:'Integral', t:'\\int_a^b f(x)\\,dx' },
      { l:'Sqrt',     t:'\\sqrt{x}' },
      { l:'Limit',    t:'\\lim_{x \\to \\infty} f(x)' },
      { l:'Derivative',t:'\\frac{d}{dx}f(x)' },
      { l:'Matrix',   t:'\\begin{pmatrix} a & b \\\\\\\\ c & d \\end{pmatrix}' },
      { l:'Binomial', t:'\\binom{n}{k}' },
      { l:'Infinity', t:'\\infty' },
      { l:'Partial',  t:'\\frac{\\partial f}{\\partial x}' },
      { l:'Greek',    t:'\\alpha, \\beta, \\gamma, \\theta' },
      { l:'Norm',     t:'\\|x\\|' },
    ];
    return `
    <div class="math-block-wrapper">
      <div class="math-block-input-panel">
        <div class="math-panel-label">LaTeX Input</div>
        <textarea class="math-block-input" id="math-input-${block.id}"
          placeholder="\\frac{a}{b}"
          oninput="NotesPage._onMathInput('${block.id}')"
        >${block.tex||''}</textarea>
        <div class="math-templates-label">${lang==='vi'?'Mẫu nhanh:':'Quick templates:'}</div>
        <div class="math-templates">
          ${templates.map(t => `<button class="math-tmpl-btn" onclick="NotesPage._mathInsertTemplate('${block.id}','${t.t.replace(/\\/g,'\\\\').replace(/'/g,"\\'")}',event)">${t.l}</button>`).join('')}
        </div>
      </div>
      <div class="math-block-preview-panel">
        <div class="math-panel-label">${lang==='vi'?'Xem trước':'Preview'}</div>
        <div class="math-block-preview" id="math-preview-${block.id}">
          ${block.tex ? `$$${block.tex}$$` : `<span style="color:var(--text-muted);font-size:0.85rem">${lang==='vi'?'Nhập LaTeX bên trái':'Enter LaTeX on the left'}</span>`}
        </div>
      </div>
    </div>`;
  },

  _onMathInput(blockId) {
    const block = this._blocks.find(b => b.id === blockId);
    if (!block) return;
    const ta = document.getElementById(`math-input-${blockId}`);
    if (ta) block.tex = ta.value;
    const preview = document.getElementById(`math-preview-${blockId}`);
    if (preview) {
      preview.innerHTML = block.tex
        ? `$$${block.tex}$$`
        : `<span style="color:var(--text-muted);font-size:0.85rem">${I18N.lang==='vi'?'Nhập LaTeX bên trái':'Enter LaTeX on the left'}</span>`;
      App._renderMath();
    }
    this._triggerAutosave();
  },

  _mathInsertTemplate(blockId, tex, event) {
    event.preventDefault();
    const ta = document.getElementById(`math-input-${blockId}`);
    if (!ta) return;
    const s = ta.selectionStart, e2 = ta.selectionEnd;
    ta.value = ta.value.substring(0,s) + tex + ta.value.substring(e2);
    ta.selectionStart = ta.selectionEnd = s + tex.length;
    ta.focus();
    this._onMathInput(blockId);
  },

  // ═══════════════════════════════════════════════════════
  // TABLE / GRAPH BLOCK
  // ═══════════════════════════════════════════════════════
  _renderTableBlock(block) {
    const lang    = I18N.lang;
    const view    = block.view || 'table';
    if (!block.rows || block.rows.length === 0) {
      block.rows = [['Header 1','Header 2','Header 3'],['','',''],['','','']];
    }
    const numCols = (block.rows[0]||[]).length;
    const numRows = block.rows.length;
    const diagrams = Storage.getDiagrams ? Storage.getDiagrams() : [];

    return `
    <div class="table-block-wrapper">
      <!-- Tab strip -->
      <div class="table-block-tabs">
        <button class="table-tab-btn ${view==='table'?'active':''}" onclick="NotesPage._switchTableTab('${block.id}','table')">📊 ${lang==='vi'?'Bảng':'Table'}</button>
        <button class="table-tab-btn ${view==='graph'?'active':''}" onclick="NotesPage._switchTableTab('${block.id}','graph')">📐 ${lang==='vi'?'Sơ đồ':'Diagram'}</button>
      </div>

      ${view === 'table' ? `
      <!-- TABLE VIEW -->
      <div class="table-block-toolbar">
        <span style="font-size:0.7rem;color:var(--text-muted);font-weight:600">${numRows}×${numCols}</span>
        <button class="editor-btn" onclick="NotesPage._tableAddRow('${block.id}')">+ ${lang==='vi'?'Hàng':'Row'}</button>
        <button class="editor-btn" onclick="NotesPage._tableAddCol('${block.id}')">+ ${lang==='vi'?'Cột':'Col'}</button>
        <button class="editor-btn" onclick="NotesPage._tableRemoveRow('${block.id}')" ${numRows<=1?'disabled':''}>- ${lang==='vi'?'Hàng':'Row'}</button>
        <button class="editor-btn" onclick="NotesPage._tableRemoveCol('${block.id}')" ${numCols<=1?'disabled':''}>- ${lang==='vi'?'Cột':'Col'}</button>
        <span style="flex:1"></span>
        <button class="editor-btn" onclick="NotesPage._tableExportCSV('${block.id}')">⬇ CSV</button>
      </div>
      <div style="overflow-x:auto">
        <table class="table-block-table" id="table-block-${block.id}">
          ${block.rows.map((row, ri) => `
          <tr>
            ${row.map((cell, ci) => ri===0
              ? `<th contenteditable="true" oninput="NotesPage._cellInput('${block.id}',${ri},${ci},this)">${cell}</th>`
              : `<td contenteditable="true" oninput="NotesPage._cellInput('${block.id}',${ri},${ci},this)">${cell}</td>`
            ).join('')}
          </tr>`).join('')}
        </table>
      </div>` : `
      <!-- GRAPH / DIAGRAM VIEW -->
      <div class="graph-picker-panel">
        ${diagrams.length === 0 ? `
          <div class="empty-state" style="padding:2rem">
            <div class="empty-state-icon">📐</div>
            <p>${lang==='vi'?'Chưa có sơ đồ nào. Tạo sơ đồ ở trang Biểu đồ trước.':'No saved diagrams yet. Create one on the Diagrams page first.'}</p>
            <button class="btn btn-ghost btn-sm" style="margin-top:0.75rem" onclick="App.navigate('diagrams',false)">${lang==='vi'?'Mở trang Biểu đồ':'Go to Diagrams'}</button>
          </div>` : `
          <div class="graph-picker-list">
            ${diagrams.map(d => `
              <div class="graph-picker-item ${block.diagramId===d.id?'active':''}" onclick="NotesPage._selectDiagram('${block.id}','${d.id}')">
                <span class="graph-picker-icon">📐</span>
                <div style="flex:1;min-width:0">
                  <div style="font-weight:600;font-size:0.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${d.name}</div>
                  <div style="font-size:0.7rem;color:var(--text-muted)">${App.formatDate(d.updatedAt)}</div>
                </div>
                ${block.diagramId===d.id ? '<span style="color:var(--purple)">✓</span>' : ''}
              </div>`).join('')}
          </div>
          <div class="graph-render-area" id="graph-render-${block.id}">
            ${block.diagramSvg
              ? `<div class="graph-svg-wrap">${block.diagramSvg}</div>`
              : `<div style="color:var(--text-muted);font-size:0.85rem;text-align:center;padding:2rem">${lang==='vi'?'Chọn sơ đồ bên trái để hiển thị':'Select a diagram on the left to display it'}</div>`}
          </div>`}
      </div>`}
    </div>`;
  },

  _switchTableTab(blockId, view) {
    const b = this._blocks.find(b => b.id === blockId);
    if (!b) return;
    b.view = view;
    this._refreshBlockContent(blockId);
    // If switching to graph and a diagram was previously selected, re-render it
    if (view === 'graph' && b.diagramId) {
      setTimeout(() => this._renderGraphInBlock(b), 100);
    }
  },

  async _selectDiagram(blockId, diagramId) {
    const b = this._blocks.find(b => b.id === blockId);
    if (!b) return;
    b.diagramId = diagramId;
    b.diagramSvg = null;
    // Update active state in picker list immediately
    document.querySelectorAll(`.graph-picker-item`).forEach(el => el.classList.remove('active'));
    document.querySelectorAll(`.graph-picker-item`).forEach(el => {
      if (el.onclick?.toString().includes(diagramId)) el.classList.add('active');
    });
    const area = document.getElementById(`graph-render-${blockId}`);
    if (area) area.innerHTML = '<div style="text-align:center;padding:2rem"><span class="spinner"></span></div>';
    await this._renderGraphInBlock(b);
    this._triggerAutosave();
  },

  async _renderGraphInBlock(block) {
    const d = (Storage.getDiagrams ? Storage.getDiagrams() : []).find(d => d.id === block.diagramId);
    const area = document.getElementById(`graph-render-${block.id}`);
    if (!d || !area) return;
    const loadMermaid = () => new Promise(resolve => {
      if (window.mermaid?.render) return resolve();
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
      s.onload = resolve; document.head.appendChild(s);
    });
    try {
      await loadMermaid();
      window.mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
      const { svg } = await window.mermaid.render('graph-block-' + block.id + '-' + Date.now(), d.code);
      block.diagramSvg = svg;
      area.innerHTML = `<div class="graph-svg-wrap">${svg}</div>`;
    } catch(e) {
      area.innerHTML = `<p style="color:var(--coral);padding:1rem">❌ ${I18N.lang==='vi'?'Lỗi render sơ đồ':'Diagram render error'}: ${e.message||''}</p>`;
    }
  },

  _cellInput(blockId, ri, ci, el) {
    const b = this._blocks.find(b => b.id === blockId);
    if (b && b.rows[ri]) { b.rows[ri][ci] = el.textContent; this._triggerAutosave(); }
  },

  _tableAddRow(blockId) {
    const b = this._blocks.find(b => b.id === blockId);
    if (!b) return;
    b.rows.push(Array((b.rows[0]||[]).length).fill(''));
    this._refreshBlockContent(blockId);
  },

  _tableAddCol(blockId) {
    const b = this._blocks.find(b => b.id === blockId);
    if (!b) return;
    b.rows.forEach(r => r.push(''));
    this._refreshBlockContent(blockId);
  },

  _tableRemoveRow(blockId) {
    const b = this._blocks.find(b => b.id === blockId);
    if (!b || b.rows.length <= 1) return;
    b.rows.pop();
    this._refreshBlockContent(blockId);
  },

  _tableRemoveCol(blockId) {
    const b = this._blocks.find(b => b.id === blockId);
    if (!b || (b.rows[0]||[]).length <= 1) return;
    b.rows.forEach(r => r.pop());
    this._refreshBlockContent(blockId);
  },

  _tableExportCSV(blockId) {
    const b = this._blocks.find(b => b.id === blockId);
    if (!b) return;
    const csv = b.rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'table.csv';
    a.click();
  },

  _refreshBlockContent(blockId) {
    const b = this._blocks.find(b => b.id === blockId);
    if (!b) return;
    const col = document.querySelector(`.block-wrapper[data-block-id="${blockId}"] .block-content-col`);
    if (!col) return;
    switch(b.type) {
      case 'table': col.innerHTML = this._renderTableBlock(b); break;
      case 'image': col.innerHTML = this._renderImageBlock(b); break;
    }
    this._triggerAutosave();
  },

  // ═══════════════════════════════════════════════════════
  // BLOCK MANAGEMENT
  // ═══════════════════════════════════════════════════════
  insertBlock(afterIdx, type) {
    document.querySelectorAll('.block-insert-menu.open').forEach(m => m.classList.remove('open'));
    const block = { id: Storage.generateId(), type };
    if (type === 'code')  { block.lang = 'cpp'; block.text = ''; }
    if (type === 'text')  { block.html = ''; }
    if (type === 'math')  { block.tex = ''; }
    if (type === 'table') { block.rows = [['Header 1','Header 2'],['','']]; block.view = 'table'; block.diagramId = null; block.diagramSvg = null; }
    if (type === 'image') { block.idbKey = null; block.name = ''; block.mime = ''; }
    this._captureDOM();
    this._blocks.splice(afterIdx + 1, 0, block);
    this._triggerAutosave();
    this._rerenderBlocks();
  },

  deleteBlock(blockId) {
    this._captureDOM();
    this._blocks = this._blocks.filter(b => b.id !== blockId);
    this._triggerAutosave();
    this._rerenderBlocks();
  },

  moveBlock(blockId, dir) {
    const idx = this._blocks.findIndex(b => b.id === blockId);
    if (idx < 0) return;
    const ni = idx + dir;
    if (ni < 0 || ni >= this._blocks.length) return;
    this._captureDOM();
    [this._blocks[idx], this._blocks[ni]] = [this._blocks[ni], this._blocks[idx]];
    this._triggerAutosave();
    this._rerenderBlocks();
  },

  _rerenderBlocks() {
    const container = document.getElementById('note-blocks-container');
    if (!container) return;
    container.innerHTML = `
      ${this._renderInsertBar(-1)}
      ${this._blocks.map((b,i) => this._renderBlock(b,i)).join('')}
      ${this._blocks.length === 0 ? this._renderEmptyHint() : ''}
    `;
    App._renderMath();
    if (window.lucide) lucide.createIcons();
    this._bindPasteEvents();
    // Resize code blocks
    document.querySelectorAll('.code-block-textarea').forEach(ta => this._resizeCode(ta));
  },

  _captureDOM() {
    this._blocks.forEach(b => {
      if (b.type === 'text') {
        const el = document.getElementById(`text-block-${b.id}`);
        if (el) b.html = el.innerHTML;
      } else if (b.type === 'code') {
        const el = document.getElementById(`code-block-${b.id}`);
        if (el) b.text = el.value;
      } else if (b.type === 'math') {
        const el = document.getElementById(`math-input-${b.id}`);
        if (el) b.tex = el.value;
      }
      // table: captured inline via oninput
    });
  },

  _onBlockInput(blockId) {
    const b = this._blocks.find(b => b.id === blockId);
    if (!b) return;
    if (b.type === 'text') {
      const el = document.getElementById(`text-block-${blockId}`);
      if (el) b.html = el.innerHTML;
    } else if (b.type === 'code') {
      const el = document.getElementById(`code-block-${blockId}`);
      if (el) b.text = el.value;
    }
    this._triggerAutosave();
  },

  _bindPasteEvents() {
    document.querySelectorAll('.block-text-editor').forEach(el => {
      el.addEventListener('paste', e => this._onPaste(e, el.dataset.blockId));
    });
  },

  _onPaste(e, blockId) {
    const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = ev => {
          const el = document.getElementById(`text-block-${blockId}`);
          if (!el) return;
          el.focus();
          document.execCommand('insertHTML', false, `<img src="${ev.target.result}" style="max-width:100%;border-radius:8px;margin:0.5rem 0">`);
          this._onBlockInput(blockId);
        };
        reader.readAsDataURL(item.getAsFile());
        break;
      }
    }
  },

  // ═══════════════════════════════════════════════════════
  // OCR / DIAGRAM helpers
  // ═══════════════════════════════════════════════════════
  _openOCRForBlock(blockId) {
    const lang = I18N.lang;
    App.openModal(`
      <div class="ocr-dropzone" onclick="document.getElementById('ocr-inp-${blockId}').click()">
        <div class="ocr-dropzone-icon">📷</div>
        <h3>${lang==='vi'?'Tải ảnh ghi tay':'Upload handwritten notes'}</h3>
        <p>${lang==='vi'?'JPG, PNG — Backend cần chạy':'JPG, PNG — Backend must be running'}</p>
        <input type="file" id="ocr-inp-${blockId}" accept=".jpg,.jpeg,.png,.pdf" style="display:none"
          onchange="NotesPage._runOCR(this.files[0],'${blockId}')">
      </div>
      <div id="ocr-result-${blockId}" style="display:none;margin-top:1rem">
        <label class="form-label">${lang==='vi'?'Văn bản nhận dạng:':'Recognized text:'}</label>
        <textarea class="form-textarea" id="ocr-text-${blockId}" style="min-height:200px"></textarea>
        <button class="btn btn-primary w-full mt-2" onclick="NotesPage._insertOCRText('${blockId}')">
          <i data-lucide="file-text"></i> ${lang==='vi'?'Chèn vào khối':'Insert into block'}
        </button>
      </div>
      <div id="ocr-loading-${blockId}" style="display:none;text-align:center;padding:2rem">
        <span class="spinner"></span><p style="margin-top:0.5rem">${lang==='vi'?'Đang nhận dạng...':'Running OCR...'}</p>
      </div>
    `, `📷 ${I18N.t('notes_ocr')}`);
  },

  async _runOCR(file, blockId) {
    if (!file) return;
    document.getElementById(`ocr-loading-${blockId}`).style.display = 'block';
    document.querySelector('.ocr-dropzone').style.display = 'none';
    const settings = Storage.getSettings();
    const form = new FormData(); form.append('file', file);
    try {
      const res = await fetch(`${settings.backendUrl}/api/ocr/image`, { method:'POST', body:form });
      if (!res.ok) throw new Error();
      const data = await res.json();
      document.getElementById(`ocr-loading-${blockId}`).style.display = 'none';
      document.getElementById(`ocr-result-${blockId}`).style.display  = 'block';
      document.getElementById(`ocr-text-${blockId}`).value = data.text || '';
    } catch {
      document.getElementById(`ocr-loading-${blockId}`).style.display = 'none';
      document.querySelector('.ocr-dropzone').style.display = 'block';
      App.toast(I18N.t('ai_backend_off'), 'error', 5000);
    }
  },

  _insertOCRText(blockId) {
    const text = document.getElementById(`ocr-text-${blockId}`)?.value.trim();
    if (!text) return;
    const el = document.getElementById(`text-block-${blockId}`);
    if (el) {
      el.focus();
      document.execCommand('insertHTML', false, `<p>${text.replace(/\n/g,'</p><p>')}</p>`);
      this._onBlockInput(blockId);
    }
    App.closeModal(); App._renderMath();
  },

  _openDiagramForBlock(blockId) {
    const lang = I18N.lang;
    const saved = Storage.getDiagrams();
    App.openModal(`
      <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem">${lang==='vi'?'Chọn biểu đồ để chèn SVG vào khối văn bản.':'Choose a diagram to insert its SVG into the text block.'}</p>
      ${saved.length === 0
        ? `<div class="empty-state"><div class="empty-state-icon">📐</div><p>${lang==='vi'?'Chưa có biểu đồ.':'No diagrams yet.'}</p></div>`
        : `<div style="display:flex;flex-direction:column;gap:0.5rem;max-height:340px;overflow-y:auto">
            ${saved.map(d=>`<div class="card card-sm card-clickable flex items-center gap-3" onclick="NotesPage._insertDiagram('${d.id}','${blockId}')">
              <span style="font-size:1.5rem">📐</span>
              <div style="flex:1"><div style="font-weight:600;font-size:0.9rem">${d.name}</div>
              <div style="font-size:0.7rem;color:var(--text-muted)">${App.formatDate(d.updatedAt)}</div></div>
            </div>`).join('')}
           </div>`}
    `, `📐 ${lang==='vi'?'Chèn biểu đồ':'Insert Diagram'}`);
    if (window.lucide) lucide.createIcons();
  },

  async _insertDiagram(diagramId, blockId) {
    const d = Storage.getDiagrams().find(d => d.id === diagramId);
    if (!d?.code) return;
    const el = document.getElementById(`text-block-${blockId}`);
    App.closeModal();
    const loadMermaid = () => new Promise(resolve => {
      if (window.mermaid?.render) return resolve();
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
      s.onload = resolve; document.head.appendChild(s);
    });
    App.toast(I18N.lang==='vi'?'Đang chèn biểu đồ...':'Inserting...','info',2000);
    try {
      await loadMermaid();
      window.mermaid.initialize({ startOnLoad:false, theme:'neutral' });
      const { svg } = await window.mermaid.render('notes-mermaid-'+Date.now(), d.code);
      const fig = `<figure style="margin:1rem 0;padding:1rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:12px;text-align:center">${svg}<figcaption style="font-size:0.75rem;color:#94a3b8;margin-top:0.5rem">📐 ${d.name}</figcaption></figure>`;
      if (el) { el.focus(); document.execCommand('insertHTML', false, fig); this._onBlockInput(blockId); }
      App.toast(I18N.lang==='vi'?'Đã chèn!':'Inserted!','success');
    } catch {
      App.toast(I18N.lang==='vi'?'Lỗi Mermaid.':'Mermaid error.','error',4000);
    }
  },

  // ═══════════════════════════════════════════════════════
  // CRUD & LIFECYCLE
  // ═══════════════════════════════════════════════════════
  _loadBlocks(note) {
    if (!note) { this._blocks = []; return; }
    if (Array.isArray(note.blocks) && note.blocks.length > 0) {
      this._blocks = JSON.parse(JSON.stringify(note.blocks));
    } else if (note.content) {
      // Migrate old single-content note to one text block
      this._blocks = [{ id: Storage.generateId(), type: 'text', html: note.content }];
    } else {
      this._blocks = [];
    }
  },

  init() {
    if (!this._activeNoteId) {
      const notes = Storage.getNotes();
      if (notes.length > 0) {
        this._activeNoteId = notes[0].id;
        this._loadBlocks(Storage.getNoteById(this._activeNoteId));
        App.navigate('notes', false);
        return;
      }
    }
    this._bindPasteEvents();
    document.querySelectorAll('.code-block-textarea').forEach(ta => this._resizeCode(ta));
    App._renderMath();
    if (window.lucide) lucide.createIcons();

    // Close insert menus on outside click
    this._onDocClick = e => {
      if (!e.target.closest('.block-insert-bar')) {
        document.querySelectorAll('.block-insert-menu.open').forEach(m => m.classList.remove('open'));
      }
    };
    document.addEventListener('click', this._onDocClick);

    // Pending diagram from Diagrams page
    if (window._pendingDiagramInsert) {
      const pid = window._pendingDiagramInsert;
      window._pendingDiagramInsert = null;
      setTimeout(() => {
        if (this._activeNoteId) {
          const last = this._blocks[this._blocks.length - 1];
          if (last?.type === 'text') this._insertDiagram(pid, last.id);
        }
      }, 400);
    }
  },

  newNote() {
    if (this._unsaved) this.save(true);
    const note = { id: Storage.generateId(), title:'', content:'', subjectId:null, blocks:[] };
    Storage.upsertNote(note);
    this._activeNoteId = note.id;
    this._blocks = [];
    App.navigate('notes', false);
  },

  openNote(id) {
    if (this._unsaved) this.save(true);
    this._activeNoteId = id;
    this._loadBlocks(Storage.getNoteById(id));
    App.navigate('notes', false);
  },

  save(silent = false) {
    const note = Storage.getNoteById(this._activeNoteId);
    if (!note) return;
    this._captureDOM();
    note.title     = document.getElementById('note-title')?.value.trim() || '';
    note.subjectId = document.getElementById('note-subject')?.value || null;
    note.blocks    = JSON.parse(JSON.stringify(this._blocks));
    note.content   = '';   // clear legacy field
    Storage.upsertNote(note);
    this._unsaved = false;
    const st = document.getElementById('autosave-status');
    if (st) st.textContent = `✓ ${I18N.lang==='vi'?'Đã lưu':'Saved'}`;
    if (!silent) App.toast(I18N.t('common_success'), 'success');
  },

  _triggerAutosave() {
    this._unsaved = true;
    const st = document.getElementById('autosave-status');
    if (st) st.textContent = I18N.lang==='vi'?'Đang lưu...':'Saving...';
    clearTimeout(this._autosaveTimeout);
    this._autosaveTimeout = setTimeout(() => this.save(true), 1500);
  },

  deleteNote(id) {
    App.confirm(I18N.t('common_confirm_delete'), () => {
      Storage.deleteNote(id);
      if (this._activeNoteId === id) { this._activeNoteId = null; this._blocks = []; }
      App.navigate('notes', false);
      App.toast(I18N.lang==='vi'?'Đã xóa ghi chú':'Note deleted','success');
    });
  },

  search(query) {
    const results = query.trim() ? Storage.searchNotes(query) : Storage.getNotes();
    const list = document.getElementById('notes-list');
    if (list) {
      list.innerHTML = results.length === 0
        ? `<p style="padding:1rem;color:var(--text-muted);font-size:0.85rem">${I18N.lang==='vi'?'Không tìm thấy':'No results'}</p>`
        : results.map(n => this._renderNoteListItem(n)).join('');
    }
  },

  // ═══════════════════════════════════════════════════════
  // PDF PRINT (all blocks) — async to embed images as data URLs
  // ═══════════════════════════════════════════════════════
  async printNote() {
    this._captureDOM();
    const title = document.getElementById('note-title')?.value || (I18N.lang==='vi'?'Ghi chú':'Note');
    let body = '';
    for (const b of this._blocks) {
      if (b.type === 'text') {
        body += `<div style="margin-bottom:1.25rem">${b.html||''}</div>`;

      } else if (b.type === 'code') {
        body += `<pre style="background:#f5f5f5;padding:1rem;border-radius:6px;font-family:'Courier New',monospace;font-size:0.82rem;white-space:pre-wrap;border-left:4px solid #7c3aed;margin-bottom:1.25rem"><strong style="color:#7c3aed">[${b.lang||'code'}]</strong>\n${(b.text||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>`;

      } else if (b.type === 'image') {
        if (b.idbKey) {
          try {
            const url = await IDB.getObjectURL(b.idbKey);
            if (b.mime === 'application/pdf') {
              body += `<p style="color:#888;font-style:italic;margin-bottom:1rem">[📄 PDF: ${b.name||'document'} — not embeddable in print]</p>`;
            } else {
              body += `<div style="margin-bottom:1.25rem"><img src="${url}" style="max-width:100%;border-radius:6px" alt="${b.name||''}"><div style="font-size:0.7rem;color:#888;margin-top:4px">📎 ${b.name||'image'}</div></div>`;
            }
          } catch { body += `<p style="color:#888;margin-bottom:1rem">[📎 ${b.name||'image'} — could not load]</p>`; }
        } else {
          body += `<p style="color:#888;margin-bottom:1rem">[📎 ${b.name||'image'} — not saved]</p>`;
        }

      } else if (b.type === 'math') {
        body += `<div style="padding:0.75rem 0;font-size:1.1rem;margin-bottom:1rem">$$${b.tex||''}$$</div>`;

      } else if (b.type === 'table') {
        if ((b.view || 'table') === 'graph' && b.diagramSvg) {
          // Embed the already-rendered Mermaid SVG directly
          const diag = (Storage.getDiagrams ? Storage.getDiagrams() : []).find(d => d.id === b.diagramId);
          body += `<div style="margin-bottom:1.25rem;padding:1rem;border:1px solid #e5e7eb;border-radius:8px;text-align:center">
            ${b.diagramSvg}
            ${diag ? `<div style="font-size:0.75rem;color:#888;margin-top:4px">📐 ${diag.name}</div>` : ''}
          </div>`;
        } else {
          const hdr  = (b.rows[0]||[]).map(c=>`<th style="border:1px solid #ccc;padding:6px 10px;background:#f0f0f0;font-weight:700">${c}</th>`).join('');
          const rows = b.rows.slice(1).map(r=>`<tr>${r.map(c=>`<td style="border:1px solid #ccc;padding:6px 10px">${c}</td>`).join('')}</tr>`).join('');
          body += `<table style="border-collapse:collapse;width:100%;margin-bottom:1.25rem"><thead><tr>${hdr}</tr></thead><tbody>${rows}</tbody></table>`;
        }
      }
    }
    const win = window.open('','_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"><\/script>
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"><\/script>
      <style>
        body{font-family:Georgia,serif;max-width:800px;margin:2rem auto;line-height:1.8;color:#1a1a1a}
        h1{margin-bottom:1.5rem;border-bottom:2px solid #7c3aed;padding-bottom:0.5rem}
        img{max-width:100%} svg{max-width:100%;height:auto}
        @media print{body{margin:1cm}}
      </style>
      </head><body><h1>${title}</h1>${body}
      <script>document.addEventListener('DOMContentLoaded',()=>{if(window.renderMathInElement)renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]})})<\/script>
      </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 1000);
  },

  destroy() {
    clearTimeout(this._autosaveTimeout);
    if (this._unsaved) this.save(true);
    if (this._onDocClick) document.removeEventListener('click', this._onDocClick);
  },
};
