// dataGenerator.js - Generates authentic 60-question daily practice sets per CEFR level
// Structure: 20 Vocabulary + 10 Speaking + 10 Error Correction + 10 Listening + 10 Reading = 60

const curriculum = require('../curriculum');

function generateDailyBankForLevel(level) {
  const levelLessons = curriculum[level] || curriculum.A1;
  const allVocab = levelLessons.flatMap((l) => l.vocabularies || []);

  // ----------------------------------------------------
  // PART 1: VOCABULARY (20 QUESTIONS)
  // ----------------------------------------------------
  const vocabQuestions = [];
  for (let i = 0; i < 20; i++) {
    const v = allVocab[i % allVocab.length] || { word: 'Learn', meaning: 'Học tập', partOfSpeech: 'verb' };
    const d1 = allVocab[(i + 1) % allVocab.length]?.meaning || 'Cái bàn';
    const d2 = allVocab[(i + 2) % allVocab.length]?.meaning || 'Quyển sách';
    const d3 = allVocab[(i + 3) % allVocab.length]?.meaning || 'Ngôi nhà';

    if (i % 3 === 0) {
      // Question: Meaning Selection
      vocabQuestions.push({
        id: `vocab_${level}_${i + 1}`,
        part: 1,
        partName: 'Từ vựng',
        type: 'VOCAB_MEANING',
        question: `Nghĩa tiếng Việt chuẩn xác của từ "${v.word}" là gì?`,
        options: [v.meaning, d1, d2, d3].filter((x, idx, arr) => arr.indexOf(x) === idx),
        correctAnswer: v.meaning,
        explanation: `"${v.word}" mang nghĩa là: ${v.meaning}.`,
      });
    } else if (i % 3 === 1) {
      // Question: Sentence Completion
      const wordD1 = allVocab[(i + 1) % allVocab.length]?.word || 'table';
      const wordD2 = allVocab[(i + 2) % allVocab.length]?.word || 'door';
      const wordD3 = allVocab[(i + 3) % allVocab.length]?.word || 'water';

      vocabQuestions.push({
        id: `vocab_${level}_${i + 1}`,
        part: 1,
        partName: 'Từ vựng',
        type: 'VOCAB_SENTENCE',
        question: `Chọn từ thích hợp để hoàn thành câu: "Every day, I practice using _____ in communication."`,
        options: [v.word, wordD1, wordD2, wordD3].filter((x, idx, arr) => arr.indexOf(x) === idx),
        correctAnswer: v.word,
        explanation: `Từ "${v.word}" (${v.meaning}) phù hợp nhất với ngữ cảnh của câu.`,
      });
    } else {
      // Question: Context Word Choice
      const wordD1 = allVocab[(i + 4) % allVocab.length]?.word || 'easy';
      const wordD2 = allVocab[(i + 5) % allVocab.length]?.word || 'fast';
      const wordD3 = allVocab[(i + 6) % allVocab.length]?.word || 'slow';

      vocabQuestions.push({
        id: `vocab_${level}_${i + 1}`,
        part: 1,
        partName: 'Từ vựng',
        type: 'VOCAB_CONTEXT',
        question: `Chọn từ tiếng Anh có nghĩa là "${v.meaning}":`,
        options: [v.word, wordD1, wordD2, wordD3].filter((x, idx, arr) => arr.indexOf(x) === idx),
        correctAnswer: v.word,
        explanation: `Đáp án chính xác là "${v.word}".`,
      });
    }
  }

  // Ensure each question has exactly 4 options
  vocabQuestions.forEach((q) => {
    while (q.options.length < 4) {
      q.options.push(`Khác ${q.options.length}`);
    }
  });

  // ----------------------------------------------------
  // PART 2: SPEAKING / SITUATIONAL COMMUNICATION (10 QUESTIONS)
  // ----------------------------------------------------
  const speakingSituations = [
    {
      sit: 'Bạn gặp một đồng nghiệp mới vào ngày đầu tiên làm việc.',
      prompt: 'Colleague: "Hello, I just joined the team today. Nice to meet you!"',
      ans: 'Nice to meet you too! Welcome to the team.',
      opts: [
        'Nice to meet you too! Welcome to the team.',
        'No, I don\'t know you.',
        'Why are you here today?',
        'Goodbye, see you never.'
      ],
      exp: 'Lời chào đón thân thiện và lịch thiệp với đồng nghiệp mới: "Nice to meet you too! Welcome to the team."'
    },
    {
      sit: 'Bạn muốn nhờ ai đó giữ cửa thang máy giúp bạn.',
      prompt: 'Bạn đang tiến tới thang máy và sắp đóng cửa:',
      ans: 'Could you please hold the door for a second?',
      opts: [
        'Could you please hold the door for a second?',
        'Open the door right now!',
        'Stop moving immediately!',
        'You are closing the door.'
      ],
      exp: 'Cấu trúc nhờ vả lịch sự: "Could you please hold the door for a second?"'
    },
    {
      sit: 'Một người bạn hỏi cảm nhận của bạn về chuyến du lịch gần đây.',
      prompt: 'Friend: "How was your trip to Da Nang last weekend?"',
      ans: 'It was fantastic! The beaches and local food were amazing.',
      opts: [
        'It was fantastic! The beaches and local food were amazing.',
        'I am not eating food today.',
        'Yes, you traveled yesterday.',
        'No, the bus is red.'
      ],
      exp: 'Đáp lại cảm nghĩ về chuyến đi: "It was fantastic! The beaches and local food were amazing."'
    },
    {
      sit: 'Bạn muốn từ chối một lời mời đi ăn tối vì đã có hẹn trước.',
      prompt: 'Friend: "Are you free for dinner tonight?"',
      ans: 'I’d love to, but I already have plans. Can we reschedule?',
      opts: [
        'I’d love to, but I already have plans. Can we reschedule?',
        'No, I dislike your dinner.',
        'Don\'t invite me again.',
        'I am sleeping now.'
      ],
      exp: 'Từ chối nhã nhặn kèm đề xuất hẹn lại: "I’d love to, but I already have plans. Can we reschedule?"'
    },
    {
      sit: 'Bạn gọi cà phê tại quầy quán nước.',
      prompt: 'Barista: "Good morning, what can I get started for you today?"',
      ans: 'Can I have an iced Americano with no sugar, please?',
      opts: [
        'Can I have an iced Americano with no sugar, please?',
        'Give me coffee right now quickly.',
        'I don\'t want to answer you.',
        'What are you doing here?'
      ],
      exp: 'Mẫu câu gọi đồ uống lịch thiệp: "Can I have an iced Americano with no sugar, please?"'
    },
    {
      sit: 'Đồng nghiệp vừa hoàn thành xuất sắc một buổi thuyết trình.',
      prompt: 'Bạn muốn chúc mừng và khen ngợi đồng nghiệp:',
      ans: 'Congratulations! That was an insightful and engaging presentation.',
      opts: [
        'Congratulations! That was an insightful and engaging presentation.',
        'You spoke for too long today.',
        'I didn\'t listen to anything.',
        'Presentations are very boring.'
      ],
      exp: 'Khen ngợi chân thành: "Congratulations! That was an insightful and engaging presentation."'
    },
    {
      sit: 'Bạn cần xin phép rời cuộc họp sớm vì có lịch khám bác sĩ.',
      prompt: 'Bạn nói với người chủ trì cuộc họp:',
      ans: 'Excuse me, I need to step out a bit early for a medical appointment.',
      opts: [
        'Excuse me, I need to step out a bit early for a medical appointment.',
        'I am leaving because this meeting is useless.',
        'Goodbye everyone, stop talking.',
        'The doctor is coming here.'
      ],
      exp: 'Xin phép rời sớm khéo léo: "Excuse me, I need to step out a bit early for a medical appointment."'
    },
    {
      sit: 'Ai đó cảm ơn bạn vì sự giúp đỡ nhiệt tình.',
      prompt: 'Customer: "Thank you so much for guiding me through the process!"',
      ans: 'You\'re very welcome! It was my pleasure to help.',
      opts: [
        'You\'re very welcome! It was my pleasure to help.',
        'Why are you thanking me?',
        'Yes, you owe me money now.',
        'Don\'t say anything more.'
      ],
      exp: 'Hồi đáp lời cảm ơn chuyên nghiệp: "You\'re very welcome! It was my pleasure to help."'
    },
    {
      sit: 'Bạn hỏi đường đến ga tàu điện gần nhất.',
      prompt: 'Bạn hỏi người dân trên phố:',
      ans: 'Excuse me, could you point me to the nearest metro station?',
      opts: [
        'Excuse me, could you point me to the nearest metro station?',
        'Where are you going right now?',
        'Train station is somewhere here.',
        'Walk with me to the station.'
      ],
      exp: 'Mẫu câu hỏi đường chuẩn mực: "Excuse me, could you point me to the nearest metro station?"'
    },
    {
      sit: 'Bạn muốn xin lỗi vì gửi tài liệu bị trễ so với hạn chót.',
      prompt: 'Bạn gửi tài liệu qua email kèm lời xin lỗi:',
      ans: 'Please accept my apologies for the delay; please find the file attached.',
      opts: [
        'Please accept my apologies for the delay; please find the file attached.',
        'The deadline was impossible to meet anyway.',
        'I forgot everything about this file.',
        'You can read it next month.'
      ],
      exp: 'Xin lỗi vì trễ hạn trang trọng: "Please accept my apologies for the delay; please find the file attached."'
    },
  ];

  const speakingQuestions = speakingSituations.map((s, idx) => ({
    id: `speaking_${level}_${idx + 1}`,
    part: 2,
    partName: 'Luyện nói',
    type: 'SPEAKING_SITUATION',
    question: `Tình huống: ${s.sit}\n${s.prompt}\n→ Chọn câu phản hồi phù hợp và tự nhiên nhất:`,
    options: s.opts,
    correctAnswer: s.ans,
    explanation: s.exp,
  }));

  // ----------------------------------------------------
  // PART 3: ERROR CORRECTION (2 TASKS x 5 = 10 QUESTIONS)
  // ----------------------------------------------------
  const errorSentences = [
    // Task 3.1
    { q: 'Tìm và sửa lỗi sai trong câu: "She don\'t like drinking cold water in the morning."', ans: 'don\'t → doesn\'t', opts: ['don\'t → doesn\'t', 'like → likes', 'drinking → drink', 'in → on'], exp: 'Chủ ngữ "She" ngôi thứ ba số ít phải dùng trợ động từ "doesn\'t".' },
    { q: 'Tìm và sửa lỗi sai trong câu: "They has lived in this city for over ten years."', ans: 'has → have', opts: ['has → have', 'lived → live', 'for → since', 'over → at'], exp: 'Chủ ngữ "They" số nhiều đi với trợ động từ "have" trong thì hiện tại hoàn thành.' },
    { q: 'Tìm và sửa lỗi sai trong câu: "He is more taller than his elder brother."', ans: 'more taller → taller', opts: ['more taller → taller', 'his → her', 'elder → old', 'is → are'], exp: '"Tall" là tính từ ngắn, so sánh hơn là "taller", không dùng "more taller".' },
    { q: 'Tìm và sửa lỗi sai trong câu: "I look forward to hear from you soon."', ans: 'hear → hearing', opts: ['hear → hearing', 'look → looking', 'to → for', 'soon → sooner'], exp: 'Cấu trúc "look forward to + V-ing" đòi hỏi động từ đuôi -ing: "hearing".' },
    { q: 'Tìm và sửa lỗi sai trong câu: "Yesterday, we go to the museum by bus."', ans: 'go → went', opts: ['go → went', 'to → at', 'the → a', 'by → on'], exp: 'Có trạng từ quá khứ "Yesterday", động từ "go" phải chia ở quá khứ đơn: "went".' },
    // Task 3.2
    { q: 'Tìm và sửa lỗi sai trong câu: "If it will rain tomorrow, we will cancel the picnic."', ans: 'will rain → rains', opts: ['will rain → rains', 'tomorrow → yesterday', 'will cancel → cancel', 'the → a'], exp: 'Trong mệnh đề If của câu điều kiện loại 1, động từ chia ở hiện tại đơn: "rains".' },
    { q: 'Tìm và sửa lỗi sai trong câu: "She is capable to solve complex mathematical problems."', ans: 'capable to → capable of', opts: ['capable to → capable of', 'solve → solved', 'complex → complexity', 'is → are'], exp: 'Cấu trúc đúng là "capable of + V-ing": "capable of solving".' },
    { q: 'Tìm và sửa lỗi sai trong câu: "Neither the manager nor the employees was present."', ans: 'was → were', opts: ['was → were', 'the → a', 'nor → or', 'present → presence'], exp: 'Cấu trúc "Neither... nor..." động từ chia theo chủ ngữ gần nhất ("the employees" số nhiều → "were").' },
    { q: 'Tìm và sửa lỗi sai trong câu: "Despite of the heavy rain, they completed the marathon."', ans: 'Despite of → Despite', opts: ['Despite of → Despite', 'heavy → heavily', 'they → them', 'completed → complete'], exp: '"Despite" không đi kèm giới từ "of" (hoặc dùng "In spite of").' },
    { q: 'Tìm và sửa lỗi sai trong câu: "The information you provided are very helpful to us."', ans: 'are → is', opts: ['are → is', 'provided → provide', 'helpful → helpfully', 'to → for'], exp: '"Information" là danh từ không đếm được, động từ to be chia số ít: "is".' },
  ];

  const errorQuestions = errorSentences.map((e, idx) => ({
    id: `error_${level}_${idx + 1}`,
    part: 3,
    partName: 'Tìm và sửa lỗi sai',
    type: 'ERROR_CORRECTION',
    taskNumber: idx < 5 ? 1 : 2,
    question: `[Bài ${idx < 5 ? 1 : 2} - Câu ${(idx % 5) + 1}/5]\n${e.q}`,
    options: e.opts,
    correctAnswer: e.ans,
    explanation: e.exp,
  }));

  // ----------------------------------------------------
  // PART 4: LISTENING COMPREHENSION (2 TASKS x 5 = 10 QUESTIONS)
  // ----------------------------------------------------
  const listeningTracks = [
    {
      taskNumber: 1,
      title: 'Hành trình phát triển sự nghiệp & Kỹ năng số',
      audioText: `Good morning everyone. Today, let's explore digital skills in the modern workplace. Technology is transforming every industry at an unprecedented pace. Professionals who continuously update their abilities in data analysis, effective communication, and collaborative tools thrive in global teams. Remember, learning is a lifelong journey. Dedicating just twenty minutes every day to deliberate practice leads to remarkable personal and professional growth.`,
      questions: [
        { q: 'Chủ đề trọng tâm của bài nghe là gì?', ans: 'Kỹ năng số và phát triển sự nghiệp trong thời đại mới', opts: ['Kỹ năng số và phát triển sự nghiệp trong thời đại mới', 'Lịch sử du hành vũ trụ cổ đại', 'Công thức làm bánh mì Pháp', 'Dự báo thời tiết cuối tuần'], exp: 'Bài nghe tập trung vào việc trau dồi kỹ năng số và phát triển nghề nghiệp.' },
        { q: 'Yếu tố nào đang chuyển đổi các ngành nghề với tốc độ chưa từng có?', ans: 'Công nghệ hiện đại', opts: ['Công nghệ hiện đại', 'Thời tiết khắc nghiệt', 'Du lịch giá rẻ', 'Âm nhạc cổ điển'], exp: 'Người nói nêu: "Technology is transforming every industry at an unprecedented pace."' },
        { q: 'Theo bài nghe, những chuyên gia nào sẽ phát triển mạnh mẽ trong các đội ngũ toàn cầu?', ans: 'Những người liên tục cập nhật năng lực bản thân', opts: ['Những người liên tục cập nhật năng lực bản thân', 'Những người từ chối sử dụng máy tính', 'Những người chỉ làm việc một mình', 'Những người bỏ cuộc khi gặp khó'], exp: 'Người nói khẳng định những ai liên tục cập nhật kỹ năng sẽ thành công rực rỡ.' },
        { q: 'Người nói khuyên nên dành bao nhiêu thời gian mỗi ngày cho việc luyện tập có chủ đích?', ans: 'Hai mươi phút', opts: ['Hai mươi phút', 'Năm tiếng đồng hồ', 'Mười giây', 'Hai ngày liên tục'], exp: 'Người nói khuyên: "Dedicating just twenty minutes every day".' },
        { q: 'Thông điệp nhân văn mà bài nghe muốn truyền tải là gì?', ans: 'Học tập là một hành trình suốt đời', opts: ['Học tập là một hành trình suốt đời', 'Không nên thay đổi thói quen cũ', 'Chỉ học khi bị bắt buộc', 'Công việc không cần sự kiên trì'], exp: 'Thông điệp kết luận: "Remember, learning is a lifelong journey."' },
      ],
    },
    {
      taskNumber: 2,
      title: 'Bảo vệ môi trường & Lối sống xanh bền vững',
      audioText: `Welcome to our eco-awareness briefing. Preserving our planet requires immediate collective action. Single-use plastics pollute our oceans and endanger marine life. By adopting eco-friendly habits—such as carrying reusable bags, conserving clean water, and utilizing public transit—we reduce our environmental footprint substantially. Small, consistent daily decisions create a powerful wave of positive change for generations to come.`,
      questions: [
        { q: 'Mục đích chính của buổi thông tin này là gì?', ans: 'Nâng cao nhận thức bảo vệ môi trường và lối sống xanh', opts: ['Nâng cao nhận thức bảo vệ môi trường và lối sống xanh', 'Giới thiệu một bộ phim hành động mới', 'Hướng dẫn mua sắm quần áo thời trang', 'Phân tích bảng giá xe hơi'], exp: 'Bài nghe mở đầu với "Welcome to our eco-awareness briefing".' },
        { q: 'Tác nhân nào bị chỉ rõ là đang làm ô nhiễm đại dương và đe dọa sinh vật biển?', ans: 'Đồ nhựa dùng một lần', opts: ['Đồ nhựa dùng một lần', 'Nước ép hoa quả tươi', 'Sách báo giấy', 'Năng lượng mặt trời'], exp: 'Người nói cảnh báo: "Single-use plastics pollute our oceans and endanger marine life."' },
        { q: 'Hành động nào sau đây được khuyến khích để giảm dấu chân sinh thái?', ans: 'Mang theo túi tái sử dụng và tiết kiệm nước sạch', opts: ['Mang theo túi tái sử dụng và tiết kiệm nước sạch', 'Sử dụng thêm túi ni-lông mỗi ngày', 'Xả rác tự do ra bờ biển', 'Bỏ qua giao thông công cộng'], exp: 'Các thói quen xanh được nêu gồm mang túi tái sử dụng, tiết kiệm nước sạch.' },
        { q: 'Theo người nói, điều gì sẽ tạo nên làn sóng thay đổi tích cực mạnh mẽ?', ans: 'Những quyết định nhỏ bé, kiên trì mỗi ngày', opts: ['Những quyết định nhỏ bé, kiên trì mỗi ngày', 'Sự thờ ơ của cộng đồng', 'Chờ đợi người khác hành động thay', 'Chỉ hành động một lần duy nhất'], exp: 'Người nói nhấn mạnh: "Small, consistent daily decisions create a powerful wave of positive change."' },
        { q: 'Ai sẽ là người thụ hưởng kết quả của những nỗ lực bảo tồn hôm nay?', ans: 'Các thế hệ tương lai mai sau', opts: ['Các thế hệ tương lai mai sau', 'Không một ai', 'Chỉ các nhà máy lớn', 'Người ngoài hành tinh'], exp: 'Câu kết khẳng định: "for generations to come".' },
      ],
    },
  ];

  const listeningQuestions = [];
  listeningTracks.forEach((track) => {
    track.questions.forEach((qObj, qIdx) => {
      listeningQuestions.push({
        id: `listening_${level}_${track.taskNumber}_${qIdx + 1}`,
        part: 4,
        partName: 'Luyện nghe',
        type: 'LISTENING',
        taskNumber: track.taskNumber,
        audioTitle: track.title,
        audioText: track.audioText,
        question: `[Bài nghe ${track.taskNumber} - Câu ${qIdx + 1}/5]\n${qObj.q}`,
        options: qObj.opts,
        correctAnswer: qObj.ans,
        explanation: qObj.exp,
      });
    });
  });

  // ----------------------------------------------------
  // PART 5: READING COMPREHENSION (2 TASKS x 5 = 10 QUESTIONS)
  // ----------------------------------------------------
  const readingPassages = [
    {
      taskNumber: 1,
      title: 'The Evolution of Modern Coffee Culture',
      text: `Coffee has evolved from a simple morning stimulant into a sophisticated global culture. In early coffeehouses across Europe, intellectuals gathered to debate politics, philosophy, and commerce, earning these establishments the nickname "penny universities." Today, the specialized coffee movement emphasizes artisanal brewing techniques, ethical bean sourcing, and transparent supply chains. Consumers no longer view coffee as mere fuel; they appreciate distinct flavor profiles shaped by altitude, soil, and processing methods. This appreciation has elevated baristas into skilled craftspeople and fostered thriving community hubs centered around shared passion for quality beverages.`,
      questions: [
        { q: 'Ý chính của đoạn văn trên là gì?', ans: 'Sự phát triển từ thức uống đơn giản thành nét văn hóa thưởng thức toàn cầu của cà phê', opts: ['Sự phát triển từ thức uống đơn giản thành nét văn hóa thưởng thức toàn cầu của cà phê', 'Tác hại của việc uống quá nhiều caffeine mỗi sáng', 'Quy trình trồng trọt cây ngô tại vùng ôn đới', 'Lịch sử phát minh ra ấm đun nước điện'], exp: 'Đoạn văn khái quát hành trình cà phê trở thành một nền văn hóa sành điệu trên thế giới.' },
        { q: 'Tại sao các quán cà phê châu Âu thời kỳ đầu lại được gọi là "penny universities"?', ans: 'Vì giới trí thức tụ họp tại đó để tranh luận tri thức, chính trị và thương mại', opts: ['Vì giới trí thức tụ họp tại đó để tranh luận tri thức, chính trị và thương mại', 'Vì học phí đại học ở đó rất đắt đỏ', 'Vì sinh viên đến đó để thi tốt nghiệp', 'Vì chỉ có giáo sư mới được phép vào quán'], exp: 'Đoạn văn nêu rõ: "intellectuals gathered to debate politics, philosophy, and commerce".' },
        { q: 'Làn sóng cà phê đặc sản ngày nay đặc biệt nhấn mạnh yếu tố nào?', ans: 'Kỹ thuật pha thủ công, nguồn hạt nhân văn và chuỗi cung ứng minh bạch', opts: ['Kỹ thuật pha thủ công, nguồn hạt nhân văn và chuỗi cung ứng minh bạch', 'Sử dụng đường nhân tạo với số lượng lớn', 'Pha chế công nghiệp hàng loạt nhanh nhất có thể', 'Giấu kín nguồn gốc xuất xứ của hạt cà phê'], exp: 'Văn bản nêu: "emphasizes artisanal brewing techniques, ethical bean sourcing, and transparent supply chains".' },
        { q: 'Theo văn bản, hương vị đặc trưng của hạt cà phê được định hình bởi điều gì?', ans: 'Độ cao, thổ nhưỡng và phương pháp sơ chế hạt', opts: ['Độ cao, thổ nhưỡng và phương pháp sơ chế hạt', 'Màu sắc của cốc giấy đựng đồ uống', 'Thời tiết tại thủ đô London', 'Số lượng ghế ngồi trong quán'], exp: 'Trích văn bản: "shaped by altitude, soil, and processing methods".' },
        { q: 'Từ "fostered" trong câu cuối có nét nghĩa gần nhất với từ nào sau đây?', ans: 'Nurtured / Promoted (Nuôi dưỡng, thúc đẩy phát triển)', opts: ['Nurtured / Promoted (Nuôi dưỡng, thúc đẩy phát triển)', 'Destroyed (Phá hủy)', 'Ignored (Phớt lờ bỏ qua)', 'Prevented (Ngăn cản)'], exp: '"Foster" trong ngữ cảnh này mang nghĩa nuôi dưỡng và thúc đẩy sự phát triển của cộng đồng.' },
      ],
    },
    {
      taskNumber: 2,
      title: 'Urban Green Spaces and Well-Being',
      text: `As urban populations swell, access to green spaces has become a vital component of public health strategy. Numerous clinical studies confirm that regular immersion in natural environments reduces cortisol levels, alleviates chronic anxiety, and sharpens cognitive focus. Parks and community gardens also function as essential ecological buffers against urban heat island effects, absorbing atmospheric pollutants and regulating local microclimates. Furthermore, public parks democratize recreation by offering accessible venues for physical exercise, social interaction, and quiet contemplation regardless of socioeconomic status. Investing in urban biodiversity is therefore not an aesthetic luxury, but a fundamental prerequisite for sustainable city living.`,
      questions: [
        { q: 'Luận điểm chính của đoạn văn trên là gì?', ans: 'Không gian xanh đô thị là yếu tố cốt lõi cho sức khỏe cộng đồng và thành phố bền vững', opts: ['Không gian xanh đô thị là yếu tố cốt lõi cho sức khỏe cộng đồng và thành phố bền vững', 'Các thành phố nên xóa bỏ toàn bộ công viên để xây cao ốc', 'Ô tô điện là phương tiện duy nhất làm sạch không khí', 'Nông nghiệp truyền thống không thể tồn tại ở thế kỷ 21'], exp: 'Đoạn văn khẳng định không gian xanh là điều kiện tiên quyết cho sự bền vững và sức khỏe công chúng.' },
        { q: 'Theo các nghiên cứu lâm sàng, tiếp xúc với thiên nhiên mang lại lợi ích gì cho cơ thể?', ans: 'Giảm mức cortisol, xoa dịu lo âu kinh niên và tăng cường tập trung nhận thức', opts: ['Giảm mức cortisol, xoa dịu lo âu kinh niên và tăng cường tập trung nhận thức', 'Tăng huyết áp và gây căng thẳng thần kinh', 'Làm giảm trí nhớ và khả năng tư duy', 'Khiến con người mất ngủ liên tục'], exp: 'Trích văn bản: "reduces cortisol levels, alleviates chronic anxiety, and sharpens cognitive focus".' },
        { q: 'Công viên và vườn cộng đồng đóng vai trò sinh thái nào đối với đô thị?', ans: 'Giảm hiệu ứng đảo nhiệt, hấp thụ khí thải và điều hòa vi khí hậu', opts: ['Giảm hiệu ứng đảo nhiệt, hấp thụ khí thải và điều hòa vi khí hậu', 'Tạo thêm nhiệt lượng làm thành phố nóng bức hơn', 'Tăng lượng bụi mịn độc hại trong không khí', 'Làm tắc nghẽn hệ thống thoát nước mưa'], exp: 'Trích văn bản: "buffers against urban heat island effects, absorbing atmospheric pollutants".' },
        { q: 'Cụm từ "democratize recreation" trong văn bản mang ý nghĩa gì?', ans: 'Mang lại không gian vui chơi, rèn luyện bình đẳng cho mọi tầng lớp xã hội', opts: ['Mang lại không gian vui chơi, rèn luyện bình đẳng cho mọi tầng lớp xã hội', 'Bán vé vào cửa công viên với giá rất đắt đỏ', 'Chỉ mở cửa công viên cho một nhóm người ưu tiên', 'Tổ chức các cuộc bầu cử chính trị tại công viên'], exp: 'Không gian xanh mở ra cơ hội giải trí, vận động bình đẳng "regardless of socioeconomic status".' },
        { q: 'Tác giả kết luận việc đầu tư vào đa dạng sinh học đô thị là gì?', ans: 'Một điều kiện tiên quyết nền tảng, không phải thứ xa xỉ phẩm trang trí', opts: ['Một điều kiện tiên quyết nền tảng, không phải thứ xa xỉ phẩm trang trí', 'Một sự lãng phí ngân sách không cần thiết', 'Một xu hướng nhất thời sắp bị lãng quên', 'Một gánh nặng kinh tế cho người dân'], exp: 'Văn bản kết luận: "not an aesthetic luxury, but a fundamental prerequisite for sustainable city living".' },
      ],
    },
  ];

  const readingQuestions = [];
  readingPassages.forEach((passage) => {
    passage.questions.forEach((qObj, qIdx) => {
      readingQuestions.push({
        id: `reading_${level}_${passage.taskNumber}_${qIdx + 1}`,
        part: 5,
        partName: 'Luyện đọc',
        type: 'READING',
        taskNumber: passage.taskNumber,
        passageTitle: passage.title,
        passageText: passage.text,
        question: `[Bài đọc ${passage.taskNumber} - Câu ${qIdx + 1}/5]\n${qObj.q}`,
        options: qObj.opts,
        correctAnswer: qObj.ans,
        explanation: qObj.exp,
      });
    });
  });

  // Consolidate into 5 parts
  return [
    { partNumber: 1, title: 'Từ vựng', targetCount: 20, questions: vocabQuestions },
    { partNumber: 2, title: 'Luyện nói', targetCount: 10, questions: speakingQuestions },
    { partNumber: 3, title: 'Tìm và sửa lỗi sai', targetCount: 10, questions: errorQuestions },
    { partNumber: 4, title: 'Luyện nghe', targetCount: 10, questions: listeningQuestions },
    { partNumber: 5, title: 'Luyện đọc', targetCount: 10, questions: readingQuestions },
  ];
}

module.exports = { generateDailyBankForLevel };
