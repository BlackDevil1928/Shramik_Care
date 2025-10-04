import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server-side operations
);

interface AnonymousReport {
  id?: string;
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  duration: string;
  location: {
    district: string;
    area: string;
    coordinates?: { lat: number; lng: number };
  };
  occupation: string;
  ageGroup: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  additionalInfo?: string;
  timestamp: Date;
  reportSource: 'web' | 'voice' | 'kiosk';
  isAnonymous: true;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const reportData: AnonymousReport = await request.json();

    // Validate required fields
    if (!reportData.symptoms || reportData.symptoms.length === 0) {
      return NextResponse.json(
        { error: 'Symptoms are required' },
        { status: 400 }
      );
    }

    if (!reportData.severity) {
      return NextResponse.json(
        { error: 'Severity is required' },
        { status: 400 }
      );
    }

    if (!reportData.duration) {
      return NextResponse.json(
        { error: 'Duration is required' },
        { status: 400 }
      );
    }

    if (!reportData.location?.district || !reportData.location?.area) {
      return NextResponse.json(
        { error: 'Location information is required' },
        { status: 400 }
      );
    }

    // Privacy-preserving processing
    const anonymousRecord = {
      id: reportData.id || `ANM-${Date.now()}-${nanoid(8).toUpperCase()}`,
      symptoms: reportData.symptoms,
      severity: reportData.severity,
      duration: reportData.duration,
      location_district: reportData.location.district.toLowerCase(),
      location_area: reportData.location.area,
      occupation: reportData.occupation || null,
      age_group: reportData.ageGroup || null,
      gender: reportData.gender || null,
      additional_info: reportData.additionalInfo || null,
      report_source: reportData.reportSource,
      created_at: new Date().toISOString(),
      
      // Privacy flags
      is_anonymous: true,
      ip_address: null, // Explicitly not stored
      user_agent: null, // Explicitly not stored
      session_id: null, // Explicitly not stored
      
      // Derived data for public health analysis
      risk_score: calculateRiskScore(reportData),
      hotspot_contribution: calculateHotspotContribution(reportData),
      
      // Metadata for tracking (not personally identifiable)
      report_month: new Date().toISOString().substr(0, 7), // YYYY-MM format
      report_day_of_week: new Date().getDay(),
      report_hour: new Date().getHours()
    };

    // Insert into anonymous_reports table
    const { data, error } = await supabase
      .from('anonymous_reports')
      .insert([anonymousRecord])
      .select('id, created_at')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save report' },
        { status: 500 }
      );
    }

    // Update disease surveillance aggregates (for public health monitoring)
    await updateSurveillanceData(anonymousRecord);

    // Check for potential hotspots and send alerts if necessary
    await checkForHotspots(anonymousRecord);

    // Return success response with minimal data
    return NextResponse.json({
      success: true,
      reportId: data.id,
      timestamp: data.created_at,
      message: 'Anonymous report submitted successfully'
    });

  } catch (error) {
    console.error('Error processing anonymous report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateRiskScore(report: AnonymousReport): number {
  let score = 0;
  
  // Base score from severity
  const severityScores = {
    mild: 1,
    moderate: 3,
    severe: 6,
    critical: 10
  };
  score += severityScores[report.severity];
  
  // Add score based on symptoms
  const highRiskSymptoms = ['fever', 'breathing', 'chest_pain'];
  const symptomRiskBonus = report.symptoms.filter(s => 
    highRiskSymptoms.includes(s)
  ).length * 2;
  score += symptomRiskBonus;
  
  // Duration factor
  const durationMultipliers: Record<string, number> = {
    'Less than 1 day': 0.5,
    '1-3 days': 1,
    '4-7 days': 1.5,
    '1-2 weeks': 2,
    'More than 2 weeks': 3
  };
  score *= (durationMultipliers[report.duration] || 1);
  
  // Cap at 30
  return Math.min(Math.round(score), 30);
}

function calculateHotspotContribution(report: AnonymousReport): number {
  // Calculate how much this report contributes to potential hotspot detection
  const severityWeights = {
    mild: 0.25,
    moderate: 0.5,
    severe: 0.75,
    critical: 1.0
  };
  
  const symptomCount = report.symptoms.length;
  const baseContribution = severityWeights[report.severity];
  
  // More symptoms = higher contribution
  return Math.round((baseContribution + (symptomCount * 0.1)) * 100) / 100;
}

async function updateSurveillanceData(report: any) {
  try {
    // Update daily aggregates for surveillance
    const today = new Date().toISOString().split('T')[0];
    
    // Upsert surveillance data
    const { error } = await supabase
      .from('surveillance_daily_aggregates')
      .upsert({
        date: today,
        district: report.location_district,
        total_reports: 1,
        severity_breakdown: {
          mild: report.severity === 'mild' ? 1 : 0,
          moderate: report.severity === 'moderate' ? 1 : 0,
          severe: report.severity === 'severe' ? 1 : 0,
          critical: report.severity === 'critical' ? 1 : 0
        },
        top_symptoms: report.symptoms,
        average_risk_score: report.risk_score,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'date,district',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Failed to update surveillance data:', error);
    }
  } catch (error) {
    console.error('Error updating surveillance data:', error);
  }
}

async function checkForHotspots(report: any) {
  try {
    // Query recent reports in the same district
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentReports, error } = await supabase
      .from('anonymous_reports')
      .select('severity, symptoms, hotspot_contribution')
      .eq('location_district', report.location_district)
      .gte('created_at', oneDayAgo);

    if (error || !recentReports) {
      return;
    }

    // Calculate hotspot metrics
    const totalReports = recentReports.length;
    const severeCriticalCount = recentReports.filter(r => 
      r.severity === 'severe' || r.severity === 'critical'
    ).length;
    
    const hotspotScore = recentReports.reduce((sum, r) => 
      sum + (r.hotspot_contribution || 0), 0
    );

    // Hotspot threshold logic
    const isHotspot = (
      (totalReports >= 5 && severeCriticalCount >= 2) || // 5+ reports with 2+ severe/critical
      (hotspotScore >= 10) || // High aggregated hotspot score
      (severeCriticalCount >= 3) // 3+ severe/critical cases
    );

    if (isHotspot) {
      // Create or update hotspot alert
      await supabase
        .from('disease_hotspots')
        .upsert({
          district: report.location_district,
          area: report.location_area,
          alert_level: severeCriticalCount >= 3 ? 'critical' : 'high',
          total_reports: totalReports,
          severe_critical_count: severeCriticalCount,
          hotspot_score: Math.round(hotspotScore * 100) / 100,
          detected_at: new Date().toISOString(),
          status: 'active',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'district,area'
        });

      // TODO: Send alerts to health authorities
      console.log(`Hotspot detected in ${report.location_district}: ${totalReports} reports, ${severeCriticalCount} severe/critical`);
    }

  } catch (error) {
    console.error('Error checking for hotspots:', error);
  }
}

export async function GET(request: NextRequest) {
  // This endpoint could be used to get aggregated statistics
  // without revealing any individual reports
  try {
    const url = new URL(request.url);
    const district = url.searchParams.get('district');
    const timeframe = url.searchParams.get('timeframe') || '7d';

    let timeFilter;
    switch (timeframe) {
      case '1d':
        timeFilter = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        break;
      case '7d':
        timeFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case '30d':
        timeFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      default:
        timeFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    // Build query
    let query = supabase
      .from('anonymous_reports')
      .select('severity, symptoms, location_district, created_at')
      .gte('created_at', timeFilter);

    if (district) {
      query = query.eq('location_district', district.toLowerCase());
    }

    const { data: reports, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch data' },
        { status: 500 }
      );
    }

    // Aggregate anonymized statistics
    const stats = {
      totalReports: reports.length,
      severityBreakdown: {
        mild: reports.filter(r => r.severity === 'mild').length,
        moderate: reports.filter(r => r.severity === 'moderate').length,
        severe: reports.filter(r => r.severity === 'severe').length,
        critical: reports.filter(r => r.severity === 'critical').length
      },
      topSymptoms: getTopSymptoms(reports),
      districtBreakdown: getDistrictBreakdown(reports),
      timeframe,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching anonymous report statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getTopSymptoms(reports: any[]) {
  const symptomCounts: { [key: string]: number } = {};
  
  reports.forEach(report => {
    report.symptoms.forEach((symptom: string) => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });

  return Object.entries(symptomCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([symptom, count]) => ({ symptom, count }));
}

function getDistrictBreakdown(reports: any[]) {
  const districtCounts: { [key: string]: number } = {};
  
  reports.forEach(report => {
    const district = report.location_district;
    districtCounts[district] = (districtCounts[district] || 0) + 1;
  });

  return Object.entries(districtCounts)
    .sort(([,a], [,b]) => b - a)
    .map(([district, count]) => ({ district, count }));
}