'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { occupationalRiskPredictor } from '@/lib/occupational-risk-predictor';
import type { OccupationalProfile, RiskPrediction, HealthAlert, Industry } from '@/types/occupational-health';
import type { Language } from '@/types';

interface RiskDashboardProps {
  workerId: string;
  language: Language;
}

export default function RiskDashboard({ workerId, language }: RiskDashboardProps) {
  const [predictions, setPredictions] = useState<RiskPrediction[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock profile for demo
  const mockProfile: OccupationalProfile = {
    id: 'profile_1',
    workerId,
    jobTitle: 'Construction Worker',
    industry: 'construction',
    workEnvironment: {
      temperature: 'extreme_heat',
      humidity: 'high',
      noiseLevel: 'loud',
      lighting: 'adequate',
      ventilation: 'poor',
      workSchedule: {
        hoursPerDay: 10,
        daysPerWeek: 6,
        shiftType: 'day',
        overtimeFrequency: 'often',
        restBreaks: 30
      },
      physicalDemands: {
        heavyLifting: true,
        repetitiveMotions: true,
        prolongedStanding: true,
        prolongedSitting: false,
        climbing: true,
        crawling: false,
        reachingOverhead: true
      }
    },
    riskFactors: occupationalRiskPredictor.getIndustryRiskFactors('construction'),
    workHistory: [{
      id: 'history_1',
      jobTitle: 'Construction Worker',
      industry: 'construction',
      duration: 24, // 2 years
      hazardExposure: [],
      location: 'Kerala',
      startDate: new Date(2022, 0, 1)
    }],
    healthAssessments: [],
    predictions: [],
    alerts: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  useEffect(() => {
    const runPrediction = async () => {
      setIsLoading(true);
      try {
        const riskPredictions = await occupationalRiskPredictor.predictRisks(mockProfile);
        const healthAlerts = occupationalRiskPredictor.generateAlerts(riskPredictions, language);
        
        setPredictions(riskPredictions);
        setAlerts(healthAlerts);
      } catch (error) {
        console.error('Risk prediction failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    runPrediction();
  }, [workerId, language]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'moderate': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kerala-teal"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-kerala-teal mb-2">
          Occupational Health Risk Assessment
        </h2>
        <p className="text-gray-600">
          AI-powered prediction system for construction workers in Kerala
        </p>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-red-800 mb-4">
            🚨 Active Health Alerts ({alerts.length})
          </h3>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-red-900">
                    {alert.condition.name[language] || alert.condition.name.en}
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    alert.severity === 'critical' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                  }`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-red-700 mb-3">
                  {alert.message[language] || alert.message.en}
                </p>
                <div>
                  <strong className="text-red-800">Recommendations:</strong>
                  <ul className="list-disc list-inside mt-1 text-sm text-red-700">
                    {(alert.recommendations[language] || alert.recommendations.en).map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Risk Predictions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-lg border"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Health Risk Predictions ({predictions.length})
        </h3>
        <div className="space-y-4">
          {predictions.map((prediction) => (
            <div key={prediction.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-lg">
                  {prediction.condition.name[language] || prediction.condition.name.en}
                </h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRiskColor(prediction.riskLevel)}`}>
                    {prediction.riskLevel.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(prediction.riskScore * 100)}% risk
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-3">
                {prediction.condition.description[language] || prediction.condition.description.en}
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Contributing Factors:</h5>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {prediction.contributingFactors.map((factor, i) => (
                      <li key={i}>{factor}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Prevention Recommendations:</h5>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {prediction.preventionRecommendations.slice(0, 3).map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Prediction timeframe: {prediction.timeframe.replace('_', ' ')}</span>
                  <span>Confidence: {Math.round(prediction.confidence * 100)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Industry Risk Factors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-50 rounded-xl p-6 border border-blue-200"
      >
        <h3 className="text-xl font-semibold text-blue-900 mb-4">
          Construction Industry Risk Factors
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {mockProfile.riskFactors.map((factor) => (
            <div key={factor.id} className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">{factor.name}</h4>
              <div className="space-y-1 text-sm">
                <div>Type: <span className="font-medium">{factor.type}</span></div>
                <div>Severity: <span className={`font-medium ${
                  factor.severity === 'high' ? 'text-red-600' : 
                  factor.severity === 'moderate' ? 'text-yellow-600' : 'text-green-600'
                }`}>{factor.severity}</span></div>
                <div>Exposure: <span className="font-medium">{factor.exposureLevel}</span></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Kerala Environmental Factors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-green-50 rounded-xl p-6 border border-green-200"
      >
        <h3 className="text-xl font-semibold text-green-900 mb-4">
          Kerala-Specific Environmental Risk Factors
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(occupationalRiskPredictor.getKeralaEnvironmentalFactors()).map(([factor, multiplier]) => (
            <div key={factor} className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
              <span className="font-medium text-green-900">
                {factor.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <span className={`px-2 py-1 rounded text-sm font-bold ${
                multiplier >= 1.3 ? 'bg-red-100 text-red-800' : 
                multiplier >= 1.2 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {multiplier}x risk
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}