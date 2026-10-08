const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Seeding ---');

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
      xp: 500,
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
      xp: 150,
      streakDays: 4,
    },
  });

  console.log('Created users:', { admin: admin.email, student: student.email });

  // 2. Seed 5 Comprehensive Lessons
  const lessonsData = [
    {
      title: 'Greetings & Introductions',
      description: 'Học cách chào hỏi cơ bản, tạm biệt và tự giới thiệu bản thân bằng tiếng Anh một cách tự tin.',
      level: 'A1',
      category: 'Daily Life',
      orderNumber: 1,
      durationMinutes: 15,
      vocabularies: [
        { word: 'Hello', meaning: 'Xin chào', pronunciation: '/həˈloʊ/', partOfSpeech: 'interjection', example: 'Hello, nice to meet you.', exampleMeaning: 'Xin chào, rất vui được gặp bạn.', category: 'Greetings' },
        { word: 'Good morning', meaning: 'Chào buổi sáng', pronunciation: '/ɡʊd ˈmɔːrnɪŋ/', partOfSpeech: 'phrase', example: 'Good morning, teacher!', exampleMeaning: 'Chào buổi sáng cô giáo!', category: 'Greetings' },
        { word: 'Goodbye', meaning: 'Tạm biệt', pronunciation: '/ɡʊdˈbaɪ/', partOfSpeech: 'interjection', example: 'Goodbye, see you tomorrow.', exampleMeaning: 'Tạm biệt, hẹn gặp lại bạn ngày mai.', category: 'Greetings' },
        { word: 'Name', meaning: 'Tên', pronunciation: '/neɪm/', partOfSpeech: 'noun', example: 'My name is David.', exampleMeaning: 'Tên tôi là David.', category: 'Introductions' },
        { word: 'Meet', meaning: 'Gặp gỡ', pronunciation: '/miːt/', partOfSpeech: 'verb', example: 'Glad to meet you.', exampleMeaning: 'Rất vui được gặp bạn.', category: 'Introductions' },
        { word: 'Please', meaning: 'Làm ơn / Xin vui lòng', pronunciation: '/pliːz/', partOfSpeech: 'adverb', example: 'Come in, please.', exampleMeaning: 'Xin mời vào.', category: 'Polite' },
        { word: 'Thank you', meaning: 'Cảm ơn bạn', pronunciation: '/ˈθæŋk juː/', partOfSpeech: 'phrase', example: 'Thank you for your help.', exampleMeaning: 'Cảm ơn sự giúp đỡ của bạn.', category: 'Polite' },
        { word: 'Friend', meaning: 'Bạn bè', pronunciation: '/frend/', partOfSpeech: 'noun', example: 'This is my friend, Anna.', exampleMeaning: 'Đây là bạn của tôi, Anna.', category: 'People' },
      ],
      grammarPoints: [
        {
          title: 'Cách tự giới thiệu bản thân với "My name is" & "I am"',
          explanation: 'Để giới thiệu tên của mình với người khác trong tiếng Anh, bạn có thể dùng 2 cấu trúc thông dụng nhất.',
          formula: 'My name is + [Tên] / I am + [Tên]',
          examples: JSON.stringify([
            { en: 'My name is Duy.', vi: 'Tên tôi là Duy.' },
            { en: 'I am Sarah.', vi: 'Tôi là Sarah.' },
            { en: 'Nice to meet you, John.', vi: 'Rất vui được gặp bạn, John.' }
          ]),
        }
      ],
      listenings: [
        {
          title: 'Morning Meeting at the Office',
          transcript: 'Good morning! My name is John. I am a new student here. Nice to meet you all.',
          questions: JSON.stringify([
            {
              question: 'What is the speaker\'s name?',
              options: ['David', 'John', 'Michael', 'Tom'],
              correctAnswer: 'John',
              explanation: 'Đoạn nói: "My name is John."'
            },
            {
              question: 'What time of day is it?',
              options: ['Morning', 'Afternoon', 'Evening', 'Night'],
              correctAnswer: 'Morning',
              explanation: 'Đoạn nói: "Good morning!"'
            }
          ])
        }
      ],
      conversations: [
        {
          title: 'First Day at School',
          context: 'Hai bạn học lần đầu tiên gặp nhau tại lớp học tiếng Anh.',
          dialogue: JSON.stringify([
            { speaker: 'Anna', text: 'Hello! My name is Anna. What is your name?', meaning: 'Xin chào! Tên mình là Anna. Tên bạn là gì?' },
            { speaker: 'Peter', text: 'Hi Anna! I am Peter. Nice to meet you.', meaning: 'Chào Anna! Mình là Peter. Rất vui được gặp bạn.' },
            { speaker: 'Anna', text: 'Nice to meet you too, Peter. Are you a new student?', meaning: 'Mình cũng rất vui được gặp bạn, Peter. Bạn là học sinh mới à?' },
            { speaker: 'Peter', text: 'Yes, I am. Let\'s be friends!', meaning: 'Đúng vậy. Chúng mình hãy làm bạn nhé!' }
          ])
        }
      ],
      exercises: [
        {
          type: 'MULTIPLE_CHOICE',
          question: 'Chào buổi sáng trong tiếng Anh là gì?',
          options: JSON.stringify(['Good night', 'Good morning', 'Good afternoon', 'Goodbye']),
          correctAnswer: 'Good morning',
          explanation: 'Good morning có nghĩa là Chào buổi sáng.'
        },
        {
          type: 'FILL_BLANK',
          question: 'Nice to _____ you.',
          options: JSON.stringify(['meet', 'meat', 'look', 'see']),
          correctAnswer: 'meet',
          explanation: 'Cụm từ "Nice to meet you" có nghĩa là rất vui được gặp bạn.'
        },
        {
          type: 'WORD_ORDER',
          question: 'Sắp xếp các từ thành câu đúng: [name / My / is / David]',
          options: JSON.stringify(['My', 'name', 'is', 'David']),
          correctAnswer: 'My name is David',
          explanation: 'Cấu trúc giới thiệu tên: My name is + [Tên].'
        },
        {
          type: 'MATCHING',
          question: 'Nối các từ tiếng Anh với nghĩa tiếng Việt tương ứng',
          options: JSON.stringify([
            { left: 'Hello', right: 'Xin chào' },
            { left: 'Goodbye', right: 'Tạm biệt' },
            { left: 'Thank you', right: 'Cảm ơn' }
          ]),
          correctAnswer: 'Hello:Xin chào|Goodbye:Tạm biệt|Thank you:Cảm ơn',
          explanation: 'Hello: Xin chào, Goodbye: Tạm biệt, Thank you: Cảm ơn.'
        }
      ],
      quizzes: [
        {
          question: 'Khi gặp ai đó vào lúc 8 giờ sáng, bạn sẽ nói gì?',
          options: JSON.stringify(['Good evening', 'Good morning', 'Good night', 'Goodbye']),
          correctAnswer: 'Good morning',
          explanation: '8h sáng dùng Good morning.'
        },
        {
          question: 'Điền từ còn thiếu: "My _____ is Alex."',
          options: JSON.stringify(['age', 'name', 'friend', 'school']),
          correctAnswer: 'name',
          explanation: 'My name is Alex (Tên tôi là Alex).'
        },
        {
          question: 'Đáp lại câu "Nice to meet you", bạn nên nói gì?',
          options: JSON.stringify(['Nice to meet you too', 'I am sorry', 'No problem', 'Good night']),
          correctAnswer: 'Nice to meet you too',
          explanation: 'Nice to meet you too (Tôi cũng rất vui được gặp bạn).'
        },
        {
          question: '"Thank you" có nghĩa là gì?',
          options: JSON.stringify(['Xin lỗi', 'Cảm ơn', 'Tạm biệt', 'Không có gì']),
          correctAnswer: 'Cảm ơn',
          explanation: 'Thank you = Cảm ơn.'
        },
        {
          question: 'Từ nào sau đây có nghĩa là "Bạn bè"?',
          options: JSON.stringify(['Teacher', 'Student', 'Friend', 'Family']),
          correctAnswer: 'Friend',
          explanation: 'Friend = bạn bè.'
        }
      ]
    },
    {
      title: 'Personal Pronouns & Verb "To Be"',
      description: 'Nắm vững nền tảng ngữ pháp quan trọng nhất: Đại từ nhân xưng (I, You, We, They, He, She, It) và Động từ to be (am, is, are).',
      level: 'A1',
      category: 'Grammar Foundation',
      orderNumber: 2,
      durationMinutes: 20,
      vocabularies: [
        { word: 'Student', meaning: 'Học sinh, sinh viên', pronunciation: '/ˈstuːdənt/', partOfSpeech: 'noun', example: 'I am a student.', exampleMeaning: 'Tôi là một học sinh.', category: 'School' },
        { word: 'Teacher', meaning: 'Giáo viên', pronunciation: '/ˈtiːtʃər/', partOfSpeech: 'noun', example: 'She is a good teacher.', exampleMeaning: 'Cô ấy là một giáo viên giỏi.', category: 'School' },
        { word: 'Doctor', meaning: 'Bác sĩ', pronunciation: '/ˈdɑːktər/', partOfSpeech: 'noun', example: 'He is a doctor.', exampleMeaning: 'Anh ấy là một bác sĩ.', category: 'Jobs' },
        { word: 'Happy', meaning: 'Vui vẻ, hạnh phúc', pronunciation: '/ˈhæpi/', partOfSpeech: 'adjective', example: 'We are very happy.', exampleMeaning: 'Chúng tôi rất vui vẻ.', category: 'Feelings' },
        { word: 'Tired', meaning: 'Mệt mỏi', pronunciation: '/ˈtaɪərd/', partOfSpeech: 'adjective', example: 'Are you tired?', exampleMeaning: 'Bạn có mệt không?', category: 'Feelings' },
        { word: 'Ready', meaning: 'Sẵn sàng', pronunciation: '/ˈredi/', partOfSpeech: 'adjective', example: 'I am ready to learn.', exampleMeaning: 'Tôi đã sẵn sàng học.', category: 'General' },
      ],
      grammarPoints: [
        {
          title: 'Động từ "To Be" ở thì hiện tại đơn',
          explanation: 'Động từ To Be có 3 dạng: am, is, are tương ứng với các chủ ngữ.',
          formula: 'I + am | He/She/It + is | You/We/They + are',
          examples: JSON.stringify([
            { en: 'I am a student.', vi: 'Tôi là một học sinh.' },
            { en: 'She is a doctor.', vi: 'Cô ấy là một bác sĩ.' },
            { en: 'They are happy.', vi: 'Họ rất hạnh phúc.' },
            { en: 'He is not tired.', vi: 'Anh ấy không mệt.' }
          ]),
        }
      ],
      listenings: [
        {
          title: 'Who are they?',
          transcript: 'Look at that picture. This is Mary. She is a teacher. And that is Tom. He is a doctor. They are very friendly.',
          questions: JSON.stringify([
            {
              question: 'What is Mary\'s job?',
              options: ['Teacher', 'Doctor', 'Student', 'Nurse'],
              correctAnswer: 'Teacher',
              explanation: 'Transcript: "She is a teacher."'
            },
            {
              question: 'What is Tom\'s job?',
              options: ['Teacher', 'Doctor', 'Pilot', 'Engineer'],
              correctAnswer: 'Doctor',
              explanation: 'Transcript: "He is a doctor."'
            }
          ])
        }
      ],
      conversations: [
        {
          title: 'Are you ready?',
          context: 'Cuộc trò chuyện giữa hai người bạn trước giờ học.',
          dialogue: JSON.stringify([
            { speaker: 'Linda', text: 'Hi Mark, how are you today?', meaning: 'Chào Mark, hôm nay bạn thế nào?' },
            { speaker: 'Mark', text: 'I am fine, thanks. But I am a little tired.', meaning: 'Mình ổn, cảm ơn. Nhưng mình hơi mệt một chút.' },
            { speaker: 'Linda', text: 'Are you ready for the English class?', meaning: 'Bạn đã sẵn sàng cho buổi học tiếng Anh chưa?' },
            { speaker: 'Mark', text: 'Yes, I am ready now!', meaning: 'Rồi, bây giờ mình đã sẵn sàng!' }
          ])
        }
      ],
      exercises: [
        {
          type: 'MULTIPLE_CHOICE',
          question: 'Chọn từ đúng: She ___ a student.',
          options: JSON.stringify(['am', 'is', 'are', 'be']),
          correctAnswer: 'is',
          explanation: 'Chủ ngữ "She" đi với động từ to be "is".'
        },
        {
          type: 'MULTIPLE_CHOICE',
          question: 'Chọn từ đúng: They ___ very happy.',
          options: JSON.stringify(['am', 'is', 'are', 'be']),
          correctAnswer: 'are',
          explanation: 'Chủ ngữ "They" đi với "are".'
        },
        {
          type: 'WORD_ORDER',
          question: 'Sắp xếp thành câu đúng: [doctor / a / He / is]',
          options: JSON.stringify(['He', 'is', 'a', 'doctor']),
          correctAnswer: 'He is a doctor',
          explanation: 'Cấu trúc: Chủ ngữ + to be + mạo từ + danh từ.'
        }
      ],
      quizzes: [
        {
          question: 'I ___ Vietnamese.',
          options: JSON.stringify(['am', 'is', 'are', 'be']),
          correctAnswer: 'am',
          explanation: 'Chủ ngữ "I" luôn đi với "am".'
        },
        {
          question: 'You and I ___ friends.',
          options: JSON.stringify(['am', 'is', 'are', 'be']),
          correctAnswer: 'are',
          explanation: 'You and I = We (Chúng ta) -> đi với are.'
        },
        {
          question: 'Chọn câu phủ định đúng:',
          options: JSON.stringify(['He is not doctor', 'He is not a doctor', 'He not is a doctor', 'He is no a doctor']),
          correctAnswer: 'He is not a doctor',
          explanation: 'Cấu trúc phủ định: S + to be + not + a/an + N.'
        },
        {
          question: '___ they ready?',
          options: JSON.stringify(['Am', 'Is', 'Are', 'Do']),
          correctAnswer: 'Are',
          explanation: 'Câu hỏi với They: Are they ready?'
        },
        {
          question: 'It ___ a beautiful day.',
          options: JSON.stringify(['am', 'is', 'are', 'be']),
          correctAnswer: 'is',
          explanation: 'It đi với is.'
        }
      ]
    },
    {
      title: 'Family Members',
      description: 'Học từ vựng và cách giới thiệu các thành viên trong gia đình thân yêu của bạn.',
      level: 'A1',
      category: 'Relationships',
      orderNumber: 3,
      durationMinutes: 18,
      vocabularies: [
        { word: 'Father', meaning: 'Bố, cha', pronunciation: '/ˈfɑːðər/', partOfSpeech: 'noun', example: 'My father is tall.', exampleMeaning: 'Bố tôi cao.', category: 'Family' },
        { word: 'Mother', meaning: 'Mẹ', pronunciation: '/ˈmʌðər/', partOfSpeech: 'noun', example: 'My mother is cooking.', exampleMeaning: 'Mẹ tôi đang nấu ăn.', category: 'Family' },
        { word: 'Brother', meaning: 'Anh trai / Em trai', pronunciation: '/ˈbrʌðər/', partOfSpeech: 'noun', example: 'I have an older brother.', exampleMeaning: 'Tôi có một người anh trai.', category: 'Family' },
        { word: 'Sister', meaning: 'Chị gái / Em gái', pronunciation: '/ˈsɪstər/', partOfSpeech: 'noun', example: 'My sister is cute.', exampleMeaning: 'Em gái tôi rất dễ thương.', category: 'Family' },
        { word: 'Parents', meaning: 'Bố mẹ, phụ huynh', pronunciation: '/ˈperənts/', partOfSpeech: 'noun', example: 'I love my parents.', exampleMeaning: 'Tôi yêu bố mẹ tôi.', category: 'Family' },
        { word: 'Grandfather', meaning: 'Ông', pronunciation: '/ˈɡrændfɑːðər/', partOfSpeech: 'noun', example: 'My grandfather is 70 years old.', exampleMeaning: 'Ông tôi 70 tuổi.', category: 'Family' },
        { word: 'Grandmother', meaning: 'Bà', pronunciation: '/ˈɡrændmʌðər/', partOfSpeech: 'noun', example: 'My grandmother tells great stories.', exampleMeaning: 'Bà tôi kể những câu chuyện rất hay.', category: 'Family' },
      ],
      grammarPoints: [
        {
          title: 'Tính từ sở hữu (Possessive Adjectives)',
          explanation: 'Tính từ sở hữu đứng trước danh từ để chỉ sự sở hữu: my (của tôi), your (của bạn), his (của anh ấy), her (của cô ấy), our (của chúng tôi), their (của họ).',
          formula: '[Possessive Adjective] + [Noun]',
          examples: JSON.stringify([
            { en: 'This is my mother.', vi: 'Đây là mẹ của tôi.' },
            { en: 'His brother is a doctor.', vi: 'Anh trai của anh ấy là bác sĩ.' },
            { en: 'Her sister is smart.', vi: 'Chị gái của cô ấy rất thông minh.' }
          ]),
        }
      ],
      listenings: [
        {
          title: 'My Sweet Family',
          transcript: 'There are four people in my family: my father, my mother, my brother, and me. We live in a small house with a lovely garden.',
          questions: JSON.stringify([
            {
              question: 'How many people are there in the family?',
              options: ['Three', 'Four', 'Five', 'Six'],
              correctAnswer: 'Four',
              explanation: 'Transcript: "There are four people in my family."'
            }
          ])
        }
      ],
      conversations: [
        {
          title: 'Talking About Photos',
          context: 'Hai người bạn xem ảnh gia đình trên điện thoại.',
          dialogue: JSON.stringify([
            { speaker: 'Tom', text: 'Who is this in the photo?', meaning: 'Ai trong bức ảnh này vậy?' },
            { speaker: 'Jenny', text: 'This is my older sister. Her name is Emily.', meaning: 'Đây là chị gái mình. Tên chị ấy là Emily.' },
            { speaker: 'Tom', text: 'She looks very kind. Is she a teacher?', meaning: 'Chị ấy trông rất hiền từ. Chị ấy có phải là giáo viên không?' },
            { speaker: 'Jenny', text: 'Yes, she is! She teaches English.', meaning: 'Đúng vậy! Chị ấy dạy tiếng Anh.' }
          ])
        }
      ],
      exercises: [
        {
          type: 'FILL_BLANK',
          question: 'My father and my mother are my _____.',
          options: JSON.stringify(['parents', 'brothers', 'friends', 'teachers']),
          correctAnswer: 'parents',
          explanation: 'Father + Mother = Parents (Bố mẹ).'
        },
        {
          type: 'MATCHING',
          question: 'Nối từ gia đình với nghĩa tương ứng',
          options: JSON.stringify([
            { left: 'Brother', right: 'Anh/em trai' },
            { left: 'Sister', right: 'Chị/em gái' },
            { left: 'Mother', right: 'Mẹ' }
          ]),
          correctAnswer: 'Brother:Anh/em trai|Sister:Chị/em gái|Mother:Mẹ',
          explanation: 'Brother = Anh/em trai, Sister = Chị/em gái, Mother = Mẹ.'
        }
      ],
      quizzes: [
        {
          question: 'Từ nào dùng để chỉ "Bố mẹ"?',
          options: JSON.stringify(['Relatives', 'Parents', 'Partners', 'Family']),
          correctAnswer: 'Parents',
          explanation: 'Parents = Bố mẹ.'
        },
        {
          question: 'Chọn tính từ sở hữu: "This is ___ book." (Sách của tôi)',
          options: JSON.stringify(['I', 'me', 'my', 'mine']),
          correctAnswer: 'my',
          explanation: 'My + Noun: My book.'
        },
        {
          question: 'Anh trai của mẹ bạn gọi là gì?',
          options: JSON.stringify(['Uncle', 'Aunt', 'Father', 'Brother']),
          correctAnswer: 'Uncle',
          explanation: 'Uncle = Bác / Chú / Cậu.'
        },
        {
          question: 'Grandfather có nghĩa là gì?',
          options: JSON.stringify(['Bà', 'Ông', 'Bố', 'Mẹ']),
          correctAnswer: 'Ông',
          explanation: 'Grandfather = Ông.'
        },
        {
          question: 'Điền từ: "How many people are there in ___ family?"',
          options: JSON.stringify(['you', 'your', 'yours', 'you are']),
          correctAnswer: 'your',
          explanation: 'Your family = Gia đình bạn.'
        }
      ]
    },
    {
      title: 'Numbers & Telling Time',
      description: 'Làm quen với số đếm từ 1 đến 100, cách hỏi giờ và diễn đạt thời gian trong sinh hoạt hàng ngày.',
      level: 'A1',
      category: 'Everyday Skills',
      orderNumber: 4,
      durationMinutes: 20,
      vocabularies: [
        { word: 'One', meaning: 'Số 1', pronunciation: '/wʌn/', partOfSpeech: 'number', example: 'I have one dog.', exampleMeaning: 'Tôi có một chú chó.', category: 'Numbers' },
        { word: 'Two', meaning: 'Số 2', pronunciation: '/tuː/', partOfSpeech: 'number', example: 'Two cups of tea, please.', exampleMeaning: 'Cho hai tách trà làm ơn.', category: 'Numbers' },
        { word: 'Ten', meaning: 'Số 10', pronunciation: '/ten/', partOfSpeech: 'number', example: 'Ten minutes left.', exampleMeaning: 'Còn lại 10 phút.', category: 'Numbers' },
        { word: 'Twenty', meaning: 'Số 20', pronunciation: '/ˈtwenti/', partOfSpeech: 'number', example: 'He is twenty years old.', exampleMeaning: 'Anh ấy 20 tuổi.', category: 'Numbers' },
        { word: 'Clock', meaning: 'Đồng hồ treo tường', pronunciation: '/klɑːk/', partOfSpeech: 'noun', example: 'The clock shows 7 AM.', exampleMeaning: 'Đồng hồ chỉ 7 giờ sáng.', category: 'Time' },
        { word: 'O\'clock', meaning: 'Giờ đúng', pronunciation: '/əˈklɑːk/', partOfSpeech: 'adverb', example: 'It is eight o\'clock.', exampleMeaning: 'Bây giờ là 8 giờ đúng.', category: 'Time' },
        { word: 'Minute', meaning: 'Phút', pronunciation: '/ˈmɪnɪt/', partOfSpeech: 'noun', example: 'Wait a minute.', exampleMeaning: 'Chờ một phút nhé.', category: 'Time' },
        { word: 'Hour', meaning: 'Giờ, tiếng đồng hồ', pronunciation: '/ˈaʊər/', partOfSpeech: 'noun', example: 'One hour later.', exampleMeaning: 'Một tiếng sau.', category: 'Time' },
      ],
      grammarPoints: [
        {
          title: 'Cách hỏi và trả lời giờ trong tiếng Anh',
          explanation: 'Cấu trúc hỏi giờ thông dụng nhất là "What time is it?". Trả lời bằng "It is + [Giờ] + o\'clock" (nếu là giờ đúng).',
          formula: 'What time is it? -> It is + [time]',
          examples: JSON.stringify([
            { en: 'What time is it? - It is 7 o\'clock.', vi: 'Mấy giờ rồi? - Bây giờ là 7 giờ đúng.' },
            { en: 'It is 8:30 (eight thirty).', vi: 'Bây giờ là 8 giờ 30 phút.' }
          ]),
        }
      ],
      listenings: [
        {
          title: 'Catching the Bus',
          transcript: 'Excuse me! What time is it now? It is seven fifteen. The bus arrives at seven thirty. Don\'t worry, you have fifteen minutes.',
          questions: JSON.stringify([
            {
              question: 'What time is it now in the listening?',
              options: ['7:00', '7:15', '7:30', '7:45'],
              correctAnswer: '7:15',
              explanation: 'Transcript: "It is seven fifteen."'
            }
          ])
        }
      ],
      conversations: [
        {
          title: 'What time do you wake up?',
          context: 'Hai đồng nghiệp nói về thói quen thức dậy buổi sáng.',
          dialogue: JSON.stringify([
            { speaker: 'Alex', text: 'What time do you wake up every morning?', meaning: 'Bạn thường thức dậy lúc mấy giờ mỗi sáng?' },
            { speaker: 'Brian', text: 'I usually wake up at 6 o\'clock.', meaning: 'Tôi thường thức dậy lúc 6 giờ đúng.' },
            { speaker: 'Alex', text: 'That is so early! I wake up at 7:30.', meaning: 'Sớm thế! Tôi thường dậy lúc 7 giờ rưỡi.' }
          ])
        }
      ],
      exercises: [
        {
          type: 'MULTIPLE_CHOICE',
          question: 'Câu hỏi giờ chuẩn trong tiếng Anh là câu nào?',
          options: JSON.stringify(['What time is it?', 'Which time is it?', 'How time is it?', 'When time is it?']),
          correctAnswer: 'What time is it?',
          explanation: 'What time is it? là câu hỏi chuẩn.'
        },
        {
          type: 'WORD_ORDER',
          question: 'Sắp xếp: [is / It / o\'clock / nine]',
          options: JSON.stringify(['It', 'is', 'nine', 'o\'clock']),
          correctAnswer: 'It is nine o\'clock',
          explanation: 'It is nine o\'clock (Bây giờ là 9 giờ đúng).'
        }
      ],
      quizzes: [
        {
          question: 'Số 15 trong tiếng Anh viết là:',
          options: JSON.stringify(['Fiveteen', 'Fifteen', 'Fifty', 'Fifth']),
          correctAnswer: 'Fifteen',
          explanation: '15 = Fifteen.'
        },
        {
          question: 'Số 50 trong tiếng Anh viết là:',
          options: JSON.stringify(['Fifteen', 'Fifty', 'Fivety', 'Five']),
          correctAnswer: 'Fifty',
          explanation: '50 = Fifty.'
        },
        {
          question: 'Để nói 8 giờ đúng, ta nói:',
          options: JSON.stringify(['Eight clock', 'Eight o\'clock', 'Eight time', 'Eight hour']),
          correctAnswer: 'Eight o\'clock',
          explanation: 'Giờ đúng dùng o\'clock.'
        },
        {
          question: '"Wait a minute" nghĩa là gì?',
          options: JSON.stringify(['Chờ một giờ', 'Chờ một ngày', 'Chờ một phút', 'Đi ngay']),
          correctAnswer: 'Chờ một phút',
          explanation: 'Minute = phút.'
        },
        {
          question: 'Số 12 là:',
          options: JSON.stringify(['Eleven', 'Twelve', 'Twenty', 'Two']),
          correctAnswer: 'Twelve',
          explanation: '12 = Twelve.'
        }
      ]
    },
    {
      title: 'Food, Drinks & Ordering at Coffee Shop',
      description: 'Học cách gọi đồ ăn, thức uống, yêu cầu kích cỡ và thanh toán tại quán cà phê theo chuẩn tình huống thực tế.',
      level: 'A1',
      category: 'Social & Travel',
      orderNumber: 5,
      durationMinutes: 25,
      vocabularies: [
        { word: 'Coffee', meaning: 'Cà phê', pronunciation: '/ˈkɔːfi/', partOfSpeech: 'noun', example: 'I would like a cup of coffee.', exampleMeaning: 'Tôi muốn một tách cà phê.', category: 'Drinks' },
        { word: 'Tea', meaning: 'Trà', pronunciation: '/tiː/', partOfSpeech: 'noun', example: 'Do you drink green tea?', exampleMeaning: 'Bạn có uống trà xanh không?', category: 'Drinks' },
        { word: 'Water', meaning: 'Nước lọc', pronunciation: '/ˈwɔːtər/', partOfSpeech: 'noun', example: 'A bottle of water, please.', exampleMeaning: 'Cho một chai nước lọc làm ơn.', category: 'Drinks' },
        { word: 'Apple', meaning: 'Quả táo', pronunciation: '/ˈæpəl/', partOfSpeech: 'noun', example: 'I eat an apple every day.', exampleMeaning: 'Tôi ăn một quả táo mỗi ngày.', category: 'Food' },
        { word: 'Bread', meaning: 'Bánh mì', pronunciation: '/bred/', partOfSpeech: 'noun', example: 'Bread and butter for breakfast.', exampleMeaning: 'Bánh mì và bơ cho bữa sáng.', category: 'Food' },
        { word: 'Menu', meaning: 'Thực đơn', pronunciation: '/ˈmenjuː/', partOfSpeech: 'noun', example: 'Can I see the menu, please?', exampleMeaning: 'Tôi có thể xem thực đơn được không?', category: 'Restaurant' },
        { word: 'Size', meaning: 'Kích cỡ', pronunciation: '/saɪz/', partOfSpeech: 'noun', example: 'What size would you like?', exampleMeaning: 'Bạn muốn kích cỡ nào?', category: 'Restaurant' },
        { word: 'Bill', meaning: 'Hóa đơn tính tiền', pronunciation: '/bɪl/', partOfSpeech: 'noun', example: 'Can I have the bill, please?', exampleMeaning: 'Cho tôi xin hóa đơn tính tiền nhé?', category: 'Restaurant' },
      ],
      grammarPoints: [
        {
          title: 'Cấu trúc gọi món lịch sự với "I would like" (I\'d like)',
          explanation: 'Trong tiếng Anh giao tiếp, người bản xứ luôn dùng "I would like..." hoặc viết tắt "I\'d like..." thay vì "I want" để thể hiện sự lịch thiệp khi gọi món.',
          formula: 'I would like (I\'d like) + a/an/some + [Food / Drink], please.',
          examples: JSON.stringify([
            { en: 'I\'d like a hot coffee, please.', vi: 'Cho tôi một ly cà phê nóng nhé.' },
            { en: 'I would like a glass of water.', vi: 'Tôi muốn một cốc nước lọc.' },
            { en: 'Anything else? - No, thank you.', vi: 'Còn gì nữa không ạ? - Dạ không, cảm ơn.' }
          ]),
        }
      ],
      listenings: [
        {
          title: 'At the Cafe Counter',
          transcript: 'Good morning! Welcome to Star Cafe. Hello! I\'d like an iced coffee, please. Sure, what size? Medium, please. Anything else? A chocolate cake, please.',
          questions: JSON.stringify([
            {
              question: 'What drink does the customer order?',
              options: ['Hot tea', 'Iced coffee', 'Orange juice', 'Milk'],
              correctAnswer: 'Iced coffee',
              explanation: 'Transcript: "I\'d like an iced coffee, please."'
            },
            {
              question: 'What size does the customer choose?',
              options: ['Small', 'Medium', 'Large', 'Extra large'],
              correctAnswer: 'Medium',
              explanation: 'Transcript: "Medium, please."'
            }
          ])
        }
      ],
      conversations: [
        {
          title: 'Ordering at Coffee Shop',
          context: 'Khách hàng gọi đồ uống tại quầy cà phê (đúng theo mẫu trong tài liệu docx).',
          dialogue: JSON.stringify([
            { speaker: 'Waiter', text: 'Hello! What would you like to drink?', meaning: 'Xin chào! Bạn muốn uống gì ạ?' },
            { speaker: 'Customer', text: 'Hello. I\'d like a coffee, please.', meaning: 'Xin chào. Cho tôi một ly cà phê nhé.' },
            { speaker: 'Waiter', text: 'Sure. What size would you like?', meaning: 'Dạ được. Bạn muốn kích cỡ nào ạ?' },
            { speaker: 'Customer', text: 'Medium, please.', meaning: 'Cỡ vừa nhé.' },
            { speaker: 'Waiter', text: 'Anything else?', meaning: 'Còn gì nữa không ạ?' },
            { speaker: 'Customer', text: 'No, thank you. That is all.', meaning: 'Không, cảm ơn. Thế là đủ rồi ạ.' }
          ])
        }
      ],
      exercises: [
        {
          type: 'MULTIPLE_CHOICE',
          question: 'Khi muốn gọi món lịch sự, bạn nên nói:',
          options: JSON.stringify(['I want a coffee', 'I\'d like a coffee, please', 'Give me a coffee', 'Coffee now']),
          correctAnswer: 'I\'d like a coffee, please',
          explanation: 'I\'d like + [Món], please là cách diễn đạt lịch sự nhất.'
        },
        {
          type: 'FILL_BLANK',
          question: 'Can I see the _____, please?',
          options: JSON.stringify(['menu', 'paper', 'food', 'chair']),
          correctAnswer: 'menu',
          explanation: 'Can I see the menu, please? (Cho tôi xem thực đơn nhé).'
        },
        {
          type: 'WORD_ORDER',
          question: 'Sắp xếp câu: [coffee / like / a / I\'d / please]',
          options: JSON.stringify(['I\'d', 'like', 'a', 'coffee', 'please']),
          correctAnswer: 'I\'d like a coffee please',
          explanation: 'Cấu trúc I\'d like a coffee, please.'
        }
      ],
      quizzes: [
        {
          question: 'Từ nào có nghĩa là "Hóa đơn tính tiền"?',
          options: JSON.stringify(['Menu', 'Bill', 'Table', 'Tip']),
          correctAnswer: 'Bill',
          explanation: 'Bill = Hóa đơn.'
        },
        {
          question: 'Khi phục vụ hỏi "Anything else?", câu này có nghĩa là:',
          options: JSON.stringify(['Bao nhiêu tiền?', 'Còn gì nữa không?', 'Ngon không?', 'Đi đâu đấy?']),
          correctAnswer: 'Còn gì nữa không?',
          explanation: 'Anything else? = Còn gì nữa không ạ?'
        },
        {
          question: 'Từ nào là "Quả táo"?',
          options: JSON.stringify(['Banana', 'Orange', 'Apple', 'Grape']),
          correctAnswer: 'Apple',
          explanation: 'Apple = Quả táo.'
        },
        {
          question: 'Kích cỡ "Medium" nghĩa là:',
          options: JSON.stringify(['Nhỏ', 'Vừa', 'Lớn', 'Rất lớn']),
          correctAnswer: 'Vừa',
          explanation: 'Medium = Vừa.'
        },
        {
          question: 'Chọn câu xin thanh toán chuẩn:',
          options: JSON.stringify(['Can I have the bill, please?', 'Money now', 'I give bill', 'How much bread']),
          correctAnswer: 'Can I have the bill, please?',
          explanation: 'Can I have the bill, please? là câu chuẩn xin hóa đơn.'
        }
      ]
    }
  ];

  for (const lData of lessonsData) {
    const { vocabularies, grammarPoints, listenings, conversations, exercises, quizzes, ...lessonInfo } = lData;

    const createdLesson = await prisma.lesson.create({
      data: lessonInfo,
    });

    // Create vocabularies
    if (vocabularies && vocabularies.length > 0) {
      for (const v of vocabularies) {
        await prisma.vocabulary.create({
          data: {
            ...v,
            lessonId: createdLesson.id,
            level: createdLesson.level,
          },
        });
      }
    }

    // Create grammar points
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

    // Create listenings
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

    // Create conversations
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

    // Create exercises
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

    // Create quiz questions
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

    console.log(`Created Lesson ${createdLesson.orderNumber}: ${createdLesson.title}`);
  }

  // 3. Seed Placement Test Questions (20 Questions scaling from A1 to B1)
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

  for (const q of placementQuestions) {
    await prisma.placementQuestion.create({
      data: q,
    });
  }

  console.log(`Seeded ${placementQuestions.length} Placement Questions.`);

  // 4. Initial student progress for demonstration
  const firstLesson = await prisma.lesson.findFirst({ where: { orderNumber: 1 } });
  if (firstLesson) {
    await prisma.userProgress.create({
      data: {
        userId: student.id,
        lessonId: firstLesson.id,
        progress: 80,
        completed: false,
        score: 80,
      },
    });
  }

  console.log('--- Database Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
