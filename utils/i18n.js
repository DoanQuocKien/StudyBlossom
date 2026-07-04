// ============================================================
// StudyBloom 🌸 — Internationalization (EN / VI)
// ============================================================

const I18N = {
  _lang: 'vi',

  get lang() { return this._lang; },

  set lang(value) {
    this._lang = value;
    this.apply();
  },

  strings: {
    // ── Navigation ──────────────────────────────────────────
    nav_main:       { vi: 'Chính',          en: 'Main' },
    nav_study:      { vi: 'Học tập',        en: 'Study' },
    nav_tools:      { vi: 'Công cụ',        en: 'Tools' },
    nav_dashboard:  { vi: 'Tổng quan',      en: 'Dashboard' },
    nav_subjects:   { vi: 'Môn học',        en: 'Subjects' },
    nav_exams:      { vi: 'Kỳ thi',         en: 'Exams' },
    nav_flashcards: { vi: 'Flashcard',      en: 'Flashcards' },
    nav_quiz:       { vi: 'Bài kiểm tra',   en: 'Quiz' },
    nav_notes:      { vi: 'Ghi chú',        en: 'Notes' },
    nav_planner:    { vi: 'Lịch học',       en: 'Planner' },
    nav_timer:      { vi: 'Đồng hồ học',    en: 'Focus Timer' },
    nav_ai:         { vi: 'Trợ lý AI',      en: 'AI Assistant' },
    nav_prompt:     { vi: 'Tối ưu Prompt',  en: 'Prompt Optimizer' },
    nav_diagrams:   { vi: 'Biểu đồ',        en: 'Diagrams' },

    // ── Dashboard ───────────────────────────────────────────
    dash_upcoming_exams:  { vi: 'Kỳ thi sắp tới',      en: 'Upcoming Exams' },
    dash_study_streak:    { vi: 'Chuỗi ngày học',       en: 'Study Streak' },
    dash_days:            { vi: 'ngày',                  en: 'days' },
    dash_total_hours:     { vi: 'Tổng giờ học',          en: 'Total Study Hours' },
    dash_cards_due:       { vi: 'Thẻ cần ôn',            en: 'Cards Due' },
    dash_quick_actions:   { vi: 'Thao tác nhanh',        en: 'Quick Actions' },
    dash_study_heatmap:   { vi: 'Biểu đồ học tập',       en: 'Study Activity' },
    dash_weekly_goal:     { vi: 'Mục tiêu tuần',         en: 'Weekly Goal' },
    dash_review_cards:    { vi: 'Ôn flashcard',          en: 'Review Cards' },
    dash_start_timer:     { vi: 'Bắt đầu học',           en: 'Start Timer' },
    dash_no_exams:        { vi: 'Chưa có kỳ thi nào',    en: 'No upcoming exams' },
    dash_add_exam:        { vi: '+ Thêm kỳ thi',         en: '+ Add Exam' },
    dash_today_plan:      { vi: 'Kế hoạch hôm nay',      en: 'Today\'s Plan' },
    dash_no_plan:         { vi: 'Chưa có kế hoạch',       en: 'No plan yet' },

    // ── Subjects ────────────────────────────────────────────
    subj_title:           { vi: 'Môn học',               en: 'Subjects' },
    subj_add:             { vi: 'Thêm môn học',           en: 'Add Subject' },
    subj_progress:        { vi: 'Tiến độ',                en: 'Progress' },
    subj_topics:          { vi: 'Chủ đề',                 en: 'Topics' },
    subj_no_topics:       { vi: 'Chưa có chủ đề',         en: 'No topics yet' },
    subj_add_topic:       { vi: '+ Thêm chủ đề',          en: '+ Add Topic' },
    subj_edit:            { vi: 'Chỉnh sửa',              en: 'Edit' },
    subj_delete:          { vi: 'Xóa',                    en: 'Delete' },
    subj_name:            { vi: 'Tên môn học (Tiếng Anh)',en: 'Subject Name (English)' },
    subj_name_vi:         { vi: 'Tên môn học (Tiếng Việt)',en: 'Subject Name (Vietnamese)' },
    subj_color:           { vi: 'Màu sắc',                en: 'Color' },
    subj_emoji:           { vi: 'Biểu tượng',             en: 'Emoji' },
    subj_save:            { vi: 'Lưu',                    en: 'Save' },
    subj_cancel:          { vi: 'Hủy',                    en: 'Cancel' },
    subj_go_flashcards:   { vi: 'Flashcard',              en: 'Flashcards' },
    subj_go_notes:        { vi: 'Ghi chú',                en: 'Notes' },
    subj_go_quiz:         { vi: 'Quiz',                   en: 'Quiz' },

    // ── Exams ───────────────────────────────────────────────
    exam_title:           { vi: 'Trung tâm kỳ thi',      en: 'Exam Center' },
    exam_add:             { vi: '+ Thêm kỳ thi',          en: '+ Add Exam' },
    exam_name:            { vi: 'Tên kỳ thi',             en: 'Exam Name' },
    exam_subject:         { vi: 'Môn học',                en: 'Subject' },
    exam_date:            { vi: 'Ngày thi',               en: 'Exam Date' },
    exam_location:        { vi: 'Địa điểm',               en: 'Location' },
    exam_notes:           { vi: 'Ghi chú',                en: 'Notes' },
    exam_days_left:       { vi: 'ngày nữa',               en: 'days left' },
    exam_today:           { vi: 'Hôm nay!',               en: 'Today!' },
    exam_passed:          { vi: 'Đã qua',                 en: 'Passed' },
    exam_prepare:         { vi: 'Ôn tập',                 en: 'Prepare' },
    exam_score:           { vi: 'Điểm số',                en: 'Score' },
    exam_history:         { vi: 'Lịch sử kỳ thi',         en: 'Exam History' },
    exam_no_upcoming:     { vi: 'Không có kỳ thi sắp tới', en: 'No upcoming exams' },

    // ── Flashcards ──────────────────────────────────────────
    fc_title:             { vi: 'Flashcard',              en: 'Flashcards' },
    fc_new_deck:          { vi: 'Tạo bộ thẻ',             en: 'New Deck' },
    fc_deck_name:         { vi: 'Tên bộ thẻ',             en: 'Deck Name' },
    fc_cards:             { vi: 'thẻ',                    en: 'cards' },
    fc_due:               { vi: 'cần ôn',                 en: 'due' },
    fc_study:             { vi: 'Học ngay',               en: 'Study Now' },
    fc_edit_deck:         { vi: 'Chỉnh sửa',              en: 'Edit Deck' },
    fc_add_card:          { vi: '+ Thêm thẻ',             en: '+ Add Card' },
    fc_front:             { vi: 'Mặt trước (Câu hỏi)',    en: 'Front (Question)' },
    fc_back:              { vi: 'Mặt sau (Đáp án)',        en: 'Back (Answer)' },
    fc_flip:              { vi: 'Lật thẻ',                en: 'Flip Card' },
    fc_session_done:      { vi: 'Hoàn thành buổi học!',   en: 'Session Complete!' },
    fc_correct:           { vi: 'Đúng',                   en: 'Correct' },
    fc_incorrect:         { vi: 'Sai',                    en: 'Incorrect' },
    fc_no_due:            { vi: 'Không có thẻ nào cần ôn hôm nay! 🎉', en: 'No cards due today! 🎉' },
    fc_mastered:          { vi: 'Đã thuộc',               en: 'Mastered' },
    fc_ocr_import:        { vi: 'Nhập từ ảnh (OCR)',       en: 'Import from Image (OCR)' },

    // ── Quiz ────────────────────────────────────────────────
    quiz_title:           { vi: 'Bài kiểm tra',           en: 'Quiz' },
    quiz_create:          { vi: 'Tạo bài kiểm tra',       en: 'Create Quiz' },
    quiz_name:            { vi: 'Tên bài kiểm tra',       en: 'Quiz Name' },
    quiz_questions:       { vi: 'câu hỏi',                en: 'questions' },
    quiz_start:           { vi: 'Bắt đầu',                en: 'Start Quiz' },
    quiz_timed:           { vi: 'Có giới hạn thời gian',  en: 'Timed Mode' },
    quiz_time_per_q:      { vi: 'giây/câu',               en: 'sec/question' },
    quiz_submit:          { vi: 'Nộp bài',                en: 'Submit' },
    quiz_next:            { vi: 'Câu tiếp',               en: 'Next' },
    quiz_score:           { vi: 'Điểm số',                en: 'Score' },
    quiz_correct_ans:     { vi: 'Đáp án đúng',            en: 'Correct Answer' },
    quiz_review:          { vi: 'Xem lại bài',            en: 'Review Answers' },
    quiz_history:         { vi: 'Lịch sử',                en: 'History' },
    quiz_no_quizzes:      { vi: 'Chưa có bài kiểm tra nào', en: 'No quizzes yet' },
    quiz_add_question:    { vi: '+ Thêm câu hỏi',         en: '+ Add Question' },
    quiz_question_text:   { vi: 'Nội dung câu hỏi',       en: 'Question Text' },
    quiz_option:          { vi: 'Đáp án',                  en: 'Option' },
    quiz_correct_mark:    { vi: 'Đánh dấu đúng',          en: 'Mark as correct' },
    quiz_type_mcq:        { vi: 'Trắc nghiệm',            en: 'Multiple Choice' },
    quiz_type_tf:         { vi: 'Đúng/Sai',               en: 'True/False' },

    // ── Notes ───────────────────────────────────────────────
    notes_title:          { vi: 'Ghi chú',                en: 'Notes' },
    notes_new:            { vi: '+ Ghi chú mới',          en: '+ New Note' },
    notes_search:         { vi: 'Tìm kiếm ghi chú...',   en: 'Search notes...' },
    notes_title_ph:       { vi: 'Tiêu đề ghi chú',       en: 'Note title' },
    notes_content_ph:     { vi: 'Bắt đầu viết...',        en: 'Start writing...' },
    notes_save:           { vi: 'Lưu',                    en: 'Save' },
    notes_delete:         { vi: 'Xóa',                    en: 'Delete' },
    notes_ocr:            { vi: 'Nhập từ ảnh (OCR)',       en: 'OCR from Image' },
    notes_export:         { vi: 'Xuất PDF',               en: 'Export PDF' },
    notes_no_notes:       { vi: 'Chưa có ghi chú nào',    en: 'No notes yet' },
    notes_subject:        { vi: 'Môn học',                en: 'Subject' },
    notes_updated:        { vi: 'Cập nhật',               en: 'Updated' },

    // ── Planner ─────────────────────────────────────────────
    plan_title:           { vi: 'Lịch học',               en: 'Study Planner' },
    plan_add_session:     { vi: '+ Thêm buổi học',        en: '+ Add Session' },
    plan_week_of:         { vi: 'Tuần',                   en: 'Week of' },
    plan_prev:            { vi: 'Tuần trước',             en: 'Previous' },
    plan_next:            { vi: 'Tuần sau',               en: 'Next' },
    plan_goal_weekly:     { vi: 'Mục tiêu tuần (giờ)',    en: 'Weekly Goal (hours)' },
    plan_session_name:    { vi: 'Tên buổi học',           en: 'Session Name' },
    plan_day:             { vi: 'Ngày',                   en: 'Day' },
    plan_time:            { vi: 'Thời gian',              en: 'Time' },
    plan_duration:        { vi: 'Thời lượng (phút)',      en: 'Duration (min)' },

    // ── Timer ───────────────────────────────────────────────
    timer_title:          { vi: 'Đồng hồ Pomodoro',       en: 'Pomodoro Timer' },
    timer_work:           { vi: 'Tập trung',              en: 'Focus' },
    timer_short_break:    { vi: 'Nghỉ ngắn',              en: 'Short Break' },
    timer_long_break:     { vi: 'Nghỉ dài',               en: 'Long Break' },
    timer_start:          { vi: 'Bắt đầu',                en: 'Start' },
    timer_pause:          { vi: 'Tạm dừng',               en: 'Pause' },
    timer_reset:          { vi: 'Đặt lại',                en: 'Reset' },
    timer_session:        { vi: 'Phiên học',              en: 'Session' },
    timer_subject_tag:    { vi: 'Đang học môn',           en: 'Studying' },
    timer_sound:          { vi: 'Âm thanh nền',           en: 'Ambient Sound' },
    timer_sound_none:     { vi: 'Không có',               en: 'None' },
    timer_sound_rain:     { vi: 'Mưa lo-fi',              en: 'Lo-fi Rain' },
    timer_sound_white:    { vi: 'Tiếng trắng',            en: 'White Noise' },
    timer_sound_cafe:     { vi: 'Quán cà phê',            en: 'Café Sounds' },
    timer_today_log:      { vi: 'Nhật ký hôm nay',        en: 'Today\'s Log' },

    // ── AI Assistant ────────────────────────────────────────
    ai_title:             { vi: 'Trợ lý AI',              en: 'AI Assistant' },
    ai_upload:            { vi: 'Tải tài liệu lên',       en: 'Upload Document' },
    ai_ocr_upload:        { vi: 'Tải ảnh/PDF lên & OCR',  en: 'Upload Image/PDF + OCR' },
    ai_query_ph:          { vi: 'Hỏi bất cứ điều gì về tài liệu của bạn...', en: 'Ask anything about your documents...' },
    ai_send:              { vi: 'Gửi',                    en: 'Send' },
    ai_docs_indexed:      { vi: 'Tài liệu đã lập chỉ mục', en: 'Indexed Documents' },
    ai_no_docs:           { vi: 'Chưa có tài liệu nào',   en: 'No documents yet' },
    ai_thinking:          { vi: 'Đang suy nghĩ...',       en: 'Thinking...' },
    ai_backend_off:       { vi: 'Backend chưa khởi động. Chạy start.bat trước.', en: 'Backend offline. Run start.bat first.' },
    ai_summarize:         { vi: 'Tóm tắt tài liệu này',   en: 'Summarize this document' },
    ai_gen_quiz:          { vi: 'Tạo quiz từ tài liệu này', en: 'Generate quiz from this' },
    ai_clear_chat:        { vi: 'Xóa chat',               en: 'Clear Chat' },

    // ── Prompt Optimizer ────────────────────────────────────
    po_title:             { vi: 'Tối ưu Prompt',          en: 'Prompt Optimizer' },
    po_subject:           { vi: 'Môn học',                en: 'Subject' },
    po_template:          { vi: 'Mẫu câu',                en: 'Template' },
    po_your_question:     { vi: 'Câu hỏi / Chủ đề của bạn', en: 'Your question / topic' },
    po_options:           { vi: 'Tùy chọn',               en: 'Options' },
    po_opt_examples:      { vi: 'Có ví dụ minh họa',       en: 'Include examples' },
    po_opt_steps:         { vi: 'Trình bày từng bước',     en: 'Show step-by-step' },
    po_opt_vietnamese:    { vi: 'Trả lời bằng tiếng Việt', en: 'Answer in Vietnamese' },
    po_opt_concise:       { vi: 'Ngắn gọn',               en: 'Be concise' },
    po_opt_eli5:          { vi: 'Giải thích đơn giản',     en: 'Explain simply (ELI5)' },
    po_preview:           { vi: 'Xem trước prompt',        en: 'Prompt Preview' },
    po_copy:              { vi: 'Sao chép',                en: 'Copy Prompt' },
    po_save:              { vi: 'Lưu prompt',              en: 'Save Prompt' },
    po_copied:            { vi: 'Đã sao chép! ✓',          en: 'Copied! ✓' },
    po_history:           { vi: 'Lịch sử prompt',          en: 'Prompt History' },
    po_saved:             { vi: 'Đã lưu',                  en: 'Saved Prompts' },
    po_no_history:        { vi: 'Chưa có prompt nào',      en: 'No prompts yet' },

    // ── Common ──────────────────────────────────────────────
    common_save:          { vi: 'Lưu',                    en: 'Save' },
    common_cancel:        { vi: 'Hủy',                    en: 'Cancel' },
    common_delete:        { vi: 'Xóa',                    en: 'Delete' },
    common_edit:          { vi: 'Chỉnh sửa',              en: 'Edit' },
    common_add:           { vi: 'Thêm',                   en: 'Add' },
    common_close:         { vi: 'Đóng',                   en: 'Close' },
    common_confirm_delete:{ vi: 'Bạn có chắc muốn xóa?',  en: 'Are you sure you want to delete?' },
    common_yes:           { vi: 'Có',                     en: 'Yes' },
    common_no:            { vi: 'Không',                  en: 'No' },
    common_loading:       { vi: 'Đang tải...',            en: 'Loading...' },
    common_error:         { vi: 'Đã xảy ra lỗi',          en: 'An error occurred' },
    common_success:       { vi: 'Thành công!',             en: 'Success!' },
    common_back:          { vi: 'Quay lại',               en: 'Back' },
    common_search:        { vi: 'Tìm kiếm...',            en: 'Search...' },
    common_filter:        { vi: 'Lọc',                    en: 'Filter' },
    common_all:           { vi: 'Tất cả',                 en: 'All' },
    common_none:          { vi: 'Không có',               en: 'None' },
    common_min:           { vi: 'phút',                   en: 'min' },
    common_hour:          { vi: 'giờ',                    en: 'hour' },
    common_hours:         { vi: 'giờ',                    en: 'hours' },
  },

  /**
   * Translate a key to the current language.
   */
  t(key, lang = null) {
    const l = lang || this._lang;
    const entry = this.strings[key];
    if (!entry) { console.warn('[i18n] Missing key:', key); return key; }
    return entry[l] || entry['en'] || key;
  },

  /**
   * Apply translations to all [data-i18n] elements in the DOM.
   */
  apply(lang = null) {
    if (lang) this._lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      el.placeholder = this.t(key);
    });
    document.documentElement.lang = this._lang;
  },

  /**
   * Greeting based on time of day.
   */
  greeting(name) {
    const hour = new Date().getHours();
    if (this._lang === 'vi') {
      if (hour < 12) return `Chào buổi sáng, ${name}! ☀️`;
      if (hour < 18) return `Chào buổi chiều, ${name}! 🌤️`;
      return `Chào buổi tối, ${name}! 🌙`;
    } else {
      if (hour < 12) return `Good morning, ${name}! ☀️`;
      if (hour < 18) return `Good afternoon, ${name}! 🌤️`;
      return `Good evening, ${name}! 🌙`;
    }
  },

  /**
   * Motivational quotes for the dashboard.
   */
  quotes: [
    { vi: 'Mỗi ngày học một chút, tương lai sẽ rạng rỡ hơn. 🌸',           en: 'A little learning each day makes the future brighter. 🌸' },
    { vi: 'Khó khăn chỉ là thử thách, không phải giới hạn của em! 💪',       en: 'Difficulties are challenges, not your limits! 💪' },
    { vi: 'Em học giỏi lắm. Tiếp tục cố gắng nhé! ✨',                       en: 'You\'re doing great. Keep going! ✨' },
    { vi: 'Toán rời rạc hay DSA cũng không đáng sợ khi có đam mê. 🔥',       en: 'Discrete math or DSA is not scary when you\'re passionate. 🔥' },
    { vi: 'Nghỉ ngơi cũng là một phần của việc học. Đừng quên chăm sóc bản thân! 💕', en: 'Rest is part of learning. Don\'t forget to take care of yourself! 💕' },
    { vi: 'Hôm nay cố gắng, ngày mai gặt hái! 🌱',                           en: 'Effort today, results tomorrow! 🌱' },
    { vi: 'Thơ giỏi lắm! Mỗi bước nhỏ đều đáng trân trọng. 🩷',              en: 'You\'re amazing! Every small step counts. 🩷' },
  ],

  randomQuote() {
    const q = this.quotes[Math.floor(Math.random() * this.quotes.length)];
    return q[this._lang] || q['en'];
  },

  // Day names
  days: {
    vi: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },

  months: {
    vi: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
         'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
    en: ['January', 'February', 'March', 'April', 'May', 'June',
         'July', 'August', 'September', 'October', 'November', 'December'],
  },
};
