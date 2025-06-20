-- Seed data for HICO Vault
-- This file contains test data for development and testing

-- Insert test company
INSERT INTO public.companies (id, name, company_reg_no, contact_email, registered_since, created_at)
VALUES 
    (1, 'HICO Group', 'A001', 'admin@hico-group.com', '2024-01-01', NOW())
ON CONFLICT (company_reg_no) DO UPDATE SET
    name = EXCLUDED.name,
    contact_email = EXCLUDED.contact_email;

-- Insert user types
INSERT INTO public.user_types (id, name, description)
VALUES 
    (1, 'Administrator', 'System administrator with full access'),
    (2, 'Manager', 'Department manager with elevated privileges'),
    (3, 'Employee', 'Regular employee with standard access'),
    (4, 'Guest', 'Limited access guest user')
ON CONFLICT (name) DO NOTHING;

-- Insert basic roles
INSERT INTO public.roles (id, name, description)
VALUES 
    ('b86db406-e7b5-4cc0-ad2c-39cf0557f367', 'Administrator', 'Full system administrator'),
    ('c97eb507-f8c6-5dd1-be3d-40df0668f468', 'Manager', 'Department manager'),
    ('d08fc608-09d7-6ee2-cf4e-51e0779f569', 'Employee', 'Standard employee'),
    ('e19fd709-1ae8-7ff3-d05f-62f1880f670a', 'Guest', 'Guest user with limited access')
ON CONFLICT (name) DO NOTHING;

-- Note: The admin user profile will be created when someone first signs up through Supabase Auth
-- This ensures proper integration with Supabase's authentication system

-- Insert a sample LDAP connector configuration (inactive by default)
INSERT INTO public.ldap_connectors (
    id,
    name,
    server_url,
    bind_dn,
    bind_password,
    search_base,
    company_id,
    domain,
    user_object,
    group_object,
    status,
    created_by
)
VALUES (
    'f2af82ca-2bb7-8004-e160-73f2991f781b',
    'Sample LDAP Server',
    'ldap://example.com',
    'CN=service,CN=Users,DC=example,DC=com',
    'placeholder-will-use-vault',
    'DC=example,DC=com',
    1,
    'example.com',
    'user',
    'group',
    'inactive',
    NULL -- Will be set when an admin user is created
)
ON CONFLICT (name) DO NOTHING; 