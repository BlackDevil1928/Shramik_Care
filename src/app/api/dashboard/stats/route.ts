import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic to avoid caching
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Supabase environment variables are missing', missing: {
          NEXT_PUBLIC_SUPABASE_URL: !supabaseUrl,
          SUPABASE_SERVICE_ROLE_KEY: !serviceKey,
        } },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
      db: { schema: 'public' },
      global: { headers: { 'X-Client-Info': 'dashboard-stats@1.0.0' } },
    });

    const warnings: string[] = [];

    // Fetch workers with error handling
    let workers: any[] = [];
    try {
      const { data, error } = await supabase
        .from('migrant_workers')
        .select('id, current_location, created_at')
        .eq('is_active', true);
      if (error) {
        warnings.push(`workers_query_failed: ${error.message}`);
      } else {
        workers = data || [];
      }
    } catch (e: any) {
      warnings.push(`workers_query_failed: ${e?.message || 'fetch failed'}`);
    }

    // Fetch health records with error handling
    let healthRecords: any[] = [];
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('id, severity, reported_via, is_anonymous, reported_at, location');
      if (error) {
        warnings.push(`health_records_query_failed: ${error.message}`);
      } else {
        healthRecords = data || [];
      }
    } catch (e: any) {
      warnings.push(`health_records_query_failed: ${e?.message || 'fetch failed'}`);
    }

    // Fetch active surveillance with error handling
    let surveillance: any[] = [];
    try {
      const { data, error } = await supabase
        .from('disease_surveillance')
        .select('id, severity_level, status')
        .eq('status', 'active');
      if (error) {
        warnings.push(`surveillance_query_failed: ${error.message}`);
      } else {
        surveillance = data || [];
      }
    } catch (e: any) {
      warnings.push(`surveillance_query_failed: ${e?.message || 'fetch failed'}`);
    }

    // Calculate statistics
    const today = new Date().toISOString().split('T')[0];

    const todayRecords = (healthRecords || []).filter((r) =>
      (r.reported_at || '').startsWith(today)
    );

    const criticalRecords = (healthRecords || []).filter(
      (r) => r.severity === 'critical' || r.severity === 'high'
    );

    const voiceRecords = (healthRecords || []).filter((r) => r.reported_via === 'voice');

    const anonymousRecords = (healthRecords || []).filter((r) => r.is_anonymous === true);

    // District breakdown
    const districtCounts: Record<string, { workers: number; health: number }> = {};

    (workers || []).forEach((w: any) => {
      const district = w.current_location?.district || 'unknown';
      if (!districtCounts[district]) districtCounts[district] = { workers: 0, health: 0 };
      districtCounts[district].workers++;
    });

    (healthRecords || []).forEach((r: any) => {
      const district = r.location?.district || 'unknown';
      if (!districtCounts[district]) districtCounts[district] = { workers: 0, health: 0 };
      districtCounts[district].health++;
    });

    const districtBreakdown = Object.entries(districtCounts).map(([district, counts]) => ({
      district,
      workerCount: counts.workers,
      healthCases: counts.health,
    }));

    return NextResponse.json({
      totalWorkers: workers?.length || 0,
      totalHealthRecords: healthRecords?.length || 0,
      activeHotspots: surveillance?.length || 0,
      criticalCases: criticalRecords.length,
      registrationsToday: todayRecords.length,
      voiceRegistrations: voiceRecords.length,
      anonymousReports: anonymousRecords.length,
      districtBreakdown,
      lastUpdated: new Date().toISOString(),
      warnings,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'internal_error', message: e?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
