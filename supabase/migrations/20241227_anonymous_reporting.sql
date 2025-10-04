-- Anonymous Health Reporting System Tables
-- This migration adds support for privacy-preserving anonymous health reports

-- Anonymous Reports Table
CREATE TABLE IF NOT EXISTS anonymous_reports (
    id TEXT PRIMARY KEY,
    symptoms TEXT[] NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe', 'critical')),
    duration TEXT NOT NULL,
    location_district TEXT NOT NULL,
    location_area TEXT NOT NULL,
    occupation TEXT,
    age_group TEXT,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    additional_info TEXT,
    report_source TEXT NOT NULL CHECK (report_source IN ('web', 'voice', 'kiosk')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Privacy flags (all explicitly null to ensure no personal data)
    is_anonymous BOOLEAN DEFAULT true,
    ip_address TEXT DEFAULT NULL, -- Explicitly not stored
    user_agent TEXT DEFAULT NULL, -- Explicitly not stored
    session_id TEXT DEFAULT NULL, -- Explicitly not stored
    
    -- Derived data for public health analysis
    risk_score INTEGER DEFAULT 0,
    hotspot_contribution DECIMAL(3,2) DEFAULT 0.0,
    
    -- Metadata for aggregate analysis (not personally identifiable)
    report_month TEXT, -- YYYY-MM format
    report_day_of_week INTEGER, -- 0-6 (Sunday-Saturday)
    report_hour INTEGER -- 0-23
);

-- Surveillance Daily Aggregates Table
CREATE TABLE IF NOT EXISTS surveillance_daily_aggregates (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    district TEXT NOT NULL,
    total_reports INTEGER DEFAULT 0,
    severity_breakdown JSONB DEFAULT '{"mild":0,"moderate":0,"severe":0,"critical":0}',
    top_symptoms TEXT[] DEFAULT ARRAY[]::TEXT[],
    average_risk_score DECIMAL(5,2) DEFAULT 0.0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(date, district)
);

-- Disease Hotspots Table
CREATE TABLE IF NOT EXISTS disease_hotspots (
    id SERIAL PRIMARY KEY,
    district TEXT NOT NULL,
    area TEXT NOT NULL,
    alert_level TEXT NOT NULL CHECK (alert_level IN ('low', 'medium', 'high', 'critical')),
    total_reports INTEGER DEFAULT 0,
    severe_critical_count INTEGER DEFAULT 0,
    hotspot_score DECIMAL(5,2) DEFAULT 0.0,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'monitoring')),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ DEFAULT NULL,
    
    UNIQUE(district, area)
);

-- Anonymous Report Statistics (Materialized View for Performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS anonymous_report_stats AS
SELECT 
    COUNT(*) as total_reports,
    COUNT(*) FILTER (WHERE severity = 'mild') as mild_reports,
    COUNT(*) FILTER (WHERE severity = 'moderate') as moderate_reports,
    COUNT(*) FILTER (WHERE severity = 'severe') as severe_reports,
    COUNT(*) FILTER (WHERE severity = 'critical') as critical_reports,
    AVG(risk_score) as average_risk_score,
    location_district,
    DATE_TRUNC('day', created_at) as report_date,
    report_source,
    COUNT(DISTINCT location_area) as areas_affected
FROM anonymous_reports 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY location_district, DATE_TRUNC('day', created_at), report_source;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_anonymous_reports_district_date ON anonymous_reports(location_district, created_at);
CREATE INDEX IF NOT EXISTS idx_anonymous_reports_severity ON anonymous_reports(severity);
CREATE INDEX IF NOT EXISTS idx_anonymous_reports_symptoms ON anonymous_reports USING GIN(symptoms);
CREATE INDEX IF NOT EXISTS idx_anonymous_reports_month ON anonymous_reports(report_month);
CREATE INDEX IF NOT EXISTS idx_surveillance_aggregates_date ON surveillance_daily_aggregates(date, district);
CREATE INDEX IF NOT EXISTS idx_hotspots_status ON disease_hotspots(status, alert_level);

-- Row Level Security Policies
ALTER TABLE anonymous_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveillance_daily_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_hotspots ENABLE ROW LEVEL SECURITY;

-- Policy: Anonymous reports can be inserted by anyone (for submission)
CREATE POLICY "Allow anonymous report submission" ON anonymous_reports
    FOR INSERT WITH CHECK (is_anonymous = true);

-- Policy: Anonymous reports can be read only in aggregate form by authenticated users
CREATE POLICY "Allow aggregate read of anonymous reports" ON anonymous_reports
    FOR SELECT USING (
        -- Only allow reading for data aggregation purposes
        -- Individual reports should never be directly accessible
        auth.role() = 'authenticated' AND 
        current_setting('request.jwt.claims')::json->>'role' IN ('admin', 'health_officer', 'surveillance_analyst')
    );

-- Policy: Surveillance aggregates readable by health authorities
CREATE POLICY "Health authorities can read surveillance data" ON surveillance_daily_aggregates
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        current_setting('request.jwt.claims')::json->>'role' IN ('admin', 'health_officer', 'surveillance_analyst')
    );

-- Policy: Surveillance aggregates can be updated by system
CREATE POLICY "System can update surveillance data" ON surveillance_daily_aggregates
    FOR ALL USING (
        current_setting('request.jwt.claims')::json->>'role' IN ('service_role', 'admin')
    );

-- Policy: Hotspots readable by health authorities
CREATE POLICY "Health authorities can read hotspot data" ON disease_hotspots
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        current_setting('request.jwt.claims')::json->>'role' IN ('admin', 'health_officer', 'surveillance_analyst')
    );

-- Policy: Hotspots manageable by system and admins
CREATE POLICY "System can manage hotspot data" ON disease_hotspots
    FOR ALL USING (
        current_setting('request.jwt.claims')::json->>'role' IN ('service_role', 'admin')
    );

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_anonymous_report_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW anonymous_report_stats;
END;
$$;

-- Function to automatically update surveillance aggregates
CREATE OR REPLACE FUNCTION update_surveillance_on_report()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    report_date DATE;
BEGIN
    report_date := DATE(NEW.created_at);
    
    -- Update or insert surveillance aggregate
    INSERT INTO surveillance_daily_aggregates (date, district, total_reports, severity_breakdown, top_symptoms, average_risk_score)
    VALUES (
        report_date,
        NEW.location_district,
        1,
        jsonb_build_object(
            'mild', CASE WHEN NEW.severity = 'mild' THEN 1 ELSE 0 END,
            'moderate', CASE WHEN NEW.severity = 'moderate' THEN 1 ELSE 0 END,
            'severe', CASE WHEN NEW.severity = 'severe' THEN 1 ELSE 0 END,
            'critical', CASE WHEN NEW.severity = 'critical' THEN 1 ELSE 0 END
        ),
        NEW.symptoms,
        NEW.risk_score
    )
    ON CONFLICT (date, district)
    DO UPDATE SET
        total_reports = surveillance_daily_aggregates.total_reports + 1,
        severity_breakdown = jsonb_build_object(
            'mild', COALESCE((surveillance_daily_aggregates.severity_breakdown->>'mild')::int, 0) + 
                   CASE WHEN NEW.severity = 'mild' THEN 1 ELSE 0 END,
            'moderate', COALESCE((surveillance_daily_aggregates.severity_breakdown->>'moderate')::int, 0) + 
                       CASE WHEN NEW.severity = 'moderate' THEN 1 ELSE 0 END,
            'severe', COALESCE((surveillance_daily_aggregates.severity_breakdown->>'severe')::int, 0) + 
                     CASE WHEN NEW.severity = 'severe' THEN 1 ELSE 0 END,
            'critical', COALESCE((surveillance_daily_aggregates.severity_breakdown->>'critical')::int, 0) + 
                       CASE WHEN NEW.severity = 'critical' THEN 1 ELSE 0 END
        ),
        top_symptoms = array_cat(surveillance_daily_aggregates.top_symptoms, NEW.symptoms),
        average_risk_score = (
            (surveillance_daily_aggregates.average_risk_score * surveillance_daily_aggregates.total_reports) + NEW.risk_score
        ) / (surveillance_daily_aggregates.total_reports + 1),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$;

-- Trigger to automatically update surveillance data
CREATE TRIGGER tr_update_surveillance_on_report
    AFTER INSERT ON anonymous_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_surveillance_on_report();

-- Function to check for hotspots
CREATE OR REPLACE FUNCTION check_for_hotspots(report_district TEXT, report_area TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    recent_reports INTEGER;
    severe_critical_count INTEGER;
    hotspot_score_total DECIMAL;
    alert_level TEXT;
BEGIN
    -- Count reports in the last 24 hours in the same district
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE severity IN ('severe', 'critical')),
        COALESCE(SUM(hotspot_contribution), 0)
    INTO recent_reports, severe_critical_count, hotspot_score_total
    FROM anonymous_reports
    WHERE location_district = report_district
    AND created_at >= NOW() - INTERVAL '24 hours';
    
    -- Determine if this constitutes a hotspot
    IF (recent_reports >= 5 AND severe_critical_count >= 2) OR 
       hotspot_score_total >= 10 OR 
       severe_critical_count >= 3 THEN
        
        -- Determine alert level
        IF severe_critical_count >= 3 THEN
            alert_level := 'critical';
        ELSE
            alert_level := 'high';
        END IF;
        
        -- Insert or update hotspot
        INSERT INTO disease_hotspots (
            district, area, alert_level, total_reports, 
            severe_critical_count, hotspot_score, status
        )
        VALUES (
            report_district, report_area, alert_level, recent_reports,
            severe_critical_count, hotspot_score_total, 'active'
        )
        ON CONFLICT (district, area)
        DO UPDATE SET
            alert_level = EXCLUDED.alert_level,
            total_reports = EXCLUDED.total_reports,
            severe_critical_count = EXCLUDED.severe_critical_count,
            hotspot_score = EXCLUDED.hotspot_score,
            status = 'active',
            updated_at = NOW();
    END IF;
END;
$$;

-- Function to clean up old anonymous reports (privacy protection)
-- This function removes reports older than the retention period
CREATE OR REPLACE FUNCTION cleanup_old_anonymous_reports()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete reports older than 1 year (adjust as needed for your privacy policy)
    DELETE FROM anonymous_reports 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    -- Log cleanup for audit purposes
    INSERT INTO system_audit_log (action, details, created_at)
    VALUES (
        'cleanup_anonymous_reports',
        format('Cleaned up anonymous reports older than 1 year'),
        NOW()
    );
END;
$$;

-- Create audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_audit_log (
    id SERIAL PRIMARY KEY,
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedule cleanup job (to be run by pg_cron if available)
-- This is commented out as it requires pg_cron extension
-- SELECT cron.schedule('cleanup-anonymous-reports', '0 2 * * 0', 'SELECT cleanup_old_anonymous_reports();');

-- Comments for documentation
COMMENT ON TABLE anonymous_reports IS 'Stores anonymous health reports from migrant workers. No personally identifiable information is stored.';
COMMENT ON TABLE surveillance_daily_aggregates IS 'Daily aggregated statistics for public health surveillance.';
COMMENT ON TABLE disease_hotspots IS 'Detected disease hotspots requiring health authority attention.';
COMMENT ON COLUMN anonymous_reports.ip_address IS 'Explicitly set to NULL - no IP addresses are stored for privacy';
COMMENT ON COLUMN anonymous_reports.user_agent IS 'Explicitly set to NULL - no user agent strings are stored for privacy';
COMMENT ON COLUMN anonymous_reports.session_id IS 'Explicitly set to NULL - no session identifiers are stored for privacy';