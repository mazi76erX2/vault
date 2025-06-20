import React, {useMemo, useState} from 'react';
import {error as showError, HCButton, HCTextField} from 'generic-components';
import CollectorPageLayout from '../../CollectorLayoutPage'; // Adjust the import path as needed
import {useLocation, useNavigate} from 'react-router-dom'; // Import useLocation to retrieve passed data // Import useNavigate for programmatic navigation
import {useAuthContext} from '../../../hooks/useAuthContext';
import {styled} from '@mui/material';
// import {VAULT_API_URL} from '../../../config'; // No longer needed
import {diffWords} from 'diff';
// import axios from 'axios'; // No longer needed directly, AxiosError is imported
import Api from '../../../services/Instance'; // Import Api instance
import { AxiosError } from 'axios'; // Import AxiosError

const SummaryTextField = styled(HCTextField)({
    width: '100%',
});
const SummaryDisplay = styled('div')({
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    maxHeight: 'auto',  // Adjust as needed
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontFamily: 'inherit',
});


const ButtonContainer = styled('div')({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    padding: '20px 0', // Adjust padding as needed to fit within the gray box limits
});


const Highlighted = styled('span')({
    backgroundColor: '#ffeb3b', // example background color
    padding: '0 2px',
    borderRadius: '2px',
    fontWeight: 500,
});
const Removed = styled('span')({
    textDecoration: 'line-through',
    backgroundColor: '#ef9a9a', // Light red background for removals.
    color: '#c62828',
    padding: '0 2px',
    borderRadius: '2px',
});


function generateHighlightedComponents(
    originalText: string,
    currentText: string
): React.ReactNode[] {
    const diff = diffWords(originalText, currentText);

    return diff.map((part, index) => {
        if (part.added) {
            return (
                <Highlighted key={index}>
                    {part.value}
                </Highlighted>
            );
        }
        if (part.removed) {
            // Do not render removed parts.
            return (
                <Removed key={`removed-${index}`}>
                    {part.value}
                </Removed>
            );

        }
        return (
            <span key={index}>
                {part.value}
            </span>
        );
    });
}


const CollectorSummaryPage = () => {

    const navigate = useNavigate();
    const authContext = useAuthContext(); // Call hook once

    const location = useLocation();  // Get the location object
    const {generatedSummary, sessionId, isResume} = location.state || {};

    // State for the summary text
    const [summaryText, setSummaryText] = useState(
        generatedSummary
    );
    // State to control whether the text field is editable
    const [isEditing, setIsEditing] = useState(false);
    const highlightedComponents = useMemo(() => {
        return generateHighlightedComponents(generatedSummary, summaryText);
    }, [generatedSummary, summaryText]);

    // When "Modify" is clicked, allow editing
    const handleModify = () => {
        setIsEditing(true);
    };

    // When "Update" is clicked, save changes and disable editing
    const handleUpdate = async () => {
        if (!authContext || !authContext.user?.user?.id) { // Check authContext and user ID
            showError('User not logged in or user ID not available.');
            return;
        }

        try {
            // Use Api instance, headers are handled by interceptor
            const response = await Api.post<{message?: string}>(
                '/api/v1/collector/update_summary', // Path relative to baseURL
                {
                    user_id: authContext.user.user.id, // Use checked user ID
                    session_id: sessionId,
                    summary_text: summaryText,
                }
                // Headers are now managed by the Api instance interceptor
            );

            console.log('Summary updated:', response.data);
            setIsEditing(false); // Set the editing state to false after the update
        } catch (error: unknown) {
            console.error('Error updating summary:', error);
            if (!(error instanceof AxiosError && error.response?.status === 401)) {
                if (error instanceof AxiosError && error.response?.data && typeof error.response.data === 'object' && 'detail' in error.response.data) {
                    const detail = (error.response.data as {detail?: string}).detail;
                    showError({message: detail ?? 'There was an issue updating the summary.'});
                } else if (error instanceof Error) {
                    showError({message: error.message});
                } else {
                    showError({message: 'There was an issue updating the summary.'});
                }
            }
        }
    };

    const handleContinue = async () => {
        if (!authContext || !authContext.user?.user?.id) { // Check authContext and user ID
            showError('User not logged in or user ID not available.');
            return;
        }

        try {
            // Use Api instance, headers are handled by interceptor
            const response = await Api.post<{ message: string, next_page: string, state: { summary_text: string, session_id: string, is_resume: string } }>(
                '/api/v1/collector/continue_session', // Path relative to baseURL
                {
                    session_id: sessionId,
                    summary_text: summaryText,
                    is_resume: isResume ?? 'false',
                    user_id: authContext.user.user.id, // Add user_id to the payload
                }
                // Headers are now managed by the Api instance interceptor
            );

            const { next_page, state } = response.data;

            console.log('Summary updated:', response.data);

            // Navigate to the next page with state data from the API response
            navigate(next_page, { state });

        } catch (err: unknown) {
            console.error('Error continuing session:', err);
            if (!(err instanceof AxiosError && err.response?.status === 401)) {
                if (err instanceof AxiosError && err.response?.data && typeof err.response.data === 'object' && 'detail' in err.response.data) {
                    const detail = (err.response.data as {detail?: string}).detail;
                    showError({message: detail ?? 'There was an issue continuing the session.'});
                } else if (err instanceof Error) {
                    showError({message: err.message});
                } else {
                    showError({message: 'There was an issue continuing the session.'});
                }
            }
        }
    };

    return (
        <CollectorPageLayout headline1="Super!" headline2="Please check the information" showContinueButton={false}>
            {isEditing ? (

                <SummaryTextField
                    value={summaryText}
                    onChange={(e) => setSummaryText(e.target.value)}
                    inputProps={{
                        placeholder: 'Edit your summary here...',
                        rows: 15,

                    }}
                    label="The Chat Summary"
                    type="textArea"
                />
            ) : (
                <SummaryDisplay>
                    {highlightedComponents}
                </SummaryDisplay>
            )}


            <ButtonContainer>
                <HCButton
                    sx={{mt: 2, background: '#e66334', ':hover': { background: '#FF8234' }}}
                    hcVariant="primary"
                    size="large"
                    text="Modify"
                    onClick={handleModify}
                    disabled={isEditing} // Disable if already editing
                />
                <HCButton
                    sx={{mt: 2, background: '#e66334', ':hover': { background: '#FF8234' }}}
                    hcVariant="primary"
                    size="large"
                    text="Update"
                    onClick={handleUpdate}
                    disabled={!isEditing} // Enable only when editing is active
                />

                <HCButton
                    sx={{mt: 2, background: '#e66334', ':hover': { background: '#FF8234' }}}
                    hcVariant="primary"
                    size="large"
                    text="Continue"
                    onClick={handleContinue}
                />
            </ButtonContainer>
        </CollectorPageLayout>
    );
};

export default CollectorSummaryPage;
