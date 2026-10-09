// helper.js - Lesson generation helper
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
  return {
    orderNumber,
    title,
    description,
    level,
    category,
    durationMinutes,
    vocabularies: vocabularies.map((v) => ({
      word: v.word,
      meaning: v.meaning,
      pronunciation: v.pronunciation || '/.../',
      partOfSpeech: v.partOfSpeech || 'noun',
      example: v.example || `I use ${v.word} every day.`,
      exampleMeaning: v.exampleMeaning || `Tôi sử dụng ${v.word} mỗi ngày.`,
      category: category,
      level: level,
    })),
    grammarPoints: [
      {
        title: grammar.title || 'Ngữ pháp trọng điểm',
        explanation: grammar.explanation || 'Quy tắc ngữ pháp căn bản trong bài học.',
        formula: grammar.formula || 'S + V + O',
        examples: JSON.stringify(grammar.examples || [
          { en: 'She learns English.', vi: 'Cô ấy học tiếng Anh.' },
          { en: 'They practice speaking.', vi: 'Họ luyện nói.' },
        ]),
      },
    ],
    listenings: [
      {
        title: listening.title || `Luyện nghe bài ${orderNumber}: ${title}`,
        transcript: listening.transcript || 'Hello, welcome to this English listening lesson. Practice makes perfect.',
        audioUrl: listening.audioUrl || null,
        questions: JSON.stringify(listening.questions || [
          {
            question: 'What is the main topic of the audio?',
            options: [title, 'Something else', 'Sports', 'Cooking'],
            correctAnswer: title,
            explanation: `Đoạn audio nói về chủ đề: ${title}.`,
          },
          {
            question: 'Is this topic useful for daily communication?',
            options: ['Yes, very useful', 'No, not at all', 'Never', 'Rarely'],
            correctAnswer: 'Yes, very useful',
            explanation: 'Nội dung rất thiết thực trong giao tiếp.',
          },
        ]),
      },
    ],
    conversations: [
      {
        title: conversation.title || `Hội thoại: ${title}`,
        context: conversation.context || `Tình huống đàm thoại thực tế về ${title}.`,
        dialogue: JSON.stringify(conversation.dialogue || [
          { speaker: 'A', text: `Hello, let's talk about ${title}.`, meaning: `Xin chào, hãy cùng nói về ${title}.` },
          { speaker: 'B', text: 'Sure! I am very interested in this.', meaning: 'Chắc chắn rồi! Mình rất hứng thú với chủ đề này.' },
          { speaker: 'A', text: 'What do you think is most important?', meaning: 'Bạn nghĩ điều gì là quan trọng nhất?' },
          { speaker: 'B', text: 'Practice every day with good habits.', meaning: 'Luyện tập mỗi ngày với thói quen tốt.' },
        ]),
      },
    ],
    exercises: exercises.length > 0 ? exercises.map((e) => ({
      type: e.type || 'MULTIPLE_CHOICE',
      question: e.question,
      options: e.options ? JSON.stringify(e.options) : null,
      correctAnswer: e.correctAnswer,
      explanation: e.explanation || '',
    })) : [
      {
        type: 'MULTIPLE_CHOICE',
        question: `Từ nào sau đây liên quan trực tiếp đến "${title}"?`,
        options: JSON.stringify([vocabularies[0]?.word || 'English', 'Pencil', 'Banana', 'Window']),
        correctAnswer: vocabularies[0]?.word || 'English',
        explanation: `${vocabularies[0]?.word || 'English'} là từ khóa chính trong bài học.`,
      },
      {
        type: 'FILL_BLANK',
        question: `Điền từ thích hợp: "We study _____ in this lesson."`,
        options: JSON.stringify([vocabularies[1]?.word || 'words', 'apple', 'car', 'door']),
        correctAnswer: vocabularies[1]?.word || 'words',
        explanation: `Đáp án đúng là "${vocabularies[1]?.word || 'words'}".`,
      },
      {
        type: 'WORD_ORDER',
        question: 'Sắp xếp các từ thành câu đúng ngữ pháp:',
        options: JSON.stringify(['I', 'practice', 'English', 'every', 'day']),
        correctAnswer: 'I practice English every day',
        explanation: 'Cấu trúc câu khẳng định: S + V + O + Trạng ngữ thời gian.',
      },
    ],
    quizzes: quizzes.length > 0 ? quizzes.map((q) => ({
      question: q.question,
      options: JSON.stringify(q.options),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
    })) : [
      {
        question: `Nghĩa tiếng Việt của từ "${vocabularies[0]?.word || 'Word'}" là gì?`,
        options: JSON.stringify([vocabularies[0]?.meaning || 'Nghĩa đúng', 'Cái bàn', 'Quyển sách', 'Con mèo']),
        correctAnswer: vocabularies[0]?.meaning || 'Nghĩa đúng',
        explanation: `"${vocabularies[0]?.word}" có nghĩa là: ${vocabularies[0]?.meaning}.`,
      },
      {
        question: `Chọn từ tiếng Anh có nghĩa là "${vocabularies[1]?.meaning || 'Từ vựng'}":`,
        options: JSON.stringify([vocabularies[1]?.word || 'Word', 'Table', 'Computer', 'Phone']),
        correctAnswer: vocabularies[1]?.word || 'Word',
        explanation: `Đáp án chính xác là "${vocabularies[1]?.word}".`,
      },
      {
        question: `Câu nào sau đây sử dụng đúng ngữ pháp của bài học?`,
        options: JSON.stringify([
          grammar.examples?.[0]?.en || 'She learns English every day.',
          'She learn English every day.',
          'She learning English every day.',
          'She are learn English.',
        ]),
        correctAnswer: grammar.examples?.[0]?.en || 'She learns English every day.',
        explanation: 'Chủ ngữ ngôi thứ 3 số ít đi với động từ chia theo thì phù hợp.',
      },
    ],
  };
}

module.exports = { createLesson };
