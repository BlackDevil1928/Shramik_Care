import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

// Environment variables - these should be set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client with healthcare-compliant configuration
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Enhanced security for healthcare data
      storageKey: 'kerala-migrant-health-auth',
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'kerala-migrant-health-system@1.0.0',
      },
    },
  }
);

// Helper functions for common database operations
export const dbHelpers = {
  // Migrant Workers
  async createWorker(worker: any): Promise<any> {
    const { data, error } = await supabase
      .from('migrant_workers')
      .insert(worker as any)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getWorkerByMHI(mhi_id: string) {
    const { data, error } = await supabase
      .from('migrant_workers')
      .select('*, health_records(*)')
      .eq('mhi_id', mhi_id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateWorker(id: string, updates: any) {
    const { data, error } = await (supabase
      .from('migrant_workers')
      .update as any)(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Health Records
  async createHealthRecord(record: any): Promise<any> {
    const { data, error } = await supabase
      .from('health_records')
      .insert(record as any)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getHealthRecordsByLocation(district: string, limit = 100) {
    const { data, error } = await supabase
      .from('health_records')
      .select('*, migrant_workers(name, age, occupation)')
      .eq('location->>district', district)
      .order('reported_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async getSymptomClusters(timeframe_hours = 24) {
    const timeThreshold = new Date(Date.now() - timeframe_hours * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('health_records')
      .select('symptoms, location, severity')
      .gte('reported_at', timeThreshold);
    
    if (error) throw error;
    return data;
  },

  // Voice Sessions
  async createVoiceSession(session: any) {
    const { data, error } = await supabase
      .from('voice_sessions')
      .insert(session as any)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateVoiceSession(call_id: string, updates: any) {
    const { data, error } = await (supabase
      .from('voice_sessions')
      .update as any)(updates)
      .eq('call_id', call_id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Anonymous reporting (privacy-preserving)
  async createAnonymousReport(location: any, symptoms: string[], severity: string) {
    const { data, error } = await supabase
      .from('health_records')
      .insert({
        worker_id: 'anonymous',
        symptoms,
        severity: severity as any,
        reported_at: new Date().toISOString(),
        reported_via: 'voice',
        is_anonymous: true,
        location,
        follow_up_required: severity === 'high' || severity === 'critical',
      } as any)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// Real-time subscription helpers
export const realtimeHelpers = {
  subscribeToHealthAlerts(callback: (payload: any) => void) {
    return supabase
      .channel('health_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'health_records',
          filter: 'severity=in.(high,critical)',
        },
        callback
      )
      .subscribe();
  },

  subscribeToLocationAlerts(district: string, callback: (payload: any) => void) {
    return supabase
      .channel(`location_alerts_${district}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'health_records',
        },
        (payload) => {
          // Filter by district in the callback since Postgres filters have limitations
          if (payload.new.location?.district === district) {
            callback(payload);
          }
        }
      )
      .subscribe();
  },
};

// Utility function to generate Migrant Health ID (MHI)
export function generateMHI(): string {
  const prefix = 'KER';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}