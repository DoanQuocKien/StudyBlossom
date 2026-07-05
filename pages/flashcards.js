// ============================================================
// StudyBlossom 🌸 — Flashcards Page (SM-2 Spaced Repetition)
// ============================================================

const FlashcardsPage = {
  _mode: 'decks',   // 'decks' | 'study' | 'edit'
  _activeDeck: null,
  _studyQueue: [],
  _studyIdx: 0,
  _isFlipped: false,
  _sessionCorrect: 0,
  _sessionIncorrect: 0,
  // Add-card modal state
  _addTab: 'manual',        // 'manual' | 'ai'
  _addSubTab: 'standard',   // 'standard' | 'bulk'
  _bulkMode: 'oddeven',     // 'oddeven' | 'twopanel'
  _aiSource: 'notes',       // 'notes' | 'upload'
  _aiNumCards: 10,
  _aiVerifyCards: null,     // array of {front, back} while in verify step
  _miniFlipped: false,

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
    this._miniFlipped = false;
    this._aiVerifyCards = null;
    App.openModal(this._buildAddCardModal(), `➕ ${I18N.t('fc_add_card')}`);
    if (window.lucide) lucide.createIcons();
  },

  _buildAddCardModal() {
    const lang = I18N.lang;
    const isManual = this._addTab === 'manual';
    const isAI     = this._addTab === 'ai';

    return `
    <div class="fc-add-tabs">
      <button class="fc-add-tab ${isManual ? 'active' : ''}" onclick="FlashcardsPage._switchAddTab('manual')">
        ✏️ ${lang === 'vi' ? 'Nhập tay' : 'Manual'}
      </button>
      <button class="fc-add-tab ${isAI ? 'active' : ''}" onclick="FlashcardsPage._switchAddTab('ai')">
        🤖 ${lang === 'vi' ? 'AI hỗ trợ' : 'AI Assisted'}
      </button>
    </div>
    <div id="fc-add-body">
      ${isManual ? this._buildManualTab() : this._buildAITab()}
    </div>`;
  },

  _switchAddTab(tab) {
    this._addTab = tab;
    this._miniFlipped = false;
    this._aiVerifyCards = null;
    const body = document.getElementById('fc-add-body');
    if (body) body.innerHTML = tab === 'manual' ? this._buildManualTab() : this._buildAITab();
    if (window.lucide) lucide.createIcons();
  },

  // ──────────────────────────────────────────────────────────────
  // MANUAL TAB
  // ──────────────────────────────────────────────────────────────
  _buildManualTab() {
    const lang = I18N.lang;
    const isStd  = this._addSubTab === 'standard';
    const isBulk = this._addSubTab === 'bulk';
    return `
    <div class="fc-sub-tabs">
      <button class="fc-sub-tab ${isStd  ? 'active' : ''}" onclick="FlashcardsPage._switchSubTab('standard')">
        🃏 ${lang === 'vi' ? 'Thẻ đơn' : 'Single Card'}
      </button>
      <button class="fc-sub-tab ${isBulk ? 'active' : ''}" onclick="FlashcardsPage._switchSubTab('bulk')">
        📋 ${lang === 'vi' ? 'Nhập hàng loạt' : 'Bulk Paste'}
      </button>
    </div>
    ${isStd ? this._buildStandardCard() : this._buildBulkPaste()}`;
  },

  _switchSubTab(sub) {
    this._addSubTab = sub;
    this._miniFlipped = false;
    const body = document.getElementById('fc-add-body');
    if (body) body.innerHTML = this._buildManualTab();
    if (window.lucide) lucide.createIcons();
  },

  _buildStandardCard() {
    const lang = I18N.lang;
    return `
    <div class="form-group">
      <label class="form-label">${I18N.t('fc_front')}</label>
      <textarea class="form-textarea" id="card-front" rows="2"
        placeholder="${lang === 'vi' ? 'Câu hỏi, khái niệm... (hỗ trợ $toán$)' : 'Question, concept... (supports $math$)'}"
        oninput="FlashcardsPage._updateMiniPreview()"></textarea>
    </div>
    <div class="form-group">
      <label class="form-label">${I18N.t('fc_back')}</label>
      <textarea class="form-textarea" id="card-back" rows="2"
        placeholder="${lang === 'vi' ? 'Đáp án, định nghĩa...' : 'Answer, definition...'}"
        oninput="FlashcardsPage._updateMiniPreview()"></textarea>
    </div>

    <!-- Live 3D Card Preview -->
    <p style="font-size:0.7rem;color:var(--text-muted);text-align:center;margin-bottom:0.25rem">
      ${lang === 'vi' ? '👆 Nhấn thẻ để lật xem trước' : '👆 Click card to preview flip'}
    </p>
    <div class="fc-mini-preview-scene" onclick="FlashcardsPage._flipMiniCard()">
      <div class="fc-mini-card${this._miniFlipped ? ' flipped' : ''}" id="fc-mini-card">
        <div class="fc-mini-face front">
          <div class="fc-mini-label">${lang === 'vi' ? 'CÂU HỎI' : 'QUESTION'}</div>
          <div class="fc-mini-content" id="fc-mini-front">${lang === 'vi' ? 'Nhập mặt trước...' : 'Enter front...'}</div>
        </div>
        <div class="fc-mini-face back">
          <div class="fc-mini-label">${lang === 'vi' ? 'ĐÁP ÁN' : 'ANSWER'}</div>
          <div class="fc-mini-content" id="fc-mini-back">${lang === 'vi' ? 'Nhập mặt sau...' : 'Enter back...'}</div>
        </div>
      </div>
    </div>

    <button class="btn btn-primary w-full" onclick="FlashcardsPage.addCard()">
      <i data-lucide="plus"></i> ${lang === 'vi' ? 'Thêm thẻ' : 'Add Card'}
    </button>`;
  },

  _updateMiniPreview() {
    const front = document.getElementById('card-front')?.value.trim();
    const back  = document.getElementById('card-back')?.value.trim();
    const fEl = document.getElementById('fc-mini-front');
    const bEl = document.getElementById('fc-mini-back');
    const lang = I18N.lang;
    if (fEl) fEl.textContent = front || (lang === 'vi' ? 'Nhập mặt trước...' : 'Enter front...');
    if (bEl) bEl.textContent = back  || (lang === 'vi' ? 'Nhập mặt sau...'  : 'Enter back...');
  },

  _flipMiniCard() {
    this._miniFlipped = !this._miniFlipped;
    const card = document.getElementById('fc-mini-card');
    if (card) card.classList.toggle('flipped', this._miniFlipped);
  },

  _buildBulkPaste() {
    const lang   = I18N.lang;
    const isOE   = this._bulkMode === 'oddeven';
    const is2P   = this._bulkMode === 'twopanel';
    return `
    <div class="fc-sub-tabs" style="margin-bottom:0.75rem">
      <button class="fc-sub-tab ${isOE ? 'active' : ''}" onclick="FlashcardsPage._setBulkMode('oddeven')">
        ${lang === 'vi' ? '↕ Dòng lẻ/chẵn' : '↕ Odd/Even Lines'}
      </button>
      <button class="fc-sub-tab ${is2P ? 'active' : ''}" onclick="FlashcardsPage._setBulkMode('twopanel')">
        ${lang === 'vi' ? '⧉ Hai cột' : '⧉ Two Panels'}
      </button>
    </div>

    ${isOE ? `
      <p style="font-size:0.72rem;color:var(--text-muted);margin-bottom:0.5rem">
        ${lang === 'vi' ? 'Dòng lẻ = mặt trước, dòng chẵn = mặt sau. Mỗi cặp 2 dòng = 1 thẻ.' : 'Odd lines = front, even lines = back. Every 2 lines = 1 card.'}
      </p>
      <textarea class="form-textarea" id="bulk-oe-text" style="min-height:180px;"
        placeholder="${lang === 'vi' ? 'Hàm số là gì?\nHàm số y=f(x) là...\nĐạo hàm là gì?\nĐạo hàm là...' : 'What is a function?\nA function is y=f(x)...\nWhat is derivative?\nDerivative is...'}"
      ></textarea>
    ` : `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:0.4rem">
        <label style="font-size:0.72rem;font-weight:600;color:var(--purple)">${lang === 'vi' ? '🔵 Mặt trước (mỗi dòng 1 câu)' : '🔵 Front (one per line)'}</label>
        <label style="font-size:0.72rem;font-weight:600;color:var(--coral)">${lang === 'vi' ? '🔴 Mặt sau (mỗi dòng 1 câu)' : '🔴 Back (one per line)'}</label>
      </div>
      <div class="fc-two-panel">
        <textarea class="form-textarea" id="bulk-2p-front" style="min-height:180px;"
          placeholder="${lang === 'vi' ? 'Hàm số là gì?\nĐạo hàm là gì?\nGiới hạn là gì?' : 'What is a function?\nWhat is derivative?\nWhat is limit?'}"
        ></textarea>
        <textarea class="form-textarea" id="bulk-2p-back" style="min-height:180px;"
          placeholder="${lang === 'vi' ? 'Hàm số y=f(x)...\nĐạo hàm f\u0027(x)...\nGiới hạn khi x→a...' : 'Function is y=f(x)...\nDerivative f\u0027(x)...\nLimit as x→a...'}"
        ></textarea>
      </div>
    `}

    <button class="btn btn-primary w-full mt-4" onclick="FlashcardsPage.importBulkCards()">
      <i data-lucide="check"></i> ${lang === 'vi' ? 'Nhập thẻ' : 'Import Cards'}
    </button>`;
  },

  _setBulkMode(mode) {
    this._bulkMode = mode;
    const body = document.getElementById('fc-add-body');
    if (body) body.innerHTML = this._buildManualTab();
    if (window.lucide) lucide.createIcons();
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

  importBulkCards() {
    const deck = Storage.getDeck(this._activeDeck.id);
    if (!deck) return;
    const lang = I18N.lang;
    let newCards = [];

    if (this._bulkMode === 'oddeven') {
      const lines = (document.getElementById('bulk-oe-text')?.value || '').split('\n').map(l => l.trim());
      for (let i = 0; i + 1 < lines.length; i += 2) {
        const front = lines[i]; const back = lines[i + 1];
        if (front) newCards.push(SM2.newCard(front, back || ''));
      }
    } else {
      const fronts = (document.getElementById('bulk-2p-front')?.value || '').split('\n').map(l => l.trim());
      const backs  = (document.getElementById('bulk-2p-back')?.value  || '').split('\n').map(l => l.trim());
      const len = Math.max(fronts.length, backs.length);
      for (let i = 0; i < len; i++) {
        const front = fronts[i] || ''; const back = backs[i] || '';
        if (front) newCards.push(SM2.newCard(front, back));
      }
    }

    if (newCards.length === 0) {
      App.toast(lang === 'vi' ? 'Không tìm thấy thẻ hợp lệ!' : 'No valid cards found!', 'error');
      return;
    }

    deck.cards = [...(deck.cards || []), ...newCards];
    Storage.upsertDeck(deck);
    this._activeDeck = deck;
    App.closeModal();
    App.toast(`${lang === 'vi' ? 'Đã thêm' : 'Added'} ${newCards.length} ${lang === 'vi' ? 'thẻ!' : 'cards!'}`, 'success');
    App.navigate('flashcards', false);
  },

  // ──────────────────────────────────────────────────────────────
  // AI ASSISTED TAB
  // ──────────────────────────────────────────────────────────────
  _buildAITab() {
    const lang = I18N.lang;
    const settings = Storage.getSettings();
    const notes = Storage.getNotes();
    const isNotes  = this._aiSource === 'notes';
    const isUpload = this._aiSource === 'upload';

    if (this._aiVerifyCards) {
      return this._buildVerifyStep();
    }

    return `
    <!-- Source selector -->
    <label style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);margin-bottom:0.5rem;display:block">
      ${lang === 'vi' ? 'Nguồn tài liệu' : 'Source Material'}
    </label>
    <div class="fc-ai-sources">
      <button class="fc-ai-source-card ${isNotes ? 'active' : ''}" onclick="FlashcardsPage._setAISource('notes')">
        <div class="src-icon">📓</div>
        <div class="src-label">${lang === 'vi' ? 'Từ ghi chú' : 'From Notes'}</div>
      </button>
      <button class="fc-ai-source-card ${isUpload ? 'active' : ''}" onclick="FlashcardsPage._setAISource('upload')">
        <div class="src-icon">📷</div>
        <div class="src-label">${lang === 'vi' ? 'Upload tài liệu' : 'Upload Material'}</div>
      </button>
    </div>

    <!-- Notes selector -->
    ${isNotes ? `
    <div class="form-group">
      <label class="form-label">${lang === 'vi' ? 'Chọn ghi chú' : 'Select Note'}</label>
      <select class="form-select" id="ai-note-select">
        <option value="">${lang === 'vi' ? '-- Chọn ghi chú --' : '-- Select a note --'}</option>
        ${notes.map(n => `<option value="${n.id}">${n.title || (lang === 'vi' ? 'Ghi chú không tiêu đề' : 'Untitled Note')}</option>`).join('')}
      </select>
    </div>` : `
    <!-- Upload dropzone -->
    <div class="ocr-dropzone" id="ai-ocr-drop" onclick="document.getElementById('ai-ocr-file').click()">
      <div class="ocr-dropzone-icon">📷</div>
      <h3>${lang === 'vi' ? 'Chụp/tải ảnh hoặc PDF' : 'Upload image or PDF'}</h3>
      <p>${lang === 'vi' ? 'Hỗ trợ: JPG, PNG, PDF' : 'Supports: JPG, PNG, PDF'}</p>
      <input type="file" id="ai-ocr-file" accept=".jpg,.jpeg,.png,.pdf" style="display:none"
        onchange="FlashcardsPage._handleAIOCR(this.files[0])">
    </div>
    <div id="ai-ocr-status" style="display:none;text-align:center;padding:1rem;color:var(--text-muted);font-size:0.85rem">
      ⚙️ ${lang === 'vi' ? 'Đang nhận dạng chữ...' : 'Running OCR...'}
    </div>
    <textarea class="form-textarea" id="ai-ocr-text" style="min-height:100px;margin-top:0.75rem;display:none"
      placeholder="${lang === 'vi' ? 'Văn bản được nhận dạng (có thể chỉnh sửa)' : 'Recognized text (editable)'}"></textarea>
    `}

    <!-- Card count -->
    <div class="form-group" style="margin-top:1rem">
      <label class="form-label" style="display:flex;justify-content:space-between">
        <span>${lang === 'vi' ? 'Số thẻ muốn tạo' : 'Number of cards'}</span>
        <span style="color:var(--purple);font-weight:700" id="ai-num-label">${this._aiNumCards}</span>
      </label>
      <input type="range" class="fc-count-slider" id="ai-num-cards"
        min="3" max="30" value="${this._aiNumCards}"
        oninput="FlashcardsPage._updateCardCount(this.value)">
      <div style="display:flex;justify-content:space-between;font-size:0.65rem;color:var(--text-muted)">
        <span>3</span><span>10</span><span>20</span><span>30</span>
      </div>
    </div>

    <button class="btn btn-primary w-full" id="ai-generate-btn" onclick="FlashcardsPage._generateAICards()">
      <i data-lucide="sparkles"></i> ${lang === 'vi' ? 'Tạo thẻ với AI' : 'Generate Cards with AI'}
    </button>
    <p style="font-size:0.7rem;color:var(--text-muted);text-align:center;margin-top:0.5rem">
      ${lang === 'vi' ? '(Cần Backend + Ollama đang chạy)' : '(Requires Backend + Ollama running)'}
    </p>`;
  },

  _setAISource(src) {
    this._aiSource = src;
    const body = document.getElementById('fc-add-body');
    if (body) body.innerHTML = this._buildAITab();
    if (window.lucide) lucide.createIcons();
  },

  _updateCardCount(val) {
    this._aiNumCards = parseInt(val);
    const label = document.getElementById('ai-num-label');
    if (label) label.textContent = val;
  },

  async _handleAIOCR(file) {
    if (!file) return;
    const settings = Storage.getSettings();
    const dropzone = document.getElementById('ai-ocr-drop');
    const status   = document.getElementById('ai-ocr-status');
    const textArea = document.getElementById('ai-ocr-text');
    if (dropzone) dropzone.style.display = 'none';
    if (status)   status.style.display = 'block';

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${settings.backendUrl}/api/ocr/image`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (textArea) { textArea.value = data.text || ''; textArea.style.display = 'block'; }
      if (status)   status.style.display = 'none';
    } catch(e) {
      if (status)   status.style.display = 'none';
      if (dropzone) dropzone.style.display = 'block';
      App.toast(I18N.t('ai_backend_off'), 'error', 5000);
    }
  },

  async _generateAICards() {
    const lang = I18N.lang;
    const settings = Storage.getSettings();
    let text = '';

    if (this._aiSource === 'notes') {
      const noteId = document.getElementById('ai-note-select')?.value;
      if (!noteId) { App.toast(lang === 'vi' ? 'Hãy chọn một ghi chú!' : 'Please select a note!', 'error'); return; }
      const note = Storage.getNoteById(noteId);
      if (note) {
        // Flatten blocks to plain text
        text = (note.blocks || []).map(b => {
          if (b.type === 'text')  return b.content || '';
          if (b.type === 'code')  return b.content || '';
          if (b.type === 'math')  return b.content || '';
          if (b.type === 'table') return (b.rows || []).map(r => r.join(' ')).join(' ');
          return '';
        }).join('\n').trim();
        if (!text) { App.toast(lang === 'vi' ? 'Ghi chú này chưa có nội dung!' : 'This note is empty!', 'error'); return; }
      }
    } else {
      text = document.getElementById('ai-ocr-text')?.value.trim() || '';
      if (!text) { App.toast(lang === 'vi' ? 'Chưa có văn bản. Hãy upload tài liệu trước!' : 'No text found. Please upload a document first!', 'error'); return; }
    }

    const btn = document.getElementById('ai-generate-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = `<i data-lucide="loader"></i> ${lang === 'vi' ? 'Đang tạo...' : 'Generating...'}`; if (window.lucide) lucide.createIcons(); }

    try {
      const res = await fetch(`${settings.backendUrl}/api/quiz/generate-cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, num_cards: this._aiNumCards, language: lang }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (!data.cards || data.cards.length === 0) throw new Error('No cards returned');

      this._aiVerifyCards = data.cards;
      const body = document.getElementById('fc-add-body');
      if (body) body.innerHTML = this._buildVerifyStep();
      if (window.lucide) lucide.createIcons();
    } catch(e) {
      App.toast(`${lang === 'vi' ? 'Lỗi tạo thẻ: ' : 'Generation error: '}${e.message}`, 'error', 5000);
      if (btn) { btn.disabled = false; btn.innerHTML = `<i data-lucide="sparkles"></i> ${lang === 'vi' ? 'Tạo thẻ với AI' : 'Generate Cards with AI'}`; if (window.lucide) lucide.createIcons(); }
    }
  },

  _buildVerifyStep() {
    const lang  = I18N.lang;
    const cards = this._aiVerifyCards || [];
    return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem">
      <div>
        <div style="font-weight:700;font-size:0.9rem">${lang === 'vi' ? '✅ Xác nhận thẻ được tạo' : '✅ Verify Generated Cards'}</div>
        <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px">
          ${cards.length} ${lang === 'vi' ? 'thẻ — Chỉnh sửa nếu cần, bỏ tick để bỏ qua' : 'cards — Edit if needed, uncheck to skip'}
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="FlashcardsPage._switchAddTab('ai')">
        <i data-lucide="arrow-left"></i> ${lang === 'vi' ? 'Tạo lại' : 'Regenerate'}
      </button>
    </div>

    <div class="fc-verify-list" id="fc-verify-list">
      ${cards.map((c, i) => `
      <div class="fc-verify-item selected" id="verify-item-${i}">
        <input type="checkbox" class="fc-verify-check" id="verify-chk-${i}" checked
          onchange="FlashcardsPage._toggleVerifyItem(${i}, this.checked)">
        <div>
          <div style="font-size:0.65rem;color:var(--purple);font-weight:600;margin-bottom:2px">${lang === 'vi' ? 'MẶT TRƯỚC' : 'FRONT'}</div>
          <textarea class="fc-verify-input" id="verify-front-${i}" rows="2">${c.front}</textarea>
        </div>
        <div>
          <div style="font-size:0.65rem;color:var(--coral);font-weight:600;margin-bottom:2px">${lang === 'vi' ? 'MẶT SAU' : 'BACK'}</div>
          <textarea class="fc-verify-input" id="verify-back-${i}" rows="2">${c.back}</textarea>
        </div>
      </div>`).join('')}
    </div>

    <div style="display:flex;gap:0.75rem;margin-top:1rem">
      <button class="btn btn-primary flex-1" onclick="FlashcardsPage._importVerifiedCards()">
        <i data-lucide="check"></i> ${lang === 'vi' ? 'Thêm thẻ đã chọn' : 'Add Selected Cards'}
      </button>
    </div>`;
  },

  _toggleVerifyItem(i, checked) {
    const item = document.getElementById(`verify-item-${i}`);
    if (item) item.classList.toggle('selected', checked);
  },

  _importVerifiedCards() {
    const deck = Storage.getDeck(this._activeDeck.id);
    if (!deck) return;
    const lang  = I18N.lang;
    const cards = this._aiVerifyCards || [];
    const newCards = [];

    for (let i = 0; i < cards.length; i++) {
      const chk = document.getElementById(`verify-chk-${i}`);
      if (!chk?.checked) continue;
      const front = document.getElementById(`verify-front-${i}`)?.value.trim();
      const back  = document.getElementById(`verify-back-${i}`)?.value.trim();
      if (front) newCards.push(SM2.newCard(front, back || ''));
    }

    if (newCards.length === 0) {
      App.toast(lang === 'vi' ? 'Chưa chọn thẻ nào!' : 'No cards selected!', 'error');
      return;
    }

    deck.cards = [...(deck.cards || []), ...newCards];
    Storage.upsertDeck(deck);
    this._activeDeck = deck;
    this._aiVerifyCards = null;
    App.closeModal();
    App.toast(`${lang === 'vi' ? 'Đã thêm' : 'Added'} ${newCards.length} ${lang === 'vi' ? 'thẻ từ AI!' : 'AI cards!'}`, 'success');
    App._updateBadges();
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


  destroy(nextPage) {
    // Only reset to deck list when navigating AWAY from flashcards
    if (nextPage !== 'flashcards') {
      this._mode = 'decks';
      this._activeDeck = null;
      this._studyQueue = [];
      this._aiVerifyCards = null;
    }
  },
};
