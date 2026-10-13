// helper.js - Lesson generation helper with 7-step roadmap data (Multi-point grammar, specific listening, reading comprehension)
const ipaDictionary = require('./ipaDictionary.json');
const { getCreativeSentenceForWord } = require('./contextSentenceBank');

function makeUnique4Options(correctAnswer, candidateDistractors = [], fallbackDistractors = []) {
  const norm = (s) => (typeof s === 'string' ? s.trim().toLowerCase() : String(s));
  const correctNorm = norm(correctAnswer);

  const seen = new Set([correctNorm]);
  const pool = [];

  for (const item of [...candidateDistractors, ...fallbackDistractors]) {
    const itemNorm = norm(item);
    if (item && !seen.has(itemNorm)) {
      seen.add(itemNorm);
      pool.push(item);
      if (pool.length === 3) break;
    }
  }

  while (pool.length < 3) {
    pool.push(`Lựa chọn bổ trợ ${pool.length + 1}`);
  }

  const result = [correctAnswer, ...pool.slice(0, 3)];
  // Controlled pseudo-random shuffle
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

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

    const hasAuthenticExample = v.example &&
      !v.example.includes('in daily conversation') &&
      !v.example.includes('practice using') &&
      !v.example.toLowerCase().startsWith('i use ');

    const creativeObj = getCreativeSentenceForWord(v.word, v.partOfSpeech, category, v.meaning);

    return {
      word: v.word,
      meaning: v.meaning,
      pronunciation: ipa,
      partOfSpeech: v.partOfSpeech || 'noun',
      example: hasAuthenticExample ? v.example : creativeObj.sentence,
      exampleMeaning: hasAuthenticExample && v.exampleMeaning ? v.exampleMeaning : `Ví dụ minh họa: ${creativeObj.sentence}`,
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
      question: `What is the speaker's name in the audio?`,
      options: makeUnique4Options(speakerName, ['Emma', 'Sarah', 'Laura', 'Sophie']),
      correctAnswer: speakerName,
      explanation: `The audio opens with the introduction: "My name is ${speakerName}."`,
    },
    {
      question: `How old is the speaker and where does she live?`,
      options: makeUnique4Options(
        `${speakerAge} years old, living in ${speakerCity}`,
        [
          '22 years old, living in Manchester',
          '20 years old, living in Edinburgh',
          '23 years old, living in Bristol',
        ]
      ),
      correctAnswer: `${speakerAge} years old, living in ${speakerCity}`,
      explanation: `In the audio, the speaker says: "I am ${speakerAge} years old and I currently live in ${speakerCity}."`,
    },
    {
      question: `What is the speaker's current occupation or role?`,
      options: makeUnique4Options(
        'University student studying languages',
        [
          'Graduate teaching assistant in linguistics',
          'Intern at an international cultural exchange center',
          'Part-time language peer tutor',
        ]
      ),
      correctAnswer: 'University student studying languages',
      explanation: `The speaker clearly states: "I am a university student studying languages."`,
    },
    {
      question: `Which vocabulary word did the speaker practice yesterday afternoon?`,
      options: makeUnique4Options(
        secondaryVocab.word,
        [primaryVocab.word, thirdVocab.word, fourthVocab.word, 'Vocabulary', 'Grammar']
      ),
      correctAnswer: secondaryVocab.word,
      explanation: `The speaker mentions: "Yesterday afternoon, I spent one hour practicing '${secondaryVocab.word}' with my classmates."`,
    },
    {
      question: `According to the speaker, what is the best secret to becoming confident?`,
      options: makeUnique4Options(
        'Practicing for fifteen minutes every day',
        [
          'Memorizing fifty words without speaking practice',
          'Reviewing grammar rules once a month',
          'Writing complex essays before practicing basic conversation',
        ]
      ),
      correctAnswer: 'Practicing for fifteen minutes every day',
      explanation: `The speaker recommends: "practicing for fifteen minutes every day is the best secret to becoming confident."`,
    },
  ];

  // 3. Build Reading Comprehension Passage & 5 MCQs
  const readingPassage = reading.passage ||
    `Mastering the theme of "${title}" is a valuable step for every English learner at level ${level}.\n\nWhen exploring this topic, everyday words such as "${primaryVocab.word}" and "${secondaryVocab.word}" serve as the foundational building blocks. Language experts recommend that beginners should not merely memorize isolated definitions. Instead, connecting new vocabulary to real-life situations creates lasting memory pathways in the brain.\n\nFor example, when you understand how "${thirdVocab.word}" functions within a complete sentence, you gain the confidence to express your thoughts clearly. Studies show that students who spend twenty minutes daily reading and repeating sentences aloud progress twice as fast as passive learners. Consistency, curiosity, and patience are the three essential keys to language mastery.`;

  const readingTranslation = reading.translation ||
    `Làm chủ chủ đề "${title}" là một bước tiến giá trị cho mọi người học tiếng Anh ở trình độ ${level}.\n\nKhi khám phá chủ đề này, những từ vựng quen thuộc như "${primaryVocab.word}" (${primaryVocab.meaning}) và "${secondaryVocab.word}" (${secondaryVocab.meaning}) đóng vai trò là những viên gạch nền tảng. Các chuyên gia ngôn ngữ khuyên rằng người mới bắt đầu không nên chỉ học vẹt các định nghĩa rời rạc. Thay vào đó, việc liên kết từ mới với các tình huống đời thực sẽ tạo ra những đường dẫn ghi nhớ lâu dài trong não bộ.\n\nVí dụ, khi bạn hiểu cách từ "${thirdVocab.word}" hoạt động trong một câu hoàn chỉnh, bạn sẽ có được sự tự tin để diễn đạt suy nghĩ một cách rõ ràng. Các nghiên cứu chỉ ra rằng những học viên dành hai mươi phút mỗi ngày để đọc và nhắc lại to các câu mẫu sẽ tiến bộ nhanh gấp đôi so với người học thụ động. Sự kiên trì, lòng tò mò và tính kiên nhẫn chính là ba chìa khóa thiết yếu để làm chủ ngôn ngữ.`;

  const readingQuestionsList = [
    {
      question: `What is the main topic of the reading passage?`,
      options: makeUnique4Options(
        `The importance and effective methods of mastering ${title}`,
        [
          `A comparative study on exam preparation strategies versus independent learning`,
          `The psychological techniques for overcoming anxiety in public speaking`,
          `A historical overview of grammatical shifts in modern English communication`,
        ]
      ),
      correctAnswer: `The importance and effective methods of mastering ${title}`,
      explanation: `The passage primarily highlights the value and learning strategies for "${title}".`,
    },
    {
      question: `What do language experts recommend instead of memorizing isolated definitions?`,
      options: makeUnique4Options(
        'Connecting new vocabulary to real-life situations',
        [
          'Reviewing vocabulary lists only once every two weeks',
          'Translating full paragraphs word-for-word into mother tongue',
          'Focusing exclusively on grammatical formulas without practicing sentences',
        ]
      ),
      correctAnswer: 'Connecting new vocabulary to real-life situations',
      explanation: `The passage recommends connecting new vocabulary to real-life situations to create lasting memory pathways.`,
    },
    {
      question: `According to the passage, how much daily reading practice helps learners progress twice as fast?`,
      options: makeUnique4Options(
        'Twenty minutes daily',
        [
          'Forty-five minutes twice a week',
          'One hour every weekend',
          'Ten minutes before bedtime',
        ]
      ),
      correctAnswer: 'Twenty minutes daily',
      explanation: `The author notes that spending twenty minutes daily reading and repeating sentences aloud doubles learning progress.`,
    },
    {
      question: `In the passage, why is the word "${primaryVocab.word}" highlighted?`,
      options: makeUnique4Options(
        `It serves as a foundational building block for the topic ${title}`,
        [
          `It represents an exceptional irregular verb form to memorize`,
          `It is an advanced idiom reserved only for academic writing`,
          `It is primarily used as a formal greeting in business emails`,
        ]
      ),
      correctAnswer: `It serves as a foundational building block for the topic ${title}`,
      explanation: `The text points out that words like "${primaryVocab.word}" serve as foundational building blocks.`,
    },
    {
      question: `What are the three essential keys to language mastery mentioned in the conclusion?`,
      options: makeUnique4Options(
        'Consistency, curiosity, and patience',
        [
          'Speed, repetition, and memorization',
          'Fluency, grammar rules, and translation',
          'Confidence, vocabulary breadth, and accent',
        ]
      ),
      correctAnswer: 'Consistency, curiosity, and patience',
      explanation: `The passage concludes that consistency, curiosity, and patience are the three essential keys.`,
    },
  ];

  // 4. Build Multi-Modal Interactive Exercises
  const exerciseList = [];

  // Ex 1: MATCHING PAIRS (Interactive Game)
  const matchingSlice = vocabsFormatted.slice(0, 4);
  exerciseList.push({
    type: 'MATCHING',
    question: `Match each English word with its corresponding meaning:`,
    options: JSON.stringify({
      pairs: matchingSlice.map((m) => ({ en: m.word, vi: m.meaning })),
    }),
    correctAnswer: matchingSlice.map((m) => `${m.word}:${m.meaning}`).join('|'),
    explanation: `Correctly match all key vocabulary pairs from the lesson.`,
  });

  // Ex 2: WORD ORDER (Sắp xếp từ thành câu)
  const sentenceToArrange = (primaryVocab.example && !primaryVocab.example.includes('in daily conversation'))
    ? primaryVocab.example
    : `We practice English every single day.`;
  const cleanWords = sentenceToArrange.replace(/[.,!?"']/g, '').split(/\s+/).slice(0, 6);
  exerciseList.push({
    type: 'WORD_ORDER',
    question: `Arrange the words to make a complete English sentence:`,
    options: JSON.stringify([...cleanWords].sort(() => 0.5 - Math.random())),
    correctAnswer: cleanWords.join(' '),
    explanation: `Standard English sentence structure: "${cleanWords.join(' ')}".`,
  });

  // Ex 3: FILL_BLANK (Chọn từ thích hợp)
  exerciseList.push({
    type: 'FILL_BLANK',
    question: `Choose the correct meaning: In daily life, "${primaryVocab.word}" means _____.`,
    options: JSON.stringify(
      makeUnique4Options(
        primaryVocab.meaning,
        vocabsFormatted.filter((x) => x.word !== primaryVocab.word).map((x) => x.meaning),
        ['học tập', 'giao tiếp', 'luyện tập']
      )
    ),
    correctAnswer: primaryVocab.meaning,
    explanation: `The word "${primaryVocab.word}" means "${primaryVocab.meaning}".`,
  });

  // Ex 4: LISTEN_CHOOSE (Nghe phát âm rồi chọn từ)
  exerciseList.push({
    type: 'LISTEN_CHOOSE',
    question: `Listen to the audio and choose the correct word you heard:`,
    options: JSON.stringify(
      makeUnique4Options(
        secondaryVocab.word,
        vocabsFormatted.filter((x) => x.word !== secondaryVocab.word).map((x) => x.word),
        ['Practice', 'Study', 'Language']
      )
    ),
    correctAnswer: secondaryVocab.word,
    explanation: `Standard IPA pronunciation is ${secondaryVocab.pronunciation} - "${secondaryVocab.word}".`,
  });

  // Ex 5: ERROR_CORRECTION (Tìm và sửa lỗi sai)
  exerciseList.push({
    type: 'ERROR_CORRECTION',
    question: `Find the error in the sentence: "She study English every day with high motivation."`,
    options: JSON.stringify([
      'study → studies',
      'English → Englishes',
      'with → at',
      'high → highly',
    ]),
    correctAnswer: 'study → studies',
    explanation: `The subject "She" is third-person singular, so the verb "study" must be changed to "studies".`,
  });

  // Ex 6: TRANSLATION (Dịch câu)
  exerciseList.push({
    type: 'TRANSLATION',
    question: `Translate the following sentence into English: "Tôi học từ vựng mới mỗi ngày."`,
    options: JSON.stringify([
      'I learn new vocabulary every day.',
      'I learning new vocabulary every day.',
      'I learns new vocabulary everyday.',
      'Me learn new vocabulary daily.',
    ]),
    correctAnswer: 'I learn new vocabulary every day.',
    explanation: `Present simple tense with subject "I": S + V(base) + O.`,
  });

  // Scale up for higher levels
  if (targetCounts.exerciseQs >= 7) {
    exerciseList.push({
      type: 'MULTIPLE_CHOICE',
      question: `Which of the following words is the closest in meaning to "${thirdVocab.word}"?`,
      options: JSON.stringify(
        makeUnique4Options(
          thirdVocab.word,
          vocabsFormatted.filter((x) => x.word !== thirdVocab.word).map((x) => x.word),
          ['Expression', 'Practice', 'Concept']
        )
      ),
      correctAnswer: thirdVocab.word,
      explanation: `"${thirdVocab.word}" conveys the meaning: ${thirdVocab.meaning}.`,
    });
  }

  if (targetCounts.exerciseQs >= 8) {
    exerciseList.push({
      type: 'MULTIPLE_CHOICE',
      question: `In the context of "${title}", what part of speech is "${fourthVocab.word}"?`,
      options: JSON.stringify(
        makeUnique4Options(
          fourthVocab.partOfSpeech || 'noun',
          ['adjective', 'verb', 'adverb', 'preposition', 'pronoun'].filter((pos) => pos !== (fourthVocab.partOfSpeech || 'noun'))
        )
      ),
      correctAnswer: fourthVocab.partOfSpeech,
      explanation: `"${fourthVocab.word}" functions as a ${fourthVocab.partOfSpeech} in English grammar.`,
    });
  }

  // 5. Build Comprehensive Final Quiz
  const quizList = [];
  for (let qIdx = 0; qIdx < targetCounts.quizQs; qIdx++) {
    const v = vocabsFormatted[qIdx % vocabsFormatted.length] || primaryVocab;

    const otherVocabsSamePos = vocabsFormatted.filter((o) => o.word !== v.word && o.partOfSpeech === v.partOfSpeech);
    const otherVocabsAny = vocabsFormatted.filter((o) => o.word !== v.word);
    const distractorPoolMeanings = [...otherVocabsSamePos, ...otherVocabsAny].map((o) => o.meaning);
    const distractorPoolWords = [...otherVocabsSamePos, ...otherVocabsAny].map((o) => o.word);

    if (qIdx % 3 === 0) {
      quizList.push({
        question: `What is the accurate meaning of the word "${v.word}"?`,
        options: JSON.stringify(
          makeUnique4Options(v.meaning, distractorPoolMeanings, ['Ý niệm', 'Cấu trúc', 'Ngữ cảnh'])
        ),
        correctAnswer: v.meaning,
        explanation: `"${v.word}" is pronounced ${v.pronunciation} and means "${v.meaning}".`,
      });
    } else if (qIdx % 3 === 1) {
      quizList.push({
        question: `Complete the sentence: "In our study session on ${title}, we need to practice _____."`,
        options: JSON.stringify(
          makeUnique4Options(v.word, distractorPoolWords, ['Vocabulary', 'Grammar', 'Listening'])
        ),
        correctAnswer: v.word,
        explanation: `"${v.word}" (${v.meaning}) is the correct vocabulary word in the context of ${title}.`,
      });
    } else {
      quizList.push({
        question: `Which of the following sentences uses the correct grammar and structure of the lesson?`,
        options: JSON.stringify(
          makeUnique4Options(
            `We use "${v.word}" effectively in communication.`,
            [
              `We using "${v.word}" effective.`,
              `We uses "${v.word}" wrongly.`,
              `We is use "${v.word}".`,
            ]
          )
        ),
        correctAnswer: `We use "${v.word}" effectively in communication.`,
        explanation: `The plural subject "We" takes the base verb "use" and the adverb "effectively".`,
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
