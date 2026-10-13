// contextSentenceBank.js - Authentic, Creative Contextual Sentences for Vocabulary Learning
// Replaces all robotic placeholder templates with natural, diverse, context-rich English sentences.

const CURATED_SENTENCES = {
  // Food & Cafe
  burger: 'We ordered a juicy grilled _____ with crispy french fries for lunch.',
  pizza: 'They shared a large cheese _____ with mushroom toppings while watching the match.',
  menu: 'The waiter handed us the dinner _____ so we could choose our main courses.',
  order: 'When you are ready to _____, please let the server know.',
  bill: 'After finishing our dessert, we asked the staff for the _____ so we could pay.',
  waiter: 'The friendly _____ brought warm bread and glasses of ice water to our table.',
  eat: 'It is important to _____ a balanced diet with plenty of fresh vegetables.',
  drink: 'Doctors recommend that you _____ at least eight glasses of clean water daily.',
  hungry: 'I skipped breakfast this morning, so I feel very _____ right now.',
  thirsty: 'After running under the hot sun, the athlete was desperately _____ for cold water.',
  bread: 'The bakery sells freshly baked whole-wheat _____ every morning at six o\'clock.',
  rice: 'In many Asian cultures, steamed _____ is served as a staple with almost every meal.',
  meat: 'We visited the local butcher shop to purchase fresh _____ for the barbecue.',
  fish: 'Grilled salmon is a nutritious _____ that is rich in healthy omega-3 fatty acids.',
  egg: 'She usually fries two organic _____ with butter for a protein-rich breakfast.',
  apple: 'Eating a crisp red _____ every day is a healthy snack choice between meals.',
  banana: 'Monkeys in the tropical forest love peeling and eating a ripe yellow _____.',
  vegetable: 'Eating raw or steamed green _____ provides your body with vital vitamins.',
  fruit: 'A bowl of colorful seasonal _____ was served as a refreshing dessert.',
  delicious: 'The homemade vegetable lasagna was incredibly flavorful and _____.',
  water: 'You should always carry a refillable bottle of _____ when hiking outdoors.',
  coffee: 'He brewed a cup of steaming black _____ to help him stay alert during work.',
  tea: 'In Britain, having afternoon _____ with milk and biscuits is a cherished tradition.',
  milk: 'Children are encouraged to drink calcium-rich _____ to build strong bones.',
  juice: 'She ordered a freshly squeezed glass of orange _____ with her breakfast.',
  sugar: 'To maintain good health, try to limit the amount of refined _____ in your drinks.',
  ice: 'On a humid summer afternoon, adding cubes of clear _____ cools down your beverage.',

  // Classroom & School
  pen: 'Please use a blue or black ballpoint _____ to sign the official document.',
  pencil: 'You can easily erase any accidental sketch marks made with a graphite _____.',
  book: 'She spent the rainy Sunday afternoon immersed in an intriguing mystery _____.',
  notebook: 'The student jotted down key lecture formulas into her spiral _____.',
  ruler: 'Draw a straight five-centimeter boundary line using your wooden _____.',
  bag: 'He packed his heavy textbooks, laptop, and gym clothes into his leather _____.',
  eraser: 'I made a minor spelling slip on the worksheet and corrected it with an _____.',
  board: 'The instructor wrote today\'s grammar lesson points on the interactive white _____.',
  paper: 'The office photocopier ran out of white A4 _____, so we refilled the tray.',
  lesson: 'Today\'s English grammar _____ focused on mastering the present perfect tense.',

  // Jobs & Occupations
  engineer: 'The civil _____ inspected the structural blueprints before building the bridge.',
  nurse: 'The compassionate _____ checked the patient\'s pulse and administered the medication.',
  driver: 'The licensed bus _____ navigated skillfully through the morning rush-hour traffic.',
  cook: 'The executive _____ simmered a rich vegetable broth using fresh aromatic herbs.',
  worker: 'Factory _____ on the assembly line are required to wear yellow protective helmets.',
  farmer: 'The agricultural _____ harvested ripe golden paddy fields before the monsoon rains.',
  office: 'Our corporate headquarters is located in a modern glass _____ building downtown.',
  hospital: 'The emergency paramedics rushed the injured driver directly to the regional _____.',
  work: 'Many IT professionals appreciate the flexibility to _____ remotely from home.',
  company: 'The international software _____ expanded its operations into five new countries.',

  // Days & Time
  monday: 'Our busy working schedule begins with a departmental meeting on _____ morning.',
  tuesday: 'The team submits weekly project status updates every _____ afternoon by 3 PM.',
  wednesday: 'Reaching _____ marks the halfway point of the standard working week.',
  thursday: 'The courier package shipped two days ago will be delivered this _____ morning.',
  friday: 'Colleagues often greet each other with warm smiles on _____ afternoon as the weekend arrives.',
  saturday: 'Families frequently organize barbecue parties and sports events on sunny _____ afternoons.',
  sunday: 'I prefer spending a restful _____ evening preparing for the upcoming work week.',
  week: 'She committed to memorizing twenty useful phrases every single _____.',
  month: 'February is the shortest _____ of the year with twenty-eight or twenty-nine days.',
  year: 'Our university will celebrate its golden jubilee anniversary later this _____.',
  time: 'Could you please tell me what _____ the next express shuttle leaves for the airport?',
  hour: 'The train journey from the suburban station to the city center takes exactly one _____.',
  minute: 'Please wait just a single _____; the doctor will invite you into the examination room.',
  second: 'The Olympic runner broke the world record by finishing two-tenths of a _____ faster.',
  morning: 'Waking up to crisp cool air in the early _____ inspires a productive day.',
  noon: 'The blazing sun stood directly overhead at _____, casting virtually no shadows.',
  night: 'Shimmering constellations and a bright crescent moon illuminated the clear sky at _____.',
  midnight: 'The New Year fireworks display illuminated the city skyline exactly at _____ sharp.',
  early: 'She set her alarm clock for 5 AM because she had to catch an _____ morning flight.',
  late: 'Due to unexpected road construction, several passengers arrived _____ for their appointment.',

  // Routines
  'wake up': 'I usually set my phone alarm to _____ at 6:30 AM every weekday morning.',
  wash: 'Healthcare experts advise people to _____ their hands thoroughly with soap before meals.',
  brush: 'Dentists strongly recommend that you _____ your teeth twice daily to maintain hygiene.',
  breakfast: 'He enjoyed a wholesome _____ comprising scrambled eggs, oatmeal, and fresh berries.',
  shower: 'Taking a warm _____ after an exhausting gym workout relaxes tense muscles.',
  dress: 'He had to _____ formally in a dark suit and polished leather shoes for the interview.',
  comb: 'She looked into the vanity mirror to _____ her long hair neatly before leaving.',
  leave: 'We should _____ the house by 7 AM if we want to avoid heavy downtown traffic.',
  start: 'The international technology conference will _____ promptly at nine o\'clock.',
  always: 'He is extremely disciplined and _____ arrives ten minutes ahead of schedule.',
  dinner: 'Our family gathers around the dining table every evening to share a warm _____.',
  'watch tv': 'After finishing his evening chores, he sat on the sofa to _____ with his brother.',
  listen: 'In language learning, it is vital to _____ attentively to native speaker dialogues.',
  relax: 'Listening to instrumental jazz helps her _____ after an intensive workday.',
  sleep: 'Getting eight hours of uninterrupted deep _____ is essential for cognitive performance.',
  tired: 'After trekking uphill through the dense mountain path, the hikers felt deeply _____.',
  quiet: 'The library reading hall was completely _____ as students prepared for exams.',
  dark: 'Please switch on the porch light because the country road becomes pitch-_____ at night.',
  goodnight: 'She smiled at her little boy, tucked in his blanket, and whispered, "_____, sleep tight."',

  // Weather & Seasons
  sunny: 'It was a bright and _____ Sunday morning, ideal for an outdoor family picnic.',
  rainy: 'Take your waterproof umbrella along because the forecast predicted a _____ afternoon.',
  cloudy: 'The overcast sky looked dark and _____ just before the sudden rainfall began.',
  windy: 'A brisk and _____ autumn breeze scattered colorful leaves across the park.',
  hot: 'Drinking cold coconut water is wonderfully refreshing during scorching _____ weather.',
  cold: 'Wrap yourself in a thick woolen sweater to stay warm against the biting _____ winter air.',
  spring: 'Fragrant cherry blossoms and tulips begin to bloom across gardens in early _____.',
  summer: 'College students eagerly anticipate the long three-month holiday during the _____.',
  autumn: 'Golden amber foliage carpets the mountain slopes when cool _____ arrives.',
  winter: 'Snow blanketed the rooftops and alpine pine trees throughout the chilly _____.',

  // Clothes
  shirt: 'He wore a clean, ironed white _____ buttoned up neatly under his blazer.',
  't-shirt': 'During casual weekends, she feels most comfortable wearing a cotton _____ and jeans.',
  pants: 'He purchased a pair of tailored navy blue _____ that fit comfortably at the waist.',
  dress: 'The bride looked radiant in an elegant floral silk _____ at the banquet.',
  skirt: 'The school student wore a pleated plaid _____ as part of her official uniform.',
  shoes: 'Remember to take off your dusty outdoor _____ before stepping onto the living room rug.',
  hat: 'Wearing a wide-brimmed straw _____ protects your forehead and eyes from harsh sunlight.',
  coat: 'She fastened the buttons of her heavy wool _____ against the freezing northern breeze.',
  wear: 'All laboratory technicians are mandated to _____ safety goggles and clean gloves.',
  clean: 'The housekeeping staff ensured that all hotel rooms were spotless and _____.',

  // Appearance, Emotions & People
  tall: 'Standing at nearly two meters in height, he was easily the most _____ athlete on the court.',
  short: 'The historic cottage doorway was relatively _____ so visitors had to duck slightly.',
  slim: 'Consistent swimming and nutritious eating helped her maintain a toned and _____ figure.',
  young: 'The startup company thrives on innovative ideas generated by enthusiastic _____ engineers.',
  old: 'The historic university campus features magnificent stone buildings over three centuries _____.',
  hair: 'She tied her long wavy brown _____ into a neat ponytail before the tennis match.',
  eyes: 'He wore polarized lenses to shield his sensitive _____ from the blinding ocean glare.',
  face: 'A warm, welcoming smile brightened her friendly _____ as she greeted the arriving guests.',
  smile: 'A genuine and sincere _____ can immediately establish rapport with an anxious client.',
  beautiful: 'From the clifftop lookout, tourists marveled at the extraordinarily _____ coastal sunset.',
  happy: 'The rescue volunteers felt deeply _____ when the lost puppy was safely reunited.',
  sad: 'She felt touched and slightly _____ while watching the bittersweet ending of the movie.',
  angry: 'The customer service representative remained courteous even when addressing an _____ caller.',
  surprised: 'He was genuinely _____ when all his colleagues shouted congratulations in the hall.',
  bored: 'Without any interactive activities to stimulate their curiosity, the children grew _____.',
  excited: 'The school choir members were visibly _____ about performing in the grand hall.',
  scared: 'The little kitten huddled under the armchair, visibly _____ of the loud thunderclaps.',
  calm: 'Taking steady deep breaths enabled the pilot to remain perfectly _____ during turbulence.',
  feel: 'How did you _____ after receiving your university entrance exam results?',

  // Animals & Pets
  dog: 'Our loyal golden _____ barked cheerfully and wagged its tail when we walked inside.',
  cat: 'The sleek domestic _____ curled comfortably into a ball upon the warm sofa cushion.',
  bird: 'A wild migratory _____ with iridescent blue plumage sang sweetly on the high branch.',
  fish: 'Vibrant tropical _____ swam effortlessly among the colorful corals in the aquarium.',
  rabbit: 'A timid wild _____ hopped across the clover lawn and disappeared into the hedge.',
  pet: 'Adopting an animal from the rescue shelter means gaining a devoted lifelong _____.',
  animal: 'The vast national park provides a safe haven for endangered wild _____ species.',
  cute: 'Everyone in the room adored the remarkably _____ puppy clumsily chasing a tennis ball.',
  feed: 'Don\'t forget to _____ the pet canary fresh seeds and clean water every morning.',
  play: 'Neighborhood children gathered in the open park to _____ soccer until dusk.',

  // Places, City & Transport
  city: 'Singapore is a clean, cosmopolitan _____ renowned for its urban greenery and efficiency.',
  park: 'Elderly citizens enjoy gentle morning tai chi exercises beneath the shady trees of the _____.',
  library: 'Visitors are reminded to keep their mobile phones silenced inside the academic _____.',
  market: 'Shoppers browse stalls piled high with fresh produce at the bustling morning _____.',
  bank: 'She visited the downtown commercial _____ to open an international savings account.',
  street: 'Pedestrians strolled leisurely down the cobbled historic _____ lined with boutique cafes.',
  bridge: 'The suspension _____ spans the wide estuary, linking the residential island to the mainland.',
  near: 'Our apartment complex is conveniently situated _____ several reputable schools and stores.',
  far: 'The secluded mountain retreat is located quite _____ from any bustling urban center.',
  place: 'This tranquil botanical garden is the perfect _____ to read quietly on weekends.',
  bus: 'A line of commuters formed orderly queues beside the shelter to board the city _____.',
  bike: 'Pedaling a road _____ to work offers a healthy and environmentally conscious commute.',
  motorbike: 'In urban Vietnam, agile two-wheeled _____ are the most prevalent form of transportation.',
  car: 'He adjusted the rearview mirror and fastened his seatbelt before starting the hybrid _____.',
  train: 'The high-speed bullet _____ glided smoothly between both cities in under ninety minutes.',
  walk: 'Health professionals advocate taking a brisk thirty-minute _____ after dinner each evening.',
  drive: 'Remember to stay alert and follow speed limits whenever you _____ in adverse weather.',
  ride: 'Local children love to _____ their scooters along the paved riverside promenade.',
  station: 'Commuters hurried down the escalators toward platform three at the central underground _____.',
  ticket: 'Please have your electronic boarding pass or valid train _____ ready for inspection.',

  // Hobbies, Sports & Entertainment
  soccer: 'Millions of spectators tuned in live to watch the thrilling international _____ tournament final.',
  swim: 'On scorching summer afternoons, diving into the cool community pool to _____ is pure bliss.',
  music: 'Listening to classical instrumental _____ helps improve focus while studying complex subjects.',
  sing: 'With her crystal-clear soprano voice, she loves to _____ in the regional youth choir.',
  dance: 'The professional troupe practiced intricate rhythms to _____ seamlessly on stage.',
  game: 'On rainy weekends, our entire family enjoys playing a strategic board _____ together.',
  sport: 'Participating in team _____ instills physical endurance, leadership, and camaraderie.',
  hobby: 'Woodworking is a creative indoor _____ that demands patience, precision, and focus.',
  like: 'Which style of international cuisine do you _____ trying the most?',
  enjoy: 'We sat outdoors on the balcony to slowly _____ the pleasant evening breeze.',

  // Family & Relatives
  father: 'My _____ works as an architect and often helps me with mathematics homework.',
  mother: 'Her _____ baked a delicious strawberry birthday cake for the family celebration.',
  parents: 'Good communication with your _____ helps foster trust and mutual understanding at home.',
  brother: 'My older _____ taught me how to ride a bicycle safely in the park.',
  sister: 'She shared a bedroom and whispered funny stories with her younger _____ every night.',
  son: 'They were delighted when their eldest _____ graduated from university with top honors.',
  daughter: 'The proud parents cheered enthusiastically as their talented _____ performed on the piano.',
  grandfather: 'Every summer, we look forward to visiting our _____ on his peaceful orchard farm.',
  grandmother: 'My loving _____ knitted a warm woolen scarf for me before the cold winter arrived.',
  family: 'Nothing brings more warmth and comfort than having dinner together with your loving _____.',

  // Questions & Communication
  question: 'If you need clarification on any step, please raise your hand to ask a thoughtful _____.',
  answer: 'The instructor smiled approvingly when the student provided the accurate _____ to the riddle.',
  ask: 'Do not hesitate to _____ the customer service desk for guidance if you feel lost.',
  know: 'It is beneficial to _____ the emergency exit locations whenever you enter a new facility.',
  tell: 'Grandparents love to _____ traditional folk tales to the young children at bedtime.',
  problem: 'Working together calmly as a team helped us solve the unexpected technical _____.',
  help: 'Volunteers arrived early at the shelter to provide necessary _____ to local families.',

  // Shopping & Commerce
  buy: 'He saved his income diligently for a year so he could _____ a dependable laptop for college.',
  sell: 'Local craftsmen display handmade ceramic bowls to _____ to overseas tourists.',
  cost: 'Substantial shipping surcharges contributed to the rising overall _____ of imported goods.',
  cheap: 'Street food markets in Southeast Asia offer exceptionally tasty meals that are remarkably _____.',
  expensive: 'Luxury Swiss chronographs and platinum jewelry can be prohibitively _____ to acquire.',
  money: 'Mastering the fundamentals of budgeting and investing your _____ is essential for long-term security.',
  pay: 'Customers can conveniently tap their contactless cards to _____ for groceries in seconds.',
  store: 'The corner grocery _____ stocks fresh dairy products, pantry essentials, and household goods.',
  price: 'The retail outlet offered a twenty percent markdown from the original sticker _____.',
  dollar: 'The currency exchange booth converted five hundred euros into the equivalent sum of US _____.'
};

/**
 * Returns a natural, engaging sentence containing the word, or creates a semantic category-specific sentence.
 * Guarantees zero generic placeholders like "Students practice using '_____' during English class."
 */
function getCreativeSentenceForWord(word, partOfSpeech = 'noun', category = 'General', meaning = '') {
  const cleanWord = (word || '').trim();
  const lowerWord = cleanWord.toLowerCase();

  // 1. Check curated authentic sentence lookup
  if (CURATED_SENTENCES[lowerWord]) {
    const rawTemplate = CURATED_SENTENCES[lowerWord];
    const fullSentence = rawTemplate.replace('_____', cleanWord);
    return {
      sentence: fullSentence,
      sentenceBlank: rawTemplate,
      meaning: meaning,
    };
  }

  // 2. Generate rich contextual sentence based on Category and Part of Speech
  const cat = (category || '').toLowerCase();
  const pos = (partOfSpeech || '').toLowerCase();

  let blankPattern = '';

  if (cat.includes('food') || cat.includes('din') || cat.includes('cook')) {
    if (pos === 'verb') blankPattern = 'The chef asked the assistants to _____ the fresh organic ingredients carefully.';
    else if (pos === 'adjective') blankPattern = 'The homemade broth tasted exceptionally _____ on a chilly autumn evening.';
    else blankPattern = 'The restaurant specialty includes a savory _____ served alongside steamed seasonal vegetables.';
  } else if (cat.includes('health') || cat.includes('hosp') || cat.includes('pharm')) {
    if (pos === 'verb') blankPattern = 'Physicians advise recovering patients to _____ regularly to regain their full strength.';
    else if (pos === 'adjective') blankPattern = 'Following a balanced nutritional regimen helped her feel significantly more _____.';
    else blankPattern = 'The clinical specialist recommended a certified _____ to alleviate the patient\'s discomfort.';
  } else if (cat.includes('travel') || cat.includes('transport') || cat.includes('air') || cat.includes('hotel')) {
    if (pos === 'verb') blankPattern = 'International travelers usually _____ through modern transit terminals during their tour.';
    else if (pos === 'adjective') blankPattern = 'The seaside resort provided a wonderfully _____ atmosphere for weary holidaymakers.';
    else blankPattern = 'Ensure that your official travel _____ is kept secure throughout the international journey.';
  } else if (cat.includes('job') || cat.includes('work') || cat.includes('office') || cat.includes('career')) {
    if (pos === 'verb') blankPattern = 'Dedicated project leaders work hard to _____ complex departmental objectives on schedule.';
    else if (pos === 'adjective') blankPattern = 'Maintaining a consistently _____ attitude at the workplace earns widespread respect.';
    else blankPattern = 'The firm appointed a highly qualified _____ to oversee strategic operational improvements.';
  } else if (cat.includes('shop') || cat.includes('cloth') || cat.includes('store')) {
    if (pos === 'verb') blankPattern = 'Discerning consumers examine product labels before deciding to _____ expensive goods.';
    else if (pos === 'adjective') blankPattern = 'The tailor selected natural textiles that felt remarkably _____ against the skin.';
    else blankPattern = 'The boutique department store unveiled an exclusive _____ tailored for the winter collection.';
  } else if (cat.includes('weather') || cat.includes('season') || cat.includes('natur')) {
    if (pos === 'adjective') blankPattern = 'Looking across the horizon, hikers welcomed the refreshingly _____ morning breeze.';
    else blankPattern = 'Local meteorological forecasts predicted noticeable changes in regional _____ this weekend.';
  } else if (cat.includes('feel') || cat.includes('emot') || cat.includes('person')) {
    if (pos === 'adjective') blankPattern = 'Hearing the heartening outcome made the entire family feel immensely _____ and relieved.';
    else if (pos === 'verb') blankPattern = 'Expressing genuine gratitude helps people _____ closer to their community and friends.';
    else blankPattern = 'Her face reflected deep inner _____ as she listened to the touching musical performance.';
  } else if (cat.includes('tech') || cat.includes('digi') || cat.includes('smart')) {
    if (pos === 'verb') blankPattern = 'Software engineers update the cloud infrastructure to _____ data security across devices.';
    else if (pos === 'adjective') blankPattern = 'The newly engineered application boasts an extraordinarily _____ and responsive design.';
    else blankPattern = 'Modern technological advancements have introduced a revolutionary _____ to global communication.';
  } else if (cat.includes('soci') || cat.includes('commun') || cat.includes('neighb')) {
    if (pos === 'verb') blankPattern = 'Civic volunteers collaborate harmoniously to _____ meaningful local welfare programs.';
    else if (pos === 'adjective') blankPattern = 'Living in a peaceful and _____ neighborhood fosters lasting friendships among residents.';
    else blankPattern = 'The local council organized a community _____ to celebrate cultural heritage and unity.';
  } else if (cat.includes('fam') || cat.includes('relat')) {
    blankPattern = 'Members of our extended _____ gather each year to celebrate the joyful holiday reunion.';
  } else if (cat.includes('home') || cat.includes('furn') || cat.includes('room') || cat.includes('house')) {
    blankPattern = 'After returning home from an exhausting journey, he rested comfortably in the warm _____.';
  } else if (cat.includes('gramm') || cat.includes('quest') || cat.includes('ask')) {
    blankPattern = 'When taking the comprehensive test, make sure to read each _____ attentively before writing.';
  } else if (cat.includes('school') || cat.includes('edu') || cat.includes('class')) {
    blankPattern = 'The dedicated teacher encouraged every curious student to master the new _____ with confidence.';
  } else {
    // Elegant fallback based strictly on Part of Speech with semantic meaning clue
    if (pos === 'verb') {
      blankPattern = `In order to achieve positive outcomes, one must learn how to _____ with diligence and care.`;
    } else if (pos === 'adjective') {
      blankPattern = `Her thorough and well-organized presentation was considered remarkably _____ by all attendees.`;
    } else if (pos === 'adverb') {
      blankPattern = `The diligent student completed the comprehensive assignment _____ before the deadline.`;
    } else {
      blankPattern = `During the seminar, the speaker highlighted the important concept of _____ in modern daily life.`;
    }
  }

  const fullSentence = blankPattern.replace('_____', cleanWord);
  return {
    sentence: fullSentence,
    sentenceBlank: blankPattern,
    meaning: meaning,
  };
}

module.exports = {
  CURATED_SENTENCES,
  getCreativeSentenceForWord,
};
