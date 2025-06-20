import React, {useEffect, useState} from 'react';
import {error as showError, HCDataTable, HCLoader} from 'generic-components';
import {useAuthContext} from '../../../hooks/useAuthContext';
import {styled} from '@mui/material';
import {DancingBotGridComponent} from '../../../components/DancingBotGridComponent';
import {HeaderContainer, LoaderContainer, WelcomeText} from '../../../components';
import Api from '../../../services/Instance';
import { AxiosError } from 'axios';

const Container = styled('div')({});

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
    height: 'auto',
    justifyContent: 'space-between',
});

interface FetchDocumentsResponse {
    documents: DocumentStatus[];
}

interface DocumentStatus {
    title: string;
    responsible: string;
    status: string;
    [key: string]: unknown;
}

const CollectorDocumentsStatusPage: React.FC = () => {
    // State Management
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<DocumentStatus[]>([]);

    const authContext = useAuthContext();

    // Table columns for completed documents
    const columns = [
        {field: 'title', headerName: 'Document Title', flex: 2},
        {field: 'responsible', headerName: 'Validator', width: 150},
        {field: 'status', headerName: 'Status', width: 150},
    ];

    const fetchDocuments = async () => {
        if (!authContext || !authContext.user?.user?.id || !authContext.isLoggedIn) {
            if (!authContext?.isLoadingUser) {
                showError('User not authenticated or session has expired.');
            }
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await Api.get<FetchDocumentsResponse>(
                '/api/v1/collector/fetch_documents_status'
            );
            setRows(response.data.documents);
        } catch (err: unknown) {
            console.error('Error fetching documents status:', err);
            if (!(err instanceof AxiosError && err.response?.status === 401)) {
                showError(err instanceof Error ? err.message : 'Failed to fetch document status.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authContext && !authContext.isLoadingUser && authContext.isLoggedIn) {
            fetchDocuments();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authContext]);

    return (
        <Container>
            {loading && (
                <LoaderContainer>
                    <HCLoader />
                </LoaderContainer>
            )}
            {/* Right Part */}
            <DancingBotGridComponent botState={'idling'}>
                {/* Header */}
                <HeaderContainer>
                    <WelcomeText>Documents status</WelcomeText>
                </HeaderContainer>

                {/* The lower part: a gray form box containing the table */}
                <TableContainer>
                    <FormBox>
                        {/* Table for completed documents */}
                        <HCDataTable
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
export default CollectorDocumentsStatusPage;

