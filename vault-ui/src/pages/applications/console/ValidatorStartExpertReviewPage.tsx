import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {error as showError, HCLoader} from 'generic-components';
import {HCDataTable} from 'generic-components/src/HCDataTable';
import {HCIcon} from 'generic-components/src/HCIcon';
import {useAuthContext} from '../../../hooks/useAuthContext';
import {styled} from '@mui/material';
import {HeaderContainer, LoaderContainer, WelcomeText} from '../../../components';
import {DancingBotGridComponent} from '../../../components/DancingBotGridComponent';
import {VAULT_API_URL} from '../../../config';
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

interface ExpertReviewDocRow {
    id: string;
    title: string;
    reviewer: string;
    status: string;
    [key: string]: unknown;
}

const ValidatorStartExpertReviewPage: React.FC = () => {
    // State Management
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<ExpertReviewDocRow[]>([]);

    const authContext = useAuthContext();
    const user = authContext?.user;
    const isLoggedIn = authContext?.isLoggedIn;
    const isLoadingUser = authContext?.isLoadingUser;
    const navigate = useNavigate();

    // Table columns for completed documents
    const columns = [
        {field: 'title', headerName: 'Document Title', width: 400},
        {field: 'reviewer', headerName: 'Expert', width: 200},
        {field: 'status', headerName: 'Status', width: 200},
    ];

    // Fetch completed documents
    useEffect(() => {
        const fetchExpertReviewDocuments = async () => {
            try {
                setLoading(true);
                if (isLoadingUser) return;

                if (!isLoggedIn || !user?.token) {
                    showError({ message: 'User not authenticated.' });
                    setLoading(false);
                    return;
                }

                const response = await axios.get<ExpertReviewDocRow[]>(
                    `${VAULT_API_URL}/api/v1/expert/review-documents`,
                    { headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/json' }
                    }
                );
                setRows(response.data);

            } catch (err) {
                console.error(err);
                showError({ message: err instanceof Error ? err.message : 'An error occurred fetching data' });
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchExpertReviewDocuments();
        }
    }, [isLoggedIn, isLoadingUser, user]);

    // Handle Resume
    const handleGoToDoc = (rowData: { row: ExpertReviewDocRow }) => {
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
                    <WelcomeText>Documents on review</WelcomeText>
                </HeaderContainer>

                {/* The lower part: a gray form box containing the table + button */}
                <TableContainer>
                    <FormBox>
                        {/* The table for existing sessions */}
                        <HCDataTable
                            actions={{
                                resume: {
                                    icon: <HCIcon icon="ArrowRight1"/>,
                                    onClick: (row) => handleGoToDoc(row as { row: ExpertReviewDocRow }),
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

export default ValidatorStartExpertReviewPage;
