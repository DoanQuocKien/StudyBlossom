// ============================================================
// StudyBlossom 🌸 — Quiz / Testing Center
// Modes: list | run | result | edit | ai-gen | raw-view | raw-result
// ============================================================

const QuizPage = {
  _mode: 'list',
  _activeQuiz: null,
  _answers: [],
  _currentQ: 0,
  _timerInterval: null,
  _timeLeft: 0,
  _startTime: null,

  // ── Raw test session state ──
  _rawTest: null,         // { id, name, subjectId, fileType, paperText, questions, answers, annotations }
  _rawViewMode: 'type',  // 'type' | 'upload' (answer input mode)
  _paperObjectURL: null,
  _answerObjectURL: null,

  // ── AI gen wizard state ──
  _aiGenSource: 'notes',  // 'notes' | 'upload'
  _aiGenStep: 1,          // 1 = source, 2 = config, 3 = review

  render() {
    if (this._mode === 'run'        && this._activeQuiz) return this._renderRun();
    if (this._mode === 'result'     && this._activeQuiz) return this._renderResult();
    if (this._mode === 'edit'       && this._activeQuiz) return this._renderEdit();
    if (this._mode === 'ai-gen')                         return this._renderAiGen();
    if (this._mode === 'raw-view'   && this._rawTest)    return this._renderRawView();
    if (this._mode === 'raw-result' && this._rawTest)    return this._renderRawResult();
    return this._renderList();
  },

  // ══════════════════════════════════════════════════════════
  // LIST VIEW
  // ══════════════════════════════════════════════════════════
  _renderList() {
    const quizzes  = Storage.getQuizzes();
    const rawTests = Storage.getRawTests();
    const history  = Storage.getQuizHistory();
    const lang     = I18N.lang;

    return `
    <div class="animate-fadeIn">
      <div class="page-header">
        <div>
          <h1 class="page-title">✏️ ${I18N.t('quiz_title')}</h1>
          <p class="page-subtitle">${lang==='vi'?'Trung tâm kiểm tra — Tạo từ AI hoặc Import đề thi':'Testing Center — AI-generated or import real papers'}</p>
        </div>
      </div>

      <!-- Two main creation modes -->
      <div class="grid-2 mb-6" style="gap:1rem">
        <!-- AI Generate -->
        <div class="card card-clickable" style="border:2px solid rgba(167,139,250,0.3);background:linear-gradient(135deg,rgba(167,139,250,0.08),rgba(139,92,246,0.04))"
             onclick="QuizPage.startAiGen()">
          <div style="font-size:2.5rem;margin-bottom:0.75rem">🤖</div>
          <h3 style="font-weight:700;margin-bottom:0.5rem">${lang==='vi'?'Tạo đề từ AI':'Generate with AI'}</h3>
          <p style="font-size:0.85rem;color:var(--text-muted)">${lang==='vi'
            ?'Từ ghi chú đã lưu hoặc tài liệu mới — AI tạo câu hỏi MCQ và tự luận'
            :'From saved notes or new material — AI generates MCQ & essay questions'}</p>
          <div style="margin-top:1rem">
            <span class="badge badge-purple">${lang==='vi'?'Cần Backend + Ollama':'Requires Backend + Ollama'}</span>
          </div>
        </div>

        <!-- Import Raw Paper -->
        <div class="card card-clickable" style="border:2px solid rgba(251,191,36,0.3);background:linear-gradient(135deg,rgba(251,191,36,0.08),rgba(245,158,11,0.04))"
             onclick="QuizPage.startRawImport()">
          <div style="font-size:2.5rem;margin-bottom:0.75rem">📄</div>
          <h3 style="font-weight:700;margin-bottom:0.5rem">${lang==='vi'?'Import đề thi thật':'Import Real Test Paper'}</h3>
          <p style="font-size:0.85rem;color:var(--text-muted)">${lang==='vi'
            ?'Upload ảnh/PDF đề thi — làm bài trực tiếp, chấm AI hoặc xuất file gửi thầy cô'
            :'Upload image/PDF of a real exam — answer on-screen, AI-grade or export for manual grading'}</p>
          <div style="margin-top:1rem">
            <span class="badge badge-amber">${lang==='vi'?'Hoạt động offline':'Works offline'}</span>
          </div>
        </div>
      </div>

      <!-- Saved Quizzes (AI-generated) -->
      ${quizzes.length > 0 ? `
      <h3 style="font-weight:600;margin-bottom:1rem">📚 ${lang==='vi'?'Bài kiểm tra đã lưu':'Saved Quizzes'}</h3>
      <div class="grid-auto mb-6">
        ${quizzes.map(q => this._renderQuizCard(q, history)).join('')}
      </div>` : ''}

      <!-- Raw Test Sessions -->
      ${rawTests.length > 0 ? `
      <h3 style="font-weight:600;margin-bottom:1rem">📋 ${lang==='vi'?'Đề thi đã import':'Imported Test Papers'}</h3>
      <div class="grid-auto mb-6">
        ${rawTests.map(t => this._renderRawTestCard(t)).join('')}
      </div>` : ''}

      <!-- Empty state -->
      ${quizzes.length === 0 && rawTests.length === 0 ? `
      <div class="empty-state">
        <div class="empty-state-icon">✏️</div>
        <h3>${lang==='vi'?'Chưa có bài kiểm tra nào':'No tests yet'}</h3>
        <p>${lang==='vi'?'Chọn một trong hai cách trên để bắt đầu!':'Choose one of the options above to get started!'}</p>
      </div>` : ''}

      <!-- History chart -->
      ${history.length > 0 ? `
      <div class="card mt-4">
        <h3 style="font-weight:600;margin-bottom:1rem">📈 ${I18N.t('quiz_history')}</h3>
        <div style="height:180px"><canvas id="quiz-history-chart"></canvas></div>
      </div>` : ''}
    </div>`;
  },

  _renderQuizCard(quiz, history) {
    const subject    = Storage.getSubjectById(quiz.subjectId);
    const color      = subject ? subject.color : '#a78bfa';
    const qHistory   = history.filter(h => h.quizId === quiz.id);
    const lastResult = qHistory[0];
    const lang       = I18N.lang;

    return `
    <div class="card animate-slideUp" style="border-top:3px solid ${color}">
      <div class="flex items-center justify-between mb-2">
        <div style="font-weight:700;font-size:1rem">${quiz.name}</div>
        ${quiz.timed ? `<span class="badge badge-amber">⏱️ ${lang==='vi'?'Có giờ':'Timed'}</span>` : ''}
      </div>
      ${subject ? `<div style="font-size:0.75rem;color:${color};margin-bottom:0.75rem">${subject.emoji} ${lang==='vi'?(subject.nameVi||subject.name):subject.name}</div>` : ''}
      <div style="font-size:0.875rem;color:var(--text-muted);margin-bottom:1rem">
        ${(quiz.questions||[]).length} ${I18N.t('quiz_questions')}
        ${lastResult ? ` · ${lang==='vi'?'Lần cuối':'Last'}: ${Math.round(lastResult.score)}%` : ''}
      </div>
      ${lastResult ? `<div class="progress-bar-wrap mb-3">
        <div class="progress-bar-fill" style="width:${lastResult.score}%;background:${lastResult.score>=70?'linear-gradient(90deg,var(--mint),#34d399)':'linear-gradient(90deg,var(--coral),#f43f5e)'}"></div>
      </div>` : ''}
      <div style="display:flex;gap:0.5rem">
        <button class="btn btn-primary flex-1" onclick="QuizPage.startQuiz('${quiz.id}')" ${(quiz.questions||[]).length===0?'disabled':''}>
          <i data-lucide="play"></i> ${I18N.t('quiz_start')}
        </button>
        <button class="btn btn-ghost btn-sm" onclick="QuizPage.openEditQuiz('${quiz.id}')"><i data-lucide="pencil"></i></button>
        <button class="btn btn-danger btn-sm" onclick="QuizPage.deleteQuiz('${quiz.id}')"><i data-lucide="trash-2"></i></button>
      </div>
    </div>`;
  },

  _renderRawTestCard(test) {
    const lang    = I18N.lang;
    const subject = Storage.getSubjectById(test.subjectId);
    const color   = subject ? subject.color : '#fbbf24';
    const answered = (test.answers || []).filter(a => a && a.trim()).length;
    const total    = test.questionCount || 0;

    return `
    <div class="card animate-slideUp" style="border-top:3px solid ${color}">
      <div class="flex items-center justify-between mb-2">
        <div style="font-weight:700;font-size:1rem">📋 ${test.name}</div>
        <span class="badge badge-amber">${lang==='vi'?'Đề thi':'Paper'}</span>
      </div>
      ${subject ? `<div style="font-size:0.75rem;color:${color};margin-bottom:0.5rem">${subject.emoji} ${lang==='vi'?(subject.nameVi||subject.name):subject.name}</div>` : ''}
      <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem">
        ${total > 0 ? `${answered}/${total} ${lang==='vi'?'câu đã trả lời':'answered'}` : lang==='vi'?'Chưa có câu hỏi':'No questions set'}
        · ${App.formatDate(test.createdAt)}
        ${test.status === 'graded' ? ` · <span style="color:var(--mint)">✓ ${lang==='vi'?'Đã chấm':'Graded'}</span>` : ''}
      </div>
      <div style="display:flex;gap:0.5rem">
        <button class="btn btn-primary flex-1" onclick="QuizPage.openRawTest('${test.id}')">
          <i data-lucide="file-text"></i> ${lang==='vi'?'Tiếp tục':'Continue'}
        </button>
        <button class="btn btn-danger btn-sm" onclick="QuizPage.deleteRawTest('${test.id}')"><i data-lucide="trash-2"></i></button>
      </div>
    </div>`;
  },

  // ══════════════════════════════════════════════════════════
  // AI GENERATION WIZARD
  // ══════════════════════════════════════════════════════════
  startAiGen() {
    this._aiGenStep = 1;
    this._aiGenSource = 'notes';
    this._mode = 'ai-gen';
    App.navigate('quiz', false);
  },

  _renderAiGen() {
    const lang     = I18N.lang;
    const subjects = Storage.getSubjects();
    const notes    = Storage.getNotes();

    return `
    <div class="animate-fadeIn" style="max-width:700px;margin:0 auto">
      <div class="flex items-center gap-3 mb-6">
        <button class="btn btn-ghost btn-sm" onclick="QuizPage.exitRun()">
          <i data-lucide="arrow-left"></i> ${I18N.t('common_back')}
        </button>
        <h1 class="page-title" style="font-size:1.4rem">🤖 ${lang==='vi'?'Tạo đề từ AI':'Generate Quiz with AI'}</h1>
      </div>

      <!-- Step indicator -->
      <div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:2rem">
        ${[1,2,3].map(s => `
          <div style="display:flex;align-items:center;gap:0.5rem">
            <div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;background:${this._aiGenStep>=s?'var(--purple)':'rgba(255,255,255,0.1)'}">
              ${this._aiGenStep > s ? '✓' : s}
            </div>
            ${s < 3 ? '<div style="flex:1;height:2px;background:rgba(255,255,255,0.1);min-width:40px"></div>' : ''}
          </div>`).join('')}
      </div>

      <!-- Step 1: Source -->
      <div id="ai-step-1" style="display:${this._aiGenStep===1?'block':'none'}">
        <div class="card mb-4">
          <h3 style="font-weight:600;margin-bottom:1rem">${lang==='vi'?'Bước 1: Chọn nguồn tài liệu':'Step 1: Choose source material'}</h3>

          <div class="grid-2" style="gap:0.75rem;margin-bottom:1.5rem">
            <div class="card card-sm card-clickable ${this._aiGenSource==='notes'?'card-selected':''}"
                 onclick="QuizPage._setAiSource('notes')">
              <div style="font-size:1.5rem;margin-bottom:0.5rem">📓</div>
              <div style="font-weight:600;font-size:0.9rem">${lang==='vi'?'Từ ghi chú đã lưu':'From saved notes'}</div>
              <div style="font-size:0.75rem;color:var(--text-muted)">${lang==='vi'?'Chọn ghi chú hoặc tài liệu đã upload':'Select from your notes or uploaded docs'}</div>
            </div>
            <div class="card card-sm card-clickable ${this._aiGenSource==='upload'?'card-selected':''}"
                 onclick="QuizPage._setAiSource('upload')">
              <div style="font-size:1.5rem;margin-bottom:0.5rem">📤</div>
              <div style="font-weight:600;font-size:0.9rem">${lang==='vi'?'Upload tài liệu mới':'Upload new material'}</div>
              <div style="font-size:0.75rem;color:var(--text-muted)">${lang==='vi'?'Ảnh hoặc PDF — sẽ qua OCR tự động':'Image or PDF — auto-OCR'}</div>
            </div>
          </div>

          <!-- Notes selector -->
          <div id="ai-notes-picker" style="display:${this._aiGenSource==='notes'?'block':'none'}">
            <label class="form-label">${lang==='vi'?'Chọn ghi chú (có thể chọn nhiều):':'Select notes to use (multi-select):'}</label>
            <div style="max-height:220px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--r-md);padding:0.5rem">
              ${notes.length === 0
                ? `<p style="color:var(--text-muted);font-size:0.85rem;padding:0.5rem">${lang==='vi'?'Chưa có ghi chú nào.':'No notes found.'}</p>`
                : notes.map(n => {
                    const subj = Storage.getSubjectById(n.subjectId);
                    return `
                    <label style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem;cursor:pointer;border-radius:var(--r-sm);transition:background 0.15s" class="hover-bg">
                      <input type="checkbox" class="ai-note-check" value="${n.id}" style="accent-color:var(--purple)">
                      <div style="flex:1;min-width:0">
                        <div style="font-size:0.85rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${n.title || (lang==='vi'?'Không tiêu đề':'Untitled')}</div>
                        ${subj ? `<div style="font-size:0.7rem;color:var(--text-muted)">${subj.emoji} ${lang==='vi'?(subj.nameVi||subj.name):subj.name}</div>` : ''}
                      </div>
                    </label>`;
                  }).join('')}
            </div>
          </div>

          <!-- File upload -->
          <div id="ai-upload-picker" style="display:${this._aiGenSource==='upload'?'block':'none'}">
            <label class="form-label">${lang==='vi'?'Upload file tài liệu:':'Upload document file:'}</label>
            <div class="ocr-dropzone" onclick="document.getElementById('ai-upload-file').click()">
              <div class="ocr-dropzone-icon">📤</div>
              <p>${lang==='vi'?'Nhấn để chọn file (PDF, ảnh, .txt, .md)':'Click to select file (PDF, image, .txt, .md)'}</p>
              <input type="file" id="ai-upload-file" accept=".pdf,.jpg,.jpeg,.png,.txt,.md" style="display:none"
                     onchange="QuizPage._onAiFileSelected(this.files[0])">
            </div>
            <div id="ai-upload-status" style="font-size:0.8rem;color:var(--mint);margin-top:0.5rem"></div>
          </div>
        </div>

        <button class="btn btn-primary w-full" onclick="QuizPage._aiGenNext1()">
          ${lang==='vi'?'Tiếp theo →':'Next →'}
        </button>
      </div>

      <!-- Step 2: Config -->
      <div id="ai-step-2" style="display:${this._aiGenStep===2?'block':'none'}">
        <div class="card mb-4">
          <h3 style="font-weight:600;margin-bottom:1rem">${lang==='vi'?'Bước 2: Cấu hình bài kiểm tra':'Step 2: Configure the quiz'}</h3>

          <div class="form-group">
            <label class="form-label">${lang==='vi'?'Tên bài kiểm tra:':'Quiz name:'}</label>
            <input class="form-input" id="ai-quiz-name" placeholder="${lang==='vi'?'vd: OOP Chương 5 — Kế thừa':'e.g. DSA Chapter 3 — Trees'}">
          </div>

          <div class="form-group">
            <label class="form-label">${lang==='vi'?'Chủ đề / Chỉ dẫn thêm cho AI:':'Topic / Extra instructions for AI:'}</label>
            <textarea class="form-textarea" id="ai-quiz-topic" rows="2"
              placeholder="${lang==='vi'?'vd: Tập trung vào đa hình và interface. Câu hỏi ở mức độ hiểu và vận dụng.':'e.g. Focus on polymorphism and interfaces. Medium difficulty.'}"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${lang==='vi'?'Số câu hỏi:':'Number of questions:'}</label>
              <input class="form-input" type="number" id="ai-num-q" value="10" min="3" max="30">
            </div>
            <div class="form-group">
              <label class="form-label">${lang==='vi'?'Loại câu hỏi:':'Question types:'}</label>
              <select class="form-select" id="ai-q-types">
                <option value="mixed">${lang==='vi'?'Hỗn hợp (MCQ + Tự luận)':'Mixed (MCQ + Essay)'}</option>
                <option value="mcq">${lang==='vi'?'Chỉ trắc nghiệm MCQ':'MCQ only'}</option>
                <option value="sa">${lang==='vi'?'Chỉ tự luận':'Essay/Short-answer only'}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">${lang==='vi'?'Môn học:':'Subject:'}</label>
            <select class="form-select" id="ai-subject">
              <option value="">${I18N.t('common_none')}</option>
              ${subjects.map(s => `<option value="${s.id}">${s.emoji} ${lang==='vi'?(s.nameVi||s.name):s.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display:flex;gap:0.75rem">
          <button class="btn btn-ghost flex-1" onclick="QuizPage._aiGenStep=1;App.navigate('quiz',false)">← ${lang==='vi'?'Quay lại':'Back'}</button>
          <button class="btn btn-primary flex-1" id="ai-gen-btn" onclick="QuizPage._aiGenGenerate()">
            <i data-lucide="sparkles"></i> ${lang==='vi'?'Tạo đề ngay!':'Generate Now!'}
          </button>
        </div>

        <div id="ai-gen-progress-container" style="display:none;margin-top:1.5rem">
          <div class="card animate-fadeIn" style="border:1px solid rgba(167,139,250,0.3);background:rgba(167,139,250,0.02)">
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem">
              <span class="spinner"></span>
              <span style="font-weight:600;font-size:0.9rem;color:var(--text-primary)" id="ai-progress-status"></span>
            </div>
            <div style="font-size:0.75rem;color:var(--purple);font-weight:700;margin-bottom:0.4rem;text-transform:uppercase">
              ${lang==='vi'?'Prompt gửi đến Ollama:':'Prompt sent to Ollama:'}
            </div>
            <pre id="ai-progress-prompt" style="font-family:'JetBrains Mono',monospace;font-size:0.7rem;color:var(--text-secondary);white-space:pre-wrap;background:#0d0d1a;padding:0.75rem;border-radius:var(--r-sm);max-height:200px;overflow-y:auto;margin:0;border:1px solid var(--border)"></pre>
          </div>
        </div>
      </div>

      <!-- Step 3: Review & Save -->
      <div id="ai-step-3" style="display:${this._aiGenStep===3?'block':'none'}">
        <div class="card mb-4">
          <div class="flex items-center justify-between mb-3">
            <h3 style="font-weight:600">${lang==='vi'?'Bước 3: Xem lại câu hỏi':'Step 3: Review Questions'}</h3>
            <span id="ai-q-count" class="badge badge-purple"></span>
          </div>
          <div id="ai-questions-preview" style="max-height:450px;overflow-y:auto;display:flex;flex-direction:column;gap:0.75rem"></div>
        </div>
        <div style="display:flex;gap:0.75rem">
          <button class="btn btn-ghost flex-1" onclick="QuizPage._aiGenStep=2;App.navigate('quiz',false)">← ${lang==='vi'?'Quay lại':'Back'}</button>
          <button class="btn btn-primary flex-1" onclick="QuizPage._aiSaveQuiz()">
            <i data-lucide="save"></i> ${lang==='vi'?'Lưu bài kiểm tra':'Save Quiz'}
          </button>
        </div>
      </div>
    </div>`;
  },

  _setAiSource(src) {
    this._aiGenSource = src;
    document.getElementById('ai-notes-picker').style.display  = src === 'notes'  ? 'block' : 'none';
    document.getElementById('ai-upload-picker').style.display = src === 'upload' ? 'block' : 'none';
    document.querySelectorAll('#ai-step-1 .card-clickable').forEach((el, i) => {
      el.classList.toggle('card-selected', (i === 0 && src === 'notes') || (i === 1 && src === 'upload'));
    });
  },

  _aiUploadText: '',
  async _onAiFileSelected(file) {
    if (!file) return;
    const status = document.getElementById('ai-upload-status');
    if (status) status.textContent = I18N.lang==='vi' ? '⏳ Đang xử lý file...' : '⏳ Processing file...';
    try {
      const settings = Storage.getSettings();
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${settings.backendUrl}/api/quiz/ocr-paper`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      this._aiUploadText = data.text || '';
      if (status) status.textContent = `✅ ${I18N.lang==='vi'?'Đã đọc':'Read'} ${data.chars} ${I18N.lang==='vi'?'ký tự từ file':'chars from file'}`;
    } catch (e) {
      if (status) status.textContent = `❌ ${e.message}`;
      App.toast(I18N.lang==='vi'?'Không thể đọc file (backend cần chạy)':'Cannot read file (backend must be running)', 'error');
    }
  },

  _aiGenNext1() {
    if (this._aiGenSource === 'notes') {
      const checked = [...document.querySelectorAll('.ai-note-check:checked')].map(c => c.value);
      if (checked.length === 0) {
        App.toast(I18N.lang==='vi'?'Chọn ít nhất một ghi chú!':'Select at least one note!', 'error');
        return;
      }
      // Collect note text content (strip HTML)
      const tmp = document.createElement('div');
      this._aiUploadText = checked.map(id => {
        const note = Storage.getNotes().find(n => n.id === id);
        if (!note) return '';
        tmp.innerHTML = note.content || '';
        return (note.title || '') + '\n' + (tmp.textContent || '');
      }).join('\n\n---\n\n');
    } else {
      if (!this._aiUploadText) {
        App.toast(I18N.lang==='vi'?'Vui lòng upload file trước!':'Please upload a file first!', 'error');
        return;
      }
    }
    this._aiGenStep = 2;
    App.navigate('quiz', false);
  },

  _aiGeneratedQuestions: [],

  async _aiGenGenerate() {
    const lang  = I18N.lang;
    const name  = document.getElementById('ai-quiz-name')?.value.trim();
    const topic = document.getElementById('ai-quiz-topic')?.value.trim();
    const numQ  = parseInt(document.getElementById('ai-num-q')?.value) || 10;
    const types = document.getElementById('ai-q-types')?.value || 'mixed';

    if (!name) { App.toast(lang==='vi'?'Nhập tên bài kiểm tra!':'Enter quiz name!', 'error'); return; }

    const btn = document.getElementById('ai-gen-btn');
    const progressContainer = document.getElementById('ai-gen-progress-container');
    const progressStatus = document.getElementById('ai-progress-status');
    const progressPrompt = document.getElementById('ai-progress-prompt');

    // Replicate prompt construction for display
    const langInstr = lang === 'vi' ? 'Trả lời bằng tiếng Việt. ' : 'Answer in English. ';
    const typeInstr = {
      mcq: 'Only generate multiple-choice questions (4 options each, one correct).',
      sa: 'Only generate short-answer/essay questions (no options, just a model answer).',
      mixed: 'Mix of multiple-choice (MCQ) and short-answer (SA) questions.'
    }[types] || 'Mix MCQ and short-answer questions.';
    const contextBlock = this._aiUploadText ? `\n\nSource material to base questions on:\n---\n${this._aiUploadText.substring(0, 1000)}...\n---\n` : '';
    const fullPrompt = `${langInstr}You are a university exam question generator.
${typeInstr}
Generate exactly ${numQ} exam questions about: "${topic || name}".${contextBlock}

IMPORTANT: Respond ONLY with a valid JSON array. No explanation, no markdown fences.
Each item must have this exact structure:
- For MCQ: {"type":"mcq","text":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correct":0,"explanation":"..."}
- For SA:  {"type":"sa","text":"...","model_answer":"...","points":5}`;

    if (btn) { btn.disabled = true; btn.innerHTML = '⏳ ' + (lang==='vi'?'AI đang tạo câu hỏi...':'AI is generating...'); }
    if (progressContainer) progressContainer.style.display = 'block';
    if (progressStatus) progressStatus.textContent = lang === 'vi' ? 'Đang gửi prompt đến Ollama...' : 'Sending prompt to Ollama...';
    if (progressPrompt) progressPrompt.textContent = fullPrompt;

    try {
      const settings = Storage.getSettings();
      const res = await fetch(`${settings.backendUrl}/api/quiz/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic:          topic || name,
          num_questions:  numQ,
          types,
          language:       lang,
          document_text:  this._aiUploadText || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      this._aiGeneratedQuestions = data.questions || [];
      this._aiGenStep = 3;
      App.navigate('quiz', false);
      // Render preview after navigation
      setTimeout(() => this._renderAiPreview(), 100);
    } catch (e) {
      App.toast(`${lang==='vi'?'Lỗi tạo đề:':'Generation error:'} ${e.message}`, 'error', 5000);
      if (progressContainer) progressContainer.style.display = 'none';
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = `<i data-lucide="sparkles"></i> ${lang==='vi'?'Tạo đề ngay!':'Generate Now!'}`; if(window.lucide) lucide.createIcons(); }
    }
  },

  _renderAiPreview() {
    const lang    = I18N.lang;
    const preview = document.getElementById('ai-questions-preview');
    const count   = document.getElementById('ai-q-count');
    if (!preview) return;
    if (count) count.textContent = `${this._aiGeneratedQuestions.length} ${lang==='vi'?'câu':'questions'}`;
    preview.innerHTML = this._aiGeneratedQuestions.map((q, i) => `
      <div class="card card-sm" style="background:rgba(255,255,255,0.03)">
        <div style="display:flex;gap:0.5rem;align-items:flex-start">
          <span class="badge badge-purple" style="margin-top:1px">${q.type==='mcq'?'MCQ':'SA'}</span>
          <div style="flex:1">
            <div style="font-weight:500;font-size:0.9rem;margin-bottom:0.5rem">${i+1}. ${q.text}</div>
            ${q.type === 'mcq' ? `
              <div class="mcq-preview-options" id="mcq-opts-${i}" style="display:flex;flex-direction:column;gap:0.25rem">
                ${(q.options||[]).map((opt, oi) => `
                  <div class="${oi===q.correct?'correct-option':''}" style="font-size:0.8rem;color:var(--text-muted);padding:0.2rem 0.4rem;border-radius:4px">
                    ${opt}
                  </div>`).join('')}
              </div>
              <button class="btn btn-ghost btn-sm mt-2" style="font-size:0.7rem;padding:2px 8px;height:auto"
                      onclick="document.getElementById('mcq-opts-${i}').classList.toggle('show-correct'); this.textContent = document.getElementById('mcq-opts-${i}').classList.contains('show-correct') ? '🙈 ${lang==='vi'?'Ẩn đáp án':'Hide answer'}' : '👁️ ${lang==='vi'?'Xem đáp án':'Show answer'}';">
                👁️ ${lang==='vi'?'Xem đáp án':'Show answer'}
              </button>` : `
              <div style="font-size:0.8rem;color:var(--text-muted);font-style:italic">
                📝 ${lang==='vi'?'Tự luận':'Short answer'} · ${q.points||5} ${lang==='vi'?'điểm':'pts'}
              </div>`}
            ${q.explanation ? `<div style="font-size:0.75rem;color:var(--amber);margin-top:0.25rem">💡 ${q.explanation}</div>` : ''}
          </div>
          <button class="btn btn-danger btn-icon btn-sm" title="${lang==='vi'?'Xóa':'Remove'}"
                  onclick="QuizPage._aiRemoveQ(${i})"><i data-lucide="x"></i></button>
        </div>
      </div>`).join('');
    if (window.lucide) lucide.createIcons();
  },

  _aiRemoveQ(idx) {
    this._aiGeneratedQuestions.splice(idx, 1);
    this._renderAiPreview();
  },

  _aiSaveQuiz() {
    const lang    = I18N.lang;
    const name    = document.getElementById('ai-quiz-name')?.value.trim() || (lang==='vi'?'Bài kiểm tra AI':'AI Quiz');
    const subjId  = document.getElementById('ai-subject')?.value || null;
    const hasMcq  = this._aiGeneratedQuestions.some(q => q.type === 'mcq');
    const hasSa   = this._aiGeneratedQuestions.some(q => q.type === 'sa');

    if (this._aiGeneratedQuestions.length === 0) {
      App.toast(lang==='vi'?'Không có câu hỏi nào!':'No questions to save!', 'error'); return;
    }

    // Convert AI format to internal quiz format
    const questions = this._aiGeneratedQuestions.map(q => {
      if (q.type === 'mcq') {
        // Find correct index — q.correct may be 0-indexed int or letter
        const correctIdx = typeof q.correct === 'number' ? q.correct : parseInt(q.correct) || 0;
        return {
          type:        'mcq',
          text:        q.text,
          explanation: q.explanation || '',
          correct:     correctIdx,
          options:     (q.options || []).map(o => ({ text: o.replace(/^[A-D]\.\s*/,'') })),
        };
      } else {
        return {
          type:         'sa',
          text:         q.text,
          model_answer: q.model_answer || '',
          points:       q.points || 5,
        };
      }
    });

    const quiz = {
      id:        Storage.generateId(),
      name,
      subjectId: subjId,
      timed:     false,
      timePerQ:  60,
      questions,
      createdAt: new Date().toISOString(),
      source:    'ai',
    };
    Storage.upsertQuiz(quiz);
    App.toast(lang==='vi'?'Đã lưu bài kiểm tra!':'Quiz saved!', 'success');
    this._activeQuiz = quiz;
    this._mode = 'edit';
    App.navigate('quiz', false);
  },

  // ══════════════════════════════════════════════════════════
  // RAW TEST IMPORT
  // ══════════════════════════════════════════════════════════
  startRawImport() {
    const lang     = I18N.lang;
    const subjects = Storage.getSubjects();
    App.openModal(`
      <div class="form-group">
        <label class="form-label">${lang==='vi'?'Tên đề thi:':'Test paper name:'}</label>
        <input class="form-input" id="raw-name" placeholder="${lang==='vi'?'vd: Đề thi giữa kỳ OOP 2024':'e.g. Midterm OOP 2024'}">
      </div>
      <div class="form-group">
        <label class="form-label">${lang==='vi'?'Môn học:':'Subject:'}</label>
        <select class="form-select" id="raw-subject">
          <option value="">${I18N.t('common_none')}</option>
          ${subjects.map(s => `<option value="${s.id}">${s.emoji} ${lang==='vi'?(s.nameVi||s.name):s.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">${lang==='vi'?'Số câu hỏi trong đề:':'Number of questions in paper:'}</label>
        <input class="form-input" type="number" id="raw-q-count" value="5" min="1" max="50">
      </div>
      <button class="btn btn-primary w-full" onclick="QuizPage.createRawTest()">
        <i data-lucide="file-plus"></i> ${lang==='vi'?'Tạo phòng làm bài':'Open Test Room'}
      </button>
    `, `📋 ${lang==='vi'?'Import đề thi':'Import Test Paper'}`);
  },

  async createRawTest() {
    const lang   = I18N.lang;
    const name   = document.getElementById('raw-name')?.value.trim();
    const subjId = document.getElementById('raw-subject')?.value || null;
    const qCount = parseInt(document.getElementById('raw-q-count')?.value) || 5;

    if (!name) { App.toast(lang==='vi'?'Nhập tên đề thi!':'Enter paper name!', 'error'); return; }

    const test = {
      id:            Storage.generateId(),
      name,
      subjectId:     subjId,
      questionCount: qCount,
      answers:       new Array(qCount).fill(''),
      annotations:   [],
      status:        'new',
      createdAt:     new Date().toISOString(),
      updatedAt:     new Date().toISOString(),
    };
    Storage.upsertRawTest(test);
    App.closeModal();
    this._rawTest = test;
    this._rawViewMode = 'type';
    this._mode = 'raw-view';
    App.navigate('quiz', false);
  },

  async openRawTest(testId) {
    const test = Storage.getRawTests().find(t => t.id === testId);
    if (!test) return;
    this._rawTest = { ...test, answers: test.answers || [] };
    this._rawViewMode = 'type';
    this._mode = 'raw-view';
    // Restore any saved paper URL from IndexedDB
    this._paperObjectURL = await IDB.getObjectURL(testId + '_paper') || null;
    App.navigate('quiz', false);
  },

  // ══════════════════════════════════════════════════════════
  // RAW VIEW — Paper viewer + Answer sheet
  // ══════════════════════════════════════════════════════════
  _renderRawView() {
    const t    = this._rawTest;
    const lang = I18N.lang;
    const hasPaper = !!this._paperObjectURL;

    return `
    <div class="animate-fadeIn">
      <!-- Header bar -->
      <div class="flex items-center gap-3 mb-4" style="flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="QuizPage._saveRawAnswers();QuizPage.exitRun()">
          <i data-lucide="arrow-left"></i> ${I18N.t('common_back')}
        </button>
        <h1 class="page-title" style="font-size:1.1rem;flex:1">📋 ${t.name}</h1>

        <!-- Action buttons -->
        <button class="btn btn-ghost btn-sm" onclick="QuizPage._saveRawAnswers()">
          <i data-lucide="save"></i> ${lang==='vi'?'Lưu':'Save'}
        </button>
        <button class="btn btn-amber btn-sm" onclick="QuizPage._promptLlmGrade()">
          <i data-lucide="star"></i> ${lang==='vi'?'Chấm bằng AI':'AI Grade'}
        </button>
        <button class="btn btn-primary btn-sm" onclick="QuizPage._bundleExport()">
          <i data-lucide="download"></i> ${lang==='vi'?'Xuất file':'Export'}
        </button>
      </div>

      <div class="diagram-editor-layout" style="gap:1rem;align-items:flex-start">

        <!-- LEFT: Test paper viewer -->
        <div style="flex:1;min-width:0">
          <div class="card" style="padding:0;overflow:hidden">
            <!-- Paper toolbar -->
            <div style="display:flex;align-items:center;gap:0.5rem;padding:0.6rem 1rem;border-bottom:1px solid var(--border);flex-wrap:wrap">
              <span style="font-size:0.75rem;font-weight:600;color:var(--text-muted)">
                📄 ${lang==='vi'?'ĐỀ THI':'TEST PAPER'}
              </span>
              <div style="margin-left:auto;display:flex;gap:0.5rem">
                <button class="btn btn-ghost btn-sm" onclick="QuizPage._zoomPaper(-0.2)" title="Zoom out">−</button>
                <button class="btn btn-ghost btn-sm" id="paper-zoom-label">100%</button>
                <button class="btn btn-ghost btn-sm" onclick="QuizPage._zoomPaper(0.2)" title="Zoom in">+</button>
                <button class="btn btn-ghost btn-sm" onclick="QuizPage._zoomPaper(null)" title="Reset">⊡</button>
              </div>
            </div>

            <!-- Paper content -->
            <div id="paper-viewer" style="padding:1rem;min-height:400px;overflow:auto;position:relative">
              ${hasPaper
                ? `<div id="paper-zoom-wrap" style="transform-origin:top left;transition:transform 0.2s">
                     ${this._paperObjectURL.includes('data:image') || this._paperObjectURL.startsWith('blob:')
                       ? `<img src="${this._paperObjectURL}" style="max-width:100%;border-radius:var(--r-md)" id="paper-img">`
                       : `<iframe src="${this._paperObjectURL}" style="width:100%;height:600px;border:none;border-radius:var(--r-md)"></iframe>`}
                   </div>`
                : `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;gap:1rem;color:var(--text-muted)">
                     <div style="font-size:3rem">📷</div>
                     <p>${lang==='vi'?'Chưa có ảnh đề thi':'No test paper uploaded yet'}</p>
                     <button class="btn btn-primary" onclick="document.getElementById('paper-upload-input').click()">
                       <i data-lucide="upload"></i> ${lang==='vi'?'Upload đề thi (ảnh/PDF)':'Upload test paper (image/PDF)'}
                     </button>
                     <input type="file" id="paper-upload-input" accept=".jpg,.jpeg,.png,.pdf" style="display:none"
                            onchange="QuizPage._uploadPaper(this.files[0])">
                   </div>`}

              <!-- Sticky notes layer -->
              <div id="annotations-layer" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none">
                ${(t.annotations||[]).map((a,i) => `
                  <div class="sticky-note" style="left:${a.x}%;top:${a.y}%;pointer-events:all" data-idx="${i}">
                    <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem">
                      <span style="font-size:0.6rem;color:#b45309">📌</span>
                      <button onclick="QuizPage._removeAnnotation(${i})" style="background:none;border:none;cursor:pointer;color:#b45309;font-size:0.7rem">×</button>
                    </div>
                    <div style="font-size:0.75rem;color:#1a1a1a" contenteditable="true"
                         onblur="QuizPage._updateAnnotation(${i},this.textContent)">${a.text}</div>
                  </div>`).join('')}
              </div>
            </div>

            ${hasPaper ? `
            <div style="padding:0.5rem 1rem;border-top:1px solid var(--border);display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
              <button class="btn btn-ghost btn-sm" onclick="QuizPage._addAnnotation()">
                📌 ${lang==='vi'?'Thêm ghi chú':'Add note'}
              </button>
              <button class="btn btn-ghost btn-sm" onclick="document.getElementById('paper-upload-input').click()">
                <i data-lucide="refresh-cw"></i> ${lang==='vi'?'Đổi ảnh':'Replace'}
              </button>
              <input type="file" id="paper-upload-input" accept=".jpg,.jpeg,.png,.pdf" style="display:none"
                     onchange="QuizPage._uploadPaper(this.files[0])">
            </div>` : ''}
          </div>
        </div>

        <!-- RIGHT: Answer sheet -->
        <div style="width:360px;min-width:280px;flex-shrink:0">
          <div class="card" style="padding:0;overflow:hidden">
            <!-- Answer mode tabs -->
            <div style="display:flex;border-bottom:1px solid var(--border)">
              <button class="tab-btn ${this._rawViewMode==='type'?'active':''}" style="flex:1;border-radius:0"
                      onclick="QuizPage._setAnswerMode('type')">
                ⌨️ ${lang==='vi'?'Gõ bài':'Type'}
              </button>
              <button class="tab-btn ${this._rawViewMode==='upload'?'active':''}" style="flex:1;border-radius:0"
                      onclick="QuizPage._setAnswerMode('upload')">
                📷 ${lang==='vi'?'Upload bài làm':'Upload'}
              </button>
            </div>

            <div style="padding:1rem">
              <!-- Type mode -->
              <div id="answer-type-panel" style="display:${this._rawViewMode==='type'?'block':'none'}">
                <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.75rem">
                  ${lang==='vi'?'Nhập câu trả lời cho từng câu. Hỗ trợ $toán$ LaTeX.':'Type your answer per question. Supports $math$ LaTeX.'}
                </p>
                <div style="display:flex;flex-direction:column;gap:0.75rem;max-height:500px;overflow-y:auto">
                  ${Array.from({length: t.questionCount||5}, (_,i) => `
                    <div>
                      <label style="font-size:0.8rem;font-weight:600;color:var(--purple);display:block;margin-bottom:0.25rem">
                        ${lang==='vi'?'Câu':'Q'} ${i+1}
                      </label>
                      <textarea class="form-textarea raw-answer-input" rows="3" data-idx="${i}"
                        style="font-size:0.85rem;resize:vertical"
                        oninput="QuizPage._onAnswerInput(${i},this.value)"
                        placeholder="${lang==='vi'?`Câu trả lời câu ${i+1}...`:`Answer for question ${i+1}...`}"
                      >${(t.answers&&t.answers[i])||''}</textarea>
                    </div>`).join('')}
                </div>
              </div>

              <!-- Upload mode -->
              <div id="answer-upload-panel" style="display:${this._rawViewMode==='upload'?'block':'none'}">
                <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.75rem">
                  ${lang==='vi'?'Upload ảnh bài làm viết tay hoặc file PDF bài làm.':'Upload a photo of your handwritten answers or a PDF.'}
                </p>
                <div id="answer-preview-wrap">
                  ${this._answerObjectURL
                    ? `<img src="${this._answerObjectURL}" style="max-width:100%;border-radius:var(--r-md);margin-bottom:0.75rem">`
                    : ''}
                </div>
                <div class="ocr-dropzone" onclick="document.getElementById('answer-upload-input').click()">
                  <div class="ocr-dropzone-icon">📷</div>
                  <p>${lang==='vi'?'Nhấn để upload ảnh/PDF bài làm':'Click to upload answer image/PDF'}</p>
                  <input type="file" id="answer-upload-input" accept=".jpg,.jpeg,.png,.pdf" style="display:none"
                         onchange="QuizPage._uploadAnswer(this.files[0])">
                </div>
                <p style="font-size:0.7rem;color:var(--text-muted);margin-top:0.5rem;text-align:center">
                  ${lang==='vi'?'File sẽ được lưu vào bộ nhớ cục bộ và đính kèm khi xuất.':'File saved locally and attached on export.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  },

  _paperZoom: 1.0,
  _zoomPaper(delta) {
    if (delta === null) this._paperZoom = 1.0;
    else this._paperZoom = Math.max(0.3, Math.min(3.0, this._paperZoom + delta));
    const wrap  = document.getElementById('paper-zoom-wrap');
    const label = document.getElementById('paper-zoom-label');
    if (wrap)  wrap.style.transform  = `scale(${this._paperZoom})`;
    if (label) label.textContent     = `${Math.round(this._paperZoom * 100)}%`;
  },

  async _uploadPaper(file) {
    if (!file) return;
    App.toast(I18N.lang==='vi'?'Đang lưu đề thi...':'Saving paper...', 'info', 1500);
    await IDB.storeFile(this._rawTest.id + '_paper', file);
    this._paperObjectURL = await IDB.getObjectURL(this._rawTest.id + '_paper');
    App.navigate('quiz', false); // re-render
    App.toast(I18N.lang==='vi'?'Đã upload đề thi!':'Paper uploaded!', 'success');
  },

  async _uploadAnswer(file) {
    if (!file) return;
    App.toast(I18N.lang==='vi'?'Đang lưu bài làm...':'Saving answer...', 'info', 1500);
    await IDB.storeFile(this._rawTest.id + '_answer', file);
    this._answerObjectURL = await IDB.getObjectURL(this._rawTest.id + '_answer');
    const wrap = document.getElementById('answer-preview-wrap');
    if (wrap && file.type.startsWith('image/')) {
      wrap.innerHTML = `<img src="${this._answerObjectURL}" style="max-width:100%;border-radius:var(--r-md);margin-bottom:0.75rem">`;
    }
    App.toast(I18N.lang==='vi'?'Đã upload bài làm!':'Answer uploaded!', 'success');
  },

  _setAnswerMode(mode) {
    this._rawViewMode = mode;
    document.getElementById('answer-type-panel').style.display  = mode === 'type'   ? 'block' : 'none';
    document.getElementById('answer-upload-panel').style.display = mode === 'upload' ? 'block' : 'none';
    document.querySelectorAll('#answer-type-panel ~ .tab-btn, .tab-btn').forEach((b, i) => {
      b.classList.toggle('active', (i === 0 && mode === 'type') || (i === 1 && mode === 'upload'));
    });
  },

  _onAnswerInput(idx, value) {
    if (!this._rawTest.answers) this._rawTest.answers = [];
    this._rawTest.answers[idx] = value;
  },

  _saveRawAnswers() {
    if (!this._rawTest) return;
    // Sync from DOM
    document.querySelectorAll('.raw-answer-input').forEach(el => {
      const i = parseInt(el.dataset.idx);
      if (!isNaN(i)) {
        if (!this._rawTest.answers) this._rawTest.answers = [];
        this._rawTest.answers[i] = el.value;
      }
    });
    this._rawTest.updatedAt = new Date().toISOString();
    Storage.upsertRawTest(this._rawTest);
    App.toast(I18N.lang==='vi'?'Đã lưu bài làm!':'Saved!', 'success');
  },

  _addAnnotation() {
    const lang = I18N.lang;
    const text = prompt(lang==='vi'?'Nội dung ghi chú:':'Annotation text:');
    if (!text) return;
    if (!this._rawTest.annotations) this._rawTest.annotations = [];
    this._rawTest.annotations.push({ x: 5, y: 5 + this._rawTest.annotations.length * 12, text });
    Storage.upsertRawTest(this._rawTest);
    App.navigate('quiz', false);
  },

  _removeAnnotation(idx) {
    this._rawTest.annotations.splice(idx, 1);
    Storage.upsertRawTest(this._rawTest);
    App.navigate('quiz', false);
  },

  _updateAnnotation(idx, text) {
    if (this._rawTest.annotations && this._rawTest.annotations[idx]) {
      this._rawTest.annotations[idx].text = text;
      Storage.upsertRawTest(this._rawTest);
    }
  },

  // ── LLM Grading ──────────────────────────────────────────
  async _promptLlmGrade() {
    const lang = I18N.lang;
    this._saveRawAnswers();
    const t = this._rawTest;
    const answers = (t.answers||[]).map((a, i) => ({
      question: `${lang==='vi'?'Câu':'Question'} ${i+1}`,
      answer:   a || '',
    }));

    if (answers.every(a => !a.answer.trim())) {
      App.toast(lang==='vi'?'Nhập ít nhất một câu trả lời trước!':'Enter at least one answer first!', 'error');
      return;
    }

    App.toast(lang==='vi'?'AI đang chấm bài... (có thể mất 30-60 giây)':'AI grading... (may take 30-60s)', 'info', 10000);

    try {
      const settings = Storage.getSettings();
      const res = await fetch(`${settings.backendUrl}/api/quiz/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          language: lang,
          context:  t.paperText || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      this._rawTest.gradeResults = data.results;
      this._rawTest.status = 'graded';
      Storage.upsertRawTest(this._rawTest);
      this._mode = 'raw-result';
      App.navigate('quiz', false);
    } catch (e) {
      App.toast(`${lang==='vi'?'Lỗi chấm bài:':'Grading error:'} ${e.message}`, 'error', 6000);
    }
  },

  // ── Bundle Export (JSON + trigger PDF) ──────────────────
  async _bundleExport() {
    this._saveRawAnswers();
    const lang = I18N.lang;
    const t    = this._rawTest;

    App.openModal(`
      <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1.5rem">
        ${lang==='vi'
          ?'Chọn định dạng xuất bài. File sẽ chứa đề + bài làm + ghi chú.'
          :'Choose export format. The file will include the paper info, answers, and annotations.'}
      </p>

      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <button class="btn btn-primary" onclick="QuizPage._exportJson();App.closeModal()">
          <i data-lucide="file-json"></i>
          ${lang==='vi'?'Xuất JSON — để gửi thầy cô chấm bằng AI Chat':'Export JSON — for AI Chat grading'}
        </button>
        <button class="btn btn-ghost" onclick="QuizPage._exportPdfBundle();App.closeModal()">
          <i data-lucide="file-text"></i>
          ${lang==='vi'?'Xuất PDF — để in/gửi thầy cô tự chấm':'Export PDF — for printing / manual grading by teacher'}
        </button>
      </div>
    `, `📦 ${lang==='vi'?'Xuất bài làm':'Export Answers'}`);
    if (window.lucide) lucide.createIcons();
  },

  _exportJson() {
    const t    = this._rawTest;
    const lang = I18N.lang;
    const bundle = {
      studyblossom: 'test-export-v1',
      exported:   new Date().toISOString(),
      name:       t.name,
      subject:    Storage.getSubjectById(t.subjectId)?.name || '',
      questions:  t.questionCount,
      answers:    (t.answers||[]).map((a,i) => ({ q: i+1, answer: a || '' })),
      annotations: t.annotations||[],
      gradeResults: t.gradeResults||[],
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {type:'application/json'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${t.name.replace(/\s+/g,'_')}_bai_lam.json`;
    a.click();
    URL.revokeObjectURL(url);
    App.toast(lang==='vi'?'Đã xuất file JSON!':'JSON exported!', 'success');
  },

  _exportPdfBundle() {
    const t    = this._rawTest;
    const lang = I18N.lang;
    const subject = Storage.getSubjectById(t.subjectId);

    const win = window.open('', '_blank');
    const answersHtml = (t.answers||[]).map((a, i) => `
      <div style="margin-bottom:1.5rem;padding-bottom:1.5rem;border-bottom:1px solid #e5e7eb">
        <div style="font-weight:700;color:#4c1d95;margin-bottom:0.5rem">
          ${lang==='vi'?'Câu':'Question'} ${i+1}:
        </div>
        <div style="white-space:pre-wrap;line-height:1.8;min-height:3rem;padding:0.5rem;border:1px solid #e5e7eb;border-radius:6px;background:#fafaf9">
          ${a || `<span style="color:#9ca3af;font-style:italic">${lang==='vi'?'(Chưa trả lời)':'(No answer)'}</span>`}
        </div>
      </div>`).join('');

    win.document.write(`<!DOCTYPE html><html><head><title>${t.name}</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
      <style>
        body{font-family:'Times New Roman',serif;max-width:800px;margin:2rem auto;color:#111;line-height:1.6}
        h1{color:#4c1d95;border-bottom:2px solid #4c1d95;padding-bottom:0.5rem}
        .meta{color:#6b7280;font-size:0.9rem;margin-bottom:2rem}
        @media print{body{margin:1rem}}
      </style></head><body>
      <h1>📋 ${t.name}</h1>
      <div class="meta">
        ${subject ? `${subject.emoji} ${lang==='vi'?(subject.nameVi||subject.name):subject.name} · ` : ''}
        ${lang==='vi'?'Ngày làm':'Date'}: ${new Date().toLocaleDateString(lang==='vi'?'vi-VN':'en-US')} ·
        ${lang==='vi'?'Số câu':'Questions'}: ${t.questionCount}
      </div>
      <h2>${lang==='vi'?'BÀI LÀM':'STUDENT ANSWERS'}</h2>
      ${answersHtml}
      ${t.annotations&&t.annotations.length>0 ? `
        <h2>${lang==='vi'?'GHI CHÚ':'NOTES'}</h2>
        ${t.annotations.map((a,i) => `<p><b>${i+1}.</b> ${a.text}</p>`).join('')}` : ''}
    </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
  },

  // ══════════════════════════════════════════════════════════
  // RAW RESULT — AI Grading Feedback
  // ══════════════════════════════════════════════════════════
  _renderRawResult() {
    const t       = this._rawTest;
    const results = t.gradeResults || [];
    const lang    = I18N.lang;
    const answers = t.answers || [];

    const totalScore  = results.reduce((s, r) => s + (r.score||0), 0);
    const maxScore    = results.length * 10;
    const pct         = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const scoreColor  = pct >= 70 ? 'var(--mint)' : pct >= 50 ? 'var(--amber)' : 'var(--coral)';

    return `
    <div class="animate-fadeIn" style="max-width:750px;margin:0 auto">
      <div class="flex items-center gap-3 mb-5">
        <button class="btn btn-ghost btn-sm" onclick="QuizPage._mode='raw-view';App.navigate('quiz',false)">
          <i data-lucide="arrow-left"></i> ${lang==='vi'?'Về bài làm':'Back to paper'}
        </button>
        <h1 class="page-title" style="font-size:1.3rem">🤖 ${lang==='vi'?'Kết quả chấm AI':'AI Grading Results'}</h1>
      </div>

      <!-- Score summary -->
      <div class="card mb-5" style="text-align:center">
        <div style="font-size:3rem;font-weight:800;color:${scoreColor}">${pct}%</div>
        <div style="color:var(--text-muted);margin-bottom:0.5rem">${totalScore} / ${maxScore} ${lang==='vi'?'điểm (AI ước tính)':'points (AI estimate)'}</div>
        <div style="font-size:0.8rem;color:var(--text-muted)">
          ${lang==='vi'
            ?'⚠️ Điểm do AI ước tính, chỉ mang tính tham khảo. Thầy/cô là người chấm chính thức.'
            :'⚠️ AI-estimated score for reference only. Your teacher is the official grader.'}
        </div>
      </div>

      <!-- Per-question breakdown -->
      <h3 style="font-weight:600;margin-bottom:1rem">📝 ${lang==='vi'?'Chi tiết từng câu':'Per-question breakdown'}</h3>
      <div style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:2rem">
        ${results.map((r, i) => `
          <div class="card card-sm" style="border-color:${r.correct?'rgba(110,231,183,0.3)':'rgba(251,191,36,0.3)'}">
            <div class="flex items-start gap-3">
              <div style="font-size:1.2rem;min-width:24px">${r.correct?'✅':'⚠️'}</div>
              <div style="flex:1">
                <div style="font-weight:600;margin-bottom:0.25rem">
                  ${lang==='vi'?'Câu':'Q'}${i+1}
                  <span style="color:${r.score>=7?'var(--mint)':r.score>=5?'var(--amber)':'var(--coral)'};margin-left:0.5rem">${r.score||0}/10</span>
                </div>
                <div style="font-size:0.8rem;color:var(--text-secondary);background:rgba(255,255,255,0.04);padding:0.4rem 0.6rem;border-radius:var(--r-sm);margin-bottom:0.4rem;font-style:italic">
                  "${(answers[i]||'').substring(0,150)}${(answers[i]||'').length>150?'...':''}"
                </div>
                <div style="font-size:0.82rem;color:var(--text-muted)">💬 ${r.feedback || ''}</div>
              </div>
            </div>
          </div>`).join('')}
      </div>

      <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="QuizPage._exportJson()">
          <i data-lucide="file-json"></i> ${lang==='vi'?'Xuất JSON (gửi thầy/cô)':'Export JSON (send to teacher)'}
        </button>
        <button class="btn btn-ghost" onclick="QuizPage._exportPdfBundle()">
          <i data-lucide="file-text"></i> ${lang==='vi'?'Xuất PDF':'Export PDF'}
        </button>
        <button class="btn btn-ghost" onclick="QuizPage.exitRun()">
          ${lang==='vi'?'Về trang chính':'Back to list'}
        </button>
      </div>
    </div>`;
  },

  // ══════════════════════════════════════════════════════════
  // EXISTING: MCQ/SA Run Mode
  // ══════════════════════════════════════════════════════════
  _renderRun() {
    const quiz = this._activeQuiz;
    const q    = quiz.questions[this._currentQ];
    const pct  = ((this._currentQ / quiz.questions.length) * 100);
    const lang = I18N.lang;

    return `
    <div class="animate-fadeIn" style="max-width:700px;margin:0 auto">
      <div class="flex items-center justify-between mb-4">
        <button class="btn btn-ghost btn-sm" onclick="QuizPage.exitRun()">
          <i data-lucide="x"></i> ${lang==='vi'?'Thoát':'Exit'}
        </button>
        <div style="font-size:0.875rem;color:var(--text-secondary)">${quiz.name}</div>
        <span class="badge badge-purple">${this._currentQ + 1}/${quiz.questions.length}</span>
      </div>

      <div class="progress-bar-wrap mb-2">
        <div class="progress-bar-fill" style="width:${pct}%;transition:width 0.3s"></div>
      </div>

      ${quiz.timed ? `
      <div class="quiz-timer-bar mb-3">
        <div class="quiz-timer-fill" id="quiz-timer-fill" style="width:100%"></div>
      </div>
      <div style="text-align:right;font-size:0.75rem;color:var(--text-muted);margin-bottom:1rem" id="quiz-time-display"></div>
      ` : ''}

      <div class="quiz-question-card">
        <div class="quiz-q-number">${lang==='vi'?'Câu hỏi':'Question'} ${this._currentQ + 1}
          ${q.type === 'sa' ? `<span class="badge badge-amber" style="margin-left:0.5rem">${lang==='vi'?'Tự luận':'Essay'}</span>` : ''}
        </div>
        <div class="quiz-q-text">${q.text}</div>

        ${q.type === 'sa'
          ? `<textarea class="form-textarea" id="sa-answer-${this._currentQ}" rows="5"
               placeholder="${lang==='vi'?'Nhập câu trả lời của bạn...':'Type your answer here...'}"
               oninput="QuizPage._answers[QuizPage._currentQ]=this.value"
             >${this._answers[this._currentQ]||''}</textarea>`
          : q.type === 'tf'
            ? `<div class="quiz-options">
                ${['true','false'].map((val,i) => `
                  <button class="quiz-option-btn ${this._answers[this._currentQ]===val?'selected':''}"
                    id="opt-${i}" onclick="QuizPage.selectAnswer('${val}')">
                    ${val === 'true' ? '✓ True / Đúng' : '✗ False / Sai'}
                  </button>`).join('')}
               </div>`
            : `<div class="quiz-options">
                ${(q.options||[]).map((opt, i) => `
                  <button class="quiz-option-btn ${this._answers[this._currentQ]===String(i)?'selected':''}"
                    id="opt-${i}" onclick="QuizPage.selectAnswer('${i}')">
                    <span style="color:var(--purple);font-weight:700;margin-right:0.5rem">${String.fromCharCode(65+i)}.</span>
                    ${opt.text}
                  </button>`).join('')}
               </div>`}
      </div>

      <div style="display:flex;justify-content:flex-end;gap:1rem">
        ${this._currentQ < quiz.questions.length - 1
          ? `<button class="btn btn-primary" onclick="QuizPage.nextQuestion()">
               ${I18N.t('quiz_next')} <i data-lucide="arrow-right"></i>
             </button>`
          : `<button class="btn btn-coral" onclick="QuizPage.submitQuiz()">
               <i data-lucide="check-square"></i> ${I18N.t('quiz_submit')}
             </button>`}
      </div>
    </div>`;
  },

  // ══════════════════════════════════════════════════════════
  // EXISTING: Result + Edit modes (unchanged logic, added SA support)
  // ══════════════════════════════════════════════════════════
  _renderResult() {
    const quiz    = this._activeQuiz;
    const lang    = I18N.lang;
    const mcqQs   = quiz.questions.filter(q => q.type !== 'sa');
    const saQs    = quiz.questions.filter(q => q.type === 'sa');
    const total   = mcqQs.length;
    const correct = this._answers.filter((a,i) => {
      const q = quiz.questions[i];
      return q.type !== 'sa' && this._isCorrect(q, a);
    }).length;
    const score   = total > 0 ? Math.round((correct / total) * 100) : 0;
    const elapsed = Math.round((Date.now() - this._startTime) / 1000);

    const R = 70, circ = 2 * Math.PI * R;
    const offset = circ - (score / 100) * circ;
    const scoreColor = score >= 80 ? 'var(--mint)' : score >= 60 ? 'var(--amber)' : 'var(--coral)';

    return `
    <div class="animate-fadeIn" style="max-width:700px;margin:0 auto">
      <h1 class="page-title mb-4">🏆 ${lang==='vi'?'Kết quả':'Quiz Results'}</h1>

      <div class="card mb-4">
        <div class="score-ring-wrap">
          <div class="score-ring">
            <svg viewBox="0 0 160 160" width="160" height="160">
              <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:${scoreColor}"/>
                <stop offset="100%" style="stop-color:${scoreColor}88"/>
              </linearGradient></defs>
              <circle cx="80" cy="80" r="${R}" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="12"/>
              <circle cx="80" cy="80" r="${R}" fill="none" stroke="url(#rg)" stroke-width="12"
                stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
                stroke-linecap="round" transform="rotate(-90 80 80)"/>
            </svg>
            <div class="score-ring-center">
              <div class="score-pct" style="color:${scoreColor}">${score}%</div>
              <div class="score-label">${total > 0 ? `${correct}/${total} MCQ` : lang==='vi'?'Tự luận':'Essay'}</div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:1rem">
            <div><div style="font-size:2rem;font-weight:700;color:var(--mint)">${correct}</div>
              <div style="font-size:0.75rem;color:var(--text-muted)">${lang==='vi'?'Đúng':'Correct'}</div></div>
            <div><div style="font-size:2rem;font-weight:700;color:var(--coral)">${total - correct}</div>
              <div style="font-size:0.75rem;color:var(--text-muted)">${lang==='vi'?'Sai':'Wrong'}</div></div>
            <div><div style="font-size:1.5rem;font-weight:600;color:var(--text-secondary)">${Math.floor(elapsed/60)}:${String(elapsed%60).padStart(2,'0')}</div>
              <div style="font-size:0.75rem;color:var(--text-muted)">${lang==='vi'?'Thời gian':'Time'}</div></div>
          </div>
        </div>
      </div>

      ${saQs.length > 0 ? `
      <div class="card mb-4" style="border-color:rgba(251,191,36,0.3)">
        <h4 style="font-weight:600;margin-bottom:0.75rem;color:var(--amber)">
          📝 ${lang==='vi'?`${saQs.length} câu tự luận — cần chấm thủ công hoặc AI`:`${saQs.length} essay questions — needs manual or AI grading`}
        </h4>
        <button class="btn btn-amber btn-sm" onclick="QuizPage._gradeEssaysQuick()">
          <i data-lucide="star"></i> ${lang==='vi'?'Chấm tự luận bằng AI':'AI-Grade Essays'}
        </button>
      </div>` : ''}

      <h3 style="font-weight:600;margin-bottom:1rem">🔍 ${I18N.t('quiz_review')}</h3>
      ${quiz.questions.map((q, i) => {
        const userAns = this._answers[i];
        if (q.type === 'sa') {
          return `
          <div class="card card-sm mb-3" style="border-color:rgba(251,191,36,0.3)">
            <div style="font-weight:500;margin-bottom:0.5rem">📝 ${i+1}. ${q.text}</div>
            <div style="font-size:0.8rem;color:var(--amber);white-space:pre-wrap">${lang==='vi'?'Bài làm:':'Answer:'} ${userAns || `(${lang==='vi'?'Chưa trả lời':'No answer'})`}</div>
            ${q.model_answer ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem;border-top:1px solid var(--border);padding-top:0.5rem">💡 ${lang==='vi'?'Gợi ý:':'Model answer:'} ${q.model_answer}</div>` : ''}
          </div>`;
        }
        const isRight = this._isCorrect(q, userAns);
        return `
        <div class="card card-sm mb-3" style="border-color:${isRight?'rgba(110,231,183,0.3)':'rgba(251,113,133,0.3)'}">
          <div style="font-weight:500;margin-bottom:0.5rem">${isRight?'✅':'❌'} ${i+1}. ${q.text}</div>
          <div style="font-size:0.8rem;color:var(--text-secondary)">
            ${lang==='vi'?'Bạn chọn:':'Your answer:'}
            <span style="color:${isRight?'var(--mint)':'var(--coral)'}">${this._formatAnswer(q, userAns)}</span>
          </div>
          ${!isRight ? `
            <div style="display:none;font-size:0.8rem;color:var(--mint);margin-top:0.25rem" id="correct-ans-${i}">
              ${I18N.t('quiz_correct_ans')}: ${this._formatAnswer(q, this._getCorrectAnswer(q))}
            </div>
            <button class="btn btn-ghost btn-sm mt-1" style="font-size:0.7rem;padding:2px 8px;height:auto"
                    onclick="document.getElementById('correct-ans-${i}').style.display = document.getElementById('correct-ans-${i}').style.display === 'none' ? 'block' : 'none'; this.textContent = document.getElementById('correct-ans-${i}').style.display === 'none' ? '👁️ ${lang==='vi'?'Xem đáp án':'Show answer'}' : '🙈 ${lang==='vi'?'Ẩn đáp án':'Hide answer'}';">
              👁️ ${lang==='vi'?'Xem đáp án':'Show answer'}
            </button>
          ` : ''}
          ${q.explanation ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem;border-top:1px solid var(--border);padding-top:0.5rem">💡 ${q.explanation}</div>` : ''}
        </div>`;
      }).join('')}

      <div style="display:flex;gap:1rem;margin-top:1.5rem">
        <button class="btn btn-primary" onclick="QuizPage.startQuiz('${quiz.id}')">
          <i data-lucide="refresh-cw"></i> ${lang==='vi'?'Làm lại':'Retake'}
        </button>
        <button class="btn btn-ghost" onclick="QuizPage.exitRun()">
          ${lang==='vi'?'Về danh sách':'Back to List'}
        </button>
      </div>
    </div>`;
  },

  async _gradeEssaysQuick() {
    const lang = I18N.lang;
    const quiz = this._activeQuiz;
    const answers = quiz.questions
      .map((q, i) => q.type === 'sa' ? { question: q.text, answer: this._answers[i]||'', expected: q.model_answer } : null)
      .filter(Boolean);

    App.toast(lang==='vi'?'AI đang chấm tự luận...':'AI grading essays...', 'info', 8000);
    try {
      const settings = Storage.getSettings();
      const res = await fetch(`${settings.backendUrl}/api/quiz/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, language: lang }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      // Store results and re-render
      this._essayGrades = data.results;
      App.toast(lang==='vi'?'Đã chấm xong! Xem bên dưới.':'Done! See results below.', 'success');
    } catch (e) {
      App.toast(`${e.message}`, 'error');
    }
  },

  _renderEdit() {
    const quiz = this._activeQuiz;
    const subjects = Storage.getSubjects();
    const lang = I18N.lang;

    return `
    <div class="animate-fadeIn">
      <div class="flex items-center gap-3 mb-6">
        <button class="btn btn-ghost btn-sm" onclick="QuizPage.exitRun()">
          <i data-lucide="arrow-left"></i> ${I18N.t('common_back')}
        </button>
        <h1 class="page-title" style="font-size:1.5rem">✏️ ${quiz.name}</h1>
      </div>

      <div class="card mb-4">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${I18N.t('quiz_name')}</label>
            <input class="form-input" id="edit-quiz-name" value="${quiz.name}">
          </div>
          <div class="form-group">
            <label class="form-label">${I18N.t('exam_subject')}</label>
            <select class="form-select" id="edit-quiz-subject">
              <option value="">${I18N.t('common_none')}</option>
              ${subjects.map(s => `<option value="${s.id}" ${quiz.subjectId===s.id?'selected':''}>${s.emoji} ${lang==='vi'?(s.nameVi||s.name):s.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-check mb-3">
          <input type="checkbox" id="edit-quiz-timed" ${quiz.timed?'checked':''}>
          <label for="edit-quiz-timed" class="form-label" style="margin:0">⏱️ ${I18N.t('quiz_timed')}</label>
          <input type="number" id="edit-quiz-time" class="form-input" value="${quiz.timePerQ||30}"
            min="5" max="300" style="width:80px;margin-left:0.5rem">
          <span class="text-sm text-muted">${I18N.t('quiz_time_per_q')}</span>
        </div>
        <button class="btn btn-primary btn-sm" onclick="QuizPage.saveQuizSettings()">
          <i data-lucide="save"></i> ${I18N.t('common_save')}
        </button>
      </div>

      <div class="flex items-center justify-between mb-3">
        <h3 style="font-weight:600">${lang==='vi'?'Câu hỏi':'Questions'} (${(quiz.questions||[]).length})</h3>
        <button class="btn btn-primary btn-sm" onclick="QuizPage.openAddQuestionModal()">
          <i data-lucide="plus"></i> ${I18N.t('quiz_add_question')}
        </button>
      </div>

      <div id="questions-list">
        ${(quiz.questions||[]).length === 0
          ? `<div class="empty-state"><p>${lang==='vi'?'Chưa có câu hỏi nào':'No questions yet'}</p></div>`
          : (quiz.questions||[]).map((q, i) => `
            <div class="card card-sm mb-2 flex items-start gap-3">
              <div style="font-size:0.75rem;font-weight:700;color:var(--purple);padding-top:2px;min-width:24px">${i+1}.</div>
              <div style="flex:1">
                <div style="font-size:0.875rem;font-weight:500">${q.text}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem">
                  ${q.type === 'tf' ? '✓/✗ True/False'
                    : q.type === 'sa' ? `📝 ${lang==='vi'?'Tự luận':'Short answer'} · ${q.points||5}pts`
                    : `${(q.options||[]).length} ${lang==='vi'?'đáp án':'options'}`}
                </div>
              </div>
              <button class="btn btn-danger btn-sm btn-icon" onclick="QuizPage.deleteQuestion(${i})">
                <i data-lucide="trash-2"></i>
              </button>
            </div>`).join('')}
      </div>
    </div>`;
  },

  // ══════════════════════════════════════════════════════════
  // CORE LOGIC (unchanged + extended)
  // ══════════════════════════════════════════════════════════
  init() {},

  startQuiz(quizId) {
    const quiz = Storage.getQuizzes().find(q => q.id === quizId);
    if (!quiz || (quiz.questions||[]).length === 0) {
      App.toast(I18N.lang==='vi'?'Bài kiểm tra chưa có câu hỏi!':'Quiz has no questions!','error'); return;
    }
    this._activeQuiz = quiz;
    this._answers    = new Array(quiz.questions.length).fill(null);
    this._currentQ   = 0;
    this._startTime  = Date.now();
    this._mode       = 'run';
    App.navigate('quiz', false);
    if (quiz.timed) { this._timeLeft = quiz.timePerQ||30; this._startTimer(); }
    Storage.touchStreak();
    App._updateStreak();
  },

  _startTimer() {
    this._stopTimer();
    this._timeLeft = this._activeQuiz.timePerQ || 30;
    this._timerInterval = setInterval(() => {
      this._timeLeft--;
      const fill = document.getElementById('quiz-timer-fill');
      const disp = document.getElementById('quiz-time-display');
      if (fill) fill.style.width = `${(this._timeLeft/(this._activeQuiz.timePerQ||30))*100}%`;
      if (disp) disp.textContent = `${this._timeLeft}s`;
      if (this._timeLeft <= 0) this.nextQuestion();
    }, 1000);
  },

  _stopTimer() {
    if (this._timerInterval) { clearInterval(this._timerInterval); this._timerInterval = null; }
  },

  selectAnswer(value) {
    this._answers[this._currentQ] = String(value);
    document.querySelectorAll('.quiz-option-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.onclick?.toString().includes(`'${value}'`) || btn.onclick?.toString().includes(`"${value}"`));
    });
  },

  nextQuestion() {
    this._stopTimer();
    // Save short-answer textarea content before moving
    const saEl = document.getElementById(`sa-answer-${this._currentQ}`);
    if (saEl) this._answers[this._currentQ] = saEl.value;

    if (this._currentQ < this._activeQuiz.questions.length - 1) {
      this._currentQ++;
      this._mode = 'run';
      App.navigate('quiz', false);
      if (this._activeQuiz.timed) this._startTimer();
    } else {
      this.submitQuiz();
    }
  },

  submitQuiz() {
    this._stopTimer();
    // Final SA capture
    const saEl = document.getElementById(`sa-answer-${this._currentQ}`);
    if (saEl) this._answers[this._currentQ] = saEl.value;

    const quiz    = this._activeQuiz;
    const mcqQs   = quiz.questions.filter((q,i) => q.type !== 'sa');
    const mcqAnswers = this._answers.filter((a,i) => quiz.questions[i].type !== 'sa');
    const correct = mcqAnswers.filter((a,i) => {
      const qi = quiz.questions.findIndex((q,j) => q.type !== 'sa' && j === i);
      return this._isCorrect(quiz.questions[qi]||mcqQs[i], a);
    }).length;
    const total = mcqQs.length;
    const score = total > 0 ? Math.round((correct/total)*100) : 0;

    Storage.addQuizResult({ quizId: quiz.id, quizName: quiz.name, score, correct, total, subjectId: quiz.subjectId });
    this._mode = 'result';
    App.navigate('quiz', false);
  },

  exitRun() {
    this._stopTimer();
    this._mode = 'list';
    this._activeQuiz = null;
    this._rawTest    = null;
    if (this._paperObjectURL) { URL.revokeObjectURL(this._paperObjectURL); this._paperObjectURL = null; }
    if (this._answerObjectURL) { URL.revokeObjectURL(this._answerObjectURL); this._answerObjectURL = null; }
    App.navigate('quiz', false);
  },

  openCreateModal() { this.startAiGen(); },

  openEditQuiz(quizId) {
    const quiz = Storage.getQuizzes().find(q => q.id === quizId);
    if (!quiz) return;
    this._activeQuiz = quiz;
    this._mode = 'edit';
    App.navigate('quiz', false);
  },

  saveQuizSettings() {
    const quiz = this._activeQuiz;
    if (!quiz) return;
    quiz.name      = document.getElementById('edit-quiz-name')?.value.trim() || quiz.name;
    quiz.subjectId = document.getElementById('edit-quiz-subject')?.value || quiz.subjectId;
    quiz.timed     = document.getElementById('edit-quiz-timed')?.checked || false;
    quiz.timePerQ  = parseInt(document.getElementById('edit-quiz-time')?.value) || 30;
    Storage.upsertQuiz(quiz);
    this._activeQuiz = quiz;
    App.toast(I18N.t('common_success'), 'success');
  },

  openAddQuestionModal() {
    const lang = I18N.lang;
    App.openModal(`
      <div class="form-group">
        <label class="form-label">${lang==='vi'?'Loại câu hỏi:':'Question type:'}</label>
        <div class="tab-bar" style="margin-bottom:0">
          <button class="tab-btn active" id="type-mcq" onclick="QuizPage._switchQType('mcq')">${I18N.t('quiz_type_mcq')}</button>
          <button class="tab-btn" id="type-tf" onclick="QuizPage._switchQType('tf')">${I18N.t('quiz_type_tf')}</button>
          <button class="tab-btn" id="type-sa" onclick="QuizPage._switchQType('sa')">${lang==='vi'?'Tự luận':'Essay'}</button>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">${I18N.t('quiz_question_text')}</label>
        <textarea class="form-textarea" id="q-text" placeholder="${lang==='vi'?'Nội dung câu hỏi... (hỗ trợ $toán$)':'Question text... (supports $math$)'}"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">${lang==='vi'?'Giải thích (tùy chọn)':'Explanation (optional)'}</label>
        <input class="form-input" id="q-explanation" placeholder="${lang==='vi'?'Giải thích đáp án...':'Explain the answer...'}">
      </div>
      <div id="q-options-area">
        ${this._renderOptionFields('mcq')}
      </div>
      <button class="btn btn-primary w-full mt-2" onclick="QuizPage.addQuestion()">
        <i data-lucide="plus"></i> ${lang==='vi'?'Thêm câu hỏi':'Add Question'}
      </button>
    `, `➕ ${I18N.t('quiz_add_question')}`);
    this._currentQType = 'mcq';
  },

  _currentQType: 'mcq',

  _switchQType(type) {
    this._currentQType = type;
    const area = document.getElementById('q-options-area');
    if (area) area.innerHTML = this._renderOptionFields(type);
    ['mcq','tf','sa'].forEach(t => document.getElementById(`type-${t}`)?.classList.toggle('active', t===type));
  },

  _renderOptionFields(type) {
    const lang = I18N.lang;
    if (type === 'tf') return `
      <div class="form-group">
        <label class="form-label">${I18N.t('quiz_correct_ans')}</label>
        <select class="form-select" id="q-correct-tf">
          <option value="true">✓ True / Đúng</option>
          <option value="false">✗ False / Sai</option>
        </select>
      </div>`;
    if (type === 'sa') return `
      <div class="form-group">
        <label class="form-label">${lang==='vi'?'Đáp án mẫu (tùy chọn):':'Model answer (optional):'}</label>
        <textarea class="form-textarea" id="q-model-answer" rows="3"
          placeholder="${lang==='vi'?'Gợi ý đáp án cho học sinh...':'Suggested answer for student reference...'}"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">${lang==='vi'?'Số điểm:':'Points:'}</label>
        <input class="form-input" type="number" id="q-points" value="5" min="1" max="20" style="width:80px">
      </div>`;

    return `
    <label class="form-label">${lang==='vi'?'Các đáp án (đánh dấu đáp án đúng):':'Options (mark the correct one):'}</label>
    ${['A','B','C','D'].map((letter, i) => `
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
        <input type="radio" name="q-correct" value="${i}" id="q-opt-radio-${i}" ${i===0?'checked':''} style="accent-color:var(--purple)">
        <label for="q-opt-radio-${i}" style="font-weight:700;color:var(--purple);min-width:20px">${letter}.</label>
        <input class="form-input" id="q-opt-${i}" placeholder="${lang==='vi'?`Đáp án ${letter}`:`Option ${letter}`}">
      </div>`).join('')}`;
  },

  addQuestion() {
    const text = document.getElementById('q-text')?.value.trim();
    if (!text) { App.toast(I18N.lang==='vi'?'Nhập nội dung câu hỏi!':'Enter question text!','error'); return; }
    const explanation = document.getElementById('q-explanation')?.value.trim() || '';
    let question;

    if (this._currentQType === 'tf') {
      question = { type:'tf', text, explanation, correct: document.getElementById('q-correct-tf')?.value || 'true' };
    } else if (this._currentQType === 'sa') {
      question = { type:'sa', text, model_answer: document.getElementById('q-model-answer')?.value.trim()||'', points: parseInt(document.getElementById('q-points')?.value)||5 };
    } else {
      const options = ['A','B','C','D'].map((_,i) => ({ text: document.getElementById(`q-opt-${i}`)?.value.trim() || '' }));
      const correctIdx = document.querySelector('input[name="q-correct"]:checked')?.value || '0';
      if (!options[0].text) { App.toast(I18N.lang==='vi'?'Nhập ít nhất đáp án A!':'Enter at least option A!','error'); return; }
      question = { type:'mcq', text, explanation, options: options.filter(o=>o.text), correct: parseInt(correctIdx) };
    }

    const quiz = Storage.getQuizzes().find(q => q.id === this._activeQuiz.id);
    if (!quiz) return;
    quiz.questions = [...(quiz.questions||[]), question];
    Storage.upsertQuiz(quiz);
    this._activeQuiz = quiz;
    App.closeModal();
    App.toast(I18N.t('common_success'), 'success');
    App.navigate('quiz', false);
  },

  deleteQuestion(idx) {
    const quiz = Storage.getQuizzes().find(q => q.id === this._activeQuiz.id);
    if (!quiz) return;
    quiz.questions.splice(idx, 1);
    Storage.upsertQuiz(quiz);
    this._activeQuiz = quiz;
    App.navigate('quiz', false);
  },

  deleteQuiz(quizId) {
    App.confirm(I18N.t('common_confirm_delete'), () => {
      Storage.deleteQuiz(quizId);
      App.navigate('quiz', false);
      App.toast(I18N.lang==='vi'?'Đã xóa':'Deleted','success');
    });
  },

  deleteRawTest(testId) {
    App.confirm(I18N.t('common_confirm_delete'), async () => {
      Storage.deleteRawTest(testId);
      await IDB.delete(testId + '_paper').catch(()=>{});
      await IDB.delete(testId + '_answer').catch(()=>{});
      App.navigate('quiz', false);
      App.toast(I18N.lang==='vi'?'Đã xóa đề thi':'Paper deleted','success');
    });
  },

  _isCorrect(q, answer) {
    if (answer === null || answer === undefined) return false;
    if (q.type === 'tf')  return answer === q.correct;
    if (q.type === 'sa')  return false; // SA never auto-correct
    return parseInt(answer) === q.correct;
  },

  _getCorrectAnswer(q) {
    if (q.type === 'tf') return q.correct === 'true' ? '✓ True' : '✗ False';
    const opt = (q.options||[])[q.correct];
    return opt ? `${String.fromCharCode(65+q.correct)}. ${opt.text}` : String(q.correct);
  },

  _formatAnswer(q, answer) {
    if (answer === null || answer === undefined || answer === '') return I18N.lang==='vi'?'(Không trả lời)':'(No answer)';
    if (q.type === 'tf') return answer === 'true' ? '✓ True' : '✗ False';
    if (q.type === 'sa') return answer.substring(0,120) + (answer.length>120?'...':'');
    const opt = (q.options||[])[parseInt(answer)];
    return opt ? `${String.fromCharCode(65+parseInt(answer))}. ${opt.text}` : answer;
  },

  destroy() {
    this._stopTimer();
    if (App.currentPage !== 'quiz') {
      this._mode = 'list';
    }
    if (this._paperObjectURL)  { URL.revokeObjectURL(this._paperObjectURL);  this._paperObjectURL  = null; }
    if (this._answerObjectURL) { URL.revokeObjectURL(this._answerObjectURL); this._answerObjectURL = null; }
  },
};
