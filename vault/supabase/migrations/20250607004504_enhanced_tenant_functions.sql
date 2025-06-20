-- Enhanced Tenant Functions Migration
-- This migration adds advanced tenant isolation functions and utilities
-- that enhance the multi-tenancy capabilities of the AI Vault application

-- Function to validate companyRegNo exists
CREATE OR REPLACE FUNCTION validate_company_reg_no(reg_no text)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM companies WHERE company_reg_no = reg_no);
END;
$$ LANGUAGE plpgsql;

-- Function to get tenant-specific roles for a user
CREATE OR REPLACE FUNCTION get_user_roles_for_tenant(user_id uuid, reg_no text)
RETURNS TABLE(role_id uuid, role_name text) AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.name
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_id 
    AND ur.company_reg_no = reg_no;
END;
$$ LANGUAGE plpgsql;

-- Function to get tenant statistics
CREATE OR REPLACE FUNCTION get_tenant_statistics(reg_no text)
RETURNS TABLE(
    company_name text,
    total_users BIGINT,
    active_sessions BIGINT,
    total_documents BIGINT,
    last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.name,
        COUNT(DISTINCT p.id) as total_users,
        COUNT(DISTINCT CASE WHEN s.status = 'Started' OR s.status = 'In Progress' THEN s.id END) as active_sessions,
        COUNT(DISTINCT d.doc_id) as total_documents,
        MAX(GREATEST(
            COALESCE(p.updated_at, p.created_at),
            COALESCE(s.updated_at, s.created_at),
            COALESCE(d.updated_at, d.created_at)
        )) as last_activity
    FROM companies c
    LEFT JOIN profiles p ON c.company_reg_no = p.company_reg_no
    LEFT JOIN sessions s ON c.company_reg_no = p.company_reg_no AND s.user_id = p.id
    LEFT JOIN documents d ON d.reviewer = p.id
    WHERE c.company_reg_no = reg_no
    GROUP BY c.company_reg_no, c.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get all tenants summary
CREATE OR REPLACE FUNCTION get_all_tenants_summary()
RETURNS TABLE(
    company_reg_no text,
    company_name text,
    user_count BIGINT,
    active_sessions BIGINT,
    document_count BIGINT,
    last_activity TIMESTAMP WITH TIME ZONE,
    activity_status text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.company_reg_no,
        c.name as company_name,
        COUNT(DISTINCT p.id) as user_count,
        COUNT(DISTINCT CASE WHEN s.status = 'Started' OR s.status = 'In Progress' THEN s.id END) as active_sessions,
        COUNT(DISTINCT d.doc_id) as document_count,
        MAX(GREATEST(
            COALESCE(p.updated_at, p.created_at),
            COALESCE(s.updated_at, s.created_at),
            COALESCE(d.updated_at, d.created_at)
        )) as last_activity,
        CASE 
            WHEN MAX(GREATEST(
                COALESCE(p.updated_at, p.created_at),
                COALESCE(s.updated_at, s.created_at),
                COALESCE(d.updated_at, d.created_at)
            )) > NOW() - INTERVAL '30 days' THEN 'Active'
            WHEN MAX(GREATEST(
                COALESCE(p.updated_at, p.created_at),
                COALESCE(s.updated_at, s.created_at),
                COALESCE(d.updated_at, d.created_at)
            )) > NOW() - INTERVAL '90 days' THEN 'Inactive'
            ELSE 'Dormant'
        END as activity_status
    FROM companies c
    LEFT JOIN profiles p ON c.company_reg_no = p.company_reg_no
    LEFT JOIN sessions s ON s.user_id = p.id
    LEFT JOIN documents d ON d.reviewer = p.id
    GROUP BY c.company_reg_no, c.name
    ORDER BY last_activity DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a view for tenant health monitoring
CREATE OR REPLACE VIEW v_tenant_health AS
SELECT 
    c.company_reg_no,
    c.name as company_name,
    COUNT(DISTINCT p.id) as user_count,
    COUNT(DISTINCT CASE WHEN s.status = 'Started' OR s.status = 'In Progress' THEN s.id END) as active_sessions,
    COUNT(DISTINCT d.doc_id) as document_count,
    MAX(GREATEST(
        COALESCE(p.updated_at, p.created_at),
        COALESCE(s.updated_at, s.created_at),
        COALESCE(d.updated_at, d.created_at)
    )) as last_activity,
    CASE 
        WHEN MAX(GREATEST(
            COALESCE(p.updated_at, p.created_at),
            COALESCE(s.updated_at, s.created_at),
            COALESCE(d.updated_at, d.created_at)
        )) > NOW() - INTERVAL '30 days' THEN 'Active'
        WHEN MAX(GREATEST(
            COALESCE(p.updated_at, p.created_at),
            COALESCE(s.updated_at, s.created_at),
            COALESCE(d.updated_at, d.created_at)
        )) > NOW() - INTERVAL '90 days' THEN 'Inactive'
        ELSE 'Dormant'
    END as activity_status
FROM companies c
LEFT JOIN profiles p ON c.company_reg_no = p.company_reg_no
LEFT JOIN sessions s ON s.user_id = p.id
LEFT JOIN documents d ON d.reviewer = p.id
GROUP BY c.company_reg_no, c.name
ORDER BY last_activity DESC;

-- Add missing company_reg_no columns to tables that don't have them yet
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS company_reg_no text;

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS company_reg_no text;

-- Create indexes for performance on new columns
CREATE INDEX IF NOT EXISTS idx_sessions_company_reg_no ON sessions(company_reg_no);
CREATE INDEX IF NOT EXISTS idx_documents_company_reg_no ON documents(company_reg_no);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_sessions_user_company ON sessions(user_id, company_reg_no);
CREATE INDEX IF NOT EXISTS idx_documents_reviewer_company ON documents(reviewer, company_reg_no);

-- Function to automatically set company_reg_no for sessions based on user
CREATE OR REPLACE FUNCTION set_session_company_reg_no()
RETURNS TRIGGER AS $$
BEGIN
    -- If company_reg_no is not set, get it from the user's profile
    IF NEW.company_reg_no IS NULL THEN
        SELECT company_reg_no INTO NEW.company_reg_no 
        FROM profiles 
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically set company_reg_no for documents based on reviewer
CREATE OR REPLACE FUNCTION set_document_company_reg_no()
RETURNS TRIGGER AS $$
BEGIN
    -- If company_reg_no is not set and reviewer exists, get it from the reviewer's profile
    IF NEW.company_reg_no IS NULL AND NEW.reviewer IS NOT NULL THEN
        SELECT company_reg_no INTO NEW.company_reg_no 
        FROM profiles 
        WHERE id = NEW.reviewer;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically populate company_reg_no
CREATE TRIGGER trigger_sessions_set_company_reg_no
    BEFORE INSERT OR UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION set_session_company_reg_no();

CREATE TRIGGER trigger_documents_set_company_reg_no
    BEFORE INSERT OR UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION set_document_company_reg_no();

-- Update existing records to populate company_reg_no
UPDATE sessions 
SET company_reg_no = p.company_reg_no
FROM profiles p
WHERE sessions.user_id = p.id 
AND sessions.company_reg_no IS NULL
AND p.company_reg_no IS NOT NULL;

UPDATE documents 
SET company_reg_no = p.company_reg_no
FROM profiles p
WHERE documents.reviewer = p.id 
AND documents.company_reg_no IS NULL
AND p.company_reg_no IS NOT NULL;

-- Create a validation view to check tenant data consistency
CREATE OR REPLACE VIEW v_tenant_data_validation AS
SELECT 
    'Companies without company_reg_no' as check_name,
    COUNT(*) as count
FROM companies 
WHERE company_reg_no IS NULL OR company_reg_no = ''
UNION ALL
SELECT 
    'Profiles without company_reg_no (but with company_id)' as check_name,
    COUNT(*) as count
FROM profiles 
WHERE company_reg_no IS NULL AND company_id IS NOT NULL
UNION ALL
SELECT 
    'Sessions without company_reg_no' as check_name,
    COUNT(*) as count
FROM sessions 
WHERE company_reg_no IS NULL
UNION ALL
SELECT 
    'Documents without company_reg_no (but with reviewer)' as check_name,
    COUNT(*) as count
FROM documents 
WHERE company_reg_no IS NULL AND reviewer IS NOT NULL
UNION ALL
SELECT 
    'User_roles without company_reg_no' as check_name,
    COUNT(*) as count
FROM user_roles 
WHERE company_reg_no IS NULL;

-- Function to generate a company registration number from company name
CREATE OR REPLACE FUNCTION generate_company_reg_no(company_name text)
RETURNS text AS $$
DECLARE
    base_reg_no text;
    final_reg_no text;
    counter INTEGER := 1;
BEGIN
    -- Generate base registration number from company name
    base_reg_no := UPPER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(company_name, '[^a-zA-Z0-9]', '', 'g'),
            '(.{1,10}).*', '\1'
        )
    );
    
    -- If base is empty, use 'COMP'
    IF base_reg_no = '' THEN
        base_reg_no := 'COMP';
    END IF;
    
    -- Add timestamp suffix to ensure uniqueness
    final_reg_no := base_reg_no || TO_CHAR(NOW(), 'YYYYMMDD');
    
    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (SELECT 1 FROM companies WHERE company_reg_no = final_reg_no) LOOP
        final_reg_no := base_reg_no || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(counter::text, 3, '0');
        counter := counter + 1;
    END LOOP;
    
    RETURN final_reg_no;
END;
$$ LANGUAGE plpgsql;

-- Ensure all companies have a company_reg_no
UPDATE companies 
SET company_reg_no = generate_company_reg_no(name)
WHERE company_reg_no IS NULL OR company_reg_no = '';

-- Add foreign key constraints for data integrity
ALTER TABLE sessions 
ADD CONSTRAINT fk_sessions_company_reg_no 
FOREIGN KEY (company_reg_no) REFERENCES companies(company_reg_no) 
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE documents 
ADD CONSTRAINT fk_documents_company_reg_no 
FOREIGN KEY (company_reg_no) REFERENCES companies(company_reg_no) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Comment on the migration
COMMENT ON FUNCTION validate_company_reg_no(text) IS 'Validates if a company registration number exists in the system';
COMMENT ON FUNCTION get_user_roles_for_tenant(uuid, text) IS 'Returns all roles for a user within a specific tenant';
COMMENT ON FUNCTION get_tenant_statistics(text) IS 'Returns comprehensive statistics for a specific tenant';
COMMENT ON FUNCTION get_all_tenants_summary() IS 'Returns summary statistics for all tenants in the system';
COMMENT ON VIEW v_tenant_health IS 'Provides health monitoring data for all tenants';
COMMENT ON VIEW v_tenant_data_validation IS 'Validates tenant data consistency across all tables';
