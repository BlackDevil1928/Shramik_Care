'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from '@/components/ui/LanguageSelector';
import SymptomChecker from '@/components/forms/SymptomChecker';
import VoiceInterface from '@/components/voice/VoiceInterface';
import QRCodeManager from '@/components/ui/QRCodeManager';
import type { Language } from '@/types';

interface KioskInterfaceProps {
  location?: {
    type: 'bus_station' | 'labor_camp' | 'hospital' | 'mobile_unit';
    name: string;
    district: string;
  };
}

type KioskMode = 'home' | 'language' | 'register' | 'symptoms' | 'scan_qr' | 'help' | 'emergency';

const KioskInterface: React.FC<KioskInterfaceProps> = ({
  location = { type: 'bus_station', name: 'Main Bus Station', district: 'ernakulam' }
}) => {
  const [currentMode, setCurrentMode] = useState<KioskMode>('home');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [isVoiceGuideActive, setIsVoiceGuideActive] = useState(false);
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null);
  const [showAttractMode, setShowAttractMode] = useState(false);

  const speechSynthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  // Multilingual content for kiosk
  const kioskContent = {
    en: {
      welcome: "Welcome to Kerala Health Kiosk",
      subtitle: "Free healthcare assistance for migrant workers",
      locationInfo: `Located at ${location.name}, ${location.district}`,
      buttons: {
        register: "📞 Register for Health ID",
        symptoms: "🩺 Check Your Symptoms",
        scanQr: "📱 Scan Health ID",
        language: "🌍 Change Language",
        help: "❓ Get Help",
        emergency: "🚨 EMERGENCY"
      },
      instructions: {
        register: "Create your digital health record with voice",
        symptoms: "Check symptoms and get health advice",
        scanQr: "Scan your health ID QR code",
        language: "Choose your preferred language",
        help: "Get assistance using this system",
        emergency: "Call emergency services immediately"
      },
      attractMode: {
        line1: "Free Health Services",
        line2: "Tap screen to start",
        line3: "Available in 7 languages"
      },
      accessibility: {
        voiceGuide: "Voice guidance available",
        touchToStart: "Touch anywhere to start",
        emergencyOnly: "For emergencies only"
      }
    },
    hi: {
      welcome: "केरल स्वास्थ्य कियोस्क में आपका स्वागत है",
      subtitle: "प्रवासी श्रमिकों के लिए मुफ्त स्वास्थ्य सहायता",
      locationInfo: `${location.name}, ${location.district} में स्थित`,
      buttons: {
        register: "📞 स्वास्थ्य आईडी के लिए पंजीकरण",
        symptoms: "🩺 अपने लक्षणों की जांच करें",
        scanQr: "📱 स्वास्थ्य आईडी स्कैन करें",
        language: "🌍 भाषा बदलें",
        help: "❓ सहायता पाएं",
        emergency: "🚨 आपातकाल"
      },
      instructions: {
        register: "आवाज के साथ अपना डिजिटल स्वास्थ्य रिकॉर्ड बनाएं",
        symptoms: "लक्षणों की जांच करें और स्वास्थ्य सलाह पाएं",
        scanQr: "अपना स्वास्थ्य आईडी QR कोड स्कैन करें",
        language: "अपनी पसंदीदा भाषा चुनें",
        help: "इस सिस्टम का उपयोग करने में सहायता पाएं",
        emergency: "तुरंत आपातकालीन सेवाओं को कॉल करें"
      },
      attractMode: {
        line1: "मुफ्त स्वास्थ्य सेवाएं",
        line2: "शुरू करने के लिए स्क्रीन टैप करें",
        line3: "7 भाषाओं में उपलब्ध"
      },
      accessibility: {
        voiceGuide: "आवाज गाइड उपलब्ध",
        touchToStart: "शुरू करने के लिए कहीं भी स्पर्श करें",
        emergencyOnly: "केवल आपातकाल के लिए"
      }
    },
    ml: {
      welcome: "കേരള ഹെൽത്ത് കിയോസ്കിലേക്ക് സ്വാഗതം",
      subtitle: "കുടിയേറ്റ തൊഴിലാളികൾക്കുള്ള സൗജന്യ ആരോഗ്യ സഹായം",
      locationInfo: `${location.name}, ${location.district} ൽ സ്ഥിതി ചെയ്യുന്നു`,
      buttons: {
        register: "📞 ഹെൽത്ത് ഐഡിക്കായി രജിസ്റ്റർ ചെയ്യുക",
        symptoms: "🩺 നിങ്ങളുടെ ലക്ഷണങ്ങൾ പരിശോധിക്കുക",
        scanQr: "📱 ഹെൽത്ത് ഐഡി സ്കാൻ ചെയ്യുക",
        language: "🌍 ഭാഷ മാറ്റുക",
        help: "❓ സഹായം നേടുക",
        emergency: "🚨 അത്യാഹിതം"
      },
      instructions: {
        register: "വോയ്സ് ഉപയോഗിച്ച് നിങ്ങളുടെ ഡിജിറ്റൽ ഹെൽത്ത് റെക്കോർഡ് സൃഷ്ടിക്കുക",
        symptoms: "ലക്ഷണങ്ങൾ പരിശോധിക്കുകയും ആരോഗ്യ ഉപദേശം നേടുകയും ചെയ്യുക",
        scanQr: "നിങ്ങളുടെ ഹെൽത്ത് ഐഡി QR കോഡ് സ്കാൻ ചെയ്യുക",
        language: "നിങ്ങളുടെ ഇഷ്ടമുള്ള ഭാഷ തിരഞ്ഞെടുക്കുക",
        help: "ഈ സിസ്റ്റം ഉപയോഗിക്കുന്നതിന് സഹായം നേടുക",
        emergency: "ഉടനടി എമർജൻസി സേവനങ്ങളിലേക്ക് വിളിക്കുക"
      },
      attractMode: {
        line1: "സൗജന്യ ആരോഗ്യ സേവനങ്ങൾ",
        line2: "ആരംഭിക്കാൻ സ്ക്രീൻ ടാപ്പ് ചെയ്യുക",
        line3: "7 ഭാഷകളിൽ ലഭ്യം"
      },
      accessibility: {
        voiceGuide: "വോയ്സ് ഗൈഡൻസ് ലഭ്യമാണ്",
        touchToStart: "ആരംഭിക്കാൻ എവിടെയെങ്കിലും സ്പർശിക്കുക",
        emergencyOnly: "അത്യാഹിതത്തിന് മാത്രം"
      }
    }
  };

  const currentContent = kioskContent[selectedLanguage as keyof typeof kioskContent] || kioskContent.en;

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== 'undefined') {
      speechSynthRef.current = window.speechSynthesis;
    }

    // Set up idle timer for attract mode
    resetIdleTimer();

    // Start attract mode after 30 seconds of inactivity
    const attractTimer = setTimeout(() => {
      if (currentMode === 'home') {
        setShowAttractMode(true);
      }
    }, 30000);

    return () => {
      clearTimeout(attractTimer);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [currentMode]);

  const resetIdleTimer = () => {
    if (idleTimer) clearTimeout(idleTimer);
    
    const timer = setTimeout(() => {
      // Return to home screen after 2 minutes of inactivity
      setCurrentMode('home');
      setShowAttractMode(true);
      stopVoiceGuide();
    }, 120000);
    
    setIdleTimer(timer);
  };

  const handleUserInteraction = () => {
    setShowAttractMode(false);
    resetIdleTimer();
  };

  const speakText = (text: string, language: Language = selectedLanguage) => {
    if (!speechSynthRef.current) return;

    // Stop any current speech
    speechSynthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageCode(language);
    utterance.rate = 0.8;
    utterance.volume = 0.9;

    currentUtterance.current = utterance;
    speechSynthRef.current.speak(utterance);
  };

  const stopVoiceGuide = () => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
    }
    setIsVoiceGuideActive(false);
  };

  const getLanguageCode = (lang: Language): string => {
    const codes = {
      en: 'en-US', hi: 'hi-IN', bn: 'bn-BD',
      or: 'hi-IN', ta: 'ta-IN', ne: 'ne-NP', ml: 'ml-IN'
    };
    return codes[lang] || 'en-US';
  };

  const handleModeChange = (mode: KioskMode) => {
    handleUserInteraction();
    setCurrentMode(mode);
    
    // Provide voice feedback for the selected option
    const modeTexts = {
      register: currentContent.instructions.register,
      symptoms: currentContent.instructions.symptoms,
      scanQr: currentContent.instructions.scanQr,
      language: currentContent.instructions.language,
      help: currentContent.instructions.help,
      emergency: currentContent.instructions.emergency
    };
    
    if (modeTexts[mode as keyof typeof modeTexts]) {
      speakText(modeTexts[mode as keyof typeof modeTexts]);
    }
  };

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    handleUserInteraction();
    setCurrentMode('home');
  };

  const handleEmergencyCall = () => {
    handleUserInteraction();
    speakText("Calling emergency services 108", selectedLanguage);
    
    // In a real kiosk, this would trigger an actual call
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.open('tel:108', '_self');
      }
    }, 2000);
  };

  const KioskButton = ({ 
    icon, 
    title, 
    description, 
    onClick, 
    color = 'bg-kerala-teal',
    textColor = 'text-white',
    isEmergency = false 
  }: {
    icon: string;
    title: string;
    description: string;
    onClick: () => void;
    color?: string;
    textColor?: string;
    isEmergency?: boolean;
  }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        handleUserInteraction();
        onClick();
      }}
      className={`${color} ${textColor} p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 text-center min-h-[200px] flex flex-col justify-center items-center space-y-4 ${
        isEmergency ? 'animate-pulse border-4 border-red-300' : ''
      }`}
      onMouseEnter={() => speakText(description)}
    >
      <div className="text-6xl mb-4">{icon.split(' ')[0]}</div>
      <div className="text-2xl font-bold leading-tight">{title}</div>
      <div className="text-lg opacity-90 leading-snug">{description}</div>
    </motion.button>
  );

  const renderContent = () => {
    switch (currentMode) {
      case 'home':
        return (
          <div className="space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <h1 className="text-5xl font-bold text-gray-900">
                {currentContent.welcome}
              </h1>
              <p className="text-2xl text-gray-700">
                {currentContent.subtitle}
              </p>
              <p className="text-lg text-kerala-teal">
                {currentContent.locationInfo}
              </p>
            </motion.div>

            {/* Main Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <KioskButton
                icon={currentContent.buttons.register}
                title={currentContent.buttons.register.substring(2)}
                description={currentContent.instructions.register}
                onClick={() => handleModeChange('register')}
                color="bg-kerala-teal"
              />

              <KioskButton
                icon={currentContent.buttons.symptoms}
                title={currentContent.buttons.symptoms.substring(2)}
                description={currentContent.instructions.symptoms}
                onClick={() => handleModeChange('symptoms')}
                color="bg-neon-blue"
              />

              <KioskButton
                icon={currentContent.buttons.scanQr}
                title={currentContent.buttons.scanQr.substring(2)}
                description={currentContent.instructions.scanQr}
                onClick={() => handleModeChange('scan_qr')}
                color="bg-health-green"
              />

              <KioskButton
                icon={currentContent.buttons.language}
                title={currentContent.buttons.language.substring(2)}
                description={currentContent.instructions.language}
                onClick={() => handleModeChange('language')}
                color="bg-purple-600"
              />

              <KioskButton
                icon={currentContent.buttons.help}
                title={currentContent.buttons.help.substring(2)}
                description={currentContent.instructions.help}
                onClick={() => handleModeChange('help')}
                color="bg-warning-orange"
              />

              <KioskButton
                icon={currentContent.buttons.emergency}
                title={currentContent.buttons.emergency.substring(2)}
                description={currentContent.instructions.emergency}
                onClick={handleEmergencyCall}
                color="bg-error-red"
                isEmergency
              />
            </div>

            {/* Voice Guide Toggle */}
            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsVoiceGuideActive(!isVoiceGuideActive);
                  if (!isVoiceGuideActive) {
                    speakText(currentContent.welcome + ". " + currentContent.subtitle);
                  } else {
                    stopVoiceGuide();
                  }
                }}
                className={`px-8 py-4 rounded-full font-semibold text-xl shadow-lg transition-all duration-300 ${
                  isVoiceGuideActive 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {isVoiceGuideActive ? '🔊 Voice Guide ON' : '🔇 Enable Voice Guide'}
              </motion.button>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">Choose Your Language</h2>
              <p className="text-xl text-gray-600">Select your preferred language</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <LanguageSelector
                currentLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
                className="w-full"
              />
            </div>

            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentMode('home')}
                className="px-8 py-4 bg-gray-600 text-white rounded-xl font-semibold text-xl"
              >
                ← Back to Home
              </motion.button>
            </div>
          </div>
        );

      case 'register':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">Voice Registration</h2>
              <p className="text-xl text-gray-600">Create your digital health record</p>
            </div>

            <VoiceInterface
              language={selectedLanguage}
              isKioskMode
              onHealthRecordCreated={(record) => {
                console.log('Health record created:', record);
                // Could show success screen or return to home
                setTimeout(() => setCurrentMode('home'), 5000);
              }}
            />

            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentMode('home')}
                className="px-8 py-4 bg-gray-600 text-white rounded-xl font-semibold text-xl"
              >
                ← Back to Home
              </motion.button>
            </div>
          </div>
        );

      case 'symptoms':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">Symptom Checker</h2>
              <p className="text-xl text-gray-600">Check your symptoms and get advice</p>
            </div>

            <SymptomChecker
              language={selectedLanguage}
              isKioskMode
              onSymptomReportSubmit={(report) => {
                console.log('Symptom report submitted:', report);
                // Could show results or return to home
              }}
            />

            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentMode('home')}
                className="px-8 py-4 bg-gray-600 text-white rounded-xl font-semibold text-xl"
              >
                ← Back to Home
              </motion.button>
            </div>
          </div>
        );

      case 'scan_qr':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">Scan Health ID</h2>
              <p className="text-xl text-gray-600">Position your QR code in the camera</p>
            </div>

            <QRCodeManager
              mode="scan"
              onScanSuccess={(mhiId) => {
                speakText(`Health ID ${mhiId} scanned successfully`);
                // Could show worker details or health records
              }}
              onScanError={(error) => {
                speakText("QR code scan failed. Please try again.");
              }}
            />

            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentMode('home')}
                className="px-8 py-4 bg-gray-600 text-white rounded-xl font-semibold text-xl"
              >
                ← Back to Home
              </motion.button>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">Help & Instructions</h2>
              <p className="text-xl text-gray-600">How to use this health kiosk</p>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="health-card p-8">
                <div className="text-6xl mb-4 text-center">📞</div>
                <h3 className="text-2xl font-bold mb-4">Voice Registration</h3>
                <ul className="space-y-2 text-lg">
                  <li>• Tap the microphone button</li>
                  <li>• Speak clearly in your language</li>
                  <li>• Answer questions about your health</li>
                  <li>• Receive your Health ID via SMS</li>
                </ul>
              </div>

              <div className="health-card p-8">
                <div className="text-6xl mb-4 text-center">🩺</div>
                <h3 className="text-2xl font-bold mb-4">Symptom Checker</h3>
                <ul className="space-y-2 text-lg">
                  <li>• Select your symptoms on screen</li>
                  <li>• Or describe them using voice</li>
                  <li>• Get health recommendations</li>
                  <li>• Know when to see a doctor</li>
                </ul>
              </div>

              <div className="health-card p-8">
                <div className="text-6xl mb-4 text-center">📱</div>
                <h3 className="text-2xl font-bold mb-4">Scan Health ID</h3>
                <ul className="space-y-2 text-lg">
                  <li>• Show your QR code to camera</li>
                  <li>• Access your health records</li>
                  <li>• Share with healthcare providers</li>
                  <li>• Update your information</li>
                </ul>
              </div>

              <div className="health-card p-8">
                <div className="text-6xl mb-4 text-center">🚨</div>
                <h3 className="text-2xl font-bold mb-4">Emergency</h3>
                <ul className="space-y-2 text-lg">
                  <li>• Press red emergency button</li>
                  <li>• Automatically calls 108</li>
                  <li>• Available 24/7</li>
                  <li>• For life-threatening situations</li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentMode('home')}
                className="px-8 py-4 bg-kerala-teal text-white rounded-xl font-semibold text-xl"
              >
                ← Back to Home
              </motion.button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 kiosk-mode"
      onClick={handleUserInteraction}
    >
      {/* Attract Mode Overlay */}
      <AnimatePresence>
        {showAttractMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-kerala-teal bg-opacity-95 z-50 flex items-center justify-center text-white text-center"
            onClick={() => {
              setShowAttractMode(false);
              speakText(currentContent.welcome);
            }}
          >
            <div className="space-y-8">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl mb-8"
              >
                🏥
              </motion.div>
              
              <div className="space-y-4">
                <h1 className="text-6xl font-bold">
                  {currentContent.attractMode.line1}
                </h1>
                <p className="text-4xl">
                  {currentContent.attractMode.line2}
                </p>
                <p className="text-2xl opacity-80">
                  {currentContent.attractMode.line3}
                </p>
              </div>

              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-3xl mt-12"
              >
                👆 {currentContent.accessibility.touchToStart}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container mx-auto px-8 py-12">
        {/* Header Info */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-left">
            <div className="text-lg text-gray-600">Kerala Health Kiosk</div>
            <div className="text-2xl font-bold text-kerala-teal">
              {location.name}, {location.district}
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg text-gray-600">
              Current Language: {selectedLanguage.toUpperCase()}
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleString()}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <motion.div
          key={currentMode}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white bg-opacity-90 p-4 border-t border-gray-200">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>🔊 {currentContent.accessibility.voiceGuide}</span>
              <span>• Available 24/7</span>
              <span>• Free Service</span>
            </div>
            
            <div className="text-sm text-gray-600">
              Emergency: 108 | Health Helpline: 104
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KioskInterface;