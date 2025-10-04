'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VoiceInterface from '@/components/voice/VoiceInterface';
import Navigation from '@/components/ui/Navigation';
import RealKeralaMap from '@/components/maps/RealKeralaMap';
import HealthStats from '@/components/dashboard/HealthStats';
import type { Language } from '@/types';

const HomePage = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [isKioskMode, setIsKioskMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Detect if we're in kiosk mode (larger screen, specific URL param, etc.)
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'kiosk') {
      setIsKioskMode(true);
      document.body.classList.add('kiosk-mode');
    }

    // Auto-detect language based on browser or location
    const browserLang = navigator.language.split('-')[0] as Language;
    if (['hi', 'bn', 'or', 'ta', 'ne', 'ml'].includes(browserLang)) {
      setCurrentLanguage(browserLang);
    }
  }, []);

  const translations = {
    en: {
      title: "Kerala Migrant Health System",
      subtitle: "Voice-First Digital Health Records for Migrant Workers",
      description: "Register your health information through voice calls in your language. Get instant Migrant Health ID (MHI) and access to healthcare services across Kerala.",
      callToAction: "📞 Call Now to Register",
      emergencyContact: "🚨 Emergency: Call 108",
      features: {
        voice: "Multi-language Voice AI",
        qr: "Digital Health ID with QR",
        map: "Real-time Disease Surveillance",
        anonymous: "Anonymous Health Reporting"
      },
      voicePrompt: "Click the microphone and speak in your language",
      phoneNumber: "+91-XXX-HEALTH (432584)",
      sdgTitle: "Supporting UN Sustainable Development Goals",
      sdgGoals: ["Good Health & Well-being", "Reduced Inequalities", "Sustainable Communities"]
    },
    hi: {
      title: "केरल प्रवासी स्वास्थ्य प्रणाली",
      subtitle: "प्रवासी श्रमिकों के लिए आवाज-पहली डिजिटल स्वास्थ्य रिकॉर्ड",
      description: "अपनी भाषा में वॉयस कॉल के माध्यम से अपनी स्वास्थ्य जानकारी दर्ज करें। तुरंत प्रवासी स्वास्थ्य आईडी (MHI) प्राप्त करें और केरल में स्वास्थ्य सेवाओं तक पहुंच पाएं।",
      callToAction: "📞 पंजीकरण के लिए अभी कॉल करें",
      emergencyContact: "🚨 आपातकाल: 108 पर कॉल करें",
      features: {
        voice: "बहु-भाषी वॉयस एआई",
        qr: "क्यूआर के साथ डिजिटल स्वास्थ्य आईडी",
        map: "वास्तविक समय रोग निगरानी",
        anonymous: "अनाम स्वास्थ्य रिपोर्टिंग"
      },
      voicePrompt: "माइक्रोफोन पर क्लिक करें और अपनी भाषा में बोलें",
      phoneNumber: "+91-XXX-HEALTH (432584)",
      sdgTitle: "संयुक्त राष्ट्र सतत विकास लक्ष्यों का समर्थन",
      sdgGoals: ["अच्छा स्वास्थ्य और कल्याण", "कम असमानताएं", "टिकाऊ समुदाय"]
    },
    ml: {
      title: "കേരള കുടിയേറ്റ ആരോഗ്യ സിസ്റ്റം",
      subtitle: "കുടിയേറ്റ തൊഴിലാളികൾക്കുള്ള വോയ്സ്-ഫസ്റ്റ് ഡിജിറ്റൽ ആരോഗ്യ റെക്കോർഡുകൾ",
      description: "നിങ്ങളുടെ ഭാഷയിൽ വോയ്സ് കോളുകൾ വഴി നിങ്ങളുടെ ആരോഗ്യ വിവരങ്ങൾ രജിസ്റ്റർ ചെയ്യുക. തൽക്ഷണം മൈഗ്രന്റ് ഹെൽത്ത് ഐഡി (MHI) നേടുകയും കേരളത്തിലുടനീളം ആരോഗ്യ സേവനങ്ങൾ ആക്സസ് ചെയ്യുകയും ചെയ്യുക.",
      callToAction: "📞 രജിസ്റ്റർ ചെയ്യാൻ ഇപ്പോൾ വിളിക്കൂ",
      emergencyContact: "🚨 അത്യാഹിതം: 108 ൽ വിളിക്കൂ",
      features: {
        voice: "മൾട്ടി-ലാംഗ്വേജ് വോയ്സ് AI",
        qr: "QR ഉള്ള ഡിജിറ്റൽ ഹെൽത്ത് ഐഡി",
        map: "തത്സമയ രോഗ നിരീക്ഷണം",
        anonymous: "അജ്ഞാത ആരോഗ്യ റിപ്പോർട്ടിംഗ്"
      },
      voicePrompt: "മൈക്രോഫോണിൽ ക്ലിക്ക് ചെയ്യുകയും നിങ്ങളുടെ ഭാഷയിൽ സംസാരിക്കുകയും ചെയ്യുക",
      phoneNumber: "+91-XXX-HEALTH (432584)",
      sdgTitle: "യുഎൻ സസ്റ്റെയിനബിൾ ഡെവലപ്മെന്റ് ഗോളുകളെ പിന്തുണയ്ക്കുന്നു",
      sdgGoals: ["നല്ല ആരോഗ്യവും ക്ഷേമവും", "കുറഞ്ഞ അസമത്വങ്ങൾ", "സുസ്ഥിര കമ്മ്യൂണിറ്റികൾ"]
    }
  };

  const currentTranslation = translations[currentLanguage as keyof typeof translations] || translations.en;

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-kerala-teal to-neon-blue">
        <div className="text-white text-2xl animate-pulse">
          Loading Kerala Health System...
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isKioskMode ? 'kiosk-mode' : ''}`}>
      {/* Navigation */}
      <Navigation 
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />

      {/* Hero Section */}
      <section className="relative px-4 md:px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  {currentTranslation.title}
                </h1>
                <h2 className="text-xl md:text-2xl text-gray-700 font-medium">
                  {currentTranslation.subtitle}
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {currentTranslation.description}
                </p>
              </div>

              {/* Main CTA Buttons */}
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto bg-gradient-to-r from-kerala-teal to-neon-blue text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-neon text-lg"
                  onClick={() => window.open('tel:+91XXXHEALTH', '_self')}
                >
                  {currentTranslation.callToAction}
                </motion.button>

                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-500 mb-2">
                    {currentTranslation.voicePrompt}
                  </p>
                  <p className="text-2xl font-mono text-kerala-teal font-bold">
                    {currentTranslation.phoneNumber}
                  </p>
                </div>
              </div>

              {/* Voice Interface Component */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <VoiceInterface 
                  language={currentLanguage}
                  onHealthRecordCreated={(record) => {
                    console.log('Health record created:', record);
                    // Handle success - show MHI, redirect, etc.
                  }}
                />
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 pt-6">
                {Object.entries(currentTranslation.features).map(([key, value], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="health-card p-4 text-center"
                  >
                    <div className="text-2xl mb-2">
                      {key === 'voice' && '🎤'}
                      {key === 'qr' && '📱'}
                      {key === 'map' && '🗺️'}
                      {key === 'anonymous' && '🔒'}
                    </div>
                    <p className="text-sm font-medium text-gray-700">{value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Column - 3D Kerala Globe */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="map-container aspect-square max-w-lg mx-auto">
                <RealKeralaMap />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Health Statistics Section */}
      <section className="px-4 md:px-6 py-12 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <HealthStats />
          </motion.div>
        </div>
      </section>

      {/* UN SDG Section */}
      <section className="px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-6"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
              {currentTranslation.sdgTitle}
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              {currentTranslation.sdgGoals.map((goal, index) => (
                <div key={index} className="health-card p-6">
                  <div className="text-4xl mb-4">
                    {index === 0 && '🏥'}
                    {index === 1 && '⚖️'}
                    {index === 2 && '🌱'}
                  </div>
                  <p className="font-semibold text-gray-800">{goal}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Emergency Contacts</h4>
              <ul className="space-y-2 text-sm">
                <li>🚨 Emergency: 108</li>
                <li>🏥 Health Helpline: 104</li>
                <li>👮 Police: 100</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>📞 Voice Support: 24/7</li>
                <li>💬 Multi-language Help</li>
                <li>🔒 Privacy Protected</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Government of Kerala</h4>
              <p className="text-sm">
                Health Service Department<br />
                Thiruvananthapuram, Kerala<br />
                India - 695001
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Government of Kerala. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;