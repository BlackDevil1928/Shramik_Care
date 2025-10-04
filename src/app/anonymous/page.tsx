'use client';

import { useState } from 'react';
import AnonymousReporting from '@/components/reporting/AnonymousReporting';
import { Shield, Users, TrendingUp, AlertCircle } from 'lucide-react';
import type { Language } from '@/types';

export default function AnonymousReportingPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [showDemo, setShowDemo] = useState(false);

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Complete Anonymity",
      description: "No personal information collected. No IP tracking. No cookies. Your identity is never stored or tracked.",
      details: [
        "Zero personal identifiers stored",
        "No location tracking beyond general area",
        "Employer cannot access reports",
        "Government cannot trace to individuals"
      ]
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Community Protection",
      description: "Help protect fellow migrant workers by reporting health issues anonymously for public health surveillance.",
      details: [
        "Early disease outbreak detection",
        "Improved healthcare resource allocation",
        "Better services for migrant communities",
        "Evidence-based health policies"
      ]
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
      title: "Real-time Surveillance",
      description: "Your anonymous reports contribute to real-time health monitoring and rapid response to health threats.",
      details: [
        "Hotspot detection within 24 hours",
        "Automated health authority alerts",
        "Pattern recognition for prevention",
        "Resource deployment optimization"
      ]
    },
    {
      icon: <AlertCircle className="w-8 h-8 text-orange-600" />,
      title: "Trust & Transparency",
      description: "Full transparency about data use with open-source privacy protocols and regular security audits.",
      details: [
        "Open source privacy implementation",
        "Regular third-party security audits",
        "Published data usage policies",
        "Community oversight board"
      ]
    }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'ne', name: 'नेपाली', flag: '🇳🇵' },
    { code: 'or', name: 'ଓଡ଼ିଆ', flag: '🇮🇳' }
  ];

  if (showDemo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setShowDemo(false)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Information
            </button>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as Language)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Anonymous Reporting Component */}
          <AnonymousReporting
            language={selectedLanguage}
            initialLocation={{
              district: 'ernakulam',
              area: 'Industrial Area'
            }}
            onReportSubmit={(report) => {
              console.log('Anonymous report submitted:', report);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900">
            Anonymous Health Reporting
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Protect your community's health while staying completely anonymous. 
            Your privacy is guaranteed, your contribution is valuable.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-green-800 font-medium">
              🔒 Zero personal information collected • No IP tracking • Complete anonymity guaranteed
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
              
              <ul className="space-y-2 mt-4">
                {feature.details.map((detail, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Privacy Assurance Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Privacy Assurance</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-red-700 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                What We DON'T Collect
              </h3>
              <ul className="space-y-3">
                {[
                  'Your name, phone, or any personal ID',
                  'Your exact location or address',
                  'Your IP address or device info',
                  'Any data that could identify you',
                  'Tracking cookies or session data'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 text-green-700 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                What We DO Collect
              </h3>
              <ul className="space-y-3">
                {[
                  'Symptoms and health status',
                  'General area (district level only)',
                  'Basic demographics (age group, work type)',
                  'Symptom severity and duration',
                  'Anonymous health patterns'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">How This Helps:</h4>
            <div className="grid md:grid-cols-2 gap-4 text-blue-800">
              <ul className="space-y-1">
                <li>• Early disease outbreak detection</li>
                <li>• Better healthcare resource allocation</li>
              </ul>
              <ul className="space-y-1">
                <li>• Protection of migrant worker communities</li>
                <li>• Evidence-based public health policies</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Language Support */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">Available in 7 Languages</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {languages.map(lang => (
              <div key={lang.code} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-8">
          <div className="bg-kerala-teal text-white rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">Ready to Help Your Community?</h2>
            <p className="text-xl mb-6 opacity-90">
              Submit an anonymous health report in just 5 minutes. Your privacy is guaranteed.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => setShowDemo(true)}
                className="bg-white text-kerala-teal px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
              >
                Start Anonymous Report
              </button>
              
              <p className="text-sm opacity-80">
                No registration required • Takes 5 minutes • Completely anonymous
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="text-3xl font-bold text-kerala-teal mb-2">100%</div>
              <div className="text-gray-600">Anonymous</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="text-3xl font-bold text-kerala-teal mb-2">5 min</div>
              <div className="text-gray-600">Average Time</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="text-3xl font-bold text-kerala-teal mb-2">7</div>
              <div className="text-gray-600">Languages</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>
            Part of the Kerala Digital Health Record Management System for Migrant Workers
          </p>
          <p className="mt-2 text-sm">
            Aligned with UN Sustainable Development Goals • Privacy by Design • Open Source
          </p>
        </footer>
      </div>
    </div>
  );
}