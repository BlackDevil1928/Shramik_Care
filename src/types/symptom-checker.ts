export interface Symptom {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  category: SymptomCategory;
  severity: SymptomSeverity;
  bodyPart?: BodyPart;
  icon: string;
  voiceKeywords: Record<Language, string[]>;
  relatedSymptoms?: string[];
}

export interface Condition {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  category: ConditionCategory;
  severity: ConditionSeverity;
  commonSymptoms: string[];
  rareSymptoms?: string[];
  riskFactors?: string[];
  recommendations: Record<Language, string[]>;
  urgency: UrgencyLevel;
  prevalenceInMigrants: 'high' | 'medium' | 'low';
}

export interface SymptomCheckSession {
  id: string;
  userId?: string;
  language: Language;
  isAnonymous: boolean;
  symptoms: SelectedSymptom[];
  suggestedConditions: ConditionMatch[];
  recommendations: string[];
  urgencyLevel: UrgencyLevel;
  createdAt: Date;
  completedAt?: Date;
  voiceTranscript?: string;
}

export interface SelectedSymptom {
  symptomId: string;
  severity: SymptomSeverity;
  duration: SymptomDuration;
  onset: SymptomOnset;
  notes?: string;
}

export interface ConditionMatch {
  conditionId: string;
  confidence: number;
  matchingSymptoms: string[];
  missingSymptoms?: string[];
  reasoning: string;
}

export type SymptomCategory = 
  | 'respiratory' 
  | 'digestive' 
  | 'neurological' 
  | 'cardiovascular' 
  | 'musculoskeletal' 
  | 'dermatological' 
  | 'infectious' 
  | 'occupational' 
  | 'mental_health' 
  | 'general';

export type ConditionCategory = 
  | 'infectious_disease'
  | 'chronic_disease'
  | 'occupational_disease'
  | 'mental_health'
  | 'injury'
  | 'nutritional'
  | 'preventable';

export type SymptomSeverity = 'mild' | 'moderate' | 'severe' | 'critical';
export type ConditionSeverity = 'minor' | 'moderate' | 'serious' | 'critical';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

export type SymptomDuration = 
  | 'minutes'
  | 'hours' 
  | 'days'
  | 'weeks'
  | 'months'
  | 'chronic';

export type SymptomOnset = 'sudden' | 'gradual' | 'intermittent' | 'constant';

export type BodyPart = 
  | 'head' 
  | 'chest' 
  | 'abdomen' 
  | 'back' 
  | 'arms' 
  | 'legs' 
  | 'whole_body';

export interface SymptomCheckerStep {
  id: string;
  title: Record<Language, string>;
  type: 'symptom_selection' | 'severity_rating' | 'duration_input' | 'voice_input' | 'results';
  component: string;
}

export interface VoiceSymptomInput {
  transcript: string;
  confidence: number;
  language: Language;
  extractedSymptoms: ExtractedSymptom[];
  timestamp: Date;
}

export interface ExtractedSymptom {
  symptom: string;
  confidence: number;
  context: string;
  severity?: SymptomSeverity;
  bodyPart?: BodyPart;
}

export type Language = 'en' | 'hi' | 'bn' | 'or' | 'ta' | 'ne' | 'ml';
