'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { symptomMatcher } from '@/lib/symptom-matcher';
import type { Language, SelectedSymptom, SymptomSeverity, SymptomDuration, SymptomOnset } from '@/types/symptom-checker';

interface SymptomSeverityRatingProps {
  language: Language;
  symptoms: SelectedSymptom[];
  onSymptomsUpdate: (symptoms: SelectedSymptom[]) => void;
  isKioskMode?: boolean;
}

export default function SymptomSeverityRating({
  language,
  symptoms,
  onSymptomsUpdate,
  isKioskMode = false
}: SymptomSeverityRatingProps) {

  const updateSymptom = (symptomId: string, updates: Partial<SelectedSymptom>) => {
    const updatedSymptoms = symptoms.map(symptom =>
      symptom.symptomId === symptomId ? { ...symptom, ...updates } : symptom
    );
    onSymptomsUpdate(updatedSymptoms);
  };

  const severityOptions: { value: SymptomSeverity; label: Record<Language, string>; color: string }[] = [
    { value: 'mild', label: { en: 'Mild', hi: 'हल्का', ml: 'നേരിയ', bn: 'হালকা', or: 'ହାଲ୍କା', ta: 'லேசான', ne: 'हल्का' }, color: 'bg-green-500' },
    { value: 'moderate', label: { en: 'Moderate', hi: 'मध्यम', ml: 'മധ്യമം', bn: 'মাঝারি', or: 'ମଧ୍ୟମ', ta: 'மிதமான', ne: 'मध्यम' }, color: 'bg-yellow-500' },
    { value: 'severe', label: { en: 'Severe', hi: 'गंभीर', ml: 'കഠിനമായ', bn: 'গুরুতর', or: 'ଗମ୍ଭୀର', ta: 'கடுமையான', ne: 'गम्भीर' }, color: 'bg-orange-500' },
    { value: 'critical', label: { en: 'Critical', hi: 'अत्यंत गंभीर', ml: 'ഗുരുതരമായ', bn: 'অত্যন্ত গুরুতর', or: 'ଅତ୍ୟନ୍ତ ଗମ୍ଭୀର', ta: 'மிகக் கடுமையான', ne: 'अत्यन्त गम्भीर' }, color: 'bg-red-500' }
  ];

  const durationOptions: { value: SymptomDuration; label: Record<Language, string> }[] = [
    { value: 'minutes', label: { en: 'Minutes', hi: 'मिनट', ml: 'മിനിട്ട്', bn: 'মিনিট', or: 'ମିନିଟ', ta: 'நிமிடங்கள்', ne: 'मिनेट' }},
    { value: 'hours', label: { en: 'Hours', hi: 'घंटे', ml: 'മണിക്കൂർ', bn: 'ঘন্টা', or: 'ଘଣ୍ଟା', ta: 'மணி', ne: 'घण्टा' }},
    { value: 'days', label: { en: 'Days', hi: 'दिन', ml: 'ദിവസം', bn: 'দিন', or: 'ଦିନ', ta: 'நாட்கள்', ne: 'दिन' }},
    { value: 'weeks', label: { en: 'Weeks', hi: 'सप्ताह', ml: 'ആഴ്ച', bn: 'সপ্তাহ', or: 'ସପ୍ତାହ', ta: 'வாரங்கள்', ne: 'हप्ता' }},
    { value: 'months', label: { en: 'Months', hi: 'महीने', ml: 'മാസം', bn: 'মাস', or: 'ମାସ', ta: 'மாதங்கள்', ne: 'महिना' }}
  ];

  return (
    <div className="space-y-6">
      {symptoms.map((symptom, index) => {
        const symptomData = symptomMatcher.getSymptomById(symptom.symptomId);
        
        return (
          <motion.div
            key={symptom.symptomId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-white rounded-xl border-2 border-gray-100"
          >
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-3xl">{symptomData?.icon}</span>
              <div>
                <h3 className={`font-semibold ${isKioskMode ? 'text-xl' : 'text-lg'}`}>
                  {symptomData?.name[language] || symptomData?.name.en}
                </h3>
                <p className={`text-gray-600 ${isKioskMode ? 'text-base' : 'text-sm'}`}>
                  {symptomData?.description[language] || symptomData?.description.en}
                </p>
              </div>
            </div>

            {/* Severity Rating */}
            <div className="mb-6">
              <h4 className={`font-medium mb-3 ${isKioskMode ? 'text-lg' : 'text-base'}`}>
                How severe is this symptom?
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {severityOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => updateSymptom(symptom.symptomId, { severity: option.value })}
                    className={`
                      p-3 rounded-lg border-2 text-white font-medium transition-all
                      ${symptom.severity === option.value 
                        ? `${option.color} border-gray-800 shadow-lg scale-105` 
                        : `${option.color} opacity-60 border-transparent hover:opacity-80`
                      }
                      ${isKioskMode ? 'text-base' : 'text-sm'}
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {option.label[language] || option.label.en}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="mb-4">
              <h4 className={`font-medium mb-3 ${isKioskMode ? 'text-lg' : 'text-base'}`}>
                How long have you had this symptom?
              </h4>
              <select
                value={symptom.duration}
                onChange={(e) => updateSymptom(symptom.symptomId, { duration: e.target.value as SymptomDuration })}
                className={`w-full p-3 border rounded-lg ${isKioskMode ? 'text-lg' : 'text-base'}`}
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label[language] || option.label.en}
                  </option>
                ))}
              </select>
            </div>

            {/* Onset */}
            <div>
              <h4 className={`font-medium mb-3 ${isKioskMode ? 'text-lg' : 'text-base'}`}>
                How did it start?
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {(['sudden', 'gradual'] as SymptomOnset[]).map((onset) => (
                  <button
                    key={onset}
                    onClick={() => updateSymptom(symptom.symptomId, { onset })}
                    className={`
                      p-3 rounded-lg border-2 transition-all
                      ${symptom.onset === onset
                        ? 'border-kerala-teal bg-kerala-teal/10 text-kerala-teal'
                        : 'border-gray-200 hover:border-kerala-teal/50'
                      }
                      ${isKioskMode ? 'text-base' : 'text-sm'}
                    `}
                  >
                    {onset === 'sudden' 
                      ? (language === 'hi' ? 'अचानक' : language === 'ml' ? 'പെട്ടെന്ന്' : 'Sudden')
                      : (language === 'hi' ? 'धीरे-धीरे' : language === 'ml' ? 'പതിയെ' : 'Gradual')
                    }
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4">
              <textarea
                placeholder="Additional notes (optional)"
                value={symptom.notes || ''}
                onChange={(e) => updateSymptom(symptom.symptomId, { notes: e.target.value })}
                className={`w-full p-3 border rounded-lg ${isKioskMode ? 'text-lg' : 'text-base'}`}
                rows={2}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}