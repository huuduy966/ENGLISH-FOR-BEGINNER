// helper.js - Lesson generation helper with rich multi-modal interactive questions
function createLesson({
  level,
  orderNumber,
  title,
  category,
  description,
  durationMinutes = 15,
  vocabularies = [],
  grammar = {},
  listening = {},
  conversation = {},
  exercises = [],
  quizzes = [],
}) {
  // Determine question quotas based on CEFR level
  const targetCounts = {
    A1: { grammarQs: 5, listeningQs: 5, dialogueTurns: 5, quizQs: 10, exerciseQs: 6 },
    A2: { grammarQs: 6, listeningQs: 6, dialogueTurns: 5, quizQs: 12, exerciseQs: 7 },
    B1: { grammarQs: 8, listeningQs: 8, dialogueTurns: 6, quizQs: 15, exerciseQs: 8 },
    B2: { grammarQs: 8, listeningQs: 8, dialogueTurns: 6, quizQs: 15, exerciseQs: 8 },
    C1: { grammarQs: 10, listeningQs: 10, dialogueTurns: 8, quizQs: 18, exerciseQs: 10 },
    C2: { grammarQs: 10, listeningQs: 10, dialogueTurns: 8, quizQs: 20, exerciseQs: 10 },
  }[level] || { grammarQs: 5, listeningQs: 5, dialogueTurns: 5, quizQs: 10, exerciseQs: 6 };

  const vocabsFormatted = vocabularies.map((v) => ({
    word: v.word,
    meaning: v.meaning,
    pronunciation: v.pronunciation || '/.../',
    partOfSpeech: v.partOfSpeech || 'noun',
    example: v.example || `I use ${v.word} in daily conversation.`,
    exampleMeaning: v.exampleMeaning || `Tôi sử dụng từ ${v.word} trong giao tiếp hàng ngày.`,
    category: category,
    level: level,
  }));

  const primaryVocab = vocabsFormatted[0] || { word: 'English', meaning: 'Tiếng Anh', pronunciation: '/ˈɪŋɡlɪʃ/' };
  const secondaryVocab = vocabsFormatted[1] || { word: 'Study', meaning: 'Học tập', pronunciation: '/ˈstʌdi/' };
  const thirdVocab = vocabsFormatted[2] || { word: 'Practice', meaning: 'Luyện tập', pronunciation: '/ˈpræktɪs/' };
  const fourthVocab = vocabsFormatted[3] || { word: 'Language', meaning: 'Ngôn ngữ', pronunciation: '/ˈlæŋɡwɪdʒ/' };

  // 1. Build Grammar Practice Questions (5 to 10 questions)
  const grammarRuleTitle = grammar.title || `Quy tắc ngữ pháp: ${title}`;
  const grammarFormula = grammar.formula || 'S + V + O';
  const grammarExplanation = grammar.explanation || `Hướng dẫn cấu trúc ngữ pháp then chốt cho chủ đề ${title}.`;

  const grammarPracticeList = [];
  for (let i = 0; i < targetCounts.grammarQs; i++) {
    const v = vocabsFormatted[i % vocabsFormatted.length] || primaryVocab;
    grammarPracticeList.push({
      id: i + 1,
      type: i % 2 === 0 ? 'FILL_BLANK' : 'MULTIPLE_CHOICE',
      question: `Áp dụng công thức (${grammarFormula}): Chọn dạng đúng của "${v.word}" trong câu:`,
      options: [
        `${v.word}`,
        `${v.word}s`,
        `${v.word}ing`,
        `${v.word}ed`
      ],
      correctAnswer: `${v.word}`,
      explanation: `Theo quy tắc ngữ pháp của bài học, dạng nguyên mẫu "${v.word}" là lựa chọn phù hợp nhất trong cấu trúc này.`,
    });
  }

  // 2. Build Listening Transcript and Questions (5 to 10 questions)
  const listeningTranscript = listening.transcript ||
    `Hello and welcome to today's English session. Today we are exploring the theme of ${title}. In daily life, communication plays a vital role. For instance, words like "${primaryVocab.word}" and "${secondaryVocab.word}" frequently appear. Remember to listen carefully, practice regularly, and build confidence step by step. Have a wonderful study session!`;

  const listeningQuestionsList = [];
  for (let i = 0; i < targetCounts.listeningQs; i++) {
    const v = vocabsFormatted[i % vocabsFormatted.length] || primaryVocab;
    if (i === 0) {
      listeningQuestionsList.push({
        question: `Chủ đề chính được người nói đề cập trong bài nghe là gì?`,
        options: [title, 'Thời tiết ở Tokyo', 'Nấu ăn gia đình', 'Lịch sử cổ đại'],
        correctAnswer: title,
        explanation: `Đoạn audio mở đầu giới thiệu rõ ràng về chủ đề: "${title}".`,
      });
    } else if (i === 1) {
      listeningQuestionsList.push({
        question: `Người nói đã nhắc đến từ vựng nào sau đây trong bài nghe?`,
        options: [v.word, 'Pencil', 'Banana', 'Motorcycle'],
        correctAnswer: v.word,
        explanation: `Người nói đã nhấn mạnh tầm quan trọng của từ "${v.word}".`,
      });
    } else if (i === 2) {
      listeningQuestionsList.push({
        question: `Lời khuyên của người nói dành cho người học tiếng Anh là gì?`,
        options: [
          'Luyện tập kiên trì và tự tin từng bước',
          'Không cần luyện nói hàng ngày',
          'Chỉ học ngữ pháp, không cần nghe',
          'Bỏ cuộc khi gặp bài khó'
        ],
        correctAnswer: 'Luyện tập kiên trì và tự tin từng bước',
        explanation: 'Người nói khuyên: "practice regularly, and build confidence step by step".',
      });
    } else {
      listeningQuestionsList.push({
        question: `Theo nội dung bài nghe, việc nắm bắt từ "${v.word}" (${v.meaning}) giúp ích gì?`,
        options: [
          'Tăng cường sự tự tin khi giao tiếp',
          'Làm bài thi bị trừ điểm',
          'Không có tác dụng thực tế',
          'Gây khó hiểu cho người đối diện'
        ],
        correctAnswer: 'Tăng cường sự tự tin khi giao tiếp',
        explanation: `Từ "${v.word}" là từ khóa quan trọng giúp nâng cao phản xạ tự nhiên.`,
      });
    }
  }

  // 3. Build Conversation Dialogue (5 to 8 turns) and Situational Response
  const dialogueTurns = [
    { speaker: 'Alex', text: `Hi there! Are you ready for our lesson on ${title}?`, meaning: `Chào bạn! Bạn đã sẵn sàng cho bài học về ${title} chưa?` },
    { speaker: 'Taylor', text: `Yes, absolutely! I want to master words like "${primaryVocab.word}".`, meaning: `Chắc chắn rồi! Mình rất muốn nắm vững những từ như "${primaryVocab.word}".` },
    { speaker: 'Alex', text: `That's great. How do you usually use "${secondaryVocab.word}" in real life?`, meaning: `Tuyệt quá. Bạn thường dùng từ "${secondaryVocab.word}" thế nào trong đời sống?` },
    { speaker: 'Taylor', text: `I try to make complete sentences and practice with friends daily.`, meaning: `Mình cố gắng đặt câu hoàn chỉnh và luyện tập cùng bạn bè mỗi ngày.` },
    { speaker: 'Alex', text: `Excellent strategy! Consistency always brings remarkable results.`, meaning: `Chiến lược tuyệt vời! Sự kiên trì luôn mang lại kết quả đáng kinh ngạc.` },
  ];

  if (targetCounts.dialogueTurns >= 6) {
    dialogueTurns.push({
      speaker: 'Taylor',
      text: `Let's keep challenging ourselves with the next exercises!`,
      meaning: `Hãy cùng tiếp tục thử thách bản thân với các bài tập tiếp theo nhé!`,
    });
  }
  if (targetCounts.dialogueTurns >= 8) {
    dialogueTurns.push(
      { speaker: 'Alex', text: `Agreed! Let's review the pronunciation once more.`, meaning: `Đồng ý! Hãy cùng nghe lại phát âm một lần nữa nhé.` },
      { speaker: 'Taylor', text: `Sounds like a solid plan. Here we go!`, meaning: `Kế hoạch rất chắc chắn. Chúng ta bắt đầu thôi!` }
    );
  }

  // 4. Build Multi-Modal Interactive Exercises (Matching, Word Order, Error Correction, Translation, Listen Choose)
  const exerciseList = [];

  // Ex 1: MATCHING PAIRS (Interactive Game)
  const matchingSlice = vocabsFormatted.slice(0, 4);
  exerciseList.push({
    type: 'MATCHING',
    question: `Nối từ tiếng Anh với nghĩa tiếng Việt tương ứng:`,
    options: JSON.stringify({
      pairs: matchingSlice.map((m) => ({ en: m.word, vi: m.meaning })),
    }),
    correctAnswer: matchingSlice.map((m) => `${m.word}:${m.meaning}`).join('|'),
    explanation: `Ghép đúng tất cả các cặp từ vựng trọng tâm trong bài học.`,
  });

  // Ex 2: WORD ORDER (Sắp xếp từ thành câu)
  const sentenceToArrange = primaryVocab.example || `I practice English every single day.`;
  const cleanWords = sentenceToArrange.replace(/[.,!?"']/g, '').split(/\s+/).slice(0, 6);
  exerciseList.push({
    type: 'WORD_ORDER',
    question: `Sắp xếp các từ sau thành câu tiếng Anh hoàn chỉnh:`,
    options: JSON.stringify([...cleanWords].sort(() => 0.5 - Math.random())),
    correctAnswer: cleanWords.join(' '),
    explanation: `Trật tự câu chuẩn ngữ pháp tiếng Anh: "${cleanWords.join(' ')}".`,
  });

  // Ex 3: FILL_BLANK_INPUT (Gõ từ còn thiếu)
  exerciseList.push({
    type: 'FILL_BLANK',
    question: `Chọn từ thích hợp để hoàn thành câu: "In daily life, ${primaryVocab.word} is _____."`,
    options: JSON.stringify([
      primaryVocab.meaning,
      'không cần thiết',
      'bị cấm đoán',
      'vô nghĩa'
    ]),
    correctAnswer: primaryVocab.meaning,
    explanation: `Từ "${primaryVocab.word}" mang nghĩa là "${primaryVocab.meaning}".`,
  });

  // Ex 4: LISTEN_CHOOSE (Nghe phát âm rồi chọn từ)
  exerciseList.push({
    type: 'LISTEN_CHOOSE',
    question: `Bấm loa nghe phát âm và chọn đúng từ vựng bạn vừa nghe:`,
    options: JSON.stringify([
      secondaryVocab.word,
      'Computer',
      'Umbrella',
      'Telephone'
    ]),
    correctAnswer: secondaryVocab.word,
    explanation: `Phát âm chuẩn IPA của từ là ${secondaryVocab.pronunciation} - "${secondaryVocab.word}".`,
  });

  // Ex 5: ERROR_CORRECTION (Tìm và sửa lỗi sai)
  exerciseList.push({
    type: 'ERROR_CORRECTION',
    question: `Tìm lỗi sai trong câu: "She study English every day with high motivation."`,
    options: JSON.stringify([
      'study → studies',
      'English → Englishes',
      'with → at',
      'high → highly'
    ]),
    correctAnswer: 'study → studies',
    explanation: `Chủ ngữ "She" là ngôi thứ ba số ít, động từ "study" cần chia thành "studies".`,
  });

  // Ex 6: TRANSLATION (Dịch câu)
  exerciseList.push({
    type: 'TRANSLATION',
    question: `Dịch câu sau sang tiếng Anh: "Tôi học từ vựng mới mỗi ngày."`,
    options: JSON.stringify([
      'I learn new vocabulary every day.',
      'I learning new vocabulary every day.',
      'I learns new vocabulary everyday.',
      'Me learn new vocabulary daily.'
    ]),
    correctAnswer: 'I learn new vocabulary every day.',
    explanation: `Cấu trúc thì hiện tại đơn với chủ ngữ "I": S + V(nguyên thể) + O.`,
  });

  // Scale up for higher levels (B1, B2, C1, C2)
  if (targetCounts.exerciseQs >= 7) {
    exerciseList.push({
      type: 'MULTIPLE_CHOICE',
      question: `Từ nào sau đây là từ đồng nghĩa hoặc có nét nghĩa gần nhất với "${thirdVocab.word}"?`,
      options: JSON.stringify([
        thirdVocab.word,
        'Impossible',
        'Different',
        'Unlikely'
      ]),
      correctAnswer: thirdVocab.word,
      explanation: `"${thirdVocab.word}" biểu đạt nghĩa: ${thirdVocab.meaning}.`,
    });
  }

  if (targetCounts.exerciseQs >= 8) {
    exerciseList.push({
      type: 'MULTIPLE_CHOICE',
      question: `Trong ngữ cảnh chủ đề "${title}", từ "${fourthVocab.word}" (${fourthVocab.meaning}) đóng vai trò là loại từ gì?`,
      options: JSON.stringify([
        fourthVocab.partOfSpeech,
        'conjunction',
        'interjection',
        'preposition'
      ]),
      correctAnswer: fourthVocab.partOfSpeech,
      explanation: `"${fourthVocab.word}" là một ${fourthVocab.partOfSpeech} trong ngữ pháp tiếng Anh.`,
    });
  }

  // 5. Build Comprehensive Final Quiz (10 to 20 questions)
  const quizList = [];
  for (let qIdx = 0; qIdx < targetCounts.quizQs; qIdx++) {
    const v = vocabsFormatted[qIdx % vocabsFormatted.length] || primaryVocab;
    const distractor1 = vocabsFormatted[(qIdx + 1) % vocabsFormatted.length]?.meaning || 'Cái bàn';
    const distractor2 = vocabsFormatted[(qIdx + 2) % vocabsFormatted.length]?.meaning || 'Ngôi nhà';
    const distractor3 = vocabsFormatted[(qIdx + 3) % vocabsFormatted.length]?.meaning || 'Quyển sách';

    if (qIdx % 3 === 0) {
      // Meaning selection
      quizList.push({
        question: `Nghĩa tiếng Việt chuẩn xác của từ "${v.word}" là gì?`,
        options: JSON.stringify([v.meaning, distractor1, distractor2, distractor3]),
        correctAnswer: v.meaning,
        explanation: `"${v.word}" có phiên âm ${v.pronunciation} và mang nghĩa là "${v.meaning}".`,
      });
    } else if (qIdx % 3 === 1) {
      // Word completion in sentence
      quizList.push({
        question: `Hoàn thiện câu: "In our study session on ${title}, we need to practice _____."`,
        options: JSON.stringify([v.word, 'bananas', 'airplanes', 'umbrellas']),
        correctAnswer: v.word,
        explanation: `"${v.word}" (${v.meaning}) là từ vựng chính xác trong ngữ cảnh chủ đề ${title}.`,
      });
    } else {
      // Grammar / usage application
      quizList.push({
        question: `Câu nào dưới đây sử dụng đúng ngữ pháp và cấu trúc của bài học?`,
        options: JSON.stringify([
          `We use "${v.word}" effectively in communication.`,
          `We using "${v.word}" effective.`,
          `We uses "${v.word}" wrongly.`,
          `We is use "${v.word}".`
        ]),
        correctAnswer: `We use "${v.word}" effectively in communication.`,
        explanation: `Chủ ngữ số nhiều "We" đi với động từ nguyên mẫu "use" và trạng từ "effectively".`,
      });
    }
  }

  return {
    orderNumber,
    title,
    description,
    level,
    category,
    durationMinutes,
    vocabularies: vocabsFormatted,
    grammarPoints: [
      {
        title: grammarRuleTitle,
        explanation: grammarExplanation,
        formula: grammarFormula,
        examples: JSON.stringify({
          list: grammar.examples || [
            { en: `Example sentence for ${title}.`, vi: `Câu ví dụ minh họa cho chủ đề ${title}.` },
            { en: `She uses ${primaryVocab.word} with confidence.`, vi: `Cô ấy sử dụng từ ${primaryVocab.word} với sự tự tin.` },
            { en: `They practice ${secondaryVocab.word} every day.`, vi: `Họ luyện tập ${secondaryVocab.word} mỗi ngày.` },
          ],
          questions: grammarPracticeList,
        }),
      },
    ],
    listenings: [
      {
        title: listening.title || `Luyện nghe bài ${orderNumber}: ${title}`,
        transcript: listeningTranscript,
        audioUrl: listening.audioUrl || null,
        questions: JSON.stringify(listeningQuestionsList),
      },
    ],
    conversations: [
      {
        title: conversation.title || `Hội thoại: ${title}`,
        context: conversation.context || `Tình huống đàm thoại thực tế theo vai về chủ đề ${title}.`,
        dialogue: JSON.stringify(dialogueTurns),
      },
    ],
    exercises: exerciseList,
    quizzes: quizList,
  };
}

module.exports = { createLesson };
