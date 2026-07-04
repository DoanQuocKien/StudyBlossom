// ============================================================
// StudyBloom 🌸 — Prompt Optimizer Page
// ============================================================

const PromptPage = {
  _selectedTemplate: null,
  _options: { examples: true, steps: true, vietnamese: true, concise: false, eli5: false },
  _selectedSubjectId: '',
  _customQuestion: '',

  TEMPLATES: {
    math_solve: {
      icon: '🔢',
      labelVi: 'Giải toán',
      labelEn: 'Solve Math',
      descVi: 'Giải bài toán từng bước',
      descEn: 'Solve a math problem step by step',
      subjects: ['dm', 'ps'],
      template: (q, opts, lang) => {
        const lines = [`Hãy giải bài toán sau${opts.steps ? ' theo từng bước chi tiết' : ''}:\n\n${q}`];
        if (opts.examples) lines.push('Nếu có thể, hãy cho một ví dụ tương tự.');
        if (opts.concise)  lines.push('Trả lời ngắn gọn và súc tích.');
        if (opts.vietnamese) lines.push('Trả lời bằng tiếng Việt.');
        return lines.join('\n');
      },
      templateEn: (q, opts) => {
        const lines = [`Please solve the following problem${opts.steps ? ' step by step, showing all working' : ''}:\n\n${q}`];
        if (opts.examples) lines.push('If possible, provide a similar example.');
        if (opts.concise)  lines.push('Keep the answer concise.');
        return lines.join('\n');
      },
    },

    concept_explain: {
      icon: '💡',
      labelVi: 'Giải thích khái niệm',
      labelEn: 'Explain Concept',
      descVi: 'Hiểu sâu một khái niệm',
      descEn: 'Deeply understand a concept',
      subjects: ['oop', 'dsa', 'dc', 'dm', 'ps'],
      template: (q, opts, lang) => {
        const lines = [`Hãy giải thích khái niệm: **${q}**`];
        if (opts.eli5) lines.push('Giải thích như thể tôi là sinh viên năm 2, chưa biết nhiều về chủ đề này.');
        if (opts.steps) lines.push('Trình bày theo thứ tự: định nghĩa → cách hoạt động → ứng dụng thực tế.');
        if (opts.examples) lines.push('Cho ví dụ minh họa cụ thể (code hoặc hình ảnh minh họa nếu cần).');
        if (opts.concise)  lines.push('Giữ giải thích ngắn gọn, tránh lan man.');
        if (opts.vietnamese) lines.push('Trả lời bằng tiếng Việt.');
        return lines.join('\n');
      },
      templateEn: (q, opts) => {
        const lines = [`Please explain the concept: **${q}**`];
        if (opts.eli5) lines.push('Explain as if I am a 2nd-year student with limited background.');
        if (opts.steps) lines.push('Structure: definition → how it works → real-world application.');
        if (opts.examples) lines.push('Provide concrete examples (code or diagrams if helpful).');
        if (opts.concise) lines.push('Keep the explanation concise.');
        return lines.join('\n');
      },
    },

    code_debug: {
      icon: '🐛',
      labelVi: 'Debug code',
      labelEn: 'Debug Code',
      descVi: 'Tìm và sửa lỗi code',
      descEn: 'Find and fix code bugs',
      subjects: ['oop', 'dsa'],
      template: (q, opts) => {
        return `Tôi gặp lỗi với đoạn code sau (${q}).\n\nCode của tôi:\n\`\`\`\n[Dán code vào đây]\n\`\`\`\n\nLỗi nhận được:\n[Dán thông báo lỗi]\n\nKết quả mong đợi:\n[Mô tả kết quả đúng]\n\nHãy:\n1. Giải thích nguyên nhân lỗi\n2. Đưa ra code đã sửa\n3. Giải thích tại sao cách sửa đó đúng${opts.vietnamese ? '\n\nTrả lời bằng tiếng Việt.' : ''}`;
      },
      templateEn: (q, opts) => {
        return `I have a bug in my code (${q}).\n\nMy code:\n\`\`\`\n[Paste code here]\n\`\`\`\n\nError message:\n[Paste error]\n\nExpected behavior:\n[Describe expected output]\n\nPlease:\n1. Explain the root cause\n2. Provide the fixed code\n3. Explain why the fix works`;
      },
    },

    exam_prep: {
      icon: '📝',
      labelVi: 'Ôn thi',
      labelEn: 'Exam Prep',
      descVi: 'Chuẩn bị cho kỳ thi',
      descEn: 'Prepare for an exam',
      subjects: ['oop', 'dsa', 'dc', 'dm', 'ps'],
      template: (q, opts) => {
        return `Tôi sắp thi môn ${q}. Hãy:\n1. Hỏi tôi 5 câu hỏi thực hành dạng trắc nghiệm hoặc tự luận phổ biến trong đề thi\n2. Sau khi tôi trả lời, giải thích đáp án đúng chi tiết\n3. Chỉ ra những điểm yếu phổ biến của sinh viên trong chủ đề này${opts.steps ? '\n4. Đưa ra tóm tắt công thức/khái niệm quan trọng nhất' : ''}${opts.vietnamese ? '\n\nTrả lời bằng tiếng Việt.' : ''}`;
      },
      templateEn: (q, opts) => {
        return `I have an exam on ${q}. Please:\n1. Quiz me with 5 practice questions (MCQ or short answer) typical for this subject\n2. After I answer, explain each correct answer in detail\n3. Point out common student mistakes in this topic${opts.steps ? '\n4. Provide a summary of the most important formulas/concepts' : ''}`;
      },
    },

    compare: {
      icon: '⚖️',
      labelVi: 'So sánh',
      labelEn: 'Compare',
      descVi: 'So sánh hai khái niệm / phương pháp',
      descEn: 'Compare two concepts or methods',
      subjects: ['oop', 'dsa', 'dc'],
      template: (q, opts) => {
        return `So sánh chi tiết: **${q}**\n\nHãy phân tích:\n- Điểm giống nhau\n- Điểm khác nhau (ưu/nhược điểm)\n- Khi nào nên dùng cái nào?\n${opts.examples ? '- Ví dụ minh họa cụ thể cho mỗi loại' : ''}${opts.vietnamese ? '\n\nTrả lời bằng tiếng Việt.' : ''}`;
      },
      templateEn: (q, opts) => {
        return `Compare in detail: **${q}**\n\nAnalyze:\n- Similarities\n- Differences (pros and cons)\n- When to use which?\n${opts.examples ? '- Specific examples for each' : ''}`;
      },
    },

    summarize: {
      icon: '📖',
      labelVi: 'Tóm tắt chương',
      labelEn: 'Summarize Chapter',
      descVi: 'Tóm tắt nhanh một chủ đề / chương',
      descEn: 'Summarize a topic or chapter',
      subjects: ['oop', 'dsa', 'dc', 'dm', 'ps'],
      template: (q, opts) => {
        return `Hãy tóm tắt **${q}** dưới dạng:\n- Các khái niệm cốt lõi (bullet points)\n- Công thức/thuật toán quan trọng (nếu có)\n- Ứng dụng thực tế${opts.examples ? '\n- Ví dụ minh họa đơn giản' : ''}${opts.eli5 ? '\n\nGiải thích đơn giản, dễ hiểu cho sinh viên năm 2.' : ''}${opts.vietnamese ? '\n\nTrả lời bằng tiếng Việt.' : ''}`;
      },
      templateEn: (q, opts) => {
        return `Please summarize **${q}** in:\n- Core concepts (bullet points)\n- Important formulas/algorithms (if any)\n- Real-world applications${opts.examples ? '\n- Simple examples' : ''}`;
      },
    },

    circuit_analyze: {
      icon: '⚡',
      labelVi: 'Phân tích mạch điện',
      labelEn: 'Circuit Analysis',
      descVi: 'Phân tích mạch số / logic',
      descEn: 'Analyze digital circuit or logic',
      subjects: ['dc'],
      template: (q, opts) => {
        return `Hãy phân tích mạch/vấn đề kỹ thuật số sau:\n\n${q}\n\n${opts.steps ? 'Trình bày từng bước:\n1. Nhận dạng cổng logic / flip-flop\n2. Vẽ bảng chân trị (nếu có)\n3. Viết biểu thức Boolean\n4. Đơn giản hóa (Karnaugh map nếu cần)' : ''}${opts.vietnamese ? '\n\nTrả lời bằng tiếng Việt.' : ''}`;
      },
      templateEn: (q, opts) => {
        return `Analyze the following digital circuit/problem:\n\n${q}\n\n${opts.steps ? 'Please:\n1. Identify logic gates/flip-flops\n2. Draw truth table (if applicable)\n3. Write Boolean expression\n4. Simplify (Karnaugh map if needed)' : ''}`;
      },
    },
  },

  render() {
    const subjects = Storage.getSubjects();
    const history  = Storage.getPromptHistory();
    const saved    = Storage.getSavedPrompts();
    const lang     = I18N.lang;

    return `
    <div class="animate-fadeIn">
      <div class="page-header">
        <div>
          <h1 class="page-title">✨ ${I18N.t('po_title')}</h1>
          <p class="page-subtitle">${lang==='vi'?'Tạo prompt hoàn hảo để AI hiểu đúng ý bạn':'Craft perfect prompts so AI understands you correctly'}</p>
        </div>
      </div>

      <div class="po-layout">
        <!-- Left: Builder -->
        <div>
          <!-- Subject selector -->
          <div class="card mb-4">
            <div class="form-group">
              <label class="form-label">📚 ${I18N.t('po_subject')}</label>
              <select class="form-select" id="po-subject" onchange="PromptPage.onSubjectChange(this.value)">
                <option value="">${I18N.t('common_all')}</option>
                ${subjects.map(s => `<option value="${s.id}" ${this._selectedSubjectId===s.id?'selected':''}>${s.emoji} ${lang==='vi'?(s.nameVi||s.name):s.name}</option>`).join('')}
              </select>
            </div>

            <!-- Template picker -->
            <div class="form-group">
              <label class="form-label">📋 ${I18N.t('po_template')}</label>
              <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
                ${Object.entries(this.TEMPLATES).map(([key, tmpl]) => `
                  <button class="template-btn ${this._selectedTemplate===key?'active':''}"
                    onclick="PromptPage.selectTemplate('${key}')">
                    ${tmpl.icon} ${lang==='vi'?tmpl.labelVi:tmpl.labelEn}
                  </button>`).join('')}
              </div>
              ${this._selectedTemplate ? `<p class="text-xs text-muted mt-2">
                ${lang==='vi' ? this.TEMPLATES[this._selectedTemplate]?.descVi : this.TEMPLATES[this._selectedTemplate]?.descEn}
              </p>` : ''}
            </div>

            <!-- Custom question -->
            <div class="form-group">
              <label class="form-label">❓ ${I18N.t('po_your_question')}</label>
              <textarea class="form-textarea" id="po-question" style="min-height:100px"
                placeholder="${lang==='vi'?'Nhập câu hỏi, chủ đề, hoặc đoạn code của bạn...':'Enter your question, topic, or code snippet...'}"
                oninput="PromptPage._customQuestion=this.value;PromptPage.updatePreview()">${this._customQuestion}</textarea>
            </div>

            <!-- Toggle options -->
            <div class="form-group">
              <label class="form-label">⚙️ ${I18N.t('po_options')}</label>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.25rem">
                ${Object.entries({
                  steps:      [I18N.t('po_opt_steps'),   this._options.steps],
                  examples:   [I18N.t('po_opt_examples'),this._options.examples],
                  vietnamese: [I18N.t('po_opt_vietnamese'),this._options.vietnamese],
                  concise:    [I18N.t('po_opt_concise'), this._options.concise],
                  eli5:       [I18N.t('po_opt_eli5'),    this._options.eli5],
                }).map(([key, [label, val]]) => `
                  <label class="toggle-option">
                    <span class="toggle-switch">
                      <input type="checkbox" ${val?'checked':''} onchange="PromptPage.toggleOption('${key}',this.checked)">
                      <span class="toggle-slider"></span>
                    </span>
                    <span class="toggle-label">${label}</span>
                  </label>`).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Preview + Actions -->
        <div>
          <div class="card mb-4">
            <div class="flex items-center justify-between mb-3">
              <label class="form-label" style="margin:0">👁️ ${I18N.t('po_preview')}</label>
              <div style="display:flex;gap:0.5rem">
                <button class="btn btn-primary btn-sm" id="po-copy-btn" onclick="PromptPage.copyPrompt()">
                  <i data-lucide="copy"></i> ${I18N.t('po_copy')}
                </button>
                <button class="btn btn-ghost btn-sm" onclick="PromptPage.savePrompt()">
                  <i data-lucide="bookmark"></i> ${I18N.t('po_save')}
                </button>
              </div>
            </div>
            <div class="po-preview" id="po-preview">
              ${this._generatePreview() || `<span class="po-preview-placeholder">${lang==='vi'?'Chọn mẫu câu và nhập câu hỏi để xem prompt...':'Select a template and enter your question to see the prompt...'}</span>`}
            </div>
          </div>

          <!-- Open in... buttons -->
          <div class="card mb-4">
            <label class="form-label">🚀 ${lang==='vi'?'Mở trong...':'Open in...'}</label>
            <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
              <button class="btn btn-ghost btn-sm" onclick="PromptPage.openIn('chatgpt')">
                🤖 ChatGPT
              </button>
              <button class="btn btn-ghost btn-sm" onclick="PromptPage.openIn('claude')">
                🧡 Claude
              </button>
              <button class="btn btn-ghost btn-sm" onclick="PromptPage.openIn('gemini')">
                💎 Gemini
              </button>
            </div>
          </div>

          <!-- Saved prompts -->
          <div class="card">
            <div class="flex items-center justify-between mb-3">
              <label class="form-label" style="margin:0">🔖 ${I18N.t('po_saved')} (${saved.length})</label>
            </div>
            ${saved.length === 0
              ? `<p class="text-sm text-muted">${I18N.t('po_no_history')}</p>`
              : `<div style="display:flex;flex-direction:column;gap:0.5rem;max-height:200px;overflow-y:auto">
                  ${saved.slice(0,10).map(p => `
                    <div style="background:var(--bg-overlay);border-radius:var(--r-sm);padding:0.625rem;border:1px solid var(--border)">
                      <div style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);margin-bottom:0.25rem">
                        ${p.templateLabel || 'Custom'} · ${App.formatDate(p.savedAt)}
                      </div>
                      <div class="truncate" style="font-size:0.75rem;color:var(--text-muted)">${p.preview || p.prompt}</div>
                      <div style="display:flex;gap:0.5rem;margin-top:0.5rem">
                        <button class="btn btn-ghost btn-sm" style="flex:1;font-size:10px" onclick="PromptPage.loadSaved('${p.id}')">
                          📋 ${lang==='vi'?'Dùng lại':'Reuse'}
                        </button>
                        <button class="btn btn-danger btn-sm" style="font-size:10px" onclick="PromptPage.deleteSaved('${p.id}')">
                          🗑
                        </button>
                      </div>
                    </div>`).join('')}
                </div>`}
          </div>
        </div>
      </div>

      <!-- History -->
      ${history.length > 0 ? `
      <div class="card mt-4">
        <div class="flex items-center justify-between mb-3">
          <h3 style="font-weight:600">📋 ${I18N.t('po_history')} (${history.length})</h3>
          <button class="btn btn-ghost btn-sm" onclick="PromptPage.clearHistory()">
            ${lang==='vi'?'Xóa tất cả':'Clear all'}
          </button>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.5rem;max-height:300px;overflow-y:auto">
          ${history.slice(0,15).map(p => `
            <div style="padding:0.75rem;background:var(--bg-overlay);border-radius:var(--r-md);border:1px solid var(--border)">
              <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:0.25rem">${App.formatDate(p.date)}</div>
              <div style="font-size:0.8rem;color:var(--text-secondary);white-space:pre-wrap;max-height:80px;overflow:hidden">${p.prompt}</div>
              <button class="btn btn-ghost btn-sm mt-2" style="font-size:10px" onclick="PromptPage.reuseHistory('${p.id}')">
                📋 ${lang==='vi'?'Dùng lại':'Reuse'}
              </button>
            </div>`).join('')}
        </div>
      </div>` : ''}
    </div>`;
  },

  init() {},

  onSubjectChange(subjectId) {
    this._selectedSubjectId = subjectId;
    this.updatePreview();
  },

  selectTemplate(key) {
    this._selectedTemplate = key;
    this.updatePreview();
    App.navigate('prompt', false);
  },

  toggleOption(key, value) {
    this._options[key] = value;
    this.updatePreview();
  },

  _generatePreview() {
    const q    = this._customQuestion.trim() || (I18N.lang==='vi'?'[câu hỏi của bạn]':'[your question]');
    const tmpl = this.TEMPLATES[this._selectedTemplate];
    if (!tmpl) return '';

    const lang = I18N.lang;
    try {
      if (lang === 'vi') return tmpl.template(q, this._options, lang);
      return tmpl.templateEn ? tmpl.templateEn(q, this._options) : tmpl.template(q, this._options, lang);
    } catch(e) { return ''; }
  },

  updatePreview() {
    const preview = document.getElementById('po-preview');
    if (!preview) return;
    const text = this._generatePreview();
    preview.textContent = text || (I18N.lang==='vi'?'Chọn mẫu câu và nhập câu hỏi...':'Select a template and enter your question...');
  },

  copyPrompt() {
    const text = this._generatePreview();
    if (!text) { App.toast(I18N.lang==='vi'?'Chưa có prompt để sao chép!':'No prompt to copy!','error'); return; }

    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('po-copy-btn');
      if (btn) { btn.textContent = I18N.t('po_copied'); setTimeout(() => { btn.innerHTML = `<i data-lucide="copy"></i> ${I18N.t('po_copy')}`; if(window.lucide) lucide.createIcons(); }, 2000); }
      App.toast(I18N.t('po_copied'), 'success');

      // Log to history
      const tmpl = this.TEMPLATES[this._selectedTemplate];
      Storage.addPromptToHistory({
        prompt: text,
        templateKey: this._selectedTemplate,
        question: this._customQuestion,
      });
    });
  },

  savePrompt() {
    const text = this._generatePreview();
    if (!text) { App.toast(I18N.lang==='vi'?'Chưa có prompt để lưu!':'No prompt to save!','error'); return; }
    const tmpl = this.TEMPLATES[this._selectedTemplate];
    Storage.savePrompt({
      prompt: text,
      preview: text.substring(0, 100),
      templateKey: this._selectedTemplate,
      templateLabel: tmpl ? (I18N.lang==='vi'?tmpl.labelVi:tmpl.labelEn) : 'Custom',
      question: this._customQuestion,
    });
    App.toast(I18N.t('po_save') + '!', 'success');
    App.navigate('prompt', false);
  },

  openIn(service) {
    this.copyPrompt();
    const urls = {
      chatgpt: 'https://chat.openai.com/',
      claude:  'https://claude.ai/',
      gemini:  'https://gemini.google.com/app',
    };
    setTimeout(() => window.open(urls[service], '_blank'), 500);
  },

  loadSaved(id) {
    const p = Storage.getSavedPrompts().find(p => p.id === id);
    if (!p) return;
    if (p.templateKey) this._selectedTemplate = p.templateKey;
    this._customQuestion = p.question || '';
    App.navigate('prompt', false);
    setTimeout(() => { const el = document.getElementById('po-question'); if(el) el.value = this._customQuestion; this.updatePreview(); }, 100);
  },

  reuseHistory(id) {
    const p = Storage.getPromptHistory().find(p => p.id === id);
    if (!p) return;
    if (p.templateKey) this._selectedTemplate = p.templateKey;
    this._customQuestion = p.question || '';
    App.navigate('prompt', false);
  },

  deleteSaved(id) {
    Storage.deleteSavedPrompt(id);
    App.navigate('prompt', false);
  },

  clearHistory() {
    Storage._set('prompt_history', []);
    App.navigate('prompt', false);
  },
};
