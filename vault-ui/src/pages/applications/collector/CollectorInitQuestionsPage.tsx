/* eslint linebreak-style: 0 */
import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {error as showError, HCButton, HCDataTable, HCIcon, HCLoader, success} from 'generic-components';
import {useAuthContext} from '../../../hooks/useAuthContext';
import {styled} from '@mui/material';
import {DancingBotGridComponent} from '../../../components/DancingBotGridComponent';
import {HeaderContainer, LoaderContainer, WelcomeText} from '../../../components';
import Api from '../../../services/Instance'; // Import Api instance
import { AxiosError } from 'axios'; // Import AxiosError

const Container = styled('div')({});

const TableContainer = styled('div')({
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
});

const FormBox = styled('div')({
    backgroundColor: '#d3d3d3', // Gray background
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    height: 'auto',  // Allow it to expand dynamically
    justifyContent: 'space-between', // Ensures proper spacing
});

const ButtonsContainer = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',  // Provides spacing between the table and button
    gap: '50px',
});

// Define interface for question row data
interface QuestionRowData {
    id: number;
    question: string;
    status: string;
    topic?: string;
    [key: string]: unknown; // Added index signature for HCDataTable compatibility
}

// Define interface for objects read from uploaded JSON
interface UploadedQuestionObject {
    question: string;
}

// API response types
interface GetQuestionsResponse {
    questions: string[];
    status: string[];
    topics?: string[]; // Made topics optional as it might not always be present
}

interface GenerateQuestionsResponse {
    questions: string[];
    status: string[];
}

const CollectorInitQuestionsPage: React.FC = () => {
    // State management
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<QuestionRowData[]>([]);
    const authContext = useAuthContext(); // Call hook once

    const navigate = useNavigate(); // Needed for routing

    const columns = [
        {field: 'question', headerName: 'Question', flex: 1},
        {field: 'status', headerName: 'Status', width: 150},
    ];
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
        if (authContext && !authContext.isLoadingUser && authContext.isLoggedIn) { // Check authContext properties
            fetchQuestions();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authContext]); // Depend on authContext


    const fetchQuestions = async () => {
        if (!authContext || !authContext.user?.user?.id) { 
            if (!authContext?.isLoadingUser) { 
                showError('User not authenticated or session has expired.');
            }
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await Api.post<GetQuestionsResponse>(
                '/api/v1/collector/get-questions',
                { user_id: authContext.user.user.id }
            );

            if (!response.data) {
                setRows([]);
                showError({ message: `Error: ${response.statusText}` }); // showError expects an object
                return;
            }

            const data = response.data;

            if (!data.questions || data.questions.length === 0) {
                setRows([]);
                showError({ message: 'No questions found. Click "Generate" to create new questions or "Upload Questions" to import from a file.' });
            } else {
                const newRows = data.questions.map((q, idx) => {
                    let currentTopic = 'N/A';
                    if (data.topics && data.topics[idx] !== undefined) {
                        currentTopic = data.topics[idx];
                    }
                    return {
                        id: idx + 1,
                        question: q,
                        status: data.status[idx],
                        topic: currentTopic,
                    };
                }).filter((row: QuestionRowData) => row.status === 'Not Started');

                setRows(newRows);
            }
        } catch (err: unknown) {
            setRows([]);
            if (err instanceof AxiosError) {
                if (err.response?.status === 404) {
                    showError({ message: 'No questions found. Click "Generate" to create new questions or "Upload Questions" to import from a file.' });
                } else if (err.response?.status !== 401) {
                    showError({ message: err.response?.data?.detail || 'An error occurred' });
                }
            } else if (err instanceof Error) {
                showError({ message: err.message });
            } else {
                showError({ message: 'An unexpected error occurred' });
            }
        } finally {
            setLoading(false);
        }
    };


    const generateQuestions = async () => {
        if (!authContext || !authContext.user?.user?.id) { // Check authContext and user ID
            if (!authContext?.isLoadingUser) {
                showError('User not authenticated or session has expired.');
            }
            return;
        }

        try {
            setLoading(true);  // Start loading
            // Use Api instance
            const response = await Api.post<GenerateQuestionsResponse>(
                '/api/v1/collector/generate_questions',
                { user_id: authContext.user.user.id }
                // Headers are managed by Api instance
            );

            // Validate response structure
            if (!response.data.questions) {
                throw new Error('Invalid response from the server.');
            }

            const {questions, status: statusList} = response.data;

            // Map questions to row data
            const newRows = questions.map((q, idx) => ({
                id: idx + 1, // Generate a unique ID
                question: q,
                status: statusList[idx],
            }));

            success({ message: 'Questions generated successfully.' });

            // Update table rows
            setRows(newRows);
        } catch (error: unknown) {
            console.error('Error:', error);
            if (!(error instanceof AxiosError && error.response?.status === 401)) { // Check for AxiosError and 401
                showError(error instanceof Error ? error.message : String(error));
            }
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const handleUploadButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click(); // opens file browser
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!authContext || !authContext.user?.user?.id) { // Check authContext and user ID
            if (!authContext?.isLoadingUser) {
                showError('User not authenticated or session has expired.');
            }
            return;
        }
        try {
            const file = event.target.files?.[0];
            if (!file) {
                return;
            }

            // Read file contents via FileReader
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const text = e.target?.result;
                    if (!text || typeof text !== 'string') {
                        throw new Error('Failed to read file contents.');
                    }

                    // parse JSON
                    const jsonArray = JSON.parse(text);
                    if (!Array.isArray(jsonArray)) {
                        throw new Error('JSON must be an array of objects: [ {question: \'...\'}, ... ]');
                    }

                    const questionStrings = jsonArray.map((obj: UploadedQuestionObject) => {
                        if (!obj.question) throw new Error('Each object needs a \'question\' field.');
                        return obj.question;
                    });

                    // Add a check for authContext and authContext.user and authContext.user.user
                    if (!authContext || !authContext.user || !authContext.user.user || !authContext.user.user.id) {
                        showError('User not authenticated or user ID is missing.');
                        return;
                    }

                    // Use Api instance
                    const response = await Api.post(
                        '/api/v1/collector/init_questions',
                        { user_id: authContext.user.user.id, questions: questionStrings } // Now safe to access
                        // Headers are managed by Api instance
                    );
                    console.log('API Response:', response.data);
                    if (response.status < 200 || response.status > 299) {
                        throw new Error(response.statusText);
                    }

                    console.log('Uploaded questions from JSON');

                    // Refresh the table
                    await fetchQuestions();
                } catch (err: unknown) {
                    console.error('Error parsing or upserting JSON:', err);
                    if (!(err instanceof AxiosError && err.response?.status === 401)) { // Check for AxiosError and 401
                        showError(err instanceof Error ? err.message : String(err));
                    }
                }
            };
            reader.readAsText(file);
        } catch (err: unknown) {
            console.error('Error in handleFileChange:', err);
            if (!(err instanceof AxiosError && err.response?.status === 401)) { // Check for AxiosError and 401
                showError(err instanceof Error ? err.message : String(err));
            }
        }
    };
    const handleStartChat = async (selectedQuestion: { row: QuestionRowData }) => {
        if (!authContext || !authContext.user || !authContext.user.user?.id) { // Check authContext, user and user.id
            if (!authContext?.isLoadingUser) {
                showError('User not authenticated or session has expired.');
            }
            setLoading(false); // Also stop loading here if returning early
            return;
        }
        // At this point, authContext, authContext.user, and authContext.user.user.id are guaranteed to be non-null/undefined
        // So, we can safely access authContext.user.user.id
        const currentUserId = authContext.user.user.id;

        try {
            setLoading(true); // Start loading indicator

            // Prepare payload to send to Python BE
            const payload = {
                user_id: currentUserId, // Use the non-null user_id
                id: selectedQuestion.row.id,
                question: selectedQuestion.row.question,
                topic: selectedQuestion.row.topic || '' // Ensure topic is always a string, defaulting to empty if undefined
            };
            console.log(payload);

            // Use Api instance
            const response = await Api.post(
                '/api/v1/collector/start-chat',
                payload
                // Headers are managed by Api instance
            );

            if (!response.data) {
                throw new Error('Invalid response from backend.');
            }

            const { sessionId, chatMessageId, resume } = response.data;

            if (!sessionId || !chatMessageId) {
                throw new Error('Invalid response from backend. Missing session or chat message ID.');
            }

            // Update UI state or any data if needed (e.g., question status)
            const questionText = selectedQuestion.row.question;

            // Navigate to chat page with session details
            navigate('/applications/collector/CollectorChatPage', {
                state: {
                    question: questionText,
                    sessionId: sessionId,
                    chat_msgId: chatMessageId,
                    isResume: resume,
                },
            });


        } catch (error) {
            let errorMessage = 'Failed to start chat session';

            if (axios.isAxiosError(error)) { // axios import is kept for this check
                errorMessage = error.response?.data?.detail || error.message || 'Unknown Axios error occurred';
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            console.error(errorMessage);
            // No showError here if it was a 401, interceptor handles it.
            if (!(axios.isAxiosError(error) && error.response?.status === 401)) {
                showError({message: errorMessage}); // Pass as object
            }
        } finally {
            setLoading(false); // Ensure loading is stopped
        }
    };
    return (
        <Container>
            {loading && (
                <LoaderContainer>
                    <HCLoader />
                </LoaderContainer>
            )}

            <DancingBotGridComponent botState={'idling'}>
                <HeaderContainer>
                    <WelcomeText>Super!</WelcomeText>
                    <WelcomeText>Pick a question to start</WelcomeText>
                </HeaderContainer>

                <TableContainer>
                    <FormBox>
                        <HCDataTable

                            actions={{
                                continue: {
                                    icon: <HCIcon icon="ArrowRight1"/>,
                                    onClick: (row) => handleStartChat(row),
                                }
                            }}
                            columns={columns}
                            rows={rows}
                            pageLimit={5}
                            tableSx={rows.length > 0 ? {height: '50vh'} : undefined}
                        />

                        <ButtonsContainer>
                            <HCButton
                                sx={{mt: 2, background: '#e66334', ':hover': { background: '#FF8234' }}}
                                hcVariant="primary"
                                size="large"
                                onClick={generateQuestions}

                                text={loading ? 'Generating...' : 'Generate'}
                                disabled={loading}
                            />
                            {/* File input for uploading JSON */}
                            <input
                                type="file"
                                accept="application/json"
                                ref={fileInputRef}
                                style={{display: 'none'}}
                                onChange={handleFileChange}
                                aria-label="Upload questions JSON file"
                                title="Upload questions JSON file"
                            />

                            <HCButton
                                sx={{mt: 2, background: '#e66334', ':hover': { background: '#FF8234' }}}
                                hcVariant="primary"
                                size="large"
                                text="Upload Questions"
                                onClick={handleUploadButtonClick}
                            />
                        </ButtonsContainer>
                    </FormBox>
                </TableContainer>
            </DancingBotGridComponent>
        </Container>
    );
};

export default CollectorInitQuestionsPage;
