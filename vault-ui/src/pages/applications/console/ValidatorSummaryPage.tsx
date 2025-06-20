import React, {useEffect, useState} from 'react';
import {Button, Card, CardContent, Chip, Container, Grid, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

import {LoginResponseDTO} from '../../../types/LoginResponseDTO';
import {useAuthContext} from '../../../hooks/useAuthContext';
import {VAULT_API_URL} from '../../../config';
import CollectorPageLayout from '../../CollectorLayoutPage';
import {error as showError} from 'generic-components';

// ------------ Types --------------------
// Interface for the raw API response (snake_case)
// interface StatsDataFromAPI {
//     total_assigned: number;
//     total_completed: number;
//     average_review_time: number;
// }

// Interface for UI state (camelCase)
interface StatsData {
    totalAssigned: number;
    totalCompleted: number;
    averageReviewTime: number;
}

// Interface for the raw API response for documents (snake_case)
interface DocumentRowFromAPI { 
    id: string; 
    title: string;
    status: string;
    // Add other snake_case properties from API as needed
}

// Interface for UI state for documents (camelCase)
interface DocumentRow {
    id: string; 
    title: string;
    status: string;
    // Add other camelCase properties for UI as needed
    [key: string]: unknown; 
}

// ------------ Component ----------------
const ValidatorSummaryPage: React.FC = () => {
    const authContext = useAuthContext();
    const user = authContext?.user;
    const navigate = useNavigate();
    const [stats, setStats] = useState<StatsData | null>(null);
    const [assignedDocuments, setAssignedDocuments] = useState<DocumentRow[]>([]);

    const fetchStats = async () => {
        if (!user) {
            showError('User not authenticated.');
            return;
        }
        try {
            // Fetch as a generic object, then access snake_case properties for mapping
            const response = await axios.get<{[key: string]: number}>(`${VAULT_API_URL}/api/v1/validator/get_stats`, {
                headers: {
                    Authorization: `Bearer ${(user as LoginResponseDTO).token}`,
                },
            });
            const apiData = response.data; // apiData will have snake_case keys from the API
            setStats({
                totalAssigned: apiData.total_assigned,       // Map from snake_case
                totalCompleted: apiData.total_completed,    // Map from snake_case
                averageReviewTime: apiData.average_review_time // Map from snake_case
            });
        } catch (error: unknown) {
            console.error('Failed to fetch stats:', error);
            let errorMessage = 'Failed to load summary statistics.';
            if (error instanceof Error) {
                errorMessage = error.message;
                if (axios.isAxiosError(error) && error.response?.data && typeof error.response.data === 'object' && 'detail' in error.response.data) {
                    const detail = (error.response.data as {detail?: string}).detail;
                    errorMessage = detail ?? errorMessage;
                }
            }
            showError(errorMessage);
        }
    };

    const fetchAssignedDocuments = async () => {
        if (!user) {
            showError('User not authenticated.');
            return;
        }
        try {
            const response = await axios.post<{ documents: DocumentRowFromAPI[] }>(`${VAULT_API_URL}/api/v1/validator/fetch_assigned_documents`,
                { validator_id: (user as LoginResponseDTO).user.id }, 
                {
                    headers: {
                        Authorization: `Bearer ${(user as LoginResponseDTO).token}`,
                    },
                }
            );
            setAssignedDocuments(response.data.documents.map(docFromApi => ({
                id: docFromApi.id, 
                title: docFromApi.title, 
                status: docFromApi.status, 
            }))); 
        } catch (error: unknown) {
            console.error('Failed to fetch assigned documents:', error);
            let errorMessage = 'Failed to load assigned documents.';
            if (error instanceof Error) {
                errorMessage = error.message;
                if (axios.isAxiosError(error) && error.response?.data && typeof error.response.data === 'object' && 'detail' in error.response.data) {
                    const detail = (error.response.data as {detail?: string}).detail;
                    errorMessage = detail ?? errorMessage;
                }
            }
            showError(errorMessage);
        }
    };

    useEffect(() => {
        if (user) {
            fetchStats();
            fetchAssignedDocuments();
        }
    }, [user]);

    return (
        <CollectorPageLayout headline1='Validator Summary' headline2='Overview of your activities' showContinueButton={false}>
            <Container maxWidth='lg' sx={{mt: 4, mb: 4}}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant='h6'>Total Assigned</Typography>
                                <Typography variant='h4'>{stats?.totalAssigned ?? 'Loading...'}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant='h6'>Total Completed</Typography>
                                <Typography variant='h4'>{stats?.totalCompleted ?? 'Loading...'}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant='h6'>Avg. Review Time</Typography>
                                <Typography variant='h4'>{stats?.averageReviewTime ?? 'Loading...'} (hours)</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant='h5' gutterBottom sx={{ mt: 3 }}>Assigned Documents</Typography>
                        {assignedDocuments.length > 0 ? (
                            assignedDocuments.map((doc) => (
                                <Card key={doc.id} sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Typography variant='h6'>{doc.title}</Typography>
                                        <Chip label={doc.status} size='small' sx={{mr:1}} /> 
                                        <Button 
                                            variant='contained' 
                                            size='small' 
                                            onClick={() => navigate(`/applications/console/ValidatorDocPage/${doc.id}`)}
                                        >
                                            Review Document
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Typography>No documents currently assigned.</Typography>
                        )}
                    </Grid>
                </Grid>
            </Container>
        </CollectorPageLayout>
    );
};

export default ValidatorSummaryPage; 