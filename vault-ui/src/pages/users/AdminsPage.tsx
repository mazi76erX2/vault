import React, {useEffect, useState} from 'react';
import {Box} from '@mui/material';
import {useLocation, useNavigate} from 'react-router-dom';
import {HCIcon, HCModal} from 'generic-components';
import {UserListTable} from '../../components/UserListTable/UserListTable';
import {UserDTO} from '../../types/UserDTO';
import {VAULT_API_URL} from '../../config';


interface UsersPageProps {
    users?: UserDTO[];
}

function AdminsPage(props: UsersPageProps) {
    const {pathname} = useLocation();
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserDTO[]>(props.users ?? []);
    const [userToDelete, setUserToDelete] = useState<string | undefined>(undefined);

    useEffect(() => {
        loadUsers();
    }, [pathname]);

    const loadUsers = async () => {
        try {
            const response = await fetch(`${VAULT_API_URL}/api/admin/users`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setUsers(data || []);
        } catch (err) {
            console.error('Failed to load users:', err);
        }
    };

    const onEdit = (id: string) => {
        // Navigate to an individual user page, e.g. /users/individual/:id
        navigate(`/users/individual/${id}`);
    };

    const onDelete = async (id: string) => {
        try {
            const response = await fetch(`${VAULT_API_URL}/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error deleting the user');
            }

            await loadUsers(); // Refresh the user list after deletion
        } catch (err) {
            console.error('Failed to delete user', err);
        }
    };


    // If you have a separate UpdateUser type:
    // interface UpdateUserDTO { id: string; username?: string; email?: string; ... }

    // const onUserUpdate = async (userData: any /* or UpdateUserDTO */) => {
    //     try {
    //         if (userData.id) {
    //             const {error} = await supabase
    //                 .from('profiles')
    //                 .update({
    //                     username: userData.username,
    //                     email: userData.email,
    //                     updated_at: new Date().toISOString()
    //                 })
    //                 .eq('id', userData.id);
    //
    //             if (error) throw error;
    //             await loadUsers();
    //         }
    //     } catch (err) {
    //         console.error('Failed to update user:', err);
    //     }
    // };

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '80vh'}}>
            <Box sx={{height: 'calc(100% - 60px)'}}>
                <UserListTable
                    users={users}
                    // Force re-render when `users` changes
                    key={users.map(u => u.username?.trim() || 'unknown').join('-')}

                    // Remove permission toggling
                    // Instead, we only provide onEdit and onDelete
                    onEdit={(u) => onEdit(u.id!)}
                    onDelete={(u) => setUserToDelete(u.id!)}
                />
            </Box>

            <HCModal
                options={{
                    title: 'Delete User',
                    renderContent: () => 'Are you sure you want to remove this user?',
                    onConfirm() {
                        if (userToDelete) onDelete(userToDelete);
                    },
                    icon: <HCIcon icon="Trash"/>,
                    confirmText: 'Delete',
                    type: 'confirm',
                    onCancel() {
                        setUserToDelete(undefined);
                    },
                }}
                open={!!userToDelete}
            />
        </Box>
    );
}

export default AdminsPage;
