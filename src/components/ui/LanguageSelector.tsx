'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Language } from '@/types';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  className?: string;
}

const languages = [
  {
    code: 'en' as Language,
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    region: 'Global'
  },
  {
    code: 'hi' as Language,
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    region: 'India'
  },
  {
    code: 'bn' as Language,
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇧🇩',
    region: 'Bangladesh/West Bengal'
  },
  {
    code: 'or' as Language,
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    flag: '🇮🇳',
    region: 'Odisha'
  },
  {
    code: 'ta' as Language,
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    region: 'Tamil Nadu'
  },
  {
    code: 'ne' as Language,
    name: 'Nepali',
    nativeName: 'नेपाली',
    flag: '🇳🇵',
    region: 'Nepal'
  },
  {
    code: 'ml' as Language,
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    flag: '🇮🇳',
    region: 'Kerala'
  }
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  const handleLanguageSelect = (language: Language) => {
    onLanguageChange(language);
    setIsOpen(false);
    
    // Announce language change for accessibility
    const announcement = `Language changed to ${languages.find(l => l.code === language)?.name}`;
    const utterance = new SpeechSynthesisUtterance(announcement);
    speechSynthesis.speak(utterance);
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      {/* Language Selector Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neon-blue"
        aria-label={`Current language: ${currentLang?.name}. Click to change language`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-2xl" role="img" aria-label={`${currentLang?.name} flag`}>
          {currentLang?.flag}
        </span>
        <span className="font-medium text-gray-700 hidden sm:block">
          {currentLang?.nativeName}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black bg-opacity-25 sm:hidden"
            />

            {/* Dropdown content */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 z-50 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
              role="listbox"
              aria-label="Language selection menu"
            >
              {/* Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-kerala-teal to-neon-blue text-white">
                <h3 className="font-semibold text-sm">
                  🌍 Choose Your Language
                </h3>
                <p className="text-xs opacity-90 mt-1">
                  Select your preferred language for voice assistance
                </p>
              </div>

              {/* Language Options */}
              <div className="max-h-80 overflow-y-auto">
                {languages.map((language, index) => (
                  <motion.button
                    key={language.code}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleLanguageSelect(language.code)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 focus:bg-neon-blue focus:text-white focus:outline-none ${
                      currentLanguage === language.code 
                        ? 'bg-kerala-teal text-white' 
                        : 'text-gray-700'
                    }`}
                    role="option"
                    aria-selected={currentLanguage === language.code}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl" role="img" aria-label={`${language.name} flag`}>
                        {language.flag}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{language.nativeName}</span>
                          <span className="text-sm opacity-75">({language.name})</span>
                        </div>
                        <div className="text-xs opacity-60 mt-1">
                          {language.region}
                        </div>
                      </div>
                      {currentLanguage === language.code && (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6s.792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029C10.792 13.807 10.304 14 10 14s-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H9a1 1 0 000-2h-.013a7.78 7.78 0 010-1H9a1 1 0 100-2h-.528c.04-.184.108-.35.264-.521z" clipRule="evenodd" />
                    </svg>
                    <span>Voice support available</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-kerala-teal hover:text-neon-blue font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;