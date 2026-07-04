// ============================================================
// StudyBloom 🌸 — Flashcards Page (SM-2 Spaced Repetition)
// ============================================================

const FlashcardsPage = {
  _mode: 'decks',   // 'decks' | 'study' | 'edit'
  _activeDeck: null,
  _studyQueue: [],
  _studyIdx: 0,
  _isFlipped: false,
  _sessionCorrect: 0,
  _sessionIncorrect: 0,

  render() {
    if (this._mode === 'study' && this._activeDeck)
      return this._renderStudyMode();
    if (this._mode === 'edit' && this._activeDeck)
      return this._renderEditMode();
    return this._renderDeckList();
  },

  _renderDeckList() {
    const decks = Storage.getDecks();
    const subjects = Storage.getSubjects();
    return `
    <div class="animate-fadeIn">
      <div class="page-header">
        <div>
          <h1 class="page-title">🃏 ${I18N.t('fc_title')}</h1>
          <p class="page-subtitle">${I18N.lang === 'vi' ? 'Học thông minh với lặp lại ngắt quãng SM-2' : 'Learn smart with SM-2 spaced repetition'}</p>
        </div>
        <div style="display:flex;gap:0.5rem">
          <button class="btn btn-ghost" onclick="FlashcardsPage.openOCRImport()">
            <i data-lucide="scan-text"></i> ${I18N.t('fc_ocr_import')}
          </button>
          <button class="btn btn-primary" onclick="FlashcardsPage.openNewDeckModal()">
            <i data-lucide="plus"></i> ${I18N.t('fc_new_deck')}
          </button>
        </div>
      </div>

      ${decks.length === 0
        ? `<div class="empty-state">
            <div class="empty-state-icon">🃏</div>
            <h3>${I18N.lang === 'vi' ? 'Chưa có bộ thẻ nào' : 'No decks yet'}</h3>
            <p>${I18N.lang === 'vi' ? 'Tạo bộ thẻ đầu tiên để bắt đầu!' : 'Create your first deck to get started!'}</p>
            <button class="btn btn-primary mt-4" onclick="FlashcardsPage.openNewDeckModal()">
              ${I18N.t('fc_new_deck')}
            </button>
          </div>`
        : `<div class="grid-auto" id="decks-grid">${decks.map(d => this._renderDeckCard(d)).join('')}</div>`}
    </div>`;
  },

  _renderDeckCard(deck) {
    const stats = SM2.deckStats(deck);
    const subject = Storage.getSubjectById(deck.subjectId);
    const color   = subject ? subject.color : '#a78bfa';

    return `
    <div class="card card-clickable animate-slideUp" style="border-top:3px solid ${color}">
      <div class="flex items-center justify-between mb-3">
        <div>
          <div style="font-weight:700;font-size:1rem">${deck.name}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px">
            ${subject ? `${subject.emoji} ${I18N.lang === 'vi' ? (subject.nameVi||subject.name) : subject.name}` : ''}
          </div>
        </div>
        ${stats.due > 0 ? `<span class="badge badge-coral">${stats.due} ${I18N.t('fc_due')}</span>` : ''}
      </div>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem;margin-bottom:1rem;text-align:center">
        <div>
          <div style="font-size:1.1rem;font-weight:700;color:var(--text-primary)">${stats.total}</div>
          <div style="font-size:0.65rem;color:var(--text-muted)">${I18N.lang === 'vi' ? 'Tổng' : 'Total'}</div>
        </div>
        <div>
          <div style="font-size:1.1rem;font-weight:700;color:#94a3b8">${stats.new}</div>
          <div style="font-size:0.65rem;color:var(--text-muted)">${I18N.lang === 'vi' ? 'Mới' : 'New'}</div>
        </div>
        <div>
          <div style="font-size:1.1rem;font-weight:700;color:var(--amber)">${stats.learning}</div>
          <div style="font-size:0.65rem;color:var(--text-muted)">${I18N.lang === 'vi' ? 'Đang học' : 'Learning'}</div>
        </div>
        <div>
          <div style="font-size:1.1rem;font-weight:700;color:var(--mint)">${stats.mastered}</div>
          <div style="font-size:0.65rem;color:var(--text-muted)">${I18N.lang === 'vi' ? 'Thuộc' : 'Mastered'}</div>
        </div>
      </div>

      <div style="display:flex;gap:0.5rem">
        <button class="btn btn-primary flex-1" onclick="FlashcardsPage.startStudy('${deck.id}')">
          <i data-lucide="play"></i> ${I18N.t('fc_study')}
        </button>
        <button class="btn btn-ghost btn-sm" onclick="FlashcardsPage.openEditDeck('${deck.id}')">
          <i data-lucide="pencil"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="FlashcardsPage.deleteDeck('${deck.id}')">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    </div>`;
  },

  _renderStudyMode() {
    const deck = this._activeDeck;
    const total = this._studyQueue.length;
    const remaining = total - this._studyIdx;

    if (this._studyIdx >= total) return this._renderSessionDone();

    const card = this._studyQueue[this._studyIdx];
    const progress = total > 0 ? ((this._studyIdx / total) * 100) : 0;

    return `
    <div class="animate-fadeIn" style="max-width:640px;margin:0 auto">
      <div class="flex items-center justify-between mb-4">
        <button class="btn btn-ghost btn-sm" onclick="FlashcardsPage.exitStudy()">
          <i data-lucide="arrow-left"></i> ${I18N.t('common_back')}
        </button>
        <div style="font-size:0.875rem;color:var(--text-secondary)">${deck.name}</div>
        <span class="badge badge-purple">${this._studyIdx + 1} / ${total}</span>
      </div>

      <div class="progress-bar-wrap mb-6">
        <div class="progress-bar-fill" style="width:${progress}%"></div>
      </div>

      <!-- Session stats -->
      <div style="display:flex;justify-content:center;gap:2rem;margin-bottom:1rem;font-size:0.875rem">
        <span style="color:var(--mint)">✓ ${this._sessionCorrect}</span>
        <span style="color:var(--coral)">✗ ${this._sessionIncorrect}</span>
        <span style="color:var(--text-muted)">📋 ${remaining} ${I18N.lang === 'vi' ? 'còn lại' : 'remaining'}</span>
      </div>

      <!-- Flashcard 3D flip -->
      <div class="flashcard-scene" onclick="FlashcardsPage.flip()" id="fc-scene">
        <div class="flashcard-card ${this._isFlipped ? 'flipped' : ''}" id="fc-card">
          <div class="flashcard-face front">
            <div class="flashcard-face-label">${I18N.lang === 'vi' ? 'CÂU HỎI' : 'QUESTION'}</div>
            <div class="flashcard-content" id="fc-front">${this._formatContent(card.front)}</div>
            <div class="flashcard-flip-hint">👆 ${I18N.lang === 'vi' ? 'Nhấn để lật thẻ' : 'Click to flip'}</div>
          </div>
          <div class="flashcard-face back">
            <div class="flashcard-face-label">${I18N.lang === 'vi' ? 'ĐÁP ÁN' : 'ANSWER'}</div>
            <div class="flashcard-content" id="fc-back">${this._formatContent(card.back)}</div>
          </div>
        </div>
      </div>

      <!-- Rating buttons (show after flip) -->
      <div id="fc-rating" style="display:${this._isFlipped ? 'block' : 'none'}">
        <p style="text-align:center;color:var(--text-muted);font-size:0.875rem;margin-bottom:0.75rem">
          ${I18N.lang === 'vi' ? 'Bạn nhớ tốt thế nào?' : 'How well did you remember?'}
        </p>
        <div class="fc-quality-btns">
          ${[0,1,2,3,4,5].map(q => {
            const label = SM2.QUALITY_LABELS[q];
            return `<button class="fc-quality-btn" style="background:${label.color}"
              onclick="FlashcardsPage.rate(${q})">
              ${label[I18N.lang] || label.en}
            </button>`;
          }).join('')}
        </div>
      </div>

      ${!this._isFlipped ? `
      <div style="text-align:center;margin-top:1.5rem">
        <button class="btn btn-primary btn-lg" onclick="FlashcardsPage.flip()">
          <i data-lucide="rotate-cw"></i> ${I18N.t('fc_flip')}
        </button>
      </div>` : ''}
    </div>`;
  },

  _renderSessionDone() {
    const total = this._sessionCorrect + this._sessionIncorrect;
    const pct   = total > 0 ? Math.round((this._sessionCorrect / total) * 100) : 0;
    const r = 70; const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;

    return `
    <div class="animate-fadeIn" style="max-width:500px;margin:0 auto;text-align:center;padding:2rem 0">
      <div style="font-size:3rem;margin-bottom:1rem">🎉</div>
      <h2 class="font-outfit" style="font-size:1.75rem;margin-bottom:0.5rem">${I18N.t('fc_session_done')}</h2>
      <p style="color:var(--text-secondary);margin-bottom:2rem">${this._activeDeck.name}</p>

      <div class="score-ring-wrap">
        <div class="score-ring">
          <svg viewBox="0 0 160 160" width="160" height="160">
            <defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:var(--purple)"/>
              <stop offset="100%" style="stop-color:var(--coral)"/>
            </linearGradient></defs>
            <circle cx="80" cy="80" r="${r}" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="12"/>
            <circle cx="80" cy="80" r="${r}" fill="none" stroke="url(#sg)" stroke-width="12"
              stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"
              transform="rotate(-90 80 80)"/>
          </svg>
          <div class="score-ring-center">
            <div class="score-pct">${pct}%</div>
            <div class="score-label">${I18N.lang === 'vi' ? 'Chính xác' : 'Accuracy'}</div>
          </div>
        </div>
        <div>
          <div style="margin-bottom:1rem">
            <div style="font-size:2rem;font-weight:700;color:var(--mint)">${this._sessionCorrect}</div>
            <div style="font-size:0.75rem;color:var(--text-muted)">${I18N.t('fc_correct')}</div>
          </div>
          <div>
            <div style="font-size:2rem;font-weight:700;color:var(--coral)">${this._sessionIncorrect}</div>
            <div style="font-size:0.75rem;color:var(--text-muted)">${I18N.t('fc_incorrect')}</div>
          </div>
        </div>
      </div>

      <div style="display:flex;gap:1rem;justify-content:center;margin-top:2rem">
        <button class="btn btn-primary btn-lg" onclick="FlashcardsPage.startStudy('${this._activeDeck.id}')">
          <i data-lucide="refresh-cw"></i> ${I18N.lang === 'vi' ? 'Học lại' : 'Study Again'}
        </button>
        <button class="btn btn-ghost btn-lg" onclick="FlashcardsPage.exitStudy()">
          ${I18N.lang === 'vi' ? 'Về trang bộ thẻ' : 'Back to Decks'}
        </button>
      </div>
    </div>`;
  },

  _renderEditMode() {
    const deck = this._activeDeck;
    const subjects = Storage.getSubjects();
    return `
    <div class="animate-fadeIn">
      <div class="flex items-center gap-3 mb-6">
        <button class="btn btn-ghost btn-sm" onclick="FlashcardsPage.exitStudy()">
          <i data-lucide="arrow-left"></i> ${I18N.t('common_back')}
        </button>
        <h1 class="page-title" style="font-size:1.5rem">✏️ ${deck.name}</h1>
      </div>

      <!-- Deck settings -->
      <div class="card mb-4">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${I18N.t('fc_deck_name')}</label>
            <input class="form-input" id="edit-deck-name" value="${deck.name}">
          </div>
          <div class="form-group">
            <label class="form-label">${I18N.t('exam_subject')}</label>
            <select class="form-select" id="edit-deck-subject">
              <option value="">${I18N.t('common_none')}</option>
              ${subjects.map(s => `<option value="${s.id}" ${deck.subjectId===s.id?'selected':''}>${s.emoji} ${I18N.lang==='vi'?(s.nameVi||s.name):s.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="FlashcardsPage.saveDeckSettings()">
          <i data-lucide="save"></i> ${I18N.t('common_save')}
        </button>
      </div>

      <!-- Cards list -->
      <div class="flex items-center justify-between mb-3">
        <h2 style="font-size:1rem;font-weight:600">${I18N.lang==='vi'?'Các thẻ':'Cards'} (${(deck.cards||[]).length})</h2>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" onclick="FlashcardsPage.openOCRImport('${deck.id}')">
            <i data-lucide="scan-text"></i> OCR
          </button>
          <button class="btn btn-ghost btn-sm" onclick="FlashcardsPage.openBulkAddModal()">
            <i data-lucide="list-plus"></i> ${I18N.lang==='vi'?'Nhập nhanh':'Bulk Add'}
          </button>
          <button class="btn btn-primary btn-sm" onclick="FlashcardsPage.openAddCardModal()">
            <i data-lucide="plus"></i> ${I18N.t('fc_add_card')}
          </button>
        </div>
      </div>

      <div id="cards-list">
        ${(deck.cards || []).length === 0
          ? `<div class="empty-state"><p>${I18N.lang==='vi'?'Chưa có thẻ nào':'No cards yet'}</p></div>`
          : (deck.cards || []).map((c, i) => `
            <div class="card card-sm flex items-center gap-3 mb-2">
              <div style="flex:1">
                <div style="font-size:0.875rem;font-weight:500;color:var(--text-primary)">${c.front}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px">${c.back}</div>
              </div>
              <div style="display:flex;align-items:center;gap:0.5rem">
                <span class="badge" style="background:${SM2.getMasteryColor(c)}22;color:${SM2.getMasteryColor(c)};border:1px solid ${SM2.getMasteryColor(c)}44;font-size:10px">
                  ${SM2.getMastery(c) === 'new' ? (I18N.lang==='vi'?'Mới':'New') :
                    SM2.getMastery(c) === 'mastered' ? (I18N.lang==='vi'?'Thuộc':'Mastered') :
                    SM2.getMastery(c) === 'learning' ? (I18N.lang==='vi'?'Đang học':'Learning') : (I18N.lang==='vi'?'Ôn':'Review')}
                </span>
                <button class="btn btn-danger btn-sm btn-icon" onclick="FlashcardsPage.deleteCard(${i})">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </div>`).join('')}
      </div>
    </div>`;
  },

  _formatContent(text) {
    // Escape HTML but preserve math delimiters and newlines
    return (text || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\n/g, '<br>');
  },

  init() {
    if (window.lucide) lucide.createIcons();
  },

  startStudy(deckId) {
    const deck = Storage.getDeck(deckId);
    if (!deck) return;

    let queue = SM2.getDueCards(deck);
    if (queue.length === 0) {
      // If no due cards, study all (new cards first)
      queue = [...(deck.cards || [])];
    }
    if (queue.length === 0) {
      App.toast(I18N.lang === 'vi' ? 'Bộ thẻ này chưa có thẻ nào!' : 'This deck has no cards!', 'info');
      return;
    }

    // Shuffle queue
    queue = queue.sort(() => Math.random() - 0.5);

    this._activeDeck = deck;
    this._studyQueue = queue;
    this._studyIdx = 0;
    this._isFlipped = false;
    this._sessionCorrect = 0;
    this._sessionIncorrect = 0;
    this._mode = 'study';
    App.navigate('flashcards', false);

    // Log study session
    Storage.touchStreak();
    App._updateStreak();
  },

  flip() {
    this._isFlipped = !this._isFlipped;
    const card = document.getElementById('fc-card');
    const rating = document.getElementById('fc-rating');
    if (card)   card.classList.toggle('flipped', this._isFlipped);
    if (rating) rating.style.display = this._isFlipped ? 'block' : 'none';

    // Re-render math after flip
    setTimeout(() => App._renderMath(), 100);
  },

  rate(quality) {
    const deck = Storage.getDeck(this._activeDeck.id);
    if (!deck) return;

    const card = this._studyQueue[this._studyIdx];
    const updated = SM2.review(card, quality);

    // Update card in deck
    const cardIdx = deck.cards.findIndex(c => c.id === card.id);
    if (cardIdx >= 0) deck.cards[cardIdx] = updated;
    Storage.upsertDeck(deck);
    this._activeDeck = deck;

    // Track session stats
    if (quality >= 3) this._sessionCorrect++;
    else              this._sessionIncorrect++;

    this._studyIdx++;
    this._isFlipped = false;
    this._mode = 'study';
    App.navigate('flashcards', false);
    App._updateBadges();
  },

  exitStudy() {
    this._mode = 'decks';
    this._activeDeck = null;
    this._studyQueue = [];
    App.navigate('flashcards', false);
  },

  openEditDeck(deckId) {
    const deck = Storage.getDeck(deckId);
    if (!deck) return;
    this._activeDeck = deck;
    this._mode = 'edit';
    App.navigate('flashcards', false);
  },

  saveDeckSettings() {
    const deck = this._activeDeck;
    if (!deck) return;
    deck.name      = document.getElementById('edit-deck-name')?.value.trim() || deck.name;
    deck.subjectId = document.getElementById('edit-deck-subject')?.value || deck.subjectId;
    Storage.upsertDeck(deck);
    this._activeDeck = deck;
    App.toast(I18N.t('common_success'), 'success');
  },

  openNewDeckModal() {
    const subjects = Storage.getSubjects();
    App.openModal(`
      <div class="form-group">
        <label class="form-label">${I18N.t('fc_deck_name')}</label>
        <input class="form-input" id="new-deck-name" placeholder="${I18N.lang==='vi'?'vd: OOP — Chương 3':'e.g. DSA — Sorting Algorithms'}">
      </div>
      <div class="form-group">
        <label class="form-label">${I18N.t('exam_subject')}</label>
        <select class="form-select" id="new-deck-subject">
          <option value="">${I18N.t('common_none')}</option>
          ${subjects.map(s => `<option value="${s.id}">${s.emoji} ${I18N.lang==='vi'?(s.nameVi||s.name):s.name}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-primary w-full" onclick="FlashcardsPage.createNewDeck()">
        <i data-lucide="layers"></i> ${I18N.lang==='vi'?'Tạo bộ thẻ':'Create Deck'}
      </button>
    `, `🃏 ${I18N.t('fc_new_deck')}`);
  },

  createNewDeck() {
    const name = document.getElementById('new-deck-name')?.value.trim();
    if (!name) { App.toast(I18N.lang==='vi'?'Nhập tên bộ thẻ!':'Enter deck name!','error'); return; }
    const deck = {
      id:        Storage.generateId(),
      name,
      subjectId: document.getElementById('new-deck-subject')?.value || null,
      cards:     [],
      createdAt: new Date().toISOString(),
    };
    Storage.upsertDeck(deck);
    App.closeModal();
    App.toast(I18N.t('common_success'), 'success');
    this.openEditDeck(deck.id);
  },

  openAddCardModal() {
    App.openModal(`
      <div class="form-group">
        <label class="form-label">${I18N.t('fc_front')}</label>
        <textarea class="form-textarea" id="card-front" placeholder="${I18N.lang==='vi'?'Câu hỏi, khái niệm... (hỗ trợ $toán$)':'Question, concept... (supports $math$)'}"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">${I18N.t('fc_back')}</label>
        <textarea class="form-textarea" id="card-back" placeholder="${I18N.lang==='vi'?'Đáp án, định nghĩa...':'Answer, definition...'}"></textarea>
      </div>
      <button class="btn btn-primary w-full" onclick="FlashcardsPage.addCard()">
        <i data-lucide="plus"></i> ${I18N.lang==='vi'?'Thêm thẻ':'Add Card'}
      </button>
    `, `➕ ${I18N.t('fc_add_card')}`);
  },

  addCard() {
    const front = document.getElementById('card-front')?.value.trim();
    const back  = document.getElementById('card-back')?.value.trim();
    if (!front || !back) { App.toast(I18N.lang==='vi'?'Nhập cả hai mặt thẻ!':'Enter both sides!','error'); return; }

    const deck = Storage.getDeck(this._activeDeck.id);
    if (!deck) return;
    deck.cards = [...(deck.cards || []), SM2.newCard(front, back)];
    Storage.upsertDeck(deck);
    this._activeDeck = deck;
    App.closeModal();
    App.toast(I18N.t('common_success'), 'success');
    App.navigate('flashcards', false);
  },

  deleteCard(idx) {
    const deck = Storage.getDeck(this._activeDeck.id);
    if (!deck) return;
    deck.cards.splice(idx, 1);
    Storage.upsertDeck(deck);
    this._activeDeck = deck;
    App.navigate('flashcards', false);
  },

  deleteDeck(deckId) {
    App.confirm(I18N.t('common_confirm_delete'), () => {
      Storage.deleteDeck(deckId);
      App._updateBadges();
      App.navigate('flashcards', false);
      App.toast(I18N.lang==='vi'?'Đã xóa bộ thẻ':'Deck deleted','success');
    });
  },

  openOCRImport(deckId = null) {
    const settings = Storage.getSettings();
    App.openModal(`
      <div class="ocr-dropzone" id="ocr-drop" onclick="document.getElementById('ocr-file').click()">
        <div class="ocr-dropzone-icon">📷</div>
        <h3>${I18N.lang==='vi'?'Chụp/tải ảnh ghi chú':'Upload your handwritten notes'}</h3>
        <p>${I18N.lang==='vi'?'Hỗ trợ: JPG, PNG, PDF':'Supports: JPG, PNG, PDF'}</p>
        <input type="file" id="ocr-file" accept=".jpg,.jpeg,.png,.pdf" style="display:none" onchange="FlashcardsPage.processOCRFile(this.files[0],'${deckId||''}')">
      </div>
      <div id="ocr-result" style="display:none;margin-top:1rem">
        <label class="form-label">${I18N.lang==='vi'?'Văn bản nhận dạng (chỉnh sửa nếu cần):':'Recognized text (edit if needed):'}</label>
        <textarea class="form-textarea" id="ocr-text" style="min-height:150px"></textarea>
        <p style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem">
          ${I18N.lang==='vi'?'Mỗi dòng sẽ thành một thẻ (câu hỏi → đáp án cách nhau bằng "|")':'Each line becomes a card (question | answer separated by "|")'}
        </p>
        <button class="btn btn-primary w-full mt-2" onclick="FlashcardsPage.importOCRCards('${deckId||''}')">
          <i data-lucide="layers"></i> ${I18N.lang==='vi'?'Tạo thẻ từ văn bản':'Create cards from text'}
        </button>
      </div>
      <div id="ocr-loading" style="display:none;text-align:center;padding:2rem">
        <div style="font-size:2rem;margin-bottom:0.5rem">⚙️</div>
        <p>${I18N.lang==='vi'?'Đang nhận dạng chữ...':'Running OCR...'}</p>
        <p style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem">
          ${I18N.lang==='vi'?'(Backend cần chạy trước)':'(Backend must be running)'}
        </p>
      </div>
    `, `🔍 ${I18N.t('fc_ocr_import')}`);
  },

  async processOCRFile(file, deckId) {
    if (!file) return;
    document.getElementById('ocr-loading').style.display = 'block';
    document.getElementById('ocr-drop').style.display = 'none';

    const settings = Storage.getSettings();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${settings.backendUrl}/api/ocr/image`, { method:'POST', body:formData });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      document.getElementById('ocr-loading').style.display = 'none';
      document.getElementById('ocr-result').style.display  = 'block';
      document.getElementById('ocr-text').value = data.text || '';
    } catch(e) {
      document.getElementById('ocr-loading').style.display = 'none';
      document.getElementById('ocr-drop').style.display = 'block';
      App.toast(I18N.t('ai_backend_off'), 'error', 5000);
    }
  },

  importOCRCards(deckId) {
    const text = document.getElementById('ocr-text')?.value.trim();
    if (!text) return;

    const lines = text.split('\n').filter(l => l.trim());
    const cards = lines.map(line => {
      const parts = line.split('|');
      if (parts.length >= 2) return SM2.newCard(parts[0].trim(), parts.slice(1).join('|').trim());
      return SM2.newCard(line.trim(), I18N.lang==='vi'?'(Chưa có đáp án)':'(No answer yet)');
    });

    if (!deckId) {
      // Create a new deck
      const deck = { id: Storage.generateId(), name: `OCR Import ${new Date().toLocaleDateString()}`, subjectId: null, cards, createdAt: new Date().toISOString() };
      Storage.upsertDeck(deck);
    } else {
      const deck = Storage.getDeck(deckId);
      if (deck) { deck.cards = [...(deck.cards||[]), ...cards]; Storage.upsertDeck(deck); }
    }

    App.closeModal();
    App._updateBadges();
    App.toast(`${I18N.lang==='vi'?'Đã tạo':'Created'} ${cards.length} ${I18N.lang==='vi'?'thẻ':'cards'}!`, 'success');
    App.navigate('flashcards', false);
  },

  openBulkAddModal() {
    const lang = I18N.lang;
    App.openModal(`
      <div class="form-group">
        <label class="form-label">${lang === 'vi' ? 'Chọn chế độ nhập' : 'Select import mode'}</label>
        <select class="form-select" id="bulk-import-mode" onchange="FlashcardsPage.onBulkModeChange(this.value)">
          <option value="delimited">${lang === 'vi' ? 'Mỗi dòng một thẻ (ngăn cách bởi |)' : 'One card per line (separated by |)'}</option>
          <option value="oddeven">${lang === 'vi' ? 'Dòng lẻ là câu hỏi, dòng chẵn là đáp án' : 'Odd lines for Front, Even lines for Back'}</option>
        </select>
      </div>

      <div class="form-group" id="bulk-delimiter-group">
        <label class="form-label">${lang === 'vi' ? 'Ký tự ngăn cách' : 'Delimiter'}</label>
        <input class="form-input" id="bulk-delimiter" value="|" style="width: 80px;">
      </div>

      <div class="form-group">
        <label class="form-label">${lang === 'vi' ? 'Nội dung nhập' : 'Paste content'}</label>
        <textarea class="form-textarea" id="bulk-textarea" style="min-height: 200px;" 
          placeholder="${lang === 'vi' ? 'Câu hỏi 1 | Đáp án 1\nCâu hỏi 2 | Đáp án 2' : 'Question 1 | Answer 1\nQuestion 2 | Answer 2'}"></textarea>
      </div>

      <button class="btn btn-primary w-full" onclick="FlashcardsPage.importBulkCards()">
        <i data-lucide="check"></i> ${lang === 'vi' ? 'Nhập thẻ' : 'Import Cards'}
      </button>
    `, `📥 ${lang === 'vi' ? 'Nhập hàng loạt flashcard' : 'Bulk Import Flashcards'}`);
    if (window.lucide) lucide.createIcons();
  },

  onBulkModeChange(mode) {
    const delimiterGroup = document.getElementById('bulk-delimiter-group');
    const textarea = document.getElementById('bulk-textarea');
    const lang = I18N.lang;
    if (!textarea) return;
    if (mode === 'oddeven') {
      if (delimiterGroup) delimiterGroup.style.display = 'none';
      textarea.placeholder = lang === 'vi' ? 'Câu hỏi 1\nĐáp án 1\nCâu hỏi 2\nĐáp án 2' : 'Question 1\nAnswer 1\nQuestion 2\nAnswer 2';
    } else {
      if (delimiterGroup) delimiterGroup.style.display = 'block';
      textarea.placeholder = lang === 'vi' ? 'Câu hỏi 1 | Đáp án 1\nCâu hỏi 2 | Đáp án 2' : 'Question 1 | Answer 1\nQuestion 2 | Answer 2';
    }
  },

  importBulkCards() {
    const deck = Storage.getDeck(this._activeDeck.id);
    if (!deck) return;

    const mode = document.getElementById('bulk-import-mode')?.value;
    const text = document.getElementById('bulk-textarea')?.value || '';
    const newCards = [];

    if (mode === 'oddeven') {
      const lines = text.split('\n').map(l => l.trim());
      for (let i = 0; i < lines.length; i += 2) {
        const front = lines[i];
        const back = lines[i + 1] || '';
        if (front) {
          newCards.push(SM2.newCard(front, back));
        }
      }
    } else {
      const delimiter = document.getElementById('bulk-delimiter')?.value || '|';
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      for (const line of lines) {
        const parts = line.split(delimiter);
        const front = parts[0]?.trim();
        const back = parts.slice(1).join(delimiter)?.trim() || '';
        if (front) {
          newCards.push(SM2.newCard(front, back));
        }
      }
    }

    if (newCards.length === 0) {
      App.toast(I18N.lang === 'vi' ? 'Không tìm thấy thẻ hợp lệ!' : 'No valid cards found!', 'error');
      return;
    }

    deck.cards = [...(deck.cards || []), ...newCards];
    Storage.upsertDeck(deck);
    this._activeDeck = deck;
    App.closeModal();
    App.toast(`${I18N.lang === 'vi' ? 'Đã thêm' : 'Added'} ${newCards.length} ${I18N.lang === 'vi' ? 'thẻ!' : 'cards!'}`, 'success');
    App.navigate('flashcards', false);
  },

  destroy() {
    this._mode = 'decks';
  },
};
