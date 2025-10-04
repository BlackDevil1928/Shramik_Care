'use client';

import SymptomChecker from '@/components/symptom-checker/SymptomChecker';

export default function SymptomCheckerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-kerala-teal mb-4">
              AI-Powered Symptom Checker
            </h1>
            <p className="text-xl text-gray-600">
              Voice-first multilingual health assessment system for migrant workers
            </p>
          </div>

          <SymptomChecker
            language="en"
            onSessionComplete={(session) => {
              console.log('Symptom check session completed:', session);
              // Here you would typically save the session to the database
            }}
            isKioskMode={false}
          />
        </div>
      </div>
    </div>
  );
}