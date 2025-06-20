import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {error as showError, HCDataTable, HCLoader} from 'generic-components';
import {HCIcon} from 'generic-components/src/HCIcon';
import {styled} from '@mui/material';
import {VAULT_API_URL} from '../../../config';
import {HeaderContainer, LoaderContainer, WelcomeText} from '../../../components';
import {DancingBotGridComponent} from '../../../components/DancingBotGridComponent';
import {useAuthContext} from '../../../hooks/useAuthContext';
import axios from 'axios';
// import { LoginResponseDTO } from '../../../types/LoginResponseDTO'; // Unused import

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

interface CompletedDocumentRow {
    id: string;
    title: string;
    author: string;
    status: string;
    [key: string]: unknown;
    // Add other properties if returned by the API and used
}

const ExpertPreviousReviewsPage: React.FC = () => {
    // State Management
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<CompletedDocumentRow[]>([]);

    const authContext = useAuthContext();
    const user = authContext?.user;
    const isLoggedIn = authContext?.isLoggedIn;
    const isLoadingUser = authContext?.isLoadingUser;
    const navigate = useNavigate();

    // Table columns for completed documents
    const columns = [
        {field: 'title', headerName: 'Document Title', width: 400},
        {field: 'author', headerName: 'Author', width: 200},
        {field: 'status', headerName: 'Status', width: 200},
    ];

    // Fetch completed documents
    useEffect(() => {
        const fetchCompletedDocuments = async () => {
            try {
                setLoading(true);
                if (isLoadingUser) return;

                if (!isLoggedIn || !user?.token || !user?.user?.id) {
                    showError({message: 'User not authenticated or user data incomplete.'});
                    setLoading(false);
                    return;
                }

                const response = await axios.get<CompletedDocumentRow[]>(
                    `${VAULT_API_URL}/api/v1/expert/completed-documents/${user.user.id}`,
                    { headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/json' }
                    }
                );
                setRows(response.data);
            } catch (err) {
                console.error(err);
                showError({message: err instanceof Error ? err.message : 'An error occurred'});
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchCompletedDocuments();
        }
    }, [user, isLoggedIn, isLoadingUser]);

    // Handle Resume
    const handleGoToDoc = (rowData: { row: CompletedDocumentRow }) => {
        console.log(rowData);
        if (!rowData.row.id) {
            showError({message: 'Cannot go to document: missing document ID'});
            return;
        }

        navigate('/applications/console/ExpertDocPage', {
            state: {
                DocumentId: rowData.row.id
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
                    <WelcomeText>Documents previously reviewed</WelcomeText>
                </HeaderContainer>

                {/* The lower part: a gray form box containing the table + button */}
                <TableContainer>
                    <FormBox>
                        {/* The table for existing sessions */}
                        <HCDataTable
                            actions={{
                                resume: {
                                    icon: <HCIcon icon="ArrowRight1"/>,
                                    onClick: (row) => handleGoToDoc(row as { row: CompletedDocumentRow }),
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

export default ExpertPreviousReviewsPage;
