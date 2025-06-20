/* eslint linebreak-style: 0 */
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {error as showError, HCDataTable, HCIcon, HCLoader} from 'generic-components';
import {useAuthContext} from '../../../hooks/useAuthContext';
import {styled} from '@mui/material';
import {HeaderContainer, LoaderContainer, WelcomeText} from '../../../components';
import {DancingBotGridComponent} from '../../../components/DancingBotGridComponent';
import axios from 'axios';
import {VAULT_API_URL} from '../../../config';


const Container = styled('div')({
});

const TableContainer = styled('div')({
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
});

const FormBox = styled('div')({
    backgroundColor: '#d3d3d3',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    height: 'auto',  // Allow it to expand dynamically
    justifyContent: 'space-between', // Ensures proper spacing
});

// Define interfaces for the data structures
interface ChatMessage {
    id: string;
    created_at: string;  // From Supabase
    createdAt?: string;  // Optional alternate format
    messages: [string, string][];
}

interface Profile {
    id: string;
    fullName: string;
}

// Update ChatRow to include an index signature to make it compatible with Record<string, unknown>
interface ChatRow {
    id: string;
    createdAt: string;
    topic: string;
    [key: string]: unknown;
}

const PreviousChatPage: React.FC = () => {
    // State Management
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<ChatRow[]>([]);

    const authContext = useAuthContext();
    const user = authContext?.user;
    const isLoggedIn = authContext?.isLoggedIn;
    const isLoadingUser = authContext?.isLoadingUser;
    const navigate = useNavigate();

    // Table columns for completed documents
    const columns = [
        {field: 'topic', headerName: 'Topic', width: 550},
        {field: 'createdAt', headerName: 'Date', width: 150},
    ];

    const adaptChatsToRows = async (chatsData: ChatMessage[]): Promise<ChatRow[]> => {
        const adaptedRows = await Promise.all(
            chatsData.map(async (chat) => {
                let firstAssistantMessage = 'No topic found';

                // Check that chat.messages exists and that it is an array
                if (chat.messages && Array.isArray(chat.messages)) {
                    // Assume each message is an array [userMessage, assistantMessage]
                    // If there's at least one message pair, use the assistant message from the first pair.
                    if (chat.messages.length > 0 && Array.isArray(chat.messages[0]) && chat.messages[0].length >= 2) {
                        firstAssistantMessage = chat.messages[0][0];
                    }
                }

                // Handle the date formatting - chat.created_at comes from Supabase
                let formattedDate = 'Invalid Date';
                try {
                    // Use created_at from Supabase
                    const dateStr = chat.created_at;
                    if (dateStr) {
                        const date = new Date(dateStr);
                        if (!isNaN(date.getTime())) {
                            formattedDate = date.toLocaleDateString('en-GB');
                        }
                    }
                } catch (e) {
                    console.error('Error formatting date:', e);
                }

                return {
                    id: chat.id,
                    createdAt: formattedDate,
                    topic: firstAssistantMessage,
                };
            })
        );

        return adaptedRows;
    };

    // Fetch completed documents
    useEffect(() => {
        const fetchCompletedDocuments = async () => {
            try {
                setLoading(true);
                if (isLoadingUser) return;

                if (!isLoggedIn || !user) {
                    showError({message: 'User not logged in'});
                    return;
                }

                // const {data: {session}} = await supabase.auth.getSession();
                // const authToken = session?.access_token;
                //
                // if (!authToken) {
                //     showError({message: 'No valid session'});
                //     return;
                // }

                // Call FastAPI endpoint
                const response = await axios.get(
                    `${VAULT_API_URL}/api/v1/helper/user_maps`, {
                        headers: {
                            Authorization: `Bearer ${user.token ?? ''}`,
                            'Content-Type': 'application/json',
                        }
                    });

                // Validate response structure
                if (!response.data || !response.data.user_maps) {
                    showError({message: 'Invalid response from the server.'});
                }
                console.log('data response: ', response.data);

                // // 1️⃣ Fetch all profiles and create a user_id → full_name map
                // const {data: profiles, error: profileError} = await supabase
                //     .from('profiles')
                //     .select('id, full_name');
                //
                // if (profileError) {
                //     showError({message: profileError.message});
                //     return;
                // }
                const profiles = response.data.user_maps.data as Profile[]; // Access the nested data array
                const userMap = new Map(profiles.map((profile: Profile) => [profile.id, profile.fullName]));

                console.log('user map: ', userMap);

                // Call FastAPI endpoint
                const chatsResponse = await axios.post(
                    `${VAULT_API_URL}/api/v1/helper/get_previous_chats`,
                    {
                        user_id: user.user.id,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${user.token ?? ''}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                // Validate response structure
                if (!chatsResponse.data || !chatsResponse.data.get_previous_chats) {
                    showError({message: 'Invalid response from the server.'});
                }

                console.log('chats response: ', chatsResponse.data.get_previous_chats.data);

                const chatsData = chatsResponse.data.get_previous_chats.data;

                if (!chatsData || chatsData.length === 0) {

                    showError({message: 'No previous chats found.'});
                    return;
                }

                try {
                    // Replace with your actual fetch logic if necessary.
                    // For example, replace chatsData with the actual response data.
                    const adaptedRows = await adaptChatsToRows(chatsData);
                    setRows(adaptedRows);
                } catch (error) {
                    console.error('Error adapting chat rows:', error);
                }



            } catch (err) {
                console.error(err);
                showError({message: err instanceof Error ? err.message : 'An error occurred'});
            } finally {
                setLoading(false);
            }
        };

        fetchCompletedDocuments();
    }, [isLoggedIn, isLoadingUser]);
    // Handle Resume
    const handleGoToChat = (rowData: { row: ChatRow }) => {
        console.log(rowData);
        if (!rowData.row.id) {
            showError({message: 'Cannot go to Chat: missing chat message ID'});
            return;
        }

        // Navigate to the chat page with the session details
        navigate('/applications/helper/chat', {
            state: {
                isResume: true,
                ChatId: rowData.row.id
            },
        });
    };

    return (
        <Container>
            {/* Loader overlay */}
            {loading && (
                <LoaderContainer>
                    <HCLoader />
                </LoaderContainer>
            )}


            {/* Right Part */}
            <DancingBotGridComponent botState={'default'}>
                {/* Header */}
                <HeaderContainer>
                    <WelcomeText>Chats previously started</WelcomeText>
                </HeaderContainer>

                {/* The lower part: a gray form box containing the table + button */}
                <TableContainer>
                    <FormBox>
                        {/* The table for existing sessions */}
                        <HCDataTable
                            actions={{
                                resume: {
                                    icon: <HCIcon icon="ArrowRight1"/>,
                                    onClick: (row) => handleGoToChat(row),
                                },
                            }}
                            columns={columns}
                            rows={rows}
                            pageLimit={10}
                        />
                    </FormBox>
                </TableContainer>
            </DancingBotGridComponent>
        </Container>
    );
};

export default PreviousChatPage;
