import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

// Client-side Supabase instance (lazy-loaded)
let clientInstance: ReturnType<typeof createClient<Database>> | null = null;

// Get client-side Supabase instance (for browser/client components)
export function getSupabaseClient() {
  if (clientInstance) return clientInstance;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client during build time
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      return null as any;
    }
    throw new Error('Supabase environment variables are not configured');
  }
  
  clientInstance = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
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
  
  return clientInstance;
}

// Server-side Supabase instance (for API routes with service role)
export function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase server environment variables are not configured');
  }
  
  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
  });
}

// Legacy export for backward compatibility (client-side)
export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null as any;

// Helper functions for common database operations
export const dbHelpers = {
  // Migrant Workers
  async createWorker(worker: any): Promise<any> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('migrant_workers')
      .insert(worker as any)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getWorkerByMHI(mhi_id: string) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('migrant_workers')
      .select('*, health_records(*)')
      .eq('mhi_id', mhi_id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateWorker(id: string, updates: any) {
    const supabase = getSupabaseServerClient();
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
    const supabase = getSupabaseServerClient();
    const { data, error} = await supabase
      .from('health_records')
      .insert(record as any)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getHealthRecordsByLocation(district: string, limit = 100) {
    const supabase = getSupabaseServerClient();
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
    const supabase = getSupabaseServerClient();
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
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('voice_sessions')
      .insert(session as any)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateVoiceSession(call_id: string, updates: any) {
    const supabase = getSupabaseServerClient();
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
    const supabase = getSupabaseServerClient();
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
    const supabase = getSupabaseClient();
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
    const supabase = getSupabaseClient();
    return supabase
      .channel(`location_alerts_${district}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'health_records',
        },
        (payload: any) => {
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