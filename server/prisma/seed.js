const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const lessonsData = [
  {
    "orderNumber": 1,
    "title": "Greetings & Introductions",
    "description": "Học cách chào hỏi cơ bản, tạm biệt và tự giới thiệu bản thân bằng tiếng Anh một cách tự tin.",
    "level": "A1",
    "category": "Daily Life",
    "durationMinutes": 15,
    "vocabularies": [
      {
        "word": "Hello",
        "meaning": "Xin chào",
        "pronunciation": "/həˈloʊ/",
        "partOfSpeech": "interjection",
        "example": "Hello, nice to meet you.",
        "exampleMeaning": "Xin chào, rất vui được gặp bạn.",
        "category": "Greetings"
      },
      {
        "word": "Good morning",
        "meaning": "Chào buổi sáng",
        "pronunciation": "/ɡʊd ˈmɔːrnɪŋ/",
        "partOfSpeech": "phrase",
        "example": "Good morning, teacher!",
        "exampleMeaning": "Chào buổi sáng cô giáo!",
        "category": "Greetings"
      },
      {
        "word": "Good afternoon",
        "meaning": "Chào buổi chiều",
        "pronunciation": "/ɡʊd ˌæftərˈnuːn/",
        "partOfSpeech": "phrase",
        "example": "Good afternoon, class.",
        "exampleMeaning": "Chào buổi chiều cả lớp.",
        "category": "Greetings"
      },
      {
        "word": "Good evening",
        "meaning": "Chào buổi tối",
        "pronunciation": "/ɡʊd ˈiːvnɪŋ/",
        "partOfSpeech": "phrase",
        "example": "Good evening, Mr. John.",
        "exampleMeaning": "Chào buổi tối, thầy John.",
        "category": "Greetings"
      },
      {
        "word": "Goodbye",
        "meaning": "Tạm biệt",
        "pronunciation": "/ɡʊdˈbaɪ/",
        "partOfSpeech": "interjection",
        "example": "Goodbye, see you tomorrow.",
        "exampleMeaning": "Tạm biệt, hẹn gặp lại bạn ngày mai.",
        "category": "Greetings"
      },
      {
        "word": "See you",
        "meaning": "Hẹn gặp lại",
        "pronunciation": "/siː juː/",
        "partOfSpeech": "phrase",
        "example": "See you later, my friend.",
        "exampleMeaning": "Hẹn gặp lại sau nhé bạn tôi.",
        "category": "Greetings"
      },
      {
        "word": "Name",
        "meaning": "Tên",
        "pronunciation": "/neɪm/",
        "partOfSpeech": "noun",
        "example": "My name is David.",
        "exampleMeaning": "Tên tôi là David.",
        "category": "Introductions"
      },
      {
        "word": "Meet",
        "meaning": "Gặp gỡ",
        "pronunciation": "/miːt/",
        "partOfSpeech": "verb",
        "example": "Glad to meet you.",
        "exampleMeaning": "Rất vui được gặp bạn.",
        "category": "Introductions"
      },
      {
        "word": "Please",
        "meaning": "Làm ơn / Xin vui lòng",
        "pronunciation": "/pliːz/",
        "partOfSpeech": "adverb",
        "example": "Come in, please.",
        "exampleMeaning": "Xin mời vào.",
        "category": "Polite"
      },
      {
        "word": "Thank you",
        "meaning": "Cảm ơn bạn",
        "pronunciation": "/ˈθæŋk juː/",
        "partOfSpeech": "phrase",
        "example": "Thank you for your help.",
        "exampleMeaning": "Cảm ơn sự giúp đỡ của bạn.",
        "category": "Polite"
      },
      {
        "word": "Welcome",
        "meaning": "Chào mừng / Không có chi",
        "pronunciation": "/ˈwelkəm/",
        "partOfSpeech": "interjection",
        "example": "You are welcome.",
        "exampleMeaning": "Không có gì ạ.",
        "category": "Polite"
      },
      {
        "word": "Friend",
        "meaning": "Bạn bè",
        "pronunciation": "/frend/",
        "partOfSpeech": "noun",
        "example": "This is my friend, Anna.",
        "exampleMeaning": "Đây là bạn của tôi, Anna.",
        "category": "People"
      },
      {
        "word": "Nice",
        "meaning": "Tốt đẹp, dễ mến",
        "pronunciation": "/naɪs/",
        "partOfSpeech": "adjective",
        "example": "It is a nice day.",
        "exampleMeaning": "Hôm nay là một ngày đẹp trời.",
        "category": "Introductions"
      },
      {
        "word": "How",
        "meaning": "Như thế nào",
        "pronunciation": "/haʊ/",
        "partOfSpeech": "adverb",
        "example": "How are you today?",
        "exampleMeaning": "Hôm nay bạn thế nào?",
        "category": "Introductions"
      },
      {
        "word": "Fine",
        "meaning": "Khỏe, ổn",
        "pronunciation": "/faɪn/",
        "partOfSpeech": "adjective",
        "example": "I am fine, thank you.",
        "exampleMeaning": "Tôi khỏe, cảm ơn bạn.",
        "category": "Introductions"
      },
      {
        "word": "Today",
        "meaning": "Hôm nay",
        "pronunciation": "/təˈdeɪ/",
        "partOfSpeech": "noun",
        "example": "I study English today.",
        "exampleMeaning": "Hôm nay tôi học tiếng Anh.",
        "category": "General"
      },
      {
        "word": "New",
        "meaning": "Mới mẻ",
        "pronunciation": "/nuː/",
        "partOfSpeech": "adjective",
        "example": "A new English student.",
        "exampleMeaning": "Một học viên tiếng Anh mới.",
        "category": "General"
      },
      {
        "word": "Everyone",
        "meaning": "Mọi người",
        "pronunciation": "/ˈevriwʌn/",
        "partOfSpeech": "pronoun",
        "example": "Hello everyone!",
        "exampleMeaning": "Xin chào mọi người!",
        "category": "People"
      },
      {
        "word": "Glad",
        "meaning": "Vui mừng, hân hạnh",
        "pronunciation": "/ɡlæd/",
        "partOfSpeech": "adjective",
        "example": "I am glad to see you.",
        "exampleMeaning": "Tôi rất vui được gặp bạn.",
        "category": "Feelings"
      },
      {
        "word": "Class",
        "meaning": "Lớp học",
        "pronunciation": "/klæs/",
        "partOfSpeech": "noun",
        "example": "Welcome to our English class.",
        "exampleMeaning": "Chào mừng đến lớp học tiếng Anh.",
        "category": "School"
      }
    ],
    "grammarPoints": [
      {
        "title": "Cách tự giới thiệu bản thân với 'My name is' & 'I am'",
        "explanation": "Để giới thiệu tên của mình với người khác trong tiếng Anh, bạn có thể dùng 2 cấu trúc thông dụng nhất.",
        "formula": "My name is + [Tên] / I am + [Tên]",
        "examples": "[{\"en\": \"My name is Duy.\", \"vi\": \"Tên tôi là Duy.\"}, {\"en\": \"I am Sarah.\", \"vi\": \"Tôi là Sarah.\"}, {\"en\": \"Nice to meet you, John.\", \"vi\": \"Rất vui được gặp bạn, John.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Morning Meeting at the Office",
        "transcript": "Good morning! My name is John. I am a new student here. Nice to meet you all.",
        "questions": "[{\"question\": \"What is the speaker's name?\", \"options\": [\"David\", \"John\", \"Michael\", \"Tom\"], \"correctAnswer\": \"John\", \"explanation\": \"Đoạn nói: 'My name is John.'\"}, {\"question\": \"What time of day is it?\", \"options\": [\"Morning\", \"Afternoon\", \"Evening\", \"Night\"], \"correctAnswer\": \"Morning\", \"explanation\": \"Đoạn nói: 'Good morning!'\"}]"
      }
    ],
    "conversations": [
      {
        "title": "First Day at School",
        "context": "Hai bạn học lần đầu tiên gặp nhau tại lớp học tiếng Anh.",
        "dialogue": "[{\"speaker\": \"Anna\", \"text\": \"Hello! My name is Anna. What is your name?\", \"meaning\": \"Xin chào! Tên mình là Anna. Tên bạn là gì?\"}, {\"speaker\": \"Peter\", \"text\": \"Hi Anna! I am Peter. Nice to meet you.\", \"meaning\": \"Chào Anna! Mình là Peter. Rất vui được gặp bạn.\"}, {\"speaker\": \"Anna\", \"text\": \"Nice to meet you too, Peter. Are you a new student?\", \"meaning\": \"Mình cũng rất vui được gặp bạn, Peter. Bạn là học sinh mới à?\"}, {\"speaker\": \"Peter\", \"text\": \"Yes, I am. Let's be friends!\", \"meaning\": \"Đúng vậy. Chúng mình hãy làm bạn nhé!\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Chào buổi sáng trong tiếng Anh là gì?",
        "options": "[\"Good night\", \"Good morning\", \"Good afternoon\", \"Goodbye\"]",
        "correctAnswer": "Good morning",
        "explanation": "Good morning = Chào buổi sáng."
      },
      {
        "type": "FILL_BLANK",
        "question": "Nice to _____ you.",
        "options": "[\"meet\", \"meat\", \"look\", \"see\"]",
        "correctAnswer": "meet",
        "explanation": "Nice to meet you = Rất vui được gặp bạn."
      },
      {
        "type": "WORD_ORDER",
        "question": "Sắp xếp: [name / My / is / David]",
        "options": "[\"My\", \"name\", \"is\", \"David\"]",
        "correctAnswer": "My name is David",
        "explanation": "My name is David = Tên tôi là David."
      },
      {
        "type": "MATCHING",
        "question": "Nối từ tiếng Anh với nghĩa tiếng Việt tương ứng",
        "options": "[{\"left\": \"Hello\", \"right\": \"Xin chào\"}, {\"left\": \"Goodbye\", \"right\": \"Tạm biệt\"}, {\"left\": \"Thank you\", \"right\": \"Cảm ơn\"}]",
        "correctAnswer": "Hello:Xin chào|Goodbye:Tạm biệt|Thank you:Cảm ơn",
        "explanation": "Hello = Xin chào, Goodbye = Tạm biệt, Thank you = Cảm ơn."
      }
    ],
    "quizzes": [
      {
        "question": "Khi gặp ai đó vào lúc 8 giờ sáng, bạn sẽ nói gì?",
        "options": "[\"Good evening\", \"Good morning\", \"Good night\", \"Goodbye\"]",
        "correctAnswer": "Good morning",
        "explanation": "8h sáng dùng Good morning."
      },
      {
        "question": "Điền từ: 'My _____ is Alex.'",
        "options": "[\"age\", \"name\", \"friend\", \"school\"]",
        "correctAnswer": "name",
        "explanation": "My name is Alex (Tên tôi là Alex)."
      },
      {
        "question": "Đáp lại câu 'Nice to meet you', bạn nên nói gì?",
        "options": "[\"Nice to meet you too\", \"I am sorry\", \"No problem\", \"Good night\"]",
        "correctAnswer": "Nice to meet you too",
        "explanation": "Nice to meet you too (Tôi cũng rất vui được gặp bạn)."
      },
      {
        "question": "'Thank you' có nghĩa là gì?",
        "options": "[\"Xin lỗi\", \"Cảm ơn\", \"Tạm biệt\", \"Không có gì\"]",
        "correctAnswer": "Cảm ơn",
        "explanation": "Thank you = Cảm ơn."
      },
      {
        "question": "Từ nào sau đây có nghĩa là 'Bạn bè'?",
        "options": "[\"Teacher\", \"Student\", \"Friend\", \"Family\"]",
        "correctAnswer": "Friend",
        "explanation": "Friend = Bạn bè."
      },
      {
        "question": "Chào buổi chiều là:",
        "options": "[\"Good afternoon\", \"Good morning\", \"Good night\", \"Goodbye\"]",
        "correctAnswer": "Good afternoon",
        "explanation": "Good afternoon = Chào buổi chiều."
      },
      {
        "question": "Chào buổi tối là:",
        "options": "[\"Good evening\", \"Good morning\", \"Good night\", \"Good day\"]",
        "correctAnswer": "Good evening",
        "explanation": "Good evening = Chào buổi tối."
      },
      {
        "question": "'How are you?' nghĩa là:",
        "options": "[\"Bạn có khỏe không?\", \"Bạn tên gì?\", \"Bạn đi đâu đấy?\", \"Bạn bao nhiêu tuổi?\"]",
        "correctAnswer": "Bạn có khỏe không?",
        "explanation": "How are you? = Bạn có khỏe không?"
      },
      {
        "question": "Trả lời 'I am fine, thank you' nghĩa là:",
        "options": "[\"Tôi khỏe, cảm ơn bạn\", \"Tôi mệt lắm\", \"Tạm biệt bạn\", \"Tôi không biết\"]",
        "correctAnswer": "Tôi khỏe, cảm ơn bạn",
        "explanation": "I am fine = Tôi khỏe."
      },
      {
        "question": "'See you later' nghĩa là:",
        "options": "[\"Hẹn gặp lại sau\", \"Xin chào bạn\", \"Cảm ơn nhiều\", \"Xin lỗi nhé\"]",
        "correctAnswer": "Hẹn gặp lại sau",
        "explanation": "See you later = Hẹn gặp lại sau."
      }
    ]
  },
  {
    "orderNumber": 2,
    "title": "Personal Pronouns & Verb 'To Be'",
    "description": "Nắm vững nền tảng ngữ pháp quan trọng nhất: Đại từ nhân xưng và Động từ to be (am, is, are).",
    "level": "A1",
    "category": "Grammar Foundation",
    "durationMinutes": 20,
    "vocabularies": [
      {
        "word": "Student",
        "meaning": "Học sinh, sinh viên",
        "pronunciation": "/ˈstuːdənt/",
        "partOfSpeech": "noun",
        "example": "I am a student.",
        "exampleMeaning": "Ví dụ về học sinh, sinh viên.",
        "category": "Grammar Foundation"
      },
      {
        "word": "Teacher",
        "meaning": "Giáo viên",
        "pronunciation": "/ˈtiːtʃər/",
        "partOfSpeech": "noun",
        "example": "She is a teacher.",
        "exampleMeaning": "Ví dụ về giáo viên.",
        "category": "Grammar Foundation"
      },
      {
        "word": "Doctor",
        "meaning": "Bác sĩ",
        "pronunciation": "/ˈdɑːktər/",
        "partOfSpeech": "noun",
        "example": "He is a doctor.",
        "exampleMeaning": "Ví dụ về bác sĩ.",
        "category": "Grammar Foundation"
      },
      {
        "word": "Nurse",
        "meaning": "Y tá, điều dưỡng",
        "pronunciation": "/nɜːrs/",
        "partOfSpeech": "noun",
        "example": "She works as a nurse.",
        "exampleMeaning": "Ví dụ về y tá, điều dưỡng.",
        "category": "Grammar Foundation"
      },
      {
        "word": "Happy",
        "meaning": "Vui vẻ, hạnh phúc",
        "pronunciation": "/ˈhæpi/",
        "partOfSpeech": "adjective",
        "example": "We are very happy.",
        "exampleMeaning": "Ví dụ về vui vẻ, hạnh phúc.",
        "category": "Grammar Foundation"
      },
      {
        "word": "Tired",
        "meaning": "Mệt mỏi",
        "pronunciation": "/ˈtaɪərd/",
        "partOfSpeech": "adjective",
        "example": "Are you tired?",
        "exampleMeaning": "Ví dụ về mệt mỏi.",
        "category": "Grammar Foundation"
      },
      {
        "word": "Ready",
        "meaning": "Sẵn sàng",
        "pronunciation": "/ˈredi/",
        "partOfSpeech": "adjective",
        "example": "I am ready to learn.",
        "exampleMeaning": "Ví dụ về sẵn sàng.",
        "category": "Grammar Foundation"
      },
      {
        "word": "Clever",
        "meaning": "Thông minh, lanh lợi",
        "pronunciation": "/ˈklevər/",
        "partOfSpeech": "adjective",
        "example": "He is very clever.",
        "exampleMeaning": "Ví dụ về thông minh, lanh lợi.",
        "category": "Grammar Foundation"
      },
      {
        "word": "Busy",
        "meaning": "Bận rộn",
        "pronunciation": "/ˈbɪzi/",
        "partOfSpeech": "adjective",
        "example": "Are they busy today?",
        "exampleMeaning": "Ví dụ về bận rộn.",
        "category": "Grammar Foundation"
      },
      {
        "word": "Strong",
        "meaning": "Khỏe mạnh, mạnh mẽ",
        "pronunciation": "/strɔːŋ/",
        "partOfSpeech": "adjective",
        "example": "He is very strong.",
        "exampleMeaning": "Ví dụ về khỏe mạnh, mạnh mẽ.",
        "category": "Grammar Foundation"
      },
      {
        "word": "Friendly",
        "meaning": "Thân thiện",
        "pronunciation": "/ˈfrendli/",
        "partOfSpeech": "adjective",
        "example": "Our neighbors are friendly.",
        "exampleMeaning": "Ví dụ về thân thiện.",
        "category": "Grammar Foundation"
      },
      {
        "word": "Polite",
        "meaning": "Lịch sự",
        "pronunciation": "/pəˈlaɪt/",
        "partOfSpeech": "adjective",
        "example": "Be polite to others.",
        "exampleMeaning": "Ví dụ về lịch sự.",
        "category": "Grammar Foundation"
      },
      {
        "word": "Quiet",
        "meaning": "Yên tĩnh",
        "pronunciation": "/ˈkwaɪət/",
        "partOfSpeech": "adjective",
        "example": "Please be quiet in library.",
        "exampleMeaning": "Ví dụ về yên tĩnh.",
        "category": "Grammar Foundation"
      },
      {
        "word": "Loud",
        "meaning": "Ồn ào",
        "pronunciation": "/laʊd/",
        "partOfSpeech": "adjective",
        "example": "The music is too loud.",
        "exampleMeaning": "Ví dụ về ồn ào.",
        "category": "Grammar Foundation"
      },
      {
        "word": "Together",
        "meaning": "Cùng nhau",
        "pronunciation": "/təˈɡeðər/",
        "partOfSpeech": "adverb",
        "example": "We study together.",
        "exampleMeaning": "Ví dụ về cùng nhau.",
        "category": "Grammar Foundation"
      },
      {
        "word": "School",
        "meaning": "Trường học",
        "pronunciation": "/skuːl/",
        "partOfSpeech": "noun",
        "example": "Walk to school every day.",
        "exampleMeaning": "Ví dụ về trường học.",
        "category": "Grammar Foundation"
      },
      {
        "word": "Lesson",
        "meaning": "Bài học",
        "pronunciation": "/ˈlesn/",
        "partOfSpeech": "noun",
        "example": "This is lesson two.",
        "exampleMeaning": "Ví dụ về bài học.",
        "category": "Grammar Foundation"
      },
      {
        "word": "Homework",
        "meaning": "Bài tập về nhà",
        "pronunciation": "/ˈhoʊmwɜːrk/",
        "partOfSpeech": "noun",
        "example": "Do your homework daily.",
        "exampleMeaning": "Ví dụ về bài tập về nhà.",
        "category": "Grammar Foundation"
      },
      {
        "word": "Book",
        "meaning": "Quyển sách",
        "pronunciation": "/bʊk/",
        "partOfSpeech": "noun",
        "example": "Read an English book.",
        "exampleMeaning": "Ví dụ về quyển sách.",
        "category": "Grammar Foundation"
      },
      {
        "word": "Pen",
        "meaning": "Cây bút mực",
        "pronunciation": "/pen/",
        "partOfSpeech": "noun",
        "example": "Write with a blue pen.",
        "exampleMeaning": "Ví dụ về cây bút mực.",
        "category": "Grammar Foundation"
      }
    ],
    "grammarPoints": [
      {
        "title": "Ngữ pháp trọng tâm: Personal Pronouns & Verb 'To Be'",
        "explanation": "Các quy tắc ngữ pháp thông dụng cần ghi nhớ khi nói về Personal Pronouns & Verb 'To Be'.",
        "formula": "S + V + O",
        "examples": "[{\"en\": \"Example sentence for Personal Pronouns & Verb 'To Be'.\", \"vi\": \"Câu ví dụ thực tế.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Luyện nghe chủ đề Personal Pronouns & Verb 'To Be'",
        "transcript": "Hello, welcome to our lesson on Personal Pronouns & Verb 'To Be'. We learn important words and communication phrases today.",
        "questions": "[{\"question\": \"Chủ đề nghe hôm nay là gì?\", \"options\": [\"Personal Pronouns & Verb 'To Be'\", \"Khác\", \"Không rõ\", \"Bỏ qua\"], \"correctAnswer\": \"Personal Pronouns & Verb 'To Be'\", \"explanation\": \"Chủ đề nghe: Personal Pronouns & Verb 'To Be'.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Hội thoại giao tiếp Personal Pronouns & Verb 'To Be'",
        "context": "Tình huống trò chuyện về Personal Pronouns & Verb 'To Be'.",
        "dialogue": "[{\"speaker\": \"A\", \"text\": \"Let's talk about Personal Pronouns & Verb 'To Be'.\", \"meaning\": \"Hãy nói về Personal Pronouns & Verb 'To Be' nhé.\"}, {\"speaker\": \"B\", \"text\": \"That sounds great, I'd love to!\", \"meaning\": \"Tuyệt vời, mình rất sẵn lòng!\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Từ vựng tiêu biểu của chủ đề Personal Pronouns & Verb 'To Be' là:",
        "options": "[\"Student\", \"Unrelated1\", \"Unrelated2\", \"Unrelated3\"]",
        "correctAnswer": "Student",
        "explanation": "Student thuộc chủ đề Personal Pronouns & Verb 'To Be'."
      }
    ],
    "quizzes": [
      {
        "question": "I ___ Vietnamese.",
        "options": "[\"am\", \"is\", \"are\", \"be\"]",
        "correctAnswer": "am",
        "explanation": "Đáp án đúng là: am."
      },
      {
        "question": "They ___ ready.",
        "options": "[\"am\", \"is\", \"are\", \"be\"]",
        "correctAnswer": "are",
        "explanation": "Đáp án đúng là: are."
      },
      {
        "question": "He is not ___ doctor.",
        "options": "[\"a\", \"an\", \"the\", \"one\"]",
        "correctAnswer": "a",
        "explanation": "Đáp án đúng là: a."
      },
      {
        "question": "___ she your friend?",
        "options": "[\"Am\", \"Is\", \"Are\", \"Do\"]",
        "correctAnswer": "Is",
        "explanation": "Đáp án đúng là: Is."
      },
      {
        "question": "We ___ happy today.",
        "options": "[\"am\", \"is\", \"are\", \"be\"]",
        "correctAnswer": "are",
        "explanation": "Đáp án đúng là: are."
      },
      {
        "question": "It ___ a beautiful day.",
        "options": "[\"is\", \"am\", \"are\", \"be\"]",
        "correctAnswer": "is",
        "explanation": "Đáp án đúng là: is."
      },
      {
        "question": "You ___ a good student.",
        "options": "[\"are\", \"is\", \"am\", \"be\"]",
        "correctAnswer": "are",
        "explanation": "Đáp án đúng là: are."
      },
      {
        "question": "Are they busy? - Yes, they ___.",
        "options": "[\"are\", \"is\", \"do\", \"am\"]",
        "correctAnswer": "are",
        "explanation": "Đáp án đúng là: are."
      },
      {
        "question": "Doctor nghĩa là:",
        "options": "[\"Bác sĩ\", \"Y tá\", \"Giáo viên\", \"Học sinh\"]",
        "correctAnswer": "Bác sĩ",
        "explanation": "Đáp án đúng là: Bác sĩ."
      },
      {
        "question": "Student nghĩa là:",
        "options": "[\"Học sinh\", \"Bác sĩ\", \"Kỹ sư\", \"Tài xế\"]",
        "correctAnswer": "Học sinh",
        "explanation": "Đáp án đúng là: Học sinh."
      }
    ]
  },
  {
    "orderNumber": 3,
    "title": "Family Members",
    "description": "Học từ vựng và cách giới thiệu các thành viên trong gia đình thân yêu của bạn.",
    "level": "A1",
    "category": "Relationships",
    "durationMinutes": 20,
    "vocabularies": [
      {
        "word": "Father",
        "meaning": "Bố, cha",
        "pronunciation": "/ˈfɑːðər/",
        "partOfSpeech": "noun",
        "example": "My father is tall.",
        "exampleMeaning": "Ví dụ về bố, cha.",
        "category": "Relationships"
      },
      {
        "word": "Mother",
        "meaning": "Mẹ",
        "pronunciation": "/ˈmʌðər/",
        "partOfSpeech": "noun",
        "example": "My mother is kind.",
        "exampleMeaning": "Ví dụ về mẹ.",
        "category": "Relationships"
      },
      {
        "word": "Brother",
        "meaning": "Anh/em trai",
        "pronunciation": "/ˈbrʌðər/",
        "partOfSpeech": "noun",
        "example": "I have an older brother.",
        "exampleMeaning": "Ví dụ về anh/em trai.",
        "category": "Relationships"
      },
      {
        "word": "Sister",
        "meaning": "Chị/em gái",
        "pronunciation": "/ˈsɪstər/",
        "partOfSpeech": "noun",
        "example": "My sister is cute.",
        "exampleMeaning": "Ví dụ về chị/em gái.",
        "category": "Relationships"
      },
      {
        "word": "Parents",
        "meaning": "Bố mẹ, phụ huynh",
        "pronunciation": "/ˈperənts/",
        "partOfSpeech": "noun",
        "example": "I love my parents.",
        "exampleMeaning": "Ví dụ về bố mẹ, phụ huynh.",
        "category": "Relationships"
      },
      {
        "word": "Grandfather",
        "meaning": "Ông",
        "pronunciation": "/ˈɡrændfɑːðər/",
        "partOfSpeech": "noun",
        "example": "My grandfather is 70.",
        "exampleMeaning": "Ví dụ về ông.",
        "category": "Relationships"
      },
      {
        "word": "Grandmother",
        "meaning": "Bà",
        "pronunciation": "/ˈɡrændmʌðər/",
        "partOfSpeech": "noun",
        "example": "My grandmother tells stories.",
        "exampleMeaning": "Ví dụ về bà.",
        "category": "Relationships"
      },
      {
        "word": "Baby",
        "meaning": "Em bé",
        "pronunciation": "/ˈbeɪbi/",
        "partOfSpeech": "noun",
        "example": "The baby is sleeping.",
        "exampleMeaning": "Ví dụ về em bé.",
        "category": "Relationships"
      },
      {
        "word": "Son",
        "meaning": "Con trai",
        "pronunciation": "/sʌn/",
        "partOfSpeech": "noun",
        "example": "He has a five-year-old son.",
        "exampleMeaning": "Ví dụ về con trai.",
        "category": "Relationships"
      },
      {
        "word": "Daughter",
        "meaning": "Con gái",
        "pronunciation": "/ˈdɔːtər/",
        "partOfSpeech": "noun",
        "example": "Their daughter is smart.",
        "exampleMeaning": "Ví dụ về con gái.",
        "category": "Relationships"
      },
      {
        "word": "Uncle",
        "meaning": "Chú, bác, cậu",
        "pronunciation": "/ˈʌŋkl/",
        "partOfSpeech": "noun",
        "example": "My uncle lives in Hanoi.",
        "exampleMeaning": "Ví dụ về chú, bác, cậu.",
        "category": "Relationships"
      },
      {
        "word": "Aunt",
        "meaning": "Cô, dì, bác gái",
        "pronunciation": "/ænt/",
        "partOfSpeech": "noun",
        "example": "Aunt Mary is a chef.",
        "exampleMeaning": "Ví dụ về cô, dì, bác gái.",
        "category": "Relationships"
      },
      {
        "word": "Cousin",
        "meaning": "Anh chị em họ",
        "pronunciation": "/ˈkʌzn/",
        "partOfSpeech": "noun",
        "example": "Play with my cousins.",
        "exampleMeaning": "Ví dụ về anh chị em họ.",
        "category": "Relationships"
      },
      {
        "word": "Nephew",
        "meaning": "Cháu trai",
        "pronunciation": "/ˈnefjuː/",
        "partOfSpeech": "noun",
        "example": "My nephew is two.",
        "exampleMeaning": "Ví dụ về cháu trai.",
        "category": "Relationships"
      },
      {
        "word": "Niece",
        "meaning": "Cháu gái",
        "pronunciation": "/niːs/",
        "partOfSpeech": "noun",
        "example": "My niece likes singing.",
        "exampleMeaning": "Ví dụ về cháu gái.",
        "category": "Relationships"
      },
      {
        "word": "Husband",
        "meaning": "Chồng",
        "pronunciation": "/ˈhʌzbənd/",
        "partOfSpeech": "noun",
        "example": "Her husband is an engineer.",
        "exampleMeaning": "Ví dụ về chồng.",
        "category": "Relationships"
      },
      {
        "word": "Wife",
        "meaning": "Vợ",
        "pronunciation": "/waɪf/",
        "partOfSpeech": "noun",
        "example": "His wife is a doctor.",
        "exampleMeaning": "Ví dụ về vợ.",
        "category": "Relationships"
      },
      {
        "word": "Family",
        "meaning": "Gia đình",
        "pronunciation": "/ˈfæməli/",
        "partOfSpeech": "noun",
        "example": "A happy family.",
        "exampleMeaning": "Ví dụ về gia đình.",
        "category": "Relationships"
      },
      {
        "word": "Relative",
        "meaning": "Họ hàng",
        "pronunciation": "/ˈrelətɪv/",
        "partOfSpeech": "noun",
        "example": "Visit relatives on holiday.",
        "exampleMeaning": "Ví dụ về họ hàng.",
        "category": "Relationships"
      },
      {
        "word": "Child",
        "meaning": "Đứa trẻ, con",
        "pronunciation": "/tʃaɪld/",
        "partOfSpeech": "noun",
        "example": "A sweet child.",
        "exampleMeaning": "Ví dụ về đứa trẻ, con.",
        "category": "Relationships"
      }
    ],
    "grammarPoints": [
      {
        "title": "Ngữ pháp trọng tâm: Family Members",
        "explanation": "Các quy tắc ngữ pháp thông dụng cần ghi nhớ khi nói về Family Members.",
        "formula": "S + V + O",
        "examples": "[{\"en\": \"Example sentence for Family Members.\", \"vi\": \"Câu ví dụ thực tế.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Luyện nghe chủ đề Family Members",
        "transcript": "Hello, welcome to our lesson on Family Members. We learn important words and communication phrases today.",
        "questions": "[{\"question\": \"Chủ đề nghe hôm nay là gì?\", \"options\": [\"Family Members\", \"Khác\", \"Không rõ\", \"Bỏ qua\"], \"correctAnswer\": \"Family Members\", \"explanation\": \"Chủ đề nghe: Family Members.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Hội thoại giao tiếp Family Members",
        "context": "Tình huống trò chuyện về Family Members.",
        "dialogue": "[{\"speaker\": \"A\", \"text\": \"Let's talk about Family Members.\", \"meaning\": \"Hãy nói về Family Members nhé.\"}, {\"speaker\": \"B\", \"text\": \"That sounds great, I'd love to!\", \"meaning\": \"Tuyệt vời, mình rất sẵn lòng!\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Từ vựng tiêu biểu của chủ đề Family Members là:",
        "options": "[\"Father\", \"Unrelated1\", \"Unrelated2\", \"Unrelated3\"]",
        "correctAnswer": "Father",
        "explanation": "Father thuộc chủ đề Family Members."
      }
    ],
    "quizzes": [
      {
        "question": "Từ nào chỉ Bố mẹ?",
        "options": "[\"Family\", \"Parents\", \"Brothers\", \"Sisters\"]",
        "correctAnswer": "Parents",
        "explanation": "Đáp án đúng là: Parents."
      },
      {
        "question": "Sister nghĩa là gì?",
        "options": "[\"Chị/em gái\", \"Anh/em trai\", \"Mẹ\", \"Bà\"]",
        "correctAnswer": "Chị/em gái",
        "explanation": "Đáp án đúng là: Chị/em gái."
      },
      {
        "question": "This is ___ father. (của tôi)",
        "options": "[\"my\", \"I\", \"me\", \"mine\"]",
        "correctAnswer": "my",
        "explanation": "Đáp án đúng là: my."
      },
      {
        "question": "Grandmother nghĩa là:",
        "options": "[\"Bà\", \"Ông\", \"Mẹ\", \"Dì\"]",
        "correctAnswer": "Bà",
        "explanation": "Đáp án đúng là: Bà."
      },
      {
        "question": "How many people in ___ family?",
        "options": "[\"your\", \"you\", \"yours\", \"you are\"]",
        "correctAnswer": "your",
        "explanation": "Đáp án đúng là: your."
      },
      {
        "question": "Uncle nghĩa là:",
        "options": "[\"Chú, bác\", \"Cô, dì\", \"Anh họ\", \"Em gái\"]",
        "correctAnswer": "Chú, bác",
        "explanation": "Đáp án đúng là: Chú, bác."
      },
      {
        "question": "Son nghĩa là:",
        "options": "[\"Con trai\", \"Con gái\", \"Bố\", \"Mẹ\"]",
        "correctAnswer": "Con trai",
        "explanation": "Đáp án đúng là: Con trai."
      },
      {
        "question": "Daughter nghĩa là:",
        "options": "[\"Con gái\", \"Con trai\", \"Cháu gái\", \"Chị gái\"]",
        "correctAnswer": "Con gái",
        "explanation": "Đáp án đúng là: Con gái."
      },
      {
        "question": "Baby nghĩa là:",
        "options": "[\"Em bé\", \"Người lớn\", \"Bà\", \"Ông\"]",
        "correctAnswer": "Em bé",
        "explanation": "Đáp án đúng là: Em bé."
      },
      {
        "question": "Aunt nghĩa là:",
        "options": "[\"Cô, dì\", \"Bác trai\", \"Anh họ\", \"Em trai\"]",
        "correctAnswer": "Cô, dì",
        "explanation": "Đáp án đúng là: Cô, dì."
      }
    ]
  },
  {
    "orderNumber": 4,
    "title": "Numbers & Telling Time",
    "description": "Làm quen với số đếm từ 1 đến 100, cách hỏi giờ và diễn đạt thời gian trong sinh hoạt.",
    "level": "A1",
    "category": "Everyday Skills",
    "durationMinutes": 20,
    "vocabularies": [
      {
        "word": "One",
        "meaning": "Số 1",
        "pronunciation": "/wʌn/",
        "partOfSpeech": "number",
        "example": "I have one cat.",
        "exampleMeaning": "Ví dụ về số 1.",
        "category": "Everyday Skills"
      },
      {
        "word": "Two",
        "meaning": "Số 2",
        "pronunciation": "/tuː/",
        "partOfSpeech": "number",
        "example": "Two cups of tea, please.",
        "exampleMeaning": "Ví dụ về số 2.",
        "category": "Everyday Skills"
      },
      {
        "word": "Three",
        "meaning": "Số 3",
        "pronunciation": "/θriː/",
        "partOfSpeech": "number",
        "example": "Three books on the desk.",
        "exampleMeaning": "Ví dụ về số 3.",
        "category": "Everyday Skills"
      },
      {
        "word": "Four",
        "meaning": "Số 4",
        "pronunciation": "/fɔːr/",
        "partOfSpeech": "number",
        "example": "There are four chairs.",
        "exampleMeaning": "Ví dụ về số 4.",
        "category": "Everyday Skills"
      },
      {
        "word": "Five",
        "meaning": "Số 5",
        "pronunciation": "/faɪv/",
        "partOfSpeech": "number",
        "example": "High five!",
        "exampleMeaning": "Ví dụ về số 5.",
        "category": "Everyday Skills"
      },
      {
        "word": "Six",
        "meaning": "Số 6",
        "pronunciation": "/sɪks/",
        "partOfSpeech": "number",
        "example": "Six days a week.",
        "exampleMeaning": "Ví dụ về số 6.",
        "category": "Everyday Skills"
      },
      {
        "word": "Seven",
        "meaning": "Số 7",
        "pronunciation": "/ˈsevn/",
        "partOfSpeech": "number",
        "example": "Seven days in a week.",
        "exampleMeaning": "Ví dụ về số 7.",
        "category": "Everyday Skills"
      },
      {
        "word": "Eight",
        "meaning": "Số 8",
        "pronunciation": "/eɪt/",
        "partOfSpeech": "number",
        "example": "Eight o'clock.",
        "exampleMeaning": "Ví dụ về số 8.",
        "category": "Everyday Skills"
      },
      {
        "word": "Nine",
        "meaning": "Số 9",
        "pronunciation": "/naɪn/",
        "partOfSpeech": "number",
        "example": "Nine hours of sleep.",
        "exampleMeaning": "Ví dụ về số 9.",
        "category": "Everyday Skills"
      },
      {
        "word": "Ten",
        "meaning": "Số 10",
        "pronunciation": "/ten/",
        "partOfSpeech": "number",
        "example": "Ten minutes left.",
        "exampleMeaning": "Ví dụ về số 10.",
        "category": "Everyday Skills"
      },
      {
        "word": "Fifteen",
        "meaning": "Số 15",
        "pronunciation": "/ˌfɪfˈtiːn/",
        "partOfSpeech": "number",
        "example": "Fifteen dollars.",
        "exampleMeaning": "Ví dụ về số 15.",
        "category": "Everyday Skills"
      },
      {
        "word": "Twenty",
        "meaning": "Số 20",
        "pronunciation": "/ˈtwenti/",
        "partOfSpeech": "number",
        "example": "Twenty years old.",
        "exampleMeaning": "Ví dụ về số 20.",
        "category": "Everyday Skills"
      },
      {
        "word": "Thirty",
        "meaning": "Số 30",
        "pronunciation": "/ˈθɜːrti/",
        "partOfSpeech": "number",
        "example": "Thirty minutes.",
        "exampleMeaning": "Ví dụ về số 30.",
        "category": "Everyday Skills"
      },
      {
        "word": "Fifty",
        "meaning": "Số 50",
        "pronunciation": "/ˈfɪfti/",
        "partOfSpeech": "number",
        "example": "Fifty percent.",
        "exampleMeaning": "Ví dụ về số 50.",
        "category": "Everyday Skills"
      },
      {
        "word": "Hundred",
        "meaning": "Một trăm",
        "pronunciation": "/ˈhʌndrəd/",
        "partOfSpeech": "number",
        "example": "One hundred percent.",
        "exampleMeaning": "Ví dụ về một trăm.",
        "category": "Everyday Skills"
      },
      {
        "word": "Clock",
        "meaning": "Đồng hồ treo tường",
        "pronunciation": "/klɑːk/",
        "partOfSpeech": "noun",
        "example": "Look at the clock.",
        "exampleMeaning": "Ví dụ về đồng hồ treo tường.",
        "category": "Everyday Skills"
      },
      {
        "word": "Minute",
        "meaning": "Phút",
        "pronunciation": "/ˈmɪnɪt/",
        "partOfSpeech": "noun",
        "example": "Wait a minute.",
        "exampleMeaning": "Ví dụ về phút.",
        "category": "Everyday Skills"
      },
      {
        "word": "Hour",
        "meaning": "Giờ, tiếng",
        "pronunciation": "/ˈaʊər/",
        "partOfSpeech": "noun",
        "example": "One hour of study.",
        "exampleMeaning": "Ví dụ về giờ, tiếng.",
        "category": "Everyday Skills"
      },
      {
        "word": "Second",
        "meaning": "Giây",
        "pronunciation": "/ˈsekənd/",
        "partOfSpeech": "noun",
        "example": "Just a second.",
        "exampleMeaning": "Ví dụ về giây.",
        "category": "Everyday Skills"
      },
      {
        "word": "O'clock",
        "meaning": "Giờ đúng",
        "pronunciation": "/əˈklɑːk/",
        "partOfSpeech": "adverb",
        "example": "It is seven o'clock.",
        "exampleMeaning": "Ví dụ về giờ đúng.",
        "category": "Everyday Skills"
      }
    ],
    "grammarPoints": [
      {
        "title": "Ngữ pháp trọng tâm: Numbers & Telling Time",
        "explanation": "Các quy tắc ngữ pháp thông dụng cần ghi nhớ khi nói về Numbers & Telling Time.",
        "formula": "S + V + O",
        "examples": "[{\"en\": \"Example sentence for Numbers & Telling Time.\", \"vi\": \"Câu ví dụ thực tế.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Luyện nghe chủ đề Numbers & Telling Time",
        "transcript": "Hello, welcome to our lesson on Numbers & Telling Time. We learn important words and communication phrases today.",
        "questions": "[{\"question\": \"Chủ đề nghe hôm nay là gì?\", \"options\": [\"Numbers & Telling Time\", \"Khác\", \"Không rõ\", \"Bỏ qua\"], \"correctAnswer\": \"Numbers & Telling Time\", \"explanation\": \"Chủ đề nghe: Numbers & Telling Time.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Hội thoại giao tiếp Numbers & Telling Time",
        "context": "Tình huống trò chuyện về Numbers & Telling Time.",
        "dialogue": "[{\"speaker\": \"A\", \"text\": \"Let's talk about Numbers & Telling Time.\", \"meaning\": \"Hãy nói về Numbers & Telling Time nhé.\"}, {\"speaker\": \"B\", \"text\": \"That sounds great, I'd love to!\", \"meaning\": \"Tuyệt vời, mình rất sẵn lòng!\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Từ vựng tiêu biểu của chủ đề Numbers & Telling Time là:",
        "options": "[\"One\", \"Unrelated1\", \"Unrelated2\", \"Unrelated3\"]",
        "correctAnswer": "One",
        "explanation": "One thuộc chủ đề Numbers & Telling Time."
      }
    ],
    "quizzes": [
      {
        "question": "Số 15 là:",
        "options": "[\"Fifteen\", \"Fifty\", \"Five\", \"Fifth\"]",
        "correctAnswer": "Fifteen",
        "explanation": "Đáp án đúng là: Fifteen."
      },
      {
        "question": "Số 50 là:",
        "options": "[\"Fifty\", \"Fifteen\", \"Fivety\", \"Five\"]",
        "correctAnswer": "Fifty",
        "explanation": "Đáp án đúng là: Fifty."
      },
      {
        "question": "It is 8 ___ (8 giờ đúng).",
        "options": "[\"o'clock\", \"clock\", \"time\", \"hour\"]",
        "correctAnswer": "o'clock",
        "explanation": "Đáp án đúng là: o'clock."
      },
      {
        "question": "Minute nghĩa là:",
        "options": "[\"Phút\", \"Giờ\", \"Giây\", \"Ngày\"]",
        "correctAnswer": "Phút",
        "explanation": "Đáp án đúng là: Phút."
      },
      {
        "question": "Số 12 là:",
        "options": "[\"Twelve\", \"Twenty\", \"Ten\", \"Eleven\"]",
        "correctAnswer": "Twelve",
        "explanation": "Đáp án đúng là: Twelve."
      },
      {
        "question": "Số 20 là:",
        "options": "[\"Twenty\", \"Twelve\", \"Two\", \"Tenth\"]",
        "correctAnswer": "Twenty",
        "explanation": "Đáp án đúng là: Twenty."
      },
      {
        "question": "What time is it? là câu hỏi gì?",
        "options": "[\"Hỏi giờ\", \"Hỏi giá\", \"Hỏi đường\", \"Hỏi tên\"]",
        "correctAnswer": "Hỏi giờ",
        "explanation": "Đáp án đúng là: Hỏi giờ."
      },
      {
        "question": "Second nghĩa là:",
        "options": "[\"Giây\", \"Phút\", \"Giờ\", \"Ngày\"]",
        "correctAnswer": "Giây",
        "explanation": "Đáp án đúng là: Giây."
      },
      {
        "question": "Hour nghĩa là:",
        "options": "[\"Giờ, tiếng\", \"Phút\", \"Giây\", \"Tuần\"]",
        "correctAnswer": "Giờ, tiếng",
        "explanation": "Đáp án đúng là: Giờ, tiếng."
      },
      {
        "question": "Một trăm trong tiếng Anh là:",
        "options": "[\"Hundred\", \"Thousand\", \"Million\", \"Ten\"]",
        "correctAnswer": "Hundred",
        "explanation": "Đáp án đúng là: Hundred."
      }
    ]
  },
  {
    "orderNumber": 5,
    "title": "Food, Drinks & Coffee Shop",
    "description": "Học cách gọi đồ ăn, thức uống, chọn kích cỡ và thanh toán tại quán cà phê.",
    "level": "A1",
    "category": "Social & Travel",
    "durationMinutes": 20,
    "vocabularies": [
      {
        "word": "Coffee",
        "meaning": "Cà phê",
        "pronunciation": "/ˈkɔːfi/",
        "partOfSpeech": "noun",
        "example": "I drink hot coffee.",
        "exampleMeaning": "Ví dụ về cà phê.",
        "category": "Social & Travel"
      },
      {
        "word": "Tea",
        "meaning": "Trà",
        "pronunciation": "/tiː/",
        "partOfSpeech": "noun",
        "example": "A cup of green tea.",
        "exampleMeaning": "Ví dụ về trà.",
        "category": "Social & Travel"
      },
      {
        "word": "Water",
        "meaning": "Nước lọc",
        "pronunciation": "/ˈwɔːtər/",
        "partOfSpeech": "noun",
        "example": "Drink plenty of water.",
        "exampleMeaning": "Ví dụ về nước lọc.",
        "category": "Social & Travel"
      },
      {
        "word": "Milk",
        "meaning": "Sữa tươi",
        "pronunciation": "/mɪlk/",
        "partOfSpeech": "noun",
        "example": "A glass of warm milk.",
        "exampleMeaning": "Ví dụ về sữa tươi.",
        "category": "Social & Travel"
      },
      {
        "word": "Juice",
        "meaning": "Nước ép trái cây",
        "pronunciation": "/dʒuːs/",
        "partOfSpeech": "noun",
        "example": "Fresh orange juice.",
        "exampleMeaning": "Ví dụ về nước ép trái cây.",
        "category": "Social & Travel"
      },
      {
        "word": "Apple",
        "meaning": "Quả táo",
        "pronunciation": "/ˈæpəl/",
        "partOfSpeech": "noun",
        "example": "An apple a day.",
        "exampleMeaning": "Ví dụ về quả táo.",
        "category": "Social & Travel"
      },
      {
        "word": "Bread",
        "meaning": "Bánh mì",
        "pronunciation": "/bred/",
        "partOfSpeech": "noun",
        "example": "Fresh bread for breakfast.",
        "exampleMeaning": "Ví dụ về bánh mì.",
        "category": "Social & Travel"
      },
      {
        "word": "Rice",
        "meaning": "Cơm, gạo",
        "pronunciation": "/raɪs/",
        "partOfSpeech": "noun",
        "example": "Eat rice for lunch.",
        "exampleMeaning": "Ví dụ về cơm, gạo.",
        "category": "Social & Travel"
      },
      {
        "word": "Meat",
        "meaning": "Thịt",
        "pronunciation": "/miːt/",
        "partOfSpeech": "noun",
        "example": "Grilled meat and vegetables.",
        "exampleMeaning": "Ví dụ về thịt.",
        "category": "Social & Travel"
      },
      {
        "word": "Fish",
        "meaning": "Cá",
        "pronunciation": "/fɪʃ/",
        "partOfSpeech": "noun",
        "example": "Fresh seafood fish.",
        "exampleMeaning": "Ví dụ về cá.",
        "category": "Social & Travel"
      },
      {
        "word": "Menu",
        "meaning": "Thực đơn",
        "pronunciation": "/ˈmenjuː/",
        "partOfSpeech": "noun",
        "example": "Can I see the menu?",
        "exampleMeaning": "Ví dụ về thực đơn.",
        "category": "Social & Travel"
      },
      {
        "word": "Size",
        "meaning": "Kích cỡ",
        "pronunciation": "/saɪz/",
        "partOfSpeech": "noun",
        "example": "Medium size, please.",
        "exampleMeaning": "Ví dụ về kích cỡ.",
        "category": "Social & Travel"
      },
      {
        "word": "Cup",
        "meaning": "Tách, cốc",
        "pronunciation": "/kʌp/",
        "partOfSpeech": "noun",
        "example": "A cup of coffee.",
        "exampleMeaning": "Ví dụ về tách, cốc.",
        "category": "Social & Travel"
      },
      {
        "word": "Glass",
        "meaning": "Ly thủy tinh",
        "pronunciation": "/ɡlæs/",
        "partOfSpeech": "noun",
        "example": "A glass of water.",
        "exampleMeaning": "Ví dụ về ly thủy tinh.",
        "category": "Social & Travel"
      },
      {
        "word": "Bottle",
        "meaning": "Chai nước",
        "pronunciation": "/ˈbɑːtl/",
        "partOfSpeech": "noun",
        "example": "A bottle of mineral water.",
        "exampleMeaning": "Ví dụ về chai nước.",
        "category": "Social & Travel"
      },
      {
        "word": "Sugar",
        "meaning": "Đường ngọt",
        "pronunciation": "/ˈʃʊɡər/",
        "partOfSpeech": "noun",
        "example": "Coffee without sugar.",
        "exampleMeaning": "Ví dụ về đường ngọt.",
        "category": "Social & Travel"
      },
      {
        "word": "Bill",
        "meaning": "Hóa đơn tính tiền",
        "pronunciation": "/bɪl/",
        "partOfSpeech": "noun",
        "example": "Can I have the bill?",
        "exampleMeaning": "Ví dụ về hóa đơn tính tiền.",
        "category": "Social & Travel"
      },
      {
        "word": "Order",
        "meaning": "Gọi món, đặt hàng",
        "pronunciation": "/ˈɔːrdər/",
        "partOfSpeech": "verb",
        "example": "Are you ready to order?",
        "exampleMeaning": "Ví dụ về gọi món, đặt hàng.",
        "category": "Social & Travel"
      },
      {
        "word": "Delicious",
        "meaning": "Thơm ngon",
        "pronunciation": "/dɪˈlɪʃəs/",
        "partOfSpeech": "adjective",
        "example": "This cake is delicious.",
        "exampleMeaning": "Ví dụ về thơm ngon.",
        "category": "Social & Travel"
      },
      {
        "word": "Hungry",
        "meaning": "Đói bụng",
        "pronunciation": "/ˈhʌŋɡri/",
        "partOfSpeech": "adjective",
        "example": "I am very hungry now.",
        "exampleMeaning": "Ví dụ về đói bụng.",
        "category": "Social & Travel"
      }
    ],
    "grammarPoints": [
      {
        "title": "Ngữ pháp trọng tâm: Food, Drinks & Coffee Shop",
        "explanation": "Các quy tắc ngữ pháp thông dụng cần ghi nhớ khi nói về Food, Drinks & Coffee Shop.",
        "formula": "S + V + O",
        "examples": "[{\"en\": \"Example sentence for Food, Drinks & Coffee Shop.\", \"vi\": \"Câu ví dụ thực tế.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Luyện nghe chủ đề Food, Drinks & Coffee Shop",
        "transcript": "Hello, welcome to our lesson on Food, Drinks & Coffee Shop. We learn important words and communication phrases today.",
        "questions": "[{\"question\": \"Chủ đề nghe hôm nay là gì?\", \"options\": [\"Food, Drinks & Coffee Shop\", \"Khác\", \"Không rõ\", \"Bỏ qua\"], \"correctAnswer\": \"Food, Drinks & Coffee Shop\", \"explanation\": \"Chủ đề nghe: Food, Drinks & Coffee Shop.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Hội thoại giao tiếp Food, Drinks & Coffee Shop",
        "context": "Tình huống trò chuyện về Food, Drinks & Coffee Shop.",
        "dialogue": "[{\"speaker\": \"A\", \"text\": \"Let's talk about Food, Drinks & Coffee Shop.\", \"meaning\": \"Hãy nói về Food, Drinks & Coffee Shop nhé.\"}, {\"speaker\": \"B\", \"text\": \"That sounds great, I'd love to!\", \"meaning\": \"Tuyệt vời, mình rất sẵn lòng!\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Từ vựng tiêu biểu của chủ đề Food, Drinks & Coffee Shop là:",
        "options": "[\"Coffee\", \"Unrelated1\", \"Unrelated2\", \"Unrelated3\"]",
        "correctAnswer": "Coffee",
        "explanation": "Coffee thuộc chủ đề Food, Drinks & Coffee Shop."
      }
    ],
    "quizzes": [
      {
        "question": "Bill nghĩa là:",
        "options": "[\"Hóa đơn\", \"Thực đơn\", \"Đồ uống\", \"Bàn ăn\"]",
        "correctAnswer": "Hóa đơn",
        "explanation": "Đáp án đúng là: Hóa đơn."
      },
      {
        "question": "Kích cỡ Medium là:",
        "options": "[\"Vừa\", \"Nhỏ\", \"Lớn\", \"Rất lớn\"]",
        "correctAnswer": "Vừa",
        "explanation": "Đáp án đúng là: Vừa."
      },
      {
        "question": "Apple là:",
        "options": "[\"Quả táo\", \"Quả chuối\", \"Quả cam\", \"Quả nho\"]",
        "correctAnswer": "Quả táo",
        "explanation": "Đáp án đúng là: Quả táo."
      },
      {
        "question": "Anything else? nghĩa là:",
        "options": "[\"Còn gì nữa không?\", \"Bao nhiêu tiền?\", \"Đi đâu đấy?\", \"Ngon không?\"]",
        "correctAnswer": "Còn gì nữa không?",
        "explanation": "Đáp án đúng là: Còn gì nữa không?."
      },
      {
        "question": "Xin hóa đơn:",
        "options": "[\"Can I have the bill, please?\", \"Give money\", \"Bill now\", \"Table please\"]",
        "correctAnswer": "Can I have the bill, please?",
        "explanation": "Đáp án đúng là: Can I have the bill, please?."
      },
      {
        "question": "Milk nghĩa là:",
        "options": "[\"Sữa\", \"Trà\", \"Cà phê\", \"Nước lọc\"]",
        "correctAnswer": "Sữa",
        "explanation": "Đáp án đúng là: Sữa."
      },
      {
        "question": "Delicious nghĩa là:",
        "options": "[\"Thơm ngon\", \"Cay\", \"Đắng\", \"Dở tệ\"]",
        "correctAnswer": "Thơm ngon",
        "explanation": "Đáp án đúng là: Thơm ngon."
      },
      {
        "question": "Hungry nghĩa là:",
        "options": "[\"Đói bụng\", \"No nê\", \"Khát nước\", \"Mệt mỏi\"]",
        "correctAnswer": "Đói bụng",
        "explanation": "Đáp án đúng là: Đói bụng."
      },
      {
        "question": "Cup of tea là:",
        "options": "[\"Tách trà\", \"Chai trà\", \"Ly nước\", \"Ấm nước\"]",
        "correctAnswer": "Tách trà",
        "explanation": "Đáp án đúng là: Tách trà."
      },
      {
        "question": "Order món nghĩa là:",
        "options": "[\"Gọi món\", \"Trả tiền\", \"Nấu ăn\", \"Dọn dẹp\"]",
        "correctAnswer": "Gọi món",
        "explanation": "Đáp án đúng là: Gọi món."
      }
    ]
  },
  {
    "orderNumber": 6,
    "title": "Colors & Clothes",
    "description": "Khám phá các sắc màu cơ bản và trang phục mặc hàng ngày, cách miêu tả diện mạo bên ngoài.",
    "level": "A1",
    "category": "Daily Life",
    "durationMinutes": 20,
    "vocabularies": [
      {
        "word": "Red",
        "meaning": "Màu đỏ",
        "pronunciation": "/red/",
        "partOfSpeech": "adjective",
        "example": "She wears a red dress.",
        "exampleMeaning": "Ví dụ về màu đỏ.",
        "category": "Daily Life"
      },
      {
        "word": "Blue",
        "meaning": "Màu xanh dương",
        "pronunciation": "/bluː/",
        "partOfSpeech": "adjective",
        "example": "The clear blue sky.",
        "exampleMeaning": "Ví dụ về màu xanh dương.",
        "category": "Daily Life"
      },
      {
        "word": "Green",
        "meaning": "Màu xanh lá cây",
        "pronunciation": "/ɡriːn/",
        "partOfSpeech": "adjective",
        "example": "Green leaves on the tree.",
        "exampleMeaning": "Ví dụ về màu xanh lá cây.",
        "category": "Daily Life"
      },
      {
        "word": "Yellow",
        "meaning": "Màu vàng",
        "pronunciation": "/ˈjeloʊ/",
        "partOfSpeech": "adjective",
        "example": "A bright yellow sun.",
        "exampleMeaning": "Ví dụ về màu vàng.",
        "category": "Daily Life"
      },
      {
        "word": "Black",
        "meaning": "Màu đen",
        "pronunciation": "/blæk/",
        "partOfSpeech": "adjective",
        "example": "He wears a black jacket.",
        "exampleMeaning": "Ví dụ về màu đen.",
        "category": "Daily Life"
      },
      {
        "word": "White",
        "meaning": "Màu trắng",
        "pronunciation": "/waɪt/",
        "partOfSpeech": "adjective",
        "example": "A clean white shirt.",
        "exampleMeaning": "Ví dụ về màu trắng.",
        "category": "Daily Life"
      },
      {
        "word": "Orange",
        "meaning": "Màu cam",
        "pronunciation": "/ˈɔːrɪndʒ/",
        "partOfSpeech": "adjective",
        "example": "An orange sweater.",
        "exampleMeaning": "Ví dụ về màu cam.",
        "category": "Daily Life"
      },
      {
        "word": "Pink",
        "meaning": "Màu hồng",
        "pronunciation": "/pɪŋk/",
        "partOfSpeech": "adjective",
        "example": "She loves pink flowers.",
        "exampleMeaning": "Ví dụ về màu hồng.",
        "category": "Daily Life"
      },
      {
        "word": "Purple",
        "meaning": "Màu tím",
        "pronunciation": "/ˈpɜːrpl/",
        "partOfSpeech": "adjective",
        "example": "A purple umbrella.",
        "exampleMeaning": "Ví dụ về màu tím.",
        "category": "Daily Life"
      },
      {
        "word": "Brown",
        "meaning": "Màu nâu",
        "pronunciation": "/braʊn/",
        "partOfSpeech": "adjective",
        "example": "Brown leather shoes.",
        "exampleMeaning": "Ví dụ về màu nâu.",
        "category": "Daily Life"
      },
      {
        "word": "Shirt",
        "meaning": "Áo sơ mi",
        "pronunciation": "/ʃɜːrt/",
        "partOfSpeech": "noun",
        "example": "Iron your shirt.",
        "exampleMeaning": "Ví dụ về áo sơ mi.",
        "category": "Daily Life"
      },
      {
        "word": "Pants",
        "meaning": "Quần dài",
        "pronunciation": "/pænts/",
        "partOfSpeech": "noun",
        "example": "These black pants look smart.",
        "exampleMeaning": "Ví dụ về quần dài.",
        "category": "Daily Life"
      },
      {
        "word": "Shoes",
        "meaning": "Đôi giày",
        "pronunciation": "/ʃuːz/",
        "partOfSpeech": "noun",
        "example": "Put on your sports shoes.",
        "exampleMeaning": "Ví dụ về đôi giày.",
        "category": "Daily Life"
      },
      {
        "word": "Dress",
        "meaning": "Váy liền thân",
        "pronunciation": "/dres/",
        "partOfSpeech": "noun",
        "example": "A pretty floral dress.",
        "exampleMeaning": "Ví dụ về váy liền thân.",
        "category": "Daily Life"
      },
      {
        "word": "Hat",
        "meaning": "Chiếc mũ, nón",
        "pronunciation": "/hæt/",
        "partOfSpeech": "noun",
        "example": "Wear a hat under the sun.",
        "exampleMeaning": "Ví dụ về chiếc mũ, nón.",
        "category": "Daily Life"
      },
      {
        "word": "Jacket",
        "meaning": "Áo khoác",
        "pronunciation": "/ˈdʒækɪt/",
        "partOfSpeech": "noun",
        "example": "A warm winter jacket.",
        "exampleMeaning": "Ví dụ về áo khoác.",
        "category": "Daily Life"
      },
      {
        "word": "Socks",
        "meaning": "Đôi tất, vớ",
        "pronunciation": "/sɑːks/",
        "partOfSpeech": "noun",
        "example": "Cotton white socks.",
        "exampleMeaning": "Ví dụ về đôi tất, vớ.",
        "category": "Daily Life"
      },
      {
        "word": "Skirt",
        "meaning": "Chân váy",
        "pronunciation": "/skɜːrt/",
        "partOfSpeech": "noun",
        "example": "A pleated blue skirt.",
        "exampleMeaning": "Ví dụ về chân váy.",
        "category": "Daily Life"
      },
      {
        "word": "Coat",
        "meaning": "Áo choàng dài",
        "pronunciation": "/koʊt/",
        "partOfSpeech": "noun",
        "example": "A heavy winter coat.",
        "exampleMeaning": "Ví dụ về áo choàng dài.",
        "category": "Daily Life"
      },
      {
        "word": "Belt",
        "meaning": "Thắt lưng, nịt",
        "pronunciation": "/belt/",
        "partOfSpeech": "noun",
        "example": "A brown leather belt.",
        "exampleMeaning": "Ví dụ về thắt lưng, nịt.",
        "category": "Daily Life"
      }
    ],
    "grammarPoints": [
      {
        "title": "Ngữ pháp trọng tâm: Colors & Clothes",
        "explanation": "Các quy tắc ngữ pháp thông dụng cần ghi nhớ khi nói về Colors & Clothes.",
        "formula": "S + V + O",
        "examples": "[{\"en\": \"Example sentence for Colors & Clothes.\", \"vi\": \"Câu ví dụ thực tế.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Luyện nghe chủ đề Colors & Clothes",
        "transcript": "Hello, welcome to our lesson on Colors & Clothes. We learn important words and communication phrases today.",
        "questions": "[{\"question\": \"Chủ đề nghe hôm nay là gì?\", \"options\": [\"Colors & Clothes\", \"Khác\", \"Không rõ\", \"Bỏ qua\"], \"correctAnswer\": \"Colors & Clothes\", \"explanation\": \"Chủ đề nghe: Colors & Clothes.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Hội thoại giao tiếp Colors & Clothes",
        "context": "Tình huống trò chuyện về Colors & Clothes.",
        "dialogue": "[{\"speaker\": \"A\", \"text\": \"Let's talk about Colors & Clothes.\", \"meaning\": \"Hãy nói về Colors & Clothes nhé.\"}, {\"speaker\": \"B\", \"text\": \"That sounds great, I'd love to!\", \"meaning\": \"Tuyệt vời, mình rất sẵn lòng!\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Từ vựng tiêu biểu của chủ đề Colors & Clothes là:",
        "options": "[\"Red\", \"Unrelated1\", \"Unrelated2\", \"Unrelated3\"]",
        "correctAnswer": "Red",
        "explanation": "Red thuộc chủ đề Colors & Clothes."
      }
    ],
    "quizzes": [
      {
        "question": "Màu đỏ là:",
        "options": "[\"Red\", \"Blue\", \"Green\", \"Black\"]",
        "correctAnswer": "Red",
        "explanation": "Đáp án đúng là: Red."
      },
      {
        "question": "Đôi giày trong tiếng Anh là:",
        "options": "[\"Shoes\", \"Shirt\", \"Pants\", \"Dress\"]",
        "correctAnswer": "Shoes",
        "explanation": "Đáp án đúng là: Shoes."
      },
      {
        "question": "Yellow nghĩa là:",
        "options": "[\"Màu vàng\", \"Màu xanh\", \"Màu trắng\", \"Màu đen\"]",
        "correctAnswer": "Màu vàng",
        "explanation": "Đáp án đúng là: Màu vàng."
      },
      {
        "question": "Áo sơ mi là:",
        "options": "[\"Shirt\", \"Pants\", \"Shoes\", \"Hat\"]",
        "correctAnswer": "Shirt",
        "explanation": "Đáp án đúng là: Shirt."
      },
      {
        "question": "White nghĩa là:",
        "options": "[\"Màu trắng\", \"Màu đen\", \"Màu hồng\", \"Màu nâu\"]",
        "correctAnswer": "Màu trắng",
        "explanation": "Đáp án đúng là: Màu trắng."
      },
      {
        "question": "Hat nghĩa là:",
        "options": "[\"Chiếc mũ\", \"Chiếc áo\", \"Đôi giày\", \"Cái quần\"]",
        "correctAnswer": "Chiếc mũ",
        "explanation": "Đáp án đúng là: Chiếc mũ."
      },
      {
        "question": "Jacket là:",
        "options": "[\"Áo khoác\", \"Áo sơ mi\", \"Chân váy\", \"Đôi vớ\"]",
        "correctAnswer": "Áo khoác",
        "explanation": "Đáp án đúng là: Áo khoác."
      },
      {
        "question": "Green nghĩa là:",
        "options": "[\"Màu xanh lá\", \"Màu đỏ\", \"Màu vàng\", \"Màu tím\"]",
        "correctAnswer": "Màu xanh lá",
        "explanation": "Đáp án đúng là: Màu xanh lá."
      },
      {
        "question": "Blue nghĩa là:",
        "options": "[\"Màu xanh dương\", \"Màu cam\", \"Màu đen\", \"Màu nâu\"]",
        "correctAnswer": "Màu xanh dương",
        "explanation": "Đáp án đúng là: Màu xanh dương."
      },
      {
        "question": "Pants nghĩa là:",
        "options": "[\"Quần dài\", \"Áo sơ mi\", \"Đôi giày\", \"Váy\"]",
        "correctAnswer": "Quần dài",
        "explanation": "Đáp án đúng là: Quần dài."
      }
    ]
  },
  {
    "orderNumber": 7,
    "title": "Jobs & Occupations",
    "description": "Nắm vững các từ vựng nghề nghiệp phổ biến, nơi làm việc và cách hỏi công việc của người khác.",
    "level": "A1",
    "category": "Jobs",
    "durationMinutes": 20,
    "vocabularies": [
      {
        "word": "Engineer",
        "meaning": "Kỹ sư",
        "pronunciation": "/ˌendʒɪˈnɪr/",
        "partOfSpeech": "noun",
        "example": "He is a software engineer.",
        "exampleMeaning": "Ví dụ về kỹ sư.",
        "category": "Jobs"
      },
      {
        "word": "Chef",
        "meaning": "Đầu bếp",
        "pronunciation": "/ʃef/",
        "partOfSpeech": "noun",
        "example": "The chef cooks great food.",
        "exampleMeaning": "Ví dụ về đầu bếp.",
        "category": "Jobs"
      },
      {
        "word": "Nurse",
        "meaning": "Y tá, điều dưỡng",
        "pronunciation": "/nɜːrs/",
        "partOfSpeech": "noun",
        "example": "The nurse helps the sick.",
        "exampleMeaning": "Ví dụ về y tá, điều dưỡng.",
        "category": "Jobs"
      },
      {
        "word": "Police",
        "meaning": "Cảnh sát",
        "pronunciation": "/pəˈliːs/",
        "partOfSpeech": "noun",
        "example": "Call the police officer.",
        "exampleMeaning": "Ví dụ về cảnh sát.",
        "category": "Jobs"
      },
      {
        "word": "Driver",
        "meaning": "Tài xế, người lái xe",
        "pronunciation": "/ˈdraɪvər/",
        "partOfSpeech": "noun",
        "example": "A friendly taxi driver.",
        "exampleMeaning": "Ví dụ về tài xế, người lái xe.",
        "category": "Jobs"
      },
      {
        "word": "Worker",
        "meaning": "Công nhân",
        "pronunciation": "/ˈwɜːrkər/",
        "partOfSpeech": "noun",
        "example": "Hard-working factory workers.",
        "exampleMeaning": "Ví dụ về công nhân.",
        "category": "Jobs"
      },
      {
        "word": "Artist",
        "meaning": "Họa sĩ, nghệ sĩ",
        "pronunciation": "/ˈɑːrtɪst/",
        "partOfSpeech": "noun",
        "example": "She is an oil painting artist.",
        "exampleMeaning": "Ví dụ về họa sĩ, nghệ sĩ.",
        "category": "Jobs"
      },
      {
        "word": "Manager",
        "meaning": "Người quản lý",
        "pronunciation": "/ˈmænɪdʒər/",
        "partOfSpeech": "noun",
        "example": "Speak with the hotel manager.",
        "exampleMeaning": "Ví dụ về người quản lý.",
        "category": "Jobs"
      },
      {
        "word": "Lawyer",
        "meaning": "Luật sư",
        "pronunciation": "/ˈlɔːjər/",
        "partOfSpeech": "noun",
        "example": "Ask advice from a lawyer.",
        "exampleMeaning": "Ví dụ về luật sư.",
        "category": "Jobs"
      },
      {
        "word": "Pilot",
        "meaning": "Phi công",
        "pronunciation": "/ˈpaɪlət/",
        "partOfSpeech": "noun",
        "example": "The pilot flies an airplane.",
        "exampleMeaning": "Ví dụ về phi công.",
        "category": "Jobs"
      },
      {
        "word": "Office",
        "meaning": "Văn phòng làm việc",
        "pronunciation": "/ˈɔːfɪs/",
        "partOfSpeech": "noun",
        "example": "I work in an office.",
        "exampleMeaning": "Ví dụ về văn phòng làm việc.",
        "category": "Jobs"
      },
      {
        "word": "Hospital",
        "meaning": "Bệnh viện",
        "pronunciation": "/ˈhɑːspɪtl/",
        "partOfSpeech": "noun",
        "example": "Doctors work at a hospital.",
        "exampleMeaning": "Ví dụ về bệnh viện.",
        "category": "Jobs"
      },
      {
        "word": "School",
        "meaning": "Trường học",
        "pronunciation": "/skuːl/",
        "partOfSpeech": "noun",
        "example": "Teachers work in a school.",
        "exampleMeaning": "Ví dụ về trường học.",
        "category": "Jobs"
      },
      {
        "word": "Company",
        "meaning": "Công ty",
        "pronunciation": "/ˈkʌmpəni/",
        "partOfSpeech": "noun",
        "example": "A global tech company.",
        "exampleMeaning": "Ví dụ về công ty.",
        "category": "Jobs"
      },
      {
        "word": "Factory",
        "meaning": "Nhà máy, xưởng",
        "pronunciation": "/ˈfæktri/",
        "partOfSpeech": "noun",
        "example": "An automobile factory.",
        "exampleMeaning": "Ví dụ về nhà máy, xưởng.",
        "category": "Jobs"
      },
      {
        "word": "Work",
        "meaning": "Làm việc",
        "pronunciation": "/wɜːrk/",
        "partOfSpeech": "verb",
        "example": "I work five days a week.",
        "exampleMeaning": "Ví dụ về làm việc.",
        "category": "Jobs"
      },
      {
        "word": "Job",
        "meaning": "Nghề nghiệp, công việc",
        "pronunciation": "/dʒɑːb/",
        "partOfSpeech": "noun",
        "example": "Find a good job.",
        "exampleMeaning": "Ví dụ về nghề nghiệp, công việc.",
        "category": "Jobs"
      },
      {
        "word": "Salary",
        "meaning": "Tiền lương",
        "pronunciation": "/ˈsæləri/",
        "partOfSpeech": "noun",
        "example": "A monthly salary.",
        "exampleMeaning": "Ví dụ về tiền lương.",
        "category": "Jobs"
      },
      {
        "word": "Career",
        "meaning": "Sự nghiệp",
        "pronunciation": "/kəˈrɪr/",
        "partOfSpeech": "noun",
        "example": "Build a successful career.",
        "exampleMeaning": "Ví dụ về sự nghiệp.",
        "category": "Jobs"
      },
      {
        "word": "Colleague",
        "meaning": "Đồng nghiệp",
        "pronunciation": "/ˈkɑːliːɡ/",
        "partOfSpeech": "noun",
        "example": "Friendly office colleagues.",
        "exampleMeaning": "Ví dụ về đồng nghiệp.",
        "category": "Jobs"
      }
    ],
    "grammarPoints": [
      {
        "title": "Ngữ pháp trọng tâm: Jobs & Occupations",
        "explanation": "Các quy tắc ngữ pháp thông dụng cần ghi nhớ khi nói về Jobs & Occupations.",
        "formula": "S + V + O",
        "examples": "[{\"en\": \"Example sentence for Jobs & Occupations.\", \"vi\": \"Câu ví dụ thực tế.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Luyện nghe chủ đề Jobs & Occupations",
        "transcript": "Hello, welcome to our lesson on Jobs & Occupations. We learn important words and communication phrases today.",
        "questions": "[{\"question\": \"Chủ đề nghe hôm nay là gì?\", \"options\": [\"Jobs & Occupations\", \"Khác\", \"Không rõ\", \"Bỏ qua\"], \"correctAnswer\": \"Jobs & Occupations\", \"explanation\": \"Chủ đề nghe: Jobs & Occupations.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Hội thoại giao tiếp Jobs & Occupations",
        "context": "Tình huống trò chuyện về Jobs & Occupations.",
        "dialogue": "[{\"speaker\": \"A\", \"text\": \"Let's talk about Jobs & Occupations.\", \"meaning\": \"Hãy nói về Jobs & Occupations nhé.\"}, {\"speaker\": \"B\", \"text\": \"That sounds great, I'd love to!\", \"meaning\": \"Tuyệt vời, mình rất sẵn lòng!\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Từ vựng tiêu biểu của chủ đề Jobs & Occupations là:",
        "options": "[\"Engineer\", \"Unrelated1\", \"Unrelated2\", \"Unrelated3\"]",
        "correctAnswer": "Engineer",
        "explanation": "Engineer thuộc chủ đề Jobs & Occupations."
      }
    ],
    "quizzes": [
      {
        "question": "Engineer nghĩa là:",
        "options": "[\"Kỹ sư\", \"Bác sĩ\", \"Y tá\", \"Công nhân\"]",
        "correctAnswer": "Kỹ sư",
        "explanation": "Đáp án đúng là: Kỹ sư."
      },
      {
        "question": "Đầu bếp là:",
        "options": "[\"Chef\", \"Driver\", \"Nurse\", \"Teacher\"]",
        "correctAnswer": "Chef",
        "explanation": "Đáp án đúng là: Chef."
      },
      {
        "question": "Hospital nghĩa là:",
        "options": "[\"Bệnh viện\", \"Trường học\", \"Văn phòng\", \"Khách sạn\"]",
        "correctAnswer": "Bệnh viện",
        "explanation": "Đáp án đúng là: Bệnh viện."
      },
      {
        "question": "I am ___ artist.",
        "options": "[\"an\", \"a\", \"the\", \"one\"]",
        "correctAnswer": "an",
        "explanation": "Đáp án đúng là: an."
      },
      {
        "question": "Câu hỏi nghề nghiệp đúng:",
        "options": "[\"What do you do?\", \"What are you do?\", \"Where do you do?\", \"Who do you do?\"]",
        "correctAnswer": "What do you do?",
        "explanation": "Đáp án đúng là: What do you do?."
      },
      {
        "question": "Pilot là:",
        "options": "[\"Phi công\", \"Tài xế\", \"Kỹ sư\", \"Luật sư\"]",
        "correctAnswer": "Phi công",
        "explanation": "Đáp án đúng là: Phi công."
      },
      {
        "question": "Lawyer nghĩa là:",
        "options": "[\"Luật sư\", \"Bác sĩ\", \"Thầy giáo\", \"Y tá\"]",
        "correctAnswer": "Luật sư",
        "explanation": "Đáp án đúng là: Luật sư."
      },
      {
        "question": "Manager là:",
        "options": "[\"Người quản lý\", \"Công nhân\", \"Học sinh\", \"Khách hàng\"]",
        "correctAnswer": "Người quản lý",
        "explanation": "Đáp án đúng là: Người quản lý."
      },
      {
        "question": "Colleague nghĩa là:",
        "options": "[\"Đồng nghiệp\", \"Bạn bè\", \"Bố mẹ\", \"Khách hàng\"]",
        "correctAnswer": "Đồng nghiệp",
        "explanation": "Đáp án đúng là: Đồng nghiệp."
      },
      {
        "question": "Nơi làm việc của bác sĩ:",
        "options": "[\"Hospital\", \"School\", \"Kitchen\", \"Airport\"]",
        "correctAnswer": "Hospital",
        "explanation": "Đáp án đúng là: Hospital."
      }
    ]
  },
  {
    "orderNumber": 8,
    "title": "Home & Furniture",
    "description": "Gọi tên các phòng trong căn nhà, các đồ đạc nội thất và cách sử dụng cấu trúc There is / There are.",
    "level": "A1",
    "category": "Home",
    "durationMinutes": 20,
    "vocabularies": [
      {
        "word": "House",
        "meaning": "Ngôi nhà",
        "pronunciation": "/haʊs/",
        "partOfSpeech": "noun",
        "example": "They live in a big house.",
        "exampleMeaning": "Ví dụ về ngôi nhà.",
        "category": "Home"
      },
      {
        "word": "Home",
        "meaning": "Tổ ấm, nhà",
        "pronunciation": "/hoʊm/",
        "partOfSpeech": "noun",
        "example": "Welcome home!",
        "exampleMeaning": "Ví dụ về tổ ấm, nhà.",
        "category": "Home"
      },
      {
        "word": "Living room",
        "meaning": "Phòng khách",
        "pronunciation": "/ˈlɪvɪŋ ruːm/",
        "partOfSpeech": "noun",
        "example": "We watch TV in the living room.",
        "exampleMeaning": "Ví dụ về phòng khách.",
        "category": "Home"
      },
      {
        "word": "Bedroom",
        "meaning": "Phòng ngủ",
        "pronunciation": "/ˈbedruːm/",
        "partOfSpeech": "noun",
        "example": "My bedroom has a big bed.",
        "exampleMeaning": "Ví dụ về phòng ngủ.",
        "category": "Home"
      },
      {
        "word": "Kitchen",
        "meaning": "Nhà bếp",
        "pronunciation": "/ˈkɪtʃɪn/",
        "partOfSpeech": "noun",
        "example": "Cooking in the clean kitchen.",
        "exampleMeaning": "Ví dụ về nhà bếp.",
        "category": "Home"
      },
      {
        "word": "Bathroom",
        "meaning": "Phòng tắm",
        "pronunciation": "/ˈbæθruːm/",
        "partOfSpeech": "noun",
        "example": "Wash hands in the bathroom.",
        "exampleMeaning": "Ví dụ về phòng tắm.",
        "category": "Home"
      },
      {
        "word": "Garden",
        "meaning": "Khu vườn",
        "pronunciation": "/ˈɡɑːrdn/",
        "partOfSpeech": "noun",
        "example": "Flowers in the garden.",
        "exampleMeaning": "Ví dụ về khu vườn.",
        "category": "Home"
      },
      {
        "word": "Balcony",
        "meaning": "Ban công",
        "pronunciation": "/ˈbælkəni/",
        "partOfSpeech": "noun",
        "example": "Stand on the balcony.",
        "exampleMeaning": "Ví dụ về ban công.",
        "category": "Home"
      },
      {
        "word": "Table",
        "meaning": "Cái bàn",
        "pronunciation": "/ˈteɪbl/",
        "partOfSpeech": "noun",
        "example": "Books are on the table.",
        "exampleMeaning": "Ví dụ về cái bàn.",
        "category": "Home"
      },
      {
        "word": "Chair",
        "meaning": "Cái ghế",
        "pronunciation": "/tʃer/",
        "partOfSpeech": "noun",
        "example": "Sit on this wooden chair.",
        "exampleMeaning": "Ví dụ về cái ghế.",
        "category": "Home"
      },
      {
        "word": "Bed",
        "meaning": "Chiếc giường",
        "pronunciation": "/bed/",
        "partOfSpeech": "noun",
        "example": "Time to go to bed.",
        "exampleMeaning": "Ví dụ về chiếc giường.",
        "category": "Home"
      },
      {
        "word": "Door",
        "meaning": "Cửa ra vào",
        "pronunciation": "/dɔːr/",
        "partOfSpeech": "noun",
        "example": "Please close the front door.",
        "exampleMeaning": "Ví dụ về cửa ra vào.",
        "category": "Home"
      },
      {
        "word": "Window",
        "meaning": "Cửa sổ",
        "pronunciation": "/ˈwɪndoʊ/",
        "partOfSpeech": "noun",
        "example": "Open the window for fresh air.",
        "exampleMeaning": "Ví dụ về cửa sổ.",
        "category": "Home"
      },
      {
        "word": "Sofa",
        "meaning": "Ghế sofa",
        "pronunciation": "/ˈsoʊfə/",
        "partOfSpeech": "noun",
        "example": "Rest on the soft sofa.",
        "exampleMeaning": "Ví dụ về ghế sofa.",
        "category": "Home"
      },
      {
        "word": "Desk",
        "meaning": "Bàn làm việc/học",
        "pronunciation": "/desk/",
        "partOfSpeech": "noun",
        "example": "A study desk with lamp.",
        "exampleMeaning": "Ví dụ về bàn làm việc/học.",
        "category": "Home"
      },
      {
        "word": "Lamp",
        "meaning": "Đèn bàn",
        "pronunciation": "/læmp/",
        "partOfSpeech": "noun",
        "example": "Turn on the reading lamp.",
        "exampleMeaning": "Ví dụ về đèn bàn.",
        "category": "Home"
      },
      {
        "word": "Mirror",
        "meaning": "Gương soi",
        "pronunciation": "/ˈmɪrər/",
        "partOfSpeech": "noun",
        "example": "Look into the mirror.",
        "exampleMeaning": "Ví dụ về gương soi.",
        "category": "Home"
      },
      {
        "word": "Floor",
        "meaning": "Sàn nhà, tầng",
        "pronunciation": "/flɔːr/",
        "partOfSpeech": "noun",
        "example": "Clean the wooden floor.",
        "exampleMeaning": "Ví dụ về sàn nhà, tầng.",
        "category": "Home"
      },
      {
        "word": "Wall",
        "meaning": "Bức tường",
        "pronunciation": "/wɔːl/",
        "partOfSpeech": "noun",
        "example": "Paint the wall white.",
        "exampleMeaning": "Ví dụ về bức tường.",
        "category": "Home"
      },
      {
        "word": "Roof",
        "meaning": "Mái nhà",
        "pronunciation": "/ruːf/",
        "partOfSpeech": "noun",
        "example": "Rain on the roof.",
        "exampleMeaning": "Ví dụ về mái nhà.",
        "category": "Home"
      }
    ],
    "grammarPoints": [
      {
        "title": "Ngữ pháp trọng tâm: Home & Furniture",
        "explanation": "Các quy tắc ngữ pháp thông dụng cần ghi nhớ khi nói về Home & Furniture.",
        "formula": "S + V + O",
        "examples": "[{\"en\": \"Example sentence for Home & Furniture.\", \"vi\": \"Câu ví dụ thực tế.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Luyện nghe chủ đề Home & Furniture",
        "transcript": "Hello, welcome to our lesson on Home & Furniture. We learn important words and communication phrases today.",
        "questions": "[{\"question\": \"Chủ đề nghe hôm nay là gì?\", \"options\": [\"Home & Furniture\", \"Khác\", \"Không rõ\", \"Bỏ qua\"], \"correctAnswer\": \"Home & Furniture\", \"explanation\": \"Chủ đề nghe: Home & Furniture.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Hội thoại giao tiếp Home & Furniture",
        "context": "Tình huống trò chuyện về Home & Furniture.",
        "dialogue": "[{\"speaker\": \"A\", \"text\": \"Let's talk about Home & Furniture.\", \"meaning\": \"Hãy nói về Home & Furniture nhé.\"}, {\"speaker\": \"B\", \"text\": \"That sounds great, I'd love to!\", \"meaning\": \"Tuyệt vời, mình rất sẵn lòng!\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Từ vựng tiêu biểu của chủ đề Home & Furniture là:",
        "options": "[\"House\", \"Unrelated1\", \"Unrelated2\", \"Unrelated3\"]",
        "correctAnswer": "House",
        "explanation": "House thuộc chủ đề Home & Furniture."
      }
    ],
    "quizzes": [
      {
        "question": "Kitchen nghĩa là:",
        "options": "[\"Nhà bếp\", \"Phòng khách\", \"Phòng ngủ\", \"Phòng tắm\"]",
        "correctAnswer": "Nhà bếp",
        "explanation": "Đáp án đúng là: Nhà bếp."
      },
      {
        "question": "There ___ a book on the table.",
        "options": "[\"is\", \"are\", \"am\", \"be\"]",
        "correctAnswer": "is",
        "explanation": "Đáp án đúng là: is."
      },
      {
        "question": "Cái ghế là:",
        "options": "[\"Chair\", \"Table\", \"Bed\", \"Door\"]",
        "correctAnswer": "Chair",
        "explanation": "Đáp án đúng là: Chair."
      },
      {
        "question": "Bedroom là phòng gì?",
        "options": "[\"Phòng ngủ\", \"Phòng khách\", \"Nhà bếp\", \"Sân vườn\"]",
        "correctAnswer": "Phòng ngủ",
        "explanation": "Đáp án đúng là: Phòng ngủ."
      },
      {
        "question": "Window nghĩa là:",
        "options": "[\"Cửa sổ\", \"Cửa chính\", \"Bức tường\", \"Mái nhà\"]",
        "correctAnswer": "Cửa sổ",
        "explanation": "Đáp án đúng là: Cửa sổ."
      },
      {
        "question": "Sofa là:",
        "options": "[\"Ghế bành, sofa\", \"Bàn ăn\", \"Chiếc giường\", \"Tủ quần áo\"]",
        "correctAnswer": "Ghế bành, sofa",
        "explanation": "Đáp án đúng là: Ghế bành, sofa."
      },
      {
        "question": "Garden nghĩa là:",
        "options": "[\"Khu vườn\", \"Nhà bếp\", \"Ban công\", \"Phòng tắm\"]",
        "correctAnswer": "Khu vườn",
        "explanation": "Đáp án đúng là: Khu vườn."
      },
      {
        "question": "Bathroom nghĩa là:",
        "options": "[\"Phòng tắm\", \"Phòng ngủ\", \"Phòng khách\", \"Nhà để xe\"]",
        "correctAnswer": "Phòng tắm",
        "explanation": "Đáp án đúng là: Phòng tắm."
      },
      {
        "question": "There ___ three chairs.",
        "options": "[\"are\", \"is\", \"am\", \"be\"]",
        "correctAnswer": "are",
        "explanation": "Đáp án đúng là: are."
      },
      {
        "question": "Desk nghĩa là:",
        "options": "[\"Bàn làm việc\", \"Cái ghế\", \"Cái giường\", \"Cái gương\"]",
        "correctAnswer": "Bàn làm việc",
        "explanation": "Đáp án đúng là: Bàn làm việc."
      }
    ]
  },
  {
    "orderNumber": 9,
    "title": "Daily Activities & Routines",
    "description": "Nói về các thói quen sinh hoạt mỗi ngày, lịch trình từ sáng đến tối và thì hiện tại đơn.",
    "level": "A1",
    "category": "Daily Life",
    "durationMinutes": 20,
    "vocabularies": [
      {
        "word": "Wake up",
        "meaning": "Thức dậy",
        "pronunciation": "/weɪk ʌp/",
        "partOfSpeech": "phrase",
        "example": "I wake up at 6 AM every day.",
        "exampleMeaning": "Ví dụ về thức dậy.",
        "category": "Daily Life"
      },
      {
        "word": "Get up",
        "meaning": "Rời khỏi giường",
        "pronunciation": "/ɡet ʌp/",
        "partOfSpeech": "phrase",
        "example": "Get up immediately.",
        "exampleMeaning": "Ví dụ về rời khỏi giường.",
        "category": "Daily Life"
      },
      {
        "word": "Brush",
        "meaning": "Đánh, chải",
        "pronunciation": "/brʌʃ/",
        "partOfSpeech": "verb",
        "example": "Brush your teeth in the morning.",
        "exampleMeaning": "Ví dụ về đánh, chải.",
        "category": "Daily Life"
      },
      {
        "word": "Wash",
        "meaning": "Rửa mặt, giặt",
        "pronunciation": "/wɑːʃ/",
        "partOfSpeech": "verb",
        "example": "Wash face with cold water.",
        "exampleMeaning": "Ví dụ về rửa mặt, giặt.",
        "category": "Daily Life"
      },
      {
        "word": "Breakfast",
        "meaning": "Bữa ăn sáng",
        "pronunciation": "/ˈbrekfəst/",
        "partOfSpeech": "noun",
        "example": "Eat a healthy breakfast.",
        "exampleMeaning": "Ví dụ về bữa ăn sáng.",
        "category": "Daily Life"
      },
      {
        "word": "Lunch",
        "meaning": "Bữa ăn trưa",
        "pronunciation": "/lʌntʃ/",
        "partOfSpeech": "noun",
        "example": "We have lunch at noon.",
        "exampleMeaning": "Ví dụ về bữa ăn trưa.",
        "category": "Daily Life"
      },
      {
        "word": "Dinner",
        "meaning": "Bữa ăn tối",
        "pronunciation": "/ˈdɪnər/",
        "partOfSpeech": "noun",
        "example": "Family dinner at 7 PM.",
        "exampleMeaning": "Ví dụ về bữa ăn tối.",
        "category": "Daily Life"
      },
      {
        "word": "Exercise",
        "meaning": "Tập thể dục",
        "pronunciation": "/ˈeksərsaɪz/",
        "partOfSpeech": "verb",
        "example": "I exercise thirty minutes daily.",
        "exampleMeaning": "Ví dụ về tập thể dục.",
        "category": "Daily Life"
      },
      {
        "word": "Read",
        "meaning": "Đọc sách",
        "pronunciation": "/riːd/",
        "partOfSpeech": "verb",
        "example": "Read books before going to sleep.",
        "exampleMeaning": "Ví dụ về đọc sách.",
        "category": "Daily Life"
      },
      {
        "word": "Sleep",
        "meaning": "Ngủ",
        "pronunciation": "/sliːp/",
        "partOfSpeech": "verb",
        "example": "Sleep early to stay fresh.",
        "exampleMeaning": "Ví dụ về ngủ.",
        "category": "Daily Life"
      },
      {
        "word": "Shower",
        "meaning": "Tắm vòi sen",
        "pronunciation": "/ˈʃaʊər/",
        "partOfSpeech": "noun",
        "example": "Take a cold shower.",
        "exampleMeaning": "Ví dụ về tắm vòi sen.",
        "category": "Daily Life"
      },
      {
        "word": "Relax",
        "meaning": "Thư giãn",
        "pronunciation": "/rɪˈlæks/",
        "partOfSpeech": "verb",
        "example": "Listen to music to relax.",
        "exampleMeaning": "Ví dụ về thư giãn.",
        "category": "Daily Life"
      },
      {
        "word": "Study",
        "meaning": "Học tập",
        "pronunciation": "/ˈstʌdi/",
        "partOfSpeech": "verb",
        "example": "Study English every evening.",
        "exampleMeaning": "Ví dụ về học tập.",
        "category": "Daily Life"
      },
      {
        "word": "Cook",
        "meaning": "Nấu ăn",
        "pronunciation": "/kʊk/",
        "partOfSpeech": "verb",
        "example": "Cook dinner for family.",
        "exampleMeaning": "Ví dụ về nấu ăn.",
        "category": "Daily Life"
      },
      {
        "word": "Clean",
        "meaning": "Dọn dẹp",
        "pronunciation": "/kliːn/",
        "partOfSpeech": "verb",
        "example": "Clean the room weekly.",
        "exampleMeaning": "Ví dụ về dọn dẹp.",
        "category": "Daily Life"
      },
      {
        "word": "Walk",
        "meaning": "Đi bộ",
        "pronunciation": "/wɔːk/",
        "partOfSpeech": "verb",
        "example": "Walk to the local park.",
        "exampleMeaning": "Ví dụ về đi bộ.",
        "category": "Daily Life"
      },
      {
        "word": "Watch",
        "meaning": "Xem tivi, quan sát",
        "pronunciation": "/wɑːtʃ/",
        "partOfSpeech": "verb",
        "example": "Watch the news.",
        "exampleMeaning": "Ví dụ về xem tivi, quan sát.",
        "category": "Daily Life"
      },
      {
        "word": "Listen",
        "meaning": "Lắng nghe",
        "pronunciation": "/ˈlɪsn/",
        "partOfSpeech": "verb",
        "example": "Listen to podcasts.",
        "exampleMeaning": "Ví dụ về lắng nghe.",
        "category": "Daily Life"
      },
      {
        "word": "Rest",
        "meaning": "Nghỉ ngơi",
        "pronunciation": "/rest/",
        "partOfSpeech": "verb",
        "example": "Rest for ten minutes.",
        "exampleMeaning": "Ví dụ về nghỉ ngơi.",
        "category": "Daily Life"
      },
      {
        "word": "Work",
        "meaning": "Làm việc",
        "pronunciation": "/wɜːrk/",
        "partOfSpeech": "verb",
        "example": "Work from 8 to 5.",
        "exampleMeaning": "Ví dụ về làm việc.",
        "category": "Daily Life"
      }
    ],
    "grammarPoints": [
      {
        "title": "Ngữ pháp trọng tâm: Daily Activities & Routines",
        "explanation": "Các quy tắc ngữ pháp thông dụng cần ghi nhớ khi nói về Daily Activities & Routines.",
        "formula": "S + V + O",
        "examples": "[{\"en\": \"Example sentence for Daily Activities & Routines.\", \"vi\": \"Câu ví dụ thực tế.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Luyện nghe chủ đề Daily Activities & Routines",
        "transcript": "Hello, welcome to our lesson on Daily Activities & Routines. We learn important words and communication phrases today.",
        "questions": "[{\"question\": \"Chủ đề nghe hôm nay là gì?\", \"options\": [\"Daily Activities & Routines\", \"Khác\", \"Không rõ\", \"Bỏ qua\"], \"correctAnswer\": \"Daily Activities & Routines\", \"explanation\": \"Chủ đề nghe: Daily Activities & Routines.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Hội thoại giao tiếp Daily Activities & Routines",
        "context": "Tình huống trò chuyện về Daily Activities & Routines.",
        "dialogue": "[{\"speaker\": \"A\", \"text\": \"Let's talk about Daily Activities & Routines.\", \"meaning\": \"Hãy nói về Daily Activities & Routines nhé.\"}, {\"speaker\": \"B\", \"text\": \"That sounds great, I'd love to!\", \"meaning\": \"Tuyệt vời, mình rất sẵn lòng!\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Từ vựng tiêu biểu của chủ đề Daily Activities & Routines là:",
        "options": "[\"Wake up\", \"Unrelated1\", \"Unrelated2\", \"Unrelated3\"]",
        "correctAnswer": "Wake up",
        "explanation": "Wake up thuộc chủ đề Daily Activities & Routines."
      }
    ],
    "quizzes": [
      {
        "question": "Breakfast là bữa ăn nào?",
        "options": "[\"Bữa sáng\", \"Bữa trưa\", \"Bữa tối\", \"Bữa đêm\"]",
        "correctAnswer": "Bữa sáng",
        "explanation": "Đáp án đúng là: Bữa sáng."
      },
      {
        "question": "He ___ to work by bus.",
        "options": "[\"go\", \"goes\", \"going\", \"gone\"]",
        "correctAnswer": "goes",
        "explanation": "Đáp án đúng là: goes."
      },
      {
        "question": "Dinner là bữa ăn nào?",
        "options": "[\"Bữa tối\", \"Bữa sáng\", \"Bữa trưa\", \"Bữa xế\"]",
        "correctAnswer": "Bữa tối",
        "explanation": "Đáp án đúng là: Bữa tối."
      },
      {
        "question": "Exercise nghĩa là:",
        "options": "[\"Tập thể dục\", \"Ăn cơm\", \"Đi ngủ\", \"Đọc sách\"]",
        "correctAnswer": "Tập thể dục",
        "explanation": "Đáp án đúng là: Tập thể dục."
      },
      {
        "question": "Wake up có nghĩa là:",
        "options": "[\"Thức dậy\", \"Đi ngủ\", \"Ăn uống\", \"Tắm rửa\"]",
        "correctAnswer": "Thức dậy",
        "explanation": "Đáp án đúng là: Thức dậy."
      },
      {
        "question": "She ___ teeth twice a day.",
        "options": "[\"brushes\", \"brush\", \"brushing\", \"brushed\"]",
        "correctAnswer": "brushes",
        "explanation": "Đáp án đúng là: brushes."
      },
      {
        "question": "Lunch là bữa:",
        "options": "[\"Bữa trưa\", \"Bữa sáng\", \"Bữa tối\", \"Bữa sáng muộn\"]",
        "correctAnswer": "Bữa trưa",
        "explanation": "Đáp án đúng là: Bữa trưa."
      },
      {
        "question": "Cook nghĩa là:",
        "options": "[\"Nấu ăn\", \"Dọn dẹp\", \"Rửa chén\", \"Đi chợ\"]",
        "correctAnswer": "Nấu ăn",
        "explanation": "Đáp án đúng là: Nấu ăn."
      },
      {
        "question": "Shower là:",
        "options": "[\"Tắm vòi sen\", \"Đánh răng\", \"Rửa mặt\", \"Rửa tay\"]",
        "correctAnswer": "Tắm vòi sen",
        "explanation": "Đáp án đúng là: Tắm vòi sen."
      },
      {
        "question": "Read a book là:",
        "options": "[\"Đọc một quyển sách\", \"Viết một quyển sách\", \"Mua sách\", \"Bán sách\"]",
        "correctAnswer": "Đọc một quyển sách",
        "explanation": "Đáp án đúng là: Đọc một quyển sách."
      }
    ]
  },
  {
    "orderNumber": 10,
    "title": "Shopping & Prices",
    "description": "Cách hỏi giá cả, mặc cả lịch sự, thanh toán tiền mặt/thẻ và từ vựng mua sắm thiết yếu.",
    "level": "A1",
    "category": "Shopping",
    "durationMinutes": 20,
    "vocabularies": [
      {
        "word": "Buy",
        "meaning": "Mua",
        "pronunciation": "/baɪ/",
        "partOfSpeech": "verb",
        "example": "I want to buy some fruits.",
        "exampleMeaning": "Ví dụ về mua.",
        "category": "Shopping"
      },
      {
        "word": "Sell",
        "meaning": "Bán",
        "pronunciation": "/sel/",
        "partOfSpeech": "verb",
        "example": "They sell fresh bread.",
        "exampleMeaning": "Ví dụ về bán.",
        "category": "Shopping"
      },
      {
        "word": "Price",
        "meaning": "Giá tiền",
        "pronunciation": "/praɪs/",
        "partOfSpeech": "noun",
        "example": "What is the price of this?",
        "exampleMeaning": "Ví dụ về giá tiền.",
        "category": "Shopping"
      },
      {
        "word": "Cost",
        "meaning": "Trị giá, chi phí",
        "pronunciation": "/kɔːst/",
        "partOfSpeech": "noun",
        "example": "How much does it cost?",
        "exampleMeaning": "Ví dụ về trị giá, chi phí.",
        "category": "Shopping"
      },
      {
        "word": "Cheap",
        "meaning": "Rẻ tiền",
        "pronunciation": "/tʃiːp/",
        "partOfSpeech": "adjective",
        "example": "This shirt is very cheap.",
        "exampleMeaning": "Ví dụ về rẻ tiền.",
        "category": "Shopping"
      },
      {
        "word": "Expensive",
        "meaning": "Đắt tiền",
        "pronunciation": "/ɪkˈspensɪv/",
        "partOfSpeech": "adjective",
        "example": "That watch is too expensive.",
        "exampleMeaning": "Ví dụ về đắt tiền.",
        "category": "Shopping"
      },
      {
        "word": "Dollar",
        "meaning": "Đồng đô la",
        "pronunciation": "/ˈdɑːlər/",
        "partOfSpeech": "noun",
        "example": "It costs ten dollars.",
        "exampleMeaning": "Ví dụ về đồng đô la.",
        "category": "Shopping"
      },
      {
        "word": "Cash",
        "meaning": "Tiền mặt",
        "pronunciation": "/kæʃ/",
        "partOfSpeech": "noun",
        "example": "Do you accept cash?",
        "exampleMeaning": "Ví dụ về tiền mặt.",
        "category": "Shopping"
      },
      {
        "word": "Card",
        "meaning": "Thẻ ngân hàng",
        "pronunciation": "/kɑːrd/",
        "partOfSpeech": "noun",
        "example": "I will pay by credit card.",
        "exampleMeaning": "Ví dụ về thẻ ngân hàng.",
        "category": "Shopping"
      },
      {
        "word": "Discount",
        "meaning": "Giảm giá",
        "pronunciation": "/ˈdɪskaʊnt/",
        "partOfSpeech": "noun",
        "example": "Is there any discount today?",
        "exampleMeaning": "Ví dụ về giảm giá.",
        "category": "Shopping"
      },
      {
        "word": "Market",
        "meaning": "Chợ",
        "pronunciation": "/ˈmɑːrkɪt/",
        "partOfSpeech": "noun",
        "example": "Go to the supermarket.",
        "exampleMeaning": "Ví dụ về chợ.",
        "category": "Shopping"
      },
      {
        "word": "Supermarket",
        "meaning": "Siêu thị",
        "pronunciation": "/ˈsuːpərmɑːrkɪt/",
        "partOfSpeech": "noun",
        "example": "Shop at the supermarket.",
        "exampleMeaning": "Ví dụ về siêu thị.",
        "category": "Shopping"
      },
      {
        "word": "Store",
        "meaning": "Cửa hàng",
        "pronunciation": "/stɔːr/",
        "partOfSpeech": "noun",
        "example": "A convenience store.",
        "exampleMeaning": "Ví dụ về cửa hàng.",
        "category": "Shopping"
      },
      {
        "word": "Customer",
        "meaning": "Khách hàng",
        "pronunciation": "/ˈkʌstəmər/",
        "partOfSpeech": "noun",
        "example": "A polite customer.",
        "exampleMeaning": "Ví dụ về khách hàng.",
        "category": "Shopping"
      },
      {
        "word": "Seller",
        "meaning": "Người bán",
        "pronunciation": "/ˈselər/",
        "partOfSpeech": "noun",
        "example": "Ask the shop seller.",
        "exampleMeaning": "Ví dụ về người bán.",
        "category": "Shopping"
      },
      {
        "word": "Receipt",
        "meaning": "Biên nhận, hóa đơn",
        "pronunciation": "/rɪˈsiːt/",
        "partOfSpeech": "noun",
        "example": "Keep your shopping receipt.",
        "exampleMeaning": "Ví dụ về biên nhận, hóa đơn.",
        "category": "Shopping"
      },
      {
        "word": "Pay",
        "meaning": "Thanh toán",
        "pronunciation": "/peɪ/",
        "partOfSpeech": "verb",
        "example": "Pay for the items.",
        "exampleMeaning": "Ví dụ về thanh toán.",
        "category": "Shopping"
      },
      {
        "word": "Choose",
        "meaning": "Lựa chọn",
        "pronunciation": "/tʃuːz/",
        "partOfSpeech": "verb",
        "example": "Choose your favorite item.",
        "exampleMeaning": "Ví dụ về lựa chọn.",
        "category": "Shopping"
      },
      {
        "word": "Change",
        "meaning": "Tiền thừa",
        "pronunciation": "/tʃeɪndʒ/",
        "partOfSpeech": "noun",
        "example": "Here is your change.",
        "exampleMeaning": "Ví dụ về tiền thừa.",
        "category": "Shopping"
      },
      {
        "word": "Sale",
        "meaning": "Đợt giảm giá",
        "pronunciation": "/seɪl/",
        "partOfSpeech": "noun",
        "example": "On sale this weekend.",
        "exampleMeaning": "Ví dụ về đợt giảm giá.",
        "category": "Shopping"
      }
    ],
    "grammarPoints": [
      {
        "title": "Ngữ pháp trọng tâm: Shopping & Prices",
        "explanation": "Các quy tắc ngữ pháp thông dụng cần ghi nhớ khi nói về Shopping & Prices.",
        "formula": "S + V + O",
        "examples": "[{\"en\": \"Example sentence for Shopping & Prices.\", \"vi\": \"Câu ví dụ thực tế.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Luyện nghe chủ đề Shopping & Prices",
        "transcript": "Hello, welcome to our lesson on Shopping & Prices. We learn important words and communication phrases today.",
        "questions": "[{\"question\": \"Chủ đề nghe hôm nay là gì?\", \"options\": [\"Shopping & Prices\", \"Khác\", \"Không rõ\", \"Bỏ qua\"], \"correctAnswer\": \"Shopping & Prices\", \"explanation\": \"Chủ đề nghe: Shopping & Prices.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Hội thoại giao tiếp Shopping & Prices",
        "context": "Tình huống trò chuyện về Shopping & Prices.",
        "dialogue": "[{\"speaker\": \"A\", \"text\": \"Let's talk about Shopping & Prices.\", \"meaning\": \"Hãy nói về Shopping & Prices nhé.\"}, {\"speaker\": \"B\", \"text\": \"That sounds great, I'd love to!\", \"meaning\": \"Tuyệt vời, mình rất sẵn lòng!\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Từ vựng tiêu biểu của chủ đề Shopping & Prices là:",
        "options": "[\"Buy\", \"Unrelated1\", \"Unrelated2\", \"Unrelated3\"]",
        "correctAnswer": "Buy",
        "explanation": "Buy thuộc chủ đề Shopping & Prices."
      }
    ],
    "quizzes": [
      {
        "question": "Expensive nghĩa là:",
        "options": "[\"Đắt đỏ\", \"Rẻ tiền\", \"Miễn phí\", \"Giảm giá\"]",
        "correctAnswer": "Đắt đỏ",
        "explanation": "Đáp án đúng là: Đắt đỏ."
      },
      {
        "question": "Cheap nghĩa là:",
        "options": "[\"Rẻ tiền\", \"Đắt tiền\", \"Cũ kỹ\", \"Mới toanh\"]",
        "correctAnswer": "Rẻ tiền",
        "explanation": "Đáp án đúng là: Rẻ tiền."
      },
      {
        "question": "Cash là hình thức thanh toán nào?",
        "options": "[\"Tiền mặt\", \"Thẻ tín dụng\", \"Chuyển khoản\", \"Ví điện tử\"]",
        "correctAnswer": "Tiền mặt",
        "explanation": "Đáp án đúng là: Tiền mặt."
      },
      {
        "question": "Discount nghĩa là:",
        "options": "[\"Giảm giá\", \"Tăng giá\", \"Hết hàng\", \"Hóa đơn\"]",
        "correctAnswer": "Giảm giá",
        "explanation": "Đáp án đúng là: Giảm giá."
      },
      {
        "question": "How much is this? nghĩa là:",
        "options": "[\"Cái này bao nhiêu tiền?\", \"Cái này là gì?\", \"Ở đâu có cái này?\", \"Ai mua cái này?\"]",
        "correctAnswer": "Cái này bao nhiêu tiền?",
        "explanation": "Đáp án đúng là: Cái này bao nhiêu tiền?."
      },
      {
        "question": "Receipt là:",
        "options": "[\"Hóa đơn, biên nhận\", \"Tiền mặt\", \"Thẻ ngân hàng\", \"Giỏ hàng\"]",
        "correctAnswer": "Hóa đơn, biên nhận",
        "explanation": "Đáp án đúng là: Hóa đơn, biên nhận."
      },
      {
        "question": "Customer là:",
        "options": "[\"Khách hàng\", \"Người bán\", \"Chủ tiệm\", \"Bảo vệ\"]",
        "correctAnswer": "Khách hàng",
        "explanation": "Đáp án đúng là: Khách hàng."
      },
      {
        "question": "Supermarket là:",
        "options": "[\"Siêu thị\", \"Hiệu sách\", \"Quán ăn\", \"Bệnh viện\"]",
        "correctAnswer": "Siêu thị",
        "explanation": "Đáp án đúng là: Siêu thị."
      },
      {
        "question": "Buy nghĩa là:",
        "options": "[\"Mua\", \"Bán\", \"Thuê\", \"Tặng\"]",
        "correctAnswer": "Mua",
        "explanation": "Đáp án đúng là: Mua."
      },
      {
        "question": "Pay by card là:",
        "options": "[\"Thanh toán bằng thẻ\", \"Thanh toán tiền mặt\", \"Nợ tiền\", \"Chuyển khoản\"]",
        "correctAnswer": "Thanh toán bằng thẻ",
        "explanation": "Đáp án đúng là: Thanh toán bằng thẻ."
      }
    ]
  },
  {
    "orderNumber": 11,
    "title": "Weather & Seasons",
    "description": "Từ vựng miêu tả các kiểu thời tiết, bốn mùa trong năm và cách hỏi thăm thời tiết hàng ngày.",
    "level": "A1",
    "category": "Nature & Weather",
    "durationMinutes": 20,
    "vocabularies": [
      {
        "word": "Sunny",
        "meaning": "Có nắng, trời nắng",
        "pronunciation": "/ˈsʌni/",
        "partOfSpeech": "adjective",
        "example": "It is a sunny morning.",
        "exampleMeaning": "Ví dụ về có nắng, trời nắng.",
        "category": "Nature & Weather"
      },
      {
        "word": "Rainy",
        "meaning": "Có mưa, trời mưa",
        "pronunciation": "/ˈreɪni/",
        "partOfSpeech": "adjective",
        "example": "Carry an umbrella on rainy days.",
        "exampleMeaning": "Ví dụ về có mưa, trời mưa.",
        "category": "Nature & Weather"
      },
      {
        "word": "Windy",
        "meaning": "Có gió, lộng gió",
        "pronunciation": "/ˈwɪndi/",
        "partOfSpeech": "adjective",
        "example": "It is very windy near the sea.",
        "exampleMeaning": "Ví dụ về có gió, lộng gió.",
        "category": "Nature & Weather"
      },
      {
        "word": "Cloudy",
        "meaning": "Nhiều mây, u ám",
        "pronunciation": "/ˈklaʊdi/",
        "partOfSpeech": "adjective",
        "example": "The sky is dark and cloudy.",
        "exampleMeaning": "Ví dụ về nhiều mây, u ám.",
        "category": "Nature & Weather"
      },
      {
        "word": "Snowy",
        "meaning": "Có tuyết rơi",
        "pronunciation": "/ˈsnoʊi/",
        "partOfSpeech": "adjective",
        "example": "A cold snowy winter evening.",
        "exampleMeaning": "Ví dụ về có tuyết rơi.",
        "category": "Nature & Weather"
      },
      {
        "word": "Foggy",
        "meaning": "Nhiều sương mù",
        "pronunciation": "/ˈfɔːɡi/",
        "partOfSpeech": "adjective",
        "example": "Drive carefully in foggy weather.",
        "exampleMeaning": "Ví dụ về nhiều sương mù.",
        "category": "Nature & Weather"
      },
      {
        "word": "Hot",
        "meaning": "Nóng bức",
        "pronunciation": "/hɑːt/",
        "partOfSpeech": "adjective",
        "example": "Summer days are hot.",
        "exampleMeaning": "Ví dụ về nóng bức.",
        "category": "Nature & Weather"
      },
      {
        "word": "Cold",
        "meaning": "Lạnh giá",
        "pronunciation": "/koʊld/",
        "partOfSpeech": "adjective",
        "example": "It is cold in winter.",
        "exampleMeaning": "Ví dụ về lạnh giá.",
        "category": "Nature & Weather"
      },
      {
        "word": "Warm",
        "meaning": "Ấm áp",
        "pronunciation": "/wɔːrm/",
        "partOfSpeech": "adjective",
        "example": "Warm spring sunlight.",
        "exampleMeaning": "Ví dụ về ấm áp.",
        "category": "Nature & Weather"
      },
      {
        "word": "Cool",
        "meaning": "Mát mẻ",
        "pronunciation": "/kuːl/",
        "partOfSpeech": "adjective",
        "example": "Cool autumn breeze.",
        "exampleMeaning": "Ví dụ về mát mẻ.",
        "category": "Nature & Weather"
      },
      {
        "word": "Weather",
        "meaning": "Thời tiết",
        "pronunciation": "/ˈweðər/",
        "partOfSpeech": "noun",
        "example": "What is the weather like?",
        "exampleMeaning": "Ví dụ về thời tiết.",
        "category": "Nature & Weather"
      },
      {
        "word": "Spring",
        "meaning": "Mùa xuân",
        "pronunciation": "/sprɪŋ/",
        "partOfSpeech": "noun",
        "example": "Flowers bloom in spring.",
        "exampleMeaning": "Ví dụ về mùa xuân.",
        "category": "Nature & Weather"
      },
      {
        "word": "Summer",
        "meaning": "Mùa hè",
        "pronunciation": "/ˈsʌmər/",
        "partOfSpeech": "noun",
        "example": "We go to the beach in summer.",
        "exampleMeaning": "Ví dụ về mùa hè.",
        "category": "Nature & Weather"
      },
      {
        "word": "Autumn",
        "meaning": "Mùa thu",
        "pronunciation": "/ˈɔːtəm/",
        "partOfSpeech": "noun",
        "example": "Cool breeze in autumn.",
        "exampleMeaning": "Ví dụ về mùa thu.",
        "category": "Nature & Weather"
      },
      {
        "word": "Winter",
        "meaning": "Mùa đông",
        "pronunciation": "/ˈwɪntər/",
        "partOfSpeech": "noun",
        "example": "Snow falls in cold winter.",
        "exampleMeaning": "Ví dụ về mùa đông.",
        "category": "Nature & Weather"
      },
      {
        "word": "Rain",
        "meaning": "Cơn mưa",
        "pronunciation": "/reɪn/",
        "partOfSpeech": "noun",
        "example": "Heavy rain outside.",
        "exampleMeaning": "Ví dụ về cơn mưa.",
        "category": "Nature & Weather"
      },
      {
        "word": "Snow",
        "meaning": "Tuyết",
        "pronunciation": "/snoʊ/",
        "partOfSpeech": "noun",
        "example": "White snow on the mountain.",
        "exampleMeaning": "Ví dụ về tuyết.",
        "category": "Nature & Weather"
      },
      {
        "word": "Sun",
        "meaning": "Mặt trời",
        "pronunciation": "/sʌn/",
        "partOfSpeech": "noun",
        "example": "The sun rises in the east.",
        "exampleMeaning": "Ví dụ về mặt trời.",
        "category": "Nature & Weather"
      },
      {
        "word": "Wind",
        "meaning": "Gió",
        "pronunciation": "/wɪnd/",
        "partOfSpeech": "noun",
        "example": "Strong wind today.",
        "exampleMeaning": "Ví dụ về gió.",
        "category": "Nature & Weather"
      },
      {
        "word": "Cloud",
        "meaning": "Đám mây",
        "pronunciation": "/klaʊd/",
        "partOfSpeech": "noun",
        "example": "White clouds in the sky.",
        "exampleMeaning": "Ví dụ về đám mây.",
        "category": "Nature & Weather"
      }
    ],
    "grammarPoints": [
      {
        "title": "Ngữ pháp trọng tâm: Weather & Seasons",
        "explanation": "Các quy tắc ngữ pháp thông dụng cần ghi nhớ khi nói về Weather & Seasons.",
        "formula": "S + V + O",
        "examples": "[{\"en\": \"Example sentence for Weather & Seasons.\", \"vi\": \"Câu ví dụ thực tế.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Luyện nghe chủ đề Weather & Seasons",
        "transcript": "Hello, welcome to our lesson on Weather & Seasons. We learn important words and communication phrases today.",
        "questions": "[{\"question\": \"Chủ đề nghe hôm nay là gì?\", \"options\": [\"Weather & Seasons\", \"Khác\", \"Không rõ\", \"Bỏ qua\"], \"correctAnswer\": \"Weather & Seasons\", \"explanation\": \"Chủ đề nghe: Weather & Seasons.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Hội thoại giao tiếp Weather & Seasons",
        "context": "Tình huống trò chuyện về Weather & Seasons.",
        "dialogue": "[{\"speaker\": \"A\", \"text\": \"Let's talk about Weather & Seasons.\", \"meaning\": \"Hãy nói về Weather & Seasons nhé.\"}, {\"speaker\": \"B\", \"text\": \"That sounds great, I'd love to!\", \"meaning\": \"Tuyệt vời, mình rất sẵn lòng!\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Từ vựng tiêu biểu của chủ đề Weather & Seasons là:",
        "options": "[\"Sunny\", \"Unrelated1\", \"Unrelated2\", \"Unrelated3\"]",
        "correctAnswer": "Sunny",
        "explanation": "Sunny thuộc chủ đề Weather & Seasons."
      }
    ],
    "quizzes": [
      {
        "question": "Sunny nghĩa là:",
        "options": "[\"Có nắng\", \"Có mưa\", \"Có tuyết\", \"Có sương mù\"]",
        "correctAnswer": "Có nắng",
        "explanation": "Đáp án đúng là: Có nắng."
      },
      {
        "question": "Mùa hè là:",
        "options": "[\"Summer\", \"Winter\", \"Spring\", \"Autumn\"]",
        "correctAnswer": "Summer",
        "explanation": "Đáp án đúng là: Summer."
      },
      {
        "question": "Winter là mùa nào?",
        "options": "[\"Mùa đông\", \"Mùa xuân\", \"Mùa hạ\", \"Mùa thu\"]",
        "correctAnswer": "Mùa đông",
        "explanation": "Đáp án đúng là: Mùa đông."
      },
      {
        "question": "Rainy nghĩa là:",
        "options": "[\"Có mưa\", \"Có gió\", \"Trời nóng\", \"Trời lạnh\"]",
        "correctAnswer": "Có mưa",
        "explanation": "Đáp án đúng là: Có mưa."
      },
      {
        "question": "How is the weather today? là:",
        "options": "[\"Hôm nay thời tiết thế nào?\", \"Hôm nay thứ mấy?\", \"Mấy giờ rồi?\", \"Hôm nay ngày bao nhiêu?\"]",
        "correctAnswer": "Hôm nay thời tiết thế nào?",
        "explanation": "Đáp án đúng là: Hôm nay thời tiết thế nào?."
      },
      {
        "question": "Spring là mùa:",
        "options": "[\"Mùa xuân\", \"Mùa hè\", \"Mùa thu\", \"Mùa đông\"]",
        "correctAnswer": "Mùa xuân",
        "explanation": "Đáp án đúng là: Mùa xuân."
      },
      {
        "question": "Autumn là mùa:",
        "options": "[\"Mùa thu\", \"Mùa xuân\", \"Mùa hè\", \"Mùa đông\"]",
        "correctAnswer": "Mùa thu",
        "explanation": "Đáp án đúng là: Mùa thu."
      },
      {
        "question": "Foggy nghĩa là:",
        "options": "[\"Có sương mù\", \"Có nắng\", \"Có mưa\", \"Lộng gió\"]",
        "correctAnswer": "Có sương mù",
        "explanation": "Đáp án đúng là: Có sương mù."
      },
      {
        "question": "Cold nghĩa là:",
        "options": "[\"Lạnh giá\", \"Nóng bức\", \"Ấm áp\", \"Mát mẻ\"]",
        "correctAnswer": "Lạnh giá",
        "explanation": "Đáp án đúng là: Lạnh giá."
      },
      {
        "question": "Hot nghĩa là:",
        "options": "[\"Nóng bức\", \"Lạnh lẽo\", \"Mát mẻ\", \"Dễ chịu\"]",
        "correctAnswer": "Nóng bức",
        "explanation": "Đáp án đúng là: Nóng bức."
      }
    ]
  },
  {
    "orderNumber": 12,
    "title": "Transportation & Directions",
    "description": "Các phương tiện giao thông phổ biến, cách hỏi đường và hướng dẫn chỉ đường rẽ trái, rẽ phải, đi thẳng.",
    "level": "A1",
    "category": "Travel",
    "durationMinutes": 20,
    "vocabularies": [
      {
        "word": "Bus",
        "meaning": "Xe buýt",
        "pronunciation": "/bʌs/",
        "partOfSpeech": "noun",
        "example": "Take the number 9 bus.",
        "exampleMeaning": "Ví dụ về xe buýt.",
        "category": "Travel"
      },
      {
        "word": "Train",
        "meaning": "Tàu hỏa",
        "pronunciation": "/treɪn/",
        "partOfSpeech": "noun",
        "example": "The train leaves at 8 AM.",
        "exampleMeaning": "Ví dụ về tàu hỏa.",
        "category": "Travel"
      },
      {
        "word": "Car",
        "meaning": "Xe hơi, ô tô",
        "pronunciation": "/kɑːr/",
        "partOfSpeech": "noun",
        "example": "He drives a blue car.",
        "exampleMeaning": "Ví dụ về xe hơi, ô tô.",
        "category": "Travel"
      },
      {
        "word": "Bicycle",
        "meaning": "Xe đạp",
        "pronunciation": "/ˈbaɪsɪkl/",
        "partOfSpeech": "noun",
        "example": "Riding a bicycle in the park.",
        "exampleMeaning": "Ví dụ về xe đạp.",
        "category": "Travel"
      },
      {
        "word": "Motorcycle",
        "meaning": "Xe máy",
        "pronunciation": "/ˈmoʊtərsaɪkl/",
        "partOfSpeech": "noun",
        "example": "Ride a motorcycle safely.",
        "exampleMeaning": "Ví dụ về xe máy.",
        "category": "Travel"
      },
      {
        "word": "Airplane",
        "meaning": "Máy bay",
        "pronunciation": "/ˈerpleɪn/",
        "partOfSpeech": "noun",
        "example": "Travel by airplane.",
        "exampleMeaning": "Ví dụ về máy bay.",
        "category": "Travel"
      },
      {
        "word": "Boat",
        "meaning": "Thuyền, ca nô",
        "pronunciation": "/boʊt/",
        "partOfSpeech": "noun",
        "example": "A wooden boat on the lake.",
        "exampleMeaning": "Ví dụ về thuyền, ca nô.",
        "category": "Travel"
      },
      {
        "word": "Taxi",
        "meaning": "Xe tắc-xi",
        "pronunciation": "/ˈtæksi/",
        "partOfSpeech": "noun",
        "example": "Call a taxi.",
        "exampleMeaning": "Ví dụ về xe tắc-xi.",
        "category": "Travel"
      },
      {
        "word": "Airport",
        "meaning": "Sân bay",
        "pronunciation": "/ˈerpɔːrt/",
        "partOfSpeech": "noun",
        "example": "Arrive at the airport early.",
        "exampleMeaning": "Ví dụ về sân bay.",
        "category": "Travel"
      },
      {
        "word": "Station",
        "meaning": "Nhà ga, trạm xe",
        "pronunciation": "/ˈsteɪʃn/",
        "partOfSpeech": "noun",
        "example": "Meet me at the train station.",
        "exampleMeaning": "Ví dụ về nhà ga, trạm xe.",
        "category": "Travel"
      },
      {
        "word": "Stop",
        "meaning": "Trạm dừng",
        "pronunciation": "/stɑːp/",
        "partOfSpeech": "noun",
        "example": "Wait at the bus stop.",
        "exampleMeaning": "Ví dụ về trạm dừng.",
        "category": "Travel"
      },
      {
        "word": "Left",
        "meaning": "Bên trái, rẽ trái",
        "pronunciation": "/left/",
        "partOfSpeech": "noun",
        "example": "Turn left at the corner.",
        "exampleMeaning": "Ví dụ về bên trái, rẽ trái.",
        "category": "Travel"
      },
      {
        "word": "Right",
        "meaning": "Bên phải, rẽ phải",
        "pronunciation": "/raɪt/",
        "partOfSpeech": "noun",
        "example": "Turn right at the traffic lights.",
        "exampleMeaning": "Ví dụ về bên phải, rẽ phải.",
        "category": "Travel"
      },
      {
        "word": "Straight",
        "meaning": "Thẳng, đi thẳng",
        "pronunciation": "/streɪt/",
        "partOfSpeech": "adverb",
        "example": "Go straight on this street.",
        "exampleMeaning": "Ví dụ về thẳng, đi thẳng.",
        "category": "Travel"
      },
      {
        "word": "Near",
        "meaning": "Gần, ở gần",
        "pronunciation": "/nɪr/",
        "partOfSpeech": "preposition",
        "example": "The pharmacy is near the bank.",
        "exampleMeaning": "Ví dụ về gần, ở gần.",
        "category": "Travel"
      },
      {
        "word": "Far",
        "meaning": "Xa",
        "pronunciation": "/fɑːr/",
        "partOfSpeech": "adverb",
        "example": "It is not too far.",
        "exampleMeaning": "Ví dụ về xa.",
        "category": "Travel"
      },
      {
        "word": "Turn",
        "meaning": "Rẽ, quẹo",
        "pronunciation": "/tɜːrn/",
        "partOfSpeech": "verb",
        "example": "Turn left at the next street.",
        "exampleMeaning": "Ví dụ về rẽ, quẹo.",
        "category": "Travel"
      },
      {
        "word": "Cross",
        "meaning": "Băng qua",
        "pronunciation": "/krɔːs/",
        "partOfSpeech": "verb",
        "example": "Cross the road at pedestrian walk.",
        "exampleMeaning": "Ví dụ về băng qua.",
        "category": "Travel"
      },
      {
        "word": "Road",
        "meaning": "Con đường",
        "pronunciation": "/roʊd/",
        "partOfSpeech": "noun",
        "example": "Cross the busy road.",
        "exampleMeaning": "Ví dụ về con đường.",
        "category": "Travel"
      },
      {
        "word": "Street",
        "meaning": "Tuyến phố",
        "pronunciation": "/striːt/",
        "partOfSpeech": "noun",
        "example": "Walk along the tree-lined street.",
        "exampleMeaning": "Ví dụ về tuyến phố.",
        "category": "Travel"
      }
    ],
    "grammarPoints": [
      {
        "title": "Ngữ pháp trọng tâm: Transportation & Directions",
        "explanation": "Các quy tắc ngữ pháp thông dụng cần ghi nhớ khi nói về Transportation & Directions.",
        "formula": "S + V + O",
        "examples": "[{\"en\": \"Example sentence for Transportation & Directions.\", \"vi\": \"Câu ví dụ thực tế.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Luyện nghe chủ đề Transportation & Directions",
        "transcript": "Hello, welcome to our lesson on Transportation & Directions. We learn important words and communication phrases today.",
        "questions": "[{\"question\": \"Chủ đề nghe hôm nay là gì?\", \"options\": [\"Transportation & Directions\", \"Khác\", \"Không rõ\", \"Bỏ qua\"], \"correctAnswer\": \"Transportation & Directions\", \"explanation\": \"Chủ đề nghe: Transportation & Directions.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Hội thoại giao tiếp Transportation & Directions",
        "context": "Tình huống trò chuyện về Transportation & Directions.",
        "dialogue": "[{\"speaker\": \"A\", \"text\": \"Let's talk about Transportation & Directions.\", \"meaning\": \"Hãy nói về Transportation & Directions nhé.\"}, {\"speaker\": \"B\", \"text\": \"That sounds great, I'd love to!\", \"meaning\": \"Tuyệt vời, mình rất sẵn lòng!\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Từ vựng tiêu biểu của chủ đề Transportation & Directions là:",
        "options": "[\"Bus\", \"Unrelated1\", \"Unrelated2\", \"Unrelated3\"]",
        "correctAnswer": "Bus",
        "explanation": "Bus thuộc chủ đề Transportation & Directions."
      }
    ],
    "quizzes": [
      {
        "question": "Turn left nghĩa là:",
        "options": "[\"Rẽ trái\", \"Rẽ phải\", \"Đi thẳng\", \"Quay đầu\"]",
        "correctAnswer": "Rẽ trái",
        "explanation": "Đáp án đúng là: Rẽ trái."
      },
      {
        "question": "Airport là nơi nào?",
        "options": "[\"Sân bay\", \"Nhà ga\", \"Bến xe\", \"Bến cảng\"]",
        "correctAnswer": "Sân bay",
        "explanation": "Đáp án đúng là: Sân bay."
      },
      {
        "question": "Turn right nghĩa là:",
        "options": "[\"Rẽ phải\", \"Rẽ trái\", \"Đi thẳng\", \"Đứng lại\"]",
        "correctAnswer": "Rẽ phải",
        "explanation": "Đáp án đúng là: Rẽ phải."
      },
      {
        "question": "Train nghĩa là:",
        "options": "[\"Tàu hỏa\", \"Xe buýt\", \"Xe đạp\", \"Máy bay\"]",
        "correctAnswer": "Tàu hỏa",
        "explanation": "Đáp án đúng là: Tàu hỏa."
      },
      {
        "question": "Near nghĩa là:",
        "options": "[\"Gần\", \"Xa\", \"Bên trên\", \"Bên dưới\"]",
        "correctAnswer": "Gần",
        "explanation": "Đáp án đúng là: Gần."
      },
      {
        "question": "Bicycle là phương tiện gì?",
        "options": "[\"Xe đạp\", \"Xe máy\", \"Xe hơi\", \"Xe buýt\"]",
        "correctAnswer": "Xe đạp",
        "explanation": "Đáp án đúng là: Xe đạp."
      },
      {
        "question": "Go straight nghĩa là:",
        "options": "[\"Đi thẳng\", \"Rẽ trái\", \"Rẽ phải\", \"Quay lại\"]",
        "correctAnswer": "Đi thẳng",
        "explanation": "Đáp án đúng là: Đi thẳng."
      },
      {
        "question": "Bus stop là:",
        "options": "[\"Trạm xe buýt\", \"Nhà ga\", \"Sân bay\", \"Bến cảng\"]",
        "correctAnswer": "Trạm xe buýt",
        "explanation": "Đáp án đúng là: Trạm xe buýt."
      },
      {
        "question": "Airplane là:",
        "options": "[\"Máy bay\", \"Tàu hỏa\", \"Xe hơi\", \"Thuyền\"]",
        "correctAnswer": "Máy bay",
        "explanation": "Đáp án đúng là: Máy bay."
      },
      {
        "question": "Far nghĩa là:",
        "options": "[\"Xa xôi\", \"Gần gũi\", \"Bên cạnh\", \"Ở giữa\"]",
        "correctAnswer": "Xa xôi",
        "explanation": "Đáp án đúng là: Xa xôi."
      }
    ]
  },
  {
    "orderNumber": 13,
    "title": "Travel & Vacations",
    "description": "Lên kế hoạch du lịch, đặt phòng khách sạn, làm thủ tục vé và diễn đạt kế hoạch tương lai.",
    "level": "A2",
    "category": "Travel",
    "durationMinutes": 20,
    "vocabularies": [
      {
        "word": "Hotel",
        "meaning": "Khách sạn",
        "pronunciation": "/hoʊˈtel/",
        "partOfSpeech": "noun",
        "example": "Stay at a comfortable hotel.",
        "exampleMeaning": "Ví dụ về khách sạn.",
        "category": "Travel"
      },
      {
        "word": "Ticket",
        "meaning": "Vé đi lại",
        "pronunciation": "/ˈtɪkɪt/",
        "partOfSpeech": "noun",
        "example": "Book an airplane ticket.",
        "exampleMeaning": "Ví dụ về vé đi lại.",
        "category": "Travel"
      },
      {
        "word": "Passport",
        "meaning": "Hộ chiếu",
        "pronunciation": "/ˈpæspɔːrt/",
        "partOfSpeech": "noun",
        "example": "Keep your passport safe.",
        "exampleMeaning": "Ví dụ về hộ chiếu.",
        "category": "Travel"
      },
      {
        "word": "Beach",
        "meaning": "Bãi biển",
        "pronunciation": "/biːtʃ/",
        "partOfSpeech": "noun",
        "example": "Walking along the sunny beach.",
        "exampleMeaning": "Ví dụ về bãi biển.",
        "category": "Travel"
      },
      {
        "word": "Mountain",
        "meaning": "Ngọn núi",
        "pronunciation": "/ˈmaʊntn/",
        "partOfSpeech": "noun",
        "example": "Hike in the mountains.",
        "exampleMeaning": "Ví dụ về ngọn núi.",
        "category": "Travel"
      },
      {
        "word": "Island",
        "meaning": "Hòn đảo",
        "pronunciation": "/ˈaɪlənd/",
        "partOfSpeech": "noun",
        "example": "Visit Phu Quoc island.",
        "exampleMeaning": "Ví dụ về hòn đảo.",
        "category": "Travel"
      },
      {
        "word": "Forest",
        "meaning": "Khu rừng",
        "pronunciation": "/ˈfɔːrɪst/",
        "partOfSpeech": "noun",
        "example": "Walk in the green forest.",
        "exampleMeaning": "Ví dụ về khu rừng.",
        "category": "Travel"
      },
      {
        "word": "Luggage",
        "meaning": "Hành lý",
        "pronunciation": "/ˈlʌɡɪdʒ/",
        "partOfSpeech": "noun",
        "example": "Pack your luggage carefully.",
        "exampleMeaning": "Ví dụ về hành lý.",
        "category": "Travel"
      },
      {
        "word": "Map",
        "meaning": "Bản đồ",
        "pronunciation": "/mæp/",
        "partOfSpeech": "noun",
        "example": "Check the tourist map.",
        "exampleMeaning": "Ví dụ về bản đồ.",
        "category": "Travel"
      },
      {
        "word": "Tour",
        "meaning": "Chuyến tham quan",
        "pronunciation": "/tʊr/",
        "partOfSpeech": "noun",
        "example": "Take a guided city tour.",
        "exampleMeaning": "Ví dụ về chuyến tham quan.",
        "category": "Travel"
      },
      {
        "word": "Guide",
        "meaning": "Hướng dẫn viên",
        "pronunciation": "/ɡaɪd/",
        "partOfSpeech": "noun",
        "example": "Follow the local tour guide.",
        "exampleMeaning": "Ví dụ về hướng dẫn viên.",
        "category": "Travel"
      },
      {
        "word": "Visit",
        "meaning": "Thăm quan",
        "pronunciation": "/ˈvɪzɪt/",
        "partOfSpeech": "verb",
        "example": "Visit ancient temples.",
        "exampleMeaning": "Ví dụ về thăm quan.",
        "category": "Travel"
      },
      {
        "word": "Travel",
        "meaning": "Du lịch",
        "pronunciation": "/ˈtrævl/",
        "partOfSpeech": "verb",
        "example": "I love to travel around Vietnam.",
        "exampleMeaning": "Ví dụ về du lịch.",
        "category": "Travel"
      },
      {
        "word": "Trip",
        "meaning": "Chuyến đi",
        "pronunciation": "/trɪp/",
        "partOfSpeech": "noun",
        "example": "Have a wonderful weekend trip.",
        "exampleMeaning": "Ví dụ về chuyến đi.",
        "category": "Travel"
      },
      {
        "word": "Vacation",
        "meaning": "Kỳ nghỉ",
        "pronunciation": "/veɪˈkeɪʃn/",
        "partOfSpeech": "noun",
        "example": "Enjoy your beach vacation.",
        "exampleMeaning": "Ví dụ về kỳ nghỉ.",
        "category": "Travel"
      },
      {
        "word": "Flight",
        "meaning": "Chuyến bay",
        "pronunciation": "/flaɪt/",
        "partOfSpeech": "noun",
        "example": "The flight takes two hours.",
        "exampleMeaning": "Ví dụ về chuyến bay.",
        "category": "Travel"
      },
      {
        "word": "Resort",
        "meaning": "Khu nghỉ dưỡng",
        "pronunciation": "/rɪˈzɔːrt/",
        "partOfSpeech": "noun",
        "example": "Relax at a seaside resort.",
        "exampleMeaning": "Ví dụ về khu nghỉ dưỡng.",
        "category": "Travel"
      },
      {
        "word": "View",
        "meaning": "Cảnh quan, tầm nhìn",
        "pronunciation": "/vjuː/",
        "partOfSpeech": "noun",
        "example": "A spectacular ocean view.",
        "exampleMeaning": "Ví dụ về cảnh quan, tầm nhìn.",
        "category": "Travel"
      },
      {
        "word": "Photo",
        "meaning": "Bức ảnh",
        "pronunciation": "/ˈfoʊtoʊ/",
        "partOfSpeech": "noun",
        "example": "Take beautiful holiday photos.",
        "exampleMeaning": "Ví dụ về bức ảnh.",
        "category": "Travel"
      },
      {
        "word": "Camp",
        "meaning": "Cắm trại",
        "pronunciation": "/kæmp/",
        "partOfSpeech": "verb",
        "example": "Camp near the quiet lake.",
        "exampleMeaning": "Ví dụ về cắm trại.",
        "category": "Travel"
      }
    ],
    "grammarPoints": [
      {
        "title": "Ngữ pháp trọng tâm: Travel & Vacations",
        "explanation": "Các quy tắc ngữ pháp thông dụng cần ghi nhớ khi nói về Travel & Vacations.",
        "formula": "S + V + O",
        "examples": "[{\"en\": \"Example sentence for Travel & Vacations.\", \"vi\": \"Câu ví dụ thực tế.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Luyện nghe chủ đề Travel & Vacations",
        "transcript": "Hello, welcome to our lesson on Travel & Vacations. We learn important words and communication phrases today.",
        "questions": "[{\"question\": \"Chủ đề nghe hôm nay là gì?\", \"options\": [\"Travel & Vacations\", \"Khác\", \"Không rõ\", \"Bỏ qua\"], \"correctAnswer\": \"Travel & Vacations\", \"explanation\": \"Chủ đề nghe: Travel & Vacations.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Hội thoại giao tiếp Travel & Vacations",
        "context": "Tình huống trò chuyện về Travel & Vacations.",
        "dialogue": "[{\"speaker\": \"A\", \"text\": \"Let's talk about Travel & Vacations.\", \"meaning\": \"Hãy nói về Travel & Vacations nhé.\"}, {\"speaker\": \"B\", \"text\": \"That sounds great, I'd love to!\", \"meaning\": \"Tuyệt vời, mình rất sẵn lòng!\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Từ vựng tiêu biểu của chủ đề Travel & Vacations là:",
        "options": "[\"Hotel\", \"Unrelated1\", \"Unrelated2\", \"Unrelated3\"]",
        "correctAnswer": "Hotel",
        "explanation": "Hotel thuộc chủ đề Travel & Vacations."
      }
    ],
    "quizzes": [
      {
        "question": "Passport nghĩa là:",
        "options": "[\"Hộ chiếu\", \"Vé máy bay\", \"Hành lý\", \"Bản đồ\"]",
        "correctAnswer": "Hộ chiếu",
        "explanation": "Đáp án đúng là: Hộ chiếu."
      },
      {
        "question": "Khách sạn là:",
        "options": "[\"Hotel\", \"Hospital\", \"Restaurant\", \"School\"]",
        "correctAnswer": "Hotel",
        "explanation": "Đáp án đúng là: Hotel."
      },
      {
        "question": "Luggage nghĩa là:",
        "options": "[\"Hành lý\", \"Vé tàu\", \"Bản đồ\", \"Phòng ngủ\"]",
        "correctAnswer": "Hành lý",
        "explanation": "Đáp án đúng là: Hành lý."
      },
      {
        "question": "Beach là:",
        "options": "[\"Bãi biển\", \"Ngọn núi\", \"Rừng rậm\", \"Dòng sông\"]",
        "correctAnswer": "Bãi biển",
        "explanation": "Đáp án đúng là: Bãi biển."
      },
      {
        "question": "They ___ going to visit London.",
        "options": "[\"are\", \"is\", \"am\", \"be\"]",
        "correctAnswer": "are",
        "explanation": "Đáp án đúng là: are."
      },
      {
        "question": "Ticket là:",
        "options": "[\"Vé\", \"Hộ chiếu\", \"Tiền mặt\", \"Bản đồ\"]",
        "correctAnswer": "Vé",
        "explanation": "Đáp án đúng là: Vé."
      },
      {
        "question": "Island nghĩa là:",
        "options": "[\"Hòn đảo\", \"Ngọn núi\", \"Thung lũng\", \"Bãi biển\"]",
        "correctAnswer": "Hòn đảo",
        "explanation": "Đáp án đúng là: Hòn đảo."
      },
      {
        "question": "Flight là:",
        "options": "[\"Chuyến bay\", \"Chuyến xe\", \"Chuyến tàu\", \"Chuyến phà\"]",
        "correctAnswer": "Chuyến bay",
        "explanation": "Đáp án đúng là: Chuyến bay."
      },
      {
        "question": "Tour guide là:",
        "options": "[\"Hướng dẫn viên\", \"Tài xế\", \"Bảo vệ\", \"Đầu bếp\"]",
        "correctAnswer": "Hướng dẫn viên",
        "explanation": "Đáp án đúng là: Hướng dẫn viên."
      },
      {
        "question": "Vacation nghĩa là:",
        "options": "[\"Kỳ nghỉ\", \"Công việc\", \"Bài tập\", \"Học kỳ\"]",
        "correctAnswer": "Kỳ nghỉ",
        "explanation": "Đáp án đúng là: Kỳ nghỉ."
      }
    ]
  },
  {
    "orderNumber": 14,
    "title": "Health & Body Parts",
    "description": "Các bộ phận cơ thể con người, nói về tình trạng sức khỏe, đau ốm và lời khuyên y tế cơ bản.",
    "level": "A2",
    "category": "Health",
    "durationMinutes": 20,
    "vocabularies": [
      {
        "word": "Head",
        "meaning": "Cái đầu",
        "pronunciation": "/hed/",
        "partOfSpeech": "noun",
        "example": "Wear a helmet on your head.",
        "exampleMeaning": "Ví dụ về cái đầu.",
        "category": "Health"
      },
      {
        "word": "Face",
        "meaning": "Khuôn mặt",
        "pronunciation": "/feɪs/",
        "partOfSpeech": "noun",
        "example": "Wash your face every morning.",
        "exampleMeaning": "Ví dụ về khuôn mặt.",
        "category": "Health"
      },
      {
        "word": "Eye",
        "meaning": "Đôi mắt",
        "pronunciation": "/aɪ/",
        "partOfSpeech": "noun",
        "example": "She has bright brown eyes.",
        "exampleMeaning": "Ví dụ về đôi mắt.",
        "category": "Health"
      },
      {
        "word": "Ear",
        "meaning": "Cái tai",
        "pronunciation": "/ɪr/",
        "partOfSpeech": "noun",
        "example": "Listen with your ears.",
        "exampleMeaning": "Ví dụ về cái tai.",
        "category": "Health"
      },
      {
        "word": "Nose",
        "meaning": "Chiếc mũi",
        "pronunciation": "/noʊz/",
        "partOfSpeech": "noun",
        "example": "Breathe through your nose.",
        "exampleMeaning": "Ví dụ về chiếc mũi.",
        "category": "Health"
      },
      {
        "word": "Mouth",
        "meaning": "Cái miệng",
        "pronunciation": "/maʊθ/",
        "partOfSpeech": "noun",
        "example": "Open your mouth for doctor.",
        "exampleMeaning": "Ví dụ về cái miệng.",
        "category": "Health"
      },
      {
        "word": "Hand",
        "meaning": "Bàn tay",
        "pronunciation": "/hænd/",
        "partOfSpeech": "noun",
        "example": "Wash your hands with soap.",
        "exampleMeaning": "Ví dụ về bàn tay.",
        "category": "Health"
      },
      {
        "word": "Finger",
        "meaning": "Ngón tay",
        "pronunciation": "/ˈfɪŋɡər/",
        "partOfSpeech": "noun",
        "example": "Ten fingers on two hands.",
        "exampleMeaning": "Ví dụ về ngón tay.",
        "category": "Health"
      },
      {
        "word": "Leg",
        "meaning": "Cái chân",
        "pronunciation": "/leɡ/",
        "partOfSpeech": "noun",
        "example": "Running strengthens your legs.",
        "exampleMeaning": "Ví dụ về cái chân.",
        "category": "Health"
      },
      {
        "word": "Foot",
        "meaning": "Bàn chân",
        "pronunciation": "/fʊt/",
        "partOfSpeech": "noun",
        "example": "Warm socks for your feet.",
        "exampleMeaning": "Ví dụ về bàn chân.",
        "category": "Health"
      },
      {
        "word": "Body",
        "meaning": "Cơ thể",
        "pronunciation": "/ˈbɑːdi/",
        "partOfSpeech": "noun",
        "example": "Keep your body fit and strong.",
        "exampleMeaning": "Ví dụ về cơ thể.",
        "category": "Health"
      },
      {
        "word": "Healthy",
        "meaning": "Khỏe mạnh",
        "pronunciation": "/ˈhelθi/",
        "partOfSpeech": "adjective",
        "example": "Eat fresh vegetables to be healthy.",
        "exampleMeaning": "Ví dụ về khỏe mạnh.",
        "category": "Health"
      },
      {
        "word": "Sick",
        "meaning": "Ốm, bệnh",
        "pronunciation": "/sɪk/",
        "partOfSpeech": "adjective",
        "example": "He feels sick today.",
        "exampleMeaning": "Ví dụ về ốm, bệnh.",
        "category": "Health"
      },
      {
        "word": "Ill",
        "meaning": "Bị ốm",
        "pronunciation": "/ɪl/",
        "partOfSpeech": "adjective",
        "example": "She stayed in bed because she was ill.",
        "exampleMeaning": "Ví dụ về bị ốm.",
        "category": "Health"
      },
      {
        "word": "Pain",
        "meaning": "Cơn đau",
        "pronunciation": "/peɪn/",
        "partOfSpeech": "noun",
        "example": "Do you feel any pain?",
        "exampleMeaning": "Ví dụ về cơn đau.",
        "category": "Health"
      },
      {
        "word": "Headache",
        "meaning": "Cơn đau đầu",
        "pronunciation": "/ˈhedeɪk/",
        "partOfSpeech": "noun",
        "example": "I have a bad headache.",
        "exampleMeaning": "Ví dụ về cơn đau đầu.",
        "category": "Health"
      },
      {
        "word": "Fever",
        "meaning": "Cơn sốt",
        "pronunciation": "/ˈfiːvər/",
        "partOfSpeech": "noun",
        "example": "A high fever above 38 degrees.",
        "exampleMeaning": "Ví dụ về cơn sốt.",
        "category": "Health"
      },
      {
        "word": "Medicine",
        "meaning": "Thuốc chữa bệnh",
        "pronunciation": "/ˈmedɪsn/",
        "partOfSpeech": "noun",
        "example": "Take this medicine after meals.",
        "exampleMeaning": "Ví dụ về thuốc chữa bệnh.",
        "category": "Health"
      },
      {
        "word": "Doctor",
        "meaning": "Bác sĩ",
        "pronunciation": "/ˈdɑːktər/",
        "partOfSpeech": "noun",
        "example": "Consult with your doctor.",
        "exampleMeaning": "Ví dụ về bác sĩ.",
        "category": "Health"
      },
      {
        "word": "Hospital",
        "meaning": "Bệnh viện",
        "pronunciation": "/ˈhɑːspɪtl/",
        "partOfSpeech": "noun",
        "example": "Go to the general hospital.",
        "exampleMeaning": "Ví dụ về bệnh viện.",
        "category": "Health"
      }
    ],
    "grammarPoints": [
      {
        "title": "Ngữ pháp trọng tâm: Health & Body Parts",
        "explanation": "Các quy tắc ngữ pháp thông dụng cần ghi nhớ khi nói về Health & Body Parts.",
        "formula": "S + V + O",
        "examples": "[{\"en\": \"Example sentence for Health & Body Parts.\", \"vi\": \"Câu ví dụ thực tế.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Luyện nghe chủ đề Health & Body Parts",
        "transcript": "Hello, welcome to our lesson on Health & Body Parts. We learn important words and communication phrases today.",
        "questions": "[{\"question\": \"Chủ đề nghe hôm nay là gì?\", \"options\": [\"Health & Body Parts\", \"Khác\", \"Không rõ\", \"Bỏ qua\"], \"correctAnswer\": \"Health & Body Parts\", \"explanation\": \"Chủ đề nghe: Health & Body Parts.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Hội thoại giao tiếp Health & Body Parts",
        "context": "Tình huống trò chuyện về Health & Body Parts.",
        "dialogue": "[{\"speaker\": \"A\", \"text\": \"Let's talk about Health & Body Parts.\", \"meaning\": \"Hãy nói về Health & Body Parts nhé.\"}, {\"speaker\": \"B\", \"text\": \"That sounds great, I'd love to!\", \"meaning\": \"Tuyệt vời, mình rất sẵn lòng!\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Từ vựng tiêu biểu của chủ đề Health & Body Parts là:",
        "options": "[\"Head\", \"Unrelated1\", \"Unrelated2\", \"Unrelated3\"]",
        "correctAnswer": "Head",
        "explanation": "Head thuộc chủ đề Health & Body Parts."
      }
    ],
    "quizzes": [
      {
        "question": "Healthy nghĩa là:",
        "options": "[\"Khỏe mạnh\", \"Ốm yếu\", \"Mệt mỏi\", \"Buồn bã\"]",
        "correctAnswer": "Khỏe mạnh",
        "explanation": "Đáp án đúng là: Khỏe mạnh."
      },
      {
        "question": "Hand là bộ phận nào?",
        "options": "[\"Bàn tay\", \"Bàn chân\", \"Cái đầu\", \"Đôi mắt\"]",
        "correctAnswer": "Bàn tay",
        "explanation": "Đáp án đúng là: Bàn tay."
      },
      {
        "question": "Medicine nghĩa là:",
        "options": "[\"Thuốc\", \"Thức ăn\", \"Nước uống\", \"Giường ngủ\"]",
        "correctAnswer": "Thuốc",
        "explanation": "Đáp án đúng là: Thuốc."
      },
      {
        "question": "You ___ eat too much junk food.",
        "options": "[\"shouldn't\", \"should\", \"must\", \"can\"]",
        "correctAnswer": "shouldn't",
        "explanation": "Đáp án đúng là: shouldn't."
      },
      {
        "question": "Eye nghĩa là:",
        "options": "[\"Đôi mắt\", \"Cái tai\", \"Cái mũi\", \"Cái miệng\"]",
        "correctAnswer": "Đôi mắt",
        "explanation": "Đáp án đúng là: Đôi mắt."
      },
      {
        "question": "Headache là bệnh gì?",
        "options": "[\"Đau đầu\", \"Đau bụng\", \"Đau răng\", \"Đau chân\"]",
        "correctAnswer": "Đau đầu",
        "explanation": "Đáp án đúng là: Đau đầu."
      },
      {
        "question": "Fever nghĩa là:",
        "options": "[\"Cơn sốt\", \"Cơn ho\", \"Cơn đau\", \"Cảm lạnh\"]",
        "correctAnswer": "Cơn sốt",
        "explanation": "Đáp án đúng là: Cơn sốt."
      },
      {
        "question": "Nose là:",
        "options": "[\"Cái mũi\", \"Cái tai\", \"Cái miệng\", \"Đôi mắt\"]",
        "correctAnswer": "Cái mũi",
        "explanation": "Đáp án đúng là: Cái mũi."
      },
      {
        "question": "Leg là:",
        "options": "[\"Cái chân\", \"Cái tay\", \"Cái đầu\", \"Cái lưng\"]",
        "correctAnswer": "Cái chân",
        "explanation": "Đáp án đúng là: Cái chân."
      },
      {
        "question": "You ___ see a doctor when sick.",
        "options": "[\"should\", \"shouldn't\", \"can't\", \"mustn't\"]",
        "correctAnswer": "should",
        "explanation": "Đáp án đúng là: should."
      }
    ]
  },
  {
    "orderNumber": 15,
    "title": "Hobbies & Free Time",
    "description": "Nói về sở thích, các hoạt động giải trí lúc rảnh rỗi và diễn đạt tình yêu thích trong giao tiếp.",
    "level": "A2",
    "category": "Hobbies",
    "durationMinutes": 20,
    "vocabularies": [
      {
        "word": "Music",
        "meaning": "Âm nhạc",
        "pronunciation": "/ˈmjuːzɪk/",
        "partOfSpeech": "noun",
        "example": "I listen to acoustic music.",
        "exampleMeaning": "Ví dụ về âm nhạc.",
        "category": "Hobbies"
      },
      {
        "word": "Song",
        "meaning": "Bài hát",
        "pronunciation": "/sɔːŋ/",
        "partOfSpeech": "noun",
        "example": "A melodious pop song.",
        "exampleMeaning": "Ví dụ về bài hát.",
        "category": "Hobbies"
      },
      {
        "word": "Movie",
        "meaning": "Bộ phim",
        "pronunciation": "/ˈmuːvi/",
        "partOfSpeech": "noun",
        "example": "Watch an exciting action movie.",
        "exampleMeaning": "Ví dụ về bộ phim.",
        "category": "Hobbies"
      },
      {
        "word": "Film",
        "meaning": "Phim ảnh",
        "pronunciation": "/fɪlm/",
        "partOfSpeech": "noun",
        "example": "A documentary film about nature.",
        "exampleMeaning": "Ví dụ về phim ảnh.",
        "category": "Hobbies"
      },
      {
        "word": "Sports",
        "meaning": "Thể thao",
        "pronunciation": "/spɔːrts/",
        "partOfSpeech": "noun",
        "example": "Playing sports is great for your health.",
        "exampleMeaning": "Ví dụ về thể thao.",
        "category": "Hobbies"
      },
      {
        "word": "Game",
        "meaning": "Trò chơi",
        "pronunciation": "/ɡeɪm/",
        "partOfSpeech": "noun",
        "example": "Play board games with friends.",
        "exampleMeaning": "Ví dụ về trò chơi.",
        "category": "Hobbies"
      },
      {
        "word": "Football",
        "meaning": "Bóng đá",
        "pronunciation": "/ˈfʊtbɔːl/",
        "partOfSpeech": "noun",
        "example": "Play football on Sundays.",
        "exampleMeaning": "Ví dụ về bóng đá.",
        "category": "Hobbies"
      },
      {
        "word": "Sing",
        "meaning": "Ca hát",
        "pronunciation": "/sɪŋ/",
        "partOfSpeech": "verb",
        "example": "She sings very beautifully.",
        "exampleMeaning": "Ví dụ về ca hát.",
        "category": "Hobbies"
      },
      {
        "word": "Dance",
        "meaning": "Nhảy múa",
        "pronunciation": "/dæns/",
        "partOfSpeech": "verb",
        "example": "Dancing to the rhythm.",
        "exampleMeaning": "Ví dụ về nhảy múa.",
        "category": "Hobbies"
      },
      {
        "word": "Swimming",
        "meaning": "Bơi lội",
        "pronunciation": "/ˈswɪmɪŋ/",
        "partOfSpeech": "noun",
        "example": "Swimming is my favorite summer hobby.",
        "exampleMeaning": "Ví dụ về bơi lội.",
        "category": "Hobbies"
      },
      {
        "word": "Guitar",
        "meaning": "Đàn ghi-ta",
        "pronunciation": "/ɡɪˈtɑːr/",
        "partOfSpeech": "noun",
        "example": "He plays guitar around campfire.",
        "exampleMeaning": "Ví dụ về đàn ghi-ta.",
        "category": "Hobbies"
      },
      {
        "word": "Piano",
        "meaning": "Đàn dương cầm",
        "pronunciation": "/piˈænoʊ/",
        "partOfSpeech": "noun",
        "example": "Practicing the piano keys.",
        "exampleMeaning": "Ví dụ về đàn dương cầm.",
        "category": "Hobbies"
      },
      {
        "word": "Book",
        "meaning": "Sách đọc",
        "pronunciation": "/bʊk/",
        "partOfSpeech": "noun",
        "example": "A gripping mystery book.",
        "exampleMeaning": "Ví dụ về sách đọc.",
        "category": "Hobbies"
      },
      {
        "word": "Paint",
        "meaning": "Vẽ tranh sơn dầu",
        "pronunciation": "/peɪnt/",
        "partOfSpeech": "verb",
        "example": "Paint colorful portraits.",
        "exampleMeaning": "Ví dụ về vẽ tranh sơn dầu.",
        "category": "Hobbies"
      },
      {
        "word": "Draw",
        "meaning": "Vẽ phác thảo",
        "pronunciation": "/drɔː/",
        "partOfSpeech": "verb",
        "example": "Draw cartoon sketches.",
        "exampleMeaning": "Ví dụ về vẽ phác thảo.",
        "category": "Hobbies"
      },
      {
        "word": "Photo",
        "meaning": "Bức ảnh",
        "pronunciation": "/ˈfoʊtoʊ/",
        "partOfSpeech": "noun",
        "example": "Take a photo of this sunset.",
        "exampleMeaning": "Ví dụ về bức ảnh.",
        "category": "Hobbies"
      },
      {
        "word": "Camera",
        "meaning": "Máy ảnh",
        "pronunciation": "/ˈkæmrə/",
        "partOfSpeech": "noun",
        "example": "A professional DSLR camera.",
        "exampleMeaning": "Ví dụ về máy ảnh.",
        "category": "Hobbies"
      },
      {
        "word": "Travel",
        "meaning": "Du ngoạn",
        "pronunciation": "/ˈtrævl/",
        "partOfSpeech": "verb",
        "example": "Travel broadens the mind.",
        "exampleMeaning": "Ví dụ về du ngoạn.",
        "category": "Hobbies"
      },
      {
        "word": "Hobby",
        "meaning": "Sở thích",
        "pronunciation": "/ˈhɑːbi/",
        "partOfSpeech": "noun",
        "example": "What is your main hobby?",
        "exampleMeaning": "Ví dụ về sở thích.",
        "category": "Hobbies"
      },
      {
        "word": "Favorite",
        "meaning": "Được yêu thích nhất",
        "pronunciation": "/ˈfeɪvərɪt/",
        "partOfSpeech": "adjective",
        "example": "My favorite hobby is reading.",
        "exampleMeaning": "Ví dụ về được yêu thích nhất.",
        "category": "Hobbies"
      }
    ],
    "grammarPoints": [
      {
        "title": "Ngữ pháp trọng tâm: Hobbies & Free Time",
        "explanation": "Các quy tắc ngữ pháp thông dụng cần ghi nhớ khi nói về Hobbies & Free Time.",
        "formula": "S + V + O",
        "examples": "[{\"en\": \"Example sentence for Hobbies & Free Time.\", \"vi\": \"Câu ví dụ thực tế.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Luyện nghe chủ đề Hobbies & Free Time",
        "transcript": "Hello, welcome to our lesson on Hobbies & Free Time. We learn important words and communication phrases today.",
        "questions": "[{\"question\": \"Chủ đề nghe hôm nay là gì?\", \"options\": [\"Hobbies & Free Time\", \"Khác\", \"Không rõ\", \"Bỏ qua\"], \"correctAnswer\": \"Hobbies & Free Time\", \"explanation\": \"Chủ đề nghe: Hobbies & Free Time.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Hội thoại giao tiếp Hobbies & Free Time",
        "context": "Tình huống trò chuyện về Hobbies & Free Time.",
        "dialogue": "[{\"speaker\": \"A\", \"text\": \"Let's talk about Hobbies & Free Time.\", \"meaning\": \"Hãy nói về Hobbies & Free Time nhé.\"}, {\"speaker\": \"B\", \"text\": \"That sounds great, I'd love to!\", \"meaning\": \"Tuyệt vời, mình rất sẵn lòng!\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Từ vựng tiêu biểu của chủ đề Hobbies & Free Time là:",
        "options": "[\"Music\", \"Unrelated1\", \"Unrelated2\", \"Unrelated3\"]",
        "correctAnswer": "Music",
        "explanation": "Music thuộc chủ đề Hobbies & Free Time."
      }
    ],
    "quizzes": [
      {
        "question": "Music nghĩa là:",
        "options": "[\"Âm nhạc\", \"Hội họa\", \"Điện ảnh\", \"Thể thao\"]",
        "correctAnswer": "Âm nhạc",
        "explanation": "Đáp án đúng là: Âm nhạc."
      },
      {
        "question": "She enjoys ___ (dance).",
        "options": "[\"dancing\", \"dance\", \"danced\", \"dances\"]",
        "correctAnswer": "dancing",
        "explanation": "Đáp án đúng là: dancing."
      },
      {
        "question": "Swimming nghĩa là môn gì?",
        "options": "[\"Bơi lội\", \"Bóng đá\", \"Chạy bộ\", \"Đạp xe\"]",
        "correctAnswer": "Bơi lội",
        "explanation": "Đáp án đúng là: Bơi lội."
      },
      {
        "question": "Favorite nghĩa là:",
        "options": "[\"Yêu thích nhất\", \"Chán nhất\", \"Khó nhất\", \"Đắt nhất\"]",
        "correctAnswer": "Yêu thích nhất",
        "explanation": "Đáp án đúng là: Yêu thích nhất."
      },
      {
        "question": "Movie nghĩa là:",
        "options": "[\"Bộ phim\", \"Bài hát\", \"Trò chơi\", \"Quyển sách\"]",
        "correctAnswer": "Bộ phim",
        "explanation": "Đáp án đúng là: Bộ phim."
      },
      {
        "question": "Guitar là nhạc cụ nào?",
        "options": "[\"Đàn ghi-ta\", \"Đàn piano\", \"Cây sáo\", \"Bộ trống\"]",
        "correctAnswer": "Đàn ghi-ta",
        "explanation": "Đáp án đúng là: Đàn ghi-ta."
      },
      {
        "question": "Hobby nghĩa là:",
        "options": "[\"Sở thích\", \"Nghề nghiệp\", \"Bài học\", \"Kỳ thi\"]",
        "correctAnswer": "Sở thích",
        "explanation": "Đáp án đúng là: Sở thích."
      },
      {
        "question": "Football là môn:",
        "options": "[\"Bóng đá\", \"Bóng rổ\", \"Bóng chuyền\", \"Quần vợt\"]",
        "correctAnswer": "Bóng đá",
        "explanation": "Đáp án đúng là: Bóng đá."
      },
      {
        "question": "Song nghĩa là:",
        "options": "[\"Bài hát\", \"Điệu nhảy\", \"Bức tranh\", \"Quyển truyện\"]",
        "correctAnswer": "Bài hát",
        "explanation": "Đáp án đúng là: Bài hát."
      },
      {
        "question": "I love ___ (read) books.",
        "options": "[\"reading\", \"read\", \"reads\", \"readed\"]",
        "correctAnswer": "reading",
        "explanation": "Đáp án đúng là: reading."
      }
    ]
  }
];
const placementQuestions = [
  {
    "orderNumber": 1,
    "levelTarget": "A1",
    "category": "Grammar",
    "question": "I ___ a student.",
    "options": "[\"am\", \"is\", \"are\", \"be\"]",
    "correctAnswer": "am"
  },
  {
    "orderNumber": 2,
    "levelTarget": "A1",
    "category": "Vocabulary",
    "question": "What is the opposite of 'Hot'?",
    "options": "[\"Cold\", \"Warm\", \"Big\", \"Fast\"]",
    "correctAnswer": "Cold"
  },
  {
    "orderNumber": 3,
    "levelTarget": "A1",
    "category": "Grammar",
    "question": "She ___ English every evening.",
    "options": "[\"study\", \"studies\", \"studying\", \"is study\"]",
    "correctAnswer": "studies"
  },
  {
    "orderNumber": 4,
    "levelTarget": "A1",
    "category": "Vocabulary",
    "question": "My father's brother is my ___.",
    "options": "[\"Cousin\", \"Uncle\", \"Aunt\", \"Grandfather\"]",
    "correctAnswer": "Uncle"
  },
  {
    "orderNumber": 5,
    "levelTarget": "A1",
    "category": "Everyday",
    "question": "What time is it if it's 9:15?",
    "options": "[\"Nine fifteen\", \"Nine fifty\", \"Quarter to nine\", \"Nine past\"]",
    "correctAnswer": "Nine fifteen"
  },
  {
    "orderNumber": 6,
    "levelTarget": "A1",
    "category": "Grammar",
    "question": "There ___ two books on the table.",
    "options": "[\"is\", \"are\", \"am\", \"be\"]",
    "correctAnswer": "are"
  },
  {
    "orderNumber": 7,
    "levelTarget": "A1",
    "category": "Vocabulary",
    "question": "Which word is a fruit?",
    "options": "[\"Dog\", \"Car\", \"Apple\", \"Book\"]",
    "correctAnswer": "Apple"
  },
  {
    "orderNumber": 8,
    "levelTarget": "A1",
    "category": "Grammar",
    "question": "They ___ not like coffee.",
    "options": "[\"does\", \"do\", \"are\", \"is\"]",
    "correctAnswer": "do"
  },
  {
    "orderNumber": 9,
    "levelTarget": "A1",
    "category": "Vocabulary",
    "question": "Opposite of 'Big' is ___.",
    "options": "[\"Small\", \"Tall\", \"Fast\", \"Long\"]",
    "correctAnswer": "Small"
  },
  {
    "orderNumber": 10,
    "levelTarget": "A1",
    "category": "Grammar",
    "question": "___ you speak English?",
    "options": "[\"Do\", \"Are\", \"Is\", \"Have\"]",
    "correctAnswer": "Do"
  },
  {
    "orderNumber": 11,
    "levelTarget": "A1",
    "category": "Vocabulary",
    "question": "Color of the sky on a sunny day is ___.",
    "options": "[\"Blue\", \"Green\", \"Red\", \"Yellow\"]",
    "correctAnswer": "Blue"
  },
  {
    "orderNumber": 12,
    "levelTarget": "A1",
    "category": "Grammar",
    "question": "This is my brother. ___ name is Tom.",
    "options": "[\"His\", \"Her\", \"He\", \"Him\"]",
    "correctAnswer": "His"
  },
  {
    "orderNumber": 13,
    "levelTarget": "A2",
    "category": "Grammar",
    "question": "Yesterday, we ___ to the beach.",
    "options": "[\"go\", \"went\", \"gone\", \"going\"]",
    "correctAnswer": "went"
  },
  {
    "orderNumber": 14,
    "levelTarget": "A2",
    "category": "Vocabulary",
    "question": "He feels very ___ because he worked all night.",
    "options": "[\"tired\", \"energetic\", \"glad\", \"tall\"]",
    "correctAnswer": "tired"
  },
  {
    "orderNumber": 15,
    "levelTarget": "A2",
    "category": "Grammar",
    "question": "This car is ___ than that one.",
    "options": "[\"fast\", \"faster\", \"more fast\", \"fastest\"]",
    "correctAnswer": "faster"
  },
  {
    "orderNumber": 16,
    "levelTarget": "A2",
    "category": "Grammar",
    "question": "What are you ___ right now?",
    "options": "[\"do\", \"did\", \"doing\", \"does\"]",
    "correctAnswer": "doing"
  },
  {
    "orderNumber": 17,
    "levelTarget": "A2",
    "category": "Vocabulary",
    "question": "A person who flies an airplane is a ___.",
    "options": "[\"Doctor\", \"Pilot\", \"Chef\", \"Driver\"]",
    "correctAnswer": "Pilot"
  },
  {
    "orderNumber": 18,
    "levelTarget": "A2",
    "category": "Grammar",
    "question": "Have you ever ___ to Da Nang?",
    "options": "[\"be\", \"been\", \"was\", \"were\"]",
    "correctAnswer": "been"
  },
  {
    "orderNumber": 19,
    "levelTarget": "A2",
    "category": "Communication",
    "question": "Would you like some orange juice? - ___.",
    "options": "[\"Yes, please.\", \"No, I don't.\", \"I am fine.\", \"Never mind.\"]",
    "correctAnswer": "Yes, please."
  },
  {
    "orderNumber": 20,
    "levelTarget": "A2",
    "category": "Grammar",
    "question": "I haven't seen him ___ last Monday.",
    "options": "[\"since\", \"for\", \"in\", \"from\"]",
    "correctAnswer": "since"
  },
  {
    "orderNumber": 21,
    "levelTarget": "A2",
    "category": "Vocabulary",
    "question": "You buy medicine at the ___.",
    "options": "[\"Pharmacy\", \"Bakery\", \"Library\", \"Museum\"]",
    "correctAnswer": "Pharmacy"
  },
  {
    "orderNumber": 22,
    "levelTarget": "A2",
    "category": "Grammar",
    "question": "She dances very ___.",
    "options": "[\"beautifully\", \"beautiful\", \"beauty\", \"more beautiful\"]",
    "correctAnswer": "beautifully"
  },
  {
    "orderNumber": 23,
    "levelTarget": "A2",
    "category": "Vocabulary",
    "question": "A place where trains stop is a train ___.",
    "options": "[\"station\", \"airport\", \"port\", \"garage\"]",
    "correctAnswer": "station"
  },
  {
    "orderNumber": 24,
    "levelTarget": "A2",
    "category": "Grammar",
    "question": "They were watching TV when I ___ home.",
    "options": "[\"came\", \"come\", \"coming\", \"comes\"]",
    "correctAnswer": "came"
  },
  {
    "orderNumber": 25,
    "levelTarget": "B1",
    "category": "Grammar",
    "question": "If it rains tomorrow, we ___ at home.",
    "options": "[\"stay\", \"will stay\", \"stayed\", \"would stay\"]",
    "correctAnswer": "will stay"
  },
  {
    "orderNumber": 26,
    "levelTarget": "B1",
    "category": "Vocabulary",
    "question": "The flight was ___ due to heavy snow.",
    "options": "[\"delayed\", \"celebrated\", \"invited\", \"arrived\"]",
    "correctAnswer": "delayed"
  },
  {
    "orderNumber": 27,
    "levelTarget": "B1",
    "category": "Grammar",
    "question": "He asked me where I ___ from.",
    "options": "[\"come\", \"came\", \"coming\", \"comes\"]",
    "correctAnswer": "came"
  },
  {
    "orderNumber": 28,
    "levelTarget": "B1",
    "category": "Vocabulary",
    "question": "Smoking is strictly ___ inside the hospital.",
    "options": "[\"allowed\", \"prohibited\", \"encouraged\", \"enjoyed\"]",
    "correctAnswer": "prohibited"
  },
  {
    "orderNumber": 29,
    "levelTarget": "B1",
    "category": "Reading",
    "question": "'Although it was raining, they played soccer.' means:",
    "options": "[\"They stopped playing because of rain\", \"They played soccer despite the rain\", \"It didn't rain\", \"They dislike soccer\"]",
    "correctAnswer": "They played soccer despite the rain"
  },
  {
    "orderNumber": 30,
    "levelTarget": "B1",
    "category": "Grammar",
    "question": "I wish I ___ more time to travel.",
    "options": "[\"have\", \"had\", \"will have\", \"having\"]",
    "correctAnswer": "had"
  },
  {
    "orderNumber": 31,
    "levelTarget": "B1",
    "category": "Vocabulary",
    "question": "The meeting was called ___ because of an emergency.",
    "options": "[\"off\", \"on\", \"up\", \"in\"]",
    "correctAnswer": "off"
  },
  {
    "orderNumber": 32,
    "levelTarget": "B1",
    "category": "Grammar",
    "question": "The book ___ by J.K. Rowling was fantastic.",
    "options": "[\"written\", \"writing\", \"wrote\", \"write\"]",
    "correctAnswer": "written"
  },
  {
    "orderNumber": 33,
    "levelTarget": "B1",
    "category": "Vocabulary",
    "question": "He is very ___ and never tells lies.",
    "options": "[\"honest\", \"jealous\", \"greedy\", \"arrogant\"]",
    "correctAnswer": "honest"
  },
  {
    "orderNumber": 34,
    "levelTarget": "B1",
    "category": "Grammar",
    "question": "You ___ better hurry or you will miss the train.",
    "options": "[\"had\", \"would\", \"should\", \"did\"]",
    "correctAnswer": "had"
  },
  {
    "orderNumber": 35,
    "levelTarget": "B2",
    "category": "Grammar",
    "question": "Had I known about the party, I ___ attended.",
    "options": "[\"would have\", \"will have\", \"had\", \"would\"]",
    "correctAnswer": "would have"
  },
  {
    "orderNumber": 36,
    "levelTarget": "B2",
    "category": "Vocabulary",
    "question": "Her explanation was so ___ that everyone understood immediately.",
    "options": "[\"lucid\", \"ambiguous\", \"vague\", \"tedious\"]",
    "correctAnswer": "lucid"
  },
  {
    "orderNumber": 37,
    "levelTarget": "B2",
    "category": "Grammar",
    "question": "Rarely ___ such a spectacular performance.",
    "options": "[\"have I seen\", \"I have seen\", \"I saw\", \"saw I\"]",
    "correctAnswer": "have I seen"
  },
  {
    "orderNumber": 38,
    "levelTarget": "B2",
    "category": "Vocabulary",
    "question": "The company decided to ___ costs to remain profitable.",
    "options": "[\"curtail\", \"augment\", \"inflate\", \"multiply\"]",
    "correctAnswer": "curtail"
  },
  {
    "orderNumber": 39,
    "levelTarget": "B2",
    "category": "Reading",
    "question": "A statement that is 'redundant' is one that is:",
    "options": "[\"Unnecessarily repetitive\", \"Extremely urgent\", \"Contradictory\", \"Unproven\"]",
    "correctAnswer": "Unnecessarily repetitive"
  },
  {
    "orderNumber": 40,
    "levelTarget": "B2",
    "category": "Grammar",
    "question": "It is essential that every student ___ present on time.",
    "options": "[\"be\", \"is\", \"was\", \"are\"]",
    "correctAnswer": "be"
  }
];

async function main() {
  console.log('--- Seeding Doubled Curriculum: 15 Lessons, 300 Vocabularies, 150 Quizzes, 40 Placement Questions ---');

  // Clean existing data
  await prisma.quizAttempt.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.userVocabulary.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.listening.deleteMany();
  await prisma.grammarPoint.deleteMany();
  await prisma.vocabulary.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.placementQuestion.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin E4B',
      email: 'admin@e4b.com',
      password: adminPassword,
      role: 'ADMIN',
      level: 'B2',
      goal: 'Manage System',
      xp: 850,
      streakDays: 14,
    },
  });

  const student = await prisma.user.create({
    data: {
      name: 'Duy Phạm',
      email: 'student@e4b.com',
      password: studentPassword,
      role: 'STUDENT',
      level: 'A1',
      goal: 'Zero-foundation',
      xp: 220,
      streakDays: 5,
    },
  });

  console.log('Created Users:', { admin: admin.email, student: student.email });

  let totalVocabCount = 0;
  let totalQuizCount = 0;
  const createdVocabIds = [];

  // 2. Seed All 15 Lessons
  for (const lData of lessonsData) {
    const { vocabularies, grammarPoints, listenings, conversations, exercises, quizzes, ...lessonInfo } = lData;

    const createdLesson = await prisma.lesson.create({
      data: lessonInfo,
    });

    if (vocabularies && vocabularies.length > 0) {
      for (const v of vocabularies) {
        const createdV = await prisma.vocabulary.create({
          data: {
            ...v,
            lessonId: createdLesson.id,
            level: createdLesson.level,
          },
        });
        totalVocabCount++;
        createdVocabIds.push(createdV.id);
      }
    }

    if (grammarPoints && grammarPoints.length > 0) {
      for (const g of grammarPoints) {
        await prisma.grammarPoint.create({
          data: {
            ...g,
            lessonId: createdLesson.id,
          },
        });
      }
    }

    if (listenings && listenings.length > 0) {
      for (const l of listenings) {
        await prisma.listening.create({
          data: {
            ...l,
            lessonId: createdLesson.id,
          },
        });
      }
    }

    if (conversations && conversations.length > 0) {
      for (const c of conversations) {
        await prisma.conversation.create({
          data: {
            ...c,
            lessonId: createdLesson.id,
          },
        });
      }
    }

    if (exercises && exercises.length > 0) {
      for (const e of exercises) {
        await prisma.exercise.create({
          data: {
            ...e,
            lessonId: createdLesson.id,
          },
        });
      }
    }

    if (quizzes && quizzes.length > 0) {
      for (const q of quizzes) {
        await prisma.quizQuestion.create({
          data: {
            ...q,
            lessonId: createdLesson.id,
          },
        });
        totalQuizCount++;
      }
    }

    console.log(`  -> Lesson ${createdLesson.orderNumber}: ${createdLesson.title} (${vocabularies.length} words, ${quizzes.length} quiz questions)`);
  }

  // 3. Seed Doubled Placement Test Questions (40 questions)
  for (const q of placementQuestions) {
    await prisma.placementQuestion.create({
      data: q,
    });
  }
  console.log(`Seeded ${placementQuestions.length} Placement Questions.`);

  // 4. Seed initial student progress
  const lesson1 = await prisma.lesson.findFirst({ where: { orderNumber: 1 } });
  if (lesson1) {
    await prisma.userProgress.create({
      data: {
        userId: student.id,
        lessonId: lesson1.id,
        progress: 100,
        completed: true,
        score: 100,
        completedAt: new Date(),
      },
    });
  }

  // Seed sample student user vocabulary items
  if (createdVocabIds.length > 30) {
    for (let i = 0; i < 30; i++) {
      const vId = createdVocabIds[i];
      await prisma.userVocabulary.create({
        data: {
          userId: student.id,
          vocabularyId: vId,
          status: i < 10 ? 'MASTERED' : (i < 20 ? 'NEED_REVIEW' : 'LEARNING'),
          isFavorite: i % 2 === 0,
        },
      });
    }
  }

  console.log(`--- Seeding Complete: 15 Lessons, ${totalVocabCount} Vocabularies, ${totalQuizCount} Quiz Questions, ${placementQuestions.length} Placement Questions Loaded! ---`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
