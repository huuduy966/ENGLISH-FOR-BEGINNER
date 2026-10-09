// helper.js - Lesson generation helper with 7-step roadmap data (Multi-point grammar, specific listening, reading comprehension)
const ipaDictionary = require('./ipaDictionary.json');

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
  reading = {},
  conversation = {},
  exercises = [],
  quizzes = [],
}) {
  // Determine question quotas based on CEFR level
  const targetCounts = {
    A1: { quizQs: 10, exerciseQs: 6 },
    A2: { quizQs: 12, exerciseQs: 7 },
    B1: { quizQs: 15, exerciseQs: 8 },
    B2: { quizQs: 15, exerciseQs: 8 },
    C1: { quizQs: 18, exerciseQs: 10 },
    C2: { quizQs: 20, exerciseQs: 10 },
  }[level] || { quizQs: 10, exerciseQs: 6 };

  const vocabsFormatted = vocabularies.map((v) => {
    const cleanKey = v.word.toLowerCase().trim();
    // Prioritize Cambridge standard IPA from dictionary with syllable dots
    const ipa = ipaDictionary[cleanKey] || v.pronunciation || `/${cleanKey}/`;

    return {
      word: v.word,
      meaning: v.meaning,
      pronunciation: ipa,
      partOfSpeech: v.partOfSpeech || 'noun',
      example: v.example || `I use ${v.word} in daily conversation.`,
      exampleMeaning: v.exampleMeaning || `Tôi sử dụng từ ${v.word} trong giao tiếp hàng ngày.`,
      category: category,
      level: level,
    };
  });

  const primaryVocab = vocabsFormatted[0] || { word: 'English', meaning: 'Tiếng Anh', pronunciation: '/ˈɪŋɡlɪʃ/' };
  const secondaryVocab = vocabsFormatted[1] || { word: 'Study', meaning: 'Học tập', pronunciation: '/ˈstʌdi/' };
  const thirdVocab = vocabsFormatted[2] || { word: 'Practice', meaning: 'Luyện tập', pronunciation: '/ˈpræktɪs/' };
  const fourthVocab = vocabsFormatted[3] || { word: 'Language', meaning: 'Ngôn ngữ', pronunciation: '/ˈlæŋɡwɪdʒ/' };

  // 1. Build Multi-Point Grammar Points (No practice questions)
  const grammarRuleTitle = grammar.title || `Cấu trúc trọng tâm: ${title}`;
  const grammarFormula = grammar.formula || 'S + V + O';
  const grammarExplanation = grammar.explanation || `Hướng dẫn cấu trúc ngữ pháp then chốt cho chủ đề ${title}.`;

  const grammarPointsList = [
    {
      title: `${grammarRuleTitle} (Dạng khẳng định)`,
      formula: grammarFormula,
      explanation: `${grammarExplanation} Dạng khẳng định dùng để diễn đạt sự thật, thói quen hoặc thông tin cơ bản liên quan đến "${title}".`,
      examples: JSON.stringify([
        {
          en: `I use "${primaryVocab.word}" regularly when communicating with others.`,
          vi: `Tôi sử dụng từ "${primaryVocab.word}" thường xuyên khi giao tiếp với mọi người.`,
        },
        {
          en: `She practices "${secondaryVocab.word}" every morning to improve her skills.`,
          vi: `Cô ấy luyện tập "${secondaryVocab.word}" mỗi sáng để nâng cao kỹ năng của mình.`,
        },
        {
          en: `We understand the importance of "${thirdVocab.word}" in real-life contexts.`,
          vi: `Chúng tôi thấu hiểu tầm quan trọng của "${thirdVocab.word}" trong các ngữ cảnh đời thực.`,
        },
      ]),
    },
    {
      title: `Thể phủ định và nghi vấn (Câu hỏi & Từ chối) - ${title}`,
      formula: `S + do/does not + V... | Do/Does + S + V...?`,
      explanation: `Khi muốn phủ định hoặc đặt câu hỏi về chủ đề ${title}, hãy sử dụng trợ động từ phù hợp với chủ ngữ. Động từ chính luôn quay về dạng nguyên mẫu.`,
      examples: JSON.stringify([
        {
          en: `I do not forget to practice "${primaryVocab.word}" every single day.`,
          vi: `Tôi không quên luyện tập "${primaryVocab.word}" mỗi ngày.`,
        },
        {
          en: `Does he know how to apply "${secondaryVocab.word}" correctly?`,
          vi: `Cậu ấy có biết cách áp dụng "${secondaryVocab.word}" một cách chính xác không?`,
        },
        {
          en: `They do not have any difficulty with "${thirdVocab.word}".`,
          vi: `Họ không gặp bất kỳ khó khăn nào với "${thirdVocab.word}".`,
        },
      ]),
    },
    {
      title: `Lưu ý sử dụng & Phân biệt các cấu trúc dễ nhầm lẫn`,
      formula: `Phân biệt cách dùng thực tế trong giao tiếp`,
      explanation: `Học viên thường hay nhầm lẫn giữa việc dịch từng từ (word-by-word) từ tiếng Việt sang tiếng Anh. Hãy chú ý chia động từ theo ngôi số ít (he/she/it) và sử dụng đúng giới từ đi kèm.`,
      examples: JSON.stringify([
        {
          en: `He always remembers: "${primaryVocab.word}" has a specific pronunciation: ${primaryVocab.pronunciation}.`,
          vi: `Anh ấy luôn ghi nhớ: "${primaryVocab.word}" có phát âm cụ thể là ${primaryVocab.pronunciation}.`,
        },
        {
          en: `Avoid saying wrong words; choose "${secondaryVocab.word}" for natural expression.`,
          vi: `Tránh dùng từ sai; hãy chọn "${secondaryVocab.word}" để diễn đạt tự nhiên nhất.`,
        },
      ]),
    },
  ];

  // 2. Build Realistic Listening Audio Transcript and 5 Specific Detail Questions
  const speakerName = 'Anna';
  const speakerAge = '21';
  const speakerCity = 'London';
  const speakerJob = 'sinh viên chuyên ngành Ngôn ngữ';

  const listeningTranscript = listening.transcript ||
    `Hello everyone! My name is ${speakerName}. I am ${speakerAge} years old and I currently live in ${speakerCity}. I am a university student studying languages. Today, I am very excited to share my experience with ${title}. In my daily routine, I frequently use the word "${primaryVocab.word}" when talking with friends. Yesterday afternoon, I spent one hour practicing "${secondaryVocab.word}" with my classmates. In addition, knowing how to use "${thirdVocab.word}" correctly helps me communicate much more naturally. I believe that practicing for fifteen minutes every day is the best secret to becoming confident. Thank you very much for listening!`;

  const listeningQuestionsList = [
    {
      question: `Người nói trong đoạn audio giới thiệu tên của mình là gì?`,
      options: [speakerName, 'David', 'Taylor', 'Jessica'],
      correctAnswer: speakerName,
      explanation: `Đoạn audio mở đầu với lời giới thiệu: "My name is ${speakerName}."`,
    },
    {
      question: `Người nói bao nhiêu tuổi và hiện đang sinh sống ở đâu?`,
      options: [
        `${speakerAge} tuổi, sống tại ${speakerCity}`,
        '18 tuổi, sống tại New York',
        '25 tuổi, sống tại Tokyo',
        '30 tuổi, sống tại Paris',
      ],
      correctAnswer: `${speakerAge} tuổi, sống tại ${speakerCity}`,
      explanation: `Trong bài nghe, người nói chia sẻ: "I am ${speakerAge} years old and I currently live in ${speakerCity}."`,
    },
    {
      question: `Nghề nghiệp / vai trò hiện tại của người nói là gì?`,
      options: [
        'Sinh viên đại học (university student)',
        'Kỹ sư phần mềm',
        'Bác sĩ bệnh viện',
        'Hướng dẫn viên du lịch',
      ],
      correctAnswer: 'Sinh viên đại học (university student)',
      explanation: `Người nói nêu rõ: "I am a university student studying languages."`,
    },
    {
      question: `Người nói đã nhắc đến việc dành thời gian luyện tập từ vựng nào vào chiều hôm qua?`,
      options: [
        secondaryVocab.word,
        'Motorcycle',
        'Helicopter',
        'Refrigerator',
      ],
      correctAnswer: secondaryVocab.word,
      explanation: `Bài nghe có câu: "Yesterday afternoon, I spent one hour practicing '${secondaryVocab.word}' with my classmates."`,
    },
    {
      question: `Theo người nói, bí quyết tốt nhất để trở nên tự tin khi giao tiếp là gì?`,
      options: [
        'Luyện tập 15 phút mỗi ngày (practicing for fifteen minutes every day)',
        'Chỉ học ngữ pháp, không bao giờ nói',
        'Không cần luyện tập nghe nói',
        'Bỏ cuộc ngay khi gặp từ vựng khó',
      ],
      correctAnswer: 'Luyện tập 15 phút mỗi ngày (practicing for fifteen minutes every day)',
      explanation: `Người nói khuyên: "practicing for fifteen minutes every day is the best secret to becoming confident."`,
    },
  ];

  // 3. Build Reading Comprehension Passage & 5 MCQs
  const readingPassage = reading.passage ||
    `Mastering the theme of "${title}" is a valuable step for every English learner at level ${level}.\n\nWhen exploring this topic, everyday words such as "${primaryVocab.word}" (${primaryVocab.meaning}) and "${secondaryVocab.word}" (${secondaryVocab.meaning}) serve as the foundational building blocks. Language experts recommend that beginners should not merely memorize isolated definitions. Instead, connecting new vocabulary to real-life situations creates lasting memory pathways in the brain.\n\nFor example, when you understand how "${thirdVocab.word}" functions within a complete sentence, you gain the confidence to express your thoughts clearly. Studies show that students who spend twenty minutes daily reading and repeating sentences aloud progress twice as fast as passive learners. Consistency, curiosity, and patience are the three essential keys to language mastery.`;

  const readingTranslation = reading.translation ||
    `Làm chủ chủ đề "${title}" là một bước tiến giá trị cho mọi người học tiếng Anh ở trình độ ${level}.\n\nKhi khám phá chủ đề này, những từ vựng quen thuộc như "${primaryVocab.word}" (${primaryVocab.meaning}) và "${secondaryVocab.word}" (${secondaryVocab.meaning}) đóng vai trò là những viên gạch nền tảng. Các chuyên gia ngôn ngữ khuyên rằng người mới bắt đầu không nên chỉ học vẹt các định nghĩa rời rạc. Thay vào đó, việc liên kết từ mới với các tình huống đời thực sẽ tạo ra những đường dẫn ghi nhớ lâu dài trong não bộ.\n\nVí dụ, khi bạn hiểu cách từ "${thirdVocab.word}" hoạt động trong một câu hoàn chỉnh, bạn sẽ có được sự tự tin để diễn đạt suy nghĩ một cách rõ ràng. Các nghiên cứu chỉ ra rằng những học viên dành hai mươi phút mỗi ngày để đọc và nhắc lại to các câu mẫu sẽ tiến bộ nhanh gấp đôi so với người học thụ động. Sự kiên trì, lòng tò mò và tính kiên nhẫn chính là ba chìa khóa thiết yếu để làm chủ ngôn ngữ.`;

  const readingQuestionsList = [
    {
      question: `Ý chính của đoạn văn trên là gì?`,
      options: [
        `Tầm quan trọng và phương pháp học hiệu quả chủ đề ${title}`,
        'Lịch sử ngành hàng không thế giới',
        'Quy trình chế biến các món ăn truyền thống',
        'Dự báo thời tiết các mùa trong năm',
      ],
      correctAnswer: `Tầm quan trọng và phương pháp học hiệu quả chủ đề ${title}`,
      explanation: `Đoạn văn mở đầu và xuyên suốt tập trung vào giá trị cũng như cách học hiệu quả chủ đề "${title}".`,
    },
    {
      question: `Các chuyên gia ngôn ngữ khuyên người mới bắt đầu nên làm gì thay vì chỉ ghi nhớ từ rời rạc?`,
      options: [
        'Liên kết từ mới với tình huống thực tế đời sống',
        'Học thuộc lòng từ điển từ A đến Z',
        'Tránh đọc và tránh luyện phát âm',
        'Chỉ học ngữ pháp mà không cần biết nghĩa từ',
      ],
      correctAnswer: 'Liên kết từ mới với tình huống thực tế đời sống',
      explanation: `Đoạn văn nêu: "connecting new vocabulary to real-life situations creates lasting memory pathways in the brain."`,
    },
    {
      question: `Theo bài đọc, học viên dành bao nhiêu thời gian mỗi ngày đọc to sẽ tiến bộ nhanh gấp đôi?`,
      options: [
        'Hai mươi phút mỗi ngày (twenty minutes daily)',
        'Mười tiếng liên tục vào cuối tuần',
        'Một phút mỗi tháng',
        'Không cần dành thời gian mỗi ngày',
      ],
      correctAnswer: 'Hai mươi phút mỗi ngày (twenty minutes daily)',
      explanation: `Bài viết chỉ ra: "students who spend twenty minutes daily reading and repeating sentences aloud progress twice as fast."`,
    },
    {
      question: `Trong đoạn văn, từ "${primaryVocab.word}" được xem là gì?`,
      options: [
        'Viên gạch nền tảng trong giao tiếp chủ đề ' + title,
        'Từ vựng không cần học',
        'Một thuật ngữ khoa học khó hiểu',
        'Từ cổ không còn dùng trong tiếng Anh hiện đại',
      ],
      correctAnswer: 'Viên gạch nền tảng trong giao tiếp chủ đề ' + title,
      explanation: `Đoạn văn khẳng định: "${primaryVocab.word}" serves as the foundational building block.`,
    },
    {
      question: `Ba chìa khóa thiết yếu để làm chủ ngôn ngữ được nêu ở cuối bài đọc là gì?`,
      options: [
        'Sự kiên trì, lòng tò mò và tính kiên nhẫn (Consistency, curiosity, patience)',
        'Tiền bạc, may mắn và danh vọng',
        'Tốc độ, phán đoán và sự vội vàng',
        'Chỉ dựa vào máy dịch tự động',
      ],
      correctAnswer: 'Sự kiên trì, lòng tò mò và tính kiên nhẫn (Consistency, curiosity, patience)',
      explanation: `Đoạn văn kết luận: "Consistency, curiosity, and patience are the three essential keys to language mastery."`,
    },
  ];

  // 4. Build Multi-Modal Interactive Exercises
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

  // Ex 3: FILL_BLANK (Chọn từ thích hợp)
  exerciseList.push({
    type: 'FILL_BLANK',
    question: `Chọn từ thích hợp để hoàn thành câu: "In daily life, ${primaryVocab.word} is _____."`,
    options: JSON.stringify([
      primaryVocab.meaning,
      'không cần thiết',
      'bị cấm đoán',
      'vô nghĩa',
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
      'Telephone',
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
      'high → highly',
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
      'Me learn new vocabulary daily.',
    ]),
    correctAnswer: 'I learn new vocabulary every day.',
    explanation: `Cấu trúc thì hiện tại đơn với chủ ngữ "I": S + V(nguyên thể) + O.`,
  });

  // Scale up for higher levels
  if (targetCounts.exerciseQs >= 7) {
    exerciseList.push({
      type: 'MULTIPLE_CHOICE',
      question: `Từ nào sau đây là từ đồng nghĩa hoặc có nét nghĩa gần nhất với "${thirdVocab.word}"?`,
      options: JSON.stringify([
        thirdVocab.word,
        'Impossible',
        'Different',
        'Unlikely',
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
        'preposition',
      ]),
      correctAnswer: fourthVocab.partOfSpeech,
      explanation: `"${fourthVocab.word}" là một ${fourthVocab.partOfSpeech} trong ngữ pháp tiếng Anh.`,
    });
  }

  // 5. Build Comprehensive Final Quiz
  const quizList = [];
  for (let qIdx = 0; qIdx < targetCounts.quizQs; qIdx++) {
    const v = vocabsFormatted[qIdx % vocabsFormatted.length] || primaryVocab;
    const distractor1 = vocabsFormatted[(qIdx + 1) % vocabsFormatted.length]?.meaning || 'Cái bàn';
    const distractor2 = vocabsFormatted[(qIdx + 2) % vocabsFormatted.length]?.meaning || 'Ngôi nhà';
    const distractor3 = vocabsFormatted[(qIdx + 3) % vocabsFormatted.length]?.meaning || 'Quyển sách';

    if (qIdx % 3 === 0) {
      quizList.push({
        question: `Nghĩa tiếng Việt chuẩn xác của từ "${v.word}" là gì?`,
        options: JSON.stringify([v.meaning, distractor1, distractor2, distractor3].sort(() => 0.5 - Math.random())),
        correctAnswer: v.meaning,
        explanation: `"${v.word}" có phiên âm ${v.pronunciation} và mang nghĩa là "${v.meaning}".`,
      });
    } else if (qIdx % 3 === 1) {
      quizList.push({
        question: `Hoàn thiện câu: "In our study session on ${title}, we need to practice _____."`,
        options: JSON.stringify([v.word, 'bananas', 'airplanes', 'umbrellas'].sort(() => 0.5 - Math.random())),
        correctAnswer: v.word,
        explanation: `"${v.word}" (${v.meaning}) là từ vựng chính xác trong ngữ cảnh chủ đề ${title}.`,
      });
    } else {
      quizList.push({
        question: `Câu nào dưới đây sử dụng đúng ngữ pháp và cấu trúc của bài học?`,
        options: JSON.stringify([
          `We use "${v.word}" effectively in communication.`,
          `We using "${v.word}" effective.`,
          `We uses "${v.word}" wrongly.`,
          `We is use "${v.word}".`,
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
    grammarPoints: grammarPointsList,
    listenings: [
      {
        title: listening.title || `Luyện nghe bài ${orderNumber}: ${title}`,
        transcript: listeningTranscript,
        audioUrl: listening.audioUrl || null,
        questions: JSON.stringify(listeningQuestionsList),
      },
    ],
    readings: [
      {
        title: reading.title || `Đọc hiểu bài ${orderNumber}: ${title}`,
        passage: readingPassage,
        translation: readingTranslation,
        questions: JSON.stringify(readingQuestionsList),
      },
    ],
    conversations: [],
    exercises: exerciseList,
    quizzes: quizList,
  };
}

module.exports = { createLesson };
