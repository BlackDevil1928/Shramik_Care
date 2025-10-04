'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Shield, AlertTriangle, Check, Info, MapPin, Calendar, Clock } from 'lucide-react';
import type { Language } from '@/types';

interface AnonymousReport {
  id?: string;
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  duration: string;
  location: {
    district: string;
    area: string;
    coordinates?: { lat: number; lng: number };
  };
  occupation: string;
  ageGroup: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  additionalInfo?: string;
  timestamp: Date;
  reportSource: 'web' | 'voice' | 'kiosk';
  isAnonymous: true;
}

interface AnonymousReportingProps {
  language: Language;
  initialLocation?: {
    district: string;
    area: string;
  };
  onReportSubmit?: (report: AnonymousReport) => void;
  isKioskMode?: boolean;
}

const AnonymousReporting: React.FC<AnonymousReportingProps> = ({
  language = 'en',
  initialLocation,
  onReportSubmit,
  isKioskMode = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [reportData, setReportData] = useState<Partial<AnonymousReport>>({
    symptoms: [],
    location: initialLocation || { district: '', area: '' },
    isAnonymous: true,
    reportSource: isKioskMode ? 'kiosk' : 'web'
  });
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [userConsent, setUserConsent] = useState(false);

  // Multilingual content
  const content = {
    en: {
      title: "Anonymous Health Report",
      subtitle: "Help protect your community's health while staying completely anonymous",
      privacyAssurance: "🔒 Your identity is never stored or tracked",
      steps: {
        consent: "Privacy & Consent",
        symptoms: "Symptoms",
        severity: "Severity",
        location: "General Area",
        demographics: "Basic Info",
        review: "Review & Submit"
      },
      consent: {
        title: "Complete Anonymity Guaranteed",
        points: [
          "No personal information is collected or stored",
          "Your IP address is not logged",
          "No tracking cookies or identifiers",
          "Data is aggregated for public health only",
          "Employers cannot access individual reports",
          "Government agencies cannot trace reports to individuals"
        ],
        agreement: "I understand and consent to anonymous health data collection",
        dataUse: "Your anonymous data helps:",
        benefits: [
          "Detect disease outbreaks early",
          "Improve healthcare services",
          "Protect migrant worker communities",
          "Guide public health policies"
        ]
      },
      symptoms: {
        title: "What symptoms are you experiencing?",
        subtitle: "Select all that apply",
        common: [
          { id: 'fever', name: 'Fever', icon: '🔥' },
          { id: 'cough', name: 'Cough', icon: '😷' },
          { id: 'headache', name: 'Headache', icon: '🤕' },
          { id: 'body_pain', name: 'Body Pain', icon: '💪' },
          { id: 'fatigue', name: 'Fatigue', icon: '😴' },
          { id: 'nausea', name: 'Nausea', icon: '🤢' },
          { id: 'diarrhea', name: 'Diarrhea', icon: '🚽' },
          { id: 'skin_issues', name: 'Skin Problems', icon: '🩹' },
          { id: 'breathing', name: 'Breathing Issues', icon: '🫁' },
          { id: 'stomach_pain', name: 'Stomach Pain', icon: '🤲' }
        ],
        other: "Other symptoms"
      },
      severity: {
        title: "How severe are your symptoms?",
        levels: [
          { id: 'mild', name: 'Mild', description: 'Manageable, daily activities mostly normal', color: 'bg-green-100 text-green-800' },
          { id: 'moderate', name: 'Moderate', description: 'Noticeable impact on daily activities', color: 'bg-yellow-100 text-yellow-800' },
          { id: 'severe', name: 'Severe', description: 'Significant difficulty with daily activities', color: 'bg-orange-100 text-orange-800' },
          { id: 'critical', name: 'Critical', description: 'Unable to perform daily activities, need immediate help', color: 'bg-red-100 text-red-800' }
        ]
      },
      location: {
        title: "General area (no specific address)",
        subtitle: "This helps track disease patterns in different regions",
        districtPlaceholder: "Select district",
        areaPlaceholder: "General area (e.g., Industrial zone, Residential area)",
        note: "We only collect general area information, not your exact location"
      },
      demographics: {
        title: "Basic information (optional)",
        subtitle: "This helps improve healthcare planning",
        occupation: "Type of work",
        occupations: [
          'Construction', 'Factory', 'Domestic', 'Agriculture', 
          'Fishing', 'Transportation', 'Restaurant/Hotel', 'Other'
        ],
        ageGroup: "Age group",
        ageGroups: ['18-25', '26-35', '36-45', '46-55', '55+'],
        gender: "Gender (optional)",
        genders: [
          { id: 'male', name: 'Male' },
          { id: 'female', name: 'Female' },
          { id: 'other', name: 'Other' },
          { id: 'prefer_not_to_say', name: 'Prefer not to say' }
        ],
        additionalInfo: "Any additional information (optional)"
      },
      duration: {
        title: "How long have you had these symptoms?",
        options: [
          'Less than 1 day',
          '1-3 days',
          '4-7 days',
          '1-2 weeks',
          'More than 2 weeks'
        ]
      },
      review: {
        title: "Review your anonymous report",
        subtitle: "Please confirm the information below",
        reportId: "Report ID",
        symptoms: "Symptoms",
        severity: "Severity",
        duration: "Duration",
        location: "General Area",
        demographics: "Demographics",
        submit: "Submit Anonymous Report",
        submitting: "Submitting...",
        success: "Report submitted successfully!",
        thankYou: "Thank you for helping protect community health"
      },
      buttons: {
        next: "Next",
        previous: "Previous",
        submit: "Submit Report",
        startOver: "Start Over"
      },
      validation: {
        selectSymptoms: "Please select at least one symptom",
        selectSeverity: "Please select severity level",
        selectDuration: "Please select duration",
        enterLocation: "Please enter general area information"
      }
    },
    hi: {
      title: "गुमनाम स्वास्थ्य रिपोर्ट",
      subtitle: "पूरी तरह से गुमनाम रहते हुए अपने समुदाय के स्वास्थ्य की रक्षा में मदद करें",
      privacyAssurance: "🔒 आपकी पहचान कभी भी स्टोर या ट्रैक नहीं की जाती"
    },
    ml: {
      title: "അജ്ഞാത ആരോഗ്യ റിപ്പോർട്ട്",
      subtitle: "പൂർണ്ണമായും അജ്ഞാതനായി തുടരുന്നതിനിടെ നിങ്ങളുടെ കമ്മ്യൂണിറ്റിയുടെ ആരോഗ്യം സംരക്ഷിക്കാൻ സഹായിക്കുക",
      privacyAssurance: "🔒 നിങ്ങളുടെ ഐഡന്റിറ്റി ഒരിക്കലും സംഭരിക്കുകയോ ട്രാക്ക് ചെയ്യുകയോ ചെയ്യില്ല"
    }
  };

  // Get current language content with fallback to English for missing properties
  const langContent = content[language as keyof typeof content];
  const currentContent = langContent && typeof langContent === 'object' && 'steps' in langContent 
    ? langContent 
    : content.en;

  const districts = [
    'thiruvananthapuram', 'kollam', 'pathanamthitta', 'alappuzha', 
    'kottayam', 'idukki', 'ernakulam', 'thrissur', 'palakkad', 
    'malappuram', 'kozhikode', 'wayanad', 'kannur', 'kasaragod'
  ];

  const steps = [
    'consent',
    'symptoms', 
    'severity',
    'duration',
    'location',
    'demographics',
    'review'
  ];

  useEffect(() => {
    // Generate a random report ID for tracking (not linked to user)
    if (!reportData.id) {
      setReportData(prev => ({
        ...prev,
        id: `ANM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      }));
    }
  }, []);

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const validateStep = (): boolean => {
    const step = steps[currentStep];
    
    switch (step) {
      case 'consent':
        return userConsent;
      case 'symptoms':
        return !!(reportData.symptoms && reportData.symptoms.length > 0);
      case 'severity':
        return !!reportData.severity;
      case 'duration':
        return !!reportData.duration;
      case 'location':
        return !!(reportData.location?.district && reportData.location?.area);
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    
    try {
      const finalReport: AnonymousReport = {
        ...reportData as AnonymousReport,
        timestamp: new Date(),
        isAnonymous: true
      };

      // Submit to Supabase (anonymously)
      const response = await fetch('/api/reports/anonymous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalReport)
      });

      if (response.ok) {
        setSubmitSuccess(true);
        onReportSubmit?.(finalReport);
        
        // Clear sensitive data from memory after submission
        setTimeout(() => {
          setReportData({});
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to submit anonymous report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const PrivacyInfoModal = () => (
    <AnimatePresence>
      {showPrivacyInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPrivacyInfo(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-8 max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="text-green-600" />
                Privacy Protection Details
              </h3>
              <button
                onClick={() => setShowPrivacyInfo(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-3">What We DON'T Collect:</h4>
                <ul className="space-y-2">
                  {[
                    'Your name, phone number, or any personal identifiers',
                    'Your exact address or GPS coordinates',
                    'Your IP address or device information',
                    'Any information that could identify you',
                    'Cookies or tracking pixels'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <EyeOff className="text-red-500 w-4 h-4 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-3">What We DO Collect:</h4>
                <ul className="space-y-2">
                  {[
                    'General symptoms and health status',
                    'Approximate area (district/region only)',
                    'Basic demographic categories',
                    'Symptom duration and severity',
                    'Type of work (general categories)'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Eye className="text-green-500 w-4 h-4 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">How This Helps:</h4>
                <ul className="text-green-700 space-y-1 text-sm">
                  <li>• Early detection of disease outbreaks</li>
                  <li>• Better healthcare resource allocation</li>
                  <li>• Protection of migrant worker communities</li>
                  <li>• Evidence-based public health policies</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (submitSuccess) {
    return (
      <div className={`max-w-2xl mx-auto p-6 ${isKioskMode ? 'text-xl' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900">
            {currentContent.review.success}
          </h2>
          
          <p className="text-xl text-gray-600">
            {currentContent.review.thankYou}
          </p>
          
          {reportData.id && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Report ID (for your reference):</p>
              <p className="font-mono text-lg font-bold">{reportData.id}</p>
            </div>
          )}
          
          <div className="space-y-4 text-left bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-900">Your report helps:</h3>
            <ul className="space-y-2 text-blue-800">
              <li>• Healthcare authorities monitor disease patterns</li>
              <li>• Improve services in your area</li>
              <li>• Protect other migrant workers</li>
              <li>• Allocate medical resources effectively</li>
            </ul>
          </div>
          
          <button
            onClick={() => {
              setCurrentStep(0);
              setReportData({ 
                symptoms: [], 
                location: initialLocation || { district: '', area: '' },
                isAnonymous: true,
                reportSource: isKioskMode ? 'kiosk' : 'web'
              });
              setSubmitSuccess(false);
              setUserConsent(false);
            }}
            className={`px-8 py-4 bg-kerala-teal text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors ${
              isKioskMode ? 'text-xl px-12 py-6' : ''
            }`}
          >
            {currentContent.buttons.startOver}
          </button>
        </motion.div>
      </div>
    );
  }

  const renderStep = () => {
    const step = steps[currentStep];
    
    switch (step) {
      case 'consent':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">{currentContent.consent.title}</h2>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-green-900 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy Guarantees:
              </h3>
              <ul className="space-y-2">
                {currentContent.consent.points.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-green-800">
                    <Check className="w-4 h-4 mt-1 text-green-600 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-blue-900">{currentContent.consent.dataUse}</h3>
              <ul className="space-y-1">
                {currentContent.consent.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-blue-800">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg">
              <input
                type="checkbox"
                id="consent"
                checked={userConsent}
                onChange={(e) => setUserConsent(e.target.checked)}
                className="w-5 h-5 text-kerala-teal rounded"
              />
              <label htmlFor="consent" className="font-medium text-gray-900 cursor-pointer">
                {currentContent.consent.agreement}
              </label>
            </div>

            <button
              onClick={() => setShowPrivacyInfo(true)}
              className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
            >
              <Info className="w-4 h-4" />
              View detailed privacy information
            </button>
          </div>
        );

      case 'symptoms':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{currentContent.symptoms.title}</h2>
              <p className="text-gray-600">{currentContent.symptoms.subtitle}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {currentContent.symptoms.common.map((symptom) => (
                <motion.button
                  key={symptom.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const symptoms = reportData.symptoms || [];
                    if (symptoms.includes(symptom.id)) {
                      setReportData(prev => ({
                        ...prev,
                        symptoms: symptoms.filter(s => s !== symptom.id)
                      }));
                    } else {
                      setReportData(prev => ({
                        ...prev,
                        symptoms: [...symptoms, symptom.id]
                      }));
                    }
                  }}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    reportData.symptoms?.includes(symptom.id)
                      ? 'border-kerala-teal bg-teal-50 text-kerala-teal'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${isKioskMode ? 'p-6 text-lg' : ''}`}
                >
                  <div className="text-3xl mb-2">{symptom.icon}</div>
                  <div className="font-medium">{symptom.name}</div>
                </motion.button>
              ))}
            </div>

            {reportData.symptoms && reportData.symptoms.length === 0 && (
              <p className="text-red-600 text-center">{currentContent.validation.selectSymptoms}</p>
            )}
          </div>
        );

      case 'severity':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{currentContent.severity.title}</h2>
            </div>

            <div className="space-y-4">
              {currentContent.severity.levels.map((level) => (
                <motion.button
                  key={level.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setReportData(prev => ({ ...prev, severity: level.id as any }))}
                  className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                    reportData.severity === level.id
                      ? 'border-kerala-teal bg-teal-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${isKioskMode ? 'p-8 text-lg' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-lg ${level.color} font-semibold`}>
                      {level.name}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700">{level.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'duration':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{currentContent.duration.title}</h2>
            </div>

            <div className="space-y-3">
              {currentContent.duration.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setReportData(prev => ({ ...prev, duration: option }))}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    reportData.duration === option
                      ? 'border-kerala-teal bg-teal-50 text-kerala-teal'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${isKioskMode ? 'p-6 text-lg' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{currentContent.location.title}</h2>
              <p className="text-gray-600">{currentContent.location.subtitle}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  District
                </label>
                <select
                  value={reportData.location?.district || ''}
                  onChange={(e) => setReportData(prev => ({
                    ...prev,
                    location: { ...prev.location, district: e.target.value, area: prev.location?.area || '' }
                  }))}
                  className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-kerala-teal focus:border-transparent ${
                    isKioskMode ? 'text-lg p-4' : ''
                  }`}
                >
                  <option value="">{currentContent.location.districtPlaceholder}</option>
                  {districts.map(district => (
                    <option key={district} value={district}>
                      {district.charAt(0).toUpperCase() + district.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  General Area
                </label>
                <input
                  type="text"
                  placeholder={currentContent.location.areaPlaceholder}
                  value={reportData.location?.area || ''}
                  onChange={(e) => setReportData(prev => ({
                    ...prev,
                    location: { ...prev.location, area: e.target.value, district: prev.location?.district || '' }
                  }))}
                  className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-kerala-teal focus:border-transparent ${
                    isKioskMode ? 'text-lg p-4' : ''
                  }`}
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-800 text-sm">
                  {currentContent.location.note}
                </p>
              </div>
            </div>
          </div>
        );

      case 'demographics':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{currentContent.demographics.title}</h2>
              <p className="text-gray-600">{currentContent.demographics.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentContent.demographics.occupation}
                </label>
                <select
                  value={reportData.occupation || ''}
                  onChange={(e) => setReportData(prev => ({ ...prev, occupation: e.target.value }))}
                  className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-kerala-teal focus:border-transparent ${
                    isKioskMode ? 'text-lg p-4' : ''
                  }`}
                >
                  <option value="">Select occupation</option>
                  {currentContent.demographics.occupations.map(occ => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentContent.demographics.ageGroup}
                </label>
                <select
                  value={reportData.ageGroup || ''}
                  onChange={(e) => setReportData(prev => ({ ...prev, ageGroup: e.target.value }))}
                  className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-kerala-teal focus:border-transparent ${
                    isKioskMode ? 'text-lg p-4' : ''
                  }`}
                >
                  <option value="">Select age group</option>
                  {currentContent.demographics.ageGroups.map(age => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {currentContent.demographics.gender}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {currentContent.demographics.genders.map(gender => (
                  <button
                    key={gender.id}
                    onClick={() => setReportData(prev => ({ ...prev, gender: gender.id as any }))}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      reportData.gender === gender.id
                        ? 'border-kerala-teal bg-teal-50 text-kerala-teal'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${isKioskMode ? 'p-4 text-lg' : ''}`}
                  >
                    {gender.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {currentContent.demographics.additionalInfo}
              </label>
              <textarea
                placeholder="Any additional information that might be helpful..."
                value={reportData.additionalInfo || ''}
                onChange={(e) => setReportData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                rows={3}
                className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-kerala-teal focus:border-transparent ${
                  isKioskMode ? 'text-lg p-4' : ''
                }`}
              />
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{currentContent.review.title}</h2>
              <p className="text-gray-600">{currentContent.review.subtitle}</p>
            </div>

            {reportData.id && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{currentContent.review.reportId}:</p>
                <p className="font-mono text-lg font-bold">{reportData.id}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{currentContent.review.symptoms}:</h3>
                <div className="flex flex-wrap gap-2">
                  {reportData.symptoms?.map(symptom => {
                    const symptomData = currentContent.symptoms.common.find(s => s.id === symptom);
                    return (
                      <span key={symptom} className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
                        {symptomData?.icon} {symptomData?.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{currentContent.review.severity}:</h3>
                <div className="flex items-center gap-2">
                  {reportData.severity && (
                    <span className={`px-4 py-2 rounded-lg font-semibold ${
                      currentContent.severity.levels.find(l => l.id === reportData.severity)?.color
                    }`}>
                      {currentContent.severity.levels.find(l => l.id === reportData.severity)?.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{currentContent.review.duration}:</h3>
                <p className="text-gray-700">{reportData.duration}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{currentContent.review.location}:</h3>
                <p className="text-gray-700">
                  {reportData.location?.area}, {reportData.location?.district}
                </p>
              </div>

              {(reportData.occupation || reportData.ageGroup || reportData.gender) && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{currentContent.review.demographics}:</h3>
                  <div className="space-y-1 text-gray-700">
                    {reportData.occupation && <p>Work: {reportData.occupation}</p>}
                    {reportData.ageGroup && <p>Age: {reportData.ageGroup}</p>}
                    {reportData.gender && <p>Gender: {reportData.gender}</p>}
                  </div>
                </div>
              )}

              {reportData.additionalInfo && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Additional Information:</h3>
                  <p className="text-gray-700">{reportData.additionalInfo}</p>
                </div>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex gap-2">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Complete Anonymity Guaranteed</p>
                  <p className="text-green-700 text-sm mt-1">
                    This report cannot be traced back to you. Your identity remains completely protected.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full bg-kerala-teal text-white px-6 py-4 rounded-xl font-semibold hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors ${
                isKioskMode ? 'text-xl py-6' : ''
              }`}
            >
              {isSubmitting ? currentContent.review.submitting : currentContent.review.submit}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`max-w-3xl mx-auto ${isKioskMode ? 'p-8' : 'p-6'}`}>
      <PrivacyInfoModal />
      
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <h1 className={`font-bold text-gray-900 ${isKioskMode ? 'text-4xl' : 'text-3xl'}`}>
          {currentContent.title}
        </h1>
        <p className={`text-gray-600 ${isKioskMode ? 'text-xl' : 'text-lg'}`}>
          {currentContent.subtitle}
        </p>
        <div className={`text-green-600 font-medium ${isKioskMode ? 'text-lg' : ''}`}>
          {currentContent.privacyAssurance}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index < currentStep ? 'bg-green-600 text-white' :
                index === currentStep ? 'bg-kerala-teal text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <span className="text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}: {currentContent.steps[steps[currentStep] as keyof typeof currentContent.steps] || steps[currentStep]}
          </span>
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
        {renderStep()}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={`px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
            isKioskMode ? 'text-lg px-8 py-4' : ''
          }`}
        >
          {currentContent.buttons.previous}
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={!validateStep()}
            className={`px-6 py-3 bg-kerala-teal text-white rounded-xl font-medium hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed ${
              isKioskMode ? 'text-lg px-8 py-4' : ''
            }`}
          >
            {currentContent.buttons.next}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default AnonymousReporting;