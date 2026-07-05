# StudyBlossom 🌸
### *Hệ thống học tập cá nhân dành cho Nguyễn Hoàng Thơ* 💜

---

## 🚀 Cách chạy (How to run)

### Cách đơn giản nhất — Chỉ cần Frontend

1. Mở file `index.html` bằng trình duyệt (double-click)
2. Tất cả tính năng cơ bản hoạt động ngay lập tức — không cần cài gì!

---

## 🗺️ Tính năng khả dụng theo cách cài đặt

### Mức 1 — Chỉ mở `index.html` (không cần cài gì)

| Tính năng | Hoạt động? |
|---|---|
| 📚 Quản lý môn học, chủ đề | ✅ |
| 🃏 Flashcard + SM-2 spaced repetition | ✅ |
| ✏️ Quiz (MCQ, True/False, tính giờ) | ✅ |
| 📓 Ghi chú khối (block editor) | ✅ |
| 📐 Biểu đồ Mermaid (UML, FSM, ER...) | ✅ |
| ✏️ Vẽ tự do (Excalidraw — cần internet) | ✅ |
| 📅 Lịch học & Planner | ✅ |
| ⏱️ Đồng hồ Pomodoro | ✅ |
| 🎓 Đếm ngược kỳ thi | ✅ |
| ✨ Tối ưu Prompt (ChatGPT / Claude) | ✅ |
| 📷 OCR nhận diện chữ viết tay | ❌ Cần Backend |
| 🧮 OCR công thức toán (LaTeX) | ❌ Cần Backend |
| 🤖 Tạo đề thi bằng AI | ❌ Cần Backend + Ollama |
| 🤖 Trợ lý AI học tập (chat) | ❌ Cần Backend + Ollama |

---

### Mức 2 — Chạy `start.bat` (mở thêm Backend + tự cài Ollama)

> `start.bat` tự động phát hiện môi trường chạy tốt nhất, **tự cài Ollama** nếu chưa có, và **tự tải model Gemma3** ở nền.

💡 **Cách thiết lập nhanh & dễ dàng nhất (Không cần cài đặt Python)**:
1. Tải file dịch vụ chạy sẵn `StudyBlossomService.exe` tại [đây (Google Drive)](https://drive.google.com/file/d/1k6Ds0BPCrdSa4JCyjxt3s92HwGayJxFK/view?usp=sharing).
2. Lưu/Copy file vừa tải vào thư mục `backend/dist/` (tạo thư mục `dist` trong thư mục `backend` nếu chưa có).
3. Chạy file `start.bat` ở thư mục gốc để bắt đầu học tập ngay lập tức!

| Ưu tiên | Phát hiện | Hành động |
|---|---|---|
| 1️⃣ | `backend/dist/StudyBlossomService.exe` | Chạy trực tiếp (nhanh nhất, **không cần cài Python/thư viện**) |
| 2️⃣ | Python toàn cục đã cài | Chạy `python main.py` trực tiếp |
| 3️⃣ | Portable Python đã setup (`.python/`) | Dùng Python cục bộ |
| 4️⃣ | Không có gì | Tự tải & cấu hình Python portable (một lần duy nhất) |

Sau khi khởi động backend, `start.bat` còn:
- 🔍 Kiểm tra Ollama — tự cài qua `winget` hoặc tải thẳng trình cài đặt nếu chưa có
- 🦙 Pull model `gemma3` trong nền (chỉ lần đầu, ~3–5 GB)
- 🔁 Nếu cài Ollama thất bại → hiện `[R] Retry / [S] Skip`

| Tính năng thêm | Hoạt động? |
|---|---|
| 📷 OCR chữ viết tay → văn bản | ✅ |
| 🧮 OCR công thức toán → LaTeX | ✅ |
| 📄 Trích xuất văn bản từ PDF | ✅ |
| 📂 Upload tài liệu vào bộ nhớ AI | ✅ |
| 🤖 Trợ lý AI học tập (RAG chat) | ✅ (khi Ollama sẵn sàng) |
| 🤖 Tạo đề thi bằng AI (xem prompt trực tiếp) | ✅ (khi Ollama sẵn sàng) |

---

## ✨ Các tính năng chi tiết

### 📓 Ghi chú — Block Editor (mới)

Mỗi ghi chú là một tập hợp **khối (block)** có thể thêm, xóa, di chuyển tự do:

- **Thanh tìm kiếm thu gọn**: Có nút ẩn/hiện danh sách ghi chú ở góc trên sidebar để mở rộng không gian viết và đọc ghi chú tối đa.

| Loại khối | Tính năng |
|---|---|
| 📝 **Văn bản** | Rich text: in đậm, in nghiêng, gạch chân, danh sách, highlight, toán KaTeX, OCR, chèn biểu đồ |
| 💻 **Code** | Font Courier New, tự động thụt đầu dòng (C++ style: `{` → +1 cấp, `}` → -1 cấp), Tab = 4 spaces, chọn ngôn ngữ, copy 1 click |
| 🖼️ **Ảnh / PDF** | Upload và xem ngay, lưu IndexedDB (không giới hạn kích thước, không cần backend), PDF dùng `<embed>` — không cần cài gì |
| ∑ **Toán** | Hai panel: bên trái nhập LaTeX, bên phải xem trước KaTeX trực tiếp. 12 mẫu nhanh: phân số, tích phân, ma trận... |
| 📊 **Bảng / Sơ đồ** | Bảng chỉnh sửa trực tiếp (thêm/xóa hàng, cột, xuất CSV) hoặc chuyển sang tab 📐 để nhúng trực tiếp bất kỳ sơ đồ Mermaid đã lưu (DSA, OOP, Digital Circuits...) |

**Xuất PDF**: Tất cả khối được kết hợp thành 1 file PDF — ảnh nhúng thật (data URL), sơ đồ nhúng SVG vector, toán render KaTeX.

---

### 📚 Thẻ ghi nhớ (Flashcard) — Nhập đa năng & AI hỗ trợ (mới)

Hệ thống quản lý và thêm thẻ được thiết kế trực quan với 2 chế độ chính:
1. **✏️ Nhập tay (Manual Mode)**:
   - **Thẻ đơn**: Xem trước trực quan (mô phỏng thẻ 3D lật mặt trước/sau khi gõ). Nhấn thẻ để lật kiểm tra.
   - **Nhập hàng loạt**:
     - *Dòng lẻ/chẵn*: Dòng lẻ là câu hỏi, dòng chẵn là đáp án (mỗi cặp 2 dòng = 1 thẻ).
     - *Hai cột*: Nhập danh sách mặt trước và mặt sau độc lập theo từng cột song song (tạo thẻ tương ứng theo dòng).
2. **🤖 AI hỗ trợ (AI-Assisted Mode)**:
   - Tự động tạo thẻ từ ghi chú bất kỳ hoặc từ tài liệu quét OCR (chụp ảnh/tải PDF).
   - Chọn số lượng thẻ muốn tạo (3-30) bằng thanh trượt.
   - **Bước xác thực (Verify Step)**: Xem lại toàn bộ danh sách thẻ do AI tạo, chỉnh sửa trực tiếp nội dung hoặc bỏ tích chọn các câu không đạt trước khi lưu vào bộ thẻ.

---

### ✏️ Trung tâm kiểm tra (Quiz)

- Tạo đề bằng AI với **xem trước prompt** gửi Ollama theo thời gian thực
- Import đề thi thật (ảnh/PDF) lưu IndexedDB
- Trắc nghiệm: **đáp án ẩn đến khi nhấn xem** (không lộ ngay)
- AI chấm điểm tự luận (thang điểm, nhận xét)
- Xuất PDF bao gồm câu hỏi + đáp án + nhận xét AI

---

### 📐 Biểu đồ được hỗ trợ

| Loại | Môn áp dụng |
|---|---|
| UML Class Diagram | OOP |
| Sequence Diagram | OOP |
| State Diagram | OOP, Digital Circuits |
| ER Diagram | OOP (Database) |
| Flowchart (thuật toán) | DSA |
| Graph (BFS/DFS/Dijkstra) | DSA, Discrete Math |
| Logic Circuit | Digital Circuits |
| FSM (Finite State Machine) | Digital Circuits |
| Timing Diagram | Digital Circuits |
| Decision / Binary Tree | Discrete Math |
| Probability Tree (Bayes) | Prob & Stats |
| Vẽ tự do | Tất cả (qua Excalidraw) |

---

## 📦 (Tùy chọn) Đóng gói thành file .exe

> ⚠️ **Không bắt buộc.** `start.bat` đã tự xử lý mọi trường hợp. Mục này chỉ dành khi muốn phân phối hoàn toàn offline.

```bash
cd backend
pip install pyinstaller
python build_exe.py
```

File tạo ra: `backend/dist/StudyBlossomService.exe` — được theo dõi qua **Git LFS** (không làm nặng repo).

---

## 📁 Cấu trúc thư mục

```
StudyBlossom/
├── index.html              ← Mở file này để chạy app
├── style.css
├── app.js
├── start.bat               ← Khởi động backend + Ollama tự động
├── .gitignore
├── .gitattributes          ← Git LFS cho *.exe
├── pages/                  ← 11 trang chính
│   ├── dashboard.js
│   ├── subjects.js
│   ├── exams.js
│   ├── flashcards.js
│   ├── quiz.js             ← Trung tâm kiểm tra & phòng thi
│   ├── notes.js            ← Block editor (5 loại khối)
│   ├── planner.js
│   ├── timer.js
│   ├── ai_assistant.js
│   ├── prompt_optimizer.js
│   └── diagrams.js         ← Mermaid + Excalidraw
├── utils/
│   ├── idb.js              ← IndexedDB: lưu ảnh/PDF không giới hạn
│   ├── storage.js
│   ├── sm2.js
│   └── i18n.js
└── backend/
    ├── main.py
    ├── requirements.txt
    ├── build_exe.py
    ├── routers/
    ├── services/
    └── dist/
        └── StudyBlossomService.exe   ← Git LFS
```

---

## 💡 Mẹo sử dụng

- **Ngôn ngữ**: Nhấn nút `VI / EN` ở góc dưới sidebar để chuyển ngôn ngữ
- **Ghi chú**: Hover vào khoảng giữa 2 khối để hiện nút `+` thêm khối mới
- **Toán**: Nhập LaTeX ở panel trái, xem kết quả real-time ở panel phải
- **Code**: Nhấn `Tab` = 4 spaces, `Enter` sau `{` tự thêm 1 cấp thụt đầu dòng
- **Sơ đồ trong ghi chú**: Tạo sơ đồ ở trang Biểu đồ → vào Ghi chú → thêm khối Bảng/Sơ đồ → tab 📐
- **OCR**: Chụp ảnh ghi tay rõ ràng, ánh sáng tốt để OCR chính xác hơn
- **Flashcard**: Học đều đặn mỗi ngày — SM-2 sẽ tự sắp xếp ôn tập hiệu quả
- **AI Chat**: Tải tài liệu PDF/ảnh lên trước, sau đó đặt câu hỏi

---

Made with 💜 for Nguyễn Hoàng Thơ
