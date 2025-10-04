'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { symptomMatcher } from '@/lib/symptom-matcher';
import type { Language, SelectedSymptom, VoiceSymptomInput as VoiceInput, ExtractedSymptom } from '@/types/symptom-checker';

interface VoiceSymptomInputProps {
  language: Language;
  onSymptomsExtracted: (symptoms: SelectedSymptom[], transcript: string) => void;
  isKioskMode?: boolean;
}

export default function VoiceSymptomInput({
  language,
  onSymptomsExtracted,
  isKioskMode = false
}: VoiceSymptomInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedSymptoms, setExtractedSymptoms] = useState<ExtractedSymptom[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);

  const translations = {
    en: {
      startRecording: 'Start Recording',
      stopRecording: 'Stop Recording',
      processing: 'Processing...',
      speak: 'Click and speak about your symptoms',
      transcript: 'What you said:',
      foundSymptoms: 'Symptoms detected:',
      noSymptoms: 'No symptoms detected. Try speaking more clearly about how you feel.',
      confirm: 'Confirm Symptoms',
      microphonePermission: 'Please allow microphone access to use voice input.',
      browserNotSupported: 'Voice recording is not supported in your browser.',
      severityEstimate: 'Estimated severity:'
    },
    hi: {
      startRecording: 'रिकॉर्डिंग शुरू करें',
      stopRecording: 'रिकॉर्डिंग रोकें',
      processing: 'प्रसंस्करण...',
      speak: 'क्लिक करें और अपने लक्षणों के बारे में बोलें',
      transcript: 'आपने जो कहा:',
      foundSymptoms: 'लक्षण मिले:',
      noSymptoms: 'कोई लक्षण नहीं मिला। अपने महसूस करने के बारे में स्पष्ट रूप से बोलने की कोशिश करें।',
      confirm: 'लक्षण पुष्टि करें',
      microphonePermission: 'वॉयस इनपुट का उपयोग करने के लिए माइक्रोफ़ोन एक्सेस की अनुमति दें।',
      browserNotSupported: 'आपके ब्राउज़र में वॉयस रिकॉर्डिंग समर्थित नहीं है।',
      severityEstimate: 'अनुमानित गंभीरता:'
    },
    ml: {
      startRecording: 'റെക്കോർഡിംഗ് ആരംഭിക്കുക',
      stopRecording: 'റെക്കോർഡിംഗ് നിർത്തുക',
      processing: 'പ്രോസസ്സിംഗ്...',
      speak: 'ക്ലിക്ക് ചെയ്ത് നിങ്ങളുടെ ലക്ഷണങ്ങളെ കുറിച്ച് പറയുക',
      transcript: 'നിങ്ങൾ പറഞ്ഞത്:',
      foundSymptoms: 'കണ്ടെത്തിയ ലക്ഷണങ്ങൾ:',
      noSymptoms: 'ലക്ഷണങ്ങൾ കണ്ടെത്തിയില്ല. നിങ്ങൾക്ക് എങ്ങനെ തോന്നുന്നു എന്നതിനെ കുറിച്ച് കൂടുതൽ വ്യക്തമായി സംസാരിക്കാൻ ശ്രമിക്കുക.',
      confirm: 'ലക്ഷണങ്ങൾ സ്ഥിരീകരിക്കുക',
      microphonePermission: 'വോയ്സ് ഇൻപുട്ട് ഉപയോഗിക്കാൻ മൈക്രോഫോൺ ആക്സസ് അനുവദിക്കുക.',
      browserNotSupported: 'നിങ്ങളുടെ ബ്രൗസറിൽ വോയ്സ് റെക്കോർഡിംഗ് പിന്തുണയ്ക്കുന്നില്ല.',
      severityEstimate: 'കണക്കാക്കിയ തീവ്രത:'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const startRecording = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up Web Speech API if available
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = getLanguageCode(language);
        
        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setTranscript(transcript);
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
        };
        
        recognition.onend = () => {
          setIsRecording(false);
          if (transcript.trim()) {
            processTranscript(transcript);
          }
        };
        
        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
      } else {
        // Fallback to basic recording without speech-to-text
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.start();
        setIsRecording(true);
        
        // For demo purposes, simulate transcript after 3 seconds
        setTimeout(() => {
          stopRecording();
          // Simulate some transcript based on language
          const demoTranscript = getDemoTranscript(language);
          setTranscript(demoTranscript);
          processTranscript(demoTranscript);
        }, 3000);
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      alert(t.microphonePermission);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const processTranscript = async (transcriptText: string) => {
    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const voiceInput: VoiceInput = {
      transcript: transcriptText,
      confidence: 0.85,
      language,
      extractedSymptoms: [],
      timestamp: new Date()
    };
    
    // Extract symptoms using our symptom matcher
    const extracted = symptomMatcher.extractSymptomsFromVoice(voiceInput);
    setExtractedSymptoms(extracted);
    setIsProcessing(false);
  };

  const confirmSymptoms = () => {
    const selectedSymptoms: SelectedSymptom[] = extractedSymptoms.map(symptom => ({
      symptomId: symptom.symptom,
      severity: symptom.severity || 'mild',
      duration: 'days', // Default duration
      onset: 'gradual', // Default onset
      notes: symptom.context
    }));
    
    onSymptomsExtracted(selectedSymptoms, transcript);
  };

  const getLanguageCode = (lang: Language): string => {
    const codes = {
      en: 'en-US',
      hi: 'hi-IN',
      bn: 'bn-BD',
      or: 'or-IN',
      ta: 'ta-IN',
      ne: 'ne-NP',
      ml: 'ml-IN'
    };
    return codes[lang] || 'en-US';
  };

  const getDemoTranscript = (lang: Language): string => {
    const demos = {
      en: "I have a headache and feel very tired. My head is pounding and I feel weak.",
      hi: "मेरे सिर में दर्द है और मैं बहुत थका हुआ महसूस कर रहा हूं।",
      bn: "আমার মাথাব্যথা এবং খুব ক্লান্ত লাগছে।",
      or: "ମୋର ମୁଣ୍ଡ ବ୍ୟଥା ଏବଂ ବହୁତ କ୍ଲାନ୍ତ ଲାଗୁଛି।",
      ta: "எனக்கு தலைவலி மற்றும் மிகவும் சோர்வாக உணர்கிறேன்।",
      ne: "मेरो टाउको दुख्छ र धेरै थकान लाग्छ।",
      ml: "എനിക്ക് തലവേദനയും വളരെ ക്ഷീണവും അനുഭവപ്പെടുന്നു।"
    };
    return demos[lang] || demos.en;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'severe': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border">
      {/* Voice Recording Button */}
      <div className="text-center mb-6">
        <motion.button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`
            ${isKioskMode ? 'w-32 h-32' : 'w-24 h-24'} 
            rounded-full shadow-lg transition-all duration-300 text-white font-semibold
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-kerala-teal hover:bg-kerala-teal/90'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          `}
          whileHover={{ scale: isProcessing ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isProcessing ? (
            <div className="animate-spin">⚙️</div>
          ) : (
            <div className={`${isKioskMode ? 'text-4xl' : 'text-3xl'}`}>
              {isRecording ? '🛑' : '🎤'}
            </div>
          )}
        </motion.button>
        
        <p className={`mt-4 text-gray-600 ${isKioskMode ? 'text-lg' : 'text-base'}`}>
          {isProcessing ? t.processing : isRecording ? t.stopRecording : t.speak}
        </p>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-blue-50 rounded-lg"
        >
          <h4 className={`font-medium text-blue-900 mb-2 ${isKioskMode ? 'text-lg' : 'text-base'}`}>
            {t.transcript}
          </h4>
          <p className={`text-blue-800 ${isKioskMode ? 'text-base' : 'text-sm'}`}>
            "{transcript}"
          </p>
        </motion.div>
      )}

      {/* Extracted Symptoms */}
      {extractedSymptoms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h4 className={`font-medium text-gray-900 mb-3 ${isKioskMode ? 'text-lg' : 'text-base'}`}>
            {t.foundSymptoms}
          </h4>
          <div className="space-y-2">
            {extractedSymptoms.map((symptom, index) => {
              const symptomData = symptomMatcher.getSymptomById(symptom.symptom);
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <span className={`font-medium ${isKioskMode ? 'text-base' : 'text-sm'}`}>
                      {symptomData?.icon} {symptomData?.name[language] || symptomData?.name.en}
                    </span>
                    {symptom.severity && (
                      <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getSeverityColor(symptom.severity)} bg-white`}>
                        {t.severityEstimate} {symptom.severity}
                      </span>
                    )}
                  </div>
                  <div className={`text-xs text-gray-500 ${isKioskMode ? 'text-sm' : ''}`}>
                    {Math.round(symptom.confidence * 100)}% confident
                  </div>
                </div>
              );
            })}
          </div>
          
          <motion.button
            onClick={confirmSymptoms}
            className={`
              mt-4 w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 
              transition-colors font-semibold
              ${isKioskMode ? 'text-lg' : 'text-base'}
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {t.confirm} ({extractedSymptoms.length})
          </motion.button>
        </motion.div>
      )}

      {/* No Symptoms Message */}
      {transcript && !isProcessing && extractedSymptoms.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-yellow-50 rounded-lg text-center"
        >
          <p className={`text-yellow-800 ${isKioskMode ? 'text-base' : 'text-sm'}`}>
            {t.noSymptoms}
          </p>
        </motion.div>
      )}

      {/* Browser Support Check */}
      {!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
        <div className="mt-4 p-3 bg-orange-50 rounded-lg text-center">
          <p className={`text-orange-800 ${isKioskMode ? 'text-base' : 'text-sm'}`}>
            {t.browserNotSupported}
          </p>
        </div>
      )}
    </div>
  );
}