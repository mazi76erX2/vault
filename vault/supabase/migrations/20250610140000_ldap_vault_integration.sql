-- LDAP Connector Vault Integration Migration
-- This migration enhances the LDAP connectors table to use Supabase Vault for secure password storage
-- and adds additional fields for better LDAP management

-- Enable Supabase Vault extension if not already enabled
CREATE EXTENSION IF NOT EXISTS supabase_vault;

-- Add comment to explain password storage change
COMMENT ON COLUMN public.ldap_connectors.bind_password IS 'Stores Supabase Vault secret UUID for encrypted password storage';

-- Add new columns for enhanced LDAP functionality
ALTER TABLE public.ldap_connectors 
ADD COLUMN IF NOT EXISTS domain text,
ADD COLUMN IF NOT EXISTS base_dn text,
ADD COLUMN IF NOT EXISTS user_dn text,
ADD COLUMN IF NOT EXISTS group_dn text,
ADD COLUMN IF NOT EXISTS user_object text DEFAULT 'user',
ADD COLUMN IF NOT EXISTS group_object text DEFAULT 'group',
ADD COLUMN IF NOT EXISTS group_object_filter text DEFAULT '(&(objectCategory=Group)(name=*))',
ADD COLUMN IF NOT EXISTS attribute_username_rdn text DEFAULT 'cn',
ADD COLUMN IF NOT EXISTS attribute_first_name text DEFAULT 'givenName',
ADD COLUMN IF NOT EXISTS attribute_last_name text DEFAULT 'sn',
ADD COLUMN IF NOT EXISTS attribute_display_name text DEFAULT 'displayName',
ADD COLUMN IF NOT EXISTS attribute_principal_name text DEFAULT 'userPrincipalName',
ADD COLUMN IF NOT EXISTS attribute_email text DEFAULT 'mail',
ADD COLUMN IF NOT EXISTS attribute_user_guid text DEFAULT 'objectGUID',
ADD COLUMN IF NOT EXISTS attribute_user_groups text DEFAULT 'memberOf',
ADD COLUMN IF NOT EXISTS attribute_group_guid text DEFAULT 'objectGUID',
ADD COLUMN IF NOT EXISTS attribute_group_name text DEFAULT 'cn',
ADD COLUMN IF NOT EXISTS attribute_group_description text DEFAULT 'description',
ADD COLUMN IF NOT EXISTS attribute_group_members text DEFAULT 'member',
ADD COLUMN IF NOT EXISTS group_recursive boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS sync_interval integer DEFAULT 60,
ADD COLUMN IF NOT EXISTS connection_timeout integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS read_timeout integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS search_timeout integer DEFAULT 60,
ADD COLUMN IF NOT EXISTS last_modified_by uuid;

-- Add foreign key constraint for last_modified_by
ALTER TABLE public.ldap_connectors 
ADD CONSTRAINT ldap_connectors_last_modified_by_fkey 
FOREIGN KEY (last_modified_by) REFERENCES public.profiles (id);

-- Update existing records to set default values for new columns
UPDATE public.ldap_connectors 
SET 
    user_object = 'user',
    group_object = 'group',
    group_object_filter = '(&(objectCategory=Group)(name=*))',
    attribute_username_rdn = 'cn',
    attribute_first_name = 'givenName',
    attribute_last_name = 'sn',
    attribute_display_name = 'displayName',
    attribute_principal_name = 'userPrincipalName',
    attribute_email = 'mail',
    attribute_user_guid = 'objectGUID',
    attribute_user_groups = 'memberOf',
    attribute_group_guid = 'objectGUID',
    attribute_group_name = 'cn',
    attribute_group_description = 'description',
    attribute_group_members = 'member',
    group_recursive = true,
    active = true,
    sync_interval = 60,
    connection_timeout = 30,
    read_timeout = 30,
    search_timeout = 60
WHERE 
    user_object IS NULL OR
    group_object IS NULL OR
    group_object_filter IS NULL OR
    attribute_username_rdn IS NULL OR
    attribute_first_name IS NULL OR
    attribute_last_name IS NULL OR
    attribute_display_name IS NULL OR
    attribute_principal_name IS NULL OR
    attribute_email IS NULL OR
    attribute_user_guid IS NULL OR
    attribute_user_groups IS NULL OR
    attribute_group_guid IS NULL OR
    attribute_group_name IS NULL OR
    attribute_group_description IS NULL OR
    attribute_group_members IS NULL OR
    group_recursive IS NULL OR
    active IS NULL OR
    sync_interval IS NULL OR
    connection_timeout IS NULL OR
    read_timeout IS NULL OR
    search_timeout IS NULL;

-- Create function to retrieve LDAP password from Vault
CREATE OR REPLACE FUNCTION public.get_ldap_password(connector_id uuid)
RETURNS text AS $$
DECLARE
    secret_id uuid;
    decrypted_password text;
BEGIN
    -- Get the secret ID from the connector
    SELECT bind_password::uuid INTO secret_id
    FROM public.ldap_connectors
    WHERE id = connector_id;
    
    IF secret_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Retrieve the decrypted password from Vault
    SELECT decrypted_secret INTO decrypted_password
    FROM vault.decrypted_secrets
    WHERE id = secret_id;
    
    RETURN decrypted_password;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing RLS policies to recreate them with proper syntax
DROP POLICY IF EXISTS "Users can only see LDAP connectors from their company" ON public.ldap_connectors;

-- Create enhanced RLS policies for LDAP connectors
-- Policy: Users can only see connectors from their own company
CREATE POLICY "ldap_connectors_company_isolation" ON public.ldap_connectors
FOR ALL USING (
    company_id IN (
        SELECT c.id 
        FROM public.companies c
        JOIN public.profiles p ON p.company_reg_no = c.company_reg_no
        WHERE p.id = auth.uid()
    )
);

-- Policy: Only admins can INSERT LDAP connectors
CREATE POLICY "ldap_connectors_admin_insert" ON public.ldap_connectors
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM public.profiles p
        JOIN public.user_roles ur ON ur.user_id = p.id
        JOIN public.roles r ON r.id = ur.role_id
        WHERE p.id = auth.uid() 
        AND r.name IN ('admin', 'system_admin', 'Administrator')
    )
);

-- Policy: Only admins can UPDATE LDAP connectors
CREATE POLICY "ldap_connectors_admin_update" ON public.ldap_connectors
FOR UPDATE USING (
    EXISTS (
        SELECT 1 
        FROM public.profiles p
        JOIN public.user_roles ur ON ur.user_id = p.id
        JOIN public.roles r ON r.id = ur.role_id
        WHERE p.id = auth.uid() 
        AND r.name IN ('admin', 'system_admin', 'Administrator')
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM public.profiles p
        JOIN public.user_roles ur ON ur.user_id = p.id
        JOIN public.roles r ON r.id = ur.role_id
        WHERE p.id = auth.uid() 
        AND r.name IN ('admin', 'system_admin', 'Administrator')
    )
);

-- Policy: Only admins can DELETE LDAP connectors
CREATE POLICY "ldap_connectors_admin_delete" ON public.ldap_connectors
FOR DELETE USING (
    EXISTS (
        SELECT 1 
        FROM public.profiles p
        JOIN public.user_roles ur ON ur.user_id = p.id
        JOIN public.roles r ON r.id = ur.role_id
        WHERE p.id = auth.uid() 
        AND r.name IN ('admin', 'system_admin', 'Administrator')
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ldap_connectors_domain ON public.ldap_connectors (domain);
CREATE INDEX IF NOT EXISTS idx_ldap_connectors_status ON public.ldap_connectors (status);
CREATE INDEX IF NOT EXISTS idx_ldap_connectors_last_sync ON public.ldap_connectors (last_sync);
CREATE INDEX IF NOT EXISTS idx_ldap_connectors_last_modified_by ON public.ldap_connectors (last_modified_by);

-- Add comments for documentation
COMMENT ON TABLE public.ldap_connectors IS 'LDAP connector configurations with Supabase Vault integration for secure password storage';
COMMENT ON COLUMN public.ldap_connectors.bind_password IS 'UUID reference to Supabase Vault secret containing encrypted LDAP bind password';
COMMENT ON COLUMN public.ldap_connectors.user_attributes IS 'JSON mapping of user attributes for LDAP synchronization';
COMMENT ON COLUMN public.ldap_connectors.domain IS 'LDAP domain name';
COMMENT ON COLUMN public.ldap_connectors.base_dn IS 'Base Distinguished Name for LDAP searches';
COMMENT ON COLUMN public.ldap_connectors.user_dn IS 'User organizational unit DN';
COMMENT ON COLUMN public.ldap_connectors.group_dn IS 'Group organizational unit DN';
COMMENT ON FUNCTION public.get_ldap_password(uuid) IS 'Securely retrieves LDAP password from Supabase Vault by connector ID'; 