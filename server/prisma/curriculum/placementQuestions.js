// placementQuestions.js - Standardized Multi-Pool CEFR Placement Test (A1 to C2)
// Generates freshly randomized 25-question placement test sets while strictly preserving:
// - Part 1: Exactly 15 Fill-in-the-blank questions (A1: 3, A2: 3, B1: 3, B2: 2, C1: 2, C2: 2)
// - Part 2: Exactly 10 Short Listening questions (A1: 1, A2: 1, B1: 2, B2: 2, C1: 2, C2: 2)
// - Total: Strictly 25 Questions, ordered 1..25, sequential progression from A1 to C2.

function shuffle(arr, randomFn = Math.random) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// =============================================================================
// QUESTION POOLS ACROSS CEFR TIERS
// =============================================================================

const QUESTION_POOLS = {
  // ---------------------------------------------------------------------------
  // PART 1: FILL-IN-THE-BLANK (15 QUESTIONS NEEDED: 3 A1, 3 A2, 3 B1, 2 B2, 2 C1, 2 C2)
  // ---------------------------------------------------------------------------
  part1: {
    A1: [
      {
        id: 'pq_fb_a1_01',
        levelTarget: 'A1',
        category: 'FillBlank',
        question: 'This is my sister. _____ name is Sarah.',
        options: ['She', 'Hers', 'Her', "Her's"],
        correctAnswer: 'Her',
        audioText: null,
        explanation: 'Tính từ sở hữu cho người nữ ngôi thứ 3 số ít là "Her" (Her name = Tên của cô ấy).'
      },
      {
        id: 'pq_fb_a1_02',
        levelTarget: 'A1',
        category: 'FillBlank',
        question: 'There _____ three red apples on the kitchen table.',
        options: ['is', 'are', 'am', 'was'],
        correctAnswer: 'are',
        audioText: null,
        explanation: 'Danh từ "three red apples" là danh từ số nhiều ở hiện tại, động từ To Be phải là "are".'
      },
      {
        id: 'pq_fb_a1_03',
        levelTarget: 'A1',
        category: 'FillBlank',
        question: 'Every evening, we wash the dirty _____ in the kitchen sink after dinner.',
        options: ['pots', 'towels', 'glasses', 'dishes'],
        correctAnswer: 'dishes',
        audioText: null,
        explanation: 'Cụm từ cố định thông dụng là "wash the dishes" (rửa bát đĩa sau bữa ăn).'
      },
      {
        id: 'pq_fb_a1_04',
        levelTarget: 'A1',
        category: 'FillBlank',
        question: 'My brother and I _____ students at an international language school.',
        options: ['is', 'are', 'am', 'be'],
        correctAnswer: 'are',
        audioText: null,
        explanation: 'Chủ ngữ ngôi gộp "My brother and I" tương đương đại từ "We", động từ To Be chia là "are".'
      },
      {
        id: 'pq_fb_a1_05',
        levelTarget: 'A1',
        category: 'FillBlank',
        question: 'What time do you usually _____ breakfast every weekday morning?',
        options: ['eat', 'drink', 'cook', 'make'],
        correctAnswer: 'eat',
        audioText: null,
        explanation: 'Cụm từ "eat breakfast" (ăn sáng) là collocation phổ biến và chính xác nhất.'
      },
      {
        id: 'pq_fb_a1_06',
        levelTarget: 'A1',
        category: 'FillBlank',
        question: 'This is Peter. _____ lives in a quiet house near the community park.',
        options: ['Him', 'He', 'His', 'He is'],
        correctAnswer: 'He',
        audioText: null,
        explanation: 'Vị trí đầu câu làm chủ ngữ chỉ người nam ngôi thứ ba số ít là đại từ nhân xưng "He".'
      }
    ],

    A2: [
      {
        id: 'pq_fb_a2_01',
        levelTarget: 'A2',
        category: 'FillBlank',
        question: 'Yesterday afternoon, my family _____ to the seaside by train.',
        options: ['went', 'gone', 'goes', 'was going'],
        correctAnswer: 'went',
        audioText: null,
        explanation: 'Trạng từ quá khứ "Yesterday afternoon" yêu cầu động từ "go" chia ở quá khứ đơn là "went".'
      },
      {
        id: 'pq_fb_a2_02',
        levelTarget: 'A2',
        category: 'FillBlank',
        question: 'This modern laptop is _____ than the desktop computer we bought last year.',
        options: ['fastest', 'more fast', 'faster', 'as fast'],
        correctAnswer: 'faster',
        audioText: null,
        explanation: '"Fast" là tính từ ngắn 1 âm tiết, dạng so sánh hơn với "than" là "faster".'
      },
      {
        id: 'pq_fb_a2_03',
        levelTarget: 'A2',
        category: 'FillBlank',
        question: 'The musical concert will begin promptly _____ 8 o’clock on Saturday evening.',
        options: ['on', 'at', 'in', 'to'],
        correctAnswer: 'at',
        audioText: null,
        explanation: 'Giới từ đi trước giờ giấc cụ thể (8 o’clock) luôn là "at".'
      },
      {
        id: 'pq_fb_a2_04',
        levelTarget: 'A2',
        category: 'FillBlank',
        question: 'She didn’t _____ her chemistry homework last night because she felt exhausted.',
        options: ['finish', 'finished', 'finishing', 'finishes'],
        correctAnswer: 'finish',
        audioText: null,
        explanation: 'Sau trợ động từ phủ định ở quá khứ "didn’t", động từ chính luôn ở dạng nguyên mẫu không "to": "finish".'
      },
      {
        id: 'pq_fb_a2_05',
        levelTarget: 'A2',
        category: 'FillBlank',
        question: 'Mount Everest is the _____ mountain peak in the entire world.',
        options: ['highest', 'higher', 'most high', 'high'],
        correctAnswer: 'highest',
        audioText: null,
        explanation: 'Dạng so sánh nhất của tính từ ngắn "high" khi có mạo từ "the" là "the highest".'
      },
      {
        id: 'pq_fb_a2_06',
        levelTarget: 'A2',
        category: 'FillBlank',
        question: 'We decided to travel _____ bus because it was much cheaper than taking a taxi.',
        options: ['by', 'on', 'with', 'in'],
        correctAnswer: 'by',
        audioText: null,
        explanation: 'Giới từ chỉ phương tiện giao thông thông thường không mạo từ là "by" (by bus, by train, by car).'
      }
    ],

    B1: [
      {
        id: 'pq_fb_b1_01',
        levelTarget: 'B1',
        category: 'FillBlank',
        question: 'We decided to continue our outdoor hike _____ it started to rain lightly.',
        options: ['although', 'despite', 'because', 'unless'],
        correctAnswer: 'although',
        audioText: null,
        explanation: '"Although" (mặc dù) là liên từ nối mệnh đề chỉ sự nhượng bộ (chỉ đi kèm mệnh đề có S + V).'
      },
      {
        id: 'pq_fb_b1_02',
        levelTarget: 'B1',
        category: 'FillBlank',
        question: 'She has _____ in London for five years and speaks English fluently now.',
        options: ['live', 'living', 'lives', 'lived'],
        correctAnswer: 'lived',
        audioText: null,
        explanation: 'Thì hiện tại hoàn thành với "for five years" có cấu trúc: S + has + V(PII) ("lived").'
      },
      {
        id: 'pq_fb_b1_03',
        levelTarget: 'B1',
        category: 'FillBlank',
        question: 'Could you please look _____ my pet cat while I am away on vacation next week?',
        options: ['for', 'after', 'at', 'into'],
        correctAnswer: 'after',
        audioText: null,
        explanation: 'Cụm động từ "look after" có nghĩa là chăm sóc, trông nom ai/cái gì.'
      },
      {
        id: 'pq_fb_b1_04',
        levelTarget: 'B1',
        category: 'FillBlank',
        question: 'The young woman _____ car was stolen immediately contacted the local police.',
        options: ['whose', 'who', 'whom', 'which'],
        correctAnswer: 'whose',
        audioText: null,
        explanation: 'Đại từ quan hệ chỉ sở hữu đứng trước danh từ "car" là "whose" (whose car = xe của cô ấy).'
      },
      {
        id: 'pq_fb_b1_05',
        levelTarget: 'B1',
        category: 'FillBlank',
        question: 'If it rains heavily tomorrow morning, the organizers _____ the outdoor marathon.',
        options: ['will cancel', 'cancelled', 'cancel', 'would cancel'],
        correctAnswer: 'will cancel',
        audioText: null,
        explanation: 'Câu điều kiện loại 1 diễn tả sự việc có thể xảy ra: Mệnh đề chính dùng "will + V".'
      },
      {
        id: 'pq_fb_b1_06',
        levelTarget: 'B1',
        category: 'FillBlank',
        question: 'I am really looking forward to _____ from you regarding the graphic design position.',
        options: ['hearing', 'hear', 'heard', 'be heard'],
        correctAnswer: 'hearing',
        audioText: null,
        explanation: 'Cấu trúc "look forward to + V-ing" yêu cầu động từ đuôi -ing: "hearing".'
      }
    ],

    B2: [
      {
        id: 'pq_fb_b2_01',
        levelTarget: 'B2',
        category: 'FillBlank',
        question: 'He has been running for three hours without rest; he _____ be exhausted.',
        options: ['can', 'should', 'must', 'need'],
        correctAnswer: 'must',
        audioText: null,
        explanation: 'Động từ khuyết thiếu "must" dùng để đưa ra suy đoán chắc chắn logic dựa trên bằng chứng hiển nhiên.'
      },
      {
        id: 'pq_fb_b2_02',
        levelTarget: 'B2',
        category: 'FillBlank',
        question: 'If I _____ more free time, I would enroll in an advanced digital marketing course.',
        options: ['had', 'have', 'would have', 'will have'],
        correctAnswer: 'had',
        audioText: null,
        explanation: 'Câu điều kiện loại 2 giả định điều trái ngược ở hiện tại: Mệnh đề If dùng quá khứ đơn (had), mệnh đề chính dùng would + V.'
      },
      {
        id: 'pq_fb_b2_03',
        levelTarget: 'B2',
        category: 'FillBlank',
        question: 'The municipal safety regulations _____ by the city council before the construction began.',
        options: ['had been approved', 'approved', 'were approving', 'have approved'],
        correctAnswer: 'had been approved',
        audioText: null,
        explanation: 'Hành động xảy ra và hoàn tất trước một mốc quá khứ (before construction began) ở thể bị động: "had been approved".'
      },
      {
        id: 'pq_fb_b2_04',
        levelTarget: 'B2',
        category: 'FillBlank',
        question: 'She was unable to attend the conference, _____ she had contracted a severe seasonal flu.',
        options: ['as', 'despite', 'in spite of', 'whereas'],
        correctAnswer: 'as',
        audioText: null,
        explanation: 'Liên từ "as" đứng trước mệnh đề mang ý nghĩa giải thích nguyên nhân ("bởi vì").'
      },
      {
        id: 'pq_fb_b2_05',
        levelTarget: 'B2',
        category: 'FillBlank',
        question: 'You had better _____ a qualified physician before starting that rigorous fitness program.',
        options: ['consult', 'consulting', 'to consult', 'consulted'],
        correctAnswer: 'consult',
        audioText: null,
        explanation: 'Cấu trúc "had better + V(nguyên mẫu không to)" dùng để đưa ra lời khuyên khẩn thiết.'
      },
      {
        id: 'pq_fb_b2_06',
        levelTarget: 'B2',
        category: 'FillBlank',
        question: 'The senior executive regrets _____ his temper during the annual shareholder meeting.',
        options: ['losing', 'to lose', 'lost', 'have lost'],
        correctAnswer: 'losing',
        audioText: null,
        explanation: 'Cấu trúc "regret + V-ing" diễn đạt sự hối tiếc vì đã làm điều gì trong quá khứ.'
      }
    ],

    C1: [
      {
        id: 'pq_fb_c1_01',
        levelTarget: 'C1',
        category: 'FillBlank',
        question: 'The central bank introduced rigorous monetary measures to _____ rampant inflation.',
        options: ['expand', 'provoke', 'deteriorate', 'curb'],
        correctAnswer: 'curb',
        audioText: null,
        explanation: 'Động từ "curb" nghĩa là kiềm chế, kìm hãm (collocation cao cấp: "curb inflation" = kiềm chế lạm phát).'
      },
      {
        id: 'pq_fb_c1_02',
        levelTarget: 'C1',
        category: 'FillBlank',
        question: 'Seldom _____ witnessed such an overwhelming display of public solidarity.',
        options: ['historians have', 'have historians', 'historians had', 'did historians have'],
        correctAnswer: 'have historians',
        audioText: null,
        explanation: 'Cấu trúc đảo ngữ với trạng từ mang nghĩa phủ định/hiếm khi (Seldom + trợ động từ + S + V): "Seldom have historians witnessed".'
      },
      {
        id: 'pq_fb_c1_03',
        levelTarget: 'C1',
        category: 'FillBlank',
        question: 'The committee chairperson insisted that an environmental impact assessment _____ conducted without delay.',
        options: ['be', 'is', 'was', 'to be'],
        correctAnswer: 'be',
        audioText: null,
        explanation: 'Cấu trúc câu giả định thức (Subjunctive mood) sau động từ "insist that S + (should) be + PII": "be conducted".'
      },
      {
        id: 'pq_fb_c1_04',
        levelTarget: 'C1',
        category: 'FillBlank',
        question: 'Had the emergency warning sirens sounded earlier, far fewer casualties _____ recorded.',
        options: ['would have been', 'will have been', 'would be', 'had been'],
        correctAnswer: 'would have been',
        audioText: null,
        explanation: 'Đảo ngữ câu điều kiện loại 3 (Had + S + PII, S + would have been + PII).'
      },
      {
        id: 'pq_fb_c1_05',
        levelTarget: 'C1',
        category: 'FillBlank',
        question: 'His groundbreaking treatise was commended for shedding _____ light on medieval public administration.',
        options: ['invaluable', 'futile', 'negligible', 'redundant'],
        correctAnswer: 'invaluable',
        audioText: null,
        explanation: 'Collocation học thuật: "shed invaluable light on..." (làm sáng tỏ vô giá).'
      }
    ],

    C2: [
      {
        id: 'pq_fb_c2_01',
        levelTarget: 'C2',
        category: 'FillBlank',
        question: 'The auditing committee praised the accountant for her _____ attention to balance sheet details.',
        options: ['superficial', 'negligent', 'meticulous', 'cursory'],
        correctAnswer: 'meticulous',
        audioText: null,
        explanation: '"Meticulous" (tỉ mỉ, cẩn trọng tuyệt đối đến từng chi tiết nhỏ) là tính từ học thuật cấp C2.'
      },
      {
        id: 'pq_fb_c2_02',
        levelTarget: 'C2',
        category: 'FillBlank',
        question: 'The experimental outcomes remain provisional, _____ that several critical parameters were not strictly controlled.',
        options: ['given', 'notwithstanding', 'whereas', 'despite'],
        correctAnswer: 'given',
        audioText: null,
        explanation: 'Cụm liên từ "given that..." ở cấp độ C2 diễn đạt ý nghĩa "xét đến việc / trong bối cảnh rằng".'
      },
      {
        id: 'pq_fb_c2_03',
        levelTarget: 'C2',
        category: 'FillBlank',
        question: 'His eloquent reasoning was so comprehensive that it completely _____ the opponent\'s hypothesis.',
        options: ['demolished', 'replicated', 'accentuated', 'condoned'],
        correctAnswer: 'demolished',
        audioText: null,
        explanation: '"Demolish an argument/hypothesis" là cách diễn đạt sắc thái C2 nghĩa là bác bỏ, phá tan hoàn toàn luận điểm đối lập.'
      },
      {
        id: 'pq_fb_c2_04',
        levelTarget: 'C2',
        category: 'FillBlank',
        question: 'The diplomat’s ambiguous statement was deliberately intended to _____ rather than clarify negotiations.',
        options: ['obfuscate', 'illuminate', 'reiterate', 'venerate'],
        correctAnswer: 'obfuscate',
        audioText: null,
        explanation: '"Obfuscate" nghĩa là cố tình làm lu mờ, gây bối rối, đánh lạc hướng làm cho khó hiểu.'
      },
      {
        id: 'pq_fb_c2_05',
        levelTarget: 'C2',
        category: 'FillBlank',
        question: 'Under no circumstances _____ confidential patient data be shared without statutory authorization.',
        options: ['may', 'can not', 'must not', 'should not'],
        correctAnswer: 'may',
        audioText: null,
        explanation: 'Cấu trúc đảo ngữ phủ định bắt đầu bằng "Under no circumstances" + modal verb + S + be PII: "may confidential patient data be shared".'
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // PART 2: SHORT LISTENING (10 QUESTIONS NEEDED: 1 A1, 1 A2, 2 B1, 2 B2, 2 C1, 2 C2)
  // ---------------------------------------------------------------------------
  part2: {
    A1: [
      {
        id: 'pq_ls_a1_01',
        levelTarget: 'A1',
        category: 'Listening',
        question: 'What time does the speaker wake up every morning?',
        options: ['7:00 AM', '8:00 AM', '6:30 AM', '6:00 AM'],
        correctAnswer: '6:00 AM',
        audioText: 'Hello! My name is Lucy. Every morning, I wake up at six o’clock and eat bread with fresh milk for breakfast.',
        explanation: 'Trong audio, người nói giới thiệu: "Every morning, I wake up at six o’clock."'
      },
      {
        id: 'pq_ls_a1_02',
        levelTarget: 'A1',
        category: 'Listening',
        question: 'How many bedrooms does Tom’s apartment have?',
        options: ['Three bedrooms', 'Two bedrooms', 'One bedroom', 'Four bedrooms'],
        correctAnswer: 'Two bedrooms',
        audioText: 'Hi, I am Tom. My apartment has two small bedrooms, a cozy living room, and a sunny kitchen.',
        explanation: 'Người nói giới thiệu: "My apartment has two small bedrooms".'
      },
      {
        id: 'pq_ls_a1_03',
        levelTarget: 'A1',
        category: 'Listening',
        question: 'How many people are there in the speaker’s family?',
        options: ['Three people', 'Five people', 'Four people', 'Six people'],
        correctAnswer: 'Four people',
        audioText: 'Good morning! My family has four members: my parents, my elder sister, and me.',
        explanation: 'Người nói nêu rõ: "My family has four members".'
      }
    ],

    A2: [
      {
        id: 'pq_ls_a2_01',
        levelTarget: 'A2',
        category: 'Listening',
        question: 'What activity did the family enjoy together last weekend?',
        options: ['Climbing steep hills', 'Fishing by the river', 'Shopping at the market', 'Visiting the zoo'],
        correctAnswer: 'Fishing by the river',
        audioText: 'Last weekend, our family visited my grandparents in the countryside. We spent two peaceful days fishing by the river.',
        explanation: 'Trong audio, người nói chia sẻ: "We spent two peaceful days fishing by the river."'
      },
      {
        id: 'pq_ls_a2_02',
        levelTarget: 'A2',
        category: 'Listening',
        question: 'What genre of movie did the speaker watch yesterday evening?',
        options: ['Horror movie', 'Documentary', 'Comedy movie', 'Action film'],
        correctAnswer: 'Comedy movie',
        audioText: 'Yesterday evening, I went to the cinema with two classmates to watch an exciting comedy movie.',
        explanation: 'Người nói chia sẻ: "to watch an exciting comedy movie".'
      },
      {
        id: 'pq_ls_a2_03',
        levelTarget: 'A2',
        category: 'Listening',
        question: 'What direction should the listener turn at the traffic light?',
        options: ['Turn right', 'Turn left', 'Go straight', 'Cross the bridge'],
        correctAnswer: 'Turn left',
        audioText: 'To get to the public library, walk straight for two blocks, then turn left at the traffic light.',
        explanation: 'Chỉ dẫn nêu rõ: "then turn left at the traffic light".'
      }
    ],

    B1: [
      {
        id: 'pq_ls_b1_01',
        levelTarget: 'B1',
        category: 'Listening',
        question: 'What is the updated departure gate for flight VN302 to Tokyo?',
        options: ['Gate 12', 'Gate 14', 'Gate 24', 'Gate 42'],
        correctAnswer: 'Gate 24',
        audioText: 'Attention all passengers on flight VN302 to Tokyo: our departure gate has changed from Gate 12 to Gate 24 due to terminal maintenance.',
        explanation: 'Thông báo nêu rõ: "our departure gate has changed from Gate 12 to Gate 24".'
      },
      {
        id: 'pq_ls_b1_02',
        levelTarget: 'B1',
        category: 'Listening',
        question: 'How much RAM memory does the customer specify as a minimum requirement?',
        options: ['16 gigabytes', '8 gigabytes', '32 gigabytes', '64 gigabytes'],
        correctAnswer: '16 gigabytes',
        audioText: 'I am looking for a reliable second-hand laptop for graphic design. My budget is fifteen million dong, and I require at least sixteen gigabytes of RAM.',
        explanation: 'Khách hàng yêu cầu: "and I require at least sixteen gigabytes of RAM."'
      },
      {
        id: 'pq_ls_b1_03',
        levelTarget: 'B1',
        category: 'Listening',
        question: 'What time does complimentary breakfast finish at the hotel terrace?',
        options: ['9:00 AM', '10:00 AM', '9:30 AM', '8:30 AM'],
        correctAnswer: '9:30 AM',
        audioText: 'The hotel offers complimentary breakfast on the terrace from 6:30 AM to 9:30 AM every day.',
        explanation: 'Khách sạn thông báo: "from 6:30 AM to 9:30 AM every day".'
      },
      {
        id: 'pq_ls_b1_04',
        levelTarget: 'B1',
        category: 'Listening',
        question: 'How long does express shipping to Sydney usually take?',
        options: ['One to two days', 'Three to five business days', 'Seven business days', 'Two weeks'],
        correctAnswer: 'Three to five business days',
        audioText: 'The courier informed us that express delivery to Sydney usually takes between three and five business days.',
        explanation: 'Người chuyển phát thông báo: "takes between three and five business days".'
      }
    ],

    B2: [
      {
        id: 'pq_ls_b2_01',
        levelTarget: 'B2',
        category: 'Listening',
        question: 'What was the primary driver of the company’s quarterly revenue growth?',
        options: [
          'Aggressive internal budget cuts',
          'Reduced supplier pricing tariffs',
          'Short-term government emergency loans',
          'Strong enterprise demand in international markets'
        ],
        correctAnswer: 'Strong enterprise demand in international markets',
        audioText: 'Despite initial supply chain bottlenecks, our quarterly revenue increased by fifteen percent, primarily driven by strong enterprise demand in international markets.',
        explanation: 'Báo cáo chỉ rõ: "primarily driven by strong enterprise demand in international markets."'
      },
      {
        id: 'pq_ls_b2_02',
        levelTarget: 'B2',
        category: 'Listening',
        question: 'According to Dr. Morrison, what biological process does intermittent fasting stimulate?',
        options: [
          'Rapid depletion of vital muscle mass',
          'Cellular autophagy and metabolic flexibility',
          'Immediate deceleration of cardiac rhythm',
          'Heightened psychological food cravings'
        ],
        correctAnswer: 'Cellular autophagy and metabolic flexibility',
        audioText: 'Dr. Morrison emphasizes that intermittent fasting is not merely a weight-loss protocol; rather, it prompts cellular autophagy and enhances metabolic flexibility when sustained consistently.',
        explanation: 'Bác sĩ nhấn mạnh: "it prompts cellular autophagy and enhances metabolic flexibility".'
      },
      {
        id: 'pq_ls_b2_03',
        levelTarget: 'B2',
        category: 'Listening',
        question: 'What measure did the urban planning board prioritize to reduce carbon emissions?',
        options: [
          'Constructing elevated vehicular flyovers',
          'Expanding green pedestrian corridors',
          'Subsidizing conventional diesel fuel',
          'Increasing residential parking penalties'
        ],
        correctAnswer: 'Expanding green pedestrian corridors',
        audioText: 'The urban planning board resolved that expanding green pedestrian corridors would curb carbon emissions much more effectively than building additional vehicular flyovers.',
        explanation: 'Báo cáo chỉ rõ: "expanding green pedestrian corridors would curb carbon emissions".'
      },
      {
        id: 'pq_ls_b2_04',
        levelTarget: 'B2',
        category: 'Listening',
        question: 'According to the institute, what has oceanic warming caused over the past decade?',
        options: [
          'Doubled the frequency of category-four cyclones',
          'Permanently halted oceanic deep currents',
          'Reduced atmospheric moisture levels',
          'Prevented regional coastal storm surges'
        ],
        correctAnswer: 'Doubled the frequency of category-four cyclones',
        audioText: 'The meteorological institute noted that unseasonal oceanic warming has doubled the frequency of category-four tropical cyclones over the past decade.',
        explanation: 'Viện khí tượng nêu rõ: "doubled the frequency of category-four tropical cyclones".'
      }
    ],

    C1: [
      {
        id: 'pq_ls_c1_01',
        levelTarget: 'C1',
        category: 'Listening',
        question: 'What does the lead researcher assert regarding the preliminary correlations?',
        options: [
          'They resolve the etiology of sleep disorders',
          'They are statistically fraudulent anomalies',
          'They require rigorous longitudinal studies to confirm causality',
          'They refute modern neurobiology'
        ],
        correctAnswer: 'They require rigorous longitudinal studies to confirm causality',
        audioText: 'While the preliminary correlations appear persuasive on the surface, rigorous longitudinal studies are imperative to substantiate any definitive causal link between nocturnal screen exposure and adolescent insomnia.',
        explanation: 'Nhà nghiên cứu khẳng định: "rigorous longitudinal studies are imperative to substantiate any definitive causal link".'
      },
      {
        id: 'pq_ls_c1_02',
        levelTarget: 'C1',
        category: 'Listening',
        question: 'Why was the antitrust tribunal’s ruling commended by industry analysts?',
        options: [
          'It dismantled monopolistic safeguards and revitalized competition',
          'It granted anti-competitive state subsidies to incumbents',
          'It sanctioned punitive cross-border tariff barriers',
          'It mandated uniform subscription pricing'
        ],
        correctAnswer: 'It dismantled monopolistic safeguards and revitalized competition',
        audioText: 'The antitrust tribunal’s decision was commended for dismantling entrenched monopolistic safeguards, thereby revitalizing commercial competition across previously stagnant telecommunications sectors.',
        explanation: 'Quyết định được ca ngợi vì: "dismantling entrenched monopolistic safeguards, thereby revitalizing commercial competition".'
      },
      {
        id: 'pq_ls_c1_03',
        levelTarget: 'C1',
        category: 'Listening',
        question: 'What specific financial risk did the committee highlight regarding unchecked quantitative easing?',
        options: [
          'Runaway stagflation in vulnerable credit markets',
          'Immediate deflationary price collapses',
          'Excessive foreign capital currency reserves',
          'Unprecedented domestic manufacturing booms'
        ],
        correctAnswer: 'Runaway stagflation in vulnerable credit markets',
        audioText: 'The monetary policy committee stressed that quantitative easing without fiscal discipline risks triggering runaway stagflation across vulnerable credit markets.',
        explanation: 'Ủy ban cảnh báo: "risks triggering runaway stagflation across vulnerable credit markets".'
      },
      {
        id: 'pq_ls_c1_04',
        levelTarget: 'C1',
        category: 'Listening',
        question: 'What assumption was overturned by the submerged delta excavations?',
        options: [
          'That the civilization lacked urban hydraulic infrastructure',
          'That maritime trading networks never reached the delta',
          'That bronze metallurgy methods were imported',
          'That settlement architecture was purely nomadic'
        ],
        correctAnswer: 'That the civilization lacked urban hydraulic infrastructure',
        audioText: 'Archaeological excavations at the submerged delta revealed sophisticated drainage engineering, overturning assumptions that the bronze-age civilization lacked urban hydraulic infrastructure.',
        explanation: 'Khảo cổ học đã bác bỏ giả định: "that the bronze-age civilization lacked urban hydraulic infrastructure".'
      }
    ],

    C2: [
      {
        id: 'pq_ls_c2_01',
        levelTarget: 'C2',
        category: 'Listening',
        question: 'What defined the ambassador’s diplomatic address according to the analyst?',
        options: [
          'Blunt declarations of economic non-cooperation',
          'Reckless disclosure of classified treaties',
          'Hostile rhetoric inviting international arbitration',
          'Tacit concessions veiled beneath polished, non-committal rhetoric'
        ],
        correctAnswer: 'Tacit concessions veiled beneath polished, non-committal rhetoric',
        audioText: 'Her keynote was quintessential statecraft: impeccably courteous, thoroughly non-committal, yet laden with tacit concessions that only seasoned envoys could decipher.',
        explanation: 'Phân tích chỉ ra: "laden with tacit concessions that only seasoned envoys could decipher" (những nhượng bộ ngầm dưới lớp ngôn từ ngoại giao).'
      },
      {
        id: 'pq_ls_c2_02',
        levelTarget: 'C2',
        category: 'Listening',
        question: 'Which literary technique does the novelist employ in the critically acclaimed work?',
        options: [
          'Adhering dogmatically to linear biographical realism',
          'Juxtaposing allegorical melancholia with incisive social parody',
          'Recycling moralistic cliches for young readers',
          'Uncritically celebrating ephemeral influencer culture'
        ],
        correctAnswer: 'Juxtaposing allegorical melancholia with incisive social parody',
        audioText: 'The author’s latest masterpiece transcends conventional genres, juxtaposing allegorical melancholia with incisive social parody to dissect the ephemeral nature of contemporary adulation.',
        explanation: 'Đoạn audio nêu rõ: "juxtaposing allegorical melancholia with incisive social parody to dissect the ephemeral nature of contemporary adulation."'
      },
      {
        id: 'pq_ls_c2_03',
        levelTarget: 'C2',
        category: 'Listening',
        question: 'What trajectory does empiricism follow when divorced from ethical introspection according to the speaker?',
        options: [
          'It degenerates into cold utilitarian technocracy',
          'It naturally achieves profound humanist enlightenment',
          'It dissolves into subjective theological mysticism',
          'It guarantees equitable wealth distribution'
        ],
        correctAnswer: 'It degenerates into cold utilitarian technocracy',
        audioText: 'The philosopher’s critique suggests that empiricism, when divested of ethical introspection, inevitably degenerates into cold utilitarian technocracy.',
        explanation: 'Diễn giả khẳng định: "empiricism, when divested of ethical introspection, inevitably degenerates into cold utilitarian technocracy".'
      },
      {
        id: 'pq_ls_c2_04',
        levelTarget: 'C2',
        category: 'Listening',
        question: 'What constitutional consequence did the dissenting justice warn against?',
        options: [
          'Erosion of constitutional checks and balances by regulatory fiat',
          'Excessive legislative intervention in judicial appointments',
          'The complete abolition of federal appellate oversight',
          'Undue expansion of executive military authority'
        ],
        correctAnswer: 'Erosion of constitutional checks and balances by regulatory fiat',
        audioText: 'The appellate justice authored a dissenting opinion arguing that judicial deference to regulatory fiat impermissibly erodes constitutional checks and balances.',
        explanation: 'Thẩm phán cảnh báo: "judicial deference to regulatory fiat impermissibly erodes constitutional checks and balances".'
      }
    ]
  }
};

// Index all questions across pools by their unique ID
const ALL_QUESTIONS_BY_ID = {};
Object.values(QUESTION_POOLS.part1).forEach((pool) => {
  pool.forEach((q) => {
    ALL_QUESTIONS_BY_ID[q.id] = q;
  });
});
Object.values(QUESTION_POOLS.part2).forEach((pool) => {
  pool.forEach((q) => {
    ALL_QUESTIONS_BY_ID[q.id] = q;
  });
});

/**
 * Generates a randomized 25-question placement test set adhering strictly to CEFR quotas:
 * Part 1 (15 questions): A1: 3, A2: 3, B1: 3, B2: 2, C1: 2, C2: 2
 * Part 2 (10 questions): A1: 1, A2: 1, B1: 2, B2: 2, C1: 2, C2: 2
 * @param {Object} [options]
 * @param {boolean} [options.deterministic=false]
 * @returns {Array} Exactly 25 ordered questions
 */
function generateRandomizedPlacementTest(options = {}) {
  const { deterministic = false, randomFn = Math.random } = options;

  function pickN(pool, count) {
    if (deterministic) {
      return pool.slice(0, count);
    }
    const shuffled = shuffle(pool, randomFn);
    return shuffled.slice(0, count);
  }

  // Quotas for Part 1 (Fill-in)
  const p1_a1 = pickN(QUESTION_POOLS.part1.A1, 3);
  const p1_a2 = pickN(QUESTION_POOLS.part1.A2, 3);
  const p1_b1 = pickN(QUESTION_POOLS.part1.B1, 3);
  const p1_b2 = pickN(QUESTION_POOLS.part1.B2, 2);
  const p1_c1 = pickN(QUESTION_POOLS.part1.C1, 2);
  const p1_c2 = pickN(QUESTION_POOLS.part1.C2, 2);
  const part1Selected = [...p1_a1, ...p1_a2, ...p1_b1, ...p1_b2, ...p1_c1, ...p1_c2];

  // Quotas for Part 2 (Listening)
  const p2_a1 = pickN(QUESTION_POOLS.part2.A1, 1);
  const p2_a2 = pickN(QUESTION_POOLS.part2.A2, 1);
  const p2_b1 = pickN(QUESTION_POOLS.part2.B1, 2);
  const p2_b2 = pickN(QUESTION_POOLS.part2.B2, 2);
  const p2_c1 = pickN(QUESTION_POOLS.part2.C1, 2);
  const p2_c2 = pickN(QUESTION_POOLS.part2.C2, 2);
  const part2Selected = [...p2_a1, ...p2_a2, ...p2_b1, ...p2_b2, ...p2_c1, ...p2_c2];

  const fullSet = [...part1Selected, ...part2Selected];

  return fullSet.map((q, index) => {
    const orderNumber = index + 1;
    const partNumber = orderNumber <= 15 ? 1 : 2;
    const parsedOptions = Array.isArray(q.options)
      ? q.options
      : JSON.parse(q.options || '[]');

    const shuffledOptions = deterministic ? parsedOptions : shuffle(parsedOptions, randomFn);

    return {
      id: q.id,
      orderNumber,
      partNumber,
      levelTarget: q.levelTarget,
      category: q.category || (partNumber === 1 ? 'FillBlank' : 'Listening'),
      question: q.question,
      options: JSON.stringify(shuffledOptions),
      correctAnswer: q.correctAnswer,
      audioText: q.audioText || null,
      explanation: q.explanation,
    };
  });
}

function getQuestionById(id) {
  if (!id) return null;
  const cleanId = String(id).trim();

  // 1. Direct match by pool ID (e.g. 'pq_fb_a1_01')
  if (ALL_QUESTIONS_BY_ID[cleanId]) {
    return ALL_QUESTIONS_BY_ID[cleanId];
  }

  // 2. Match by legacy orderNumber (e.g. 'pq_1' or '1')
  const numMatch = cleanId.match(/^(?:pq_)?(\d+)$/i);
  if (numMatch) {
    const orderNum = parseInt(numMatch[1], 10);
    if (orderNum >= 1 && orderNum <= 25) {
      return BASE_CANONICAL_QUESTIONS[orderNum - 1];
    }
  }

  return null;
}

// Generate the canonical default set of 25 questions
const BASE_CANONICAL_QUESTIONS = generateRandomizedPlacementTest({ deterministic: true });

// Export the array directly for full backward compatibility, with attached pool helpers
const exportedArray = [...BASE_CANONICAL_QUESTIONS];
exportedArray.generateRandomizedPlacementTest = generateRandomizedPlacementTest;
exportedArray.getQuestionById = getQuestionById;
exportedArray.ALL_QUESTIONS_BY_ID = ALL_QUESTIONS_BY_ID;
exportedArray.QUESTION_POOLS = QUESTION_POOLS;

module.exports = exportedArray;
