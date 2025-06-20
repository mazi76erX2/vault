import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {error as showError, HCDataTable, HCIcon, HCLoader, success} from 'generic-components';
import {useAuthContext} from '../../../hooks/useAuthContext';
import {Stack, styled} from '@mui/material';
import {DancingBotGridComponent} from '../../../components/DancingBotGridComponent';
import {HeaderContainer, LoaderContainer, WelcomeText} from '../../../components';
import Api from '../../../services/Instance';
import { AxiosError } from 'axios';


const Container = styled(Stack)({});

const TableContainer = styled('div')({
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
});

const FormBox = styled('div')({
    backgroundColor: '#d3d3d3',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    height: 'auto',  // Allow it to expand dynamically
    justifyContent: 'space-between', // Ensures proper spacing
});

// Interface for the raw API response with snake_case keys
interface RawSessionFromAPI {
    created_at: string;
    id: string;
    status?: string;
    topic?: string;
    chat_messages_id?: string;
}

// Raw session data as returned by the API, but with camelCase keys for internal use
interface SessionDataRaw {
    createdAt: string;
    id: string;
    status?: string;
    topic?: string;
    chatMessagesId?: string;
}

interface SessionRow {
    id: string;
    createdAt: string;
    topic: string;
    status: string;
    chatMessagesId?: string;
    [key: string]: unknown;
}

const CollectorResumePage: React.FC = () => {
    // State Management
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<SessionRow[]>([]);

    const authContext = useAuthContext(); // Call hook once
    const navigate = useNavigate();

    const columns = [
        {field: 'createdAt', headerName: 'Date', width: 150},
        {field: 'topic', headerName: 'Topic', flex: 2},
        {field: 'status', headerName: 'Status', width: 150},
    ];

    // Fetch existing sessions on mount (and when user logs in)
    useEffect(() => {
        const fetchUserSessions = async () => {
            if (!authContext || !authContext.user?.user?.id || !authContext.isLoggedIn) { // Check authContext and its properties
                if (!authContext?.isLoadingUser) { // Only show error if not loading user
                    showError({ message: 'User not authenticated or session has expired.' });
                }
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                const response = await Api.post<{ sessions: RawSessionFromAPI[] }>(
                    '/api/v1/collector/fetch_resume_sessions',
                    {}
                );

                const sessionsRawMapped: SessionDataRaw[] = response.data.sessions.map(item => ({
                    createdAt: item.created_at,
                    id: item.id,
                    status: item.status,
                    topic: item.topic,
                    chatMessagesId: item.chat_messages_id
                }));

                if (!Array.isArray(sessionsRawMapped)) {
                    console.error('Unexpected API response format:', sessionsRawMapped);
                    showError('Unexpected API response format.');
                    return;
                }

                if (sessionsRawMapped.length === 0) {
                    showError('No existing sessions found.');
                    return;
                }
                success({message: 'Existing sessions found.'});

                const sessionRows: SessionRow[] = sessionsRawMapped.map((raw) => ({
                    id: raw.id,
                    createdAt: new Date(raw.createdAt).toLocaleDateString('en-GB'),
                    topic: raw.topic ?? 'No topic found',
                    status: raw.status ?? 'Started',
                    chatMessagesId: raw.chatMessagesId
                }));

                setRows(sessionRows);
            } catch (error) {
                if (!(error instanceof AxiosError && error.response?.status === 401)) {
                    showError(error instanceof Error ? error.message : 'An error occurred while fetching sessions');
                }
            } finally {
                setLoading(false);
            }
        };

        if (authContext && !authContext.isLoadingUser && authContext.isLoggedIn) { // Ensure context is loaded and user is logged in
            fetchUserSessions();
        }
    }, [authContext]); // Depend on the entire authContext object


    // Handle Resume
    const handleResumeSession = (rowData: { row: SessionRow }) => {
        console.log('Resume session data:', rowData);
        if (!rowData.row.id) {
            showError('Cannot resume: missing session ID');
            return;
        }

        success({message: 'Resuming session...'});

        // Navigate to the chat page with the session details
        navigate('/applications/collector/CollectorChatPage', {
            state: {
                sessionId: rowData.row.id,
                chat_msgId: rowData.row.chatMessagesId,
                isResume: true
            },
        });
    };

    return (
        <Container>
            {loading && (
                <LoaderContainer>
                    <HCLoader/>
                </LoaderContainer>
            )}

            <DancingBotGridComponent botState={'thinking'}>
                {/* Header */}
                <HeaderContainer>
                    <WelcomeText>Resume a previous session</WelcomeText>
                </HeaderContainer>

                {/* The lower part: a gray form box containing the table + button */}
                <TableContainer>
                    <FormBox>
                        {/* The table for existing sessions */}
                        <HCDataTable
                            actions={{
                                resume: {
                                    icon: <HCIcon icon="ArrowRight1"/>,
                                    onClick: (row) => handleResumeSession(row),
                                },
                            }}
                            columns={columns}
                            rows={rows}
                            pageLimit={5}
                            tableSx={rows.length > 0 ? {height: '50vh'} : undefined}
                        />
                    </FormBox>
                </TableContainer>
            </DancingBotGridComponent>
        </Container>
    );
};

export default CollectorResumePage;
