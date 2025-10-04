'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { Language } from '@/types';

interface NavigationProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export default function Navigation({ currentLanguage, onLanguageChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/symptom-checker', label: 'Symptom Checker', icon: '🩺' },
    { href: '/occupational-health', label: 'Risk Assessment', icon: '⚠️' },
    { href: '/surveillance-map', label: '3D Disease Map', icon: '🗺️' },
    { href: '/anonymous-reporting', label: 'Anonymous Report', icon: '🔒' },
    { href: '/health-records', label: 'My Health Records', icon: '📋' },
    { href: '/admin', label: 'Admin Dashboard', icon: '👥' }
  ];

  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'hi' as Language, name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ml' as Language, name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'bn' as Language, name: 'বাংলা', flag: '🇧🇩' },
    { code: 'ta' as Language, name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'or' as Language, name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
    { code: 'ne' as Language, name: 'नेपाली', flag: '🇳🇵' }
  ];

  const isActivePage = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Main Navigation Bar */}
      <nav className="bg-white shadow-lg border-b border-kerala-teal/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-kerala-teal rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-kerala-teal">Kerala Health</h1>
                <p className="text-xs text-gray-600">Migrant Worker System</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActivePage(item.href) 
                      ? 'bg-kerala-teal text-white shadow-md transform scale-105' 
                      : 'text-gray-700 hover:bg-kerala-teal/10 hover:text-kerala-teal'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Language Selector and Mobile Menu */}
            <div className="flex items-center space-x-3">
              {/* Language Selector */}
              <div className="relative">
                <select
                  value={currentLanguage}
                  onChange={(e) => onLanguageChange(e.target.value as Language)}
                  className="appearance-none bg-kerala-teal/10 text-kerala-teal px-3 py-2 rounded-lg border border-kerala-teal/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kerala-teal pr-8"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-kerala-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-kerala-teal hover:bg-kerala-teal/10 transition-colors"
                aria-label="Toggle mobile menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-kerala-teal/20 shadow-lg"
            >
              <div className="px-4 py-2 space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200
                      ${isActivePage(item.href) 
                        ? 'bg-kerala-teal text-white shadow-md' 
                        : 'text-gray-700 hover:bg-kerala-teal/10 hover:text-kerala-teal'
                      }
                    `}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Emergency Hotline Banner */}
      <div className="bg-red-600 text-white py-2 px-4 text-center text-sm animate-pulse">
        <span className="font-semibold">🚨 EMERGENCY HOTLINE: 108</span>
        <span className="mx-4">|</span>
        <span>Health Helpline: 104</span>
        <span className="mx-4">|</span>
        <span>24/7 Multilingual Support</span>
      </div>
    </>
  );
}