export interface OccupationalProfile {
  id: string;
  workerId: string;
  jobTitle: string;
  industry: Industry;
  workEnvironment: WorkEnvironment;
  riskFactors: RiskFactor[];
  workHistory: WorkHistory[];
  healthAssessments: HealthAssessment[];
  predictions: RiskPrediction[];
  alerts: HealthAlert[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkHistory {
  id: string;
  jobTitle: string;
  industry: Industry;
  duration: number; // in months
  hazardExposure: HazardExposure[];
  location: string;
  startDate: Date;
  endDate?: Date;
}

export interface RiskFactor {
  id: string;
  type: RiskFactorType;
  name: string;
  severity: RiskSeverity;
  exposureLevel: ExposureLevel;
  frequency: ExposureFrequency;
  protectiveEquipment: ProtectiveEquipment[];
  environmentalFactors: EnvironmentalFactor[];
}

export interface RiskPrediction {
  id: string;
  condition: OccupationalCondition;
  riskScore: number; // 0-1
  riskLevel: RiskLevel;
  timeframe: PredictionTimeframe;
  contributingFactors: string[];
  preventionRecommendations: string[];
  monitoringAdvice: string[];
  confidence: number; // 0-1
  createdAt: Date;
}

export interface HealthAssessment {
  id: string;
  assessmentDate: Date;
  symptoms: OccupationalSymptom[];
  biomarkers: Biomarker[];
  functionalTests: FunctionalTest[];
  overallScore: number;
  recommendations: string[];
}

export interface HealthAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  condition: OccupationalCondition;
  message: Record<Language, string>;
  recommendations: Record<Language, string[]>;
  isActive: boolean;
  triggerDate: Date;
  acknowledgedAt?: Date;
}

export type Industry = 
  | 'construction'
  | 'fishing'
  | 'agriculture'
  | 'manufacturing'
  | 'textiles'
  | 'hospitality'
  | 'domestic_work'
  | 'transportation'
  | 'food_processing'
  | 'mining'
  | 'oil_gas';

export type RiskFactorType = 
  | 'chemical'
  | 'physical'
  | 'biological'
  | 'ergonomic'
  | 'psychosocial'
  | 'environmental';

export type RiskSeverity = 'low' | 'moderate' | 'high' | 'critical';
export type ExposureLevel = 'minimal' | 'moderate' | 'high' | 'extreme';
export type ExposureFrequency = 'rare' | 'occasional' | 'frequent' | 'continuous';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export type PredictionTimeframe = 
  | '1_month'
  | '3_months'
  | '6_months'
  | '1_year'
  | '2_years'
  | '5_years';

export type AlertType = 
  | 'preventive'
  | 'early_warning'
  | 'immediate_action'
  | 'health_screening';

export type AlertSeverity = 'info' | 'warning' | 'urgent' | 'critical';

export interface WorkEnvironment {
  temperature: TemperatureRange;
  humidity: HumidityLevel;
  noiseLevel: NoiseLevel;
  lighting: LightingCondition;
  ventilation: VentilationQuality;
  workSchedule: WorkSchedule;
  physicalDemands: PhysicalDemands;
}

export interface HazardExposure {
  hazard: Hazard;
  exposureLevel: ExposureLevel;
  duration: number; // hours per day
  protectionUsed: boolean;
}

export interface OccupationalCondition {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  category: ConditionCategory;
  commonIndustries: Industry[];
  riskFactors: RiskFactorType[];
  symptoms: string[];
  prevention: Record<Language, string[]>;
  treatment: Record<Language, string[]>;
  prognosis: PrognosisLevel;
  prevalenceRate: number; // 0-1
}

export interface ProtectiveEquipment {
  type: PPEType;
  effectiveness: number; // 0-1
  complianceRate: number; // 0-1
  condition: EquipmentCondition;
}

export interface EnvironmentalFactor {
  factor: EnvironmentalFactorType;
  level: string;
  impact: ImpactLevel;
}

export type TemperatureRange = 'very_cold' | 'cold' | 'moderate' | 'hot' | 'extreme_heat';
export type HumidityLevel = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
export type NoiseLevel = 'quiet' | 'moderate' | 'loud' | 'very_loud' | 'extreme';
export type LightingCondition = 'poor' | 'adequate' | 'good' | 'excellent';
export type VentilationQuality = 'poor' | 'adequate' | 'good' | 'excellent';

export interface WorkSchedule {
  hoursPerDay: number;
  daysPerWeek: number;
  shiftType: ShiftType;
  overtimeFrequency: OvertimeFrequency;
  restBreaks: number; // minutes per shift
}

export interface PhysicalDemands {
  heavyLifting: boolean;
  repetitiveMotions: boolean;
  prolongedStanding: boolean;
  prolongedSitting: boolean;
  climbing: boolean;
  crawling: boolean;
  reachingOverhead: boolean;
}

export type ShiftType = 'day' | 'night' | 'rotating' | 'split';
export type OvertimeFrequency = 'never' | 'rarely' | 'sometimes' | 'often' | 'always';

export type Hazard = 
  | 'asbestos'
  | 'silica_dust'
  | 'chemical_fumes'
  | 'pesticides'
  | 'heavy_metals'
  | 'radiation'
  | 'extreme_heat'
  | 'extreme_cold'
  | 'loud_noise'
  | 'vibration'
  | 'biological_agents'
  | 'falling_objects'
  | 'sharp_tools'
  | 'electrical_hazards'
  | 'fire_explosion'
  | 'confined_spaces';

export type PPEType = 
  | 'respirator'
  | 'safety_helmet'
  | 'safety_goggles'
  | 'hearing_protection'
  | 'safety_gloves'
  | 'safety_boots'
  | 'high_vis_clothing'
  | 'fall_protection'
  | 'cut_resistant_clothing';

export type EquipmentCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';

export type EnvironmentalFactorType = 
  | 'air_quality'
  | 'water_quality'
  | 'seasonal_patterns'
  | 'geographic_location'
  | 'industrial_proximity';

export type ImpactLevel = 'negligible' | 'minor' | 'moderate' | 'major' | 'severe';

export type ConditionCategory = 
  | 'respiratory'
  | 'musculoskeletal'
  | 'dermatological'
  | 'neurological'
  | 'cardiovascular'
  | 'reproductive'
  | 'cancer'
  | 'injury'
  | 'mental_health';

export type PrognosisLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'grave';

export interface OccupationalSymptom {
  symptomId: string;
  severity: number; // 1-10 scale
  frequency: SymptomFrequency;
  workRelated: boolean;
  onsetDate: Date;
}

export interface Biomarker {
  name: string;
  value: number;
  unit: string;
  normalRange: { min: number; max: number };
  riskLevel: RiskLevel;
}

export interface FunctionalTest {
  name: string;
  result: number;
  unit: string;
  interpretation: TestResult;
}

export type SymptomFrequency = 'rare' | 'occasional' | 'frequent' | 'constant';
export type TestResult = 'normal' | 'borderline' | 'abnormal' | 'severely_abnormal';

import type { Language } from '@/types';