'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { symptomMatcher } from '@/lib/symptom-matcher';
import type { Language, SelectedSymptom, ConditionMatch, UrgencyLevel } from '@/types/symptom-checker';

interface ConditionResultsProps {
  language: Language;
  symptoms: SelectedSymptom[];
  conditions: ConditionMatch[];
  urgencyLevel: UrgencyLevel;
  onComplete: () => void;
  isKioskMode?: boolean;
}

export default function ConditionResults({
  language,
  symptoms,
  conditions,
  urgencyLevel,
  onComplete,
  isKioskMode = false
}: ConditionResultsProps) {

  const translations = {
    en: {
      title: 'Your Health Assessment',
      possibleConditions: 'Possible Conditions',
      confidence: 'Confidence',
      recommendations: 'Recommendations',
      symptoms: 'Your Symptoms',
      urgency: 'Urgency Level',
      noConditions: 'No specific conditions identified. Please consult a healthcare provider.',
      seekCare: 'Seek Medical Care',
      emergency: 'EMERGENCY - Seek immediate care',
      high: 'HIGH - See doctor today',
      medium: 'MEDIUM - See doctor within few days', 
      low: 'LOW - Monitor and see doctor if worsens',
      generalAdvice: 'General Health Advice',
      complete: 'Complete Assessment'
    },
    hi: {
      title: 'आपका स्वास्थ्य मूल्यांकन',
      possibleConditions: 'संभावित स्थितियां',
      confidence: 'विश्वास',
      recommendations: 'सिफारिशें',
      symptoms: 'आपके लक्षण',
      urgency: 'तत्कालता स्तर',
      noConditions: 'कोई विशिष्ट स्थिति की पहचान नहीं। कृपया स्वास्थ्य प्रदाता से सलाह लें।',
      seekCare: 'चिकित्सा देखभाल प्राप्त करें',
      emergency: 'आपातकाल - तुरंत देखभाल प्राप्त करें',
      high: 'उच्च - आज डॉक्टर से मिलें',
      medium: 'मध्यम - कुछ दिनों में डॉक्टर से मिलें',
      low: 'कम - निगरानी करें और बिगड़ने पर डॉक्टर से मिलें',
      generalAdvice: 'सामान्य स्वास्थ्य सलाह',
      complete: 'मूल्यांकन पूरा करें'
    },
    ml: {
      title: 'നിങ്ങളുടെ ആരോഗ്യ വിലയിരുത്തൽ',
      possibleConditions: 'സാധ്യമായ അവസ്ഥകൾ',
      confidence: 'ആത്മവിശ്വാസം',
      recommendations: 'ശുപാർശകൾ',
      symptoms: 'നിങ്ങളുടെ ലക്ഷണങ്ങൾ',
      urgency: 'അടിയന്തിര നില',
      noConditions: 'പ്രത്യേക അവസ്ഥകൾ തിരിച്ചറിഞ്ഞില്ല. ദയവായി ആരോഗ്യ പരിരക്ഷാ ദാതാവിനെ സമീപിക്കുക.',
      seekCare: 'മെഡിക്കൽ കെയർ തേടുക',
      emergency: 'അത്യാഹിതം - ഉടനടി പരിചരണം തേടുക',
      high: 'ഉയർന്നത് - ഇന്ന് ഡോക്ടറെ കാണുക',
      medium: 'ഇടത്തരം - കുറച്ച് ദിവസങ്ങൾക്കുള്ളിൽ ഡോക്ടറെ കാണുക',
      low: 'കുറവ് - നിരീക്ഷിക്കുകയും വഷളായാൽ ഡോക്ടറെ കാണുകയും ചെയ്യുക',
      generalAdvice: 'പൊതു ആരോഗ്യ ഉപദേശം',
      complete: 'വിലയിരുത്തൽ പൂർത്തിയാക്കുക'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const getUrgencyColor = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
    }
  };

  const getUrgencyText = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'emergency': return t.emergency;
      case 'high': return t.high;
      case 'medium': return t.medium;
      case 'low': return t.low;
    }
  };

  return (
    <div className="space-y-6">
      {/* Urgency Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-4 rounded-xl text-center font-bold ${getUrgencyColor(urgencyLevel)} ${isKioskMode ? 'text-xl' : 'text-lg'}`}
      >
        {t.urgency}: {getUrgencyText(urgencyLevel)}
      </motion.div>

      {/* Your Symptoms Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border"
      >
        <h3 className={`font-semibold mb-4 ${isKioskMode ? 'text-xl' : 'text-lg'}`}>
          {t.symptoms}
        </h3>
        <div className="flex flex-wrap gap-2">
          {symptoms.map((symptom) => {
            const symptomData = symptomMatcher.getSymptomById(symptom.symptomId);
            return (
              <span
                key={symptom.symptomId}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 ${isKioskMode ? 'text-base' : ''}`}
              >
                {symptomData?.icon} {symptomData?.name[language as keyof typeof symptomData.name] || symptomData?.name.en} ({symptom.severity})
              </span>
            );
          })}
        </div>
      </motion.div>

      {/* Possible Conditions */}
      {conditions.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg border"
        >
          <h3 className={`font-semibold mb-4 ${isKioskMode ? 'text-xl' : 'text-lg'}`}>
            {t.possibleConditions}
          </h3>
          <div className="space-y-4">
            {conditions.map((match, index) => {
              const condition = symptomMatcher.getConditionById(match.conditionId);
              if (!condition) return null;

              return (
                <motion.div
                  key={match.conditionId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="border rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-medium ${isKioskMode ? 'text-lg' : 'text-base'}`}>
                      {condition.name[language as keyof typeof condition.name] || condition.name.en}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      match.confidence > 0.7 ? 'bg-green-100 text-green-800' :
                      match.confidence > 0.4 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {t.confidence}: {Math.round(match.confidence * 100)}%
                    </span>
                  </div>
                  
                  <p className={`text-gray-600 mb-3 ${isKioskMode ? 'text-base' : 'text-sm'}`}>
                    {condition.description[language as keyof typeof condition.description] || condition.description.en}
                  </p>
                  
                  <p className={`text-gray-500 mb-3 ${isKioskMode ? 'text-sm' : 'text-xs'}`}>
                    {match.reasoning}
                  </p>

                  {/* Recommendations */}
                  <div>
                    <h5 className={`font-medium mb-2 ${isKioskMode ? 'text-base' : 'text-sm'}`}>
                      {t.recommendations}:
                    </h5>
                    <ul className={`list-disc list-inside space-y-1 text-gray-700 ${isKioskMode ? 'text-base' : 'text-sm'}`}>
                      {(condition.recommendations[language as keyof typeof condition.recommendations] || condition.recommendations.en).map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg border text-center"
        >
          <p className={`text-gray-600 ${isKioskMode ? 'text-lg' : 'text-base'}`}>
            {t.noConditions}
          </p>
        </motion.div>
      )}

      {/* General Health Advice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-50 rounded-xl p-6 border border-blue-200"
      >
        <h3 className={`font-semibold mb-3 text-blue-900 ${isKioskMode ? 'text-lg' : 'text-base'}`}>
          {t.generalAdvice}
        </h3>
        <ul className={`space-y-2 text-blue-800 ${isKioskMode ? 'text-base' : 'text-sm'}`}>
          <li>• Stay hydrated and get adequate rest</li>
          <li>• Monitor your symptoms and note any changes</li>
          <li>• Seek medical care if symptoms worsen</li>
          <li>• Follow occupational safety guidelines</li>
          <li>• Maintain good hygiene practices</li>
        </ul>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-4"
      >
        <button
          onClick={onComplete}
          className={`flex-1 py-4 bg-kerala-teal text-white rounded-xl hover:bg-kerala-teal/90 transition-colors font-semibold ${isKioskMode ? 'text-lg' : 'text-base'}`}
        >
          {t.complete}
        </button>
        
        {urgencyLevel !== 'low' && (
          <button
            onClick={() => window.open('tel:108', '_self')}
            className={`flex-1 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold ${isKioskMode ? 'text-lg' : 'text-base'}`}
          >
            {t.seekCare} 🚨
          </button>
        )}
      </motion.div>
    </div>
  );
}