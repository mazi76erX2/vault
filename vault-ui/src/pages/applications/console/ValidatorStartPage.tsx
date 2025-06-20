import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {error as showError, HCDataTable, HCIcon, HCLoader} from 'generic-components';
import {useAuthContext} from '../../../hooks/useAuthContext';
import {styled} from '@mui/material';
import {DancingBotGridComponent} from '../../../components/DancingBotGridComponent';
import {HeaderContainer, LoaderContainer, WelcomeText} from '../../../components';
import axios from 'axios';
import {VAULT_API_URL} from '../../../config';
// import { LoginResponseDTO } from '../../../types/LoginResponseDTO'; // Unused import
import {success} from 'generic-components';
import ConsoleLayoutPage from '../ConsoleLayoutPage';
import Api from '../../../services/Instance';
import { AxiosError } from 'axios';

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

interface DocumentToValidateRow {
    id: string;
    title: string;
    author: string;
    status: string;
    [key: string]: unknown; // Index signature for HCDataTable
}

const ValidatorStartPage: React.FC = () => {
    // State Management
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<DocumentToValidateRow[]>([]);

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
        const fetchDocuments = async () => {
            try {
                setLoading(true);
                if (isLoadingUser) return;

                if (!isLoggedIn || !user?.token || !user?.user?.id) {
                    showError({ message: 'User not authenticated or user data incomplete.' });
                    setLoading(false);
                    return;
                }

                const response = await axios.get<{ documents: DocumentToValidateRow[] }>(
                    `${VAULT_API_URL}/api/v1/validator/get-documents`,
                    {
                        params: { user_id: user.user.id },
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                const documents = response.data.documents;

                if (!documents || documents.length === 0) {
                    setRows([]);
                    setLoading(false);
                    return;
                }
                setRows(documents);
            } catch (err: unknown) {
                console.error(err);
                let message = 'An error occurred';
                if (axios.isAxiosError(err) && err.response?.data?.detail) {
                    message = err.response.data.detail;
                } else if (err instanceof Error) {
                    message = err.message;
                }
                showError({ message });
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDocuments();
        }
    }, [isLoggedIn, isLoadingUser, user]);

    // Handle Resume
    const handleGoToDoc = (rowData: { row: DocumentToValidateRow }) => {
        console.log(rowData);
        if (!rowData.row.id) {
            showError({ message: 'Cannot go to document: missing document ID' });
            return;
        }

        navigate('/applications/console/ValidatorDocPage', {
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
                    <WelcomeText>Documents to validate</WelcomeText>
                </HeaderContainer>

                {/* The lower part: a gray form box containing the table + button */}
                <TableContainer>
                    <FormBox>
                        {/* The table for existing sessions */}
                        <HCDataTable
                            actions={{
                                resume: {
                                    icon: <HCIcon icon="ArrowRight1"/>,
                                    onClick: (row) => handleGoToDoc(row as { row: DocumentToValidateRow }),
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

export default ValidatorStartPage;
