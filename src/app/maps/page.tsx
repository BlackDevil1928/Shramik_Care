'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/ui/Navigation';
import RealKeralaMap from '@/components/maps/RealKeralaMap';
import { KERALA_DISTRICTS, CURRENT_DISEASE_HOTSPOTS, KERALA_STATS } from '@/data/kerala-geography';
import type { Language } from '@/types';

const MapsPage = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);
  const [selectedView, setSelectedView] = useState<'3d' | 'data'>('3d');

  useEffect(() => {
    setMounted(true);
  }, []);

  const translations: Record<Language, {
    title: string;
    subtitle: string;
    view3D: string;
    viewData: string;
    activeOutbreaks: string;
    healthFacilities: string;
    migrantWorkers: string;
    criticalAlerts: string;
  }> = {
    en: {
      title: "Kerala Health Surveillance Map",
      subtitle: "Real-time disease monitoring and health analytics for Kerala",
      view3D: "3D Interactive Map",
      viewData: "Live Health Data",
      activeOutbreaks: "Active Disease Outbreaks",
      healthFacilities: "Health Facilities",
      migrantWorkers: "Migrant Workers Registered",
      criticalAlerts: "Critical Health Alerts"
    },
    hi: {
      title: "केरल स्वास्थ्य निगरानी मानचित्र",
      subtitle: "केरल के लिए वास्तविक समय रोग निगरानी और स्वास्थ्य विश्लेषण",
      view3D: "3डी इंटरैक्टिव मैप",
      viewData: "लाइव स्वास्थ्य डेटा",
      activeOutbreaks: "सक्रिय रोग प्रकोप",
      healthFacilities: "स्वास्थ्य सुविधाएं",
      migrantWorkers: "पंजीकृत प्रवासी श्रमिक",
      criticalAlerts: "गंभीर स्वास्थ्य चेतावनी"
    },
    ml: {
      title: "കേരള ആരോഗ്യ നിരീക്ഷണ മാപ്പ്",
      subtitle: "കേരളത്തിനായുള്ള തത്സമയ രോഗ നിരീക്ഷണവും ആരോഗ്യ വിശകലനവും",
      view3D: "3D ഇന്റരാക്ടീവ് മാപ്പ്",
      viewData: "തത്സമയ ആരോഗ്യ ഡാറ്റ",
      activeOutbreaks: "സജീവ രോഗ പൊട്ടിപ്പുറപ്പാടുകൾ",
      healthFacilities: "ആരോഗ്യ സൗകര്യങ്ങൾ",
      migrantWorkers: "രജിസ്റ്റർ ചെയ്ത കുടിയേറ്റ തൊഴിലാളികൾ",
      criticalAlerts: "നിർണായക ആരോഗ്യ മുന്നറിയിപ്പുകൾ"
    },
    bn: {
      title: "Kerala Health Surveillance Map",
      subtitle: "Real-time disease monitoring and health analytics for Kerala",
      view3D: "3D Interactive Map",
      viewData: "Live Health Data",
      activeOutbreaks: "Active Disease Outbreaks",
      healthFacilities: "Health Facilities",
      migrantWorkers: "Migrant Workers Registered",
      criticalAlerts: "Critical Health Alerts"
    },
    or: {
      title: "Kerala Health Surveillance Map",
      subtitle: "Real-time disease monitoring and health analytics for Kerala",
      view3D: "3D Interactive Map",
      viewData: "Live Health Data",
      activeOutbreaks: "Active Disease Outbreaks",
      healthFacilities: "Health Facilities",
      migrantWorkers: "Migrant Workers Registered",
      criticalAlerts: "Critical Health Alerts"
    },
    ta: {
      title: "Kerala Health Surveillance Map",
      subtitle: "Real-time disease monitoring and health analytics for Kerala",
      view3D: "3D Interactive Map",
      viewData: "Live Health Data",
      activeOutbreaks: "Active Disease Outbreaks",
      healthFacilities: "Health Facilities",
      migrantWorkers: "Migrant Workers Registered",
      criticalAlerts: "Critical Health Alerts"
    },
    ne: {
      title: "Kerala Health Surveillance Map",
      subtitle: "Real-time disease monitoring and health analytics for Kerala",
      view3D: "3D Interactive Map",
      viewData: "Live Health Data",
      activeOutbreaks: "Active Disease Outbreaks",
      healthFacilities: "Health Facilities",
      migrantWorkers: "Migrant Workers Registered",
      criticalAlerts: "Critical Health Alerts"
    }
  };

  const t = translations[currentLanguage];

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-kerala-teal to-neon-blue">
        <div className="text-white text-2xl animate-pulse">
          Loading Maps...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-kerala-teal/10">
      {/* Navigation */}
      <Navigation 
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />

      {/* Header Section */}
      <section className="px-4 md:px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6 mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              {t.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.subtitle}
            </p>
            
            {/* View Toggle */}
            <div className="flex justify-center">
              <div className="bg-white rounded-full p-1 shadow-lg border border-gray-200">
                <button
                  onClick={() => setSelectedView('3d')}
                  className={`px-6 py-3 rounded-full transition-all duration-300 ${
                    selectedView === '3d' 
                      ? 'bg-kerala-teal text-white shadow-lg' 
                      : 'text-gray-600 hover:text-kerala-teal'
                  }`}
                >
                  {t.view3D}
                </button>
                <button
                  onClick={() => setSelectedView('data')}
                  className={`px-6 py-3 rounded-full transition-all duration-300 ${
                    selectedView === 'data' 
                      ? 'bg-kerala-teal text-white shadow-lg' 
                      : 'text-gray-600 hover:text-kerala-teal'
                  }`}
                >
                  {t.viewData}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          {selectedView === '3d' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="aspect-square max-w-4xl mx-auto">
                <RealKeralaMap />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-2xl">🚨</span>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-red-600">
                        {CURRENT_DISEASE_HOTSPOTS.filter(h => h.isActive).length}
                      </div>
                      <div className="text-sm font-medium text-red-700">
                        {t.activeOutbreaks}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-2xl">🏥</span>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-blue-600">
                        {KERALA_STATS.totalHealthFacilities}
                      </div>
                      <div className="text-sm font-medium text-blue-700">
                        {t.healthFacilities}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-kerala-teal/10 border border-kerala-teal/30 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-kerala-teal rounded-lg flex items-center justify-center">
                      <span className="text-white text-2xl">👷</span>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-kerala-teal">
                        {(KERALA_STATS.totalMigrantWorkers / 1000).toFixed(0)}K
                      </div>
                      <div className="text-sm font-medium text-kerala-teal">
                        {t.migrantWorkers}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-2xl">⚠️</span>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-purple-600">
                        {KERALA_STATS.activeHealthAlerts}
                      </div>
                      <div className="text-sm font-medium text-purple-700">
                        {t.criticalAlerts}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Districts Table */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">District Health Status</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">District</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Population</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Migrant Workers</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Health Facilities</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Risk Level</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Active Alerts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {KERALA_DISTRICTS.map((district) => (
                        <tr key={district.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{district.name}</td>
                          <td className="py-3 px-4 text-gray-600">{district.population.toLocaleString()}</td>
                          <td className="py-3 px-4 text-gray-600">{district.migrantWorkerCount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-gray-600">{district.healthFacilities}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              district.currentDiseaseRisk === 'critical' ? 'bg-red-100 text-red-800' :
                              district.currentDiseaseRisk === 'high' ? 'bg-orange-100 text-orange-800' :
                              district.currentDiseaseRisk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {district.currentDiseaseRisk.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-semibold ${
                              district.activeHealthAlerts > 10 ? 'text-red-600' :
                              district.activeHealthAlerts > 5 ? 'text-orange-600' :
                              'text-green-600'
                            }`}>
                              {district.activeHealthAlerts}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Current Outbreaks */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Current Disease Outbreaks</h3>
                <div className="grid gap-6">
                  {CURRENT_DISEASE_HOTSPOTS.filter(h => h.isActive).map((hotspot) => (
                    <div key={hotspot.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full animate-pulse ${
                            hotspot.riskLevel === 'critical' ? 'bg-purple-500' :
                            hotspot.riskLevel === 'high' ? 'bg-red-500' :
                            hotspot.riskLevel === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                          }`}></div>
                          <h4 className="text-lg font-semibold text-gray-900">{hotspot.diseaseName}</h4>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                          hotspot.riskLevel === 'critical' ? 'bg-purple-600' :
                          hotspot.riskLevel === 'high' ? 'bg-red-500' :
                          hotspot.riskLevel === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}>
                          {hotspot.riskLevel.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{hotspot.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">Affected:</span> {hotspot.affectedCount}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">District:</span> {hotspot.districtId}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Reported:</span> {hotspot.reportedDate}
                        </div>
                      </div>
                      {hotspot.preventionMeasures.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <div className="font-semibold text-blue-800 mb-2">Prevention Measures:</div>
                          <ul className="text-blue-700 text-sm space-y-1">
                            {hotspot.preventionMeasures.slice(0, 3).map((measure, i) => (
                              <li key={i}>• {measure}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MapsPage;