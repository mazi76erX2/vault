// User-related interfaces
export interface UserRow {
    id: number | string;
    type: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    telephone: string;
    company: string;
    companyId?: string;
    registeredSince: string;
    groups: string;
    securityLevel: string;
    department?: string;
    fieldOfExpertise?: string;
    yearsOfExperience?: string;
    userType?: number;
    roles: {
        administrator: boolean;
        validator: boolean;
        expert: boolean;
        collector: boolean;
        helper: boolean;
    };
}

export type ApiUserResponse = {
    id?: number | string;
    full_name?: string;
    username?: string;
    email?: string;
    telephone?: string;
    company_name?: string;
    company_id?: string;
    created_at?: string;
    registered_since?: string;
    field_of_expertise?: string;
    years_of_experience?: string;
    user_type?: number;
    isValidator?: boolean;
    user_access?: string;
    is_admin?: boolean;
    is_validator?: boolean;
    is_expert?: boolean;
    is_collector?: boolean;
    is_helper?: boolean;
    [key: string]: unknown;
};

// Directory-related interfaces
export interface DirectoryFormData {
    // Server Settings Tab
    directoryType: string;
    name: string;
    domain: string;
    host: string;
    port: string;
    username: string;
    password: string;
    syncInterval: string;
    searchTimeout: string;
    baseDN: string;
    userDN: string;
    groupDN: string;
    sslConnection: boolean;

    // User Schema Tab
    userObject: string;
    userFilter: string;
    userName: string;
    userObjectRDN: string;
    firstName: string;
    lastName: string;
    displayName: string;
    principalName: string;
    email: string;
    uniqueId: string;
    userGroups: string;

    // Group Schema Tab
    groupObject: string;
    groupFilter: string;
    fetchRecursively: boolean;
    groupUniqueId: string;
    groupName: string;
    groupDescription: string;
    groupMembers: string;
}

export interface LDAPUser {
    id: string;
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
    selected?: boolean;
}

export interface UserFormData {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    registeredSince: string;
    telephone: string;
    groups: string;
    securityLevel: string;
    department?: string;
    fieldOfExpertise?: string;
    yearsOfExperience?: string;
    userType?: number;
    roles: {
        administrator: boolean;
        validator: boolean;
        expert: boolean;
        collector: boolean;
        helper: boolean;
    };
}

export interface UserSaveData {
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    username?: string; 
    roles: string[];
    userId?: number | string;
}

// Component Props interfaces
export interface DirectoryBrowserProps {
    companyId: string;
    onCancel: () => void;
    onImportComplete: () => void;
}

export interface AddUserProps {
    companyId: string;
    onCancel: () => void;
    onUserAdded: () => void;
}

export interface UserDirectorySetupProps {
    companyId: string;
    onCancel: () => void;
    onSetupComplete: () => void;
} 