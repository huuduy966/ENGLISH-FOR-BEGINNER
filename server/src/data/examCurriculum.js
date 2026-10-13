// examCurriculum.js - Authentic 40-Question Proficiency Exam Bank with Rich Question Pools
// Quotas:
// Part 1: Vocabulary Fill-in (10 questions)
// Part 2: Error Identification & Correction (10 questions)
// Part 3: Listening Comprehension (1 cohesive track, 5 questions)
// Part 4.1: Reading Comprehension 1 (Passage 1, 5 questions)
// Part 4.2: Reading Comprehension 2 (Passage 2, 5 questions)
// Part 5: Sentence Reordering (5 questions)
// Total: strictly 40 questions, 60 minutes countdown, 10.0 scale

// =============================================================================
// 1. VOCABULARY FILL-IN POOL (Part 1 - 35 Questions)
// =============================================================================
const VOCAB_POOL = [
  {
    id: 'a1_p1_q1',
    prompt: 'My sister works at a hospital; she is a dedicated _____ who takes care of sick people.',
    hint: 'Danh từ chỉ nghề nghiệp chăm sóc bệnh nhân',
    correctAnswer: 'nurse',
    acceptedAnswers: ['nurse', 'doctor'],
    explanation: 'Trong ngữ cảnh bệnh viện và chăm sóc người ốm, từ chính xác là "nurse" (y tá) hoặc "doctor" (bác sĩ).'
  },
  {
    id: 'a1_p1_q2',
    prompt: 'It is raining heavily outside, so do not forget to bring your _____ with you.',
    hint: 'Vật dụng che mưa',
    correctAnswer: 'umbrella',
    acceptedAnswers: ['umbrella', 'raincoat'],
    explanation: 'Vật dụng mang theo khi trời mưa là "umbrella" (chiếc ô) hoặc "raincoat" (áo mưa).'
  },
  {
    id: 'a1_p1_q3',
    prompt: 'Every morning at 7 o’clock, I eat a nutritious _____ before going to school.',
    hint: 'Bữa ăn đầu tiên trong ngày',
    correctAnswer: 'breakfast',
    acceptedAnswers: ['breakfast', 'meal'],
    explanation: 'Bữa ăn sáng lúc 7 giờ là "breakfast".'
  },
  {
    id: 'a1_p1_q4',
    prompt: 'The library is very quiet because students need to concentrate on their _____.',
    hint: 'Danh từ chỉ việc học tập / nghiên cứu',
    correctAnswer: 'studies',
    acceptedAnswers: ['studies', 'study', 'lessons', 'work', 'homework'],
    explanation: 'Học sinh cần giữ yên tĩnh để tập trung vào việc học ("studies" / "lessons").'
  },
  {
    id: 'a1_p1_q5',
    prompt: 'My brother has two daughters, so they are my favorite _____.',
    hint: 'Danh từ số nhiều chỉ các cháu gái',
    correctAnswer: 'nieces',
    acceptedAnswers: ['nieces', 'niece'],
    explanation: 'Con gái của anh/em trai là cháu gái ("nieces").'
  },
  {
    id: 'a1_p1_q6',
    prompt: 'Could you please _____ the window? The weather is becoming quite warm in this room.',
    hint: 'Động từ mang nghĩa "mở"',
    correctAnswer: 'open',
    acceptedAnswers: ['open'],
    explanation: 'Cấu trúc "Could you please open the window?" dùng để yêu cầu lịch sự mở cửa sổ.'
  },
  {
    id: 'a1_p1_q7',
    prompt: 'English is an important international _____ that connects people from all around the world.',
    hint: 'Danh từ chỉ "ngôn ngữ"',
    correctAnswer: 'language',
    acceptedAnswers: ['language'],
    explanation: '"Language" nghĩa là ngôn ngữ quốc tế.'
  },
  {
    id: 'a1_p1_q8',
    prompt: 'I am so _____ because I have not had anything to drink since early this morning.',
    hint: 'Tính từ mang nghĩa "khát nước"',
    correctAnswer: 'thirsty',
    acceptedAnswers: ['thirsty'],
    explanation: 'Không có gì uống từ sáng dẫn đến tình trạng "thirsty" (khát nước).'
  },
  {
    id: 'a1_p1_q9',
    prompt: 'A person who writes books or news articles for a living is called an _____.',
    hint: 'Danh từ chỉ tác giả / nhà văn',
    correctAnswer: 'author',
    acceptedAnswers: ['author', 'writer'],
    explanation: 'Người viết sách là "author" hoặc "writer".'
  },
  {
    id: 'a1_p1_q10',
    prompt: 'On weekends, we usually visit our _____ who live in a peaceful countryside village.',
    hint: 'Danh từ chỉ ông bà',
    correctAnswer: 'grandparents',
    acceptedAnswers: ['grandparents', 'parents', 'relatives'],
    explanation: 'Thăm ông bà ("grandparents") ở vùng quê thanh bình.'
  },
  {
    id: 'a1_p1_q11',
    prompt: 'I need to go to the grocery store to buy fresh _____ such as apples, oranges, and bananas.',
    hint: 'Danh từ chỉ trái cây',
    correctAnswer: 'fruits',
    acceptedAnswers: ['fruits', 'fruit'],
    explanation: 'Táo, cam và chuối là các loại trái cây ("fruits" / "fruit").'
  },
  {
    id: 'a1_p1_q12',
    prompt: 'He looked at his wrist _____ to check whether he was late for the appointment.',
    hint: 'Đồng hồ đeo tay',
    correctAnswer: 'watch',
    acceptedAnswers: ['watch'],
    explanation: 'Đồng hồ đeo tay trong tiếng Anh là "watch".'
  },
  {
    id: 'a1_p1_q13',
    prompt: 'My father drives his car to _____ every morning at half past seven.',
    hint: 'Nơi làm việc / công sở',
    correctAnswer: 'work',
    acceptedAnswers: ['work', 'office', 'company'],
    explanation: 'Cụm từ "drive to work" nghĩa là lái xe đi làm.'
  },
  {
    id: 'a1_p1_q14',
    prompt: 'Could you lend me a blue _____ so that I can sign this application form?',
    hint: 'Bút viết',
    correctAnswer: 'pen',
    acceptedAnswers: ['pen'],
    explanation: 'Vật dụng để ký giấy tờ là chiếc bút ("pen").'
  },
  {
    id: 'a1_p1_q15',
    prompt: 'The sun rises in the _____ and sets in the west every single day.',
    hint: 'Phương Đông',
    correctAnswer: 'east',
    acceptedAnswers: ['east'],
    explanation: 'Mặt trời mọc ở hướng Đông ("east").'
  },
  {
    id: 'a1_p1_q16',
    prompt: 'Remember to turn off the _____ before leaving the bedroom to conserve electrical energy.',
    hint: 'Đèn chiếu sáng',
    correctAnswer: 'lights',
    acceptedAnswers: ['lights', 'light'],
    explanation: 'Tắt đèn ("turn off the lights") trước khi rời phòng để tiết kiệm điện.'
  },
  {
    id: 'a1_p1_q17',
    prompt: 'We went to the movie _____ on Saturday night to watch an exciting adventure film.',
    hint: 'Rạp chiếu phim',
    correctAnswer: 'theater',
    acceptedAnswers: ['theater', 'theatre', 'cinema'],
    explanation: 'Rạp chiếu phim trong tiếng Anh là "theater" hoặc "cinema".'
  },
  {
    id: 'a1_p1_q18',
    prompt: 'When I had a high fever, the doctor advised me to take this _____ twice a day.',
    hint: 'Thuốc men',
    correctAnswer: 'medicine',
    acceptedAnswers: ['medicine', 'medication', 'pills'],
    explanation: 'Thuốc chữa bệnh do bác sĩ kê đơn là "medicine".'
  },
  {
    id: 'a1_p1_q19',
    prompt: 'Our new apartment is located on the fifth _____ of a modern residential building.',
    hint: 'Tầng lầu',
    correctAnswer: 'floor',
    acceptedAnswers: ['floor'],
    explanation: 'Tầng của tòa nhà là "floor" (fifth floor).'
  },
  {
    id: 'a1_p1_q20',
    prompt: 'After having a delicious dinner, we helped our mother wash the dirty _____ in the sink.',
    hint: 'Bát đĩa',
    correctAnswer: 'dishes',
    acceptedAnswers: ['dishes', 'plates'],
    explanation: 'Rửa bát đĩa bẩn sau bữa ăn là "wash the dishes".'
  },
  {
    id: 'a1_p1_q21',
    prompt: 'A trained professional who operates an airplane in flight is called a _____.',
    hint: 'Phi công',
    correctAnswer: 'pilot',
    acceptedAnswers: ['pilot'],
    explanation: 'Người lái máy bay là "pilot" (phi công).'
  },
  {
    id: 'a1_p1_q22',
    prompt: 'During the hot summer holidays, many tourists enjoy relaxing on the sandy _____.',
    hint: 'Bãi biển',
    correctAnswer: 'beach',
    acceptedAnswers: ['beach', 'seaside'],
    explanation: 'Bãi cát thư giãn mùa hè là "beach".'
  },
  {
    id: 'a1_p1_q23',
    prompt: 'Because it was freezing outside, she wrapped a woolen _____ around her neck.',
    hint: 'Khăn quàng cổ',
    correctAnswer: 'scarf',
    acceptedAnswers: ['scarf'],
    explanation: 'Khăn len quàng cổ giữ ấm mùa đông là "scarf".'
  },
  {
    id: 'a1_p1_q24',
    prompt: 'Before boarding the international flight, every passenger must show their passport and flight _____.',
    hint: 'Vé máy bay',
    correctAnswer: 'ticket',
    acceptedAnswers: ['ticket', 'boarding pass'],
    explanation: 'Vé máy bay lên tàu bay là "ticket".'
  },
  {
    id: 'a1_p1_q25',
    prompt: 'I was so _____ after jogging ten kilometers that I fell asleep on the sofa immediately.',
    hint: 'Mệt mỏi',
    correctAnswer: 'tired',
    acceptedAnswers: ['tired', 'exhausted'],
    explanation: 'Cảm giác mệt mỏi sau khi chạy bộ là "tired".'
  },
  {
    id: 'a1_p1_q26',
    prompt: 'If today is Thursday, then yesterday was _____ afternoon.',
    hint: 'Thứ Tư',
    correctAnswer: 'Wednesday',
    acceptedAnswers: ['wednesday'],
    explanation: 'Ngày trước thứ Năm là thứ Tư ("Wednesday").'
  },
  {
    id: 'a1_p1_q27',
    prompt: 'She ordered a hot cup of black _____ with two spoons of brown sugar at the coffee shop.',
    hint: 'Cà phê',
    correctAnswer: 'coffee',
    acceptedAnswers: ['coffee', 'tea'],
    explanation: 'Đồ uống phổ biến tại quán là "coffee" (cà phê).'
  },
  {
    id: 'a1_p1_q28',
    prompt: 'Birds have lightweight feathers and strong wings that enable them to _____ in the sky.',
    hint: 'Động từ "bay"',
    correctAnswer: 'fly',
    acceptedAnswers: ['fly'],
    explanation: 'Động từ bay trên bầu trời là "fly".'
  },
  {
    id: 'a1_p1_q29',
    prompt: 'The teacher used a colorful marker to write grammar formulas on the large _____.',
    hint: 'Bảng lớp học',
    correctAnswer: 'board',
    acceptedAnswers: ['board', 'whiteboard'],
    explanation: 'Bảng viết trong lớp học là "board" hoặc "whiteboard".'
  },
  {
    id: 'a1_p1_q30',
    prompt: 'He keeps his identity card, driving license, and paper cash inside a small leather _____.',
    hint: 'Ví tiền',
    correctAnswer: 'wallet',
    acceptedAnswers: ['wallet', 'purse'],
    explanation: 'Ví đựng tiền và giấy tờ là "wallet".'
  },
  {
    id: 'a1_p1_q31',
    prompt: 'If you encounter an unfamiliar English word, you should check its definition in a _____.',
    hint: 'Từ điển',
    correctAnswer: 'dictionary',
    acceptedAnswers: ['dictionary'],
    explanation: 'Sách tra nghĩa từ vựng là "dictionary".'
  },
  {
    id: 'a1_p1_q32',
    prompt: 'Ice cubes will quickly _____ and turn into liquid water if placed under direct sunlight.',
    hint: 'Động từ "tan chảy"',
    correctAnswer: 'melt',
    acceptedAnswers: ['melt'],
    explanation: 'Đá lạnh tan chảy trong nhiệt độ ấm là "melt".'
  },
  {
    id: 'a1_p1_q33',
    prompt: 'We watered the blooming red roses and yellow _____ growing in our backyard garden.',
    hint: 'Hoa',
    correctAnswer: 'flowers',
    acceptedAnswers: ['flowers', 'flower'],
    explanation: 'Hoa trong vườn nhà là "flowers".'
  },
  {
    id: 'a1_p1_q34',
    prompt: 'A chef is a skilled person whose main job is to prepare and cook delicious _____ in a restaurant.',
    hint: 'Món ăn / thực phẩm',
    correctAnswer: 'food',
    acceptedAnswers: ['food', 'meals', 'dishes'],
    explanation: 'Đầu bếp nấu món ăn ngon ("food" / "meals").'
  },
  {
    id: 'a1_p1_q35',
    prompt: 'She exercises at the sports center three times a _____ to stay fit and energetic.',
    hint: 'Tuần lễ',
    correctAnswer: 'week',
    acceptedAnswers: ['week', 'month'],
    explanation: 'Tập thể dục 3 lần 1 tuần ("three times a week").'
  }
];

// =============================================================================
// 2. ERROR IDENTIFICATION & CORRECTION POOL (Part 2 - 30 Questions)
// =============================================================================
const ERROR_CORRECTION_POOL = [
  {
    id: 'a1_p2_q1',
    prompt: '<u>She</u> (A) <u>don\'t</u> (B) <u>like</u> (C) drinking cold water in the <u>winter</u> (D).',
    errorPart: 'B',
    correctCorrection: 'doesn\'t',
    acceptedAnswers: ['doesn\'t', 'doesnt', 'does not'],
    explanation: 'Chủ ngữ "She" là ngôi thứ 3 số ít, trợ động từ phủ định phải là "doesn\'t", không dùng "don\'t".'
  },
  {
    id: 'a1_p2_q2',
    prompt: '<u>There</u> (A) <u>is</u> (B) <u>two large apples</u> (C) on the wooden <u>table</u> (D).',
    errorPart: 'B',
    correctCorrection: 'are',
    acceptedAnswers: ['are'],
    explanation: 'Danh từ "two large apples" là số nhiều, động từ To Be phải chia là "are".'
  },
  {
    id: 'a1_p2_q3',
    prompt: '<u>Yesterday afternoon</u> (A), <u>my brother</u> (B) <u>go</u> (C) to the supermarket <u>alone</u> (D).',
    errorPart: 'C',
    correctCorrection: 'went',
    acceptedAnswers: ['went'],
    explanation: 'Trạng từ quá khứ "Yesterday afternoon" đòi hỏi động từ "go" chia ở quá khứ đơn là "went".'
  },
  {
    id: 'a1_p2_q4',
    prompt: '<u>He is</u> (A) <u>more tall</u> (B) than his <u>elder</u> (C) <u>brother David</u> (D).',
    errorPart: 'B',
    correctCorrection: 'taller',
    acceptedAnswers: ['taller'],
    explanation: '"Tall" là tính từ ngắn 1 âm tiết, dạng so sánh hơn là "taller", không dùng "more tall".'
  },
  {
    id: 'a1_p2_q5',
    prompt: '<u>The children</u> (A) <u>is playing</u> (B) football <u>happily</u> (C) in the <u>schoolyard</u> (D).',
    errorPart: 'B',
    correctCorrection: 'are playing',
    acceptedAnswers: ['are playing', 'are'],
    explanation: '"Children" là danh từ số nhiều (những đứa trẻ), trợ động từ phải là "are playing".'
  },
  {
    id: 'a1_p2_q6',
    prompt: 'I <u>have</u> (A) <u>a honest</u> (B) friend who <u>always</u> (C) <u>tells the truth</u> (D).',
    errorPart: 'B',
    correctCorrection: 'an honest',
    acceptedAnswers: ['an honest', 'an'],
    explanation: 'Từ "honest" bắt đầu bằng âm câm /ɒ/, do đó mạo từ đi kèm phải là "an honest", không dùng "a".'
  },
  {
    id: 'a1_p2_q7',
    prompt: 'They <u>usually</u> (A) <u>listens</u> (B) to <u>classical music</u> (C) before <u>sleeping</u> (D).',
    errorPart: 'B',
    correctCorrection: 'listen',
    acceptedAnswers: ['listen'],
    explanation: 'Chủ ngữ "They" là số nhiều, ở hiện tại đơn động từ giữ nguyên mẫu "listen".'
  },
  {
    id: 'a1_p2_q8',
    prompt: 'She <u>can</u> (A) <u>speaks</u> (B) <u>three foreign languages</u> (C) very <u>fluently</u> (D).',
    errorPart: 'B',
    correctCorrection: 'speak',
    acceptedAnswers: ['speak'],
    explanation: 'Sau động từ khuyết thiếu "can", động từ chính phải ở dạng nguyên thể không "s": "speak".'
  },
  {
    id: 'a1_p2_q9',
    prompt: '<u>How many</u> (A) <u>water</u> (B) do you <u>drink</u> (C) every <u>single day</u> (D)?',
    errorPart: 'A',
    correctCorrection: 'How much',
    acceptedAnswers: ['How much', 'much'],
    explanation: '"Water" là danh từ không đếm được, câu hỏi lượng phải dùng "How much", không dùng "How many".'
  },
  {
    id: 'a1_p2_q10',
    prompt: 'We <u>arrived</u> (A) <u>to</u> (B) the train station <u>on</u> (C) <u>Monday morning</u> (D).',
    errorPart: 'B',
    correctCorrection: 'at',
    acceptedAnswers: ['at', 'in'],
    explanation: 'Đến một địa điểm cụ thể dùng "arrive at" (ga tàu, sân bay), không dùng "arrive to".'
  },
  {
    id: 'a1_p2_q11',
    prompt: 'She <u>is</u> (A) <u>study</u> (B) English <u>very hard</u> (C) for her upcoming <u>examination</u> (D).',
    errorPart: 'B',
    correctCorrection: 'studying',
    acceptedAnswers: ['studying'],
    explanation: 'Sau "is" trong thì hiện tại tiếp diễn, động từ phải thêm đuôi -ing: "studying".'
  },
  {
    id: 'a1_p2_q12',
    prompt: 'My <u>parents</u> (A) <u>has</u> (B) lived in this <u>peaceful town</u> (C) for over twenty <u>years</u> (D).',
    errorPart: 'B',
    correctCorrection: 'have',
    acceptedAnswers: ['have'],
    explanation: 'Chủ ngữ "My parents" là danh từ số nhiều, trợ động từ hiện tại hoàn thành phải là "have".'
  },
  {
    id: 'a1_p2_q13',
    prompt: 'He <u>didn\'t went</u> (A) to the <u>dentist</u> (B) yesterday because he was <u>too busy</u> (C) at <u>work</u> (D).',
    errorPart: 'A',
    correctCorrection: 'didn\'t go',
    acceptedAnswers: ['didn\'t go', 'didnt go', 'did not go', 'go'],
    explanation: 'Sau trợ động từ quá khứ phủ định "didn\'t", động từ chính phải ở dạng nguyên thể: "didn\'t go".'
  },
  {
    id: 'a1_p2_q14',
    prompt: 'This <u>novel</u> (A) is <u>more cheap</u> (B) than the one <u>we saw</u> (C) at the downtown <u>bookstore</u> (D).',
    errorPart: 'B',
    correctCorrection: 'cheaper',
    acceptedAnswers: ['cheaper'],
    explanation: '"Cheap" là tính từ ngắn 1 âm tiết, dạng so sánh hơn đúng là "cheaper", không dùng "more cheap".'
  },
  {
    id: 'a1_p2_q15',
    prompt: 'She <u>walks</u> (A) to <u>school</u> (B) <u>on foot</u> (C) <u>every mornings</u> (D).',
    errorPart: 'D',
    correctCorrection: 'every morning',
    acceptedAnswers: ['every morning'],
    explanation: 'Cụm trạng từ tần suất đi với "every" dùng danh từ số ít: "every morning".'
  },
  {
    id: 'a1_p2_q16',
    prompt: 'There <u>aren\'t</u> (A) <u>some</u> (B) fresh apples left <u>in</u> (C) the kitchen <u>refrigerator</u> (D).',
    errorPart: 'B',
    correctCorrection: 'any',
    acceptedAnswers: ['any'],
    explanation: 'Trong câu phủ định, ta dùng "any" thay vì "some": "aren\'t any fresh apples".'
  },
  {
    id: 'a1_p2_q17',
    prompt: 'Look! The <u>yellow bus</u> (A) <u>comes</u> (B) around the <u>corner</u> (C) right <u>now</u> (D).',
    errorPart: 'B',
    correctCorrection: 'is coming',
    acceptedAnswers: ['is coming', 'coming'],
    explanation: 'Dấu hiệu "Look!" và "right now" diễn tả hành động đang diễn ra, chia hiện tại tiếp diễn: "is coming".'
  },
  {
    id: 'a1_p2_q18',
    prompt: 'She <u>is married</u> (A) <u>with</u> (B) a talented <u>software</u> (C) <u>developer</u> (D).',
    errorPart: 'B',
    correctCorrection: 'to',
    acceptedAnswers: ['to'],
    explanation: 'Cấu trúc kết hôn với ai dùng giới từ "to": "married to", không dùng "married with".'
  },
  {
    id: 'a1_p2_q19',
    prompt: '<u>Everyone</u> (A) in the <u>auditorium</u> (B) <u>were</u> (C) listening <u>attentively</u> (D).',
    errorPart: 'C',
    correctCorrection: 'was',
    acceptedAnswers: ['was'],
    explanation: 'Đại từ bất định "Everyone" luôn đi kèm với động từ số ít: "was listening".'
  },
  {
    id: 'a1_p2_q20',
    prompt: 'He <u>drives</u> (A) his car very <u>careful</u> (B) whenever it <u>rains</u> (C) heavily at <u>night</u> (D).',
    errorPart: 'B',
    correctCorrection: 'carefully',
    acceptedAnswers: ['carefully'],
    explanation: 'Bổ nghĩa cho động từ thường "drives" phải dùng trạng từ "carefully", không dùng tính từ "careful".'
  },
  {
    id: 'a1_p2_q21',
    prompt: 'We <u>look forward to</u> (A) <u>see</u> (B) our close friends at the <u>reunion</u> (C) next <u>Sunday</u> (D).',
    errorPart: 'B',
    correctCorrection: 'seeing',
    acceptedAnswers: ['seeing'],
    explanation: 'Sau cụm "look forward to" là danh động từ V-ing: "look forward to seeing".'
  },
  {
    id: 'a1_p2_q22',
    prompt: 'Why <u>you are</u> (A) sitting <u>alone</u> (B) in the dark <u>room</u> (C) like <u>that</u> (D)?',
    errorPart: 'A',
    correctCorrection: 'are you',
    acceptedAnswers: ['are you'],
    explanation: 'Trong câu hỏi với từ để hỏi "Why", trợ động từ phải đảo lên trước chủ ngữ: "Why are you".'
  },
  {
    id: 'a1_p2_q23',
    prompt: 'She <u>was born</u> (A) <u>at</u> (B) October 12th, <u>2001</u> (C) in <u>Da Nang city</u> (D).',
    errorPart: 'B',
    correctCorrection: 'on',
    acceptedAnswers: ['on'],
    explanation: 'Trước ngày tháng cụ thể (October 12th), ta dùng giới từ "on", không dùng "at".'
  },
  {
    id: 'a1_p2_q24',
    prompt: 'You <u>must to complete</u> (A) all assigned <u>tasks</u> (B) before <u>going</u> (C) home <u>today</u> (D).',
    errorPart: 'A',
    correctCorrection: 'must complete',
    acceptedAnswers: ['must complete', 'complete'],
    explanation: 'Động từ khuyết thiếu "must" đi trực tiếp với động từ nguyên thể không "to": "must complete".'
  },
  {
    id: 'a1_p2_q25',
    prompt: 'This <u>hot chicken soup</u> (A) <u>tastes</u> (B) very <u>deliciously</u> (C) on a cold <u>evening</u> (D).',
    errorPart: 'C',
    correctCorrection: 'delicious',
    acceptedAnswers: ['delicious'],
    explanation: 'Động từ chỉ giác quan "taste" đi với tính từ miêu tả: "tastes delicious", không dùng trạng từ.'
  },
  {
    id: 'a1_p2_q26',
    prompt: 'The <u>information</u> (A) provided in this <u>guidebook</u> (B) <u>are</u> (C) very helpful to <u>travelers</u> (D).',
    errorPart: 'C',
    correctCorrection: 'is',
    acceptedAnswers: ['is'],
    explanation: '"Information" là danh từ không đếm được, động từ To Be phải chia số ít là "is".'
  },
  {
    id: 'a1_p2_q27',
    prompt: 'She <u>has</u> (A) a collection of <u>three beautiful watches</u> (B) made <u>by</u> (C) pure <u>gold</u> (D).',
    errorPart: 'C',
    correctCorrection: 'of',
    acceptedAnswers: ['of', 'from'],
    explanation: 'Làm bằng chất liệu gì dùng "made of gold" (giữ nguyên bản chất kim loại).'
  },
  {
    id: 'a1_p2_q28',
    prompt: 'He <u>is</u> (A) interested <u>about</u> (B) learning <u>foreign languages</u> (C) and World <u>History</u> (D).',
    errorPart: 'B',
    correctCorrection: 'in',
    acceptedAnswers: ['in'],
    explanation: 'Tính từ "interested" đi với giới từ "in": "interested in", không dùng "interested about".'
  },
  {
    id: 'a1_p2_q29',
    prompt: '<u>Neither</u> (A) of the two <u>candidates</u> (B) <u>have</u> (C) enough work <u>experience</u> (D).',
    errorPart: 'C',
    correctCorrection: 'has',
    acceptedAnswers: ['has'],
    explanation: 'Chủ ngữ "Neither of + plural noun" đi với động từ số ít: "has".'
  },
  {
    id: 'a1_p2_q30',
    prompt: 'I <u>usually</u> (A) spend <u>two hours</u> (B) <u>to read</u> (C) science books every <u>weekend</u> (D).',
    errorPart: 'C',
    correctCorrection: 'reading',
    acceptedAnswers: ['reading'],
    explanation: 'Cấu trúc: spend + time + V-ing: "spend two hours reading", không dùng "to read".'
  }
];

// =============================================================================
// 3. LISTENING TRACKS POOL (Part 3 - 4 Complete Independent Tracks x 5 Questions)
// =============================================================================
const LISTENING_POOLS = [
  {
    id: 'track_1_emily_routine',
    audioTitle: 'Audio: Daily Routine and Language Learning Journey',
    audioText: 'Good morning everyone! My name is Emily. I am twenty-two years old and I live in Melbourne, Australia. Every weekday, I wake up at six o’clock in the morning. After taking a warm shower, I prepare a cup of black coffee and read news articles for thirty minutes. At eight o’clock, I take the subway to Melbourne University, where I study International Business. In the evening, I spend forty-five minutes learning Vietnamese because I plan to travel to Hanoi next summer with my older brother. Learning a new language is challenging, but practicing consistently every day makes it enjoyable and rewarding. Thank you for listening!',
    questions: [
      {
        id: 'a1_p3_t1_q1',
        prompt: 'How old is Emily and which city does she live in?',
        correctAnswer: '22 years old in Melbourne',
        acceptedAnswers: ['22 melbourne', 'twenty-two melbourne', '22 years old melbourne', 'melbourne 22', '22 years old in melbourne'],
        explanation: 'Trong audio, Emily giới thiệu: "I am twenty-two years old and I live in Melbourne, Australia."'
      },
      {
        id: 'a1_p3_t1_q2',
        prompt: 'What time does Emily wake up on weekdays?',
        correctAnswer: '6 o’clock',
        acceptedAnswers: ['6 oclock', '6:00', '6 am', 'six oclock', 'at six oclock', 'six'],
        explanation: 'Emily chia sẻ: "Every weekday, I wake up at six o’clock in the morning."'
      },
      {
        id: 'a1_p3_t1_q3',
        prompt: 'Which major or subject does Emily study at Melbourne University?',
        correctAnswer: 'International Business',
        acceptedAnswers: ['international business', 'business'],
        explanation: 'Emily nói: "...where I study International Business."'
      },
      {
        id: 'a1_p3_t1_q4',
        prompt: 'How long does she spend practicing Vietnamese every evening?',
        correctAnswer: '45 minutes',
        acceptedAnswers: ['45 minutes', 'forty-five minutes', '45 min', 'forty five minutes'],
        explanation: 'Emily nêu rõ: "In the evening, I spend forty-five minutes learning Vietnamese..."'
      },
      {
        id: 'a1_p3_t1_q5',
        prompt: 'Which city does Emily plan to travel to next summer?',
        correctAnswer: 'Hanoi',
        acceptedAnswers: ['hanoi', 'ha noi', 'to hanoi'],
        explanation: 'Emily nói: "...because I plan to travel to Hanoi next summer with my older brother."'
      }
    ]
  },
  {
    id: 'track_2_alex_cafe',
    audioTitle: 'Audio: Alex\'s Eco-friendly Coffee Shop in Seattle',
    audioText: 'Hello friends! I am Alex, a twenty-eight-year-old entrepreneur living in Seattle, Washington. Three years ago, I opened a cozy coffee shop called Green Bean Cafe. We open our doors at six-thirty every morning to welcome local office workers and university students. What makes our cafe special is our commitment to sustainability. We source organic coffee beans directly from ethical farmers in Da Lat, Vietnam, and we only serve drinks in biodegradable paper cups. In our cafe, we have a small bookshelf with over two hundred novels that customers can borrow for free. Creating an eco-friendly community space brings me immense happiness every day.',
    questions: [
      {
        id: 'a1_p3_t2_q1',
        prompt: 'How old is Alex and in which American city does he run his coffee shop?',
        correctAnswer: '28 years old in Seattle',
        acceptedAnswers: ['28 seattle', 'twenty-eight seattle', '28 years old seattle', 'seattle 28'],
        explanation: 'Trong audio, Alex nói: "I am Alex, a twenty-eight-year-old entrepreneur living in Seattle, Washington."'
      },
      {
        id: 'a1_p3_t2_q2',
        prompt: 'What time does Green Bean Cafe open every morning?',
        correctAnswer: '6:30 AM',
        acceptedAnswers: ['6:30', '6:30 am', 'six-thirty', 'six thirty', 'at six-thirty', 'half past six'],
        explanation: 'Alex chia sẻ: "We open our doors at six-thirty every morning..."'
      },
      {
        id: 'a1_p3_t2_q3',
        prompt: 'Where does the cafe source its organic coffee beans from?',
        correctAnswer: 'Da Lat, Vietnam',
        acceptedAnswers: ['da lat', 'dalat', 'vietnam', 'da lat vietnam'],
        explanation: 'Alex nói rõ: "...organic coffee beans directly from ethical farmers in Da Lat, Vietnam."'
      },
      {
        id: 'a1_p3_t2_q4',
        prompt: 'What kind of cups does Green Bean Cafe use to serve drinks?',
        correctAnswer: 'Biodegradable paper cups',
        acceptedAnswers: ['biodegradable paper cups', 'biodegradable cups', 'paper cups'],
        explanation: 'Alex khẳng định: "...we only serve drinks in biodegradable paper cups."'
      },
      {
        id: 'a1_p3_t2_q5',
        prompt: 'How many novels are available on the cafe\'s community bookshelf?',
        correctAnswer: 'Over 200 novels',
        acceptedAnswers: ['over 200', '200', 'two hundred', 'over two hundred'],
        explanation: 'Alex cho biết: "...a small bookshelf with over two hundred novels that customers can borrow for free."'
      }
    ]
  },
  {
    id: 'track_3_clara_library',
    audioTitle: 'Audio: Clara\'s Weekend Community Storytelling',
    audioText: 'Hi everyone! My name is Clara and I work as an elementary school teacher in Boston. While my weekdays are filled with lesson plans and grading, my weekends are dedicated to community service. Every Saturday morning at nine o’clock, I volunteer at the Boston Public Library. I host a sixty-minute storytelling session for children aged five to eight. Last Saturday, we read an illustrated edition of The Little Prince, and more than thirty enthusiastic children attended. Seeing young kids develop a genuine passion for reading books is the most rewarding part of my week.',
    questions: [
      {
        id: 'a1_p3_t3_q1',
        prompt: 'What is Clara\'s primary weekday profession?',
        correctAnswer: 'Elementary school teacher',
        acceptedAnswers: ['teacher', 'elementary school teacher', 'school teacher'],
        explanation: 'Clara giới thiệu: "My name is Clara and I work as an elementary school teacher in Boston."'
      },
      {
        id: 'a1_p3_t3_q2',
        prompt: 'On which day of the week and what time does Clara volunteer at the library?',
        correctAnswer: 'Saturday morning at 9 o’clock',
        acceptedAnswers: ['saturday at 9', 'saturday 9 am', 'saturday 9 oclock', 'every saturday morning at nine oclock'],
        explanation: 'Clara nêu rõ: "Every Saturday morning at nine o’clock, I volunteer at the Boston Public Library."'
      },
      {
        id: 'a1_p3_t3_q3',
        prompt: 'How long does her children\'s storytelling session last?',
        correctAnswer: '60 minutes',
        acceptedAnswers: ['60 minutes', 'sixty minutes', 'one hour', '1 hour'],
        explanation: 'Clara cho biết: "I host a sixty-minute storytelling session for children..."'
      },
      {
        id: 'a1_p3_t3_q4',
        prompt: 'What book title did Clara read to the children last Saturday?',
        correctAnswer: 'The Little Prince',
        acceptedAnswers: ['the little prince', 'little prince'],
        explanation: 'Clara nói: "...we read an illustrated edition of The Little Prince."'
      },
      {
        id: 'a1_p3_t3_q5',
        prompt: 'How many children attended the storytelling session last Saturday?',
        correctAnswer: 'More than 30 children',
        acceptedAnswers: ['more than 30', '30', 'thirty', 'more than thirty'],
        explanation: 'Clara nói: "...more than thirty enthusiastic children attended."'
      }
    ]
  },
  {
    id: 'track_4_david_marathon',
    audioTitle: 'Audio: David\'s Training for His First Marathon',
    audioText: 'Good evening! I am David, a thirty-year-old software engineer based in Chicago. Six months ago, I decided to challenge myself by training for the Chicago Marathon. Running has completely transformed my physical health and mental discipline. I train four days a week, running twelve kilometers along Lake Michigan before sunrise. Staying properly hydrated is critical, so I drink at least three liters of fresh water daily. The marathon race takes place in October, and my personal goal is to finish the forty-two kilometer course in under four hours. With dedication, anything is achievable!',
    questions: [
      {
        id: 'a1_p3_t4_q1',
        prompt: 'What is David\'s age and profession according to the audio?',
        correctAnswer: '30-year-old software engineer',
        acceptedAnswers: ['30 software engineer', 'thirty software engineer', 'software engineer 30', 'software engineer'],
        explanation: 'David giới thiệu: "I am David, a thirty-year-old software engineer based in Chicago."'
      },
      {
        id: 'a1_p3_t4_q2',
        prompt: 'How many days each week does David dedicate to marathon training?',
        correctAnswer: '4 days a week',
        acceptedAnswers: ['4 days', 'four days', '4 days a week', 'four days a week'],
        explanation: 'David nói rõ: "I train four days a week..."'
      },
      {
        id: 'a1_p3_t4_q3',
        prompt: 'How many kilometers does he run during each morning training session?',
        correctAnswer: '12 kilometers',
        acceptedAnswers: ['12 kilometers', '12 km', 'twelve kilometers', '12'],
        explanation: 'David chia sẻ: "...running twelve kilometers along Lake Michigan before sunrise."'
      },
      {
        id: 'a1_p3_t4_q4',
        prompt: 'How much water does David drink daily to stay hydrated?',
        correctAnswer: 'At least 3 liters',
        acceptedAnswers: ['3 liters', 'three liters', 'at least 3 liters', '3l'],
        explanation: 'David khẳng định: "...so I drink at least three liters of fresh water daily."'
      },
      {
        id: 'a1_p3_t4_q5',
        prompt: 'In which month will the Chicago Marathon race take place?',
        correctAnswer: 'October',
        acceptedAnswers: ['october', 'in october'],
        explanation: 'David nói: "The marathon race takes place in October..."'
      }
    ]
  }
];

// =============================================================================
// 4. READING PASSAGES POOL (Part 4.1 & Part 4.2 - 6 Passages x 5 Questions each)
// =============================================================================
const READING_POOLS = [
  {
    id: 'passage_1_walking',
    readingTitle: 'Passage: The Health Benefits of Daily Walking',
    readingText: `Walking is one of the simplest and most accessible forms of physical exercise in the world. Unlike intensive gym workouts or competitive sports, walking requires no expensive equipment or specialized athletic training. Health researchers in the United Kingdom found that taking a brisk thirty-minute walk every afternoon significantly strengthens cardiovascular health, lowers blood pressure, and reduces mental fatigue.\n\nFurthermore, walking outdoors in natural green parks provides exposure to fresh air and natural sunlight, which triggers the body to produce essential vitamin D. Dr. Robert Jenkins, a renowned cardiologist, emphasizes that consistency is far more impactful than extreme intensity. People who walk at least five days a week maintain healthier body weight and report forty percent fewer symptoms of chronic anxiety. Therefore, incorporating walking into your daily routine is an effortless investment in lifelong vitality.`,
    questions: [
      {
        id: 'a1_p4_p1_q1',
        prompt: 'According to the passage, how much daily walking time is recommended by UK health researchers?',
        correctAnswer: '30 minutes',
        acceptedAnswers: ['30 minutes', 'thirty minutes', '30 min', 'a brisk thirty-minute walk'],
        explanation: 'Đoạn văn nêu: "...taking a brisk thirty-minute walk every afternoon significantly strengthens cardiovascular health..."'
      },
      {
        id: 'a1_p4_p1_q2',
        prompt: 'What essential vitamin does the body produce when exposed to outdoor sunlight?',
        correctAnswer: 'Vitamin D',
        acceptedAnswers: ['vitamin d', 'd'],
        explanation: 'Văn bản nêu: "...natural sunlight, which triggers the body to produce essential vitamin D."'
      },
      {
        id: 'a1_p4_p1_q3',
        prompt: 'What is Dr. Robert Jenkins’ medical profession or specialization?',
        correctAnswer: 'Cardiologist',
        acceptedAnswers: ['cardiologist', 'doctor', 'heart doctor'],
        explanation: 'Trích văn bản: "Dr. Robert Jenkins, a renowned cardiologist..." (bác sĩ tim mạch).'
      },
      {
        id: 'a1_p4_p1_q4',
        prompt: 'How many days per week should people walk according to the article?',
        correctAnswer: 'At least 5 days',
        acceptedAnswers: ['at least 5 days', '5 days', 'five days', 'at least five days'],
        explanation: 'Văn bản chỉ rõ: "People who walk at least five days a week maintain healthier body weight..."'
      },
      {
        id: 'a1_p4_p1_q5',
        prompt: 'By what percentage are chronic anxiety symptoms reduced for regular walkers?',
        correctAnswer: '40 percent',
        acceptedAnswers: ['40 percent', '40%', 'forty percent'],
        explanation: 'Đoạn văn khẳng định: "...report forty percent fewer symptoms of chronic anxiety."'
      }
    ]
  },
  {
    id: 'passage_2_afternoon_tea',
    readingTitle: 'Passage: The Tradition of Afternoon Tea in England',
    readingText: `The cherished tradition of afternoon tea was introduced to English society in the early 1840s by Anna Maria Russell, the Duchess of Bedford. During the Victorian era, wealthy households typically served only two main meals each day: a substantial breakfast in the morning and a late dinner served around eight o’clock in the evening. As a result, people frequently experienced severe hunger in the late afternoon.\n\nTo bridge this long interval, the Duchess requested that a pot of hot black tea, accompanied by bread, butter, and small sweet cakes, be brought privately to her dressing room around four in the afternoon. Soon, she began inviting noble friends to join her gathering. Over the decades, afternoon tea evolved from an elite ritual into a beloved national custom. Today, it remains a symbol of hospitality, friendship, and leisurely conversation throughout Britain.`,
    questions: [
      {
        id: 'a1_p4_p2_q1',
        prompt: 'In which decade was afternoon tea introduced to English society?',
        correctAnswer: 'Early 1840s',
        acceptedAnswers: ['early 1840s', '1840s', '1840', 'in the early 1840s'],
        explanation: 'Văn bản mở đầu: "The cherished tradition of afternoon tea was introduced to English society in the early 1840s..."'
      },
      {
        id: 'a1_p4_p2_q2',
        prompt: 'Who was the historical figure that created this afternoon tea tradition?',
        correctAnswer: 'Anna Maria Russell',
        acceptedAnswers: ['anna maria russell', 'duchess of bedford', 'the duchess of bedford', 'anna russell'],
        explanation: 'Trích văn bản: "...introduced to English society in the early 1840s by Anna Maria Russell, the Duchess of Bedford."'
      },
      {
        id: 'a1_p4_p2_q3',
        prompt: 'How many main meals did Victorian households typically eat each day?',
        correctAnswer: 'Two main meals',
        acceptedAnswers: ['two', '2', 'two meals', 'two main meals'],
        explanation: 'Đoạn văn nêu: "...wealthy households typically served only two main meals each day..."'
      },
      {
        id: 'a1_p4_p2_q4',
        prompt: 'What time was late dinner usually served in the Victorian era?',
        correctAnswer: 'Around 8 o’clock',
        acceptedAnswers: ['around 8 oclock', '8 oclock', '8 pm', 'eight oclock', 'at 8 oclock', 'around eight oclock'],
        explanation: 'Văn bản nêu: "...and a late dinner served around eight o’clock in the evening."'
      },
      {
        id: 'a1_p4_p2_q5',
        prompt: 'What foods were served alongside hot black tea to the Duchess?',
        correctAnswer: 'Bread, butter, and cakes',
        acceptedAnswers: ['bread butter and cakes', 'bread butter and small sweet cakes', 'bread butter cakes', 'bread and cakes'],
        explanation: 'Văn bản nêu: "...accompanied by bread, butter, and small sweet cakes..."'
      }
    ]
  },
  {
    id: 'passage_3_honeybees',
    readingTitle: 'Passage: The Vital Role of Honeybees in Agriculture',
    readingText: `Honeybees are widely recognized as some of the most industrious and vital creatures on Earth. Beyond producing sweet honey and natural beeswax, their primary ecological contribution is pollinating flowering plants. Scientists estimate that one-third of the global food supply directly depends on bee pollination, including nutritious fruits like apples, strawberries, and almonds.\n\nInside a typical beehive, tens of thousands of worker bees live in structured cooperation. To communicate the precise location of rich nectar sources, foraging bees perform a complex choreography known as the waggle dance. However, in recent decades, bee populations worldwide have faced unprecedented declines due to habitat destruction, climate disruptions, and chemical pesticides. Conservationists urge farmers to plant wildflowers and reduce toxic sprays to protect these invaluable pollinators for future generations.`,
    questions: [
      {
        id: 'a1_p4_p3_q1',
        prompt: 'What proportion of the global food supply depends on bee pollination?',
        correctAnswer: 'One-third',
        acceptedAnswers: ['one-third', '1/3', 'one third', 'a third'],
        explanation: 'Đoạn văn khẳng định: "...one-third of the global food supply directly depends on bee pollination..."'
      },
      {
        id: 'a1_p4_p3_q2',
        prompt: 'What dance do honeybees perform to communicate the location of nectar?',
        correctAnswer: 'Waggle dance',
        acceptedAnswers: ['waggle dance', 'the waggle dance', 'waggle'],
        explanation: 'Văn bản nêu: "...perform a complex choreography known as the waggle dance."'
      },
      {
        id: 'a1_p4_p3_q3',
        prompt: 'Name two fruits mentioned in the text that rely on honeybee pollination.',
        correctAnswer: 'Apples and strawberries',
        acceptedAnswers: ['apples and strawberries', 'apples strawberries', 'apples, strawberries', 'strawberries and almonds', 'apples and almonds'],
        explanation: 'Đoạn văn liệt kê: "...including nutritious fruits like apples, strawberries, and almonds."'
      },
      {
        id: 'a1_p4_p3_q4',
        prompt: 'What are two major causes of the global decline in bee populations?',
        correctAnswer: 'Pesticides and habitat loss',
        acceptedAnswers: ['pesticides and habitat loss', 'habitat destruction and pesticides', 'pesticides and climate disruptions', 'climate disruptions and pesticides'],
        explanation: 'Văn bản nêu: "...due to habitat destruction, climate disruptions, and chemical pesticides."'
      },
      {
        id: 'a1_p4_p3_q5',
        prompt: 'What action do conservationists urge farmers to take to protect honeybees?',
        correctAnswer: 'Plant wildflowers',
        acceptedAnswers: ['plant wildflowers', 'plant wildflowers and reduce toxic sprays', 'reduce toxic sprays'],
        explanation: 'Đoạn văn kết luận: "Conservationists urge farmers to plant wildflowers and reduce toxic sprays..."'
      }
    ]
  },
  {
    id: 'passage_4_solar_power',
    readingTitle: 'Passage: The Expansion of Solar Energy Worldwide',
    readingText: `As international concerns regarding fossil fuel depletion and global warming intensify, solar power has emerged as a cornerstone of modern renewable energy. Solar photovoltaic panels harness radiant sunlight and convert it directly into clean electricity using semiconductor materials. Over the last decade, advancements in engineering have reduced the manufacturing cost of solar panels by more than eighty percent, making solar energy cheaper than conventional coal in many nations.\n\nCountries such as Germany, China, and Australia have pioneered widespread rooftop solar installations on homes, schools, and commercial complexes. In addition to producing zero greenhouse gas emissions during generation, modern battery storage systems allow communities to store excess solar electricity captured at midday for use throughout the evening. Transitioning to clean solar power is essential to building sustainable and climate-resilient cities.`,
    questions: [
      {
        id: 'a1_p4_p4_q1',
        prompt: 'By what percentage has the manufacturing cost of solar panels dropped over the past decade?',
        correctAnswer: 'Over 80 percent',
        acceptedAnswers: ['over 80 percent', '80%', '80 percent', 'more than eighty percent'],
        explanation: 'Văn bản nêu: "...reduced the manufacturing cost of solar panels by more than eighty percent..."'
      },
      {
        id: 'a1_p4_p4_q2',
        prompt: 'Name two countries highlighted in the passage for pioneering rooftop solar installations.',
        correctAnswer: 'Germany and China',
        acceptedAnswers: ['germany and china', 'china and australia', 'germany and australia', 'germany, china'],
        explanation: 'Văn bản liệt kê: "Countries such as Germany, China, and Australia have pioneered widespread rooftop solar installations..."'
      },
      {
        id: 'a1_p4_p4_q3',
        prompt: 'What do modern battery storage systems allow communities to do with excess solar energy?',
        correctAnswer: 'Store excess electricity for evening use',
        acceptedAnswers: ['store electricity for evening', 'store excess electricity', 'store energy for evening use', 'store energy'],
        explanation: 'Trích văn bản: "...allow communities to store excess solar electricity captured at midday for use throughout the evening."'
      },
      {
        id: 'a1_p4_p4_q4',
        prompt: 'What type of materials do photovoltaic panels use to convert sunlight into electricity?',
        correctAnswer: 'Semiconductor materials',
        acceptedAnswers: ['semiconductors', 'semiconductor materials', 'semiconductor'],
        explanation: 'Đoạn văn nêu rõ: "...convert it directly into clean electricity using semiconductor materials."'
      },
      {
        id: 'a1_p4_p4_q5',
        prompt: 'What amount of greenhouse gas emissions is generated during solar power operation?',
        correctAnswer: 'Zero emissions',
        acceptedAnswers: ['zero', 'zero emissions', 'zero greenhouse gas emissions', '0'],
        explanation: 'Văn bản nêu: "In addition to producing zero greenhouse gas emissions during generation..."'
      }
    ]
  },
  {
    id: 'passage_5_sea_turtles',
    readingTitle: 'Passage: The Oceanic Migration of Sea Turtles',
    readingText: `Sea turtles are ancient marine reptiles that have inhabited the world’s oceans for over one hundred million years. Among the seven surviving species, the green sea turtle is celebrated for its extraordinary long-distance migrations. Adults frequently travel more than two thousand kilometers across open oceans between their feeding pastures and nesting territories.\n\nBiologists have discovered that sea turtles navigate through vast ocean currents by sensing the Earth’s invisible geomagnetic field. In an astonishing phenomenon known as natal homing, adult females return across thousands of nautical miles to deposit their clutches of eggs on the exact sandy beach where they were born decades earlier. Because their life cycle spans up to eighty years, safeguarding coastal nesting beaches and eliminating ocean plastic pollution are vital for the preservation of these magnificent creatures.`,
    questions: [
      {
        id: 'a1_p4_p5_q1',
        prompt: 'For how long have sea turtles inhabited the Earth\'s oceans according to the text?',
        correctAnswer: 'Over 100 million years',
        acceptedAnswers: ['over 100 million years', '100 million years', 'over one hundred million years'],
        explanation: 'Đoạn văn mở đầu: "...inhabited the world’s oceans for over one hundred million years."'
      },
      {
        id: 'a1_p4_p5_q2',
        prompt: 'How far do adult green sea turtles frequently travel between feeding and nesting sites?',
        correctAnswer: 'More than 2,000 kilometers',
        acceptedAnswers: ['more than 2000 km', '2000 kilometers', '2000 km', 'over 2000 km', 'more than two thousand kilometers'],
        explanation: 'Văn bản nêu: "...frequently travel more than two thousand kilometers across open oceans..."'
      },
      {
        id: 'a1_p4_p5_q3',
        prompt: 'What natural phenomenon do sea turtles sense to navigate across open oceans?',
        correctAnswer: 'Earth\'s geomagnetic field',
        acceptedAnswers: ['geomagnetic field', 'earth geomagnetic field', 'magnetic field'],
        explanation: 'Trích đoạn văn: "...navigate through vast ocean currents by sensing the Earth’s invisible geomagnetic field."'
      },
      {
        id: 'a1_p4_p5_q4',
        prompt: 'Where do female sea turtles return to lay their eggs during natal homing?',
        correctAnswer: 'The exact beach where they were born',
        acceptedAnswers: ['the beach where they were born', 'their birth beach', 'natal beach', 'exact sandy beach where they were born'],
        explanation: 'Văn bản nêu rõ: "...deposit their clutches of eggs on the exact sandy beach where they were born..."'
      },
      {
        id: 'a1_p4_p5_q5',
        prompt: 'What is the estimated lifespan of green sea turtles?',
        correctAnswer: 'Up to 80 years',
        acceptedAnswers: ['up to 80 years', '80 years', 'eighty years'],
        explanation: 'Văn bản khẳng định: "Because their life cycle spans up to eighty years..."'
      }
    ]
  },
  {
    id: 'passage_6_origami',
    readingTitle: 'Passage: The Intersection of Origami and Modern Technology',
    readingText: `Origami, the traditional Japanese art of paper folding, has been practiced for over a millennium. Derived from the Japanese words "ori" meaning to fold and "kami" meaning paper, the craft transforms a single flat sheet of paper into intricate three-dimensional sculptures through geometric folds, strictly without using scissors or adhesive glue.\n\nIn recent years, the geometric principles of origami have inspired groundbreaking technological innovations far beyond paper crafts. Engineers at the United States space agency NASA apply origami folding techniques to pack giant solar arrays and telescope mirrors into compact rocket cargo bays that unfold smoothly once in orbit. Moreover, biomedical researchers have designed microscopic heart stents that travel compactly through blood vessels before expanding into functional shapes inside human arteries. Thus, an ancient artistic craft continues to revolutionize modern space exploration and medicine.`,
    questions: [
      {
        id: 'a1_p4_p6_q1',
        prompt: 'What do the Japanese words "ori" and "kami" mean?',
        correctAnswer: 'Fold and paper',
        acceptedAnswers: ['fold and paper', 'to fold and paper', 'fold paper'],
        explanation: 'Văn bản giải thích: "...from the Japanese words \'ori\' meaning to fold and \'kami\' meaning paper..."'
      },
      {
        id: 'a1_p4_p6_q2',
        prompt: 'What two tools are strictly forbidden in traditional origami paper folding?',
        correctAnswer: 'Scissors and glue',
        acceptedAnswers: ['scissors and glue', 'scissors or glue', 'scissors and adhesive glue'],
        explanation: 'Văn bản nêu: "...strictly without using scissors or adhesive glue."'
      },
      {
        id: 'a1_p4_p6_q3',
        prompt: 'Which space agency applies origami principles to fold space telescope mirrors?',
        correctAnswer: 'NASA',
        acceptedAnswers: ['nasa', 'the us space agency nasa'],
        explanation: 'Đoạn văn nêu rõ: "Engineers at the United States space agency NASA apply origami folding techniques..."'
      },
      {
        id: 'a1_p4_p6_q4',
        prompt: 'In what biomedical device do researchers apply origami folding for human arteries?',
        correctAnswer: 'Heart stents',
        acceptedAnswers: ['heart stents', 'stents', 'microscopic heart stents'],
        explanation: 'Trích văn bản: "...designed microscopic heart stents that travel compactly through blood vessels..."'
      },
      {
        id: 'a1_p4_p6_q5',
        prompt: 'For how long has the practice of origami existed according to the text?',
        correctAnswer: 'Over a millennium',
        acceptedAnswers: ['over a millennium', 'over 1000 years', '1000 years', 'a millennium'],
        explanation: 'Văn bản mở đầu: "...has been practiced for over a millennium."'
      }
    ]
  }
];

// =============================================================================
// 5. SENTENCE REORDERING POOL (Part 5 - 25 Questions)
// =============================================================================
const REORDER_POOL = [
  {
    id: 'a1_p5_q1',
    jumbledWords: ['learning', 'English', 'is', 'step', 'by', 'step', 'rewarding'],
    prompt: 'learning / English / is / step / by / step / rewarding',
    correctAnswer: 'Learning English step by step is rewarding.',
    acceptedAnswers: [
      'Learning English step by step is rewarding',
      'Learning English is rewarding step by step'
    ],
    explanation: 'Chủ ngữ danh động từ "Learning English" + động từ "is" + tính từ "rewarding" + trạng ngữ "step by step".'
  },
  {
    id: 'a1_p5_q2',
    jumbledWords: ['practices', 'she', 'every', 'speaking', 'morning', 'pronunciation'],
    prompt: 'practices / she / every / speaking / morning / pronunciation',
    correctAnswer: 'She practices pronunciation every morning.',
    acceptedAnswers: [
      'She practices pronunciation every morning',
      'Every morning she practices pronunciation',
      'She practices speaking every morning'
    ],
    explanation: 'Cấu trúc S + V + O + Time: "She practices pronunciation every morning."'
  },
  {
    id: 'a1_p5_q3',
    jumbledWords: ['the', 'library', 'in', 'are', 'students', 'studying', 'quietly'],
    prompt: 'the / library / in / are / students / studying / quietly',
    correctAnswer: 'Students are studying quietly in the library.',
    acceptedAnswers: [
      'Students are studying quietly in the library',
      'In the library students are studying quietly',
      'The students are studying quietly in the library'
    ],
    explanation: 'Thì hiện tại tiếp diễn: S + are + V-ing + Adv + Prep phrase.'
  },
  {
    id: 'a1_p5_q4',
    jumbledWords: ['you', 'could', 'please', 'the', 'pass', 'salt', 'me'],
    prompt: 'you / could / please / the / pass / salt / me',
    correctAnswer: 'Could you please pass me the salt?',
    acceptedAnswers: [
      'Could you please pass me the salt',
      'Could you please pass the salt to me'
    ],
    explanation: 'Câu cầu khiến lịch thiệp: "Could you please pass me the salt?"'
  },
  {
    id: 'a1_p5_q5',
    jumbledWords: ['twenty', 'reads', 'he', 'daily', 'articles', 'minutes', 'for'],
    prompt: 'twenty / reads / he / daily / articles / minutes / for',
    correctAnswer: 'He reads articles for twenty minutes daily.',
    acceptedAnswers: [
      'He reads articles for twenty minutes daily',
      'Daily he reads articles for twenty minutes',
      'He reads daily articles for twenty minutes'
    ],
    explanation: 'Trật tự câu: S (He) + V (reads) + O (articles) + for twenty minutes daily.'
  },
  {
    id: 'a1_p5_q6',
    jumbledWords: ['father', 'my', 'drinks', 'coffee', 'usually', 'breakfast', 'before'],
    prompt: 'father / my / drinks / coffee / usually / breakfast / before',
    correctAnswer: 'My father usually drinks coffee before breakfast.',
    acceptedAnswers: [
      'My father usually drinks coffee before breakfast',
      'Before breakfast my father usually drinks coffee'
    ],
    explanation: 'Trạng từ tần suất "usually" đứng trước động từ thường: "My father usually drinks coffee before breakfast."'
  },
  {
    id: 'a1_p5_q7',
    jumbledWords: ['to', 'planning', 'we', 'are', 'visit', 'our', 'grandparents'],
    prompt: 'to / planning / we / are / visit / our / grandparents',
    correctAnswer: 'We are planning to visit our grandparents.',
    acceptedAnswers: [
      'We are planning to visit our grandparents'
    ],
    explanation: 'Cấu trúc S + are planning to + V: "We are planning to visit our grandparents."'
  },
  {
    id: 'a1_p5_q8',
    jumbledWords: ['regular', 'helps', 'exercise', 'keep', 'healthy', 'your', 'body'],
    prompt: 'regular / exercise / helps / keep / healthy / your / body',
    correctAnswer: 'Regular exercise helps keep your body healthy.',
    acceptedAnswers: [
      'Regular exercise helps keep your body healthy',
      'Regular exercise helps to keep your body healthy'
    ],
    explanation: 'Chủ ngữ "Regular exercise" + động từ "helps" + keep your body healthy.'
  },
  {
    id: 'a1_p5_q9',
    jumbledWords: ['speaks', 'she', 'fluently', 'English', 'very', 'and', 'French'],
    prompt: 'speaks / she / fluently / English / very / and / French',
    correctAnswer: 'She speaks English and French very fluently.',
    acceptedAnswers: [
      'She speaks English and French very fluently',
      'She speaks French and English very fluently'
    ],
    explanation: 'S + V + O + Trạng từ chỉ mức độ: "She speaks English and French very fluently."'
  },
  {
    id: 'a1_p5_q10',
    jumbledWords: ['did', 'finish', 'you', 'homework', 'your', 'going', 'before', 'out'],
    prompt: 'did / finish / you / homework / your / going / before / out',
    correctAnswer: 'Did you finish your homework before going out?',
    acceptedAnswers: [
      'Did you finish your homework before going out'
    ],
    explanation: 'Câu hỏi quá khứ đơn: Did + S + V(nguyên thể) + O + before V-ing?'
  },
  {
    id: 'a1_p5_q11',
    jumbledWords: ['today', 'the', 'weather', 'is', 'warmer', 'much', 'yesterday', 'than'],
    prompt: 'today / the / weather / is / warmer / much / yesterday / than',
    correctAnswer: 'The weather today is much warmer than yesterday.',
    acceptedAnswers: [
      'The weather today is much warmer than yesterday',
      'Today the weather is much warmer than yesterday'
    ],
    explanation: 'So sánh hơn với tính từ ngắn: S + is + much + adj-er + than.'
  },
  {
    id: 'a1_p5_q12',
    jumbledWords: ['decided', 'they', 'by', 'travel', 'to', 'instead', 'train', 'flying', 'of'],
    prompt: 'decided / they / by / travel / to / instead / train / flying / of',
    correctAnswer: 'They decided to travel by train instead of flying.',
    acceptedAnswers: [
      'They decided to travel by train instead of flying'
    ],
    explanation: 'Cấu trúc S + decided to + V + by train instead of + V-ing.'
  },
  {
    id: 'a1_p5_q13',
    jumbledWords: ['never', 'I', 'seen', 'have', 'such', 'beautiful', 'a', 'sunset'],
    prompt: 'never / I / seen / have / such / beautiful / a / sunset',
    correctAnswer: 'I have never seen such a beautiful sunset.',
    acceptedAnswers: [
      'I have never seen such a beautiful sunset'
    ],
    explanation: 'Thì hiện tại hoàn thành: S + have never + V(PII) + such a/an + adj + noun.'
  },
  {
    id: 'a1_p5_q14',
    jumbledWords: ['books', 'reading', 'your', 'expands', 'and', 'vocabulary', 'knowledge'],
    prompt: 'books / reading / your / expands / and / vocabulary / knowledge',
    correctAnswer: 'Reading books expands your vocabulary and knowledge.',
    acceptedAnswers: [
      'Reading books expands your vocabulary and knowledge',
      'Reading books expands your knowledge and vocabulary'
    ],
    explanation: 'Chủ ngữ danh động từ "Reading books" + động từ số ít "expands" + tân ngữ.'
  },
  {
    id: 'a1_p5_q15',
    jumbledWords: ['remember', 'please', 'to', 'off', 'turn', 'lights', 'the', 'leaving', 'before'],
    prompt: 'remember / please / to / off / turn / lights / the / leaving / before',
    correctAnswer: 'Please remember to turn off the lights before leaving.',
    acceptedAnswers: [
      'Please remember to turn off the lights before leaving'
    ],
    explanation: 'Cấu trúc cầu khiến: Please remember to turn off the lights before leaving.'
  },
  {
    id: 'a1_p5_q16',
    jumbledWords: ['working', 'has', 'he', 'been', 'here', 'last', 'since', 'year'],
    prompt: 'working / has / he / been / here / last / since / year',
    correctAnswer: 'He has been working here since last year.',
    acceptedAnswers: [
      'He has been working here since last year'
    ],
    explanation: 'Hiện tại hoàn thành tiếp diễn: S + has been + V-ing + since + mốc thời gian.'
  },
  {
    id: 'a1_p5_q17',
    jumbledWords: ['why', 'you', 'did', 'to', 'choose', 'learn', 'online', 'English'],
    prompt: 'why / you / did / to / choose / learn / online / English',
    correctAnswer: 'Why did you choose to learn English online?',
    acceptedAnswers: [
      'Why did you choose to learn English online'
    ],
    explanation: 'Câu hỏi quá khứ đơn: Why did + S + choose to + V + online?'
  },
  {
    id: 'a1_p5_q18',
    jumbledWords: ['fresh', 'eating', 'is', 'vegetables', 'good', 'your', 'for', 'health'],
    prompt: 'fresh / eating / is / vegetables / good / your / for / health',
    correctAnswer: 'Eating fresh vegetables is good for your health.',
    acceptedAnswers: [
      'Eating fresh vegetables is good for your health'
    ],
    explanation: 'Chủ ngữ danh động từ: Eating fresh vegetables is good for your health.'
  },
  {
    id: 'a1_p5_q19',
    jumbledWords: ['she', 'arrives', 'always', 'at', 'office', 'the', 'time', 'on'],
    prompt: 'she / arrives / always / at / office / the / time / on',
    correctAnswer: 'She always arrives at the office on time.',
    acceptedAnswers: [
      'She always arrives at the office on time'
    ],
    explanation: 'Trạng từ tần suất "always" đứng trước động từ: "She always arrives at the office on time."'
  },
  {
    id: 'a1_p5_q20',
    jumbledWords: ['there', 'many', 'are', 'books', 'interesting', 'on', 'shelf', 'the'],
    prompt: 'there / many / are / books / interesting / on / shelf / the',
    correctAnswer: 'There are many interesting books on the shelf.',
    acceptedAnswers: [
      'There are many interesting books on the shelf'
    ],
    explanation: 'Cấu trúc There are + plural noun + prep phrase: "There are many interesting books on the shelf."'
  },
  {
    id: 'a1_p5_q21',
    jumbledWords: ['long', 'how', 'does', 'take', 'it', 'to', 'to', 'walk', 'school'],
    prompt: 'long / how / does / take / it / to / to / walk / school',
    correctAnswer: 'How long does it take to walk to school?',
    acceptedAnswers: [
      'How long does it take to walk to school'
    ],
    explanation: 'Cấu trúc hỏi thời lượng: How long does it take to walk to school?'
  },
  {
    id: 'a1_p5_q22',
    jumbledWords: ['brother', 'my', 'a', 'bought', 'bicycle', 'new', 'yesterday'],
    prompt: 'brother / my / a / bought / bicycle / new / yesterday',
    correctAnswer: 'My brother bought a new bicycle yesterday.',
    acceptedAnswers: [
      'My brother bought a new bicycle yesterday',
      'Yesterday my brother bought a new bicycle'
    ],
    explanation: 'Thì quá khứ đơn: My brother bought a new bicycle yesterday.'
  },
  {
    id: 'a1_p5_q23',
    jumbledWords: ['consistent', 'practice', 'daily', 'is', 'secret', 'the', 'fluency', 'to'],
    prompt: 'consistent / practice / daily / is / secret / the / fluency / to',
    correctAnswer: 'Consistent daily practice is the secret to fluency.',
    acceptedAnswers: [
      'Consistent daily practice is the secret to fluency'
    ],
    explanation: 'S + is + the secret to + noun: "Consistent daily practice is the secret to fluency."'
  },
  {
    id: 'a1_p5_q24',
    jumbledWords: ['we', 'listening', 'enjoy', 'music', 'to', 'cooking', 'while', 'dinner'],
    prompt: 'we / listening / enjoy / music / to / cooking / while / dinner',
    correctAnswer: 'We enjoy listening to music while cooking dinner.',
    acceptedAnswers: [
      'We enjoy listening to music while cooking dinner'
    ],
    explanation: 'Cấu trúc enjoy + V-ing: "We enjoy listening to music while cooking dinner."'
  },
  {
    id: 'a1_p5_q25',
    jumbledWords: ['you', 'can', 'me', 'help', 'these', 'bags', 'carry', 'upstairs'],
    prompt: 'you / can / me / help / these / bags / carry / upstairs',
    correctAnswer: 'Can you help me carry these bags upstairs?',
    acceptedAnswers: [
      'Can you help me carry these bags upstairs',
      'Can you help me to carry these bags upstairs'
    ],
    explanation: 'Cấu trúc đề nghị: Can you help me carry these bags upstairs?'
  }
];

// =============================================================================
// RANDOMIZATION ALGORITHMS
// =============================================================================

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Select items from pool prioritizing items not seen in recent attempts
 */
function pickItemsAvoidingRecent(pool, count, recentIdsSet = new Set()) {
  const unseen = pool.filter((item) => !recentIdsSet.has(item.id));
  const seen = pool.filter((item) => recentIdsSet.has(item.id));

  shuffleArray(unseen);
  shuffleArray(seen);

  const selected = [...unseen.slice(0, count)];
  if (selected.length < count) {
    selected.push(...seen.slice(0, count - selected.length));
  }

  shuffleArray(selected);
  return selected;
}

/**
 * Select 1 complete listening track (audio + 5 questions) avoiding recently seen tracks
 */
function pickListeningTrack(pool, recentTrackIdsSet = new Set()) {
  const unseen = pool.filter((t) => !recentTrackIdsSet.has(t.id));
  const seen = pool.filter((t) => recentTrackIdsSet.has(t.id));

  shuffleArray(unseen);
  shuffleArray(seen);

  return unseen[0] || seen[0] || pool[0];
}

/**
 * Select 2 distinct reading passages avoiding recently seen passages
 */
function pickTwoReadingPassages(pool, recentPassageIdsSet = new Set()) {
  const unseen = pool.filter((p) => !recentPassageIdsSet.has(p.id));
  const seen = pool.filter((p) => recentPassageIdsSet.has(p.id));

  shuffleArray(unseen);
  shuffleArray(seen);

  const selected = [...unseen.slice(0, 2)];
  if (selected.length < 2) {
    selected.push(...seen.slice(0, 2 - selected.length));
  }

  // Ensure two distinct passages
  if (selected.length === 1 && pool.length > 1) {
    const remaining = pool.filter((p) => p.id !== selected[0].id);
    shuffleArray(remaining);
    selected.push(remaining[0]);
  }

  return selected.slice(0, 2);
}

/**
 * Generates an authentic, fresh, cohesive 40-question exam set for a student
 * @param {object} options
 * @param {string} [options.level='A1'] - CEFR Level (A1, A2, B1, B2, C1, C2)
 * @param {Set|Array} [options.recentQuestionIds] - IDs of questions from recent attempts
 * @param {Set|Array} [options.recentTrackIds] - IDs of listening tracks from recent attempts
 * @param {Set|Array} [options.recentPassageIds] - IDs of reading passages from recent attempts
 * @returns {object} Assembled 40-question exam data organized into 6 pages
 */
function generateRandomExamSet({
  level = 'A1',
  recentQuestionIds = new Set(),
  recentTrackIds = new Set(),
  recentPassageIds = new Set(),
} = {}) {
  const recentQSet = recentQuestionIds instanceof Set ? recentQuestionIds : new Set(recentQuestionIds || []);
  const recentTSet = recentTrackIds instanceof Set ? recentTrackIds : new Set(recentTrackIds || []);
  const recentPSet = recentPassageIds instanceof Set ? recentPassageIds : new Set(recentPassageIds || []);

  const normLevel = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level) ? level : 'A1';
  const examTitle = normLevel === 'A1'
    ? 'Bài Kiểm Tra Năng Lực Tiếng Anh Căn Bản'
    : 'Bài Kiểm Tra Năng Lực Tiếng Anh Chuyên Sâu';

  // 1. Pick 10 Vocab questions
  const selectedVocab = pickItemsAvoidingRecent(VOCAB_POOL, 10, recentQSet).map((q, idx) => ({
    ...q,
    orderNumber: idx + 1,
    partNumber: 1,
  }));

  // 2. Pick 10 Error Correction questions
  const selectedError = pickItemsAvoidingRecent(ERROR_CORRECTION_POOL, 10, recentQSet).map((q, idx) => ({
    ...q,
    orderNumber: 11 + idx,
    partNumber: 2,
  }));

  // 3. Pick 1 Listening Track (5 questions)
  const track = pickListeningTrack(LISTENING_POOLS, recentTSet);
  const listeningQuestions = track.questions.map((q, idx) => ({
    ...q,
    orderNumber: 21 + idx,
    partNumber: 3,
  }));

  // 4. Pick 2 Reading Passages (5 questions each)
  const [passage1, passage2] = pickTwoReadingPassages(READING_POOLS, recentPSet);
  const readingQuestions1 = (passage1.questions || []).map((q, idx) => ({
    ...q,
    orderNumber: 26 + idx,
    partNumber: 4,
  }));
  const readingQuestions2 = (passage2.questions || []).map((q, idx) => ({
    ...q,
    orderNumber: 31 + idx,
    partNumber: 4,
  }));

  // 5. Pick 5 Sentence Reorder questions
  const selectedReorder = pickItemsAvoidingRecent(REORDER_POOL, 5, recentQSet).map((q, idx) => ({
    ...q,
    orderNumber: 36 + idx,
    partNumber: 5,
  }));

  const parts = [
    {
      partNumber: 1,
      pageNumber: 1,
      title: 'Phần 1: Điền từ vựng theo ngữ cảnh (10 câu)',
      shortTitle: 'Điền từ vựng',
      instructions: 'Đọc kỹ câu văn và tự nhập từ tiếng Anh thích hợp nhất vào ô trống. Không có phương án trắc nghiệm sẵn.',
      questions: selectedVocab,
    },
    {
      partNumber: 2,
      pageNumber: 2,
      title: 'Phần 2: Tìm và sửa lỗi sai (10 câu)',
      shortTitle: 'Sửa lỗi sai',
      instructions: 'Xác định phần bị lỗi (A, B, C, hoặc D) và tự nhập câu trả lời theo cú pháp: [Chữ cái] - [Từ sửa lại], ví dụ: "B - doesn\'t".',
      questions: selectedError,
    },
    {
      partNumber: 3,
      pageNumber: 3,
      title: 'Phần 3: Luyện nghe chi tiết (1 bài, 5 câu)',
      shortTitle: 'Luyện nghe',
      instructions: 'Lắng nghe đoạn audio hoàn chỉnh bên dưới (bấm nút Phát Audio để nghe) và trả lời 5 câu hỏi tự luận dựa trên thông tin cụ thể.',
      trackId: track.id,
      audioTitle: track.audioTitle,
      audioText: track.audioText,
      questions: listeningQuestions,
    },
    {
      partNumber: 4,
      pageNumber: 4,
      subPart: 1,
      title: 'Phần 4: Đọc hiểu – Bài đọc 1 (5 câu)',
      shortTitle: 'Đọc hiểu 1',
      instructions: 'Đọc kỹ đoạn văn bản bên dưới và trả lời 5 câu hỏi tự luận. Trả lời bằng tiếng Anh súc tích.',
      passageId: passage1.id,
      readingTitle: passage1.readingTitle,
      readingText: passage1.readingText,
      questions: readingQuestions1,
    },
    {
      partNumber: 4,
      pageNumber: 5,
      subPart: 2,
      title: 'Phần 4: Đọc hiểu – Bài đọc 2 (5 câu)',
      shortTitle: 'Đọc hiểu 2',
      instructions: 'Đọc kỹ đoạn văn bản thứ hai (chủ đề độc lập hoàn toàn) và trả lời 5 câu hỏi tự luận bên dưới.',
      passageId: passage2.id,
      readingTitle: passage2.readingTitle,
      readingText: passage2.readingText,
      questions: readingQuestions2,
    },
    {
      partNumber: 5,
      pageNumber: 6,
      title: 'Phần 5: Sắp xếp lại câu hoàn chỉnh (5 câu)',
      shortTitle: 'Sắp xếp câu',
      instructions: 'Sắp xếp các từ bị xáo trộn thành một câu tiếng Anh chuẩn ngữ pháp. Tự nhập toàn bộ câu hoàn chỉnh vào ô trả lời.',
      questions: selectedReorder,
    },
  ];

  return {
    title: examTitle,
    level: normLevel,
    durationMinutes: 60,
    totalQuestions: 40,
    parts,
  };
}

// Fixed template for backward compatibility
const EXAM_BANKS = {
  A1: generateRandomExamSet({ level: 'A1' }),
};

function getExamSetForLevel(level = 'A1') {
  return generateRandomExamSet({ level });
}

module.exports = {
  VOCAB_POOL,
  ERROR_CORRECTION_POOL,
  LISTENING_POOLS,
  READING_POOLS,
  REORDER_POOL,
  generateRandomExamSet,
  getExamSetForLevel,
  EXAM_BANKS,
};
