import RiskDashboard from '@/components/occupational-health/RiskDashboard';

export default function OccupationalHealthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <RiskDashboard workerId="worker_demo_123" language="en" />
      </div>
    </div>
  );
}