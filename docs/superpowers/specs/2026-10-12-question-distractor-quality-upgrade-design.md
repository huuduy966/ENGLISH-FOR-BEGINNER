# Thiết Kế Chi Tiết: Nâng Cấp Chất Lượng Câu Hỏi & Phương Án Nhiễu Toàn Diện (E4B)

**Ngày lập:** 2026-10-12  
**Mục tiêu:** Tăng độ khó thực tế, tạo các phương án nhiễu có tính liên quan cao và sư phạm chuẩn CEFR, loại bỏ hoàn toàn các đáp án lạc đề/vô lý, bảo đảm duy nhất một đáp án đúng cho toàn bộ ngân hàng câu hỏi trắc nghiệm của dự án English for Beginner (E4B).

---

## 1. Bối cảnh & Vấn đề Cần Giải Quyết

Hiện tại trong hệ thống E4B:
1. **Bài học & Quiz (`helper.js`)**: Một số câu hỏi sử dụng các phương án nhiễu cứng, lạc đề (ví dụ: `'bananas', 'airplanes', 'umbrellas'`, `'không cần thiết', 'bị cấm đoán', 'vô nghĩa'`).
2. **Đọc hiểu & Nghe hiểu**: Một số câu trắc nghiệm có phương án sai quá hiển nhiên (*"The global history of commercial aviation"*, *"Ten continuous hours on weekends"*, *"No regular practice is needed"*).
3. **Daily Practice (`dataGenerator.js`)**:
   - Phần Speaking (30 tình huống) chứa nhiều phương án thô lỗ hoặc vô nghĩa (*"No, the bus is red"*, *"Goodbye, see you never"*, *"Why are you bothering me on this phone?"*).
   - Phần Từ vựng ghép từ ngẫu nhiên không cùng từ loại/chủ đề (*table, house, water*).
4. **Placement Test (25 câu)**: Cần nâng cấp các phương án nhiễu thành các bẫy ngữ pháp và collocation chuẩn xác theo từng bậc CEFR (A1 đến C2).
5. **Yêu cầu bảo toàn**: Toàn bộ các bài thi tự luận (Điền từ, Tìm lỗi sai, Nghe tự luận, Sắp xếp câu trong bài thi 40 câu) **giữ nguyên 100% hình thức tự luận**, không chuyển thành trắc nghiệm. Không làm mất dữ liệu học viên, streak, điểm làm bài hay lịch sử thi.

---

## 2. Kiến Trúc & Các Thành Phần Nâng Cấp

### 2.1. Nâng cấp Placement Test (`server/prisma/curriculum/placementQuestions.js`)
- **25 câu hỏi chuẩn hóa**:
  - **A1–A2 (Câu 1–6, 16–17)**: Tập trung vào tính từ sở hữu (*Her / She / Hers / Her's*), To Be/Trợ động từ (*is / are / do / does*), Giới từ (*at / on / in / to*), câu nghe thời gian/hoạt động thực tế.
  - **B1–B2 (Câu 7–11, 18–21)**: Thì Hiện tại hoàn thành vs Quá khứ đơn, Phrasal verbs (*look after / take after / care for / look for*), Liên từ nhượng bộ (*although / despite / because / so that*), Modal verbs (*must / should / might / can't*), câu nghe thông tin chi tiết.
  - **C1–C2 (Câu 12–15, 22–25)**: Collocations học thuật nâng cao (*curb / stifle / mitigate / dampen inflation*), Đảo ngữ, Mệnh đề phân từ & giả định (*given that / notwithstanding / despite / whereas*), câu nghe suy luận học thuật.
- **Phân bố vị trí đáp án đúng**: Cân bằng ngẫu nhiên có kiểm soát giữa các vị trí A, B, C, D (khoảng 6–7 câu mỗi vị trí trên 25 câu).

### 2.2. Nâng cấp Trình sinh Nội dung 180 Bài học (`server/prisma/curriculum/generators/helper.js`)
- **Đọc hiểu (Reading Section - 5 câu/bài)**:
  - 100% phương án sai lấy từ ngữ cảnh học tập và ngôn ngữ:
    - *Câu ý chính*: 4 phương án đều về học ngôn ngữ, 1 câu tóm tắt chính xác, 3 câu là chi tiết nhỏ hoặc suy diễn quá mức.
    - *Câu chi tiết*: 4 khoảng thời gian/thói quen học tập hợp lý (*"Twenty minutes daily"*, *"Forty-five minutes twice a week"*, *"One hour every morning"*, *"Ten minutes before bedtime"*).
    - *Câu từ khóa & phương pháp*: 4 phương pháp học thực tế (*"Connecting new vocabulary to real-life situations"*, *"Practicing with interactive grammar exercises"*, *"Reviewing flashcards with spaced repetition"*, *"Engaging in paired speaking sessions"*).
- **Luyện nghe (Listening Section - 5 câu/bài)**:
  - Tất cả các phương án đều cùng trường nghĩa: Tên người phổ biến, nơi ở/thành phố lớn, nghề nghiệp sinh viên (*Language student*, *Teaching assistant*, *Translation intern*, *Language tutor*), lời khuyên học tập hợp lý.
- **Bài tập (Exercise Section)**:
  - `FILL_BLANK`: Phương án nhiễu lấy từ các từ vựng thực tế khác cùng bài học/cùng chủ đề.
  - `LISTEN_CHOOSE`: Phương án nhiễu là các từ vựng có cùng số âm tiết/chủ đề trong bài học.
  - `MULTIPLE_CHOICE`: Bắt buộc cùng từ loại (`partOfSpeech`).
- **Quiz cuối bài (Quiz Section)**:
  - Câu hỏi nghĩa từ: 3 distractors lấy từ các từ vựng khác trong bài học có **cùng từ loại** (`partOfSpeech`).
  - Câu điền từ: 3 distractors là các từ vựng trong bài học có cấu trúc ngữ pháp tương đương nhưng sai ngữ cảnh nghĩa (thay thế hoàn toàn `bananas, airplanes, umbrellas`).
  - Câu ngữ pháp: 4 câu hoàn chỉnh dùng từ vựng của bài, phản ánh lỗi sai chia thì, hòa hợp chủ vị, mạo từ thực tế.
  - Xáo trộn ngẫu nhiên phân bố đáp án đúng bằng thuật toán Fisher-Yates shuffle.

### 2.3. Nâng cấp Gói học Hàng ngày (`server/prisma/dailyQuestions/dataGenerator.js`)
- **Part 1 (Từ vựng - 20 câu)**:
  - Thuật toán chọn phương án nhiễu: Lọc từ vựng cùng level VÀ **bắt buộc cùng từ loại (`partOfSpeech`)**, ưu tiên cùng danh mục (`category`).
- **Part 2 (Luyện nói tình huống - 30 tình huống Speaking)**:
  - Viết lại 100% phương án sai cho toàn bộ 30 tình huống.
  - Tất cả 4 lựa chọn đều là câu nói lịch thiệp, chuẩn mực tiếng Anh giao tiếp đời sống/công sở, đại diện cho các sắc thái hoặc mục đích giao tiếp khác nhau, loại bỏ hoàn toàn các câu cộc cằn, vô lý (*"No, the bus is red"*, *"I hate weekends"*, *"Why are you bothering me on this phone?"*).
- **Part 3 (Tìm lỗi sai - 20 câu)**:
  - 4 phương án đều trích từ chính các cụm từ trong câu cần sửa.
- **Part 4 & 5 (Luyện nghe & Đọc hiểu - 20 câu)**:
  - Đồng bộ kế thừa trực tiếp từ 180 bài học đã chuẩn hóa.

### 2.4. Module Kiểm định Chất lượng Tự động (`server/tests/questionQualityValidation.test.js`)
Kiểm tra tự động toàn diện:
1. Đủ 4 phương án A, B, C, D cho mọi câu trắc nghiệm.
2. Đúng duy nhất 1 đáp án đúng nằm trong mảng options.
3. Không có phương án trùng lặp trong cùng 1 câu hỏi.
4. Tỷ lệ độ dài phương án cân đối.
5. Danh sách từ cấm/lạc đề: Quét sạch 100% các từ phi lý cũ (`bananas`, `airplanes`, `dinosaur`, `refrigerator`, `bus is red`, `vô nghĩa`, `cấm đoán`).
6. Phân bố vị trí đáp án đúng phân bổ hài hòa.

---

## 3. Kế Hoạch Triển Khai & Kiểm Thử

1. **Bước 1**: Cập nhật `placementQuestions.js` (25 câu kiểm tra đầu vào).
2. **Bước 2**: Nâng cấp `helper.js` (trình sinh Reading, Listening, Exercises, Quizzes cho 180 bài học).
3. **Bước 3**: Chạy `generateAll.js` để tái tạo dữ liệu sạch cho 6 file `a1.js` đến `c2.js`.
4. **Bước 4**: Nâng cấp `dataGenerator.js` (Part 1 Vocab filter cùng từ loại, Part 2 Speaking 30 tình huống lịch sự).
5. **Bước 5**: Viết bộ test kiểm định tự động `questionQualityValidation.test.js` và chạy kiểm tra chất lượng.
6. **Bước 6**: Chạy cập nhật database an toàn (`seed.js`) và chạy lại toàn bộ 14 test suites để đảm bảo Pass 100%.
