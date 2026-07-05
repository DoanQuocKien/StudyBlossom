// ============================================================
// StudyBlossom 🌸 — AI Study Assistant Page (AI Chat)
// ============================================================

const AIPage = {
  _messages: [],
  _isLoading: false,
  _abortController: null,

  render() {
    const docs = Storage.getRagDocuments();
    const lang = I18N.lang;

    return `
    <div class="animate-fadeIn">
      <div class="page-header">
        <div>
          <h1 class="page-title">🤖 ${I18N.t('ai_title')}</h1>
          <p class="page-subtitle">${lang==='vi'?'Hỏi bất cứ điều gì — AI sẽ trả lời dựa trên tài liệu của bạn':'Ask anything — AI answers from your uploaded documents'}</p>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="AIPage.clearChat()">
          <i data-lucide="trash-2"></i> ${I18N.t('ai_clear_chat')}
        </button>
      </div>

      <div class="ai-layout">
        <!-- Chat area -->
        <div class="chat-area">
          <div class="chat-messages" id="chat-messages">
            ${this._messages.length === 0 ? this._renderWelcome() : this._messages.map(m => this._renderMessage(m)).join('')}
          </div>

          <!-- Quick action chips -->
          <div style="display:flex;flex-wrap:wrap;gap:0.5rem;padding:0.5rem 0.75rem;background:var(--bg-raised);border:1px solid var(--border);border-top:none;border-bottom:none">
            ${[
              { icon:'📄', labelVi:'Tóm tắt tài liệu', labelEn:'Summarize document', query: lang==='vi'?'Tóm tắt tài liệu tôi vừa tải lên.':'Summarize the document I just uploaded.' },
              { icon:'✏️', labelVi:'Tạo quiz', labelEn:'Generate quiz', query: lang==='vi'?'Tạo 5 câu hỏi trắc nghiệm từ tài liệu này.':'Generate 5 quiz questions from this document.' },
              { icon:'💡', labelVi:'Giải thích khái niệm', labelEn:'Explain concept', query: lang==='vi'?'Giải thích khái niệm quan trọng nhất trong tài liệu.':'Explain the most important concept in the document.' },
              { icon:'🔢', labelVi:'Công thức toán', labelEn:'Math formulas', query: lang==='vi'?'Liệt kê các công thức toán học quan trọng trong tài liệu.':'List all important math formulas from the document.' },
            ].map(chip => `
              <button class="btn btn-ghost btn-sm" onclick="AIPage.sendQuick('${chip.query.replace(/'/g, "\\'")}')">
                ${chip.icon} ${lang==='vi'?chip.labelVi:chip.labelEn}
              </button>`).join('')}
          </div>

          <!-- Input -->
          <div class="chat-input-row">
            <textarea id="chat-input" placeholder="${I18N.t('ai_query_ph')}" rows="1"
              onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();AIPage.send()}"
              oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,100)+'px'"></textarea>
            <button class="btn btn-primary" id="chat-send-btn" onclick="AIPage.send()">
              <i data-lucide="send"></i>
            </button>
          </div>
        </div>

        <!-- Documents panel -->
        <div class="ai-docs-panel">
          <div class="card mb-3">
            <h3 style="font-weight:600;margin-bottom:0.75rem">📁 ${I18N.t('ai_docs_indexed')}</h3>

            <!-- Upload buttons -->
            <div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1rem">
              <button class="btn btn-primary btn-sm w-full" onclick="document.getElementById('ai-upload-file').click()">
                <i data-lucide="upload"></i> ${I18N.t('ai_ocr_upload')}
              </button>
              <input type="file" id="ai-upload-file" accept=".pdf,.jpg,.jpeg,.png,.txt" style="display:none"
                onchange="AIPage.uploadDocument(this.files[0])">
            </div>

            <!-- Doc list -->
            ${docs.length === 0
              ? `<div class="empty-state" style="padding:1.5rem 0">
                  <div style="font-size:2rem;margin-bottom:0.5rem">📚</div>
                  <p class="text-sm text-muted">${I18N.t('ai_no_docs')}</p>
                 </div>`
              : docs.map(d => `
                <div class="doc-item">
                  <span style="font-size:1.1rem">${d.type==='pdf'?'📄':d.type==='image'?'🖼️':'📝'}</span>
                  <div style="flex:1;overflow:hidden">
                    <div class="doc-item-name truncate">${d.name}</div>
                    <div class="doc-item-meta">${App.formatDate(d.uploadedAt)}</div>
                  </div>
                  <button onclick="AIPage.removeDoc(${d.id})" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1rem">✕</button>
                </div>`).join('')}
          </div>

          <!-- Backend status -->
          <div class="card">
            <h3 style="font-weight:600;margin-bottom:0.75rem">⚙️ ${lang==='vi'?'Trạng thái':'Status'}</h3>
            <div id="backend-status">
              <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.8rem">
                <div style="width:8px;height:8px;border-radius:50%;background:var(--amber)" id="status-dot"></div>
                <span id="status-text">${lang==='vi'?'Đang kiểm tra...':'Checking...'}</span>
              </div>
              <p style="font-size:0.7rem;color:var(--text-muted);margin-top:0.5rem">
                ${lang==='vi'?'Mô hình: Ollama (gemma3:4b / llama3.2:3b)':'Model: Ollama (gemma3:4b / llama3.2:3b)'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  },

  _renderWelcome() {
    const lang = I18N.lang;
    return `
    <div style="text-align:center;padding:2rem;color:var(--text-muted)">
      <div style="font-size:3rem;margin-bottom:1rem">🤖</div>
      <h3 style="color:var(--text-secondary);margin-bottom:0.5rem">${lang==='vi'?'Xin chào! Tôi là trợ lý AI của bạn':'Hello! I\'m your AI Study Assistant'}</h3>
      <p style="font-size:0.875rem">${lang==='vi'?'Tải tài liệu lên để tôi có thể trả lời các câu hỏi dựa trên nội dung của chúng.':'Upload your documents and I\'ll answer questions based on their content.'}</p>
      <p style="font-size:0.75rem;margin-top:0.5rem;color:var(--text-muted)">${lang==='vi'?'(Cần dịch vụ nền đang chạy — xem start.bat)':'(Requires background service running — see start.bat)'}</p>
    </div>`;
  },

  _renderMessage(msg) {
    const isUser = msg.role === 'user';
    return `
    <div class="chat-message ${isUser?'user':'ai'}">
      <div class="msg-avatar ${isUser?'user-avatar':'ai-avatar'}">
        ${isUser ? '🌸' : '🤖'}
      </div>
      <div class="msg-bubble">
        ${msg.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.1);padding:1px 4px;border-radius:3px;font-family:monospace">$1</code>')}
      </div>
    </div>`;
  },

  init() {
    this._checkBackendStatus();
    this._scrollToBottom();
    if (window.lucide) lucide.createIcons();
  },

  async _checkBackendStatus() {
    const settings = Storage.getSettings();
    const dot  = document.getElementById('status-dot');
    const text = document.getElementById('status-text');
    try {
      const res = await fetch(`${settings.backendUrl}/api/health`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (dot)  { dot.style.background  = 'var(--mint)'; }
        if (text) text.textContent = I18N.lang==='vi'?`Online · ${data.model||''}`:(`Online · ${data.model||''}`);
        return;
      }
    } catch {}
    if (dot)  { dot.style.background  = 'var(--coral)'; }
    if (text) text.textContent = I18N.lang==='vi'?'Offline (chạy start.bat)':'Offline (run start.bat)';
  },

  async send() {
    const input = document.getElementById('chat-input');
    const query = input?.value.trim();
    if (!query || this._isLoading) return;
    input.value = '';
    input.style.height = 'auto';
    this._sendMessage(query);
  },

  sendQuick(query) {
    this._sendMessage(query);
  },

  async _sendMessage(query) {
    this._messages.push({ role: 'user', content: query });
    this._isLoading = true;
    this._renderMessages();
    this._appendThinking();

    const settings = Storage.getSettings();

    try {
      this._abortController = new AbortController();
      const res = await fetch(`${settings.backendUrl}/api/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language: I18N.lang }),
        signal: this._abortController.signal,
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const answer = data.answer || data.response || (I18N.lang==='vi'?'Không có phản hồi.':'No response.');

      this._messages.push({ role: 'ai', content: answer });

    } catch (e) {
      if (e.name === 'AbortError') return;
      const errMsg = I18N.lang==='vi'
        ? `⚠️ ${I18N.t('ai_backend_off')}\n\nLỗi: ${e.message}`
        : `⚠️ ${I18N.t('ai_backend_off')}\n\nError: ${e.message}`;
      this._messages.push({ role: 'ai', content: errMsg });
    }

    this._isLoading = false;
    this._renderMessages();
    this._scrollToBottom();
    App._renderMath();

    Storage.touchStreak();
    App._updateStreak();
  },

  _renderMessages() {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    container.innerHTML = this._messages.length === 0 ? this._renderWelcome() : this._messages.map(m => this._renderMessage(m)).join('');
    if (window.lucide) lucide.createIcons();
  },

  _appendThinking() {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'chat-message ai';
    div.id = 'thinking-bubble';
    div.innerHTML = `
      <div class="msg-avatar ai-avatar">🤖</div>
      <div class="msg-bubble" style="display:flex;align-items:center;gap:0.5rem">
        <div style="display:flex;gap:4px">
          ${[0,1,2].map(i => `<div style="width:6px;height:6px;border-radius:50%;background:var(--purple);animation:pulse 1.2s ease-in-out ${i*0.2}s infinite"></div>`).join('')}
        </div>
        <span>${I18N.t('ai_thinking')}</span>
      </div>`;
    container.appendChild(div);
    this._scrollToBottom();
  },

  _scrollToBottom() {
    const container = document.getElementById('chat-messages');
    if (container) container.scrollTop = container.scrollHeight;
  },

  clearChat() {
    this._messages = [];
    App.navigate('ai', false);
  },

  async uploadDocument(file) {
    if (!file) return;
    const settings = Storage.getSettings();
    const formData = new FormData();
    formData.append('file', file);

    App.toast(I18N.lang==='vi'?`Đang tải lên ${file.name}...`:`Uploading ${file.name}...`, 'info', 2000);

    try {
      const res = await fetch(`${settings.backendUrl}/api/rag/upload`, { method:'POST', body:formData });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const type = file.name.endsWith('.pdf') ? 'pdf' : file.type.startsWith('image/') ? 'image' : 'text';
      Storage.addRagDocument({ name: file.name, type, chunks: data.chunks });

      App.toast(I18N.lang==='vi'?`✅ Đã xử lý "${file.name}" — ${data.chunks||'?'} đoạn văn bản`:`✅ Processed "${file.name}" — ${data.chunks||'?'} chunks`, 'success', 4000);
      App.navigate('ai', false);
    } catch(e) {
      App.toast(I18N.t('ai_backend_off'), 'error', 5000);
    }
  },

  removeDoc(id) {
    Storage.deleteRagDocument(id);
    App.navigate('ai', false);
    App.toast(I18N.lang==='vi'?'Đã xóa tài liệu':'Document removed','success');
  },

  destroy() {
    if (this._abortController) this._abortController.abort();
    this._isLoading = false;
  },
};
