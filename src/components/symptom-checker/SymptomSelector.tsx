'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { symptomMatcher } from '@/lib/symptom-matcher';
import type { Language, SelectedSymptom } from '@/types/symptom-checker';

interface SymptomSelectorProps {
  language: Language;
  selectedSymptoms: SelectedSymptom[];
  onSymptomAdd: (symptom: SelectedSymptom) => void;
  onSymptomRemove: (symptomId: string) => void;
  isKioskMode?: boolean;
}

export default function SymptomSelector({
  language,
  selectedSymptoms,
  onSymptomAdd,
  onSymptomRemove,
  isKioskMode = false
}: SymptomSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const allSymptoms = symptomMatcher.searchSymptoms(searchQuery || '', language).slice(0, 20);
  
  const handleSymptomClick = (symptomId: string) => {
    const isSelected = selectedSymptoms.some(s => s.symptomId === symptomId);
    
    if (isSelected) {
      onSymptomRemove(symptomId);
    } else {
      const newSymptom: SelectedSymptom = {
        symptomId,
        severity: 'mild',
        duration: 'days',
        onset: 'gradual'
      };
      onSymptomAdd(newSymptom);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <input
        type="text"
        placeholder="Search symptoms..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={`w-full px-4 py-3 border rounded-lg ${isKioskMode ? 'text-lg' : ''}`}
      />

      {/* Symptoms Grid */}
      <div className={`grid gap-3 ${isKioskMode ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {allSymptoms.map((symptom) => {
          const isSelected = selectedSymptoms.some(s => s.symptomId === symptom.id);
          
          return (
            <motion.button
              key={symptom.id}
              onClick={() => handleSymptomClick(symptom.id)}
              className={`
                p-4 rounded-lg border-2 text-left transition-all
                ${isSelected 
                  ? 'border-kerala-teal bg-kerala-teal/10 text-kerala-teal' 
                  : 'border-gray-200 hover:border-kerala-teal/50'
                }
                ${isKioskMode ? 'text-lg' : 'text-base'}
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{symptom.icon}</span>
                <div>
                  <div className="font-medium">
                    {symptom.name[language as keyof typeof symptom.name] || symptom.name.en}
                  </div>
                  <div className="text-sm text-gray-600">
                    {symptom.description[language as keyof typeof symptom.description] || symptom.description.en}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Symptoms */}
      {selectedSymptoms.length > 0 && (
        <div className="mt-6">
          <h4 className={`font-medium mb-3 ${isKioskMode ? 'text-lg' : 'text-base'}`}>
            Selected Symptoms ({selectedSymptoms.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedSymptoms.map((selected) => {
              const symptom = symptomMatcher.getSymptomById(selected.symptomId);
              return (
                <span
                  key={selected.symptomId}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-kerala-teal text-white"
                >
                  {symptom?.icon} {symptom?.name[language as keyof typeof symptom.name] || symptom?.name.en}
                  <button
                    onClick={() => onSymptomRemove(selected.symptomId)}
                    className="ml-2 hover:bg-white/20 rounded-full px-1"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}