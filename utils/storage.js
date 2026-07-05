// ============================================================
// StudyBlossom 🌸 — Storage Utility
// All localStorage operations go through here
// ============================================================

const DEFAULT_SUBJECTS = [
  { id: 'oop', name: 'OOP', nameVi: 'Lập trình hướng đối tượng', color: '#a78bfa', emoji: '💻', progress: 0, topics: [] },
  { id: 'dsa', name: 'DSA', nameVi: 'Cấu trúc dữ liệu & Giải thuật', color: '#6ee7b7', emoji: '🌳', progress: 0, topics: [] },
  { id: 'dc', name: 'Digital Circuits', nameVi: 'Nhập môn Mạch số', color: '#fbbf24', emoji: '⚡', progress: 0, topics: [] },
  { id: 'dm', name: 'Discrete Math', nameVi: 'Toán rời rạc', color: '#fb7185', emoji: '🔢', progress: 0, topics: [] },
  { id: 'ps', name: 'Prob & Stats', nameVi: 'Xác suất thống kê', color: '#60a5fa', emoji: '📊', progress: 0, topics: [] },
];

const DEFAULT_SETTINGS = {
  name: 'Bạn',
  language: 'vi',
  pomodoroWork: 25,
  pomodoroShort: 5,
  pomodoroLong: 15,
  backendUrl: 'http://localhost:8000',
  theme: 'dark',
};

// Run prefix migration from studybloom_ to studyblossom_ to prevent data loss
(() => {
  const oldPrefix = 'studybloom_';
  const newPrefix = 'studyblossom_';
  try {
    const keysToMigrate = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(oldPrefix)) {
        keysToMigrate.push(key);
      }
    }
    keysToMigrate.forEach(key => {
      const newKey = newPrefix + key.substring(oldPrefix.length);
      if (!localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, localStorage.getItem(key));
      }
    });
  } catch (e) {
    console.error('[Storage] Prefix migration failed:', e);
  }
})();

const Storage = {
  PREFIX: 'studyblossom_',

  _get(key) {
    try {
      const raw = localStorage.getItem(this.PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  _set(key, value) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('[Storage] Write error:', e);
      return false;
    }
  },

  _remove(key) {
    localStorage.removeItem(this.PREFIX + key);
  },

  // ── Settings ──────────────────────────────────────────────
  getSettings() { return { ...DEFAULT_SETTINGS, ...(this._get('settings') || {}) }; },
  saveSettings(s) { this._set('settings', s); },

  // ── Subjects ──────────────────────────────────────────────
  getSubjects() { return this._get('subjects') || JSON.parse(JSON.stringify(DEFAULT_SUBJECTS)); },
  saveSubjects(s) { this._set('subjects', s); },

  getSubjectById(id) { return this.getSubjects().find(s => s.id === id) || null; },

  upsertSubject(subject) {
    const subjects = this.getSubjects();
    const idx = subjects.findIndex(s => s.id === subject.id);
    if (idx >= 0) subjects[idx] = subject;
    else subjects.push(subject);
    this.saveSubjects(subjects);
  },

  deleteSubject(id) {
    this.saveSubjects(this.getSubjects().filter(s => s.id !== id));
  },

  // ── Flashcard Decks ───────────────────────────────────────
  getDecks() { return this._get('flashcard_decks') || []; },
  saveDecks(d) { this._set('flashcard_decks', d); },

  getDeck(deckId) { return this.getDecks().find(d => d.id === deckId) || null; },

  upsertDeck(deck) {
    const decks = this.getDecks();
    const idx = decks.findIndex(d => d.id === deck.id);
    if (idx >= 0) decks[idx] = deck;
    else decks.push(deck);
    this.saveDecks(decks);
  },

  deleteDeck(deckId) { this.saveDecks(this.getDecks().filter(d => d.id !== deckId)); },

  // Count due cards across all decks
  countDueCards() {
    const now = new Date();
    return this.getDecks().reduce((total, deck) => {
      return total + (deck.cards || []).filter(c => !c.nextReview || new Date(c.nextReview) <= now).length;
    }, 0);
  },

  // ── Notes ─────────────────────────────────────────────────
  getNotes() { return this._get('notes') || []; },
  saveNotes(n) { this._set('notes', n); },

  getNoteById(id) { return this.getNotes().find(n => n.id === id) || null; },

  upsertNote(note) {
    const notes = this.getNotes();
    const idx = notes.findIndex(n => n.id === note.id);
    if (idx >= 0) notes[idx] = { ...note, updatedAt: new Date().toISOString() };
    else notes.push({ ...note, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    this.saveNotes(notes);
  },

  deleteNote(id) { this.saveNotes(this.getNotes().filter(n => n.id !== id)); },

  searchNotes(query) {
    const q = query.toLowerCase();
    return this.getNotes().filter(n =>
      n.title.toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q)
    );
  },

  // ── Exams ─────────────────────────────────────────────────
  getExams() { return this._get('exams') || []; },
  saveExams(e) { this._set('exams', e); },

  getUpcomingExams() {
    const now = new Date();
    return this.getExams()
      .filter(e => new Date(e.date) > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  upsertExam(exam) {
    const exams = this.getExams();
    const idx = exams.findIndex(e => e.id === exam.id);
    if (idx >= 0) exams[idx] = exam;
    else exams.push(exam);
    this.saveExams(exams);
  },

  deleteExam(id) { this.saveExams(this.getExams().filter(e => e.id !== id)); },

  // ── Quizzes & Results ─────────────────────────────────────
  getQuizzes() { return this._get('quizzes') || []; },
  saveQuizzes(q) { this._set('quizzes', q); },

  upsertQuiz(quiz) {
    const quizzes = this.getQuizzes();
    const idx = quizzes.findIndex(q => q.id === quiz.id);
    if (idx >= 0) quizzes[idx] = quiz;
    else quizzes.push(quiz);
    this.saveQuizzes(quizzes);
  },

  deleteQuiz(id) { this.saveQuizzes(this.getQuizzes().filter(q => q.id !== id)); },

  getQuizHistory() { return this._get('quiz_history') || []; },
  addQuizResult(result) {
    const history = this.getQuizHistory();
    history.unshift({ ...result, id: Date.now(), date: new Date().toISOString() });
    this._set('quiz_history', history.slice(0, 200)); // Keep last 200
  },

  // ── Raw Test Sessions (metadata in localStorage, files in IndexedDB) ──
  getRawTests() { return this._get('raw_tests') || []; },
  saveRawTests(t) { this._set('raw_tests', t); },
  upsertRawTest(test) {
    const tests = this.getRawTests();
    const idx = tests.findIndex(t => t.id === test.id);
    // Never store fileData in localStorage — that goes in IndexedDB
    const { fileData, answerFileData, ...meta } = test;
    if (idx >= 0) tests[idx] = meta;
    else tests.push(meta);
    this.saveRawTests(tests);
  },
  deleteRawTest(id) { this.saveRawTests(this.getRawTests().filter(t => t.id !== id)); },

  // ── Study Sessions ────────────────────────────────────────
  getStudySessions() { return this._get('study_sessions') || []; },

  addStudySession(session) {
    const sessions = this.getStudySessions();
    sessions.unshift({ ...session, id: Date.now(), date: new Date().toISOString() });
    this._set('study_sessions', sessions.slice(0, 500)); // Keep last 500
  },

  // Get total study minutes for a given date string (YYYY-MM-DD)
  getStudyMinutesForDate(dateStr) {
    return this.getStudySessions()
      .filter(s => s.date && s.date.startsWith(dateStr))
      .reduce((sum, s) => sum + (s.minutes || 0), 0);
  },

  // Get study minutes per day for the last N days (for heatmap)
  getStudyHeatmap(days = 91) {
    const map = {};
    const sessions = this.getStudySessions();
    sessions.forEach(s => {
      if (!s.date) return;
      const d = s.date.substring(0, 10);
      map[d] = (map[d] || 0) + (s.minutes || 0);
    });
    return map;
  },

  // ── Planner ───────────────────────────────────────────────
  getPlannerEvents() { return this._get('planner_events') || []; },
  savePlannerEvents(e) { this._set('planner_events', e); },

  addPlannerEvent(event) {
    const events = this.getPlannerEvents();
    events.push({ ...event, id: event.id || Date.now() });
    this.savePlannerEvents(events);
  },

  deletePlannerEvent(id) {
    this.savePlannerEvents(this.getPlannerEvents().filter(e => e.id !== id));
  },

  // ── Prompt Optimizer ──────────────────────────────────────
  getPromptHistory() { return this._get('prompt_history') || []; },
  addPromptToHistory(entry) {
    const history = this.getPromptHistory();
    history.unshift({ ...entry, id: Date.now(), date: new Date().toISOString() });
    this._set('prompt_history', history.slice(0, 100));
  },

  getSavedPrompts() { return this._get('saved_prompts') || []; },
  saveSavedPrompts(p) { this._set('saved_prompts', p); },

  savePrompt(prompt) {
    const prompts = this.getSavedPrompts();
    prompts.unshift({ ...prompt, id: Date.now(), savedAt: new Date().toISOString() });
    this.saveSavedPrompts(prompts.slice(0, 50));
  },

  deleteSavedPrompt(id) {
    this.saveSavedPrompts(this.getSavedPrompts().filter(p => p.id !== id));
  },

  // ── Streak ────────────────────────────────────────────────
  getStreak() { return this._get('streak') || { current: 0, longest: 0, lastStudyDate: null }; },

  touchStreak() {
    const streak = this.getStreak();
    const today = new Date().toDateString();
    if (streak.lastStudyDate && new Date(streak.lastStudyDate).toDateString() === today) {
      return streak; // Already updated today
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (streak.lastStudyDate && new Date(streak.lastStudyDate).toDateString() === yesterday.toDateString()) {
      streak.current += 1;
    } else {
      streak.current = 1;
    }
    streak.longest = Math.max(streak.longest, streak.current);
    streak.lastStudyDate = new Date().toISOString();
    this._set('streak', streak);
    return streak;
  },

  // ── RAG Documents ─────────────────────────────────────────
  getRagDocuments() { return this._get('rag_docs') || []; },
  addRagDocument(doc) {
    const docs = this.getRagDocuments();
    docs.unshift({ ...doc, id: Date.now(), uploadedAt: new Date().toISOString() });
    this._set('rag_docs', docs);
  },
  deleteRagDocument(id) {
    this._set('rag_docs', this.getRagDocuments().filter(d => d.id !== id));
  },

  // ── Diagrams ──────────────────────────────────────────────
  getDiagrams() { return this._get('diagrams') || []; },
  saveDiagrams(d) { this._set('diagrams', d); },

  upsertDiagram(diagram) {
    const diagrams = this.getDiagrams();
    if (!diagram.id) diagram.id = this.generateId();
    const idx = diagrams.findIndex(d => d.id === diagram.id);
    if (idx >= 0) diagrams[idx] = diagram;
    else diagrams.unshift(diagram);
    this.saveDiagrams(diagrams);
    return diagram;
  },

  deleteDiagram(id) {
    this.saveDiagrams(this.getDiagrams().filter(d => d.id !== id));
  },

  // ── Utilities ─────────────────────────────────────────────
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },

  exportAll() {
    const data = {};
    const prefix = this.PREFIX;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(prefix)) {
        data[key.replace(prefix, '')] = JSON.parse(localStorage.getItem(key));
      }
    }
    return data;
  },

  importAll(data) {
    Object.entries(data).forEach(([key, value]) => {
      this._set(key, value);
    });
  },
};
