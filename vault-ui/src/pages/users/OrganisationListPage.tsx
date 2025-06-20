import React, { useState, useEffect } from 'react';
import { Checkbox, FormControlLabel, Box, IconButton, Typography, Grid } from '@mui/material';
import { GridColDef, GridRenderCellParams, GridRowClassNameParams } from '@mui/x-data-grid';
import { HCButton, HCLoader, HCDataTable, HCTextField, error as showError, success } from 'generic-components';
import { HCIcon } from 'generic-components';
import { useAuthContext } from '../../hooks/useAuthContext';
import { VAULT_API_URL } from '../../config';
import { LoaderContainer } from '../../components';
import { FormSection, FormBox, TabContainer, Tab, FormRow } from './OrganisationDetailsPage';
import { getTodayISO, formatDateForDisplay } from '../../utils/dateUtils';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import UserDirectorySetup from './components/UserDirectorySetup';

// Import types from the centralized types folder
import { 
    UserRow, 
    ApiUserResponse, 
    LDAPUser, 
    UserFormData, 
    UserSaveData,
    DirectoryBrowserProps
} from './types';

// Import styled components from the styles folder
import {
    Container,
    ButtonContainer,
    CheckboxRow,
    Title,
    Subtitle,
    FieldLabel,
    InfoIconText,
    DirectoryTableContainer,
    DirectoryUserFormContainer,
    FormLabelTypography,
    RequiredFieldSpan,
    GridSpacingTop,
    RolesContainer,
    ImportButtonsContainer,
    MainTableContainer,
    AddFromDirectoryButton,
    AddUserButton,
    CancelButton,
    SaveButton,
    SaveDirectoryButton,
    CancelDirectoryButton,
    directoryTableSx,
    mainTableSx
} from './styles';

// New component for directory browser
const DirectoryBrowser = ({ companyId, onCancel, onImportComplete }: DirectoryBrowserProps) => {
    const [loading, setLoading] = useState(false);
    const [ldapUsers, setLdapUsers] = useState<LDAPUser[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<LDAPUser[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<string>(''); // Changed to single user
    const [importLoading, setImportLoading] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState({
        administrator: false,
        validator: false,
        expert: false,
        collector: false,
        helper: false
    });
    const authContext = useAuthContext();

    useEffect(() => {
        if (companyId) {
            fetchDirectoryUsers();
        }
    }, [companyId]);

    // Filter users based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredUsers(ldapUsers);
        } else {
            const filtered = ldapUsers.filter(user => 
                user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchTerm, ldapUsers]);

    const fetchDirectoryUsers = async () => {
        try {
            setLoading(true);
            
            // Get the current user with token from localStorage
            const currentUserJson = localStorage.getItem('currentUser');
            const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;
            
            if (!currentUser || !currentUser.token) {
                showError('Authentication token not found');
                return;
            }
            
            const response = await axios.get(`${VAULT_API_URL}/api/ldap/directory/users/${companyId}`, {
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                }
            });
            
            if (response.data) {
                console.log('Raw LDAP response:', response.data); // Debug log
                
                const users = response.data.map((user: any, index: number) => {
                    // Generate a unique ID with fallback options
                    const userId = user.directoryId || 
                                  user.name || 
                                  `${user.firstName}_${user.lastName}` || 
                                  `user_${index}`; // Ultimate fallback using array index
                    
                    return {
                        id: userId,
                        displayName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    email: user.email || '',
                    selected: false
                    };
                });
                
                console.log('Mapped LDAP users:', users); // Debug log
                
                // Validate all users have unique IDs
                const ids = users.map((u: any) => u.id);
                const uniqueIds = new Set(ids);
                if (ids.length !== uniqueIds.size) {
                    console.warn('Duplicate IDs detected in LDAP users:', ids);
                    // Add index suffix to duplicates
                    const seenIds = new Set();
                    users.forEach((user: any, index: number) => {
                        if (seenIds.has(user.id)) {
                            user.id = `${user.id}_${index}`;
                        }
                        seenIds.add(user.id);
                    });
                }
                
                setLdapUsers(users);
                setFilteredUsers(users);
            }
        } catch (err) {
            console.error('Error fetching directory users:', err);
            showError('Failed to fetch users from directory');
        } finally {
            setLoading(false);
        }
    };

    const handleUserSelect = (userId: string) => {
        // Single selection only - toggle if same user, otherwise select new user
        if (selectedUser === userId) {
            setSelectedUser('');
        } else {
            setSelectedUser(userId);
        }
    };

    const handleRowClick = (params: any) => {
        // Don't trigger selection if clicking on the checkbox column
        if (params.field === 'select') return;
        handleUserSelect(params.row.id as string);
    };

    const handleRoleChange = (role: keyof typeof selectedRoles) => {
        setSelectedRoles(prev => ({
            ...prev,
            [role]: !prev[role]
        }));
    };

    const handleImportUsers = async () => {
        if (!authContext?.isLoggedIn) {
            showError('You must be logged in to import users');
            return;
        }

        if (!selectedUser) {
            showError('Please select a user to import');
            return;
        }

        try {
            setImportLoading(true);
            
            // Get the current user with token from localStorage
            const currentUserJson = localStorage.getItem('currentUser');
            const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;
            
            if (!currentUser || !currentUser.token) {
                showError('Authentication token not found');
                return;
            }

            // Prepare roles array
            const rolesToAssign = Object.entries(selectedRoles)
                .filter(([_, isSelected]) => isSelected)
                .map(([role, _]) => role.charAt(0).toUpperCase() + role.slice(1));
            
            const userData = ldapUsers.find(user => user.id === selectedUser);
                
                if (userData) {
                const userImportData = {
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        email: userData.email,
                    telephone: '', // LDAP data might not have phone
                    company: '', // Will be set by backend based on company_id
                    roles: rolesToAssign
                };
                
                await axios.post(`${VAULT_API_URL}/api/user/update_user_details`, userImportData, {
                    headers: {
                        'Authorization': `Bearer ${currentUser.token}`
                    }
                });
            }
            
            success(`Successfully imported user with roles: ${rolesToAssign.join(', ')}`);
            onImportComplete();
        } catch (err) {
            console.error('Error importing user:', err);
            showError('Failed to import user from directory');
        } finally {
            setImportLoading(false);
        }
    };

    // Function to get row class name for DirectoryBrowser
    const getDirectoryRowClassName = (params: any) => {
        return params.id === selectedUser ? 'selected' : '';
    };

    const columns: GridColDef[] = [
        {
            field: 'displayName', 
            headerName: 'Display Name', 
            minWidth: 200,
            flex: 1.2
        },
        { 
            field: 'firstName', 
            headerName: 'First Name', 
            minWidth: 150,
            flex: 1
        },
        { 
            field: 'lastName', 
            headerName: 'Last Name', 
            minWidth: 150,
            flex: 1
        },
        { 
            field: 'email', 
            headerName: 'Email', 
            minWidth: 220,
            flex: 1.5
        },
    ];

    // Get the selected user for the form display
    const selectedUserData = selectedUser ? ldapUsers.find(user => user.id === selectedUser) : null;

    return (
        <>
            {loading ? (
                <LoaderContainer>
                    <HCLoader />
                </LoaderContainer>
            ) : (
                <>
                    
                    <DirectoryTableContainer>
                    <HCDataTable
                        autoHeight
                        columns={columns}
                        rows={filteredUsers as unknown as Record<string, unknown>[]}
                        pageLimit={5}
                        onRowClick={handleRowClick}
                        getRowClassName={getDirectoryRowClassName}
                        tableSx={directoryTableSx}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 5 }
                            }
                        }}
                    />
                    </DirectoryTableContainer>
                    
                    {/* User Details Form - Styled like Add User Form */}
                    {selectedUserData && (
                        <DirectoryUserFormContainer>                            
                            <Grid container spacing={2}>
                                {/* First Row */}
                                <Grid item xs={12} sm={6}>
                                    <Box>
                                        <FormLabelTypography>
                                            First Name <RequiredFieldSpan>*</RequiredFieldSpan>
                                        </FormLabelTypography>
                                        <HCTextField
                                            type="text"
                                            value={selectedUserData.firstName || ''}
                                            disabled={true}
                                            inputProps={{
                                                readOnly: true
                                            }}
                                        />
                    </Box>
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <Box>
                                        <FormLabelTypography>
                                            Last Name <RequiredFieldSpan>*</RequiredFieldSpan>
                                        </FormLabelTypography>
                                        <HCTextField
                                            type="text"
                                            value={selectedUserData.lastName || ''}
                                            disabled={true}
                                            inputProps={{
                                                readOnly: true
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>

                            <GridSpacingTop container spacing={2}>
                                {/* Second Row */}
                                <Grid item xs={12} sm={6}>
                                    <Box>
                                        <FormLabelTypography>
                                            Email Address <RequiredFieldSpan>*</RequiredFieldSpan>
                                        </FormLabelTypography>
                                        <HCTextField
                                            type="text"
                                            value={selectedUserData.email || ''}
                                            disabled={true}
                                            inputProps={{
                                                readOnly: true
                                            }}
                                        />
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <Box>
                                        <FormLabelTypography>
                                            Telephone Number <RequiredFieldSpan>*</RequiredFieldSpan>
                                        </FormLabelTypography>
                                        <HCTextField
                                            type="text"
                                            value=""
                                            disabled={true}
                                            inputProps={{
                                                readOnly: true
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            </GridSpacingTop>

                            <GridSpacingTop container spacing={2}>
                                {/* Third Row */}
                                <Grid item xs={12} sm={6}>
                                    <Box>
                                        <FormLabelTypography>
                                            Username <RequiredFieldSpan>*</RequiredFieldSpan>
                                        </FormLabelTypography>
                                        <HCTextField
                                            type="text"
                                            value={selectedUserData.displayName || ''}
                                            disabled={true}
                                            inputProps={{
                                                readOnly: true
                                            }}
                                        />
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <Box>
                                        <FormLabelTypography>
                                            Date Added <RequiredFieldSpan>*</RequiredFieldSpan>
                                        </FormLabelTypography>
                                        <HCTextField
                                            type="text"
                                            value={new Date().toLocaleDateString()}
                                            disabled={true}
                                            inputProps={{
                                                readOnly: true
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            </GridSpacingTop>

                            <GridSpacingTop container spacing={2}>
                                {/* Fourth Row */}
                                <Grid item xs={12} sm={6}>
                                    <Box>
                                        <FormLabelTypography>
                                            Groups
                                        </FormLabelTypography>
                                        <HCTextField
                                            type="text"
                                            value="0"
                                            disabled={true}
                                            inputProps={{
                                                readOnly: true
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            </GridSpacingTop>

                            <GridSpacingTop container spacing={2}>
                                {/* Fifth Row */}
                                <Grid item xs={12} sm={6}>
                                    <Box>
                                        <FormLabelTypography>
                                            Security Level
                                        </FormLabelTypography>
                                        <HCTextField
                                            type="text"
                                            value="Mid"
                                            disabled={true}
                                            inputProps={{
                                                readOnly: true
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            </GridSpacingTop>

                            {/* Role Checkboxes */}
                            <Box sx={{ mt: 3 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={2.4}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={selectedRoles.administrator}
                                                    onChange={() => handleRoleChange('administrator')}
                                                />
                                            }
                                            label="Administrator"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2.4}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={selectedRoles.validator}
                                                    onChange={() => handleRoleChange('validator')}
                                                />
                                            }
                                            label="Validator"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2.4}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={selectedRoles.expert}
                                                    onChange={() => handleRoleChange('expert')}
                                                />
                                            }
                                            label="Expert"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2.4}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={selectedRoles.collector}
                                                    onChange={() => handleRoleChange('collector')}
                                                />
                                            }
                                            label="Collector"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2.4}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={selectedRoles.helper}
                                                    onChange={() => handleRoleChange('helper')}
                                                />
                                            }
                                            label="Helper"
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </DirectoryUserFormContainer>
                    )}
                    
                    {/* Import Buttons */}
                    <ImportButtonsContainer>
                        <HCButton
                            hcVariant='secondary'
                            size='large'
                            text='Cancel'
                            onClick={onCancel}
                        />
                        <HCButton
                            disabled={!selectedUser || Object.values(selectedRoles).every(v => !v)}
                            hcVariant='primary'
                            size='large'
                            text={importLoading ? 'Importing...' : 'Import Selected User'}
                            onClick={handleImportUsers}
                        />
                    </ImportButtonsContainer>
                </>
            )}
        </>
    );
};

function OrganisationListPage() {
    const [activeTab, setActiveTab] = useState<'directory' | 'users' | 'security' | 'directory-browser'>('users');
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<UserRow[]>([]);
    const [selectedRow, setSelectedRow] = useState<UserRow | null>(null);
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [showDirectoryBrowser, setShowDirectoryBrowser] = useState(false);
    const authContext = useAuthContext();
    const [selectionModel, setSelectionModel] = useState<(string | number)[]>([]);
    const [displayDate, setDisplayDate] = useState<string>(formatDateForDisplay(getTodayISO()));

    // New state for directory subdirectory tabs
    const [activeDirectoryTab, setActiveDirectoryTab] = useState<'server' | 'user' | 'group'>('server');
    
    // Directory form data state
    // const [directoryFormData, setDirectoryFormData] = useState<DirectoryFormData>({...});
    
    const [formData, setFormData] = useState<UserFormData>({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        registeredSince: getTodayISO(),
        telephone: '',
        groups: '0',
        securityLevel: 'Mid',
        roles: {
            administrator: false,
            validator: false,
            expert: false,
            collector: false,
            helper: false
        }
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${VAULT_API_URL}/api/admin/users`);
            
            if (response.data) {
                console.log('Raw API response:', response.data); // Debug log
                const mappedUsers = response.data.map(mapApiResponseToUserRow);
                console.log('Mapped users:', mappedUsers); // Debug log
                setRows(mappedUsers);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            showError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers().then(() => success('Users loaded successfully'));
    }, []);

    const handleRowSelection = (newSelectionModel: (string | number)[]) => {
        if (newSelectionModel.length > 0) {
            const selectedId = newSelectionModel[newSelectionModel.length - 1];
            setSelectionModel([selectedId]);

            const selected = rows.find(row => row.id === selectedId);
            if (selected) {
                setSelectedRow(selected);
                
                // Populate the form with selected user data
                setFormData({
                    firstName: selected.firstName || '',
                    lastName: selected.lastName || '',
                    email: selected.email || '',
                    username: selected.username || '',
                    telephone: selected.telephone || '',
                    registeredSince: selected.registeredSince || getTodayISO(),
                    groups: selected.groups || '0',
                    securityLevel: selected.securityLevel || 'Mid',
                    department: selected.department || '',
                    fieldOfExpertise: selected.fieldOfExpertise || '',
                    yearsOfExperience: selected.yearsOfExperience || '',
                    userType: selected.userType || 2,
                    roles: {
                        administrator: selected.roles?.administrator || false,
                        validator: selected.roles?.validator || false,
                        expert: selected.roles?.expert || false,
                        collector: selected.roles?.collector || false,
                        helper: selected.roles?.helper || false,
                    }
                });

                setDisplayDate(formatDateForDisplay(selected.registeredSince || getTodayISO()));
                setShowAddUserForm(true);
            }
        } else {
            // Handle deselection
            setSelectionModel([]);
            setSelectedRow(null);
            setShowAddUserForm(false);
        }
    };

    const columns: GridColDef[] = [
        { field: 'firstName', headerName: 'First Name', width: 200, flex: 1 },
        { field: 'lastName', headerName: 'Last Name', width: 200, flex: 1 },
        { field: 'username', headerName: 'Username', width: 200, flex: 1 },
        { field: 'email', headerName: 'Email', width: 250, flex: 1.5 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            renderCell: (params: GridRenderCellParams) => (
                <IconButton 
                    onClick={() => handleDeleteUser({ row: params.row as UserRow })}
                    aria-label="delete user"
                    size="small"
                >
                    <DeleteIcon />
                </IconButton>
            )
        }
    ];

    const handleAddUser = () => {
        // Close directory browser when showing Add User form
        setShowDirectoryBrowser(false);
        // Reset form and show it
        const today = getTodayISO();
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            username: '',
            telephone: '',
            registeredSince: getTodayISO(),
            groups: '0',
            securityLevel: 'Mid',
            roles: {
                administrator: false,
                validator: false,
                expert: false,
                collector: false,
                helper: false
            }
        });
        setDisplayDate(formatDateForDisplay(today));
        setSelectedRow(null);
        setSelectionModel([]);
        setShowAddUserForm(true);
    };

    const handleAddFromDirectory = () => {
        // Show directory browser underneath the table instead of in a different tab
        setShowAddUserForm(false);
        setSelectedRow(null);
        setSelectionModel([]);
        setShowDirectoryBrowser(true);
        // Don't change tabs - keep in users tab
    };

    const handleCancel = () => {
        // Hide form and clear selection
        setShowAddUserForm(false);
        setSelectedRow(null);
        setSelectionModel([]);
        showError('Operation cancelled');
    };

    const handleDeleteUser = (rowData: { row: UserRow }) => {
        // Handle user deletion with confirmation
        if (window.confirm(`Are you sure you want to delete user ${rowData.row.firstName} ${rowData.row.lastName}?`)) {
            success(`User ${rowData.row.firstName} ${rowData.row.lastName} deleted successfully`);
            setRows(rows.filter(row => row.id !== rowData.row.id));
            // Clear selection if the deleted user was selected
            if (selectedRow && selectedRow.id === rowData.row.id) {
                setSelectedRow(null);
                setSelectionModel([]);
                setShowAddUserForm(false);
            }
        }
    };

    const handleSaveUser = async () => {
        if (!authContext?.isLoggedIn) {
            showError('You must be logged in as an admin to continue');
            return;
        }

        // Validate form
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.telephone) {
            showError('Please fill all required fields');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showError('Please enter a valid email address');
            return;
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(displayDate)) {
            showError('Please enter a valid date in YYYY-MM-DD format');
            return;
        }
    
        try {
            setLoading(true);

            const roleNamesToSend: string[] = [];
            if (formData.roles.administrator) roleNamesToSend.push('Administrator');
            if (formData.roles.validator) roleNamesToSend.push('Validator');
            if (formData.roles.expert) roleNamesToSend.push('Expert');
            if (formData.roles.collector) roleNamesToSend.push('Collector');
            if (formData.roles.helper) roleNamesToSend.push('Helper');

            // Prepare dataToSend according to the new backend model
            const dataToSend: UserSaveData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                telephone: formData.telephone,
                username: formData.username,
                roles: roleNamesToSend,
            };

            if (selectedRow && selectedRow.id) {
                dataToSend.userId = selectedRow.id;
            }

            // The endpoint in main.py is /api/user/update_user_details
            // The frontend was calling /api/organisation/update. Assuming this was a typo or an old endpoint name.
            // Changing it to /api/user/update_user_details to match the backend.
            const response = await fetch(`${VAULT_API_URL}/api/user/update_user_details`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Token might be needed if require_roles decorator is active without issues
                    'Authorization': `Bearer ${authContext?.user?.token || ''}` 
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to ${selectedRow ? 'update' : 'create'} user`;
                showError(errorMessage);
                return;
            }

            // Refresh the user list
            await fetchUsers();

            success(`User ${formData.firstName} ${formData.lastName} ${selectedRow ? 'updated' : 'created'} successfully`);

            // Clear form data
            const today = getTodayISO();
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                username: '',
                telephone: '',
                registeredSince: getTodayISO(),
                groups: '0',
                securityLevel: 'Mid',
                roles: {
                    administrator: false,
                    validator: false,
                    expert: false,
                    collector: false,
                    helper: false
                }
            });
            setDisplayDate(formatDateForDisplay(today));

            // Hide form and clear selection
            setShowAddUserForm(false);
            setSelectedRow(null);
            setSelectionModel([]);

        } catch (err: unknown) {
            console.error('Error saving user:', err);
            showError(`Failed to ${selectedRow ? 'update' : 'create'} user`);
        } finally {
            setLoading(false);
        }
    };

    // Create a function to generate row class names
    const getRowClassName = (params: GridRowClassNameParams) => {
        return selectionModel.includes(params.id) ? 'selected-row' : '';
    };

    const handleCancelDirectoryBrowser = () => {
        setShowDirectoryBrowser(false);
    };

    const handleImportComplete = () => {
        setShowDirectoryBrowser(false);
        fetchUsers(); // Refresh the user list
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const mapApiResponseToUserRow = (apiUser: ApiUserResponse): UserRow => {
        // Split full_name into firstName and lastName
        const fullName = String(apiUser.full_name || '');
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        return {
            id: apiUser.id || '',
            type: 'user_directory',
            firstName,
            lastName,
            username: String(apiUser.username || ''),
            email: String(apiUser.email || ''),
            telephone: String(apiUser.telephone || ''),
            company: String(apiUser.company_name || ''),
            companyId: String(apiUser.company_id || ''),
            registeredSince: apiUser.registered_since ? formatDate(String(apiUser.registered_since)) : '',
            groups: '0', // Default groups value
            securityLevel: String(apiUser.user_access || 'Mid'),
            department: '',
            fieldOfExpertise: String(apiUser.field_of_expertise || ''),
            yearsOfExperience: String(apiUser.years_of_experience || ''),
            userType: apiUser.user_type || 1,
            roles: {
                administrator: Boolean(apiUser.is_admin),
                validator: Boolean(apiUser.isValidator),
                expert: Boolean(apiUser.is_expert),
                collector: Boolean(apiUser.is_collector),
                helper: Boolean(apiUser.is_helper),
            }
        };
    };

    // Add a function to handle row clicks in main table
    const handleMainTableRowClick = (params: any) => {
        const clickedUser = rows.find(user => user.id === params.id);
        if (clickedUser) {
            // Use existing firstName and lastName properties
            const firstName = clickedUser.firstName || '';
            const lastName = clickedUser.lastName || '';
            
            // Populate the form with the selected user's data
            setFormData({
                firstName: firstName,
                lastName: lastName,
                email: clickedUser.email || '',
                username: clickedUser.username || '',
                telephone: clickedUser.telephone || '',
                registeredSince: clickedUser.registeredSince || getTodayISO(),
                groups: clickedUser.groups || '',
                securityLevel: clickedUser.securityLevel || '',
                department: clickedUser.department || '',
                fieldOfExpertise: clickedUser.fieldOfExpertise || '',
                yearsOfExperience: clickedUser.yearsOfExperience || '',
                userType: clickedUser.userType || 1,
                roles: {
                    administrator: clickedUser.roles?.administrator || false,
                    validator: clickedUser.roles?.validator || false,
                    expert: clickedUser.roles?.expert || false,
                    collector: clickedUser.roles?.collector || false,
                    helper: clickedUser.roles?.helper || false,
                }
            });
            
            // Set the current user ID for editing
            setCurrentUserId(clickedUser.id);
            
            // Show the edit form
            setShowAddUserForm(true);
        }
    };

    // Add state for tracking current user being edited
    const [currentUserId, setCurrentUserId] = useState<string | number | null>(null);

    return (
        <Container>
            {loading && (
                <LoaderContainer>
                    <HCLoader />
                </LoaderContainer>
            )}
            <TabContainer>
                <Tab
                    active={activeTab === 'users'}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </Tab>
                <Tab
                    active={activeTab === 'directory'}
                    onClick={() => setActiveTab('directory')}
                >
                    User Directory Setup
                </Tab>
            </TabContainer>

            <FormSection>
                <FormBox>
                    {activeTab === 'users' && (
                        <>
                            <HCDataTable
                                columns={columns}
                                rows={rows as unknown as Record<string, unknown>[]}
                                pageLimit={5}
                                onRowClick={handleMainTableRowClick}
                                tableSx={rows.length > 0 ? mainTableSx : undefined}
                                initialState={{
                                    sorting: {
                                        sortModel: [{ field: 'registeredSince', sort: 'desc' }],
                                    },
                                }}
                                getRowClassName={getRowClassName}
                            />

                            <ButtonContainer>
                                <CancelButton
                                    hcVariant='secondary'
                                    size='large'
                                    text='Cancel'
                                    onClick={handleCancel}
                                />
                                <AddFromDirectoryButton
                                    hcVariant='primary'
                                    size='large'
                                    text='Add from Directory'
                                    onClick={handleAddFromDirectory}
                                />
                                <AddUserButton
                                    hcVariant='primary'
                                    size='large'
                                    text='Add User'
                                    onClick={handleAddUser}
                                />
                            </ButtonContainer>

                            {showAddUserForm && (
                                <form onSubmit={(e) => { e.preventDefault(); handleSaveUser().then(() => success('User saved successfully')); }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                        <HCTextField
                                            type='text'
                                            label='First Name'
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                            required
                                        />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                        <HCTextField
                                            type='text'
                                            label='Last Name'
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                            required
                                        />
                                        </Grid>
                                    </Grid>
                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        <Grid item xs={12} sm={6}>
                                        <HCTextField
                                            type='text'
                                            label='Email Address'
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            required
                                        />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                        <HCTextField
                                            type='text'
                                            label='Telephone Number'
                                            value={formData.telephone}
                                            onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                                            required
                                        />
                                        </Grid>
                                    </Grid>
                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        <Grid item xs={12} sm={6}>
                                        <HCTextField
                                            type='text'
                                            label='Username'
                                            value={formData.username}
                                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                                            required
                                        />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <HCTextField
                                                type='text'
                                                label='Groups'
                                                value={formData.groups}
                                                onChange={(e) => setFormData({...formData, groups: e.target.value})}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        <Grid item xs={12} sm={6}>
                                        <HCTextField
                                            type='text'
                                            label='Date Added'
                                            value={displayDate}
                                            disabled
                                        />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <HCTextField
                                                type='text'
                                                label='Security Level'
                                                value={formData.securityLevel}
                                                onChange={(e) => setFormData({...formData, securityLevel: e.target.value})}
                                            />
                                        </Grid>
                                    </Grid>

                                    <Grid container spacing={2} sx={{ mt: 2 }}>
                                        <Grid item xs={12}>
                                    <CheckboxRow>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.roles.administrator}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        roles: {...formData.roles, administrator: e.target.checked}
                                                    })}
                                                />
                                            }
                                            label='Administrator'
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.roles.validator}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        roles: {...formData.roles, validator: e.target.checked}
                                                    })}
                                                />
                                            }
                                            label='Validator'
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.roles.expert}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        roles: {...formData.roles, expert: e.target.checked}
                                                    })}
                                                />
                                            }
                                            label='Expert'
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.roles.collector}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        roles: {...formData.roles, collector: e.target.checked}
                                                    })}
                                                />
                                            }
                                            label='Collector'
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.roles.helper}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        roles: {...formData.roles, helper: e.target.checked}
                                                    })}
                                                />
                                            }
                                            label='Helper'
                                        />
                                    </CheckboxRow>
                                        </Grid>
                                    </Grid>

                                    <ButtonContainer>
                                        <HCButton
                                            sx={{mt: 2, background: '#e66334', ':hover': { background: '#FF8234' }}}
                                            hcVariant='primary'
                                            size='large'
                                            text='Save'
                                            type='submit'
                                        />
                                    </ButtonContainer>
                                </form>
                            )}
                            
                            {/* Add the DirectoryBrowser underneath when showDirectoryBrowser is true */}
                            {showDirectoryBrowser && (
                                <Box sx={{ mt: 4 }}>
                                    <DirectoryBrowser 
                                        companyId={(authContext?.user?.user as any)?.company_id?.toString() || '1'} 
                                        onCancel={handleCancelDirectoryBrowser}
                                        onImportComplete={handleImportComplete}
                                    />
                                </Box>
                            )}
                        </>
                    )}

                    {activeTab === 'directory' && (
                        <UserDirectorySetup 
                            onBack={() => setActiveTab('users')}
                        />
                    )}

                    {activeTab === 'security' && (
                        <div>
                            <p>Security Levels configuration will be implemented here.</p>
                        </div>
                    )}
                </FormBox>
            </FormSection>
        </Container>
    );
}

export default OrganisationListPage;