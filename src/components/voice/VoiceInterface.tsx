'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dbHelpers, generateMHI } from '@/lib/supabase';
import type { Language, HealthRecord, MigrantWorker } from '@/types';

interface VoiceInterfaceProps {
  language: Language;
  onHealthRecordCreated: (record: HealthRecord) => void;
  isKioskMode?: boolean;
}

interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  currentStep: number;
  extractedData: {
    name?: string;
    age?: number;
    gender?: string;
    location?: string;
    occupation?: string;
    symptoms?: string[];
    urgency?: string;
    phone?: string;
  };
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  language,
  onHealthRecordCreated,
  isKioskMode = false
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    transcript: '',
    currentStep: 0,
    extractedData: {}
  });

  const [mhiGenerated, setMhiGenerated] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Multilingual prompts for voice guidance
  const prompts = {
    en: {
      start: "Click the microphone to start voice registration",
      listening: "Listening... Please speak clearly",
      processing: "Processing your information...",
      steps: [
        "What is your name?",
        "How old are you?", 
        "What is your gender?",
        "Which district in Kerala are you in?",
        "What type of work do you do?",
        "Are you experiencing any health symptoms?",
        "How urgent is your health concern? Scale 1-10",
        "What is your phone number for updates?"
      ],
      success: "Health record created successfully!",
      error: "Sorry, there was an error. Please try again.",
      permission: "Please allow microphone access for voice registration"
    },
    hi: {
      start: "वॉयस रजिस्ट्रेशन शुरू करने के लिए माइक्रोफोन पर क्लिक करें",
      listening: "सुन रहा हूं... कृपया स्पष्ट रूप से बोलें",
      processing: "आपकी जानकारी को प्रोसेस कर रहा हूं...",
      steps: [
        "आपका नाम क्या है?",
        "आपकी उम्र क्या है?",
        "आपका लिंग क्या है?",
        "आप केरल के किस जिले में हैं?",
        "आप किस प्रकार का काम करते हैं?",
        "क्या आप किसी स्वास्थ्य समस्या का अनुभव कर रहे हैं?",
        "आपकी स्वास्थ्य चिंता कितनी गंभीर है? 1-10 के स्केल पर",
        "अपडेट के लिए आपका फोन नंबर क्या है?"
      ],
      success: "स्वास्थ्य रिकॉर्ड सफलतापूर्वक बनाया गया!",
      error: "क्षमा करें, एक त्रुटि हुई। कृपया फिर से कोशिश करें।",
      permission: "कृपया वॉयस रजिस्ट्रेशन के लिए माइक्रोफोन एक्सेस की अनुमति दें"
    },
    ml: {
      start: "വോയ്സ് രജിസ്ട്രേഷൻ ആരംഭിക്കാൻ മൈക്രോഫോണിൽ ക്ലിക്ക് ചെയ്യുക",
      listening: "കേൾക്കുന്നു... ദയവായി വ്യക്തമായി സംസാരിക്കുക",
      processing: "നിങ്ങളുടെ വിവരങ്ങൾ പ്രോസസ്സ് ചെയ്യുന്നു...",
      steps: [
        "നിങ്ങളുടെ പേര് എന്താണ്?",
        "നിങ്ങളുടെ പ്രായം എത്രയാണ്?",
        "നിങ്ങളുടെ ലിംഗം എന്താണ്?",
        "നിങ്ങൾ കേരളത്തിലെ ഏത് ജില്ലയിലാണ്?",
        "നിങ്ങൾ എന്ത് തരത്തിലുള്ള ജോലിയാണ് ചെയ്യുന്നത്?",
        "നിങ്ങൾ എന്തെങ്കിലും ആരോഗ്യ പ്രശ്നങ്ങൾ അനുഭവിക്കുന്നുണ്ടോ?",
        "നിങ്ങളുടെ ആരോഗ്യ ആശങ്ക എത്ര അടിയന്തിരമാണ്? 1-10 സ്കെയിലിൽ",
        "അപ്ഡേറ്റുകൾക്കുള്ള നിങ്ങളുടെ ഫോൺ നമ്പർ എന്താണ്?"
      ],
      success: "ആരോഗ്യ രേഖ വിജയകരമായി സൃഷ്ടിച്ചു!",
      error: "ക്ഷമിക്കണം, ഒരു പിശക് ഉണ്ടായി. ദയവായി വീണ്ടും ശ്രമിക്കുക.",
      permission: "വോയ്സ് രജിസ്ട്രേഷനുവേണ്ടി മൈക്രോഫോൺ ആക്സസ് അനുവദിക്കുക"
    }
  };

  const currentPrompts = prompts[language] || prompts.en;

  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getLanguageCode(language);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setVoiceState(prev => ({
          ...prev,
          isListening: false,
          isProcessing: false
        }));
      };

      recognition.onend = () => {
        setVoiceState(prev => ({
          ...prev,
          isListening: false
        }));
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const getLanguageCode = (lang: Language): string => {
    const langCodes: Record<Language, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      bn: 'bn-BD',
      or: 'hi-IN', // Fallback to Hindi for Odia
      ta: 'ta-IN',
      ne: 'ne-NP',
      ml: 'ml-IN'
    };
    return langCodes[lang] || 'en-US';
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      alert(currentPrompts.permission);
      return;
    }

    setVoiceState(prev => ({
      ...prev,
      isListening: true,
      transcript: ''
    }));

    // Speak the current prompt
    speakPrompt(currentPrompts.steps[voiceState.currentStep]);

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Speech recognition start error:', error);
      setVoiceState(prev => ({
        ...prev,
        isListening: false
      }));
    }
  };

  const speakPrompt = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLanguageCode(language);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceInput = async (transcript: string) => {
    setVoiceState(prev => ({
      ...prev,
      transcript,
      isProcessing: true
    }));

    // Process the voice input based on current step
    const newExtractedData = { ...voiceState.extractedData };
    
    switch (voiceState.currentStep) {
      case 0: // Name
        newExtractedData.name = transcript.trim();
        break;
      case 1: // Age
        const age = extractNumber(transcript);
        if (age) newExtractedData.age = age;
        break;
      case 2: // Gender
        newExtractedData.gender = extractGender(transcript, language);
        break;
      case 3: // Location
        newExtractedData.location = extractLocation(transcript);
        break;
      case 4: // Occupation
        newExtractedData.occupation = extractOccupation(transcript, language);
        break;
      case 5: // Symptoms
        newExtractedData.symptoms = extractSymptoms(transcript, language);
        break;
      case 6: // Urgency
        newExtractedData.urgency = extractUrgency(transcript);
        break;
      case 7: // Phone
        newExtractedData.phone = extractPhone(transcript);
        break;
    }

    setVoiceState(prev => ({
      ...prev,
      extractedData: newExtractedData,
      currentStep: prev.currentStep + 1,
      isProcessing: false
    }));

    // If we've completed all steps, create the health record
    if (voiceState.currentStep >= 7) {
      await createHealthRecord(newExtractedData);
    }
  };

  const extractNumber = (text: string): number | null => {
    const match = text.match(/\d+/);
    return match ? parseInt(match[0]) : null;
  };

  const extractGender = (text: string, lang: Language): string => {
    const lowerText = text.toLowerCase();
    
    if (lang === 'hi') {
      if (lowerText.includes('पुरुष') || lowerText.includes('मर्द')) return 'male';
      if (lowerText.includes('महिला') || lowerText.includes('औरत')) return 'female';
    } else if (lang === 'ml') {
      if (lowerText.includes('പുരുഷൻ') || lowerText.includes('ആൺ')) return 'male';
      if (lowerText.includes('സ്ത്രീ') || lowerText.includes('പെൺ')) return 'female';
    } else {
      if (lowerText.includes('male') || lowerText.includes('man')) return 'male';
      if (lowerText.includes('female') || lowerText.includes('woman')) return 'female';
    }
    
    return 'other';
  };

  const extractLocation = (text: string): string => {
    // Kerala districts - could be enhanced with NLP
    const districts = [
      'thiruvananthapuram', 'kollam', 'pathanamthitta', 'alappuzha', 'kottayam',
      'idukki', 'ernakulam', 'thrissur', 'palakkad', 'malappuram', 'kozhikode',
      'wayanad', 'kannur', 'kasaragod'
    ];
    
    const lowerText = text.toLowerCase();
    for (const district of districts) {
      if (lowerText.includes(district)) {
        return district;
      }
    }
    
    return text.trim();
  };

  const extractOccupation = (text: string, lang: Language): string => {
    const lowerText = text.toLowerCase();
    
    const occupationKeywords = {
      en: {
        construction: ['construction', 'builder', 'mason', 'carpenter'],
        fishing: ['fishing', 'fisherman', 'fish'],
        factory: ['factory', 'industry', 'manufacturing'],
        agriculture: ['farming', 'agriculture', 'farmer'],
        domestic: ['domestic', 'house', 'cleaning', 'maid'],
        transport: ['driver', 'transport', 'taxi', 'auto']
      }
    };
    
    const keywords = occupationKeywords.en;
    
    for (const [occupation, terms] of Object.entries(keywords)) {
      if (terms.some(term => lowerText.includes(term))) {
        return occupation;
      }
    }
    
    return 'other';
  };

  const extractSymptoms = (text: string, lang: Language): string[] => {
    // Simple symptom extraction - could be enhanced with medical NLP
    const symptomKeywords = {
      en: ['fever', 'cough', 'headache', 'pain', 'nausea', 'dizzy', 'tired'],
      hi: ['बुखार', 'खांसी', 'सिरदर्द', 'दर्द', 'जी मिचलाना'],
      ml: ['പനി', 'ചുമ', 'തലവേദന', 'വേदന', 'ഓക്കാനം']
    };
    
    const keywords = symptomKeywords[lang] || symptomKeywords.en;
    const foundSymptoms: string[] = [];
    
    keywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        foundSymptoms.push(keyword);
      }
    });
    
    return foundSymptoms.length > 0 ? foundSymptoms : [text.trim()];
  };

  const extractUrgency = (text: string): string => {
    const number = extractNumber(text);
    if (number) {
      if (number <= 3) return 'low';
      if (number <= 6) return 'medium';
      if (number <= 8) return 'high';
      return 'critical';
    }
    
    const lowerText = text.toLowerCase();
    if (lowerText.includes('urgent') || lowerText.includes('serious')) return 'high';
    if (lowerText.includes('moderate')) return 'medium';
    return 'low';
  };

  const extractPhone = (text: string): string => {
    const phoneMatch = text.match(/[\d\s\-\+]+/);
    return phoneMatch ? phoneMatch[0].replace(/\s|-/g, '') : text.trim();
  };

  const createHealthRecord = async (data: any) => {
    try {
      setVoiceState(prev => ({ ...prev, isProcessing: true }));

      // Generate MHI
      const mhiId = generateMHI();
      setMhiGenerated(mhiId);

      // Create migrant worker record
      const worker: any = {
        mhi_id: mhiId,
        name: data.name || 'Anonymous',
        age: data.age || 0,
        gender: data.gender || 'other',
        phone: data.phone,
        languages: [language],
        occupation: data.occupation || 'other',
        current_location: {
          district: data.location || 'unknown',
          panchayat: 'unknown',
          coordinates: { lat: 0, lng: 0 }
        },
        is_active: true
      };

      const createdWorker = await dbHelpers.createWorker(worker);

      // Create health record if symptoms were reported
      if (data.symptoms && data.symptoms.length > 0) {
        const healthRecord: any = {
          worker_id: createdWorker.id,
          symptoms: data.symptoms,
          severity: data.urgency || 'low',
          reported_at: new Date().toISOString(),
          reported_via: 'voice',
          is_anonymous: false,
          location: worker.current_location,
          follow_up_required: data.urgency === 'high' || data.urgency === 'critical'
        };

        const record = await dbHelpers.createHealthRecord(healthRecord);
        onHealthRecordCreated(record);
      }

      // Success feedback
      speakPrompt(`${currentPrompts.success} Your Migrant Health ID is ${mhiId}`);
      setIsComplete(true);

    } catch (error) {
      console.error('Error creating health record:', error);
      speakPrompt(currentPrompts.error);
    } finally {
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="text-6xl">✅</div>
        <h3 className="text-2xl font-bold text-health-green">
          {currentPrompts.success}
        </h3>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h4 className="font-semibold mb-4">Your Migrant Health ID (MHI)</h4>
          <div className="text-3xl font-mono text-kerala-teal font-bold bg-gray-100 p-4 rounded-lg">
            {mhiGenerated}
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Save this ID for future healthcare access
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`space-y-6 ${isKioskMode ? 'text-center' : ''}`}>
      {/* Progress Indicator */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                index < voiceState.currentStep
                  ? 'bg-health-green'
                  : index === voiceState.currentStep
                  ? 'bg-neon-blue animate-pulse'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Current Step Display */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">
          Step {voiceState.currentStep + 1} of 8
        </h3>
        <p className="text-gray-600">
          {currentPrompts.steps[voiceState.currentStep] || currentPrompts.start}
        </p>
      </div>

      {/* Voice Button */}
      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startListening}
          disabled={voiceState.isListening || voiceState.isProcessing}
          className={`relative w-32 h-32 rounded-full font-semibold text-white shadow-lg focus:outline-none focus:ring-4 focus:ring-neon-blue transition-all duration-300 ${
            voiceState.isListening
              ? 'bg-red-500 voice-listening animate-pulse'
              : voiceState.isProcessing
              ? 'bg-warning-orange'
              : 'bg-gradient-to-r from-kerala-teal to-neon-blue hover:shadow-xl'
          }`}
        >
          {voiceState.isProcessing ? (
            <div className="voice-waveform">
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
          ) : voiceState.isListening ? (
            <>
              <svg className="w-12 h-12 mx-auto animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              <div className="text-sm mt-2">{currentPrompts.listening}</div>
            </>
          ) : (
            <>
              <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              <div className="text-sm mt-2">🎤 Tap to Speak</div>
            </>
          )}
        </motion.button>
      </div>

      {/* Transcript Display */}
      <AnimatePresence>
        {voiceState.transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200"
          >
            <h4 className="font-semibold mb-2">You said:</h4>
            <p className="text-gray-700 italic">"{voiceState.transcript}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extracted Data Preview */}
      {Object.keys(voiceState.extractedData).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200"
        >
          <h4 className="font-semibold mb-3">Information Collected:</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {voiceState.extractedData.name && (
              <div><strong>Name:</strong> {voiceState.extractedData.name}</div>
            )}
            {voiceState.extractedData.age && (
              <div><strong>Age:</strong> {voiceState.extractedData.age}</div>
            )}
            {voiceState.extractedData.gender && (
              <div><strong>Gender:</strong> {voiceState.extractedData.gender}</div>
            )}
            {voiceState.extractedData.location && (
              <div><strong>Location:</strong> {voiceState.extractedData.location}</div>
            )}
            {voiceState.extractedData.occupation && (
              <div><strong>Work:</strong> {voiceState.extractedData.occupation}</div>
            )}
            {voiceState.extractedData.symptoms && (
              <div><strong>Symptoms:</strong> {voiceState.extractedData.symptoms.join(', ')}</div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VoiceInterface;