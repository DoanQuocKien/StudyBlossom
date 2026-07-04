// ============================================================
// StudyBloom 🌸 — Diagrams Page
// Mermaid.js (text-to-diagram) + Excalidraw (free-draw)
// ============================================================

const DiagramsPage = {
  _mode: 'gallery',    // 'gallery' | 'editor' | 'draw'
  _activeDiagram: null,
  _mermaidLoaded: false,
  _renderTimeout: null,

  // ── Pre-built templates ─────────────────────────────────────
  TEMPLATES: {
    // OOP
    oop_class: {
      icon: '🧩',
      labelVi: 'Biểu đồ lớp UML',
      labelEn: 'UML Class Diagram',
      subject: 'oop',
      type: 'mermaid',
      code: `classDiagram
  class Animal {
    +String name
    +int age
    +makeSound() void
    +move() void
  }

  class Dog {
    +String breed
    +fetch() void
    +makeSound() void
  }

  class Cat {
    +boolean isIndoor
    +purr() void
    +makeSound() void
  }

  class PetOwner {
    +String name
    -List~Animal~ pets
    +addPet(animal: Animal) void
    +removePet(animal: Animal) void
  }

  Animal <|-- Dog : inherits
  Animal <|-- Cat : inherits
  PetOwner "1" o-- "0..*" Animal : owns`,
    },

    oop_sequence: {
      icon: '🔄',
      labelVi: 'Biểu đồ tuần tự',
      labelEn: 'Sequence Diagram',
      subject: 'oop',
      type: 'mermaid',
      code: `sequenceDiagram
  participant Client
  participant Server
  participant Database

  Client->>+Server: HTTP POST /login {username, password}
  Server->>+Database: SELECT user WHERE email = ?
  Database-->>-Server: User record
  Server->>Server: Verify password hash
  alt Password correct
    Server-->>Client: 200 OK {token: JWT}
  else Password wrong
    Server-->>-Client: 401 Unauthorized
  end`,
    },

    oop_state: {
      icon: '🔀',
      labelVi: 'Sơ đồ trạng thái',
      labelEn: 'State Diagram',
      subject: 'oop',
      type: 'mermaid',
      code: `stateDiagram-v2
  [*] --> Idle : System Start

  state "Order Processing" as Processing {
    [*] --> Pending
    Pending --> Confirmed : confirm()
    Confirmed --> Shipped : ship()
    Shipped --> Delivered : deliver()
    Delivered --> [*]
  }

  Idle --> Processing : createOrder()
  Processing --> Cancelled : cancel()
  Cancelled --> [*]
  Delivered --> Idle : reset()`,
    },

    oop_er: {
      icon: '🗃️',
      labelVi: 'Sơ đồ ER (Cơ sở dữ liệu)',
      labelEn: 'ER Diagram (Database)',
      subject: 'oop',
      type: 'mermaid',
      code: `erDiagram
  STUDENT {
    int student_id PK
    string name
    string email
    date dob
  }
  COURSE {
    int course_id PK
    string name
    int credits
    string semester
  }
  ENROLLMENT {
    int student_id FK
    int course_id FK
    float grade
    date enrolled_at
  }
  PROFESSOR {
    int prof_id PK
    string name
    string department
  }

  STUDENT ||--o{ ENROLLMENT : "enrolls in"
  COURSE ||--o{ ENROLLMENT : "has"
  PROFESSOR ||--o{ COURSE : "teaches"`,
    },

    // DSA
    dsa_flowchart: {
      icon: '🌳',
      labelVi: 'Thuật toán sắp xếp',
      labelEn: 'Sorting Algorithm',
      subject: 'dsa',
      type: 'mermaid',
      code: `flowchart TD
  Start([▶ Start: arr of n elements])
  --> A{n <= 1?}
  A -->|Yes| Done([✓ Return arr — base case])
  A -->|No| B[Choose pivot = arr at mid]
  B --> C[Partition: left < pivot, right >= pivot]
  C --> D[QuickSort left partition]
  C --> E[QuickSort right partition]
  D --> F[Combine: left + pivot + right]
  E --> F
  F --> Done2([✓ Return sorted arr])

  style Start fill:#a78bfa,color:#fff
  style Done fill:#6ee7b7,color:#111
  style Done2 fill:#6ee7b7,color:#111
  style B fill:#fbbf24,color:#111`,
    },

    dsa_graph: {
      icon: '🕸️',
      labelVi: 'Tìm kiếm đồ thị (BFS/DFS)',
      labelEn: 'Graph Traversal (BFS/DFS)',
      subject: 'dsa',
      type: 'mermaid',
      code: `graph LR
  A((A)) -->|4| B((B))
  A -->|8| H((H))
  B -->|11| H
  B -->|8| C((C))
  H -->|7| I((I))
  H -->|1| G((G))
  I -->|6| C
  G -->|2| F((F))
  C -->|2| F
  C -->|4| D((D))
  F -->|10| E((E))
  D -->|9| E
  D -->|14| E

  style A fill:#a78bfa,color:#fff
  style E fill:#fb7185,color:#fff`,
    },

    // Digital Circuits
    dc_logic: {
      icon: '⚡',
      labelVi: 'Mạch logic cơ bản',
      labelEn: 'Basic Logic Circuit',
      subject: 'dc',
      type: 'mermaid',
      code: `flowchart LR
  A([Input A]) --> AND1[AND Gate]
  B([Input B]) --> AND1
  AND1 --> OR1[OR Gate]

  C([Input C]) --> NOT1[NOT Gate]
  NOT1 --> AND2[AND Gate]
  D([Input D]) --> AND2
  AND2 --> OR1

  OR1 --> NAND1[NAND Gate]
  E([Input E]) --> NAND1
  NAND1 --> Out([Output F])

  style A fill:#60a5fa,color:#111
  style B fill:#60a5fa,color:#111
  style C fill:#60a5fa,color:#111
  style D fill:#60a5fa,color:#111
  style E fill:#60a5fa,color:#111
  style Out fill:#6ee7b7,color:#111
  style AND1 fill:#fbbf24,color:#111
  style AND2 fill:#fbbf24,color:#111
  style OR1 fill:#a78bfa,color:#fff
  style NOT1 fill:#fb7185,color:#fff
  style NAND1 fill:#f97316,color:#fff`,
    },

    dc_fsm: {
      icon: '🔁',
      labelVi: 'Máy trạng thái hữu hạn (FSM)',
      labelEn: 'Finite State Machine (FSM)',
      subject: 'dc',
      type: 'mermaid',
      code: `stateDiagram-v2
  [*] --> S0 : RESET

  S0 --> S0 : Input=0 / Output=0
  S0 --> S1 : Input=1 / Output=0

  S1 --> S2 : Input=0 / Output=0
  S1 --> S1 : Input=1 / Output=0

  S2 --> S0 : Input=0 / Output=1
  S2 --> S1 : Input=1 / Output=0

  note right of S0 : Mealy FSM
  note right of S2 : Sequence "101" detected`,
    },

    dc_timing: {
      icon: '📊',
      labelVi: 'Giản đồ thời gian',
      labelEn: 'Timing Diagram',
      subject: 'dc',
      type: 'mermaid',
      code: `gantt
  title Digital Signal Timing Diagram
  dateFormat X
  axisFormat %s

  section CLK
    HIGH :0, 1
    LOW  :1, 2
    HIGH :2, 3
    LOW  :3, 4
    HIGH :4, 5

  section A (Input)
    LOW  :0, 2
    HIGH :2, 5

  section B (Input)
    HIGH :0, 1
    LOW  :1, 3
    HIGH :3, 5

  section F = A AND B
    LOW  :0, 3
    HIGH :3, 5`,
    },

    // Discrete Math
    dm_graph: {
      icon: '🔢',
      labelVi: 'Đồ thị toán rời rạc',
      labelEn: 'Discrete Math Graph',
      subject: 'dm',
      type: 'mermaid',
      code: `graph TD
  subgraph "Bipartite Graph G = (U ∪ V, E)"
    subgraph U ["Set U"]
      u1((u1))
      u2((u2))
      u3((u3))
    end
    subgraph V ["Set V"]
      v1((v1))
      v2((v2))
      v3((v3))
      v4((v4))
    end
  end

  u1 --- v1
  u1 --- v2
  u2 --- v2
  u2 --- v3
  u3 --- v3
  u3 --- v4

  style u1 fill:#a78bfa,color:#fff
  style u2 fill:#a78bfa,color:#fff
  style u3 fill:#a78bfa,color:#fff
  style v1 fill:#fb7185,color:#fff
  style v2 fill:#fb7185,color:#fff
  style v3 fill:#fb7185,color:#fff
  style v4 fill:#fb7185,color:#fff`,
    },

    dm_tree: {
      icon: '🌲',
      labelVi: 'Cây quyết định / Cây nhị phân',
      labelEn: 'Binary / Decision Tree',
      subject: 'dm',
      type: 'mermaid',
      code: `graph TD
  Root["(A∧B) ∨ (¬A∧C)"]
  Root -->|A=T| N1["B ∨ False"]
  Root -->|A=F| N2["False ∨ C"]

  N1 -->|B=T| L1["✓ TRUE"]
  N1 -->|B=F| L2["✗ FALSE"]
  N2 -->|C=T| L3["✓ TRUE"]
  N2 -->|C=F| L4["✗ FALSE"]

  style L1 fill:#6ee7b7,color:#111
  style L3 fill:#6ee7b7,color:#111
  style L2 fill:#fb7185,color:#fff
  style L4 fill:#fb7185,color:#fff`,
    },

    // Probability & Stats
    ps_bayesian: {
      icon: '📊',
      labelVi: 'Sơ đồ Bayes / Xác suất',
      labelEn: 'Bayesian / Probability Tree',
      subject: 'ps',
      type: 'mermaid',
      code: `flowchart LR
  Start((" ")) --> A["P(A) = 0.3<br/>Disease"]
  Start --> B["P(Ā) = 0.7<br/>No Disease"]

  A -->|P(+|A)=0.95| TP["✅ True Positive<br/>P = 0.285"]
  A -->|P(-|A)=0.05| FN["❌ False Negative<br/>P = 0.015"]

  B -->|P(+|Ā)=0.10| FP["⚠️ False Positive<br/>P = 0.070"]
  B -->|P(-|Ā)=0.90| TN["✅ True Negative<br/>P = 0.630"]

  style TP fill:#6ee7b7,color:#111
  style TN fill:#6ee7b7,color:#111
  style FP fill:#fbbf24,color:#111
  style FN fill:#fb7185,color:#fff`,
    },
  },

  render() {
    if (this._mode === 'editor' && this._activeDiagram) return this._renderEditor();
    if (this._mode === 'draw') return this._renderDrawing();
    if (this._mode === 'dsa-builder') return this._renderDsaBuilder();
    return this._renderGallery();
  },

  _renderGallery() {
    const lang = I18N.lang;
    const subjects = Storage.getSubjects();
    const saved = Storage.getDiagrams();

    // Group templates by subject
    const subjMap = {
      oop: { label: lang==='vi'?'Lập trình hướng đối tượng':'OOP', color:'#a78bfa', emoji:'💻' },
      dsa: { label: lang==='vi'?'Cấu trúc dữ liệu & Giải thuật':'DSA', color:'#6ee7b7', emoji:'🌳' },
      dc:  { label: lang==='vi'?'Mạch số':'Digital Circuits', color:'#fbbf24', emoji:'⚡' },
      dm:  { label: lang==='vi'?'Toán rời rạc':'Discrete Math', color:'#fb7185', emoji:'🔢' },
      ps:  { label: lang==='vi'?'Xác suất thống kê':'Prob & Stats', color:'#60a5fa', emoji:'📊' },
    };

    const grouped = {};
    Object.entries(this.TEMPLATES).forEach(([key, tmpl]) => {
      const s = tmpl.subject;
      if (!grouped[s]) grouped[s] = [];
      grouped[s].push({ key, ...tmpl });
    });

    return `
    <div class="animate-fadeIn">
      <div class="page-header">
        <div>
          <h1 class="page-title">📐 ${lang==='vi'?'Biểu đồ & Sơ đồ':'Diagrams & Drawings'}</h1>
          <p class="page-subtitle">${lang==='vi'?'UML, mạch logic, đồ thị, sơ đồ trạng thái và nhiều hơn nữa':'UML, logic circuits, graphs, state machines and more'}</p>
        </div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <button class="btn btn-ghost" onclick="DiagramsPage.openNewDiagram()">
            <i data-lucide="plus"></i> ${lang==='vi'?'Tạo biểu đồ':'New Diagram'}
          </button>
          <button class="btn btn-ghost" onclick="DiagramsPage.openDsaBuilder()">
            <i data-lucide="table-properties"></i> ${lang==='vi'?'Bộ tạo Đồ thị & Bảng':'Graph & Table Builder'}
          </button>
          <button class="btn btn-primary" onclick="DiagramsPage.openDrawing()">
            <i data-lucide="pen-tool"></i> ${lang==='vi'?'Vẽ tự do':'Free Draw'}
          </button>
        </div>
      </div>

      <!-- Saved diagrams -->
      ${saved.length > 0 ? `
      <div class="card mb-6">
        <h3 style="font-weight:600;margin-bottom:1rem">📁 ${lang==='vi'?'Biểu đồ của tôi':'My Diagrams'} (${saved.length})</h3>
        <div class="grid-auto">
          ${saved.map(d => `
            <div class="diagram-thumb-card" onclick="DiagramsPage.openSaved('${d.id}')">
              <div class="diagram-thumb-preview" id="saved-prev-${d.id}">
                <div class="diagram-thumb-loading">⚙️</div>
              </div>
              <div class="diagram-thumb-info">
                <div class="diagram-thumb-name">${d.name}</div>
                <div class="diagram-thumb-meta">${App.formatDate(d.updatedAt)}</div>
              </div>
              <div class="diagram-thumb-actions">
                <button class="btn btn-ghost btn-sm btn-icon" onclick="event.stopPropagation();DiagramsPage.deleteDiagram('${d.id}')">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </div>`).join('')}
        </div>
      </div>` : ''}

      <!-- Template gallery by subject -->
      ${Object.entries(grouped).map(([subjectKey, templates]) => {
        const subj = subjMap[subjectKey] || { label: subjectKey, color: '#94a3b8', emoji: '📐' };
        return `
        <div class="mb-6">
          <h2 style="font-size:1rem;font-weight:700;color:${subj.color};margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem">
            <span>${subj.emoji}</span> ${subj.label}
          </h2>
          <div class="grid-auto">
            ${templates.map(t => `
              <div class="template-diagram-card" style="--tmpl-color:${subj.color}"
                onclick="DiagramsPage.openTemplate('${t.key}')">
                <div class="template-diagram-icon">${t.icon}</div>
                <div class="template-diagram-name">${lang==='vi'?t.labelVi:t.labelEn}</div>
                <div class="template-diagram-badge">Mermaid</div>
              </div>`).join('')}
          </div>
        </div>`;
      }).join('')}

      <!-- Info row -->
      <div class="card mt-4" style="background:linear-gradient(135deg,rgba(167,139,250,0.1),rgba(96,165,250,0.05))">
        <div style="display:flex;gap:2rem;flex-wrap:wrap">
          <div>
            <h4 style="color:var(--purple);margin-bottom:0.25rem">📊 Mermaid.js</h4>
            <p class="text-sm text-muted">${lang==='vi'?'Tạo sơ đồ bằng code — UML, sequence, state, flowchart, ER':'Code-based diagrams — UML, sequence, state, flowchart, ER'}</p>
          </div>
          <div>
            <h4 style="color:var(--mint);margin-bottom:0.25rem">✏️ ${lang==='vi'?'Vẽ tự do (Excalidraw)':'Free Draw (Excalidraw)'}</h4>
            <p class="text-sm text-muted">${lang==='vi'?'Vẽ sơ đồ tùy ý — mạch điện phức tạp, ghi chú tay':'Draw anything — complex circuits, hand-drawn style'}</p>
          </div>
        </div>
      </div>
    </div>`;
  },

  _renderEditor() {
    const d    = this._activeDiagram;
    const lang = I18N.lang;
    const subjects = Storage.getSubjects();

    return `
    <div class="animate-fadeIn">
      <div class="flex items-center gap-3 mb-4">
        <button class="btn btn-ghost btn-sm" onclick="DiagramsPage.exitEditor()">
          <i data-lucide="arrow-left"></i> ${I18N.t('common_back')}
        </button>
        <input class="form-input" id="diag-name" value="${d.name || ''}"
          placeholder="${lang==='vi'?'Tên biểu đồ':'Diagram name'}"
          style="flex:1;font-weight:600" oninput="DiagramsPage._dirty=true">
        <select class="form-select" id="diag-subject" style="width:auto" onchange="DiagramsPage._dirty=true">
          <option value="">${I18N.t('common_none')}</option>
          ${subjects.map(s => `<option value="${s.id}" ${d.subjectId===s.id?'selected':''}>${s.emoji} ${lang==='vi'?(s.nameVi||s.name):s.name}</option>`).join('')}
        </select>
        <button class="btn btn-ghost btn-sm" onclick="DiagramsPage.saveDiagram()">
          <i data-lucide="save"></i> ${I18N.t('common_save')}
        </button>
        <button class="btn btn-ghost btn-sm" onclick="DiagramsPage.insertCurrentDiagramIntoNote()">
          <i data-lucide="file-plus"></i> ${lang==='vi'?'Chèn vào ghi chú':'Insert into Note'}
        </button>
        <button class="btn btn-ghost btn-sm" onclick="DiagramsPage.exportDiagram()">
          <i data-lucide="download"></i> ${lang==='vi'?'Xuất PNG':'Export PNG'}
        </button>
      </div>

      <div class="diagram-editor-layout">
        <!-- Code editor (left) -->
        <div class="diagram-code-panel">
          <!-- Toolbar -->
          <div class="editor-toolbar" style="flex-wrap:wrap;gap:0.25rem">
            <span style="font-size:0.7rem;color:var(--text-muted);font-weight:600">INSERT:</span>
            ${[
              ['class',    'classDiagram\\n  class MyClass {\\n    +String attr\\n    +method() void\\n  }'],
              ['sequence', 'sequenceDiagram\\n  A->>B: message\\n  B-->>A: response'],
              ['state',    'stateDiagram-v2\\n  [*] --> StateA\\n  StateA --> StateB'],
              ['flow',     'flowchart TD\\n  A[Start] --> B{Decision}\\n  B -->|Yes| C[Do it]\\n  B -->|No| D[Skip]'],
              ['er',       'erDiagram\\n  TABLE1 {\\n    int id PK\\n    string name\\n  }'],
              ['gantt',    'gantt\\n  title Project Timeline\\n  dateFormat YYYY-MM-DD\\n  Task1 :2024-01-01, 7d'],
            ].map(([label, snippet]) => `
              <button class="editor-btn" onclick="DiagramsPage.insertSnippet(\`${snippet}\`)">
                ${label}
              </button>`).join('')}
            <div style="width:1px;background:var(--border);margin:0 0.1rem"></div>
            <a href="https://mermaid.js.org/syntax/classDiagram.html" target="_blank" class="btn btn-ghost btn-sm" style="font-size:10px">
              📖 Docs
            </a>
          </div>

          <textarea id="diag-code" class="diagram-code-input"
            oninput="DiagramsPage.scheduleRender()"
            spellcheck="false"
            placeholder="classDiagram\n  class MyClass {\n    +String name\n    +method() void\n  }">${d.code || ''}</textarea>

          <!-- Error display -->
          <div id="diag-error" style="display:none;padding:0.5rem;background:rgba(251,113,133,0.1);border:1px solid rgba(251,113,133,0.3);border-radius:var(--r-sm);margin-top:0.5rem;font-size:0.75rem;color:var(--coral)"></div>
        </div>

        <!-- Preview (right) -->
        <div class="diagram-preview-panel">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem">
            <span style="font-size:0.75rem;color:var(--text-muted);font-weight:600">
              ${lang==='vi'?'XEM TRƯỚC':'PREVIEW'}
            </span>
            <div style="display:flex;gap:0.5rem">
              <button class="btn btn-ghost btn-sm" onclick="DiagramsPage.zoomIn()">+</button>
              <button class="btn btn-ghost btn-sm" onclick="DiagramsPage.zoomOut()">−</button>
              <button class="btn btn-ghost btn-sm" onclick="DiagramsPage.resetZoom()">⊡</button>
            </div>
          </div>
          <div class="diagram-preview-area" id="diag-preview-area">
            <div id="diag-preview-output" style="transform-origin:top center;transition:transform 0.2s"></div>
          </div>
          <div style="text-align:center;margin-top:0.5rem;font-size:0.7rem;color:var(--text-muted)" id="diag-zoom-label">100%</div>
        </div>
      </div>
    </div>`;
  },

  _renderDrawing() {
    const lang = I18N.lang;
    return `
    <div class="animate-fadeIn" style="height:calc(100vh - 100px);display:flex;flex-direction:column">
      <div class="flex items-center gap-3 mb-3">
        <button class="btn btn-ghost btn-sm" onclick="DiagramsPage.exitEditor()">
          <i data-lucide="arrow-left"></i> ${I18N.t('common_back')}
        </button>
        <h2 style="font-weight:600">✏️ ${lang==='vi'?'Vẽ tự do — Excalidraw':'Free Drawing — Excalidraw'}</h2>
        <span class="badge badge-purple">Beta</span>
      </div>

      <!-- Excalidraw iframe embed -->
      <div style="flex:1;border-radius:var(--r-lg);overflow:hidden;border:1px solid var(--border)">
        <iframe
          src="https://excalidraw.com/"
          style="width:100%;height:100%;border:none;background:#1e1e2e"
          title="Excalidraw — Free Drawing"
          allow="clipboard-read; clipboard-write"
          id="excalidraw-frame">
        </iframe>
      </div>

      <div class="flex gap-2 mt-2" style="align-items:center">
        <i data-lucide="info" style="width:14px;height:14px;color:var(--text-muted)"></i>
        <p style="font-size:0.75rem;color:var(--text-muted)">
          ${lang==='vi'
            ? 'Vẽ sơ đồ, mạch điện, UML, ghi chú... Nhấn "Export image" trong Excalidraw để lưu. Cần kết nối internet.'
            : 'Draw circuits, UML, notes... Click "Export image" in Excalidraw to save. Requires internet.'}
        </p>
      </div>
    </div>`;
  },

  // ── State management ────────────────────────────────────────
  _zoom: 1,
  _dirty: false,

  init() {
    if (this._mode === 'editor') {
      this._zoom = 1;
      this._loadMermaid(() => {
        this.renderDiagram();
      });
    } else if (this._mode === 'gallery') {
      this._loadMermaid(() => {
        this._renderSavedThumbnails();
      });
    }
    if (window.lucide) lucide.createIcons();
  },

  destroy() {
    clearTimeout(this._renderTimeout);
    this._dirty = false;
  },

  _loadMermaid(callback) {
    if (window.mermaid && this._mermaidLoaded) {
      if (callback) callback();
      return;
    }
    const script = document.getElementById('mermaid-script');
    if (script) {
      // Already loading
      script.addEventListener('load', () => {
        this._initMermaid();
        this._mermaidLoaded = true;
        if (callback) callback();
      });
      return;
    }

    const s = document.createElement('script');
    s.id  = 'mermaid-script';
    s.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
    s.onload = () => {
      this._initMermaid();
      this._mermaidLoaded = true;
      if (callback) callback();
    };
    document.head.appendChild(s);
  },

  _initMermaid() {
    window.mermaid.initialize({
      startOnLoad:    false,
      theme:          'dark',
      darkMode:       true,
      fontFamily:     'Outfit, Inter, sans-serif',
      fontSize:       14,
      flowchart:      { curve: 'basis', useMaxWidth: false },
      classDiagram:   { useMaxWidth: false },
      securityLevel:  'loose',
      themeVariables: {
        background:      '#1a1a2e',
        primaryColor:    '#a78bfa',
        primaryTextColor:'#e2e8f0',
        primaryBorderColor:'#a78bfa55',
        lineColor:       '#94a3b8',
        secondaryColor:  '#16213e',
        tertiaryColor:   '#0f3460',
        edgeLabelBackground:'#16213e',
        fontFamily:      'Outfit, Inter, sans-serif',
      },
    });
  },

  scheduleRender() {
    this._dirty = true;
    clearTimeout(this._renderTimeout);
    this._renderTimeout = setTimeout(() => this.renderDiagram(), 600);
  },

  async renderDiagram() {
    const code    = document.getElementById('diag-code')?.value.trim();
    const output  = document.getElementById('diag-preview-output');
    const errDiv  = document.getElementById('diag-error');
    if (!code || !output) return;

    try {
      if (!window.mermaid) { this._loadMermaid(() => this.renderDiagram()); return; }

      // Validate syntax
      const isValid = await window.mermaid.parse(code);

      // Render
      const id  = 'mermaid-render-' + Date.now();
      const { svg } = await window.mermaid.render(id, code);

      output.innerHTML = svg;
      if (errDiv) errDiv.style.display = 'none';

      // Apply zoom
      const svgEl = output.querySelector('svg');
      if (svgEl) {
        svgEl.style.maxWidth = '100%';
        svgEl.style.height   = 'auto';
      }

    } catch (err) {
      if (errDiv) {
        errDiv.style.display = 'block';
        errDiv.textContent   = `⚠️ Syntax Error: ${err.message || String(err)}`;
      }
    }
  },

  async _renderSavedThumbnails() {
    if (!window.mermaid) return;
    const saved = Storage.getDiagrams();
    for (const d of saved) {
      if (!d.code || !d.code.trim()) continue;
      const el = document.getElementById(`saved-prev-${d.id}`);
      if (!el) continue;
      try {
        const id  = 'mermaid-thumb-' + d.id;
        const { svg } = await window.mermaid.render(id, d.code);
        el.innerHTML = svg;
        const svgEl = el.querySelector('svg');
        if (svgEl) {
          svgEl.style.width  = '100%';
          svgEl.style.height = '100%';
          svgEl.style.maxHeight = '120px';
        }
      } catch {
        el.innerHTML = `<span style="color:var(--text-muted);font-size:0.7rem">${I18N.lang==='vi'?'Không thể xem trước':'Preview unavailable'}</span>`;
      }
    }
  },

  // ── Navigation ──────────────────────────────────────────────
  openTemplate(key) {
    const tmpl = this.TEMPLATES[key];
    if (!tmpl) return;
    const lang = I18N.lang;
    const subject = Storage.getSubjectById(
      { oop:'oop', dsa:'dsa', dc:'dc', dm:'dm', ps:'ps' }[tmpl.subject]
    );
    this._activeDiagram = {
      id:        null,
      name:      lang==='vi' ? tmpl.labelVi : tmpl.labelEn,
      code:      tmpl.code,
      subjectId: tmpl.subject,
      type:      'mermaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this._mode = 'editor';
    App.navigate('diagrams', false);
  },

  openSaved(id) {
    const d = Storage.getDiagrams().find(d => d.id === id);
    if (!d) return;
    this._activeDiagram = { ...d };
    this._mode = 'editor';
    App.navigate('diagrams', false);
  },

  openNewDiagram() {
    this._activeDiagram = {
      id:        null,
      name:      I18N.lang==='vi' ? 'Biểu đồ mới' : 'New Diagram',
      code:      'classDiagram\n  class MyClass {\n    +String name\n    +method() void\n  }',
      subjectId: null,
      type:      'mermaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this._mode = 'editor';
    App.navigate('diagrams', false);
  },

  openDrawing() {
    this._mode = 'draw';
    App.navigate('diagrams', false);
  },

  exitEditor() {
    if (this._dirty) this.saveDiagram(true);
    this._mode = 'gallery';
    this._activeDiagram = null;
    App.navigate('diagrams', false);
  },

  // ── Editor Actions ──────────────────────────────────────────
  saveDiagram(silent = false) {
    const d    = this._activeDiagram;
    if (!d) return;
    d.name      = document.getElementById('diag-name')?.value.trim() || d.name;
    d.code      = document.getElementById('diag-code')?.value || d.code;
    d.subjectId = document.getElementById('diag-subject')?.value || d.subjectId;
    d.updatedAt = new Date().toISOString();

    Storage.upsertDiagram(d);
    this._activeDiagram = d;
    this._dirty = false;
    if (!silent) App.toast(I18N.t('common_success'), 'success');
  },

  deleteDiagram(id) {
    App.confirm(I18N.t('common_confirm_delete'), () => {
      Storage.deleteDiagram(id);
      App.navigate('diagrams', false);
    });
  },

  insertSnippet(code) {
    const ta = document.getElementById('diag-code');
    if (!ta) return;
    const pos = ta.selectionStart;
    const val = ta.value;
    ta.value = val.substring(0, pos) + code + val.substring(pos);
    ta.focus();
    ta.selectionStart = ta.selectionEnd = pos + code.length;
    this.scheduleRender();
  },

  zoomIn()    { this._zoom = Math.min(3, this._zoom + 0.2); this._applyZoom(); },
  zoomOut()   { this._zoom = Math.max(0.3, this._zoom - 0.2); this._applyZoom(); },
  resetZoom() { this._zoom = 1; this._applyZoom(); },
  _applyZoom() {
    const el  = document.getElementById('diag-preview-output');
    const lbl = document.getElementById('diag-zoom-label');
    if (el)  el.style.transform = `scale(${this._zoom})`;
    if (lbl) lbl.textContent = `${Math.round(this._zoom * 100)}%`;
  },

  async exportDiagram() {
    const svg = document.querySelector('#diag-preview-output svg');
    if (!svg) { App.toast(I18N.lang==='vi'?'Chưa có sơ đồ để xuất!':'No diagram to export!','error'); return; }

    // Convert SVG to PNG using Canvas
    const svgData   = new XMLSerializer().serializeToString(svg);
    const svgBlob   = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url        = URL.createObjectURL(svgBlob);
    const img        = new Image();
    img.onload = () => {
      const canvas  = document.createElement('canvas');
      const scale   = 2; // 2× for retina
      canvas.width  = img.width  * scale;
      canvas.height = img.height * scale;
      const ctx     = canvas.getContext('2d');
      ctx.scale(scale, scale);
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const link = document.createElement('a');
      link.download = (this._activeDiagram?.name || 'diagram') + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      App.toast(I18N.lang==='vi'?'Đã xuất PNG!':'Exported PNG!','success');
    };
    img.src = url;
  },

  // ── DSA Graph & Table Builder ──────────────────────────────
  _builderTab: 'graph',
  _builderGraphDir: 'LR',
  _builderEdges: [
    { source: 'A', dir: '-->', target: 'B', label: '4' },
    { source: 'B', dir: '-->', target: 'C', label: '8' },
    { source: 'A', dir: '-->', target: 'C', label: '15' }
  ],
  _builderTable: {
    headers: ['Node', 'Visited', 'Parent', 'Distance'],
    rows: [
      ['A', 'Yes', '-', '0'],
      ['B', 'No', 'A', '4'],
      ['C', 'No', 'B', '12']
    ]
  },

  openDsaBuilder() {
    this._mode = 'dsa-builder';
    App.navigate('diagrams', false);
    setTimeout(() => this.updateBuilderOutput(), 100);
  },

  changeBuilderTab(tab) {
    this._builderTab = tab;
    App.navigate('diagrams', false);
    setTimeout(() => this.updateBuilderOutput(), 100);
  },

  updateBuilderGraphDir(dir) {
    this._builderGraphDir = dir;
    this.updateBuilderOutput();
  },

  _renderDsaBuilder() {
    const lang = I18N.lang;
    const tab = this._builderTab || 'graph';

    return `
    <div class="animate-fadeIn">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <button class="btn btn-ghost btn-sm" onclick="DiagramsPage.exitEditor()">
            <i data-lucide="arrow-left"></i> ${I18N.t('common_back')}
          </button>
          <h1 class="page-title" style="font-size:1.5rem">📐 ${lang==='vi'?'Bộ tạo Đồ thị & Bảng':'Graph & Table Builder'}</h1>
        </div>
      </div>

      <div class="tab-bar mb-4" style="width: fit-content; margin: 0 auto 1.5rem">
        <button class="tab-btn ${tab==='graph'?'active':''}" onclick="DiagramsPage.changeBuilderTab('graph')">
          🕸️ ${lang==='vi'?'Đồ thị Node-Edge (DSA)':'Node-Edge Graph'}
        </button>
        <button class="tab-btn ${tab==='table'?'active':''}" onclick="DiagramsPage.changeBuilderTab('table')">
          📋 ${lang==='vi'?'Bảng (Markdown)':'Markdown Table'}
        </button>
      </div>

      <div class="diagram-editor-layout">
        <!-- Editor Input Panel (Left) -->
        <div class="diagram-code-panel" style="overflow-y: auto; max-height: calc(100vh - 200px);">
          ${tab === 'graph' ? this._renderGraphInputs() : this._renderTableInputs()}
        </div>

        <!-- Render & Code Preview Panel (Right) -->
        <div class="diagram-preview-panel">
          <div class="flex items-center justify-between mb-2">
            <span style="font-size:0.75rem;color:var(--text-muted);font-weight:600">
              ${lang==='vi'?'XEM TRƯỚC':'PREVIEW'}
            </span>
            <button class="btn btn-primary btn-sm" onclick="DiagramsPage.copyBuilderOutput()">
              <i data-lucide="copy"></i> ${lang==='vi'?'Sao chép code':'Copy code'}
            </button>
          </div>

          <!-- Live Preview Area -->
          <div class="diagram-preview-area mb-3" style="min-height: 250px; background: #0d0d1a;">
            ${tab === 'graph' 
              ? `<div id="builder-graph-output" style="width: 100%;"></div>` 
              : `<div id="builder-table-output" style="width: 100%; overflow-x: auto;"></div>`
            }
          </div>

          <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;margin-bottom:0.5rem">
            ${lang==='vi'?'MÃ NGUỒN':'SOURCE CODE'}
          </div>
          <!-- Generated Source Code Area -->
          <textarea id="builder-code-output" class="diagram-code-input" style="height: 120px; min-height: 120px;" readonly></textarea>
        </div>
      </div>
    </div>`;
  },

  _renderGraphInputs() {
    const lang = I18N.lang;
    return `
    <div style="display:flex;flex-direction:column;gap:1rem">
      <div class="form-group" style="margin-bottom:0">
        <label class="form-label">${lang==='vi'?'Hướng đồ thị':'Graph Layout Direction'}</label>
        <select class="form-select" onchange="DiagramsPage.updateBuilderGraphDir(this.value)">
          <option value="LR" ${this._builderGraphDir==='LR'?'selected':''}>LR (Trái sang phải)</option>
          <option value="TD" ${this._builderGraphDir==='TD'?'selected':''}>TD (Trên xuống dưới)</option>
        </select>
      </div>

      <div>
        <label class="form-label">${lang==='vi'?'Danh sách các cạnh':'Edges List'}</label>
        <div id="builder-edges-list" style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1rem">
          ${this._builderEdges.map((e, i) => `
            <div class="flex items-center gap-2">
              <input type="text" class="form-input" style="width: 70px; text-align: center;" value="${e.source}" 
                oninput="DiagramsPage.updateBuilderEdge(${i}, 'source', this.value)" placeholder="Source">
              <select class="form-select" style="width: 80px;" onchange="DiagramsPage.updateBuilderEdge(${i}, 'dir', this.value)">
                <option value="-->" ${e.dir==='-->'?'selected':''}>➔ (Có hướng)</option>
                <option value="---" ${e.dir==='---'?'selected':''}>— (Vô hướng)</option>
                <option value="-.->" ${e.dir==='-.->'?'selected':''}>.➔ (Nét đứt)</option>
                <option value="-.-" ${e.dir==='-.-'?'selected':''}>... (Nét đứt)</option>
              </select>
              <input type="text" class="form-input" style="width: 70px; text-align: center;" value="${e.target}" 
                oninput="DiagramsPage.updateBuilderEdge(${i}, 'target', this.value)" placeholder="Target">
              <input type="text" class="form-input" style="flex:1;" value="${e.label}" 
                oninput="DiagramsPage.updateBuilderEdge(${i}, 'label', this.value)" placeholder="Label (weight/distance)">
              <button class="btn btn-danger btn-icon btn-sm" onclick="DiagramsPage.deleteBuilderEdge(${i})">✕</button>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-ghost w-full" onclick="DiagramsPage.addBuilderEdge()">
          <i data-lucide="plus"></i> ${lang==='vi'?'Thêm cạnh':'Add Edge'}
        </button>
      </div>
    </div>`;
  },

  _renderTableInputs() {
    const lang = I18N.lang;
    return `
    <div style="display:flex;flex-direction:column;gap:1.5rem">
      <div>
        <label class="form-label">${lang==='vi'?'Tiêu đề cột (Headers)':'Table Headers'}</label>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.75rem">
          ${this._builderTable.headers.map((h, i) => `
            <div style="position:relative;display:flex;align-items:center;">
              <input type="text" class="form-input" style="width: 100px; padding-right: 25px;" value="${h}" 
                oninput="DiagramsPage.updateBuilderTableHeader(${i}, this.value)">
              <button style="position:absolute;right:6px;background:none;border:none;color:var(--coral);cursor:pointer;font-size:11px" 
                onclick="DiagramsPage.deleteBuilderTableCol(${i})">✕</button>
            </div>
          `).join('')}
          <button class="btn btn-ghost btn-sm" onclick="DiagramsPage.addBuilderTableCol()">
            + ${lang==='vi'?'Cột':'Column'}
          </button>
        </div>
      </div>

      <div>
        <label class="form-label">${lang==='vi'?'Dữ liệu bảng (Rows)':'Table Rows'}</label>
        <div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1rem">
          ${this._builderTable.rows.map((row, rIdx) => `
            <div class="flex items-center gap-2">
              ${row.map((cell, cIdx) => `
                <input type="text" class="form-input" style="flex:1;" value="${cell}" 
                  oninput="DiagramsPage.updateBuilderTableCell(${rIdx}, ${cIdx}, this.value)">
              `).join('')}
              <button class="btn btn-danger btn-icon btn-sm" onclick="DiagramsPage.deleteBuilderTableRow(${rIdx})">✕</button>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-ghost w-full" onclick="DiagramsPage.addBuilderTableRow()">
          <i data-lucide="plus"></i> ${lang==='vi'?'Thêm dòng':'Add Row'}
        </button>
      </div>
    </div>`;
  },

  // ── Builder Actions & Generator Logic ──────────────────────
  updateBuilderEdge(idx, key, val) {
    this._builderEdges[idx][key] = val;
    this.updateBuilderOutput();
  },

  addBuilderEdge() {
    this._builderEdges.push({ source: '', dir: '-->', target: '', label: '' });
    App.navigate('diagrams', false);
    setTimeout(() => {
      this.updateBuilderOutput();
      if(window.lucide) lucide.createIcons();
    }, 50);
  },

  deleteBuilderEdge(idx) {
    this._builderEdges.splice(idx, 1);
    App.navigate('diagrams', false);
    setTimeout(() => {
      this.updateBuilderOutput();
      if(window.lucide) lucide.createIcons();
    }, 50);
  },

  updateBuilderTableHeader(idx, val) {
    this._builderTable.headers[idx] = val;
    this.updateBuilderOutput();
  },

  addBuilderTableCol() {
    this._builderTable.headers.push('Header');
    this._builderTable.rows.forEach(r => r.push(''));
    App.navigate('diagrams', false);
    setTimeout(() => {
      this.updateBuilderOutput();
      if(window.lucide) lucide.createIcons();
    }, 50);
  },

  deleteBuilderTableCol(idx) {
    if (this._builderTable.headers.length <= 1) return;
    this._builderTable.headers.splice(idx, 1);
    this._builderTable.rows.forEach(r => r.splice(idx, 1));
    App.navigate('diagrams', false);
    setTimeout(() => {
      this.updateBuilderOutput();
      if(window.lucide) lucide.createIcons();
    }, 50);
  },

  updateBuilderTableCell(rIdx, cIdx, val) {
    this._builderTable.rows[rIdx][cIdx] = val;
    this.updateBuilderOutput();
  },

  addBuilderTableRow() {
    const cols = this._builderTable.headers.length;
    this._builderTable.rows.push(new Array(cols).fill(''));
    App.navigate('diagrams', false);
    setTimeout(() => {
      this.updateBuilderOutput();
      if(window.lucide) lucide.createIcons();
    }, 50);
  },

  deleteBuilderTableRow(idx) {
    this._builderTable.rows.splice(idx, 1);
    App.navigate('diagrams', false);
    setTimeout(() => {
      this.updateBuilderOutput();
      if(window.lucide) lucide.createIcons();
    }, 50);
  },

  generateMermaidCode() {
    const dir = this._builderGraphDir || 'LR';
    const lines = [`flowchart ${dir}`];
    this._builderEdges.forEach(e => {
      const src = e.source.trim();
      const tgt = e.target.trim();
      const label = e.label.trim();
      if (!src || !tgt) return;

      if (label) {
        lines.push(`  ${src} -- "${label}" --> ${tgt}`);
      } else {
        lines.push(`  ${src} ${e.dir} ${tgt}`);
      }
    });
    return lines.join('\n');
  },

  generateMarkdownTable() {
    const headers = this._builderTable.headers;
    const rows = this._builderTable.rows;
    const line1 = '| ' + headers.join(' | ') + ' |';
    const line2 = '| ' + headers.map(() => '---').join(' | ') + ' |';
    const body = rows.map(r => '| ' + r.join(' | ') + ' |').join('\n');
    return `${line1}\n${line2}\n${body}`;
  },

  async updateBuilderOutput() {
    const tab = this._builderTab;
    const textarea = document.getElementById('builder-code-output');

    if (tab === 'graph') {
      const code = this.generateMermaidCode();
      if (textarea) textarea.value = code;

      const output = document.getElementById('builder-graph-output');
      if (output && window.mermaid) {
        try {
          const id = 'mermaid-builder-' + Date.now();
          const { svg } = await window.mermaid.render(id, code);
          output.innerHTML = svg;
        } catch (e) {
          // Keep showing last valid or empty
        }
      }
    } else {
      const md = this.generateMarkdownTable();
      if (textarea) textarea.value = md;

      const output = document.getElementById('builder-table-output');
      if (output) {
        let html = `<table class="notes-table" style="width:100%; border-collapse:collapse; background:rgba(255,255,255,0.03); border:1px solid var(--border);">`;
        html += `<thead style="background:rgba(255,255,255,0.05); font-weight:600;"><tr>`;
        this._builderTable.headers.forEach(h => {
          html += `<th style="padding:0.5rem; border:1px solid var(--border); color:var(--purple);">${h}</th>`;
        });
        html += `</tr></thead><tbody>`;
        this._builderTable.rows.forEach(r => {
          html += `<tr>`;
          r.forEach(cell => {
            html += `<td style="padding:0.5rem; border:1px solid var(--border); color:var(--text-primary);">${cell}</td>`;
          });
          html += `</tr>`;
        });
        html += `</tbody></table>`;
        output.innerHTML = html;
      }
    }
  },

  copyBuilderOutput() {
    const text = document.getElementById('builder-code-output')?.value || '';
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      App.toast(I18N.t('po_copied'), 'success');
    });
  },

  // ── Insert diagram into current Note ───────────────────────
  insertCurrentDiagramIntoNote() {
    // Save the diagram first so it's findable by Notes page
    this.saveDiagram(true);
    const d = this._activeDiagram;
    if (!d || !d.id) {
      App.toast(I18N.lang==='vi'?'Hãy lưu biểu đồ trước!':'Save the diagram first!', 'error');
      return;
    }
    // Store pending insert id, navigate to notes, notes page will pick it up
    window._pendingDiagramInsert = d.id;
    App.navigate('notes', false);
    App.toast(I18N.lang==='vi'?'Mở ghi chú và nhấn 📐 Biểu đồ để chèn':'Open a note and click 📐 Diagram to insert', 'info', 4000);
  },
};
