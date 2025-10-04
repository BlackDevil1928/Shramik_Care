// Core system types for Kerala Migrant Health System

export interface MigrantWorker {
  id: string;
  mhi_id: string; // Migrant Health ID
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  emergency_contact_phone?: string;
  languages: Language[];
  employer?: string;
  occupation: OccupationType;
  current_location: Location;
  health_records?: HealthRecord[];
  medical_conditions?: string[];
  allergies?: string[];
  vaccination_status?: Record<string, any>;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface HealthRecord {
  id: string;
  worker_id: string;
  symptoms: string[];
  condition?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reported_at: string;
  reported_via: 'voice' | 'text' | 'kiosk';
  is_anonymous: boolean;
  location: Location;
  follow_up_required: boolean;
  notes?: string;
}

export interface Location {
  district: string;
  panchayat: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export type Language = 'en' | 'hi' | 'bn' | 'or' | 'ta' | 'ne' | 'ml';

export type OccupationType = 
  | 'construction'
  | 'fishing'
  | 'factory'
  | 'agriculture'
  | 'domestic'
  | 'transport'
  | 'other';

export interface VoiceSession {
  id: string;
  call_id?: string;
  worker_id?: string;
  language: Language;
  transcript: string;
  extracted_data: {
    symptoms?: string[];
    location?: string | null;
    urgency?: 'low' | 'medium' | 'high';
  };
  session_duration: number;
  call_status?: 'started' | 'completed' | 'failed';
  webhook_data?: any;
  created_at?: string;
}

export interface DiseaseHotspot {
  location: Location;
  cases_count: number;
  primary_symptoms: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  last_updated: string;
}

export interface OccupationalRisk {
  occupation: OccupationType;
  common_diseases: string[];
  risk_factors: string[];
  prevention_tips: string[];
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'doctor' | 'health_officer';
  permissions: Permission[];
  district_access?: string[];
}

export type Permission = 
  | 'view_workers'
  | 'edit_workers'
  | 'view_health_records'
  | 'export_data'
  | 'manage_alerts'
  | 'system_admin';

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// Voice AI Integration types (Vapi.ai)
export interface VapiConfig {
  assistant_id: string;
  voice: string;
  language: Language;
  webhook_url: string;
}

export interface VapiWebhook {
  type: 'call.started' | 'call.ended' | 'transcript.updated';
  call_id: string;
  data: any;
}

// Supabase Database Schema types
export interface Database {
  public: {
    Tables: {
      migrant_workers: {
        Row: MigrantWorker;
        Insert: Omit<MigrantWorker, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MigrantWorker, 'id'>>;
      };
      health_records: {
        Row: HealthRecord;
        Insert: Omit<HealthRecord, 'id'>;
        Update: Partial<Omit<HealthRecord, 'id'>>;
      };
      voice_sessions: {
        Row: VoiceSession;
        Insert: Omit<VoiceSession, 'id'>;
        Update: Partial<Omit<VoiceSession, 'id'>>;
      };
    };
  };
}