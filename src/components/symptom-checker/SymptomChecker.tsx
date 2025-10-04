'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { symptomMatcher } from '@/lib/symptom-matcher';
import VoiceSymptomInput from './VoiceSymptomInput';
import SymptomSelector from './SymptomSelector';
import SymptomSeverityRating from './SymptomSeverityRating';
import ConditionResults from './ConditionResults';
import type { 
  Language,
  SelectedSymptom, 
  SymptomCheckSession, 
  ConditionMatch,
  UrgencyLevel
} from '@/types/symptom-checker';

interface SymptomCheckerProps {
  language: Language;
  onSessionComplete?: (session: SymptomCheckSession) => void;
  isKioskMode?: boolean;
  userId?: string;
}

export default function SymptomChecker({ 
  language, 
  onSessionComplete, 
  isKioskMode = false,
  userId 
}: SymptomCheckerProps) {
  const [currentStep, setCurrentStep] = useState<'voice' | 'symptoms' | 'severity' | 'results'>('voice');
  const [selectedSymptoms, setSelectedSymptoms] = useState<SelectedSymptom[]>([]);
  const [matchingConditions, setMatchingConditions] = useState<ConditionMatch[]>([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('low');
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');

  const translations = {
    en: {
      title: 'Symptom Checker',
      subtitle: 'Tell us about your symptoms to get health insights',
      voiceStep: 'Describe Your Symptoms',
      symptomsStep: 'Select Symptoms',
      severityStep: 'Rate Severity',
      resultsStep: 'Your Results',
      voicePrompt: 'Click the microphone and describe how you feel in your language',
      skipVoice: 'Skip Voice Input',
      nextStep: 'Next Step',
      prevStep: 'Previous',
      startOver: 'Start Over',
      emergency: '🚨 If this is an emergency, call 108 immediately',
      disclaimer: 'This tool provides general health information only. Always consult a healthcare provider for proper diagnosis.',
      noSymptoms: 'No symptoms selected. Please add symptoms to continue.',
      analyzing: 'Analyzing your symptoms...'
    },
    hi: {
      title: 'लक्षण जांचकर्ता',
      subtitle: 'स्वास्थ्य संबंधी जानकारी पाने के लिए अपने लक्षणों के बारे में बताएं',
      voiceStep: 'अपने लक्षण बताएं',
      symptomsStep: 'लक्षण चुनें',
      severityStep: 'गंभीरता का मूल्यांकन',
      resultsStep: 'आपके परिणाम',
      voicePrompt: 'माइक्रोफोन पर क्लिक करें और अपनी भाषा में बताएं कि आप कैसा महसूस कर रहे हैं',
      skipVoice: 'आवाज़ इनपुट छोड़ें',
      nextStep: 'अगला कदम',
      prevStep: 'पिछला',
      startOver: 'फिर से शुरू करें',
      emergency: '🚨 यदि यह आपातकाल है, तो तुरंत 108 पर कॉल करें',
      disclaimer: 'यह उपकरण केवल सामान्य स्वास्थ्य जानकारी प्रदान करता है। उचित निदान के लिए हमेशा स्वास्थ्य प्रदाता से सलाह लें।',
      noSymptoms: 'कोई लक्षण चुना नहीं गया। कृपया जारी रखने के लिए लक्षण जोड़ें।',
      analyzing: 'आपके लक्षणों का विश्लेषण हो रहा है...'
    },
    ml: {
      title: 'രോഗലക്ഷണ പരിശോധന',
      subtitle: 'ആരോഗ്യ വിവരങ്ങൾ ലഭിക്കാൻ നിങ്ങളുടെ ലക്ഷണങ്ങളെ കുറിച്ച് പറയൂ',
      voiceStep: 'നിങ്ങളുടെ ലക്ഷണങ്ങൾ വിവരിക്കുക',
      symptomsStep: 'ലക്ഷണങ്ങൾ തിരഞ്ഞെടുക്കുക',
      severityStep: 'തീവ്രത വിലയിരുത്തുക',
      resultsStep: 'നിങ്ങളുടെ ഫലങ്ങൾ',
      voicePrompt: 'മൈക്രോഫോണിൽ ക്ലിക്ക് ചെയ്യുകയും നിങ്ങളുടെ ഭാഷയിൽ എങ്ങനെ തോന്നുന്നുവെന്ന് വിവരിക്കുകയും ചെയ്യുക',
      skipVoice: 'വോയ്സ് ഇൻപുട്ട് ഒഴിവാക്കുക',
      nextStep: 'അടുത്ത ഘട്ടം',
      prevStep: 'മുമ്പത്തെ',
      startOver: 'വീണ്ടും ആരംഭിക്കുക',
      emergency: '🚨 ഇത് അടിയന്തിരാവസ്ഥയാണെങ്കിൽ, ഉടനടി 108 ൽ വിളിക്കുക',
      disclaimer: 'ഈ ഉപകരണം പൊതുവായ ആരോഗ്യ വിവരങ്ങൾ മാത്രം നൽകുന്നു. ശരിയായ രോഗനിർണയത്തിനായി എല്ലായ്പ്പോഴും ആരോഗ്യ പരിരക്ഷാ ദാതാവിനെ സമീപിക്കുക.',
      noSymptoms: 'ലക്ഷണങ്ങളൊന്നും തിരഞ്ഞെടുത്തിട്ടില്ല. തുടരാൻ ലക്ഷണങ്ങൾ ചേർക്കുക.',
      analyzing: 'നിങ്ങളുടെ ലക്ഷണങ്ങൾ വിശകലനം ചെയ്യുന്നു...'
    }
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    // Analyze symptoms when they change
    if (selectedSymptoms.length > 0) {
      const conditions = symptomMatcher.findMatchingConditions(selectedSymptoms);
      setMatchingConditions(conditions);
      
      // Determine urgency level
      const highestUrgency = conditions.reduce((max, condition) => {
        const conditionData = symptomMatcher.getConditionById(condition.conditionId);
        if (conditionData) {
          const urgencyLevels: UrgencyLevel[] = ['low', 'medium', 'high', 'emergency'];
          const currentIndex = urgencyLevels.indexOf(conditionData.urgency);
          const maxIndex = urgencyLevels.indexOf(max);
          return currentIndex > maxIndex ? conditionData.urgency : max;
        }
        return max;
      }, 'low' as UrgencyLevel);
      
      setUrgencyLevel(highestUrgency);
    }
  }, [selectedSymptoms]);

  const handleVoiceInput = (symptoms: SelectedSymptom[], transcript: string) => {
    setSelectedSymptoms(prev => {
      // Merge with existing symptoms, avoiding duplicates
      const merged = [...prev];
      symptoms.forEach(newSymptom => {
        const existingIndex = merged.findIndex(s => s.symptomId === newSymptom.symptomId);
        if (existingIndex >= 0) {
          merged[existingIndex] = newSymptom; // Update existing
        } else {
          merged.push(newSymptom); // Add new
        }
      });
      return merged;
    });
    setVoiceTranscript(transcript);
    if (symptoms.length > 0) {
      setCurrentStep('symptoms');
    }
  };

  const handleSymptomAdd = (symptom: SelectedSymptom) => {
    setSelectedSymptoms(prev => {
      const existingIndex = prev.findIndex(s => s.symptomId === symptom.symptomId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = symptom;
        return updated;
      }
      return [...prev, symptom];
    });
  };

  const handleSymptomRemove = (symptomId: string) => {
    setSelectedSymptoms(prev => prev.filter(s => s.symptomId !== symptomId));
  };

  const handleSeverityUpdate = (symptoms: SelectedSymptom[]) => {
    setSelectedSymptoms(symptoms);
  };

  const handleSessionComplete = () => {
    const session: SymptomCheckSession = {
      id: sessionId,
      userId,
      language,
      isAnonymous: !userId,
      symptoms: selectedSymptoms,
      suggestedConditions: matchingConditions,
      recommendations: [], // Will be filled by results component
      urgencyLevel,
      createdAt: new Date(),
      completedAt: new Date(),
      voiceTranscript
    };

    onSessionComplete?.(session);
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'voice':
        return true; // Can always skip voice
      case 'symptoms':
        return selectedSymptoms.length > 0;
      case 'severity':
        return selectedSymptoms.every(s => s.severity);
      default:
        return true;
    }
  };

  const getStepProgress = () => {
    const steps = ['voice', 'symptoms', 'severity', 'results'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <div className={`max-w-4xl mx-auto ${isKioskMode ? 'kiosk-mode' : ''}`}>
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`font-bold text-kerala-teal mb-4 ${isKioskMode ? 'text-4xl' : 'text-3xl'}`}>
          {t.title}
        </h1>
        <p className={`text-gray-600 ${isKioskMode ? 'text-xl' : 'text-lg'}`}>
          {t.subtitle}
        </p>
        
        {/* Progress Bar */}
        <div className="mt-6 bg-gray-200 rounded-full h-2">
          <motion.div 
            className="bg-kerala-teal rounded-full h-2"
            style={{ width: `${getStepProgress()}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Emergency Warning */}
      {urgencyLevel === 'emergency' && (
        <motion.div 
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="font-bold">{t.emergency}</p>
        </motion.div>
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {currentStep === 'voice' && (
          <motion.div
            key="voice"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className={`font-semibold text-gray-800 mb-4 ${isKioskMode ? 'text-2xl' : 'text-xl'}`}>
              {t.voiceStep}
            </h2>
            <VoiceSymptomInput
              language={language}
              onSymptomsExtracted={handleVoiceInput}
              isKioskMode={isKioskMode}
            />
            <div className="text-center">
              <button
                onClick={() => setCurrentStep('symptoms')}
                className="text-kerala-teal hover:text-kerala-teal/80 underline"
              >
                {t.skipVoice}
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 'symptoms' && (
          <motion.div
            key="symptoms"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className={`font-semibold text-gray-800 mb-4 ${isKioskMode ? 'text-2xl' : 'text-xl'}`}>
              {t.symptomsStep}
            </h2>
            <SymptomSelector
              language={language}
              selectedSymptoms={selectedSymptoms}
              onSymptomAdd={handleSymptomAdd}
              onSymptomRemove={handleSymptomRemove}
              isKioskMode={isKioskMode}
            />
          </motion.div>
        )}

        {currentStep === 'severity' && (
          <motion.div
            key="severity"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className={`font-semibold text-gray-800 mb-4 ${isKioskMode ? 'text-2xl' : 'text-xl'}`}>
              {t.severityStep}
            </h2>
            <SymptomSeverityRating
              language={language}
              symptoms={selectedSymptoms}
              onSymptomsUpdate={handleSeverityUpdate}
              isKioskMode={isKioskMode}
            />
          </motion.div>
        )}

        {currentStep === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className={`font-semibold text-gray-800 mb-4 ${isKioskMode ? 'text-2xl' : 'text-xl'}`}>
              {t.resultsStep}
            </h2>
            <ConditionResults
              language={language}
              symptoms={selectedSymptoms}
              conditions={matchingConditions}
              urgencyLevel={urgencyLevel}
              onComplete={handleSessionComplete}
              isKioskMode={isKioskMode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        {currentStep !== 'voice' && (
          <button
            onClick={() => {
              const steps: typeof currentStep[] = ['voice', 'symptoms', 'severity', 'results'];
              const currentIndex = steps.indexOf(currentStep);
              if (currentIndex > 0) {
                setCurrentStep(steps[currentIndex - 1]);
              }
            }}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← {t.prevStep}
          </button>
        )}
        
        <div className="flex-1"></div>

        {currentStep !== 'results' && (
          <button
            onClick={() => {
              if (currentStep === 'voice') setCurrentStep('symptoms');
              else if (currentStep === 'symptoms') setCurrentStep('severity');
              else if (currentStep === 'severity') setCurrentStep('results');
            }}
            disabled={!canProceedToNext()}
            className="px-6 py-3 bg-kerala-teal text-white rounded-lg hover:bg-kerala-teal/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {t.nextStep} →
          </button>
        )}

        {currentStep === 'results' && (
          <button
            onClick={() => {
              setCurrentStep('voice');
              setSelectedSymptoms([]);
              setMatchingConditions([]);
              setVoiceTranscript('');
              setUrgencyLevel('low');
            }}
            className="px-6 py-3 border border-kerala-teal text-kerala-teal rounded-lg hover:bg-kerala-teal hover:text-white transition-colors"
          >
            {t.startOver}
          </button>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
        {t.disclaimer}
      </div>
    </div>
  );
}