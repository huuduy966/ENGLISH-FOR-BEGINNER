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
        "word": "Goodbye",
        "meaning": "Tạm biệt",
        "pronunciation": "/ɡʊdˈbaɪ/",
        "partOfSpeech": "interjection",
        "example": "Goodbye, see you tomorrow.",
        "exampleMeaning": "Tạm biệt, hẹn gặp lại bạn ngày mai.",
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
        "word": "Friend",
        "meaning": "Bạn bè",
        "pronunciation": "/frend/",
        "partOfSpeech": "noun",
        "example": "This is my friend, Anna.",
        "exampleMeaning": "Đây là bạn của tôi, Anna.",
        "category": "People"
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
        "exampleMeaning": "Tôi là một học sinh.",
        "category": "School"
      },
      {
        "word": "Teacher",
        "meaning": "Giáo viên",
        "pronunciation": "/ˈtiːtʃər/",
        "partOfSpeech": "noun",
        "example": "She is a good teacher.",
        "exampleMeaning": "Cô ấy là một giáo viên giỏi.",
        "category": "School"
      },
      {
        "word": "Doctor",
        "meaning": "Bác sĩ",
        "pronunciation": "/ˈdɑːktər/",
        "partOfSpeech": "noun",
        "example": "He is a doctor.",
        "exampleMeaning": "Anh ấy là một bác sĩ.",
        "category": "Jobs"
      },
      {
        "word": "Happy",
        "meaning": "Vui vẻ, hạnh phúc",
        "pronunciation": "/ˈhæpi/",
        "partOfSpeech": "adjective",
        "example": "We are very happy.",
        "exampleMeaning": "Chúng tôi rất vui vẻ.",
        "category": "Feelings"
      },
      {
        "word": "Tired",
        "meaning": "Mệt mỏi",
        "pronunciation": "/ˈtaɪərd/",
        "partOfSpeech": "adjective",
        "example": "Are you tired?",
        "exampleMeaning": "Bạn có mệt không?",
        "category": "Feelings"
      },
      {
        "word": "Ready",
        "meaning": "Sẵn sàng",
        "pronunciation": "/ˈredi/",
        "partOfSpeech": "adjective",
        "example": "I am ready to learn.",
        "exampleMeaning": "Tôi đã sẵn sàng học.",
        "category": "General"
      },
      {
        "word": "Clever",
        "meaning": "Thông minh, lanh lợi",
        "pronunciation": "/ˈklevər/",
        "partOfSpeech": "adjective",
        "example": "He is very clever.",
        "exampleMeaning": "Cậu ấy rất lanh lợi.",
        "category": "Feelings"
      },
      {
        "word": "Busy",
        "meaning": "Bận rộn",
        "pronunciation": "/ˈbɪzi/",
        "partOfSpeech": "adjective",
        "example": "Are they busy today?",
        "exampleMeaning": "Họ có bận hôm nay không?",
        "category": "General"
      }
    ],
    "grammarPoints": [
      {
        "title": "Động từ 'To Be' ở thì hiện tại đơn",
        "explanation": "Động từ To Be có 3 dạng: am, is, are tương ứng với các chủ ngữ.",
        "formula": "I + am | He/She/It + is | You/We/They + are",
        "examples": "[{\"en\": \"I am a student.\", \"vi\": \"Tôi là một học sinh.\"}, {\"en\": \"She is a doctor.\", \"vi\": \"Cô ấy là một bác sĩ.\"}, {\"en\": \"They are happy.\", \"vi\": \"Họ rất hạnh phúc.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Who are they?",
        "transcript": "Look at that picture. This is Mary. She is a teacher. And that is Tom. He is a doctor. They are very friendly.",
        "questions": "[{\"question\": \"What is Mary's job?\", \"options\": [\"Teacher\", \"Doctor\", \"Student\", \"Nurse\"], \"correctAnswer\": \"Teacher\", \"explanation\": \"Transcript: 'She is a teacher.'\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Are you ready?",
        "context": "Cuộc trò chuyện giữa hai người bạn trước giờ học.",
        "dialogue": "[{\"speaker\": \"Linda\", \"text\": \"Hi Mark, how are you today?\", \"meaning\": \"Chào Mark, hôm nay bạn thế nào?\"}, {\"speaker\": \"Mark\", \"text\": \"I am fine, thanks. But I am a little tired.\", \"meaning\": \"Mình ổn, cảm ơn. Nhưng mình hơi mệt một chút.\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Chọn từ đúng: She ___ a student.",
        "options": "[\"am\", \"is\", \"are\", \"be\"]",
        "correctAnswer": "is",
        "explanation": "Chủ ngữ She đi với is."
      },
      {
        "type": "WORD_ORDER",
        "question": "Sắp xếp: [doctor / a / He / is]",
        "options": "[\"He\", \"is\", \"a\", \"doctor\"]",
        "correctAnswer": "He is a doctor",
        "explanation": "He is a doctor = Anh ấy là bác sĩ."
      }
    ],
    "quizzes": [
      {
        "question": "I ___ Vietnamese.",
        "options": "[\"am\", \"is\", \"are\", \"be\"]",
        "correctAnswer": "am",
        "explanation": "Chủ ngữ I đi với am."
      },
      {
        "question": "They ___ ready.",
        "options": "[\"am\", \"is\", \"are\", \"be\"]",
        "correctAnswer": "are",
        "explanation": "They đi với are."
      },
      {
        "question": "He is not ___ doctor.",
        "options": "[\"a\", \"an\", \"the\", \"one\"]",
        "correctAnswer": "a",
        "explanation": "He is not a doctor."
      },
      {
        "question": "___ she your friend?",
        "options": "[\"Am\", \"Is\", \"Are\", \"Do\"]",
        "correctAnswer": "Is",
        "explanation": "Is she your friend?"
      },
      {
        "question": "We ___ happy today.",
        "options": "[\"am\", \"is\", \"are\", \"be\"]",
        "correctAnswer": "are",
        "explanation": "We đi với are."
      }
    ]
  },
  {
    "orderNumber": 3,
    "title": "Family Members",
    "description": "Học từ vựng và cách giới thiệu các thành viên trong gia đình thân yêu của bạn.",
    "level": "A1",
    "category": "Relationships",
    "durationMinutes": 18,
    "vocabularies": [
      {
        "word": "Father",
        "meaning": "Bố, cha",
        "pronunciation": "/ˈfɑːðər/",
        "partOfSpeech": "noun",
        "example": "My father is tall.",
        "exampleMeaning": "Bố tôi cao.",
        "category": "Family"
      },
      {
        "word": "Mother",
        "meaning": "Mẹ",
        "pronunciation": "/ˈmʌðər/",
        "partOfSpeech": "noun",
        "example": "My mother is kind.",
        "exampleMeaning": "Mẹ tôi rất hiền từ.",
        "category": "Family"
      },
      {
        "word": "Brother",
        "meaning": "Anh/em trai",
        "pronunciation": "/ˈbrʌðər/",
        "partOfSpeech": "noun",
        "example": "I have an older brother.",
        "exampleMeaning": "Tôi có một người anh trai.",
        "category": "Family"
      },
      {
        "word": "Sister",
        "meaning": "Chị/em gái",
        "pronunciation": "/ˈsɪstər/",
        "partOfSpeech": "noun",
        "example": "My sister is cute.",
        "exampleMeaning": "Em gái tôi rất dễ thương.",
        "category": "Family"
      },
      {
        "word": "Parents",
        "meaning": "Bố mẹ, phụ huynh",
        "pronunciation": "/ˈperənts/",
        "partOfSpeech": "noun",
        "example": "I love my parents.",
        "exampleMeaning": "Tôi yêu bố mẹ tôi.",
        "category": "Family"
      },
      {
        "word": "Grandfather",
        "meaning": "Ông",
        "pronunciation": "/ˈɡrændfɑːðər/",
        "partOfSpeech": "noun",
        "example": "My grandfather is 70.",
        "exampleMeaning": "Ông tôi 70 tuổi.",
        "category": "Family"
      },
      {
        "word": "Grandmother",
        "meaning": "Bà",
        "pronunciation": "/ˈɡrændmʌðər/",
        "partOfSpeech": "noun",
        "example": "My grandmother tells stories.",
        "exampleMeaning": "Bà tôi hay kể chuyện.",
        "category": "Family"
      },
      {
        "word": "Baby",
        "meaning": "Em bé",
        "pronunciation": "/ˈbeɪbi/",
        "partOfSpeech": "noun",
        "example": "The baby is sleeping.",
        "exampleMeaning": "Em bé đang ngủ.",
        "category": "Family"
      }
    ],
    "grammarPoints": [
      {
        "title": "Tính từ sở hữu (my, your, his, her, our, their)",
        "explanation": "Tính từ sở hữu đứng trước danh từ để chỉ sự sở hữu.",
        "formula": "[Possessive Adjective] + [Noun]",
        "examples": "[{\"en\": \"This is my mother.\", \"vi\": \"Đây là mẹ của tôi.\"}, {\"en\": \"His brother is tall.\", \"vi\": \"Anh trai của anh ấy cao.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "My Family",
        "transcript": "There are four people in my family: my father, my mother, my brother, and me.",
        "questions": "[{\"question\": \"How many people are there in the family?\", \"options\": [\"Three\", \"Four\", \"Five\", \"Six\"], \"correctAnswer\": \"Four\", \"explanation\": \"Đoạn nói: four people.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Family Photo",
        "context": "Xem ảnh gia đình.",
        "dialogue": "[{\"speaker\": \"Tom\", \"text\": \"Who is this?\", \"meaning\": \"Đây là ai vậy?\"}, {\"speaker\": \"Jenny\", \"text\": \"This is my sister Emily.\", \"meaning\": \"Đây là chị gái mình, Emily.\"}]"
      }
    ],
    "exercises": [
      {
        "type": "FILL_BLANK",
        "question": "My father and mother are my _____.",
        "options": "[\"parents\", \"friends\", \"teachers\", \"children\"]",
        "correctAnswer": "parents",
        "explanation": "Father + Mother = Parents."
      }
    ],
    "quizzes": [
      {
        "question": "Từ nào chỉ Bố mẹ?",
        "options": "[\"Family\", \"Parents\", \"Brothers\", \"Sisters\"]",
        "correctAnswer": "Parents",
        "explanation": "Parents = Bố mẹ."
      },
      {
        "question": "Sister nghĩa là gì?",
        "options": "[\"Chị/em gái\", \"Anh/em trai\", \"Mẹ\", \"Bà\"]",
        "correctAnswer": "Chị/em gái",
        "explanation": "Sister = Chị/em gái."
      },
      {
        "question": "This is ___ father. (của tôi)",
        "options": "[\"my\", \"I\", \"me\", \"mine\"]",
        "correctAnswer": "my",
        "explanation": "My father."
      },
      {
        "question": "Grandmother nghĩa là:",
        "options": "[\"Bà\", \"Ông\", \"Mẹ\", \"Dì\"]",
        "correctAnswer": "Bà",
        "explanation": "Grandmother = Bà."
      },
      {
        "question": "How many people are in ___ family?",
        "options": "[\"your\", \"you\", \"yours\", \"you are\"]",
        "correctAnswer": "your",
        "explanation": "Your family."
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
        "exampleMeaning": "Tôi có một con mèo.",
        "category": "Numbers"
      },
      {
        "word": "Ten",
        "meaning": "Số 10",
        "pronunciation": "/ten/",
        "partOfSpeech": "number",
        "example": "Ten minutes left.",
        "exampleMeaning": "Còn lại 10 phút.",
        "category": "Numbers"
      },
      {
        "word": "Twenty",
        "meaning": "Số 20",
        "pronunciation": "/ˈtwenti/",
        "partOfSpeech": "number",
        "example": "He is twenty years old.",
        "exampleMeaning": "Anh ấy 20 tuổi.",
        "category": "Numbers"
      },
      {
        "word": "Hundred",
        "meaning": "Một trăm (100)",
        "pronunciation": "/ˈhʌndrəd/",
        "partOfSpeech": "number",
        "example": "One hundred dollars.",
        "exampleMeaning": "Một trăm đô la.",
        "category": "Numbers"
      },
      {
        "word": "Clock",
        "meaning": "Đồng hồ",
        "pronunciation": "/klɑːk/",
        "partOfSpeech": "noun",
        "example": "Look at the clock.",
        "exampleMeaning": "Hãy nhìn đồng hồ.",
        "category": "Time"
      },
      {
        "word": "Minute",
        "meaning": "Phút",
        "pronunciation": "/ˈmɪnɪt/",
        "partOfSpeech": "noun",
        "example": "Wait a minute.",
        "exampleMeaning": "Chờ một phút.",
        "category": "Time"
      },
      {
        "word": "Hour",
        "meaning": "Giờ, tiếng",
        "pronunciation": "/ˈaʊər/",
        "partOfSpeech": "noun",
        "example": "One hour of study.",
        "exampleMeaning": "Một tiếng học bài.",
        "category": "Time"
      },
      {
        "word": "Morning",
        "meaning": "Buổi sáng",
        "pronunciation": "/ˈmɔːrnɪŋ/",
        "partOfSpeech": "noun",
        "example": "In the morning.",
        "exampleMeaning": "Vào buổi sáng.",
        "category": "Time"
      }
    ],
    "grammarPoints": [
      {
        "title": "Hỏi và trả lời giờ với 'What time is it?'",
        "explanation": "Cấu trúc hỏi giờ thông dụng nhất là What time is it? Trả lời bằng It is + [Giờ].",
        "formula": "What time is it? -> It is + [Giờ] o'clock.",
        "examples": "[{\"en\": \"What time is it? - It is 8 o'clock.\", \"vi\": \"Mấy giờ rồi? - 8 giờ đúng.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "What time is it?",
        "transcript": "Excuse me, what time is it now? It is seven fifteen.",
        "questions": "[{\"question\": \"What time is it?\", \"options\": [\"7:15\", \"7:30\", \"8:00\", \"7:00\"], \"correctAnswer\": \"7:15\", \"explanation\": \"Transcript: seven fifteen.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Meeting Time",
        "context": "Hẹn giờ gặp nhau.",
        "dialogue": "[{\"speaker\": \"Alex\", \"text\": \"What time do we meet?\", \"meaning\": \"Mấy giờ chúng ta gặp nhau?\"}, {\"speaker\": \"Brian\", \"text\": \"Let's meet at 9 o'clock.\", \"meaning\": \"Hãy gặp lúc 9 giờ đúng nhé.\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Câu hỏi giờ chuẩn là gì?",
        "options": "[\"What time is it?\", \"How time is it?\", \"Where time is it?\", \"Who time is it?\"]",
        "correctAnswer": "What time is it?",
        "explanation": "What time is it? là câu chuẩn."
      }
    ],
    "quizzes": [
      {
        "question": "Số 15 là:",
        "options": "[\"Fifteen\", \"Fifty\", \"Five\", \"Fifth\"]",
        "correctAnswer": "Fifteen",
        "explanation": "15 = Fifteen."
      },
      {
        "question": "Số 50 là:",
        "options": "[\"Fifty\", \"Fifteen\", \"Fivety\", \"Five\"]",
        "correctAnswer": "Fifty",
        "explanation": "50 = Fifty."
      },
      {
        "question": "It is 8 ___ (8 giờ đúng).",
        "options": "[\"o'clock\", \"clock\", \"time\", \"hour\"]",
        "correctAnswer": "o'clock",
        "explanation": "8 o'clock."
      },
      {
        "question": "Minute nghĩa là:",
        "options": "[\"Phút\", \"Giờ\", \"Giây\", \"Ngày\"]",
        "correctAnswer": "Phút",
        "explanation": "Minute = Phút."
      },
      {
        "question": "Số 12 là:",
        "options": "[\"Twelve\", \"Twenty\", \"Ten\", \"Eleven\"]",
        "correctAnswer": "Twelve",
        "explanation": "12 = Twelve."
      }
    ]
  },
  {
    "orderNumber": 5,
    "title": "Food, Drinks & Coffee Shop",
    "description": "Học cách gọi đồ ăn, thức uống, chọn kích cỡ và thanh toán tại quán cà phê.",
    "level": "A1",
    "category": "Social & Travel",
    "durationMinutes": 25,
    "vocabularies": [
      {
        "word": "Coffee",
        "meaning": "Cà phê",
        "pronunciation": "/ˈkɔːfi/",
        "partOfSpeech": "noun",
        "example": "I drink hot coffee.",
        "exampleMeaning": "Tôi uống cà phê nóng.",
        "category": "Drinks"
      },
      {
        "word": "Tea",
        "meaning": "Trà",
        "pronunciation": "/tiː/",
        "partOfSpeech": "noun",
        "example": "A cup of green tea.",
        "exampleMeaning": "Một tách trà xanh.",
        "category": "Drinks"
      },
      {
        "word": "Water",
        "meaning": "Nước lọc",
        "pronunciation": "/ˈwɔːtər/",
        "partOfSpeech": "noun",
        "example": "Drink plenty of water.",
        "exampleMeaning": "Uống nhiều nước.",
        "category": "Drinks"
      },
      {
        "word": "Apple",
        "meaning": "Quả táo",
        "pronunciation": "/ˈæpəl/",
        "partOfSpeech": "noun",
        "example": "An apple a day.",
        "exampleMeaning": "Một quả táo mỗi ngày.",
        "category": "Food"
      },
      {
        "word": "Bread",
        "meaning": "Bánh mì",
        "pronunciation": "/bred/",
        "partOfSpeech": "noun",
        "example": "Fresh bread for breakfast.",
        "exampleMeaning": "Bánh mì tươi cho bữa sáng.",
        "category": "Food"
      },
      {
        "word": "Menu",
        "meaning": "Thực đơn",
        "pronunciation": "/ˈmenjuː/",
        "partOfSpeech": "noun",
        "example": "Can I see the menu?",
        "exampleMeaning": "Cho tôi xem thực đơn nhé?",
        "category": "Restaurant"
      },
      {
        "word": "Size",
        "meaning": "Kích cỡ",
        "pronunciation": "/saɪz/",
        "partOfSpeech": "noun",
        "example": "Medium size, please.",
        "exampleMeaning": "Cỡ vừa làm ơn.",
        "category": "Restaurant"
      },
      {
        "word": "Bill",
        "meaning": "Hóa đơn",
        "pronunciation": "/bɪl/",
        "partOfSpeech": "noun",
        "example": "Can I have the bill?",
        "exampleMeaning": "Cho tôi xin hóa đơn nhé?",
        "category": "Restaurant"
      }
    ],
    "grammarPoints": [
      {
        "title": "Gọi món lịch sự với 'I would like' (I'd like)",
        "explanation": "Dùng I would like hoặc I'd like để thể hiện sự lịch thiệp khi gọi món.",
        "formula": "I'd like + a/an/some + [Món], please.",
        "examples": "[{\"en\": \"I'd like a coffee, please.\", \"vi\": \"Cho tôi một ly cà phê nhé.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "At the Cafe",
        "transcript": "Hello! I'd like an iced coffee, please. What size? Medium, please.",
        "questions": "[{\"question\": \"What drink does the customer order?\", \"options\": [\"Iced coffee\", \"Hot tea\", \"Milk\", \"Water\"], \"correctAnswer\": \"Iced coffee\", \"explanation\": \"I'd like an iced coffee.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "At Coffee Shop",
        "context": "Gọi đồ uống tại quán cà phê.",
        "dialogue": "[{\"speaker\": \"Waiter\", \"text\": \"Hello, what would you like?\", \"meaning\": \"Xin chào, bạn muốn dùng gì ạ?\"}, {\"speaker\": \"Customer\", \"text\": \"I'd like a coffee, please.\", \"meaning\": \"Cho tôi một ly cà phê nhé.\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Cách gọi món lịch sự nhất là:",
        "options": "[\"I'd like a coffee, please\", \"Give me coffee\", \"Coffee now\", \"I want coffee\"]",
        "correctAnswer": "I'd like a coffee, please",
        "explanation": "I'd like + món, please."
      }
    ],
    "quizzes": [
      {
        "question": "Bill nghĩa là:",
        "options": "[\"Hóa đơn\", \"Thực đơn\", \"Đồ uống\", \"Bàn ăn\"]",
        "correctAnswer": "Hóa đơn",
        "explanation": "Bill = Hóa đơn."
      },
      {
        "question": "Kích cỡ Medium là:",
        "options": "[\"Vừa\", \"Nhỏ\", \"Lớn\", \"Rất lớn\"]",
        "correctAnswer": "Vừa",
        "explanation": "Medium = Vừa."
      },
      {
        "question": "Apple là:",
        "options": "[\"Quả táo\", \"Quả chuối\", \"Quả cam\", \"Quả nho\"]",
        "correctAnswer": "Quả táo",
        "explanation": "Apple = Quả táo."
      },
      {
        "question": "Anything else? nghĩa là:",
        "options": "[\"Còn gì nữa không?\", \"Bao nhiêu tiền?\", \"Đi đâu đấy?\", \"Ngon không?\"]",
        "correctAnswer": "Còn gì nữa không?",
        "explanation": "Anything else? = Còn gì nữa không?"
      },
      {
        "question": "Xin hóa đơn tính tiền:",
        "options": "[\"Can I have the bill, please?\", \"Give money\", \"Bill now\", \"Table please\"]",
        "correctAnswer": "Can I have the bill, please?",
        "explanation": "Can I have the bill, please?"
      }
    ]
  },
  {
    "orderNumber": 6,
    "title": "Colors & Clothes",
    "description": "Khám phá các sắc màu cơ bản và trang phục mặc hàng ngày, cách miêu tả diện mạo bên ngoài.",
    "level": "A1",
    "category": "Daily Life",
    "durationMinutes": 18,
    "vocabularies": [
      {
        "word": "Red",
        "meaning": "Màu đỏ",
        "pronunciation": "/red/",
        "partOfSpeech": "adjective",
        "example": "She wears a red dress.",
        "exampleMeaning": "Cô ấy mặc chiếc váy đỏ.",
        "category": "Colors"
      },
      {
        "word": "Blue",
        "meaning": "Màu xanh dương",
        "pronunciation": "/bluː/",
        "partOfSpeech": "adjective",
        "example": "The clear blue sky.",
        "exampleMeaning": "Bầu trời trong xanh.",
        "category": "Colors"
      },
      {
        "word": "Green",
        "meaning": "Màu xanh lá cây",
        "pronunciation": "/ɡriːn/",
        "partOfSpeech": "adjective",
        "example": "Green leaves on the tree.",
        "exampleMeaning": "Lá xanh trên cây.",
        "category": "Colors"
      },
      {
        "word": "Yellow",
        "meaning": "Màu vàng",
        "pronunciation": "/ˈjeloʊ/",
        "partOfSpeech": "adjective",
        "example": "A bright yellow sun.",
        "exampleMeaning": "Mặt trời vàng rực rỡ.",
        "category": "Colors"
      },
      {
        "word": "Black",
        "meaning": "Màu đen",
        "pronunciation": "/blæk/",
        "partOfSpeech": "adjective",
        "example": "He wears a black jacket.",
        "exampleMeaning": "Anh ấy mặc áo khoác đen.",
        "category": "Colors"
      },
      {
        "word": "White",
        "meaning": "Màu trắng",
        "pronunciation": "/waɪt/",
        "partOfSpeech": "adjective",
        "example": "A clean white shirt.",
        "exampleMeaning": "Chiếc áo sơ mi trắng tinh.",
        "category": "Colors"
      },
      {
        "word": "Shirt",
        "meaning": "Áo sơ mi",
        "pronunciation": "/ʃɜːrt/",
        "partOfSpeech": "noun",
        "example": "Iron your shirt.",
        "exampleMeaning": "Ủi áo sơ mi của bạn.",
        "category": "Clothes"
      },
      {
        "word": "Pants",
        "meaning": "Quần dài",
        "pronunciation": "/pænts/",
        "partOfSpeech": "noun",
        "example": "These black pants look smart.",
        "exampleMeaning": "Chiếc quần đen này trông lịch sự.",
        "category": "Clothes"
      },
      {
        "word": "Shoes",
        "meaning": "Đôi giày",
        "pronunciation": "/ʃuːz/",
        "partOfSpeech": "noun",
        "example": "Put on your sports shoes.",
        "exampleMeaning": "Xỏ giày thể thao vào.",
        "category": "Clothes"
      },
      {
        "word": "Dress",
        "meaning": "Váy liền thân",
        "pronunciation": "/dres/",
        "partOfSpeech": "noun",
        "example": "A pretty floral dress.",
        "exampleMeaning": "Chiếc váy hoa xinh xắn.",
        "category": "Clothes"
      }
    ],
    "grammarPoints": [
      {
        "title": "Vị trí của tính từ chỉ màu sắc trước danh từ",
        "explanation": "Trong tiếng Anh, tính từ chỉ màu sắc luôn đứng TRƯỚC danh từ mà nó miêu tả.",
        "formula": "a/an + [Color] + [Noun] (VD: a red car, blue shoes)",
        "examples": "[{\"en\": \"She has a red dress.\", \"vi\": \"Cô ấy có một chiếc váy màu đỏ.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Choosing Clothes for the Party",
        "transcript": "What should I wear tonight? Wear your blue shirt and black pants. They look great together.",
        "questions": "[{\"question\": \"What color is the shirt?\", \"options\": [\"Blue\", \"Red\", \"White\", \"Yellow\"], \"correctAnswer\": \"Blue\", \"explanation\": \"Transcript: your blue shirt.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "At the Clothing Store",
        "context": "Mua sắm trang phục.",
        "dialogue": "[{\"speaker\": \"Customer\", \"text\": \"Do you have this shirt in white?\", \"meaning\": \"Bạn có chiếc áo này màu trắng không?\"}, {\"speaker\": \"Seller\", \"text\": \"Yes, we do. Here is a medium size.\", \"meaning\": \"Có ạ. Đây là cỡ vừa cho bạn.\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Chọn câu đúng ngữ pháp:",
        "options": "[\"A red shirt\", \"A shirt red\", \"Red a shirt\", \"Shirt a red\"]",
        "correctAnswer": "A red shirt",
        "explanation": "Tính từ đứng trước danh từ: A red shirt."
      }
    ],
    "quizzes": [
      {
        "question": "Màu đỏ là:",
        "options": "[\"Red\", \"Blue\", \"Green\", \"Black\"]",
        "correctAnswer": "Red",
        "explanation": "Red = Đỏ."
      },
      {
        "question": "Đôi giày trong tiếng Anh là:",
        "options": "[\"Shoes\", \"Shirt\", \"Pants\", \"Dress\"]",
        "correctAnswer": "Shoes",
        "explanation": "Shoes = Giày."
      },
      {
        "question": "Yellow nghĩa là:",
        "options": "[\"Màu vàng\", \"Màu xanh\", \"Màu trắng\", \"Màu đen\"]",
        "correctAnswer": "Màu vàng",
        "explanation": "Yellow = Vàng."
      },
      {
        "question": "Áo sơ mi là:",
        "options": "[\"Shirt\", \"Pants\", \"Shoes\", \"Hat\"]",
        "correctAnswer": "Shirt",
        "explanation": "Shirt = Áo sơ mi."
      },
      {
        "question": "Trắng trong tiếng Anh là:",
        "options": "[\"White\", \"Black\", \"Pink\", \"Brown\"]",
        "correctAnswer": "White",
        "explanation": "White = Trắng."
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
        "exampleMeaning": "Anh ấy là kỹ sư phần mềm.",
        "category": "Jobs"
      },
      {
        "word": "Chef",
        "meaning": "Đầu bếp",
        "pronunciation": "/ʃef/",
        "partOfSpeech": "noun",
        "example": "The chef cooks great food.",
        "exampleMeaning": "Đầu bếp nấu ăn rất ngon.",
        "category": "Jobs"
      },
      {
        "word": "Nurse",
        "meaning": "Y tá, điều dưỡng",
        "pronunciation": "/nɜːrs/",
        "partOfSpeech": "noun",
        "example": "The nurse helps the sick.",
        "exampleMeaning": "Y tá chăm sóc người bệnh.",
        "category": "Jobs"
      },
      {
        "word": "Police",
        "meaning": "Cảnh sát",
        "pronunciation": "/pəˈliːs/",
        "partOfSpeech": "noun",
        "example": "Call the police officer.",
        "exampleMeaning": "Hãy gọi cảnh sát.",
        "category": "Jobs"
      },
      {
        "word": "Driver",
        "meaning": "Tài xế, người lái xe",
        "pronunciation": "/ˈdraɪvər/",
        "partOfSpeech": "noun",
        "example": "A friendly taxi driver.",
        "exampleMeaning": "Một tài xế taxi thân thiện.",
        "category": "Jobs"
      },
      {
        "word": "Worker",
        "meaning": "Công nhân",
        "pronunciation": "/ˈwɜːrkər/",
        "partOfSpeech": "noun",
        "example": "Hard-working factory workers.",
        "exampleMeaning": "Những công nhân nhà máy chăm chỉ.",
        "category": "Jobs"
      },
      {
        "word": "Artist",
        "meaning": "Họa sĩ, nghệ sĩ",
        "pronunciation": "/ˈɑːrtɪst/",
        "partOfSpeech": "noun",
        "example": "She is an oil painting artist.",
        "exampleMeaning": "Cô ấy là một họa sĩ sơn dầu.",
        "category": "Jobs"
      },
      {
        "word": "Office",
        "meaning": "Văn phòng làm việc",
        "pronunciation": "/ˈɔːfɪs/",
        "partOfSpeech": "noun",
        "example": "I work in an office.",
        "exampleMeaning": "Tôi làm việc ở văn phòng.",
        "category": "Workplace"
      },
      {
        "word": "Hospital",
        "meaning": "Bệnh viện",
        "pronunciation": "/ˈhɑːspɪtl/",
        "partOfSpeech": "noun",
        "example": "Doctors work at a hospital.",
        "exampleMeaning": "Bác sĩ làm việc tại bệnh viện.",
        "category": "Workplace"
      },
      {
        "word": "Work",
        "meaning": "Làm việc",
        "pronunciation": "/wɜːrk/",
        "partOfSpeech": "verb",
        "example": "I work five days a week.",
        "exampleMeaning": "Tôi làm việc 5 ngày một tuần.",
        "category": "Jobs"
      }
    ],
    "grammarPoints": [
      {
        "title": "Hỏi nghề nghiệp với 'What do you do?'",
        "explanation": "Câu hỏi tiêu chuẩn về nghề nghiệp: What do you do? hoặc What is your job? Trả lời bằng I am a/an + [Nghề].",
        "formula": "What do you do? -> I am a/an + [Job].",
        "examples": "[{\"en\": \"What do you do? - I am an engineer.\", \"vi\": \"Bạn làm nghề gì? - Tôi là kỹ sư.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Career Day",
        "transcript": "Hello, my brother is an engineer and my sister is a nurse. They both love their jobs.",
        "questions": "[{\"question\": \"What is his sister's job?\", \"options\": [\"Nurse\", \"Doctor\", \"Teacher\", \"Engineer\"], \"correctAnswer\": \"Nurse\", \"explanation\": \"Transcript: my sister is a nurse.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Meeting New People",
        "context": "Hỏi về công việc của nhau.",
        "dialogue": "[{\"speaker\": \"David\", \"text\": \"What do you do, Sarah?\", \"meaning\": \"Bạn làm nghề gì vậy Sarah?\"}, {\"speaker\": \"Sarah\", \"text\": \"I am a teacher at an international school.\", \"meaning\": \"Mình là giáo viên ở một trường quốc tế.\"}]"
      }
    ],
    "exercises": [
      {
        "type": "FILL_BLANK",
        "question": "What _____ you do? - I am a driver.",
        "options": "[\"do\", \"are\", \"is\", \"have\"]",
        "correctAnswer": "do",
        "explanation": "What do you do?"
      }
    ],
    "quizzes": [
      {
        "question": "Engineer nghĩa là:",
        "options": "[\"Kỹ sư\", \"Bác sĩ\", \"Y tá\", \"Công nhân\"]",
        "correctAnswer": "Kỹ sư",
        "explanation": "Engineer = Kỹ sư."
      },
      {
        "question": "Đầu bếp là:",
        "options": "[\"Chef\", \"Driver\", \"Nurse\", \"Teacher\"]",
        "correctAnswer": "Chef",
        "explanation": "Chef = Đầu bếp."
      },
      {
        "question": "Hospital nghĩa là:",
        "options": "[\"Bệnh viện\", \"Trường học\", \"Văn phòng\", \"Khách sạn\"]",
        "correctAnswer": "Bệnh viện",
        "explanation": "Hospital = Bệnh viện."
      },
      {
        "question": "I am ___ artist. (Chọn mạo từ đúng)",
        "options": "[\"an\", \"a\", \"the\", \"one\"]",
        "correctAnswer": "an",
        "explanation": "Artist bắt đầu bằng nguyên âm A -> an artist."
      },
      {
        "question": "Câu hỏi nghề nghiệp đúng:",
        "options": "[\"What do you do?\", \"What are you do?\", \"Where do you do?\", \"Who do you do?\"]",
        "correctAnswer": "What do you do?",
        "explanation": "What do you do? = Bạn làm nghề gì?"
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
        "exampleMeaning": "Họ sống trong một ngôi nhà lớn.",
        "category": "Home"
      },
      {
        "word": "Living room",
        "meaning": "Phòng khách",
        "pronunciation": "/ˈlɪvɪŋ ruːm/",
        "partOfSpeech": "noun",
        "example": "We watch TV in the living room.",
        "exampleMeaning": "Chúng tôi xem TV ở phòng khách.",
        "category": "Home"
      },
      {
        "word": "Bedroom",
        "meaning": "Phòng ngủ",
        "pronunciation": "/ˈbedruːm/",
        "partOfSpeech": "noun",
        "example": "My bedroom has a big bed.",
        "exampleMeaning": "Phòng ngủ tôi có một chiếc giường lớn.",
        "category": "Home"
      },
      {
        "word": "Kitchen",
        "meaning": "Nhà bếp",
        "pronunciation": "/ˈkɪtʃɪn/",
        "partOfSpeech": "noun",
        "example": "Cooking in the clean kitchen.",
        "exampleMeaning": "Nấu ăn trong gian bếp sạch sẽ.",
        "category": "Home"
      },
      {
        "word": "Bathroom",
        "meaning": "Phòng tắm",
        "pronunciation": "/ˈbæθruːm/",
        "partOfSpeech": "noun",
        "example": "Wash hands in the bathroom.",
        "exampleMeaning": "Rửa tay trong phòng tắm.",
        "category": "Home"
      },
      {
        "word": "Table",
        "meaning": "Cái bàn",
        "pronunciation": "/ˈteɪbl/",
        "partOfSpeech": "noun",
        "example": "Books are on the table.",
        "exampleMeaning": "Sách ở trên bàn.",
        "category": "Furniture"
      },
      {
        "word": "Chair",
        "meaning": "Cái ghế",
        "pronunciation": "/tʃer/",
        "partOfSpeech": "noun",
        "example": "Sit on this wooden chair.",
        "exampleMeaning": "Ngồi lên chiếc ghế gỗ này.",
        "category": "Furniture"
      },
      {
        "word": "Bed",
        "meaning": "Chiếc giường",
        "pronunciation": "/bed/",
        "partOfSpeech": "noun",
        "example": "Time to go to bed.",
        "exampleMeaning": "Đến giờ đi ngủ rồi.",
        "category": "Furniture"
      },
      {
        "word": "Door",
        "meaning": "Cửa ra vào",
        "pronunciation": "/dɔːr/",
        "partOfSpeech": "noun",
        "example": "Please close the front door.",
        "exampleMeaning": "Làm ơn đóng cửa chính lại.",
        "category": "Furniture"
      },
      {
        "word": "Window",
        "meaning": "Cửa sổ",
        "pronunciation": "/ˈwɪndoʊ/",
        "partOfSpeech": "noun",
        "example": "Open the window for fresh air.",
        "exampleMeaning": "Mở cửa sổ cho thoáng khí.",
        "category": "Furniture"
      }
    ],
    "grammarPoints": [
      {
        "title": "Cấu trúc 'There is' và 'There are'",
        "explanation": "Dùng There is cho danh từ số ít hoặc không đếm được. Dùng There are cho danh từ số nhiều.",
        "formula": "There is + a/an + N (số ít) | There are + Ns (số nhiều)",
        "examples": "[{\"en\": \"There is a table in the room.\", \"vi\": \"Có một cái bàn trong phòng.\"}, {\"en\": \"There are two chairs here.\", \"vi\": \"Có hai cái ghế ở đây.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Welcome to my home",
        "transcript": "Welcome! In my house, there are three bedrooms and a lovely kitchen. Make yourself at home.",
        "questions": "[{\"question\": \"How many bedrooms are there?\", \"options\": [\"Two\", \"Three\", \"Four\", \"One\"], \"correctAnswer\": \"Three\", \"explanation\": \"Transcript: three bedrooms.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "House Tour",
        "context": "Dẫn bạn tham quan nhà mới.",
        "dialogue": "[{\"speaker\": \"Ben\", \"text\": \"Your living room is so cozy!\", \"meaning\": \"Phòng khách nhà bạn ấm cúng quá!\"}, {\"speaker\": \"Lucy\", \"text\": \"Thank you! There is a balcony outside too.\", \"meaning\": \"Cảm ơn bạn! Bên ngoài còn có ban công nữa.\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Chọn từ đúng: There ___ two chairs in the kitchen.",
        "options": "[\"is\", \"are\", \"am\", \"be\"]",
        "correctAnswer": "are",
        "explanation": "Two chairs là số nhiều -> There are."
      }
    ],
    "quizzes": [
      {
        "question": "Kitchen nghĩa là:",
        "options": "[\"Nhà bếp\", \"Phòng khách\", \"Phòng ngủ\", \"Phòng tắm\"]",
        "correctAnswer": "Nhà bếp",
        "explanation": "Kitchen = Nhà bếp."
      },
      {
        "question": "There ___ a book on the table.",
        "options": "[\"is\", \"are\", \"am\", \"be\"]",
        "correctAnswer": "is",
        "explanation": "A book số ít -> There is."
      },
      {
        "question": "Cái ghế trong tiếng Anh là:",
        "options": "[\"Chair\", \"Table\", \"Bed\", \"Door\"]",
        "correctAnswer": "Chair",
        "explanation": "Chair = Ghế."
      },
      {
        "question": "Bedroom là phòng gì?",
        "options": "[\"Phòng ngủ\", \"Phòng khách\", \"Nhà bếp\", \"Sân vườn\"]",
        "correctAnswer": "Phòng ngủ",
        "explanation": "Bedroom = Phòng ngủ."
      },
      {
        "question": "Window nghĩa là:",
        "options": "[\"Cửa sổ\", \"Cửa chính\", \"Bức tường\", \"Mái nhà\"]",
        "correctAnswer": "Cửa sổ",
        "explanation": "Window = Cửa sổ."
      }
    ]
  },
  {
    "orderNumber": 9,
    "title": "Daily Activities & Routines",
    "description": "Nói về các thói quen sinh hoạt mỗi ngày, lịch trình từ sáng đến tối và thì hiện tại đơn.",
    "level": "A1",
    "category": "Daily Life",
    "durationMinutes": 22,
    "vocabularies": [
      {
        "word": "Wake up",
        "meaning": "Thức dậy",
        "pronunciation": "/weɪk ʌp/",
        "partOfSpeech": "phrase",
        "example": "I wake up at 6 AM every day.",
        "exampleMeaning": "Tôi thức dậy lúc 6h sáng mỗi ngày.",
        "category": "Routines"
      },
      {
        "word": "Brush",
        "meaning": "Đánh, chải",
        "pronunciation": "/brʌʃ/",
        "partOfSpeech": "verb",
        "example": "Brush your teeth in the morning.",
        "exampleMeaning": "Đánh răng vào buổi sáng.",
        "category": "Routines"
      },
      {
        "word": "Breakfast",
        "meaning": "Bữa ăn sáng",
        "pronunciation": "/ˈbrekfəst/",
        "partOfSpeech": "noun",
        "example": "Eat a healthy breakfast.",
        "exampleMeaning": "Ăn bữa sáng lành mạnh.",
        "category": "Meals"
      },
      {
        "word": "Lunch",
        "meaning": "Bữa ăn trưa",
        "pronunciation": "/lʌntʃ/",
        "partOfSpeech": "noun",
        "example": "We have lunch at noon.",
        "exampleMeaning": "Chúng tôi ăn trưa lúc 12h.",
        "category": "Meals"
      },
      {
        "word": "Dinner",
        "meaning": "Bữa ăn tối",
        "pronunciation": "/ˈdɪnər/",
        "partOfSpeech": "noun",
        "example": "Family dinner at 7 PM.",
        "exampleMeaning": "Bữa tối gia đình lúc 7h tối.",
        "category": "Meals"
      },
      {
        "word": "Exercise",
        "meaning": "Tập thể dục",
        "pronunciation": "/ˈeksərsaɪz/",
        "partOfSpeech": "verb",
        "example": "I exercise thirty minutes daily.",
        "exampleMeaning": "Tôi tập thể dục 30 phút mỗi ngày.",
        "category": "Health"
      },
      {
        "word": "Read",
        "meaning": "Đọc sách",
        "pronunciation": "/riːd/",
        "partOfSpeech": "verb",
        "example": "Read books before going to sleep.",
        "exampleMeaning": "Đọc sách trước khi đi ngủ.",
        "category": "Routines"
      },
      {
        "word": "Sleep",
        "meaning": "Ngủ",
        "pronunciation": "/sliːp/",
        "partOfSpeech": "verb",
        "example": "Sleep early to stay fresh.",
        "exampleMeaning": "Ngủ sớm để tỉnh táo.",
        "category": "Routines"
      },
      {
        "word": "Shower",
        "meaning": "Tắm vòi sen",
        "pronunciation": "/ˈʃaʊər/",
        "partOfSpeech": "noun",
        "example": "Take a cold shower.",
        "exampleMeaning": "Tắm vòi sen nước mát.",
        "category": "Routines"
      },
      {
        "word": "Relax",
        "meaning": "Thư giãn",
        "pronunciation": "/rɪˈlæks/",
        "partOfSpeech": "verb",
        "example": "Listen to music to relax.",
        "exampleMeaning": "Nghe nhạc để thư giãn.",
        "category": "Routines"
      }
    ],
    "grammarPoints": [
      {
        "title": "Thì Hiện tại đơn miêu tả thói quen (Present Simple)",
        "explanation": "Dùng để diễn tả hành động lặp đi lặp lại hoặc thói quen hàng ngày. Thêm -s hoặc -es với He/She/It.",
        "formula": "I/You/We/They + V_inf | He/She/It + V_s/es",
        "examples": "[{\"en\": \"I wake up at 6 AM.\", \"vi\": \"Tôi thức dậy lúc 6 giờ sáng.\"}, {\"en\": \"He works every day.\", \"vi\": \"Anh ấy làm việc mỗi ngày.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "A Day in My Life",
        "transcript": "Every morning, I wake up at 6:30. I have breakfast and go to work by bus.",
        "questions": "[{\"question\": \"What time does he wake up?\", \"options\": [\"6:00\", \"6:30\", \"7:00\", \"7:30\"], \"correctAnswer\": \"6:30\", \"explanation\": \"Transcript: 6:30.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Daily Routine",
        "context": "Trao đổi thói quen hàng ngày.",
        "dialogue": "[{\"speaker\": \"Emma\", \"text\": \"What time do you usually sleep?\", \"meaning\": \"Cậu thường đi ngủ lúc mấy giờ?\"}, {\"speaker\": \"John\", \"text\": \"I usually sleep at 10:30 PM.\", \"meaning\": \"Mình thường ngủ lúc 10h30 tối.\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Chọn dạng động từ đúng: She ___ up early every day.",
        "options": "[\"wake\", \"wakes\", \"waking\", \"waked\"]",
        "correctAnswer": "wakes",
        "explanation": "Chủ ngữ She -> động từ thêm s: wakes up."
      }
    ],
    "quizzes": [
      {
        "question": "Breakfast là bữa ăn nào?",
        "options": "[\"Bữa sáng\", \"Bữa trưa\", \"Bữa tối\", \"Bữa đêm\"]",
        "correctAnswer": "Bữa sáng",
        "explanation": "Breakfast = Bữa sáng."
      },
      {
        "question": "He ___ to work by bus.",
        "options": "[\"go\", \"goes\", \"going\", \"gone\"]",
        "correctAnswer": "goes",
        "explanation": "He goes to work."
      },
      {
        "question": "Dinner là bữa ăn nào?",
        "options": "[\"Bữa tối\", \"Bữa sáng\", \"Bữa trưa\", \"Bữa xế\"]",
        "correctAnswer": "Bữa tối",
        "explanation": "Dinner = Bữa tối."
      },
      {
        "question": "Exercise nghĩa là:",
        "options": "[\"Tập thể dục\", \"Ăn cơm\", \"Đi ngủ\", \"Đọc sách\"]",
        "correctAnswer": "Tập thể dục",
        "explanation": "Exercise = Tập thể dục."
      },
      {
        "question": "Wake up có nghĩa là:",
        "options": "[\"Thức dậy\", \"Đi ngủ\", \"Ăn uống\", \"Tắm rửa\"]",
        "correctAnswer": "Thức dậy",
        "explanation": "Wake up = Thức dậy."
      }
    ]
  },
  {
    "orderNumber": 10,
    "title": "Shopping & Prices",
    "description": "Cách hỏi giá cả, mặc cả lịch sự, thanh toán tiền mặt/thẻ và từ vựng mua sắm thiết yếu.",
    "level": "A1",
    "category": "Shopping",
    "durationMinutes": 22,
    "vocabularies": [
      {
        "word": "Buy",
        "meaning": "Mua",
        "pronunciation": "/baɪ/",
        "partOfSpeech": "verb",
        "example": "I want to buy some fruits.",
        "exampleMeaning": "Tôi muốn mua một ít trái cây.",
        "category": "Shopping"
      },
      {
        "word": "Sell",
        "meaning": "Bán",
        "pronunciation": "/sel/",
        "partOfSpeech": "verb",
        "example": "They sell fresh bread.",
        "exampleMeaning": "Họ bán bánh mì tươi.",
        "category": "Shopping"
      },
      {
        "word": "Price",
        "meaning": "Giá tiền",
        "pronunciation": "/praɪs/",
        "partOfSpeech": "noun",
        "example": "What is the price of this?",
        "exampleMeaning": "Giá của món này là bao nhiêu?",
        "category": "Shopping"
      },
      {
        "word": "Cheap",
        "meaning": "Rẻ tiền",
        "pronunciation": "/tʃiːp/",
        "partOfSpeech": "adjective",
        "example": "This shirt is very cheap.",
        "exampleMeaning": "Chiếc áo này rất rẻ.",
        "category": "Shopping"
      },
      {
        "word": "Expensive",
        "meaning": "Đắt tiền",
        "pronunciation": "/ɪkˈspensɪv/",
        "partOfSpeech": "adjective",
        "example": "That watch is too expensive.",
        "exampleMeaning": "Chiếc đồng hồ đó đắt quá.",
        "category": "Shopping"
      },
      {
        "word": "Dollar",
        "meaning": "Đồng đô la",
        "pronunciation": "/ˈdɑːlər/",
        "partOfSpeech": "noun",
        "example": "It costs ten dollars.",
        "exampleMeaning": "Nó có giá 10 đô la.",
        "category": "Money"
      },
      {
        "word": "Cash",
        "meaning": "Tiền mặt",
        "pronunciation": "/kæʃ/",
        "partOfSpeech": "noun",
        "example": "Do you accept cash?",
        "exampleMeaning": "Bạn có nhận tiền mặt không?",
        "category": "Money"
      },
      {
        "word": "Card",
        "meaning": "Thẻ ngân hàng",
        "pronunciation": "/kɑːrd/",
        "partOfSpeech": "noun",
        "example": "I will pay by credit card.",
        "exampleMeaning": "Tôi sẽ thanh toán bằng thẻ.",
        "category": "Money"
      },
      {
        "word": "Discount",
        "meaning": "Giảm giá",
        "pronunciation": "/ˈdɪskaʊnt/",
        "partOfSpeech": "noun",
        "example": "Is there any discount today?",
        "exampleMeaning": "Hôm nay có giảm giá không?",
        "category": "Shopping"
      },
      {
        "word": "Market",
        "meaning": "Chợ, siêu thị",
        "pronunciation": "/ˈmɑːrkɪt/",
        "partOfSpeech": "noun",
        "example": "Go to the supermarket.",
        "exampleMeaning": "Đi siêu thị mua sắm.",
        "category": "Shopping"
      }
    ],
    "grammarPoints": [
      {
        "title": "Hỏi giá tiền với 'How much is / How much are...?'",
        "explanation": "Dùng How much is it? hoặc How much are these shoes? để hỏi giá.",
        "formula": "How much is + [Danh từ số ít]? | How much are + [Danh từ số nhiều]?",
        "examples": "[{\"en\": \"How much is this shirt? - It is 15 dollars.\", \"vi\": \"Chiếc áo này giá bao nhiêu? - 15 đô la.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "At the Market",
        "transcript": "Excuse me, how much are these apples? They are three dollars a kilo. Great, give me two kilos.",
        "questions": "[{\"question\": \"How much are the apples per kilo?\", \"options\": [\"Two dollars\", \"Three dollars\", \"Four dollars\", \"Five dollars\"], \"correctAnswer\": \"Three dollars\", \"explanation\": \"Transcript: three dollars a kilo.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Paying for Items",
        "context": "Thanh toán tại quầy tính tiền.",
        "dialogue": "[{\"speaker\": \"Cashier\", \"text\": \"Your total is twenty dollars.\", \"meaning\": \"Tổng cộng của bạn là 20 đô la.\"}, {\"speaker\": \"Customer\", \"text\": \"Can I pay by card?\", \"meaning\": \"Tôi quẹt thẻ được không ạ?\"}]"
      }
    ],
    "exercises": [
      {
        "type": "FILL_BLANK",
        "question": "How _____ is this book?",
        "options": "[\"much\", \"many\", \"price\", \"cost\"]",
        "correctAnswer": "much",
        "explanation": "How much is this book? (Hỏi giá tiền)."
      }
    ],
    "quizzes": [
      {
        "question": "Expensive nghĩa là:",
        "options": "[\"Đắt đỏ\", \"Rẻ tiền\", \"Miễn phí\", \"Giảm giá\"]",
        "correctAnswer": "Đắt đỏ",
        "explanation": "Expensive = Đắt tiền."
      },
      {
        "question": "Cheap nghĩa là:",
        "options": "[\"Rẻ tiền\", \"Đắt tiền\", \"Cũ kỹ\", \"Mới toanh\"]",
        "correctAnswer": "Rẻ tiền",
        "explanation": "Cheap = Rẻ."
      },
      {
        "question": "Cash là hình thức thanh toán nào?",
        "options": "[\"Tiền mặt\", \"Thẻ tín dụng\", \"Chuyển khoản\", \"Ví điện tử\"]",
        "correctAnswer": "Tiền mặt",
        "explanation": "Cash = Tiền mặt."
      },
      {
        "question": "Discount nghĩa là:",
        "options": "[\"Giảm giá\", \"Tăng giá\", \"Hết hàng\", \"Hóa đơn\"]",
        "correctAnswer": "Giảm giá",
        "explanation": "Discount = Giảm giá."
      },
      {
        "question": "Câu hỏi giá tiền đúng:",
        "options": "[\"How much is this?\", \"How many is this?\", \"How price is this?\", \"What much is this?\"]",
        "correctAnswer": "How much is this?",
        "explanation": "How much is this? = Món này giá bao nhiêu?"
      }
    ]
  },
  {
    "orderNumber": 11,
    "title": "Weather & Seasons",
    "description": "Từ vựng miêu tả các kiểu thời tiết, bốn mùa trong năm và cách hỏi thăm thời tiết hàng ngày.",
    "level": "A1",
    "category": "Nature & Weather",
    "durationMinutes": 18,
    "vocabularies": [
      {
        "word": "Sunny",
        "meaning": "Có nắng, trời nắng",
        "pronunciation": "/ˈsʌni/",
        "partOfSpeech": "adjective",
        "example": "It is a sunny morning.",
        "exampleMeaning": "Buổi sáng trời nắng đẹp.",
        "category": "Weather"
      },
      {
        "word": "Rainy",
        "meaning": "Có mưa, trời mưa",
        "pronunciation": "/ˈreɪni/",
        "partOfSpeech": "adjective",
        "example": "Carry an umbrella on rainy days.",
        "exampleMeaning": "Mang ô vào những ngày mưa.",
        "category": "Weather"
      },
      {
        "word": "Windy",
        "meaning": "Có gió, lộng gió",
        "pronunciation": "/ˈwɪndi/",
        "partOfSpeech": "adjective",
        "example": "It is very windy near the sea.",
        "exampleMeaning": "Gần biển rất lộng gió.",
        "category": "Weather"
      },
      {
        "word": "Cloudy",
        "meaning": "Nhiều mây, u ám",
        "pronunciation": "/ˈklaʊdi/",
        "partOfSpeech": "adjective",
        "example": "The sky is dark and cloudy.",
        "exampleMeaning": "Bầu trời tối và nhiều mây.",
        "category": "Weather"
      },
      {
        "word": "Hot",
        "meaning": "Nóng bức",
        "pronunciation": "/hɑːt/",
        "partOfSpeech": "adjective",
        "example": "Summer days are hot.",
        "exampleMeaning": "Những ngày hè nóng bức.",
        "category": "Weather"
      },
      {
        "word": "Cold",
        "meaning": "Lạnh giá",
        "pronunciation": "/koʊld/",
        "partOfSpeech": "adjective",
        "example": "It is cold in winter.",
        "exampleMeaning": "Trời lạnh vào mùa đông.",
        "category": "Weather"
      },
      {
        "word": "Spring",
        "meaning": "Mùa xuân",
        "pronunciation": "/sprɪŋ/",
        "partOfSpeech": "noun",
        "example": "Flowers bloom in spring.",
        "exampleMeaning": "Hoa nở rộ vào mùa xuân.",
        "category": "Seasons"
      },
      {
        "word": "Summer",
        "meaning": "Mùa hè",
        "pronunciation": "/ˈsʌmər/",
        "partOfSpeech": "noun",
        "example": "We go to the beach in summer.",
        "exampleMeaning": "Chúng tôi đi biển vào mùa hè.",
        "category": "Seasons"
      },
      {
        "word": "Autumn",
        "meaning": "Mùa thu",
        "pronunciation": "/ˈɔːtəm/",
        "partOfSpeech": "noun",
        "example": "Cool breeze in autumn.",
        "exampleMeaning": "Gió mát lành vào mùa thu.",
        "category": "Seasons"
      },
      {
        "word": "Winter",
        "meaning": "Mùa đông",
        "pronunciation": "/ˈwɪntər/",
        "partOfSpeech": "noun",
        "example": "Snow falls in cold winter.",
        "exampleMeaning": "Tuyết rơi vào mùa đông lạnh giá.",
        "category": "Seasons"
      }
    ],
    "grammarPoints": [
      {
        "title": "Hỏi thời tiết với 'How is the weather?'",
        "explanation": "Dùng How is the weather today? hoặc What's the weather like? Trả lời bằng It is + [Thời tiết].",
        "formula": "How is the weather? -> It is + [Sunny / Rainy / Hot...]",
        "examples": "[{\"en\": \"How is the weather today? - It is sunny and warm.\", \"vi\": \"Hôm nay thời tiết thế nào? - Trời nắng và ấm áp.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Weather Forecast",
        "transcript": "Good morning. Today will be sunny and hot with temperatures around 32 degrees.",
        "questions": "[{\"question\": \"How is the weather today?\", \"options\": [\"Sunny and hot\", \"Rainy and cold\", \"Snowy\", \"Windy\"], \"correctAnswer\": \"Sunny and hot\", \"explanation\": \"Transcript: sunny and hot.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Talking About Weather",
        "context": "Nói chuyện trước khi ra ngoài.",
        "dialogue": "[{\"speaker\": \"Mike\", \"text\": \"Is it raining outside?\", \"meaning\": \"Ngoài trời có đang mưa không?\"}, {\"speaker\": \"Anna\", \"text\": \"No, it is windy and cool.\", \"meaning\": \"Không, trời đang nhiều gió và mát mẻ.\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Hôm nay trời nắng: It is ___ today.",
        "options": "[\"sunny\", \"sun\", \"sunned\", \"sunning\"]",
        "correctAnswer": "sunny",
        "explanation": "It is sunny today."
      }
    ],
    "quizzes": [
      {
        "question": "Sunny nghĩa là:",
        "options": "[\"Có nắng\", \"Có mưa\", \"Có tuyết\", \"Có sương mù\"]",
        "correctAnswer": "Có nắng",
        "explanation": "Sunny = Trời nắng."
      },
      {
        "question": "Mùa hè là:",
        "options": "[\"Summer\", \"Winter\", \"Spring\", \"Autumn\"]",
        "correctAnswer": "Summer",
        "explanation": "Summer = Mùa hè."
      },
      {
        "question": "Winter là mùa nào?",
        "options": "[\"Mùa đông\", \"Mùa xuân\", \"Mùa hạ\", \"Mùa thu\"]",
        "correctAnswer": "Mùa đông",
        "explanation": "Winter = Mùa đông."
      },
      {
        "question": "Rainy nghĩa là:",
        "options": "[\"Có mưa\", \"Có gió\", \"Trời nóng\", \"Trời lạnh\"]",
        "correctAnswer": "Có mưa",
        "explanation": "Rainy = Có mưa."
      },
      {
        "question": "Hỏi thời tiết chuẩn:",
        "options": "[\"How is the weather today?\", \"What weather is today?\", \"Where is weather?\", \"Who is weather?\"]",
        "correctAnswer": "How is the weather today?",
        "explanation": "How is the weather today?"
      }
    ]
  },
  {
    "orderNumber": 12,
    "title": "Transportation & Directions",
    "description": "Các phương tiện giao thông phổ biến, cách hỏi đường và hướng dẫn chỉ đường rẽ trái, rẽ phải, đi thẳng.",
    "level": "A1",
    "category": "Travel",
    "durationMinutes": 22,
    "vocabularies": [
      {
        "word": "Bus",
        "meaning": "Xe buýt",
        "pronunciation": "/bʌs/",
        "partOfSpeech": "noun",
        "example": "Take the number 9 bus.",
        "exampleMeaning": "Bắt chuyến xe buýt số 9.",
        "category": "Transportation"
      },
      {
        "word": "Train",
        "meaning": "Tàu hỏa",
        "pronunciation": "/treɪn/",
        "partOfSpeech": "noun",
        "example": "The train leaves at 8 AM.",
        "exampleMeaning": "Tàu hỏa khởi hành lúc 8h sáng.",
        "category": "Transportation"
      },
      {
        "word": "Car",
        "meaning": "Xe hơi, ô tô",
        "pronunciation": "/kɑːr/",
        "partOfSpeech": "noun",
        "example": "He drives a blue car.",
        "exampleMeaning": "Anh ấy lái chiếc xe hơi màu xanh.",
        "category": "Transportation"
      },
      {
        "word": "Bicycle",
        "meaning": "Xe đạp",
        "pronunciation": "/ˈbaɪsɪkl/",
        "partOfSpeech": "noun",
        "example": "Riding a bicycle in the park.",
        "exampleMeaning": "Đạp xe trong công viên.",
        "category": "Transportation"
      },
      {
        "word": "Airport",
        "meaning": "Sân bay",
        "pronunciation": "/ˈerpɔːrt/",
        "partOfSpeech": "noun",
        "example": "Arrive at the airport early.",
        "exampleMeaning": "Đến sân bay sớm.",
        "category": "Places"
      },
      {
        "word": "Station",
        "meaning": "Nhà ga, trạm xe",
        "pronunciation": "/ˈsteɪʃn/",
        "partOfSpeech": "noun",
        "example": "Meet me at the train station.",
        "exampleMeaning": "Gặp mình ở nhà ga nhé.",
        "category": "Places"
      },
      {
        "word": "Left",
        "meaning": "Bên trái, rẽ trái",
        "pronunciation": "/left/",
        "partOfSpeech": "noun",
        "example": "Turn left at the corner.",
        "exampleMeaning": "Rẽ trái ở góc phố.",
        "category": "Directions"
      },
      {
        "word": "Right",
        "meaning": "Bên phải, rẽ phải",
        "pronunciation": "/raɪt/",
        "partOfSpeech": "noun",
        "example": "Turn right at the traffic lights.",
        "exampleMeaning": "Rẽ phải ở cột đèn giao thông.",
        "category": "Directions"
      },
      {
        "word": "Straight",
        "meaning": "Thẳng, đi thẳng",
        "pronunciation": "/streɪt/",
        "partOfSpeech": "adverb",
        "example": "Go straight on this street.",
        "exampleMeaning": "Đi thẳng trên con đường này.",
        "category": "Directions"
      },
      {
        "word": "Near",
        "meaning": "Gần, ở gần",
        "pronunciation": "/nɪr/",
        "partOfSpeech": "preposition",
        "example": "The pharmacy is near the bank.",
        "exampleMeaning": "Hiệu thuốc ở gần ngân hàng.",
        "category": "Directions"
      }
    ],
    "grammarPoints": [
      {
        "title": "Hỏi đường với 'Where is...?' & 'How do I get to...?'",
        "explanation": "Dùng Excuse me, where is the station? hoặc How do I get to the airport? Trả lời bằng các câu mệnh lệnh chỉ hướng.",
        "formula": "Where is + [Địa điểm]? -> Go straight, then turn left/right.",
        "examples": "[{\"en\": \"Where is the bus stop? - Turn right, it is near the park.\", \"vi\": \"Trạm xe buýt ở đâu? - Rẽ phải, nó ở gần công viên.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Finding the Train Station",
        "transcript": "Excuse me, where is the train station? Go straight for two hundred meters and turn left.",
        "questions": "[{\"question\": \"Which way should the person turn?\", \"options\": [\"Turn left\", \"Turn right\", \"Go back\", \"Stop\"], \"correctAnswer\": \"Turn left\", \"explanation\": \"Transcript: turn left.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Asking for Directions",
        "context": "Hỏi đường người dân trên phố.",
        "dialogue": "[{\"speaker\": \"Tourist\", \"text\": \"Excuse me, how do I get to the museum?\", \"meaning\": \"Xin lỗi, làm sao để đi tới bảo tàng ạ?\"}, {\"speaker\": \"Local\", \"text\": \"Go straight and turn right at the bank.\", \"meaning\": \"Bạn đi thẳng rồi rẽ phải ở ngân hàng nhé.\"}]"
      }
    ],
    "exercises": [
      {
        "type": "FILL_BLANK",
        "question": "Go _____ on this street and turn left.",
        "options": "[\"straight\", \"right\", \"left\", \"back\"]",
        "correctAnswer": "straight",
        "explanation": "Go straight = Đi thẳng."
      }
    ],
    "quizzes": [
      {
        "question": "Turn left nghĩa là:",
        "options": "[\"Rẽ trái\", \"Rẽ phải\", \"Đi thẳng\", \"Quay đầu\"]",
        "correctAnswer": "Rẽ trái",
        "explanation": "Turn left = Rẽ trái."
      },
      {
        "question": "Airport là nơi nào?",
        "options": "[\"Sân bay\", \"Nhà ga\", \"Bến xe\", \"Bến cảng\"]",
        "correctAnswer": "Sân bay",
        "explanation": "Airport = Sân bay."
      },
      {
        "question": "Turn right nghĩa là:",
        "options": "[\"Rẽ phải\", \"Rẽ trái\", \"Đi thẳng\", \"Đứng lại\"]",
        "correctAnswer": "Rẽ phải",
        "explanation": "Turn right = Rẽ phải."
      },
      {
        "question": "Train nghĩa là:",
        "options": "[\"Tàu hỏa\", \"Xe buýt\", \"Xe đạp\", \"Máy bay\"]",
        "correctAnswer": "Tàu hỏa",
        "explanation": "Train = Tàu hỏa."
      },
      {
        "question": "Near nghĩa là:",
        "options": "[\"Gần\", \"Xa\", \"Bên trên\", \"Bên dưới\"]",
        "correctAnswer": "Gần",
        "explanation": "Near = Ở gần."
      }
    ]
  },
  {
    "orderNumber": 13,
    "title": "Travel & Vacations",
    "description": "Lên kế hoạch du lịch, đặt phòng khách sạn, làm thủ tục vé và diễn đạt kế hoạch tương lai.",
    "level": "A2",
    "category": "Travel",
    "durationMinutes": 25,
    "vocabularies": [
      {
        "word": "Hotel",
        "meaning": "Khách sạn",
        "pronunciation": "/hoʊˈtel/",
        "partOfSpeech": "noun",
        "example": "Stay at a comfortable hotel.",
        "exampleMeaning": "Ở tại khách sạn tiện nghi.",
        "category": "Travel"
      },
      {
        "word": "Ticket",
        "meaning": "Vé đi lại, vé máy bay",
        "pronunciation": "/ˈtɪkɪt/",
        "partOfSpeech": "noun",
        "example": "Book an airplane ticket.",
        "exampleMeaning": "Đặt một tấm vé máy bay.",
        "category": "Travel"
      },
      {
        "word": "Passport",
        "meaning": "Hộ chiếu",
        "pronunciation": "/ˈpæspɔːrt/",
        "partOfSpeech": "noun",
        "example": "Keep your passport safe.",
        "exampleMeaning": "Giữ hộ chiếu cẩn thận.",
        "category": "Travel"
      },
      {
        "word": "Beach",
        "meaning": "Bãi biển",
        "pronunciation": "/biːtʃ/",
        "partOfSpeech": "noun",
        "example": "Walking along the sunny beach.",
        "exampleMeaning": "Dạo bước trên bãi biển đầy nắng.",
        "category": "Vacation"
      },
      {
        "word": "Mountain",
        "meaning": "Ngọn núi",
        "pronunciation": "/ˈmaʊntn/",
        "partOfSpeech": "noun",
        "example": "Hike in the mountains.",
        "exampleMeaning": "Leo núi ngắm cảnh.",
        "category": "Vacation"
      },
      {
        "word": "Luggage",
        "meaning": "Hành lý",
        "pronunciation": "/ˈlʌɡɪdʒ/",
        "partOfSpeech": "noun",
        "example": "Pick up your luggage at baggage claim.",
        "exampleMeaning": "Nhận hành lý tại quầy nhận đồ.",
        "category": "Travel"
      },
      {
        "word": "Map",
        "meaning": "Bản đồ",
        "pronunciation": "/mæp/",
        "partOfSpeech": "noun",
        "example": "Check the tourist map.",
        "exampleMeaning": "Kiểm tra bản đồ du lịch.",
        "category": "Travel"
      },
      {
        "word": "Tour",
        "meaning": "Chuyến tham quan",
        "pronunciation": "/tʊr/",
        "partOfSpeech": "noun",
        "example": "Take a guided city tour.",
        "exampleMeaning": "Tham gia tour ngắm thành phố.",
        "category": "Travel"
      },
      {
        "word": "Visit",
        "meaning": "Thăm quan, ghé thăm",
        "pronunciation": "/ˈvɪzɪt/",
        "partOfSpeech": "verb",
        "example": "Visit ancient temples.",
        "exampleMeaning": "Thăm những ngôi chùa cổ.",
        "category": "Travel"
      },
      {
        "word": "Vacation",
        "meaning": "Kỳ nghỉ hè, chuyến du lịch",
        "pronunciation": "/veɪˈkeɪʃn/",
        "partOfSpeech": "noun",
        "example": "Enjoy your beach vacation.",
        "exampleMeaning": "Tận hưởng kỳ nghỉ biển.",
        "category": "Vacation"
      }
    ],
    "grammarPoints": [
      {
        "title": "Diễn đạt kế hoạch với 'Be going to'",
        "explanation": "Dùng be going to + V_inf để nói về kế hoạch hay dự định đã được chuẩn bị từ trước.",
        "formula": "S + am/is/are + going to + V_inf",
        "examples": "[{\"en\": \"I am going to visit Da Nang next week.\", \"vi\": \"Tôi dự định sẽ đi thăm Đà Nẵng tuần tới.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Summer Holiday Plans",
        "transcript": "Next week, our family is going to visit the beach. We will stay at a hotel for four days.",
        "questions": "[{\"question\": \"Where are they going to visit?\", \"options\": [\"The beach\", \"The mountain\", \"The museum\", \"The zoo\"], \"correctAnswer\": \"The beach\", \"explanation\": \"Transcript: visit the beach.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Hotel Check-in",
        "context": "Nhận phòng tại khách sạn.",
        "dialogue": "[{\"speaker\": \"Receptionist\", \"text\": \"Welcome to Sunrise Hotel. Do you have a reservation?\", \"meaning\": \"Chào mừng bạn đến Sunrise Hotel. Bạn có đặt trước chưa ạ?\"}, {\"speaker\": \"Guest\", \"text\": \"Yes, my name is Alex. Here is my passport.\", \"meaning\": \"Có, tên tôi là Alex. Hộ chiếu của tôi đây ạ.\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "I ___ going to travel to Japan.",
        "options": "[\"am\", \"is\", \"are\", \"be\"]",
        "correctAnswer": "am",
        "explanation": "I am going to."
      }
    ],
    "quizzes": [
      {
        "question": "Passport nghĩa là:",
        "options": "[\"Hộ chiếu\", \"Vé máy bay\", \"Hành lý\", \"Bản đồ\"]",
        "correctAnswer": "Hộ chiếu",
        "explanation": "Passport = Hộ chiếu."
      },
      {
        "question": "Khách sạn là:",
        "options": "[\"Hotel\", \"Hospital\", \"Restaurant\", \"School\"]",
        "correctAnswer": "Hotel",
        "explanation": "Hotel = Khách sạn."
      },
      {
        "question": "Luggage nghĩa là:",
        "options": "[\"Hành lý\", \"Vé tàu\", \"Bản đồ\", \"Phòng ngủ\"]",
        "correctAnswer": "Hành lý",
        "explanation": "Luggage = Hành lý."
      },
      {
        "question": "Beach là:",
        "options": "[\"Bãi biển\", \"Ngọn núi\", \"Rừng rậm\", \"Dòng sông\"]",
        "correctAnswer": "Bãi biển",
        "explanation": "Beach = Bãi biển."
      },
      {
        "question": "They ___ going to visit London.",
        "options": "[\"are\", \"is\", \"am\", \"be\"]",
        "correctAnswer": "are",
        "explanation": "They are going to."
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
        "exampleMeaning": "Đội mũ bảo hiểm lên đầu.",
        "category": "Body"
      },
      {
        "word": "Eye",
        "meaning": "Mắt",
        "pronunciation": "/aɪ/",
        "partOfSpeech": "noun",
        "example": "She has bright brown eyes.",
        "exampleMeaning": "Cô ấy có đôi mắt nâu sáng.",
        "category": "Body"
      },
      {
        "word": "Ear",
        "meaning": "Tai",
        "pronunciation": "/ɪr/",
        "partOfSpeech": "noun",
        "example": "Listen with your ears.",
        "exampleMeaning": "Lắng nghe bằng đôi tai.",
        "category": "Body"
      },
      {
        "word": "Hand",
        "meaning": "Bàn tay",
        "pronunciation": "/hænd/",
        "partOfSpeech": "noun",
        "example": "Wash your hands with soap.",
        "exampleMeaning": "Rửa tay bằng xà phòng.",
        "category": "Body"
      },
      {
        "word": "Leg",
        "meaning": "Chân",
        "pronunciation": "/leɡ/",
        "partOfSpeech": "noun",
        "example": "Running strengthens your legs.",
        "exampleMeaning": "Chạy bộ giúp chân khỏe mạnh.",
        "category": "Body"
      },
      {
        "word": "Healthy",
        "meaning": "Khỏe mạnh",
        "pronunciation": "/ˈhelθi/",
        "partOfSpeech": "adjective",
        "example": "Eat fresh vegetables to be healthy.",
        "exampleMeaning": "Ăn rau tươi để khỏe mạnh.",
        "category": "Health"
      },
      {
        "word": "Sick",
        "meaning": "Ốm, bệnh",
        "pronunciation": "/sɪk/",
        "partOfSpeech": "adjective",
        "example": "He feels sick today.",
        "exampleMeaning": "Hôm nay anh ấy cảm thấy ốm.",
        "category": "Health"
      },
      {
        "word": "Medicine",
        "meaning": "Thuốc chữa bệnh",
        "pronunciation": "/ˈmedɪsn/",
        "partOfSpeech": "noun",
        "example": "Take this medicine after meals.",
        "exampleMeaning": "Uống thuốc này sau bữa ăn.",
        "category": "Health"
      },
      {
        "word": "Rest",
        "meaning": "Nghỉ ngơi",
        "pronunciation": "/rest/",
        "partOfSpeech": "verb",
        "example": "You need to rest in bed.",
        "exampleMeaning": "Bạn cần nghỉ ngơi trên giường.",
        "category": "Health"
      },
      {
        "word": "Pain",
        "meaning": "Cơn đau, nỗi đau",
        "pronunciation": "/peɪn/",
        "partOfSpeech": "noun",
        "example": "Do you feel any pain in your back?",
        "exampleMeaning": "Bạn có đau ở lưng không?",
        "category": "Health"
      }
    ],
    "grammarPoints": [
      {
        "title": "Đưa ra lời khuyên sức khỏe với 'Should' / 'Shouldn't'",
        "explanation": "Dùng Should + V (nên) hoặc Shouldn't + V (không nên) để khuyên ai đó về sức khỏe.",
        "formula": "S + should / shouldn't + V_inf",
        "examples": "[{\"en\": \"You should drink plenty of water and rest.\", \"vi\": \"Bạn nên uống nhiều nước và nghỉ ngơi.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Doctor's Advice",
        "transcript": "Hello Tom. You have a cold. You should take this medicine and rest at home for two days.",
        "questions": "[{\"question\": \"What should Tom do?\", \"options\": [\"Rest at home\", \"Go swimming\", \"Play football\", \"Work overtime\"], \"correctAnswer\": \"Rest at home\", \"explanation\": \"Transcript: rest at home.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "Feeling Unwell",
        "context": "Hỏi thăm khi bạn bị ốm.",
        "dialogue": "[{\"speaker\": \"Lisa\", \"text\": \"Are you okay? You look tired.\", \"meaning\": \"Bạn ổn không? Trông bạn mệt mỏi quá.\"}, {\"speaker\": \"Mark\", \"text\": \"I have a headache. I should go home and rest.\", \"meaning\": \"Mình bị đau đầu. Mình nên về nhà nghỉ ngơi.\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Khi ai đó bị ốm, bạn nên khuyên: You ___ see a doctor.",
        "options": "[\"should\", \"shouldn't\", \"are\", \"do\"]",
        "correctAnswer": "should",
        "explanation": "You should see a doctor."
      }
    ],
    "quizzes": [
      {
        "question": "Healthy nghĩa là:",
        "options": "[\"Khỏe mạnh\", \"Ốm yếu\", \"Mệt mỏi\", \"Buồn bã\"]",
        "correctAnswer": "Khỏe mạnh",
        "explanation": "Healthy = Khỏe mạnh."
      },
      {
        "question": "Hand là bộ phận nào?",
        "options": "[\"Bàn tay\", \"Bàn chân\", \"Cái đầu\", \"Đôi mắt\"]",
        "correctAnswer": "Bàn tay",
        "explanation": "Hand = Bàn tay."
      },
      {
        "question": "Medicine nghĩa là:",
        "options": "[\"Thuốc\", \"Thức ăn\", \"Nước uống\", \"Giường ngủ\"]",
        "correctAnswer": "Thuốc",
        "explanation": "Medicine = Thuốc."
      },
      {
        "question": "You ___ eat too much junk food.",
        "options": "[\"shouldn't\", \"should\", \"must\", \"can\"]",
        "correctAnswer": "shouldn't",
        "explanation": "You shouldn't eat junk food."
      },
      {
        "question": "Eye nghĩa là:",
        "options": "[\"Đôi mắt\", \"Cái tai\", \"Cái mũi\", \"Cái miệng\"]",
        "correctAnswer": "Đôi mắt",
        "explanation": "Eye = Mắt."
      }
    ]
  },
  {
    "orderNumber": 15,
    "title": "Hobbies & Free Time",
    "description": "Nói về sở thích, các hoạt động giải trí lúc rảnh rỗi và diễn đạt tình yêu thích trong giao tiếp.",
    "level": "A2",
    "category": "Hobbies",
    "durationMinutes": 25,
    "vocabularies": [
      {
        "word": "Music",
        "meaning": "Âm nhạc",
        "pronunciation": "/ˈmjuːzɪk/",
        "partOfSpeech": "noun",
        "example": "I listen to acoustic music.",
        "exampleMeaning": "Tôi nghe nhạc mộc.",
        "category": "Hobbies"
      },
      {
        "word": "Movie",
        "meaning": "Bộ phim",
        "pronunciation": "/ˈmuːvi/",
        "partOfSpeech": "noun",
        "example": "Watch an exciting action movie.",
        "exampleMeaning": "Xem một bộ phim hành động gay cấn.",
        "category": "Hobbies"
      },
      {
        "word": "Sports",
        "meaning": "Thể thao",
        "pronunciation": "/spɔːrts/",
        "partOfSpeech": "noun",
        "example": "Playing sports is great for your health.",
        "exampleMeaning": "Chơi thể thao rất tốt cho sức khỏe.",
        "category": "Hobbies"
      },
      {
        "word": "Game",
        "meaning": "Trò chơi",
        "pronunciation": "/ɡeɪm/",
        "partOfSpeech": "noun",
        "example": "Play board games with friends.",
        "exampleMeaning": "Chơi cờ bàn cùng bạn bè.",
        "category": "Hobbies"
      },
      {
        "word": "Sing",
        "meaning": "Ca hát",
        "pronunciation": "/sɪŋ/",
        "partOfSpeech": "verb",
        "example": "She sings very beautifully.",
        "exampleMeaning": "Cô ấy hát rất hay.",
        "category": "Hobbies"
      },
      {
        "word": "Dance",
        "meaning": "Nhảy múa",
        "pronunciation": "/dæns/",
        "partOfSpeech": "verb",
        "example": "Dancing to the rhythm.",
        "exampleMeaning": "Nhảy múa theo nhịp điệu.",
        "category": "Hobbies"
      },
      {
        "word": "Swimming",
        "meaning": "Bơi lội",
        "pronunciation": "/ˈswɪmɪŋ/",
        "partOfSpeech": "noun",
        "example": "Swimming is my favorite summer hobby.",
        "exampleMeaning": "Bơi lội là sở thích mùa hè của tôi.",
        "category": "Hobbies"
      },
      {
        "word": "Photo",
        "meaning": "Bức ảnh, chụp ảnh",
        "pronunciation": "/ˈfoʊtoʊ/",
        "partOfSpeech": "noun",
        "example": "Take a photo of this sunset.",
        "exampleMeaning": "Chụp bức ảnh hoàng hôn này.",
        "category": "Hobbies"
      },
      {
        "word": "Guitar",
        "meaning": "Đàn ghi-ta",
        "pronunciation": "/ɡɪˈtɑːr/",
        "partOfSpeech": "noun",
        "example": "He plays guitar around the campfire.",
        "exampleMeaning": "Anh ấy gảy ghi-ta quanh lửa trại.",
        "category": "Hobbies"
      },
      {
        "word": "Favorite",
        "meaning": "Được yêu thích nhất",
        "pronunciation": "/ˈfeɪvərɪt/",
        "partOfSpeech": "adjective",
        "example": "What is your favorite hobby?",
        "exampleMeaning": "Sở thích ưa thích nhất của bạn là gì?",
        "category": "General"
      }
    ],
    "grammarPoints": [
      {
        "title": "Diễn tả sở thích với 'Like / Love / Enjoy + V-ing'",
        "explanation": "Sau các động từ chỉ sự yêu thích (like, love, enjoy), động từ theo sau phải thêm đuôi -ing.",
        "formula": "S + like / love / enjoy + V_ing",
        "examples": "[{\"en\": \"I love listening to music.\", \"vi\": \"Tôi rất thích nghe nhạc.\"}, {\"en\": \"He enjoys playing sports.\", \"vi\": \"Anh ấy thích chơi thể thao.\"}]"
      }
    ],
    "listenings": [
      {
        "title": "Weekend Hobbies",
        "transcript": "On weekends, I love swimming in the morning and watching movies with my family at night.",
        "questions": "[{\"question\": \"What does he do on weekend mornings?\", \"options\": [\"Swimming\", \"Sleeping\", \"Cooking\", \"Working\"], \"correctAnswer\": \"Swimming\", \"explanation\": \"Transcript: swimming in the morning.\"}]"
      }
    ],
    "conversations": [
      {
        "title": "What is your hobby?",
        "context": "Hỏi về sở thích của nhau.",
        "dialogue": "[{\"speaker\": \"Chloe\", \"text\": \"What do you like doing in your free time?\", \"meaning\": \"Bạn thích làm gì trong thời gian rảnh?\"}, {\"speaker\": \"David\", \"text\": \"I enjoy playing the guitar and reading books.\", \"meaning\": \"Mình thích chơi đàn ghi-ta và đọc sách.\"}]"
      }
    ],
    "exercises": [
      {
        "type": "MULTIPLE_CHOICE",
        "question": "I like ___ to music.",
        "options": "[\"listening\", \"listen\", \"listened\", \"listens\"]",
        "correctAnswer": "listening",
        "explanation": "Like + V-ing: like listening."
      }
    ],
    "quizzes": [
      {
        "question": "Music nghĩa là:",
        "options": "[\"Âm nhạc\", \"Hội họa\", \"Điện ảnh\", \"Thể thao\"]",
        "correctAnswer": "Âm nhạc",
        "explanation": "Music = Âm nhạc."
      },
      {
        "question": "She enjoys ___ (dance).",
        "options": "[\"dancing\", \"dance\", \"danced\", \"dances\"]",
        "correctAnswer": "dancing",
        "explanation": "Enjoy + V-ing: dancing."
      },
      {
        "question": "Swimming nghĩa là môn gì?",
        "options": "[\"Bơi lội\", \"Bóng đá\", \"Chạy bộ\", \"Đạp xe\"]",
        "correctAnswer": "Bơi lội",
        "explanation": "Swimming = Bơi lội."
      },
      {
        "question": "Favorite nghĩa là:",
        "options": "[\"Yêu thích nhất\", \"Chán nhất\", \"Khó nhất\", \"Đắt nhất\"]",
        "correctAnswer": "Yêu thích nhất",
        "explanation": "Favorite = Yêu thích nhất."
      },
      {
        "question": "Movie nghĩa là:",
        "options": "[\"Bộ phim\", \"Bài hát\", \"Trò chơi\", \"Quyển sách\"]",
        "correctAnswer": "Bộ phim",
        "explanation": "Movie = Bộ phim."
      }
    ]
  }
];

const placementQuestions = [
  { orderNumber: 1, levelTarget: 'A1', category: 'Grammar', question: 'I ___ a student.', options: JSON.stringify(['am', 'is', 'are', 'be']), correctAnswer: 'am' },
  { orderNumber: 2, levelTarget: 'A1', category: 'Vocabulary', question: 'What is the opposite of "Hot"?', options: JSON.stringify(['Cold', 'Warm', 'Big', 'Fast']), correctAnswer: 'Cold' },
  { orderNumber: 3, levelTarget: 'A1', category: 'Grammar', question: 'She ___ English every evening.', options: JSON.stringify(['study', 'studies', 'studying', 'is study']), correctAnswer: 'studies' },
  { orderNumber: 4, levelTarget: 'A1', category: 'Vocabulary', question: 'My father\'s brother is my ___.', options: JSON.stringify(['Cousin', 'Uncle', 'Aunt', 'Grandfather']), correctAnswer: 'Uncle' },
  { orderNumber: 5, levelTarget: 'A1', category: 'Everyday', question: 'What time is it if it\'s 9:15?', options: JSON.stringify(['Nine fifteen', 'Nine fifty', 'Quarter to nine', 'Nine past']), correctAnswer: 'Nine fifteen' },
  { orderNumber: 6, levelTarget: 'A1', category: 'Grammar', question: 'There ___ two books on the table.', options: JSON.stringify(['is', 'are', 'am', 'be']), correctAnswer: 'are' },
  { orderNumber: 7, levelTarget: 'A1', category: 'Vocabulary', question: 'Which word is a fruit?', options: JSON.stringify(['Dog', 'Car', 'Apple', 'Book']), correctAnswer: 'Apple' },
  { orderNumber: 8, levelTarget: 'A1', category: 'Grammar', question: 'They ___ not like coffee.', options: JSON.stringify(['does', 'do', 'are', 'is']), correctAnswer: 'do' },
  { orderNumber: 9, levelTarget: 'A2', category: 'Grammar', question: 'Yesterday, we ___ to the beach.', options: JSON.stringify(['go', 'went', 'gone', 'going']), correctAnswer: 'went' },
  { orderNumber: 10, levelTarget: 'A2', category: 'Vocabulary', question: 'He feels very ___ because he worked all night.', options: JSON.stringify(['tired', 'energetic', 'glad', 'tall']), correctAnswer: 'tired' },
  { orderNumber: 11, levelTarget: 'A2', category: 'Grammar', question: 'This car is ___ than that one.', options: JSON.stringify(['fast', 'faster', 'more fast', 'fastest']), correctAnswer: 'faster' },
  { orderNumber: 12, levelTarget: 'A2', category: 'Grammar', question: 'What are you ___ right now?', options: JSON.stringify(['do', 'did', 'doing', 'does']), correctAnswer: 'doing' },
  { orderNumber: 13, levelTarget: 'A2', category: 'Vocabulary', question: 'A person who flies an airplane is a ___.', options: JSON.stringify(['Doctor', 'Pilot', 'Chef', 'Driver']), correctAnswer: 'Pilot' },
  { orderNumber: 14, levelTarget: 'A2', category: 'Grammar', question: 'Have you ever ___ to Da Nang?', options: JSON.stringify(['be', 'been', 'was', 'were']), correctAnswer: 'been' },
  { orderNumber: 15, levelTarget: 'A2', category: 'Communication', question: 'Would you like some orange juice? - ___.', options: JSON.stringify(['Yes, please.', 'No, I don\'t.', 'I am fine.', 'Never mind.']), correctAnswer: 'Yes, please.' },
  { orderNumber: 16, levelTarget: 'B1', category: 'Grammar', question: 'If it rains tomorrow, we ___ at home.', options: JSON.stringify(['stay', 'will stay', 'stayed', 'would stay']), correctAnswer: 'will stay' },
  { orderNumber: 17, levelTarget: 'B1', category: 'Vocabulary', question: 'The flight was ___ due to heavy snow.', options: JSON.stringify(['delayed', 'celebrated', 'invited', 'arrived']), correctAnswer: 'delayed' },
  { orderNumber: 18, levelTarget: 'B1', category: 'Grammar', question: 'He asked me where I ___ from.', options: JSON.stringify(['come', 'came', 'coming', 'comes']), correctAnswer: 'came' },
  { orderNumber: 19, levelTarget: 'B1', category: 'Vocabulary', question: 'Smoking is strictly ___ inside the hospital.', options: JSON.stringify(['allowed', 'prohibited', 'encouraged', 'enjoyed']), correctAnswer: 'prohibited' },
  { orderNumber: 20, levelTarget: 'B1', category: 'Reading', question: '"Although it was raining, they played soccer." means:', options: JSON.stringify(['They stopped playing because of rain', 'They played soccer despite the rain', 'It didn\'t rain', 'They dislike soccer']), correctAnswer: 'They played soccer despite the rain' },
];

async function main() {
  console.log('--- Starting Expanded Curriculum Database Seeding (15 Lessons, 140+ Vocabs) ---');

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
      }
    }

    console.log(`  -> Lesson ${createdLesson.orderNumber}: ${createdLesson.title} (${vocabularies.length} words)`);
  }

  // 3. Seed Placement Test Questions
  for (const q of placementQuestions) {
    await prisma.placementQuestion.create({
      data: q,
    });
  }
  console.log(`Seeded ${placementQuestions.length} Placement Questions.`);

  // 4. Seed initial learning progress & student saved vocabularies for realistic demo
  const lesson1 = await prisma.lesson.findFirst({ where: { orderNumber: 1 } });
  const lesson2 = await prisma.lesson.findFirst({ where: { orderNumber: 2 } });

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

  if (lesson2) {
    await prisma.userProgress.create({
      data: {
        userId: student.id,
        lessonId: lesson2.id,
        progress: 60,
        completed: false,
        score: 60,
      },
    });
  }

  // Pre-seed some user saved vocabulary items (Favorites & Need Review)
  if (createdVocabIds.length > 15) {
    for (let i = 0; i < 15; i++) {
      const vId = createdVocabIds[i];
      await prisma.userVocabulary.create({
        data: {
          userId: student.id,
          vocabularyId: vId,
          status: i < 5 ? 'MASTERED' : (i < 10 ? 'NEED_REVIEW' : 'LEARNING'),
          isFavorite: i % 2 === 0,
        },
      });
    }
    console.log('Seeded 15 sample student user vocabulary tracking items.');
  }

  console.log(`--- Seeding Complete: 15 Lessons, ${totalVocabCount} Vocabularies Loaded Into Database! ---`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
