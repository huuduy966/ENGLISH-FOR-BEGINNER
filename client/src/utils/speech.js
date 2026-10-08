// Web Speech API wrapper for Text-To-Speech and Speech-To-Text

export function speakText(text, lang = 'en-US') {
  if (!('speechSynthesis' in window)) {
    console.warn('Trình duyệt không hỗ trợ Web Speech Synthesis.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // Slightly slower for language learners

  // Try to find native English voice
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(
    (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.default)
  );

  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function createSpeechRecognizer({ onResult, onError, onEnd }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return {
      isSupported: false,
      start: () => {
        if (onError) onError('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói (Microphone). Hãy thử trên Google Chrome hoặc Edge.');
      },
      stop: () => {},
    };
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return {
    isSupported: true,
    start: () => {
      try {
        recognition.start();
      } catch (err) {
        console.error('Recognition start error:', err);
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch (err) {
        console.error('Recognition stop error:', err);
      }
    },
  };
}
