'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Define proper types for database records
interface WorkerRecord {
  id: string;
  current_location?: {
    district?: string;
    panchayat?: string;
    coordinates?: { lat: number; lng: number };
  };
  created_at: string;
}

interface HealthRecord {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reported_via: 'voice' | 'text' | 'kiosk';
  is_anonymous: boolean;
  reported_at: string;
  location?: {
    district?: string;
    panchayat?: string;
    coordinates?: { lat: number; lng: number };
  };
}

interface SurveillanceRecord {
  id: string;
  severity_level: 'low' | 'medium' | 'high' | 'critical';
  status: string;
}

interface HealthStatsProps {
  refreshInterval?: number;
}

interface StatsData {
  totalWorkers: number;
  totalHealthRecords: number;
  activeHotspots: number;
  criticalCases: number;
  registrationsToday: number;
  voiceRegistrations: number;
  anonymousReports: number;
  districtBreakdown: Array<{
    district: string;
    workerCount: number;
    healthCases: number;
  }>;
}

const HealthStats: React.FC<HealthStatsProps> = ({ refreshInterval = 30000 }) => {
  const [stats, setStats] = useState<StatsData>({
    totalWorkers: 0,
    totalHealthRecords: 0,
    activeHotspots: 0,
    criticalCases: 0,
    registrationsToday: 0,
    voiceRegistrations: 0,
    anonymousReports: 0,
    districtBreakdown: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchStats();
    
    // Set up periodic refresh
    const interval = setInterval(fetchStats, refreshInterval);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshInterval]);

  const formatError = (err: unknown): string => {
    try {
      if (err instanceof Error) {
        return `${err.name}: ${err.message}`;
      }
      if (typeof err === 'object' && err !== null) {
        const e = err as any;
        const parts: string[] = [];
        if (e.status) parts.push(`status=${e.status}`);
        if (e.code) parts.push(`code=${e.code}`);
        if (e.message) parts.push(`message=${e.message}`);
        if (e.details) parts.push(`details=${typeof e.details === 'string' ? e.details : JSON.stringify(e.details)}`);
        if (e.hint) parts.push(`hint=${e.hint}`);
        if (e.error_description) parts.push(`error_description=${e.error_description}`);
        if (parts.length > 0) return parts.join(' | ');
        // Fallback to object tag to avoid logging {}
        return Object.prototype.toString.call(err);
      }
      return String(err);
    } catch {
      return 'Unknown error';
    }
  };

  const fetchStats = async () => {
    try {
      setIsLoading(true);

      const res = await fetch('/api/dashboard/stats', { cache: 'no-store' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();

      setStats({
        totalWorkers: data.totalWorkers ?? 0,
        totalHealthRecords: data.totalHealthRecords ?? 0,
        activeHotspots: data.activeHotspots ?? 0,
        criticalCases: data.criticalCases ?? 0,
        registrationsToday: data.registrationsToday ?? 0,
        voiceRegistrations: data.voiceRegistrations ?? 0,
        anonymousReports: data.anonymousReports ?? 0,
        districtBreakdown: Array.isArray(data.districtBreakdown) ? data.districtBreakdown : [],
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching health stats:', formatError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, trend }: {
    title: string;
    value: number | string;
    icon: string;
    color: string;
    trend?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="health-card p-6 relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
        </div>
        <div className={`text-4xl ${color}`}>
          {icon}
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="flex items-center text-sm">
          <span className={`flex items-center ${trend > 0 ? 'text-health-green' : trend < 0 ? 'text-error-red' : 'text-gray-500'}`}>
            {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} 
            <span className="ml-1">{Math.abs(trend)}%</span>
          </span>
          <span className="text-gray-500 ml-2">vs last week</span>
        </div>
      )}

      {/* Animated background gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 ${color}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-full h-full rounded-full bg-gradient-to-br from-current to-transparent"
        />
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Health System Analytics</h2>
          <p className="text-gray-600 mt-1">
            Real-time health statistics for migrant workers in Kerala
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Last Updated</div>
          <div className="text-sm font-medium">
            {lastUpdated.toLocaleTimeString()}
          </div>
          {isLoading && (
            <div className="flex items-center mt-2">
              <div className="animate-spin w-4 h-4 border-2 border-kerala-teal border-t-transparent rounded-full mr-2"></div>
              <span className="text-xs text-gray-500">Refreshing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Registered Workers"
          value={stats.totalWorkers.toLocaleString()}
          icon="👥"
          color="text-kerala-teal"
          trend={12}
        />
        
        <StatCard
          title="Health Records Created"
          value={stats.totalHealthRecords.toLocaleString()}
          icon="📋"
          color="text-neon-blue"
          trend={8}
        />
        
        <StatCard
          title="Active Disease Hotspots"
          value={stats.activeHotspots}
          icon="🔥"
          color="text-warning-orange"
          trend={-3}
        />
        
        <StatCard
          title="Critical Cases"
          value={stats.criticalCases}
          icon="🚨"
          color="text-error-red"
          trend={-15}
        />
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Today's Registrations"
          value={stats.registrationsToday}
          icon="📅"
          color="text-health-green"
        />
        
        <StatCard
          title="Voice Registrations"
          value={`${Math.round((stats.voiceRegistrations / Math.max(stats.totalHealthRecords, 1)) * 100)}%`}
          icon="🎤"
          color="text-purple-500"
        />
        
        <StatCard
          title="Anonymous Reports"
          value={stats.anonymousReports}
          icon="🔒"
          color="text-gray-500"
        />
      </div>

      {/* District Breakdown */}
      <div className="health-card p-6">
        <h3 className="text-lg font-semibold mb-6">District-wise Breakdown</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.districtBreakdown
            .sort((a, b) => b.workerCount - a.workerCount)
            .slice(0, 9)
            .map((district, index) => (
              <motion.div
                key={district.district}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900 capitalize">
                    {district.district}
                  </h4>
                  <div className="text-xs text-gray-500">
                    #{index + 1}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Workers:</span>
                    <span className="font-medium">{district.workerCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Health Cases:</span>
                    <span className="font-medium">{district.healthCases}</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.min((district.healthCases / Math.max(district.workerCount, 1)) * 100, 100)}%` 
                      }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                      className={`h-2 rounded-full ${
                        district.healthCases / district.workerCount > 0.1 
                          ? 'bg-error-red' 
                          : district.healthCases / district.workerCount > 0.05 
                            ? 'bg-warning-orange' 
                            : 'bg-health-green'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
          ))}
        </div>
      </div>

      {/* System Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="health-card p-6">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 rounded-full bg-health-green animate-pulse mr-3"></div>
            <h4 className="font-semibold">System Status</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Voice AI:</span>
              <span className="text-health-green font-medium">Online</span>
            </div>
            <div className="flex justify-between">
              <span>Database:</span>
              <span className="text-health-green font-medium">Connected</span>
            </div>
            <div className="flex justify-between">
              <span>SMS Service:</span>
              <span className="text-health-green font-medium">Active</span>
            </div>
          </div>
        </div>

        <div className="health-card p-6">
          <div className="flex items-center mb-4">
            <div className="text-2xl mr-3">🌍</div>
            <h4 className="font-semibold">Multi-language Usage</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>🇬🇧 English:</span>
              <span className="font-medium">45%</span>
            </div>
            <div className="flex justify-between">
              <span>🇮🇳 Hindi:</span>
              <span className="font-medium">25%</span>
            </div>
            <div className="flex justify-between">
              <span>🇮🇳 Malayalam:</span>
              <span className="font-medium">20%</span>
            </div>
            <div className="flex justify-between">
              <span>Others:</span>
              <span className="font-medium">10%</span>
            </div>
          </div>
        </div>

        <div className="health-card p-6">
          <div className="flex items-center mb-4">
            <div className="text-2xl mr-3">🎯</div>
            <h4 className="font-semibold">UN SDG Impact</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Health Access:</span>
              <span className="text-health-green font-medium">+{stats.totalWorkers}</span>
            </div>
            <div className="flex justify-between">
              <span>Inequality Reduction:</span>
              <span className="text-neon-blue font-medium">Active</span>
            </div>
            <div className="flex justify-between">
              <span>Community Building:</span>
              <span className="text-kerala-teal font-medium">Growing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthStats;