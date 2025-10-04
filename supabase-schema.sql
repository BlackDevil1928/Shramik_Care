-- Kerala Migrant Health System Database Schema
-- Created for Supabase PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geographical data if needed

-- Create custom types
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE occupation_type AS ENUM ('construction', 'fishing', 'factory', 'agriculture', 'domestic', 'transport', 'other');
CREATE TYPE severity_type AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE reported_via_type AS ENUM ('voice', 'text', 'kiosk');
CREATE TYPE user_role_type AS ENUM ('admin', 'doctor', 'health_officer');
CREATE TYPE language_type AS ENUM ('en', 'hi', 'bn', 'or', 'ta', 'ne', 'ml');

-- Migrant Workers Table
CREATE TABLE migrant_workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mhi_id VARCHAR(20) UNIQUE NOT NULL, -- Migrant Health ID (e.g., KER12345678ABCD)
    name VARCHAR(100) NOT NULL,
    age INTEGER CHECK (age > 0 AND age < 120),
    gender gender_type NOT NULL,
    phone VARCHAR(15),
    languages language_type[] DEFAULT ARRAY['en']::language_type[],
    employer VARCHAR(100),
    occupation occupation_type NOT NULL,
    current_location JSONB NOT NULL, -- {district, panchayat, coordinates: {lat, lng}}
    profile_photo_url TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(15),
    medical_conditions TEXT[], -- Pre-existing conditions
    allergies TEXT[],
    vaccination_status JSONB, -- {covid: {doses: 2, last_date: '2023-01-01'}, etc}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT TRUE
);

-- Health Records Table
CREATE TABLE health_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id VARCHAR(50) NOT NULL, -- Can be UUID for registered users or 'anonymous'
    symptoms TEXT[] NOT NULL,
    condition VARCHAR(200),
    severity severity_type NOT NULL DEFAULT 'low',
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reported_via reported_via_type NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    location JSONB NOT NULL, -- {district, panchayat, coordinates: {lat, lng}}
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    diagnosis TEXT,
    treatment_given TEXT,
    prescribed_medicines JSONB,
    doctor_notes TEXT,
    attended_by UUID REFERENCES auth.users(id), -- Doctor/Health officer who attended
    reference_number VARCHAR(20) UNIQUE, -- For tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice Sessions Table (for Vapi.ai integration)
CREATE TABLE voice_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id VARCHAR(100) UNIQUE, -- Vapi call ID
    worker_id VARCHAR(50), -- Can be NULL for anonymous calls
    language language_type NOT NULL DEFAULT 'en',
    transcript TEXT,
    extracted_data JSONB, -- Structured data extracted from voice
    session_duration INTEGER, -- in seconds
    call_status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
    webhook_data JSONB, -- Raw webhook data from Vapi
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Users Table (extends auth.users)
CREATE TABLE admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role_type NOT NULL DEFAULT 'health_officer',
    permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    district_access TEXT[], -- Districts they can access
    phone VARCHAR(15),
    organization VARCHAR(100),
    license_number VARCHAR(50), -- Medical license for doctors
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disease Surveillance Table
CREATE TABLE disease_surveillance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district VARCHAR(50) NOT NULL,
    panchayat VARCHAR(100),
    disease_type VARCHAR(100) NOT NULL,
    cases_count INTEGER DEFAULT 1,
    location_coordinates JSONB, -- {lat, lng}
    date_reported DATE NOT NULL DEFAULT CURRENT_DATE,
    severity_level severity_type DEFAULT 'low',
    status VARCHAR(20) DEFAULT 'active', -- active, resolved, monitoring
    alert_triggered BOOLEAN DEFAULT FALSE,
    alert_threshold INTEGER DEFAULT 5, -- Trigger alert after this many cases
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Occupational Health Risks Reference Table
CREATE TABLE occupational_risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    occupation occupation_type NOT NULL,
    common_diseases TEXT[] NOT NULL,
    risk_factors TEXT[] NOT NULL,
    prevention_tips TEXT[] NOT NULL,
    seasonal_risks JSONB, -- {monsoon: [...], summer: [...], winter: [...]}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS Notifications Log
CREATE TABLE sms_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_phone VARCHAR(15) NOT NULL,
    message TEXT NOT NULL,
    language language_type DEFAULT 'en',
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, failed
    sms_provider_id VARCHAR(100), -- Provider's message ID
    purpose VARCHAR(50), -- mhi_confirmation, health_alert, appointment, etc.
    related_record_id UUID, -- Related health record or worker ID
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health Facility/Kiosk Locations
CREATE TABLE health_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- hospital, clinic, kiosk, mobile_unit
    address TEXT NOT NULL,
    district VARCHAR(50) NOT NULL,
    panchayat VARCHAR(100),
    coordinates JSONB NOT NULL, -- {lat, lng}
    contact_phone VARCHAR(15),
    operating_hours JSONB, -- {monday: {open: '09:00', close: '17:00'}, ...}
    services_available TEXT[],
    capacity INTEGER,
    current_load INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_migrant_workers_mhi_id ON migrant_workers(mhi_id);
CREATE INDEX idx_migrant_workers_phone ON migrant_workers(phone);
CREATE INDEX idx_migrant_workers_location ON migrant_workers USING GIN(current_location);
CREATE INDEX idx_health_records_worker_id ON health_records(worker_id);
CREATE INDEX idx_health_records_reported_at ON health_records(reported_at DESC);
CREATE INDEX idx_health_records_location ON health_records USING GIN(location);
CREATE INDEX idx_health_records_severity ON health_records(severity);
CREATE INDEX idx_voice_sessions_call_id ON voice_sessions(call_id);
CREATE INDEX idx_disease_surveillance_district ON disease_surveillance(district);
CREATE INDEX idx_disease_surveillance_date ON disease_surveillance(date_reported DESC);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE migrant_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_surveillance ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for migrant_workers
CREATE POLICY "Workers can view own records" ON migrant_workers
    FOR SELECT USING (id = auth.uid() OR mhi_id = current_setting('app.current_mhi_id', true));

CREATE POLICY "Admins can view all workers" ON migrant_workers
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() 
            AND is_active = true
        )
    );

CREATE POLICY "System can insert workers" ON migrant_workers
    FOR INSERT WITH CHECK (true);

-- Policies for health_records
CREATE POLICY "Anonymous records are viewable by admins" ON health_records
    FOR SELECT TO authenticated USING (
        is_anonymous = true AND 
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() 
            AND is_active = true
        )
    );

CREATE POLICY "Worker records viewable by worker and admins" ON health_records
    FOR SELECT USING (
        worker_id = auth.uid()::text OR
        (worker_id = current_setting('app.current_mhi_id', true) AND worker_id != 'anonymous') OR
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() 
            AND is_active = true
        )
    );

CREATE POLICY "System can insert health records" ON health_records
    FOR INSERT WITH CHECK (true);

-- Policies for admin_users
CREATE POLICY "Admins can view admin users" ON admin_users
    FOR SELECT TO authenticated USING (
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND is_active = true
        )
    );

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_migrant_workers_updated_at BEFORE UPDATE ON migrant_workers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_records_updated_at BEFORE UPDATE ON health_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_disease_surveillance_updated_at BEFORE UPDATE ON disease_surveillance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate reference number for health records
CREATE OR REPLACE FUNCTION generate_health_record_reference()
RETURNS TRIGGER AS $$
BEGIN
    NEW.reference_number = 'HR' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(nextval('health_record_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for health record reference numbers
CREATE SEQUENCE health_record_seq START 1;

-- Create trigger for reference number generation
CREATE TRIGGER generate_health_record_reference_trigger
    BEFORE INSERT ON health_records
    FOR EACH ROW EXECUTE FUNCTION generate_health_record_reference();

-- Function to check disease outbreak threshold
CREATE OR REPLACE FUNCTION check_disease_outbreak()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
    threshold INTEGER := 5; -- Default threshold
BEGIN
    -- Count cases in the same district for the same disease in last 7 days
    SELECT COUNT(*) INTO current_count
    FROM disease_surveillance
    WHERE district = NEW.district 
    AND disease_type = NEW.disease_type
    AND date_reported >= (CURRENT_DATE - INTERVAL '7 days');

    -- Trigger alert if threshold exceeded
    IF current_count >= threshold THEN
        NEW.alert_triggered = TRUE;
        
        -- Insert notification for health officers
        INSERT INTO sms_notifications (
            recipient_phone, 
            message, 
            purpose, 
            related_record_id
        ) VALUES (
            '+91XXXXXXXXXX', -- Replace with actual health officer phone
            'ALERT: Disease outbreak detected in ' || NEW.district || '. ' || NEW.disease_type || ' cases: ' || current_count,
            'outbreak_alert',
            NEW.id
        );
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for outbreak detection
CREATE TRIGGER check_disease_outbreak_trigger
    BEFORE INSERT ON disease_surveillance
    FOR EACH ROW EXECUTE FUNCTION check_disease_outbreak();

-- Insert default occupational risks data
INSERT INTO occupational_risks (occupation, common_diseases, risk_factors, prevention_tips) VALUES
('construction', 
 ARRAY['Heat stroke', 'Respiratory issues', 'Back injury', 'Cut wounds', 'Eye injuries'], 
 ARRAY['Sun exposure', 'Dust inhalation', 'Heavy lifting', 'Sharp tools', 'Heights'],
 ARRAY['Wear protective gear', 'Take frequent breaks', 'Stay hydrated', 'Use proper lifting techniques']
),
('fishing', 
 ARRAY['Skin diseases', 'Respiratory infections', 'Cut wounds', 'Dehydration', 'Sunburn'], 
 ARRAY['Water exposure', 'Sun exposure', 'Sharp hooks/nets', 'Long working hours'],
 ARRAY['Use sun protection', 'Treat cuts immediately', 'Stay hydrated', 'Wear protective clothing']
),
('factory', 
 ARRAY['Chemical exposure', 'Respiratory issues', 'Hearing loss', 'Repetitive strain'], 
 ARRAY['Chemical fumes', 'Noise', 'Repetitive motion', 'Poor ventilation'],
 ARRAY['Use protective equipment', 'Take regular breaks', 'Follow safety protocols', 'Report unsafe conditions']
),
('agriculture', 
 ARRAY['Pesticide poisoning', 'Heat stroke', 'Back injury', 'Skin allergies'], 
 ARRAY['Chemical exposure', 'Sun exposure', 'Physical strain', 'Allergens'],
 ARRAY['Use protective gear when spraying', 'Work during cooler hours', 'Use proper techniques', 'Wash thoroughly after work']
);

-- Create materialized view for disease surveillance dashboard
CREATE MATERIALIZED VIEW disease_hotspots AS
SELECT 
    district,
    disease_type,
    COUNT(*) as total_cases,
    MAX(severity_level) as max_severity,
    COUNT(*) FILTER (WHERE date_reported >= CURRENT_DATE - INTERVAL '7 days') as cases_last_week,
    AVG(ST_X((location_coordinates->>'lat')::numeric)) as avg_lat,
    AVG(ST_Y((location_coordinates->>'lng')::numeric)) as avg_lng,
    MAX(date_reported) as last_reported
FROM disease_surveillance
WHERE status = 'active'
GROUP BY district, disease_type
HAVING COUNT(*) >= 2; -- Only show if 2 or more cases

-- Create index on materialized view
CREATE INDEX idx_disease_hotspots_district ON disease_hotspots(district);

-- Refresh the materialized view (should be done periodically)
-- REFRESH MATERIALIZED VIEW disease_hotspots;