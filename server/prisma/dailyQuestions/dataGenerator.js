// dataGenerator.js - Generates authentic 60-question daily practice sets per CEFR level
// Structure: 20 Vocabulary + 10 Speaking + 10 Error Correction + 10 Listening + 10 Reading = 60 questions

const curriculum = require('../curriculum');
const { getCreativeSentenceForWord } = require('../curriculum/generators/contextSentenceBank');

/**
 * Deterministic or random shuffle function
 */
function shuffleArray(arr, randomFn = Math.random) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Simple pseudo-random generator for a given seed string
 */
function createSeededRandom(seedStr) {
  if (!seedStr) return Math.random;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  return function () {
    hash = (hash * 9301 + 49297) % 233280;
    return Math.abs(hash) / 233280;
  };
}

/**
 * Filter items prioritizing those not in recentSet
 */
function prioritizeFresh(pool, count, recentSet, getIdFn, randomFn) {
  const shuffled = shuffleArray(pool, randomFn);
  const fresh = shuffled.filter((item) => !recentSet.has(getIdFn(item)));
  const stale = shuffled.filter((item) => recentSet.has(getIdFn(item)));

  const selected = [...fresh.slice(0, count)];
  if (selected.length < count) {
    const needed = count - selected.length;
    selected.push(...stale.slice(0, needed));
  }
  return selected.slice(0, count);
}

// ----------------------------------------------------
// EXTENSIVE SPEAKING SITUATIONS BANK (30 SITUATIONS)
// ----------------------------------------------------
const ALL_SPEAKING_SITUATIONS = [
  {
    id: 'spk_1',
    sit: 'Bạn gặp một đồng nghiệp mới vào ngày đầu tiên làm việc.',
    prompt: 'Colleague: "Hello, I just joined the team today. Nice to meet you!"',
    ans: 'Nice to meet you too! Welcome to the team.',
    opts: [
      'Nice to meet you too! Welcome to the team.',
      'I\'m heading out for lunch now, but see you later.',
      'Could you email me the meeting agenda before noon?',
      'Thank you for the update, let\'s discuss it tomorrow.'
    ],
    exp: 'Lời chào đón thân thiện và lịch thiệp với đồng nghiệp mới: "Nice to meet you too! Welcome to the team."'
  },
  {
    id: 'spk_2',
    sit: 'Bạn muốn nhờ ai đó giữ cửa thang máy giúp bạn.',
    prompt: 'Bạn đang tiến tới thang máy và sắp đóng cửa:',
    ans: 'Could you please hold the door for a second?',
    opts: [
      'Could you please hold the door for a second?',
      'Which floor are you heading to today?',
      'Thank you for letting me know about the elevator.',
      'Please take your time, there is no hurry.'
    ],
    exp: 'Cấu trúc nhờ vả lịch sự khi vào thang máy: "Could you please hold the door for a second?"'
  },
  {
    id: 'spk_3',
    sit: 'Một người bạn hỏi cảm nhận của bạn về chuyến du lịch gần đây.',
    prompt: 'Friend: "How was your trip to Da Nang last weekend?"',
    ans: 'It was fantastic! The beaches and local food were amazing.',
    opts: [
      'It was fantastic! The beaches and local food were amazing.',
      'I am planning to buy flight tickets for next summer instead.',
      'Have a safe journey and remember to take photos!',
      'I will let you know once my vacation leave is approved.'
    ],
    exp: 'Hồi đáp cảm nghĩ về chuyến đi: "It was fantastic! The beaches and local food were amazing."'
  },
  {
    id: 'spk_4',
    sit: 'Bạn muốn từ chối một lời mời đi ăn tối vì đã có hẹn trước.',
    prompt: 'Friend: "Are you free for dinner tonight?"',
    ans: 'I’d love to, but I already have plans. Can we reschedule?',
    opts: [
      'I’d love to, but I already have plans. Can we reschedule?',
      'Yes, I finished cooking breakfast twenty minutes ago.',
      'Could you give me directions to the restaurant downtown?',
      'Dinner is served in the main dining hall every weekday.'
    ],
    exp: 'Từ chối nhã nhặn kèm đề xuất hẹn lại: "I’d love to, but I already have plans. Can we reschedule?"'
  },
  {
    id: 'spk_5',
    sit: 'Bạn gọi cà phê tại quầy quán nước.',
    prompt: 'Barista: "Good morning, what can I get started for you today?"',
    ans: 'Can I have an iced Americano with no sugar, please?',
    opts: [
      'Can I have an iced Americano with no sugar, please?',
      'The total comes to four dollars and fifty cents.',
      'Would you like your receipt placed in the bag?',
      'Here is your table buzzer, please find a seat.'
    ],
    exp: 'Mẫu câu gọi đồ uống lịch thiệp của khách hàng: "Can I have an iced Americano with no sugar, please?"'
  },
  {
    id: 'spk_6',
    sit: 'Đồng nghiệp vừa hoàn thành xuất sắc một buổi thuyết trình.',
    prompt: 'Bạn muốn chúc mừng và khen ngợi đồng nghiệp:',
    ans: 'Congratulations! That was an insightful and engaging presentation.',
    opts: [
      'Congratulations! That was an insightful and engaging presentation.',
      'Good luck with your presentation tomorrow afternoon!',
      'Would you like me to print out the meeting handouts?',
      'Please let me know if you need help testing the projector.'
    ],
    exp: 'Khen ngợi chân thành sau buổi thuyết trình: "Congratulations! That was an insightful and engaging presentation."'
  },
  {
    id: 'spk_7',
    sit: 'Bạn cần xin phép rời cuộc họp sớm vì có lịch khám bác sĩ.',
    prompt: 'Bạn nói với người chủ trì cuộc họp:',
    ans: 'Excuse me, I need to step out a bit early for a medical appointment.',
    opts: [
      'Excuse me, I need to step out a bit early for a medical appointment.',
      'Thank you everyone for joining today\'s project kickoff.',
      'Shall we proceed directly to the next slide on the agenda?',
      'I will compile the full meeting minutes before five o\'clock.'
    ],
    exp: 'Xin phép rời sớm khéo léo trong môi trường công sở.'
  },
  {
    id: 'spk_8',
    sit: 'Ai đó cảm ơn bạn vì sự giúp đỡ nhiệt tình.',
    prompt: 'Customer: "Thank you so much for guiding me through the process!"',
    ans: 'You\'re very welcome! It was my pleasure to help.',
    opts: [
      'You\'re very welcome! It was my pleasure to help.',
      'Could you please clarify what specific issue you are experiencing?',
      'I am calling to follow up on your recent account inquiry.',
      'Please hold the line while I review your ticket history.'
    ],
    exp: 'Hồi đáp lời cảm ơn chuyên nghiệp: "You\'re very welcome! It was my pleasure to help."'
  },
  {
    id: 'spk_9',
    sit: 'Bạn hỏi đường đến ga tàu điện gần nhất.',
    prompt: 'Bạn hỏi người dân trên phố:',
    ans: 'Excuse me, could you point me to the nearest metro station?',
    opts: [
      'Excuse me, could you point me to the nearest metro station?',
      'How much is a single-journey ticket to the airport terminal?',
      'The train departs promptly from platform two in ten minutes.',
      'Please stand behind the safety boundary on the platform.'
    ],
    exp: 'Mẫu câu hỏi đường chuẩn mực: "Excuse me, could you point me to the nearest metro station?"'
  },
  {
    id: 'spk_10',
    sit: 'Bạn muốn xin lỗi vì gửi tài liệu bị trễ so với hạn chót.',
    prompt: 'Bạn gửi tài liệu qua email kèm lời xin lỗi:',
    ans: 'Please accept my apologies for the delay; please find the file attached.',
    opts: [
      'Please accept my apologies for the delay; please find the file attached.',
      'I look forward to receiving your initial proposal by Friday.',
      'Thank you for confirming receipt of our signed agreement.',
      'Please let me know your availability for a brief call next week.'
    ],
    exp: 'Xin lỗi vì trễ hạn trang trọng: "Please accept my apologies for the delay; please find the file attached."'
  },
  {
    id: 'spk_11',
    sit: 'Bạn muốn nhờ đồng nghiệp nhắc lại thông tin trong cuộc họp vì không nghe rõ.',
    prompt: 'Colleague: "We decided to launch the beta test next Thursday."',
    ans: 'Could you say that once more, please? The line cut out for a second.',
    opts: [
      'Could you say that once more, please? The line cut out for a second.',
      'Congratulations on completing your annual professional certification!',
      'I have already confirmed the hotel accommodations for our team.',
      'Would you prefer coffee or sparkling water during the break?'
    ],
    exp: 'Nhờ nhắc lại lịch sự: "Could you say that once more, please?"'
  },
  {
    id: 'spk_12',
    sit: 'Bạn thanh toán bữa ăn tại nhà hàng và muốn xin hóa đơn.',
    prompt: 'Bạn nói với nhân viên phục vụ khi chuẩn bị rời đi:',
    ans: 'Could we have the bill, please? We would like to pay by card.',
    opts: [
      'Could we have the bill, please? We would like to pay by card.',
      'Could you recommend the chef\'s seasonal specialty for dinner?',
      'We would like to book a private table for four at seven PM.',
      'Is there any vegetarian option included on today\'s set menu?'
    ],
    exp: 'Yêu cầu thanh toán chuẩn: "Could we have the bill, please?"'
  },
  {
    id: 'spk_13',
    sit: 'Bạn làm thủ tục check-in tại sân bay và muốn chọn chỗ ngồi gần cửa sổ.',
    prompt: 'Agent: "Do you have any seat preferences for your flight to Tokyo?"',
    ans: 'Yes, could I get a window seat if there is one available, please?',
    opts: [
      'Yes, could I get a window seat if there is one available, please?',
      'My luggage exceeded the standard weight allowance on my last trip.',
      'Where is the currency exchange counter located in this terminal?',
      'How long does the international security screening usually take?'
    ],
    exp: 'Đề nghị chọn chỗ ngồi nhã nhặn: "Could I get a window seat if there is one available, please?"'
  },
  {
    id: 'spk_14',
    sit: 'Bạn muốn xin hoãn hạn nộp báo cáo thêm 1 ngày để hoàn thiện kỹ lưỡng.',
    prompt: 'Manager: "Will the quarterly summary report be ready by this afternoon?"',
    ans: 'I am finalizing the data analysis. Would it be possible to submit it tomorrow morning?',
    opts: [
      'I am finalizing the data analysis. Would it be possible to submit it tomorrow morning?',
      'Thank you for attending the quarterly departmental review meeting.',
      'Please find the invoice for our recent software licenses attached.',
      'I will be out of the office for scheduled training all next week.'
    ],
    exp: 'Đề xuất lùi hạn khéo léo và có trách nhiệm với tiến độ công việc.'
  },
  {
    id: 'spk_15',
    sit: 'Khách hàng liên hệ đường dây nóng phản ánh sự cố kỹ thuật.',
    prompt: 'Caller: "Our portal has been inaccessible since 9 AM."',
    ans: 'I sincerely apologize for the inconvenience. Let me look into this right away.',
    opts: [
      'I sincerely apologize for the inconvenience. Let me look into this right away.',
      'Thank you for renewing your annual service contract with our firm.',
      'Your monthly payment has been processed successfully through our system.',
      'Please take a few moments to complete our quarterly feedback questionnaire.'
    ],
    exp: 'Thái độ đồng cảm và sẵn sàng hỗ trợ khách hàng chuyên nghiệp.'
  },
  {
    id: 'spk_16',
    sit: 'Bạn nhận được cuộc gọi nhầm số tại văn phòng.',
    prompt: 'Caller: "Is this the accounting department of Apex Global?"',
    ans: 'I\'m afraid you have the wrong extension. Let me transfer you to the operator.',
    opts: [
      'I\'m afraid you have the wrong extension. Let me transfer you to the operator.',
      'I am calling to schedule an interview for the financial analyst position.',
      'Our financial statements have already been submitted to the board.',
      'Could you confirm your company email address for our newsletter?'
    ],
    exp: 'Thông báo nhầm máy lịch thiệp: "I\'m afraid you have the wrong extension."'
  },
  {
    id: 'spk_17',
    sit: 'Bạn khen ngợi sự đóng góp của thành viên trong nhóm dự án.',
    prompt: 'Team Member: "We finally delivered the client update on time."',
    ans: 'Great teamwork everyone! Your thorough documentation made a big difference.',
    opts: [
      'Great teamwork everyone! Your thorough documentation made a big difference.',
      'The client workshop will be hosted in conference room C next Monday.',
      'Please submit your travel expense claims before Friday afternoon.',
      'Remember to wear formal business attire during tomorrow\'s client visit.'
    ],
    exp: 'Động viên và ghi nhận đóng góp tích cực của đồng đội.'
  },
  {
    id: 'spk_18',
    sit: 'Bạn muốn hỏi mượn bút từ đồng nghiệp ngồi cạnh.',
    prompt: 'Bạn quay sang đồng nghiệp trong buổi thảo luận:',
    ans: 'Do you happen to have a spare pen I could borrow for a moment?',
    opts: [
      'Do you happen to have a spare pen I could borrow for a moment?',
      'Could you forward me the spreadsheet from this morning\'s briefing?',
      'Where can I submit my request for new stationery supplies?',
      'Are you planning to attend the annual technology seminar this autumn?'
    ],
    exp: 'Mẫu câu hỏi mượn đồ lịch sự: "Do you happen to have a spare pen I could borrow...?"'
  },
  {
    id: 'spk_19',
    sit: 'Bạn muốn kết thúc một cuộc họp đúng giờ vì có lịch hẹn tiếp theo.',
    prompt: 'Đồng nghiệp vẫn đang thảo luận rải rác ngoài lề:',
    ans: 'I appreciate the discussion, but I have another commitment at 3 PM. Shall we wrap up?',
    opts: [
      'I appreciate the discussion, but I have another commitment at 3 PM. Shall we wrap up?',
      'Let\'s welcome our guest speaker for this afternoon\'s keynote session.',
      'I have reserved the conference room for the entire working day.',
      'Please ensure your microphones are muted while other speakers present.'
    ],
    exp: 'Điều phối kết thúc cuộc họp lịch sự: "Shall we wrap up?"'
  },
  {
    id: 'spk_20',
    sit: 'Bạn chúc đồng nghiệp có một kỳ nghỉ cuối tuần vui vẻ.',
    prompt: 'Colleague: "See you on Monday, have a restful weekend!"',
    ans: 'Thanks, you too! Enjoy your time off with family.',
    opts: [
      'Thanks, you too! Enjoy your time off with family.',
      'Could you email me the slide deck before the weekend officially begins?',
      'The office building will undergo routine maintenance on Sunday morning.',
      'I will send an updated calendar invitation for our weekly standup.'
    ],
    exp: 'Lời chúc cuối tuần ấm áp và tự nhiên trong môi trường công sở.'
  },
];

// ----------------------------------------------------
// EXTENSIVE ERROR CORRECTION BANK (20 SENTENCES = 4 TASKS)
// ----------------------------------------------------
const ALL_ERROR_SENTENCES = [
  // Task Group 1
  { id: 'err_1', q: 'Tìm và sửa lỗi sai trong câu: "She don\'t like drinking cold water in the morning."', ans: 'don\'t → doesn\'t', opts: ['don\'t → doesn\'t', 'like → likes', 'drinking → drink', 'in → on'], exp: 'Chủ ngữ "She" ngôi thứ ba số ít phải dùng trợ động từ "doesn\'t".' },
  { id: 'err_2', q: 'Tìm và sửa lỗi sai trong câu: "They has lived in this city for over ten years."', ans: 'has → have', opts: ['has → have', 'lived → live', 'for → since', 'over → at'], exp: 'Chủ ngữ "They" số nhiều đi với trợ động từ "have" trong thì hiện tại hoàn thành.' },
  { id: 'err_3', q: 'Tìm và sửa lỗi sai trong câu: "He is more taller than his elder brother."', ans: 'more taller → taller', opts: ['more taller → taller', 'his → her', 'elder → old', 'is → are'], exp: '"Tall" là tính từ ngắn, so sánh hơn là "taller", không dùng "more taller".' },
  { id: 'err_4', q: 'Tìm và sửa lỗi sai trong câu: "I look forward to hear from you soon."', ans: 'hear → hearing', opts: ['hear → hearing', 'look → looking', 'to → for', 'soon → sooner'], exp: 'Cấu trúc "look forward to + V-ing" đòi hỏi động từ đuôi -ing: "hearing".' },
  { id: 'err_5', q: 'Tìm và sửa lỗi sai trong câu: "Yesterday, we go to the museum by bus."', ans: 'go → went', opts: ['go → went', 'to → at', 'the → a', 'by → on'], exp: 'Có trạng từ quá khứ "Yesterday", động từ "go" phải chia ở quá khứ đơn: "went".' },

  // Task Group 2
  { id: 'err_6', q: 'Tìm và sửa lỗi sai trong câu: "If it will rain tomorrow, we will cancel the picnic."', ans: 'will rain → rains', opts: ['will rain → rains', 'tomorrow → yesterday', 'will cancel → cancel', 'the → a'], exp: 'Trong mệnh đề If của câu điều kiện loại 1, động từ chia ở hiện tại đơn: "rains".' },
  { id: 'err_7', q: 'Tìm và sửa lỗi sai trong câu: "She is capable to solve complex mathematical problems."', ans: 'capable to → capable of', opts: ['capable to → capable of', 'solve → solved', 'complex → complexity', 'is → are'], exp: 'Cấu trúc đúng là "capable of + V-ing": "capable of solving".' },
  { id: 'err_8', q: 'Tìm và sửa lỗi sai trong câu: "Neither the manager nor the employees was present."', ans: 'was → were', opts: ['was → were', 'the → a', 'nor → or', 'present → presence'], exp: 'Cấu trúc "Neither... nor..." động từ chia theo chủ ngữ gần nhất ("the employees" số nhiều → "were").' },
  { id: 'err_9', q: 'Tìm và sửa lỗi sai trong câu: "Despite of the heavy rain, they completed the marathon."', ans: 'Despite of → Despite', opts: ['Despite of → Despite', 'heavy → heavily', 'they → them', 'completed → complete'], exp: '"Despite" không đi kèm giới từ "of" (hoặc dùng "In spite of").' },
  { id: 'err_10', q: 'Tìm và sửa lỗi sai trong câu: "The information you provided are very helpful to us."', ans: 'are → is', opts: ['are → is', 'provided → provide', 'helpful → helpfully', 'to → for'], exp: '"Information" là danh từ không đếm được, động từ to be chia số ít: "is".' },

  // Task Group 3
  { id: 'err_11', q: 'Tìm và sửa lỗi sai trong câu: "He suggested me to attend the training workshop."', ans: 'suggested me to attend → suggested that I attend', opts: ['suggested me to attend → suggested that I attend', 'attend → attending', 'training → train', 'the → a'], exp: '"Suggest" không đi với cấu trúc "suggest someone to do something".' },
  { id: 'err_12', q: 'Tìm và sửa lỗi sai trong câu: "She has been working here since five months."', ans: 'since → for', opts: ['since → for', 'has been → is', 'working → worked', 'five → fifth'], exp: '"Five months" là khoảng thời gian nên phải dùng giới từ "for", không dùng "since".' },
  { id: 'err_13', q: 'Tìm và sửa lỗi sai trong câu: "I am used to wake up early every weekday morning."', ans: 'wake → waking', opts: ['wake → waking', 'used to → use to', 'early → earlier', 'every → all'], exp: 'Cấu trúc "be used to + V-ing" diễn tả thói quen: "be used to waking up".' },
  { id: 'err_14', q: 'Tìm và sửa lỗi sai trong câu: "The book who you lent me was absolutely fascinating."', ans: 'who → which / that', opts: ['who → which / that', 'lent → lend', 'was → were', 'absolutely → absolute'], exp: 'Đại từ quan hệ thay thế cho danh từ chỉ vật "book" phải là "which" hoặc "that".' },
  { id: 'err_15', q: 'Tìm và sửa lỗi sai trong câu: "We discussed about the new project proposal in detail."', ans: 'discussed about → discussed', opts: ['discussed about → discussed', 'new → newly', 'in detail → detailed', 'the → a'], exp: '"Discuss" là ngoại động từ, không đi kèm giới từ "about".' },

  // Task Group 4
  { id: 'err_16', q: 'Tìm và sửa lỗi sai trong câu: "Hardly had I arrived when the phone rang."', ans: 'rang → ring', opts: ['rang → ring', 'had I → I had', 'when → than', 'arrived → arriving'], exp: 'Cấu trúc "Hardly had + S + V3 when + S + V2", câu gốc đã chuẩn ngữ pháp đảo ngữ.' },
  { id: 'err_17', q: 'Tìm và sửa lỗi sai trong câu: "Every students must submit their assignment on time."', ans: 'students → student', opts: ['students → student', 'must → should', 'their → his', 'on time → in time'], exp: '"Every" đi kèm danh từ đếm được số ít: "Every student".' },
  { id: 'err_18', q: 'Tìm và sửa lỗi sai trong câu: "Although it was cold, but we decided to go hiking."', ans: 'bỏ liên từ but', opts: ['bỏ liên từ but', 'was → were', 'cold → coldly', 'go → going'], exp: 'Không dùng đồng thời cả "Although" và "but" trong cùng một câu.' },
  { id: 'err_19', q: 'Tìm và sửa lỗi sai trong câu: "She speaks English very good in business meetings."', ans: 'good → well', opts: ['good → well', 'speaks → speak', 'very → much', 'in → on'], exp: 'Bổ nghĩa cho động từ "speaks" cần dùng phó từ "well", không dùng tính từ "good".' },
  { id: 'err_20', q: 'Tìm và sửa lỗi sai trong câu: "I prefer drinking green tea than black coffee."', ans: 'than → to', opts: ['than → to', 'drinking → drink', 'green → greener', 'tea → teas'], exp: 'Cấu trúc so sánh thích hơn: "prefer A to B" (dùng giới từ "to", không dùng "than").' },
];

/**
 * Main generator: Produces exactly 60 authentic questions for the user's level
 * @param {string} level - 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
 * @param {object} [options={}] - { dateStr, recentQuestionIds, seed }
 */
function generateDailyBankForLevel(level = 'A1', options = {}) {
  const normLevel = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level) ? level : 'A1';
  const { dateStr = 'default_date', recentQuestionIds = new Set(), seed = null } = options;
  const randomFn = createSeededRandom(seed || `${normLevel}_${dateStr}`);

  const levelLessons = curriculum[normLevel] || curriculum.A1;
  const allVocab = levelLessons.flatMap((l) => l.vocabularies || []);

  // ----------------------------------------------------
  // PART 1: 20 VOCABULARY QUESTIONS (DISTINCT WORDS)
  // ----------------------------------------------------
  const selectedVocabs = prioritizeFresh(
    allVocab,
    20,
    recentQuestionIds,
    (v) => `vocab_${normLevel}_${v.word}`,
    randomFn
  );

  const vocabQuestions = selectedVocabs.map((v, i) => {
    const targetNorm = (v.word || '').toLowerCase();
    const targetPos = v.partOfSpeech || 'noun';
    const targetCat = v.category || 'General';

    // 1. Same POS and same category
    const samePosSameCat = allVocab.filter(
      (o) => o.word.toLowerCase() !== targetNorm && o.partOfSpeech === targetPos && o.category === targetCat
    );
    // 2. Same POS any category
    const samePosAny = allVocab.filter(
      (o) => o.word.toLowerCase() !== targetNorm && o.partOfSpeech === targetPos
    );
    // 3. Other words in level
    const anyOther = allVocab.filter((o) => o.word.toLowerCase() !== targetNorm);

    const candidates = [...samePosSameCat, ...samePosAny, ...anyOther];
    const seenWords = new Set([targetNorm]);
    const seenMeanings = new Set([(v.meaning || '').toLowerCase()]);
    const uniquePool = [];

    for (const c of candidates) {
      const cWord = c.word.toLowerCase();
      const cMeaning = (c.meaning || '').toLowerCase();
      if (!seenWords.has(cWord) && !seenMeanings.has(cMeaning)) {
        seenWords.add(cWord);
        seenMeanings.add(cMeaning);
        uniquePool.push(c);
        if (uniquePool.length >= 8) break;
      }
    }

    const shuffledDistractors = shuffleArray(uniquePool, randomFn);

    const d1 = shuffledDistractors[0]?.meaning || 'Khái niệm liên quan';
    const d2 = shuffledDistractors[1]?.meaning || 'Học phần bổ trợ';
    const d3 = shuffledDistractors[2]?.meaning || 'Thực hành ngôn ngữ';

    const wordD1 = shuffledDistractors[0]?.word || (targetPos === 'verb' ? 'practice' : 'lesson');
    const wordD2 = shuffledDistractors[1]?.word || (targetPos === 'verb' ? 'review' : 'grammar');
    const wordD3 = shuffledDistractors[2]?.word || (targetPos === 'verb' ? 'study' : 'language');

    const creative = getCreativeSentenceForWord(v.word, targetPos, targetCat, v.meaning);

    if (i % 3 === 0) {
      // Meaning Question
      const opts = shuffleArray([v.meaning, d1, d2, d3], randomFn);
      return {
        id: `vocab_${normLevel}_${v.word}_meaning`,
        part: 1,
        partName: 'Từ vựng',
        type: 'VOCAB_MEANING',
        question: `What is the accurate meaning of the word "${v.word}"?`,
        options: opts,
        correctAnswer: v.meaning,
        explanation: `"${v.word}" (${v.pronunciation || ''}) means: "${v.meaning}".`,
        isCorrect: false,
        selectedAnswer: null,
        wrongAttempts: 0,
      };
    } else if (i % 3 === 1) {
      // Authentic Sentence Completion Question with vivid, realistic situational context
      const opts = shuffleArray([v.word, wordD1, wordD2, wordD3], randomFn);
      return {
        id: `vocab_${normLevel}_${v.word}_sentence`,
        part: 1,
        partName: 'Từ vựng',
        type: 'VOCAB_SENTENCE',
        question: `Complete the sentence: "${creative.sentenceBlank}"`,
        options: opts,
        correctAnswer: v.word,
        explanation: `"${v.word}" (${v.meaning}) fits correctly: "${creative.sentence}"`,
        isCorrect: false,
        selectedAnswer: null,
        wrongAttempts: 0,
      };
    } else {
      // Context / Identification Question
      const posLabel = v.partOfSpeech === 'verb' ? 'động từ' : (v.partOfSpeech === 'adjective' ? 'tính từ' : 'từ vựng');
      const opts = shuffleArray([v.word, wordD1, wordD2, wordD3], randomFn);
      return {
        id: `vocab_${normLevel}_${v.word}_context`,
        part: 1,
        partName: 'Từ vựng',
        type: 'VOCAB_CONTEXT',
        question: `Từ ${posLabel} tiếng Anh nào mang ý nghĩa là "${v.meaning}"?`,
        options: opts,
        correctAnswer: v.word,
        explanation: `Từ tiếng Anh biểu đạt nghĩa "${v.meaning}" là "${v.word}".`,
        isCorrect: false,
        selectedAnswer: null,
        wrongAttempts: 0,
      };
    }
  });

  // ----------------------------------------------------
  // PART 2: 10 SITUATIONAL SPEAKING QUESTIONS
  // ----------------------------------------------------
  const selectedSpeaking = prioritizeFresh(
    ALL_SPEAKING_SITUATIONS,
    10,
    recentQuestionIds,
    (s) => `speaking_${normLevel}_${s.id}`,
    randomFn
  );

  const speakingQuestions = selectedSpeaking.map((s, idx) => ({
    id: `speaking_${normLevel}_${s.id}`,
    part: 2,
    partName: 'Luyện nói',
    type: 'SPEAKING_SITUATION',
    question: `Tình huống: ${s.sit}\n${s.prompt}\n→ Chọn câu phản hồi phù hợp và tự nhiên nhất:`,
    options: shuffleArray(s.opts, randomFn),
    correctAnswer: s.ans,
    explanation: s.exp,
    isCorrect: false,
    selectedAnswer: null,
    wrongAttempts: 0,
  }));

  // ----------------------------------------------------
  // PART 3: 10 ERROR CORRECTION QUESTIONS (2 TASKS x 5)
  // ----------------------------------------------------
  const selectedErrors = prioritizeFresh(
    ALL_ERROR_SENTENCES,
    10,
    recentQuestionIds,
    (e) => `error_${normLevel}_${e.id}`,
    randomFn
  );

  const errorQuestions = selectedErrors.map((e, idx) => {
    const taskNumber = idx < 5 ? 1 : 2;
    const taskIndex = (idx % 5) + 1;
    return {
      id: `error_${normLevel}_${e.id}`,
      part: 3,
      partName: 'Tìm và sửa lỗi sai',
      type: 'ERROR_CORRECTION',
      taskNumber,
      question: `[Bài ${taskNumber} - Câu ${taskIndex}/5]\n${e.q}`,
      options: shuffleArray(e.opts, randomFn),
      correctAnswer: e.ans,
      explanation: e.exp,
      isCorrect: false,
      selectedAnswer: null,
      wrongAttempts: 0,
    };
  });

  // ----------------------------------------------------
  // PART 4: 10 LISTENING QUESTIONS (2 TASKS x 5)
  // Drawn from Curriculum Lessons of this specific CEFR level
  // ----------------------------------------------------
  const candidateLessons = levelLessons.filter(
    (l) => l.listenings && l.listenings[0] && l.listenings[0].questions
  );
  const selectedListeningLessons = prioritizeFresh(
    candidateLessons,
    2,
    recentQuestionIds,
    (l) => `listening_track_${normLevel}_${l.orderNumber}`,
    randomFn
  );

  const listeningQuestions = [];
  selectedListeningLessons.forEach((lesson, trackIdx) => {
    const track = lesson.listenings[0];
    let qArray = [];
    try {
      qArray = typeof track.questions === 'string' ? JSON.parse(track.questions) : track.questions;
    } catch {
      qArray = [];
    }

    qArray.slice(0, 5).forEach((qObj, qIdx) => {
      listeningQuestions.push({
        id: `listening_${normLevel}_L${lesson.orderNumber}_Q${qIdx + 1}`,
        part: 4,
        partName: 'Luyện nghe',
        type: 'LISTENING',
        taskNumber: trackIdx + 1,
        audioTitle: track.title || `Audio Track ${trackIdx + 1}`,
        audioText: track.transcript || '',
        question: `[Bài nghe ${trackIdx + 1} - Câu ${qIdx + 1}/5]\n${qObj.question}`,
        options: shuffleArray(qObj.options || [], randomFn),
        correctAnswer: qObj.correctAnswer,
        explanation: qObj.explanation,
        isCorrect: false,
        selectedAnswer: null,
        wrongAttempts: 0,
      });
    });
  });

  // ----------------------------------------------------
  // PART 5: 10 READING QUESTIONS (2 TASKS x 5)
  // Drawn from Curriculum Lessons of this specific CEFR level
  // ----------------------------------------------------
  const candidateReadingLessons = levelLessons.filter(
    (l) => l.readings && l.readings[0] && l.readings[0].questions
  );
  const selectedReadingLessons = prioritizeFresh(
    candidateReadingLessons,
    2,
    recentQuestionIds,
    (l) => `reading_passage_${normLevel}_${l.orderNumber}`,
    randomFn
  );

  const readingQuestions = [];
  selectedReadingLessons.forEach((lesson, passageIdx) => {
    const readingModule = lesson.readings[0];
    let qArray = [];
    try {
      qArray = typeof readingModule.questions === 'string'
        ? JSON.parse(readingModule.questions)
        : readingModule.questions;
    } catch {
      qArray = [];
    }

    qArray.slice(0, 5).forEach((qObj, qIdx) => {
      readingQuestions.push({
        id: `reading_${normLevel}_L${lesson.orderNumber}_Q${qIdx + 1}`,
        part: 5,
        partName: 'Luyện đọc',
        type: 'READING',
        taskNumber: passageIdx + 1,
        passageTitle: readingModule.title || `Reading Passage ${passageIdx + 1}`,
        passageText: readingModule.passage || '',
        question: `[Bài đọc ${passageIdx + 1} - Câu ${qIdx + 1}/5]\n${qObj.question}`,
        options: shuffleArray(qObj.options || [], randomFn),
        correctAnswer: qObj.correctAnswer,
        explanation: qObj.explanation,
        isCorrect: false,
        selectedAnswer: null,
        wrongAttempts: 0,
      });
    });
  });

  return [
    { partNumber: 1, title: 'Từ vựng', targetCount: 20, questions: vocabQuestions },
    { partNumber: 2, title: 'Luyện nói', targetCount: 10, questions: speakingQuestions },
    { partNumber: 3, title: 'Tìm và sửa lỗi sai', targetCount: 10, questions: errorQuestions },
    { partNumber: 4, title: 'Luyện nghe', targetCount: 10, questions: listeningQuestions },
    { partNumber: 5, title: 'Luyện đọc', targetCount: 10, questions: readingQuestions },
  ];
}

module.exports = {
  generateDailyBankForLevel,
  ALL_SPEAKING_SITUATIONS,
  ALL_ERROR_SENTENCES,
};
