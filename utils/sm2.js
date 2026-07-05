// ============================================================
// StudyBlossom 🌸 — SM-2 Spaced Repetition Algorithm
// Based on the SuperMemo SM-2 algorithm
// ============================================================

const SM2 = {
  /**
   * Process a card review.
   * @param {object} card - The flashcard with SM-2 metadata
   * @param {number} quality - 0 to 5 (0-2: fail/hard, 3-5: pass)
   * @returns {object} Updated card metadata
   */
  review(card, quality) {
    let { repetitions = 0, easiness = 2.5, interval = 1 } = card;

    if (quality >= 3) {
      // Correct response
      if (repetitions === 0)      interval = 1;
      else if (repetitions === 1) interval = 6;
      else                        interval = Math.round(interval * easiness);
      repetitions++;
    } else {
      // Incorrect — reset
      repetitions = 0;
      interval = 1;
    }

    // Update easiness factor (clamped to minimum 1.3)
    easiness = Math.max(1.3,
      easiness + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    );

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    return {
      ...card,
      repetitions,
      easiness: parseFloat(easiness.toFixed(2)),
      interval,
      nextReview: nextReview.toISOString(),
      lastReview: new Date().toISOString(),
      lastQuality: quality,
    };
  },

  /**
   * Check if a card is due for review.
   */
  isDue(card) {
    if (!card.nextReview) return true;
    return new Date() >= new Date(card.nextReview);
  },

  /**
   * Get all due cards from a deck.
   */
  getDueCards(deck) {
    if (!deck || !deck.cards) return [];
    return deck.cards.filter(c => this.isDue(c));
  },

  /**
   * Initialize a new card with SM-2 defaults.
   */
  newCard(front, back, extra = {}) {
    return {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      front,
      back,
      repetitions: 0,
      easiness: 2.5,
      interval: 1,
      nextReview: null,
      lastReview: null,
      lastQuality: null,
      createdAt: new Date().toISOString(),
      ...extra,
    };
  },

  /**
   * Get mastery level string based on repetitions and easiness.
   */
  getMastery(card) {
    if (!card.lastReview) return 'new';
    if (card.repetitions >= 5 && card.easiness >= 2.5) return 'mastered';
    if (card.repetitions >= 2) return 'learning';
    return 'reviewing';
  },

  /**
   * Get mastery color for UI display.
   */
  getMasteryColor(card) {
    const level = this.getMastery(card);
    return {
      new: '#94a3b8',
      reviewing: '#fb7185',
      learning: '#fbbf24',
      mastered: '#6ee7b7',
    }[level];
  },

  /**
   * Summarize deck statistics.
   */
  deckStats(deck) {
    if (!deck || !deck.cards || deck.cards.length === 0) {
      return { total: 0, due: 0, new: 0, learning: 0, mastered: 0 };
    }
    const cards = deck.cards;
    const now = new Date();
    return {
      total:    cards.length,
      due:      cards.filter(c => !c.nextReview || new Date(c.nextReview) <= now).length,
      new:      cards.filter(c => !c.lastReview).length,
      learning: cards.filter(c => c.lastReview && c.repetitions < 5).length,
      mastered: cards.filter(c => c.repetitions >= 5 && c.easiness >= 2.5).length,
    };
  },

  /**
   * Quality labels for the review buttons.
   */
  QUALITY_LABELS: {
    0: { vi: 'Không nhớ', en: 'Blackout', color: '#ef4444' },
    1: { vi: 'Rất khó',   en: 'Hard',     color: '#f97316' },
    2: { vi: 'Khó',       en: 'Difficult', color: '#fbbf24' },
    3: { vi: 'Được',      en: 'Okay',     color: '#a3e635' },
    4: { vi: 'Dễ',        en: 'Good',     color: '#6ee7b7' },
    5: { vi: 'Rất dễ',    en: 'Perfect',  color: '#60a5fa' },
  },
};
