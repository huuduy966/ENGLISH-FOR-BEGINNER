# Thiết Kế Chi Tiết: Nâng Cấp Trang Chi Tiết Bài Học & 10 Dạng Câu Hỏi Tương Tác

- **Ngày tạo**: 2026-10-09
- **Dự án**: English for Beginner (E4B)
- **Mục tiêu**: Thiết kế lại toàn diện Thẻ từ vựng (Flashcard), tích hợp 10 dạng câu hỏi tương tác (Nối từ, Sắp xếp câu, Nghe chọn, Điền từ, Trắc nghiệm nghĩa, Sửa lỗi sai, Dịch câu, Hội thoại, Chọn từ phù hợp, Quiz tổng hợp), tùy biến số lượng bài tập theo cấp độ CEFR (A1–C2) và tối ưu hóa trải nghiệm 7 bước học tập trên trang `LessonDetailPage.jsx`.

---

## 1. Thiết Kế Thẻ Từ Vựng Đa Chiều (`FlashcardSection.jsx`)

### 1.1 Khắc phục nhược điểm hiện tại
- Thẻ hiện tại có quá nhiều khoảng trống và chỉ hiển thị một từ đơn lẻ.
- Phiên bản mới tối ưu hóa không gian hiển thị, cân đối thị giác, giàu thông tin sư phạm.

### 1.2 Bố cục Mặt trước (Front Side - Khám phá & Nhận diện)
- **Thanh trạng thái trên**:
  - Huy hiệu loại từ (`noun`, `verb`, `adjective`, `phrase`...) màu sắc nổi bật.
  - Nhãn danh mục chủ đề (Category).
  - Chỉ số thứ tự thẻ: `Từ 1 / 15` rõ ràng.
  - Nhóm nút thao tác:
    - 📖 Nút Tra từ điển nhanh (mở `QuickDictionaryModal`).
    - ❤️ Nút Yêu thích (lưu trạng thái favorite vào DB qua API `/vocabulary/:id/status`).
    - 🔖 Nút Đánh dấu cần ôn tập (Need Review).
- **Phần trung tâm**:
  - Từ tiếng Anh hiển thị lớn, sắc nét, font chữ hiện đại.
  - Phiên âm quốc tế IPA (ví dụ: `/həˈloʊ/`) font monospace chuyên dụng.
  - Nút **"Nghe phát âm"** kích thước lớn, màu xanh dương, tích hợp Web Speech API (giọng US bản ngữ).
  - **Nghĩa tiếng Việt gợi mở** và câu ví dụ tiếng Anh ngắn để người học nắm bắt ngữ nghĩa ngay lập tức mà không bắt buộc phải lật thẻ.
- **Thanh chỉ dẫn**: Icon lật thẻ 3D kèm dòng chữ hướng dẫn: *"Chạm hoặc bấm vào thẻ để lật xem ví dụ & từ liên quan"*.

### 1.3 Bố cục Mặt sau (Back Side - Chuyên sâu & Ngữ cảnh)
- **Hiệu ứng lật 3D (3D Flip Animation)** mượt mà khi người học click vào thẻ.
- **Giải nghĩa tiếng Việt đầy đủ**: Nghĩa chính, sắc thái biểu đạt.
- **Khối ví dụ thực tế (Example Box)**:
  - Câu ví dụ tiếng Anh trong ngữ cảnh giao tiếp thực tế.
  - Bản dịch tiếng Việt chuẩn xác từng câu.
- **Khối mở rộng WordNet / Datamuse**:
  - Danh sách từ đồng nghĩa (Synonyms), từ trái nghĩa (Antonyms) hoặc cụm từ thường đi kèm (Collocations) nếu có.
- Nút bấm *"Chạm để quay lại mặt trước"*.

### 1.4 Điều hướng & Thanh chọn từ nhanh (Word Selector Carousel)
- Nút `[ ← Từ trước ]` và `[ Từ tiếp theo → ]` (hỗ trợ bấm phím mũi tên bàn phím).
- **Thanh danh sách từ thu nhỏ**: Hiển thị lưới/dải các từ trong bài học dưới dạng chip nhỏ; học viên có thể click vào bất kỳ từ nào để nhảy ngay đến từ đó mà không phải bấm chuyển từng thẻ.

---

## 2. Hệ Thống 10 Dạng Câu Hỏi Tương Tác

Được tích hợp vào các bước **Ngữ pháp (`GrammarSection`)**, **Luyện nghe (`ListeningSection`)**, **Hội thoại (`ConversationSection`)**, **Bài tập (`ExerciseSection`)**, và **Quiz cuối bài (`QuizSection`)**:

1. **Trắc nghiệm nghĩa (Meaning Selection)**:
   - Hiển thị từ tiếng Anh (kèm nút nghe phát âm).
   - 4 đáp án nghĩa tiếng Việt, các phương án nhiễu hợp lý.
   - Phản hồi tức thì và giải thích ngắn.
2. **Chọn từ phù hợp (Fill Blank with Choices)**:
   - Câu tiếng Anh có chỗ trống `_____`.
   - Chọn từ đúng trong 4 lựa chọn để hoàn thiện câu.
3. **Điền từ còn thiếu (Text Input Fill-in)**:
   - Ô nhập văn bản (Input) để học viên tự gõ từ tiếng Anh còn thiếu.
   - So khớp không phân biệt hoa thường và tự động chuẩn hóa dấu cách.
4. **Nối từ (Interactive Matching Pairs Game)**:
   - 2 cột: Cột trái (4–5 từ tiếng Anh), Cột phải (4–5 nghĩa tiếng Việt bị xáo trộn).
   - Bấm chọn từ bên trái, sau đó chọn nghĩa tương ứng bên phải.
   - Nối đúng: Thẻ đổi màu xanh lá và khóa lại. Nối sai: Thẻ rung nhẹ báo hiệu thử lại.
5. **Sắp xếp câu (Word Order Drag/Click Tiles)**:
   - Các khối từ tiếng Anh xáo trộn.
   - Học viên bấm vào từng từ để xếp thành câu hoàn chỉnh đúng ngữ pháp.
   - Nút "Xếp lại" (Reset) để làm lại nếu chọn nhầm.
6. **Nghe và chọn (Listen & Choose)**:
   - Nút loa phát âm giọng đọc bản xứ.
   - Học viên lắng nghe và chọn đúng từ hoặc cụm từ vừa nghe.
7. **Sửa lỗi sai (Error Identification & Correction)**:
   - Câu văn có chứa 1 lỗi ngữ pháp/chính tả.
   - Học viên bấm chọn vị trí bị sai và chọn phương án sửa đúng từ menu gợi ý.
8. **Dịch câu (Sentence Translation)**:
   - Câu tiếng Việt cho trước.
   - Học viên dịch sang tiếng Anh bằng cách chọn từ các khối từ gợi ý theo đúng trật tự.
9. **Hội thoại tình huống (Situational Response)**:
   - Đưa ra bối cảnh đàm thoại và câu nói của Nhân vật A.
   - Học viên chọn câu đáp lại tự nhiên và lịch thiệp nhất của Nhân vật B.
10. **Quiz cuối bài (Comprehensive Final Quiz)**:
    - Tổng hợp ngẫu nhiên các dạng câu hỏi trên để chấm điểm toàn diện.
    - Yêu cầu đạt $\ge 70\%$ để tính hoàn thành bài học và mở khóa bài tiếp theo.

---

## 3. Cấu Trúc & Giao Diện 7 Bước Học Tập Chuyên Biệt

1. **Bước 1 - Từ vựng (`FlashcardSection`)**: Thẻ 3D hai mặt giàu thông tin, phát âm, ví dụ, carousel chọn nhanh.
2. **Bước 2 - Phát âm (`PronunciationSection`)**: Nghe mẫu, xem IPA, thu âm kiểm tra với Speech Recognition, ngưỡng đạt khắt khe $\ge 80\%$, đếm ngược 2.5s tự động chuyển từ.
3. **Bước 3 - Ngữ pháp (`GrammarSection`)**: Bảng công thức, giải thích cách dùng trực quan, ví dụ mẫu song ngữ, kèm bộ câu hỏi thực hành ngữ pháp tương tác ngay dưới lý thuyết.
4. **Bước 4 - Luyện nghe (`ListeningSection`)**: Trình phát audio giọng bản xứ (Play/Pause/Replay), transcript linh hoạt (có thể ẩn để thử thách khả năng nghe), kèm bộ câu hỏi nghe hiểu thấu đáo.
5. **Bước 5 - Hội thoại (`ConversationSection`)**: Đàm thoại từng lượt lời nhân vật, nút nghe riêng từng câu, chế độ phân vai luyện đọc, kèm bài tập chọn lời đáp tình huống.
6. **Bước 6 - Bài tập (`ExerciseSection`)**: Tập hợp các dạng bài tập tương tác (Nối từ, Sắp xếp câu, Điền từ, Dịch câu, Sửa lỗi sai) có kiểm tra đáp án và giải thích chi tiết.
7. **Bước 7 - Quiz cuối bài (`QuizSection`)**: Làm bài tổng kết, bảng điểm phần trăm, tổng kết câu đúng/sai và cho phép xem lại chi tiết từng câu sai.

---

## 4. Phân Bổ Định Mức Nội Dung Theo Cấp Độ CEFR (A1–C2)

| Cấp độ CEFR | Số lượng Từ vựng | Câu hỏi Ngữ pháp | Câu hỏi Luyện nghe | Lượt thoại & Câu hỏi | Câu hỏi Quiz cuối bài | Đặc điểm ngôn ngữ |
|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **A1** | 10–12 từ | 5 câu | 5 câu | 5 lượt/câu | 10 câu | Câu ngắn, từ thông dụng, tình huống đời sống thường nhật |
| **A2** | 12–15 từ | 6–8 câu | 5–8 câu | 5 lượt/câu | 10–12 câu | Quá khứ đơn, mua sắm, chỉ đường, so sánh hơn/nhất |
| **B1** | 15–18 từ | 8 câu | 8 câu | 6 lượt/câu | 12–15 câu | Câu phức, môi trường, công sở, phrasal verbs, hiện tại hoàn thành |
| **B2** | 15–20 từ | 8–10 câu | 8–10 câu | 6–8 lượt/câu | 15 câu | Tranh biện, thương mại, thành ngữ, mệnh đề quan hệ phức |
| **C1** | 15–20 từ | 10 câu | 10 câu | 8 lượt/câu | 15–20 câu | Tiếng Anh học thuật, tư duy phản biện, sắc thái nghĩa tinh tế |
| **C2** | 15–20 từ | 10 câu | 10 câu | 8 lượt/câu | 20 câu | Ngôn ngữ văn học, tu từ bậc thầy, phản xạ bản ngữ sâu sắc |

---

## 5. Quy Trình Lưu Trữ & Cập Nhật Dữ Liệu
- Cập nhật bộ sinh dữ liệu giáo trình (`server/prisma/curriculum/generators/` & `helper.js`) để bổ sung đủ số lượng bài tập, câu hỏi nghe, ngữ pháp và quiz theo đúng định mức CEFR.
- Chạy lại seeder `server/prisma/seed.js` để nạp kho câu hỏi phong phú vào SQLite.
- Lưu tiến độ học tập chính xác: chỉ cập nhật hoàn thành từng bước khi học viên thực sự thao tác; cập nhật điểm số và XP khi vượt qua Quiz $\ge 70\%$.
- Giữ nguyên toàn bộ cơ sở dữ liệu hiện có, các trang Dictionary, Placement Test, Dashboard, Profile không bị ảnh hưởng.
