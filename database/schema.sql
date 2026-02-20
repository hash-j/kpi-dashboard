-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Create trigger for users updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create team members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create social_media_kpis table
CREATE TABLE IF NOT EXISTS social_media_kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    team_member_ids TEXT[] DEFAULT '{}',
    date DATE NOT NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('Reddit', 'TikTok', 'Instagram', 'Facebook', 'YouTube')),
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 10),
    quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create website_seo_kpis table
CREATE TABLE IF NOT EXISTS website_seo_kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    team_member_ids TEXT[] DEFAULT '{}',
    date DATE NOT NULL,
    changes_asked INTEGER DEFAULT 0,
    changes_asked_details TEXT[] DEFAULT '{}',
    changes_asked_statuses TEXT[] DEFAULT '{}',
    blogs_posted INTEGER DEFAULT 0,
    updates INTEGER DEFAULT 0,
    ranking_issues BOOLEAN DEFAULT FALSE,
    ranking_issues_description TEXT DEFAULT '',
    reports_sent BOOLEAN DEFAULT FALSE,
    backlinks INTEGER DEFAULT 0,
    domain_authority INTEGER CHECK (domain_authority >= 0 AND domain_authority <= 100),
    page_authority INTEGER CHECK (page_authority >= 0 AND page_authority <= 100),
    keyword_pass INTEGER DEFAULT 0,
    site_health INTEGER DEFAULT 0,
    issues INTEGER DEFAULT 0,
    gmb_updates INTEGER DEFAULT 0,
    gmb_changes_count INTEGER DEFAULT 0,
    gmb_changes_details TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ads_kpis table
CREATE TABLE IF NOT EXISTS ads_kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    team_member_ids TEXT[] DEFAULT '{}',
    date DATE NOT NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('Facebook ADS', 'Google ADS', 'Go High Level', 'Closings')),
    cost_per_lead DECIMAL(10,2),
    quality_of_ads INTEGER CHECK (quality_of_ads >= 0 AND quality_of_ads <= 10),
    lead_quality INTEGER CHECK (lead_quality >= 0 AND lead_quality <= 10),
    closing_ratio DECIMAL(5,2),
    quantity_leads INTEGER DEFAULT 0,
    keyword_refinement INTEGER CHECK (keyword_refinement >= 0 AND keyword_refinement <= 10),
    cost_per_click DECIMAL(10,2),
    conversions INTEGER DEFAULT 0,
    closing INTEGER DEFAULT 0,
    tracking INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create email_marketing_kpis table
CREATE TABLE IF NOT EXISTS email_marketing_kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    team_member_ids TEXT[] DEFAULT '{}',
    date DATE NOT NULL,
    template_quality INTEGER CHECK (template_quality >= 0 AND template_quality <= 10),
    emails_sent INTEGER DEFAULT 0,
    opening_ratio DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create client_responses table
CREATE TABLE IF NOT EXISTS client_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    team_member_ids TEXT[] DEFAULT '{}',
    date DATE NOT NULL,
    review_rating INTEGER CHECK (review_rating >= 1 AND review_rating <= 5),
    review_comment TEXT,
    miscellaneous_work TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create team_kpis table
CREATE TABLE IF NOT EXISTS team_kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    tasks_assigned INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 10),
    responsibility_score INTEGER CHECK (responsibility_score >= 0 AND responsibility_score <= 10),
    punctuality_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_social_media_client_date ON social_media_kpis(client_id, date);
CREATE INDEX idx_website_seo_client_date ON website_seo_kpis(client_id, date);
CREATE INDEX idx_ads_client_date ON ads_kpis(client_id, date);
CREATE INDEX idx_email_client_date ON email_marketing_kpis(client_id, date);
CREATE INDEX idx_responses_client_date ON client_responses(client_id, date);
CREATE INDEX idx_team_member_date ON team_kpis(team_member_id, date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_social_media_updated_at BEFORE UPDATE ON social_media_kpis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_website_seo_updated_at BEFORE UPDATE ON website_seo_kpis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON ads_kpis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_updated_at BEFORE UPDATE ON email_marketing_kpis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_responses_updated_at BEFORE UPDATE ON client_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_updated_at BEFORE UPDATE ON team_kpis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create activity_log table for tracking user actions
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('user_added', 'user_edited', 'client_added', 'client_edited', 'team_member_added', 'team_member_edited', 'data_added', 'data_edited', 'report_generated')),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('user', 'client', 'team_member', 'social_media', 'ads', 'email_marketing', 'website_seo', 'client_responses', 'team_kpis')),
    entity_id UUID,
    entity_name VARCHAR(255),
    tab_name VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for activity_log
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_action_type ON activity_log(action_type);