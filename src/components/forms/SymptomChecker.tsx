'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dbHelpers } from '@/lib/supabase';
import type { Language, OccupationType } from '@/types';

interface SymptomCheckerProps {
  language: Language;
  isKioskMode?: boolean;
  onSymptomReportSubmit?: (report: SymptomReport) => void;
}

interface SymptomReport {
  symptoms: string[];
  duration: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  occupation?: OccupationType;
  age?: number;
  gender?: string;
  location?: string;
  additionalInfo?: string;
}

interface SymptomSuggestion {
  id: string;
  name: string;
  category: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  relatedConditions: string[];
  questions: string[];
}

const SymptomChecker: React.FC<SymptomCheckerProps> = ({
  language,
  isKioskMode = false,
  onSymptomReportSubmit
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomReport, setSymptomReport] = useState<Partial<SymptomReport>>({});
  const [suggestions, setSuggestions] = useState<SymptomSuggestion[]>([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState<{
    level: string;
    conditions: string[];
    recommendations: string[];
  } | null>(null);

  const recognitionRef = useRef<any>(null);

  // Multilingual symptom database
  const symptomDatabase = {
    en: {
      title: "AI Symptom Checker",
      subtitle: "Describe your symptoms in your language",
      voicePrompt: "Tap microphone and describe how you feel",
      steps: [
        "Select your main symptoms",
        "How long have you had these symptoms?", 
        "Rate the severity of your symptoms",
        "Additional information",
        "Health assessment"
      ],
      symptoms: [
        { id: 'fever', name: 'Fever', category: 'general', icon: '🌡️', urgency: 'medium' },
        { id: 'cough', name: 'Cough', category: 'respiratory', icon: '🤧', urgency: 'medium' },
        { id: 'headache', name: 'Headache', category: 'neurological', icon: '🤕', urgency: 'low' },
        { id: 'breathing', name: 'Difficulty Breathing', category: 'respiratory', icon: '😮‍💨', urgency: 'high' },
        { id: 'chest_pain', name: 'Chest Pain', category: 'cardiac', icon: '💔', urgency: 'critical' },
        { id: 'nausea', name: 'Nausea/Vomiting', category: 'digestive', icon: '🤢', urgency: 'medium' },
        { id: 'dizziness', name: 'Dizziness', category: 'neurological', icon: '😵‍💫', urgency: 'medium' },
        { id: 'fatigue', name: 'Extreme Fatigue', category: 'general', icon: '😴', urgency: 'low' },
        { id: 'pain_joints', name: 'Joint/Muscle Pain', category: 'musculoskeletal', icon: '🦴', urgency: 'low' },
        { id: 'skin_rash', name: 'Skin Rash/Irritation', category: 'dermatological', icon: '🔴', urgency: 'low' },
        { id: 'eye_issues', name: 'Eye Problems', category: 'sensory', icon: '👁️', urgency: 'medium' },
        { id: 'hearing', name: 'Hearing Issues', category: 'sensory', icon: '👂', urgency: 'medium' }
      ],
      durations: [
        { id: 'hours', label: 'Few hours', value: 'hours' },
        { id: 'days', label: '1-3 days', value: 'days' },
        { id: 'week', label: 'About a week', value: 'week' },
        { id: 'weeks', label: 'Several weeks', value: 'weeks' },
        { id: 'months', label: 'Months', value: 'months' }
      ],
      severityLevels: [
        { id: 'low', label: 'Mild - I can work normally', color: 'bg-health-green', value: 'low' },
        { id: 'medium', label: 'Moderate - It bothers me', color: 'bg-warning-orange', value: 'medium' },
        { id: 'high', label: 'Severe - Hard to work', color: 'bg-error-red', value: 'high' },
        { id: 'critical', label: 'Very severe - Cannot work', color: 'bg-red-600', value: 'critical' }
      ]
    },
    hi: {
      title: "एआई लक्षण जांचकर्ता",
      subtitle: "अपनी भाषा में अपने लक्षणों का वर्णन करें",
      voicePrompt: "माइक्रोफोन को टैप करें और बताएं कि आप कैसा महसूस कर रहे हैं",
      steps: [
        "अपने मुख्य लक्षण चुनें",
        "यह लक्षण कब से है?",
        "अपने लक्षणों की गंभीरता बताएं",
        "अतिरिक्त जानकारी",
        "स्वास्थ्य मूल्यांकन"
      ],
      symptoms: [
        { id: 'fever', name: 'बुखार', category: 'सामान्य', icon: '🌡️', urgency: 'medium' },
        { id: 'cough', name: 'खांसी', category: 'श्वसन', icon: '🤧', urgency: 'medium' },
        { id: 'headache', name: 'सिरदर्द', category: 'न्यूरोलॉजिकल', icon: '🤕', urgency: 'low' },
        { id: 'breathing', name: 'सांस लेने में तकलीफ', category: 'श्वसन', icon: '😮‍💨', urgency: 'high' },
        { id: 'chest_pain', name: 'छाती में दर्द', category: 'हृदय', icon: '💔', urgency: 'critical' },
        { id: 'nausea', name: 'जी मिचलाना/उल्टी', category: 'पाचन', icon: '🤢', urgency: 'medium' },
        { id: 'dizziness', name: 'चक्कर आना', category: 'न्यूरोलॉजिकल', icon: '😵‍💫', urgency: 'medium' },
        { id: 'fatigue', name: 'अत्यधिक थकान', category: 'सामान्य', icon: '😴', urgency: 'low' },
        { id: 'pain_joints', name: 'जोड़ों/मांसपेशियों में दर्द', category: 'मस्कुलोस्केलेटल', icon: '🦴', urgency: 'low' },
        { id: 'skin_rash', name: 'त्वचा पर दाने/जलन', category: 'त्वचा विज्ञान', icon: '🔴', urgency: 'low' },
        { id: 'eye_issues', name: 'आंखों की समस्या', category: 'संवेदी', icon: '👁️', urgency: 'medium' },
        { id: 'hearing', name: 'सुनने की समस्या', category: 'संवेदी', icon: '👂', urgency: 'medium' }
      ],
      durations: [
        { id: 'hours', label: 'कुछ घंटे', value: 'hours' },
        { id: 'days', label: '1-3 दिन', value: 'days' },
        { id: 'week', label: 'लगभग एक सप्ताह', value: 'week' },
        { id: 'weeks', label: 'कई सप्ताह', value: 'weeks' },
        { id: 'months', label: 'महीने', value: 'months' }
      ],
      severityLevels: [
        { id: 'low', label: 'हल्का - मैं सामान्य रूप से काम कर सकता हूं', color: 'bg-health-green', value: 'low' },
        { id: 'medium', label: 'मध्यम - यह मुझे परेशान करता है', color: 'bg-warning-orange', value: 'medium' },
        { id: 'high', label: 'गंभीर - काम करना मुश्किल', color: 'bg-error-red', value: 'high' },
        { id: 'critical', label: 'बहुत गंभीर - काम नहीं कर सकता', color: 'bg-red-600', value: 'critical' }
      ]
    },
    ml: {
      title: "എഐ സിംപ്റ്റം ചെക്കർ",
      subtitle: "നിങ്ങളുടെ ഭാഷയിൽ നിങ്ങളുടെ ലക്ഷണങ്ങൾ വിവരിക്കുക",
      voicePrompt: "മൈക്രോഫോൺ ടാപ്പ് ചെയ്യുകയും നിങ്ങൾക്ക് എങ്ങനെ തോന്നുന്നു എന്ന് പറയുകയും ചെയ്യുക",
      steps: [
        "നിങ്ങളുടെ പ്രധാന ലക്ഷണങ്ങൾ തിരഞ്ഞെടുക്കുക",
        "എത്ര കാലമായി ഈ ലക്ഷണങ്ങൾ ഉണ്ട്?",
        "നിങ്ങളുടെ ലക്ഷണങ്ങളുടെ തീവ്രത റേറ്റ് ചെയ്യുക",
        "അധിക വിവരങ്ങൾ",
        "ആരോഗ്യ വിലയിരുത്തൽ"
      ],
      symptoms: [
        { id: 'fever', name: 'പനി', category: 'പൊതു', icon: '🌡️', urgency: 'medium' },
        { id: 'cough', name: 'ചുമ', category: 'ശ്വസന', icon: '🤧', urgency: 'medium' },
        { id: 'headache', name: 'തലവേദന', category: 'ന്യൂറോളജിക്കൽ', icon: '🤕', urgency: 'low' },
        { id: 'breathing', name: 'ശ്വാസതടസ്സം', category: 'ശ്വസന', icon: '😮‍💨', urgency: 'high' },
        { id: 'chest_pain', name: 'നെഞ്ചുവേദന', category: 'കാർഡിയാക്', icon: '💔', urgency: 'critical' },
        { id: 'nausea', name: 'ഓക്കാനം/ഛർദി', category: 'ദഹന', icon: '🤢', urgency: 'medium' },
        { id: 'dizziness', name: 'തലകറക്കം', category: 'ന്യൂറോളജിക്കൽ', icon: '😵‍💫', urgency: 'medium' },
        { id: 'fatigue', name: 'അമിത ക്ഷീണം', category: 'പൊതു', icon: '😴', urgency: 'low' },
        { id: 'pain_joints', name: 'സന്ധി/പേശി വേദന', category: 'മസ്കുലോസ്കെലറ്റൽ', icon: '🦴', urgency: 'low' },
        { id: 'skin_rash', name: 'ചർമ്മ ചുണങ്ങു/പ്രകോപനം', category: 'ത്വക്ക് രോഗം', icon: '🔴', urgency: 'low' },
        { id: 'eye_issues', name: 'കണ്ണ് പ്രശ്നങ്ങൾ', category: 'സെൻസറി', icon: '👁️', urgency: 'medium' },
        { id: 'hearing', name: 'കേൾവി പ്രശ്നങ്ങൾ', category: 'സെൻസറി', icon: '👂', urgency: 'medium' }
      ],
      durations: [
        { id: 'hours', label: 'കുറച്ച് മണിക്കൂറുകൾ', value: 'hours' },
        { id: 'days', label: '1-3 ദിവസം', value: 'days' },
        { id: 'week', label: 'ഏകദേശം ഒരു ആഴ്ച', value: 'week' },
        { id: 'weeks', label: 'പല ആഴ്ചകൾ', value: 'weeks' },
        { id: 'months', label: 'മാസങ്ങൾ', value: 'months' }
      ],
      severityLevels: [
        { id: 'low', label: 'നേരിയത് - എനിക്ക് സാധാരണ ജോലി ചെയ്യാം', color: 'bg-health-green', value: 'low' },
        { id: 'medium', label: 'മധ്യമം - എന്നെ ശല്യപ്പെടുത്തുന്നു', color: 'bg-warning-orange', value: 'medium' },
        { id: 'high', label: 'കഠിനം - ജോലി ചെയ്യാൻ പ്രയാസം', color: 'bg-error-red', value: 'high' },
        { id: 'critical', label: 'വളരെ കഠിനം - ജോലി ചെയ്യാൻ കഴിയില്ല', color: 'bg-red-600', value: 'critical' }
      ]
    }
  };

  const currentData = symptomDatabase[language as keyof typeof symptomDatabase] || symptomDatabase.en;

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getLanguageCode(language);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceInput(transcript);
      };

      recognition.onerror = () => {
        setIsVoiceActive(false);
      };

      recognition.onend = () => {
        setIsVoiceActive(false);
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
    const codes = {
      en: 'en-US', hi: 'hi-IN', bn: 'bn-BD', 
      or: 'hi-IN', ta: 'ta-IN', ne: 'ne-NP', ml: 'ml-IN'
    };
    return codes[lang] || 'en-US';
  };

  const startVoiceInput = () => {
    if (recognitionRef.current) {
      setIsVoiceActive(true);
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const handleVoiceInput = async (voiceText: string) => {
    setTranscript(voiceText);
    setIsProcessing(true);

    try {
      // Process voice input based on current step
      if (currentStep === 0) {
        // Extract symptoms from voice
        const extractedSymptoms = await extractSymptomsFromText(voiceText);
        setSelectedSymptoms(prev => [...new Set([...prev, ...extractedSymptoms])]);
      } else if (currentStep === 3) {
        // Additional information
        setSymptomReport(prev => ({ ...prev, additionalInfo: voiceText }));
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const extractSymptomsFromText = async (text: string): Promise<string[]> => {
    const foundSymptoms: string[] = [];
    const lowerText = text.toLowerCase();

    currentData.symptoms.forEach(symptom => {
      const symptomName = symptom.name.toLowerCase();
      if (lowerText.includes(symptomName) || 
          (symptom.id === 'fever' && (lowerText.includes('hot') || lowerText.includes('temperature'))) ||
          (symptom.id === 'cough' && lowerText.includes('cough')) ||
          (symptom.id === 'headache' && lowerText.includes('head')) ||
          (symptom.id === 'breathing' && (lowerText.includes('breath') || lowerText.includes('air'))) ||
          (symptom.id === 'chest_pain' && lowerText.includes('chest')) ||
          (symptom.id === 'nausea' && (lowerText.includes('sick') || lowerText.includes('vomit'))) ||
          (symptom.id === 'dizziness' && lowerText.includes('dizzy')) ||
          (symptom.id === 'fatigue' && (lowerText.includes('tired') || lowerText.includes('weak')))) {
        foundSymptoms.push(symptom.id);
      }
    });

    return foundSymptoms;
  };

  const handleSymptomSelect = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleNext = async () => {
    if (currentStep < currentData.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step - generate risk assessment
      await generateRiskAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const generateRiskAssessment = async () => {
    setIsProcessing(true);
    
    try {
      const selectedSymptomData = currentData.symptoms.filter(s => 
        selectedSymptoms.includes(s.id)
      );

      // Calculate risk level based on selected symptoms
      const highUrgencyCount = selectedSymptomData.filter(s => s.urgency === 'high' || s.urgency === 'critical').length;
      const mediumUrgencyCount = selectedSymptomData.filter(s => s.urgency === 'medium').length;

      let riskLevel = 'low';
      if (highUrgencyCount > 0 || symptomReport.severity === 'critical') {
        riskLevel = 'critical';
      } else if (highUrgencyCount > 0 || mediumUrgencyCount > 2 || symptomReport.severity === 'high') {
        riskLevel = 'high';
      } else if (mediumUrgencyCount > 0 || symptomReport.severity === 'medium') {
        riskLevel = 'medium';
      }

      // Generate condition suggestions
      const conditions = generateConditionSuggestions(selectedSymptomData);
      const recommendations = generateRecommendations(riskLevel, selectedSymptomData);

      setRiskAssessment({
        level: riskLevel,
        conditions,
        recommendations
      });

      // Submit report if callback provided
      const finalReport: SymptomReport = {
        symptoms: selectedSymptoms,
        duration: symptomReport.duration || 'unknown',
        severity: (symptomReport.severity as any) || 'low',
        ...symptomReport
      };

      onSymptomReportSubmit?.(finalReport);

      // Save to database if critical
      if (riskLevel === 'critical' || riskLevel === 'high') {
        await dbHelpers.createAnonymousReport(
          { district: 'unknown', panchayat: 'unknown', coordinates: { lat: 0, lng: 0 } },
          selectedSymptoms,
          riskLevel
        );
      }

    } catch (error) {
      console.error('Error generating risk assessment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateConditionSuggestions = (symptoms: any[]): string[] => {
    const conditions: string[] = [];
    
    // Simple rule-based condition mapping
    if (symptoms.find(s => s.id === 'fever') && symptoms.find(s => s.id === 'cough')) {
      conditions.push('Respiratory Infection');
    }
    if (symptoms.find(s => s.id === 'chest_pain') && symptoms.find(s => s.id === 'breathing')) {
      conditions.push('Cardiac or Respiratory Emergency');
    }
    if (symptoms.find(s => s.id === 'headache') && symptoms.find(s => s.id === 'fever')) {
      conditions.push('Viral Infection');
    }
    if (symptoms.find(s => s.id === 'nausea') && symptoms.find(s => s.id === 'dizziness')) {
      conditions.push('Gastrointestinal Issue');
    }

    return conditions.length > 0 ? conditions : ['General Health Concern'];
  };

  const generateRecommendations = (riskLevel: string, symptoms: any[]): string[] => {
    const recommendations: string[] = [];

    if (riskLevel === 'critical') {
      recommendations.push('🚨 Seek immediate emergency medical attention - Call 108');
      recommendations.push('🏥 Go to nearest hospital emergency room');
      recommendations.push('⚠️ Do not wait - this may be a medical emergency');
    } else if (riskLevel === 'high') {
      recommendations.push('🏥 Visit a doctor within 24 hours');
      recommendations.push('📞 Call health helpline 104 for guidance');
      recommendations.push('💊 Avoid self-medication');
    } else if (riskLevel === 'medium') {
      recommendations.push('👨‍⚕️ Schedule appointment with healthcare provider');
      recommendations.push('🌡️ Monitor symptoms and temperature');
      recommendations.push('💧 Stay hydrated and rest');
    } else {
      recommendations.push('🏠 Rest and monitor symptoms');
      recommendations.push('💊 Basic symptomatic care as needed');
      recommendations.push('📈 Seek medical care if symptoms worsen');
    }

    // Occupation-specific recommendations
    if (symptoms.find(s => s.id === 'breathing') && symptomReport.occupation === 'construction') {
      recommendations.push('😷 Consider dust exposure - use protective masks');
    }
    if (symptoms.find(s => s.id === 'skin_rash') && symptomReport.occupation === 'fishing') {
      recommendations.push('🧴 Check for water-related skin irritation');
    }

    return recommendations;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Symptom selection
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">
                {currentData.steps[0]}
              </h3>
              <p className="text-gray-600">{currentData.voicePrompt}</p>
            </div>

            {/* Voice Input Button */}
            <div className="flex justify-center mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startVoiceInput}
                disabled={isVoiceActive || isProcessing}
                className={`w-20 h-20 rounded-full font-semibold text-white shadow-lg transition-all duration-300 ${
                  isVoiceActive 
                    ? 'bg-red-500 animate-pulse' 
                    : isProcessing
                    ? 'bg-warning-orange'
                    : 'bg-kerala-teal hover:bg-opacity-90'
                }`}
              >
                {isProcessing ? (
                  <div className="voice-waveform">
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                  </div>
                ) : (
                  <span className="text-3xl">🎤</span>
                )}
              </motion.button>
            </div>

            {transcript && (
              <div className="bg-blue-50 p-4 rounded-xl mb-6">
                <h4 className="font-semibold mb-2">You said:</h4>
                <p className="text-gray-700 italic">"{transcript}"</p>
              </div>
            )}

            {/* Visual Symptom Selection */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {currentData.symptoms.map((symptom) => (
                <motion.button
                  key={symptom.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSymptomSelect(symptom.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedSymptoms.includes(symptom.id)
                      ? 'border-kerala-teal bg-kerala-teal bg-opacity-10'
                      : 'border-gray-200 hover:border-kerala-teal bg-white'
                  } ${isKioskMode ? 'min-h-[100px] text-lg' : ''}`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{symptom.icon}</div>
                    <div className="font-medium text-sm">{symptom.name}</div>
                    {selectedSymptoms.includes(symptom.id) && (
                      <div className="text-kerala-teal text-xl mt-1">✓</div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 1: // Duration
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center mb-6">
              {currentData.steps[1]}
            </h3>
            <div className="space-y-3">
              {currentData.durations.map((duration) => (
                <motion.button
                  key={duration.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSymptomReport(prev => ({ ...prev, duration: duration.value }))}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    symptomReport.duration === duration.value
                      ? 'border-kerala-teal bg-kerala-teal bg-opacity-10'
                      : 'border-gray-200 hover:border-kerala-teal bg-white'
                  } ${isKioskMode ? 'min-h-[80px] text-lg' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{duration.label}</span>
                    {symptomReport.duration === duration.value && (
                      <div className="text-kerala-teal text-xl">✓</div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 2: // Severity
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center mb-6">
              {currentData.steps[2]}
            </h3>
            <div className="space-y-3">
              {currentData.severityLevels.map((level) => (
                <motion.button
                  key={level.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSymptomReport(prev => ({ ...prev, severity: level.value as any }))}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    symptomReport.severity === level.value
                      ? 'border-kerala-teal bg-kerala-teal bg-opacity-10'
                      : 'border-gray-200 hover:border-kerala-teal bg-white'
                  } ${isKioskMode ? 'min-h-[80px] text-lg' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${level.color}`}></div>
                      <span className="font-medium">{level.label}</span>
                    </div>
                    {symptomReport.severity === level.value && (
                      <div className="text-kerala-teal text-xl">✓</div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 3: // Additional information
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center mb-6">
              {currentData.steps[3]}
            </h3>
            
            <div className="space-y-4">
              {/* Voice input for additional info */}
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startVoiceInput}
                  disabled={isVoiceActive || isProcessing}
                  className={`w-16 h-16 rounded-full font-semibold text-white shadow-lg transition-all duration-300 ${
                    isVoiceActive 
                      ? 'bg-red-500 animate-pulse' 
                      : 'bg-kerala-teal hover:bg-opacity-90'
                  }`}
                >
                  <span className="text-2xl">🎤</span>
                </motion.button>
                <p className="text-sm text-gray-600 mt-2">
                  Describe any other symptoms or concerns
                </p>
              </div>

              <textarea
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-kerala-teal focus:outline-none resize-none"
                rows={4}
                placeholder="Tell us about any other symptoms, when they started, or anything else you think is important..."
                value={symptomReport.additionalInfo || ''}
                onChange={(e) => setSymptomReport(prev => ({ ...prev, additionalInfo: e.target.value }))}
              />

              {transcript && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold mb-2">Voice input:</h4>
                  <p className="text-gray-700 italic">"{transcript}"</p>
                </div>
              )}
            </div>
          </div>
        );

      case 4: // Assessment results
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center mb-6">
              {currentData.steps[4]}
            </h3>

            {riskAssessment && (
              <div className="space-y-6">
                {/* Risk Level */}
                <div className={`p-6 rounded-xl text-center ${
                  riskAssessment.level === 'critical' ? 'bg-red-100 border-red-500' :
                  riskAssessment.level === 'high' ? 'bg-orange-100 border-orange-500' :
                  riskAssessment.level === 'medium' ? 'bg-yellow-100 border-yellow-500' :
                  'bg-green-100 border-green-500'
                } border-2`}>
                  <div className="text-4xl mb-4">
                    {riskAssessment.level === 'critical' ? '🚨' :
                     riskAssessment.level === 'high' ? '⚠️' :
                     riskAssessment.level === 'medium' ? '⚡' : '✅'}
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {riskAssessment.level === 'critical' ? 'CRITICAL - Immediate Attention Required' :
                     riskAssessment.level === 'high' ? 'HIGH PRIORITY - See Doctor Soon' :
                     riskAssessment.level === 'medium' ? 'MODERATE - Monitor Closely' :
                     'LOW RISK - Basic Care'}
                  </h3>
                </div>

                {/* Possible Conditions */}
                <div className="health-card p-6">
                  <h4 className="font-semibold mb-3">🔍 Possible Conditions:</h4>
                  <ul className="space-y-2">
                    {riskAssessment.conditions.map((condition, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="text-kerala-teal">•</span>
                        <span>{condition}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="health-card p-6">
                  <h4 className="font-semibold mb-3">💡 Recommendations:</h4>
                  <div className="space-y-3">
                    {riskAssessment.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <span className="text-lg">{rec.split(' ')[0]}</span>
                        <span>{rec.substring(rec.indexOf(' ') + 1)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Symptoms Summary */}
                <div className="health-card p-6">
                  <h4 className="font-semibold mb-3">📝 Your Reported Symptoms:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map(symptomId => {
                      const symptom = currentData.symptoms.find(s => s.id === symptomId);
                      return symptom ? (
                        <span key={symptomId} className="bg-kerala-teal bg-opacity-10 text-kerala-teal px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                          <span>{symptom.icon}</span>
                          <span>{symptom.name}</span>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${isKioskMode ? 'kiosk-mode' : ''}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            {currentData.title}
          </h1>
          <p className="text-gray-600">{currentData.subtitle}</p>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600">
            Step {currentStep + 1} of {currentData.steps.length}
          </span>
          <span className="text-sm text-kerala-teal font-medium">
            {Math.round(((currentStep + 1) / currentData.steps.length) * 100)}% Complete
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / currentData.steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-kerala-teal to-neon-blue h-3 rounded-full"
          />
        </div>

        <div className="flex justify-between mt-2">
          {currentData.steps.map((step, index) => (
            <div
              key={index}
              className={`text-xs text-center flex-1 ${
                index <= currentStep ? 'text-kerala-teal font-medium' : 'text-gray-400'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        {renderStepContent()}
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            currentStep === 0 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          } ${isKioskMode ? 'px-8 py-4 text-lg' : ''}`}
        >
          ← Previous
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          disabled={
            (currentStep === 0 && selectedSymptoms.length === 0) ||
            (currentStep === 1 && !symptomReport.duration) ||
            (currentStep === 2 && !symptomReport.severity) ||
            isProcessing
          }
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            isProcessing
              ? 'bg-warning-orange text-white cursor-wait'
              : 'bg-kerala-teal text-white hover:bg-opacity-90'
          } ${isKioskMode ? 'px-8 py-4 text-lg' : ''}`}
        >
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Processing...</span>
            </div>
          ) : currentStep === currentData.steps.length - 1 ? (
            'Get Assessment'
          ) : (
            'Next →'
          )}
        </motion.button>
      </div>

      {/* Emergency Notice */}
      <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-center space-x-2 text-red-600">
          <span className="text-xl">🚨</span>
          <span className="font-semibold">Emergency:</span>
        </div>
        <p className="text-red-700 text-sm mt-1">
          If you have severe chest pain, difficulty breathing, severe bleeding, or feel this is a medical emergency, 
          call 108 immediately or go to the nearest hospital.
        </p>
      </div>
    </div>
  );
};

export default SymptomChecker;