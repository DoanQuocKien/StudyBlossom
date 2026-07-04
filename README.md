# StudyBloom 🌸
### *Hệ thống học tập cá nhân dành cho Nguyễn Hoàng Thơ* 💜

---

## 🚀 Cách chạy (How to run)

### Cách đơn giản nhất — Chỉ cần Frontend

1. Mở file `index.html` bằng trình duyệt (double-click)
2. Tất cả tính năng cơ bản hoạt động ngay lập tức!
   - ✅ Flashcard + SM-2
   - ✅ Quiz, Ghi chú, Lịch học
   - ✅ Đồng hồ Pomodoro
   - ✅ Tối ưu Prompt
   - ✅ Biểu đồ & Sơ đồ (Mermaid + Excalidraw)
   - ⚠️ OCR + AI Chat cần Backend (xem bên dưới)

---

## 🗺️ Tính năng khả dụng theo cách cài đặt

### Mức 1 — Chỉ mở `index.html` (không cần cài gì)

| Tính năng | Hoạt động? |
|---|---|
| 📚 Quản lý môn học, chủ đề | ✅ |
| 🃏 Flashcard + SM-2 spaced repetition | ✅ |
| ✏️ Quiz (MCQ, True/False, tính giờ) | ✅ |
| 📓 Ghi chú (rich text, toán KaTeX) | ✅ |
| 📐 Biểu đồ Mermaid (UML, FSM, ER...) | ✅ |
| ✏️ Vẽ tự do (Excalidraw — cần internet) | ✅ |
| 📅 Lịch học & Planner | ✅ |
| ⏱️ Đồng hồ Pomodoro | ✅ |
| 🎓 Đếm ngược kỳ thi | ✅ |
| ✨ Tối ưu Prompt (ChatGPT / Claude) | ✅ |
| 📐 Bộ tạo Đồ thị & Bảng DSA | ✅ |
| 📷 OCR nhận diện chữ viết tay | ❌ Cần Backend |
| 🧮 OCR công thức toán (LaTeX) | ❌ Cần Backend |
| 🤖 Trợ lý AI học tập (chat) | ❌ Cần Backend + Ollama |

---

### Mức 2 — Chạy `start.bat` (mở thêm Backend)

> Backend xử lý OCR và kết nối với Ollama. Tất cả tính năng Mức 1 vẫn hoạt động bình thường.

| Tính năng thêm | Hoạt động? |
|---|---|
| 📷 OCR chữ viết tay → văn bản | ✅ |
| 🧮 OCR công thức toán → LaTeX | ✅ |
| 📄 Trích xuất văn bản từ PDF | ✅ |
| 📂 Upload tài liệu vào bộ nhớ AI | ✅ |
| 🤖 Trợ lý AI học tập (RAG chat) | ❌ Vẫn cần Ollama |

---

### Mức 3 — Cài Ollama + tải `gemma3:4b` (mở thêm AI)

> Ollama chạy mô hình ngôn ngữ cục bộ trên máy tính, không cần mạng, không gửi dữ liệu ra ngoài.

| Tính năng thêm | Hoạt động? |
|---|---|
| 🤖 Chat hỏi đáp với tài liệu đã upload (RAG) | ✅ |
| 💬 Trả lời câu hỏi về OOP, DSA, Toán... | ✅ |
| 📖 Tóm tắt nội dung tài liệu | ✅ |
| 🔒 Hoàn toàn offline — không gửi dữ liệu ra ngoài | ✅ |

---

### Cách chạy từng mức

**Mức 1:** Double-click `index.html`

**Mức 2:** Double-click `start.bat`. File này tự động tìm môi trường chạy tối ưu theo thứ tự ưu tiên:

| Ưu tiên | Môi trường phát hiện | Hành động |
|---|---|---|
| 1 | Có file EXE (`backend/dist/StudyBloomBackend.exe`) | Chạy trực tiếp file EXE (nhanh nhất, không cần cài Python) |
| 2 | Python toàn cục (Global Python) đã cài trên máy | Chạy trực tiếp `python main.py` |
| 3 | Đã setup portable Python (`.python/python.exe`) | Chạy qua Python portable cục bộ |
| 4 | Không có gì | Tự động tải & cấu hình Python portable cục bộ (chỉ tải một lần) |

**Mức 3:** Cài Ollama + tải model:
```bash
# Tải Ollama từ https://ollama.com, rồi mở CMD và chạy:
ollama pull gemma3:4b
```
Sau đó chạy `start.bat` như bình thường.

---

## 🦙 Hướng dẫn cài đặt Ollama (AI Offline)

Ollama giúp chạy các mô hình ngôn ngữ lớn (LLM) cục bộ trên máy tính của bạn hoàn toàn miễn phí, bảo mật và không cần mạng internet.

### Bước 1: Tải và cài đặt Ollama
1. Truy cập trang chủ chính thức: [https://ollama.com](https://ollama.com)
2. Nhấn nút **Download** và chọn phiên bản dành cho hệ điều hành của bạn (Windows).
3. Sau khi tải về, nhấp đúp vào file cài đặt (ví dụ: `OllamaSetup.exe`) và hoàn tất quá trình cài đặt theo hướng dẫn trên màn hình.

### Bước 2: Tải mô hình học tập (Model)
Hệ thống StudyBloom sử dụng mô hình tối ưu cho CPU là `gemma3:4b` hoặc `llama3.2:3b`.
1. Mở cửa sổ dòng lệnh (**Command Prompt** hoặc **PowerShell**) trên Windows bằng cách nhấn phím `Windows` rồi gõ `cmd`.
2. Gõ lệnh sau để tải mô hình `gemma3:4b` (khoảng 3.3GB):
   ```bash
   ollama pull gemma3:4b
   ```
3. Đợi tiến trình tải hoàn tất 100%.

### Bước 3: Kiểm tra hoạt động
1. Đảm bảo biểu tượng Ollama (hình con lạc đà nhỏ) đang chạy ở khay hệ thống (System Tray) góc phải dưới màn hình.
2. Bạn có thể kiểm tra xem mô hình đã sẵn sàng chưa bằng cách chạy lệnh:
   ```bash
   ollama run gemma3:4b "Xin chào!"
   ```
   Nếu mô hình phản hồi lại tức là Ollama đã hoạt động chính xác. Nhấn `Ctrl + D` để thoát.

---

## 📦 (Tùy chọn nâng cao) Đóng gói thành file .exe

> ⚠️ **Không bắt buộc.** `start.bat` đã tự xử lý mọi trường hợp mà không cần `.exe`. Mục này chỉ dành cho trường hợp bạn muốn phân phối offline hoàn toàn (không có internet để tải Python portable).

```bash
cd backend
pip install pyinstaller
python build_exe.py
```

File tạo ra: `backend/dist/StudyBloomBackend.exe` — khi file này tồn tại, `start.bat` sẽ dùng nó thay vì Python.

---

## ✨ Các tính năng

| Tính năng | Mô tả |
|---|---|
| 📚 Môn học | Quản lý 5 môn + thêm môn mới, chủ đề, tiến độ |
| 🃏 Flashcard | SM-2 spaced repetition, lật 3D, import từ ảnh OCR |
| ✏️ Quiz / Phòng thi | Trắc nghiệm, Tự luận tạo bằng AI (có preview prompt gửi Ollama) hoặc import Đề thi thật (ảnh/PDF lưu IndexedDB), vẽ ghi chú, AI chấm điểm tự luận, xuất JSON/PDF |
| 📓 Ghi chú | Rich text, toán học (KaTeX), OCR, xuất PDF, chèn biểu đồ |
| 📅 Lịch học | Lịch tuần, sự kiện màu theo môn, mục tiêu giờ |
| ⏱️ Pomodoro | Đồng hồ học + nhạc nền, nhật ký phiên học |
| 📊 Dashboard | Heatmap, biểu đồ tuần, chuỗi ngày học, đếm ngược thi |
| 🎓 Kỳ thi | Đếm ngược, chuẩn bị nhanh, lịch sử điểm |
| 📐 Biểu đồ | Mermaid.js (UML, sequence, state, ER, FSM...) + Excalidraw tự do |
| 🤖 AI Chat | RAG với tài liệu của bạn (Ollama — CPU) |
| ✨ Prompt | Tối ưu prompt cho ChatGPT / Claude / Gemini |

---

## 📐 Biểu đồ được hỗ trợ

| Loại | Môn áp dụng |
|---|---|
| UML Class Diagram | OOP |
| Sequence Diagram | OOP |
| State Diagram | OOP, Digital Circuits |
| ER Diagram | OOP (Database) |
| Flowchart (thuật toán) | DSA |
| Graph (BFS/DFS) | DSA, Discrete Math |
| Logic Circuit | Digital Circuits |
| FSM (Finite State Machine) | Digital Circuits |
| Timing Diagram | Digital Circuits |
| Decision / Binary Tree | Discrete Math |
| Probability Tree (Bayes) | Prob & Stats |
| Vẽ tự do | Tất cả (qua Excalidraw) |

---

## 📁 Cấu trúc thư mục

```
d:\ILoveYou\
├── index.html              ← Mở file này để chạy app
├── style.css
├── app.js
├── pages/                  ← 11 trang chính
│   ├── dashboard.js
│   ├── subjects.js
│   ├── exams.js
│   ├── flashcards.js
│   ├── quiz.js             ← Trung tâm kiểm tra & phòng thi
│   ├── notes.js
│   ├── planner.js
│   ├── timer.js
│   ├── ai_assistant.js
│   ├── prompt_optimizer.js
│   └── diagrams.js         ← Mermaid + Excalidraw
├── utils/                  ← Tiện ích (storage, SM-2, i18n, IndexedDB)
│   ├── idb.js              ← Lưu trữ ảnh đề thi dung lượng lớn
│   ├── storage.js
│   ├── sm2.js
│   └── i18n.js
│   ├── main.py
│   ├── requirements.txt
│   ├── build_exe.py        ← Đóng gói thành file .exe
│   ├── routers/
│   └── services/
├── data/                   ← Tự tạo: uploads, ChromaDB
└── start.bat               ← Khởi động tất cả
```

---

## 💡 Mẹo sử dụng

- **Ngôn ngữ**: Nhấn nút `VI / EN` ở góc dưới sidebar để chuyển ngôn ngữ
- **Biểu đồ**: Dùng Mermaid cho UML/FSM/ER, dùng Excalidraw cho mạch điện phức tạp
- **OCR**: Chụp ảnh ghi tay rõ ràng, ánh sáng tốt để OCR chính xác hơn
- **Flashcard**: Học đều đặn mỗi ngày — SM-2 sẽ tự sắp xếp ôn tập hiệu quả
- **Prompt Optimizer**: Dùng để hỏi ChatGPT/Claude với câu hỏi được tối ưu
- **AI Chat**: Tải tài liệu PDF/ảnh lên trước, sau đó đặt câu hỏi


Made with 💜 for Nguyễn Hoàng Thơ
