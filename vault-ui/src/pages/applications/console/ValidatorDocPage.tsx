import React, { useEffect, useMemo, useState } from 'react';
import {
    error as showError,
    HCButton,
    HCDropDown,
    HCDropDownValue,
    HCIcon,
    HCTextField,
    success,
    HCLoader
} from 'generic-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { styled } from '@mui/material';
import { VAULT_API_URL } from '../../../config';
import CheckIcon from '@mui/icons-material/Check';
import { diffWords } from 'diff';
import { useAuthContext } from '../../../hooks/useAuthContext';
import { LoginResponseDTO } from '../../../types/LoginResponseDTO';
import { DancingBotGridComponent } from '../../../components/DancingBotGridComponent';
import { HeaderContainer, LoaderContainer, WelcomeText } from '../../../components';

// ------------ Styles -----------------

const PageWrapper = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    // Removed the top padding
    padding: '0',
    boxSizing: 'border-box',
    gap: '20px',
});

const HeaderTitle = styled('h1')({
    fontSize: '50px',
    fontWeight: 'bold',
    margin: 0,               // no top margin
    marginBottom: '16px',    // slightly smaller bottom margin
});

const ContentBox = styled('div')({
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    gap: '20px',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    borderRadius: '8px',
    overflow: 'auto',
});

/** Left Column (Summary) **/
const LeftColumn = styled('div')({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
});

const RightColumn = styled('div')({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
});

const SectionTitle = styled('h2')({
    fontSize: '20px',
    marginBottom: '10px',
});

const Subtitle = styled('h3')({
    fontSize: '16px',
    margin: '10px 0 5px 0',
});

/** Tags **/
const TagContainer = styled('div')({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    backgroundColor: '#fff',
    padding: '10px',
    maxHeight: '300px',  // Adjust as needed
    overflowY: 'auto',
    borderRadius: '8px',
    border: '1px solid #ddd',
});

const TagChip = styled('div')({
    backgroundColor: '#d3d3d3',
    borderRadius: '16px',
    padding: '6px 12px',
    fontSize: '14px',
    cursor: 'pointer',
});

/** Row for "Confidentiality" + "Linked Docs" side by side **/
const TwoColumnRow = styled('div')({
    display: 'flex',
    gap: '20px',
});

const TitleContainer = styled('div')({
    // Instead of flex: 1, use inline or inline-flex:
    display: 'inline-flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: '#fff',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    // Align to the start so it doesn't expand to fill horizontally:
    //alignSelf: 'flex-start',
});

const ConfidentialityContainer = styled('div')({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: '#fff',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
});

const LinkedDocsContainer = styled('div')({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: '#fff',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
});

const DocItem = styled('div')({
    margin: '5px 0',
});

/** Delegate section **/
const DelegateSection = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
});

const ButtonRow = styled('div')({
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '20px',
});

const SummaryTextField = styled(HCTextField)({
    width: '100%',
});

const SummaryDisplay = styled('div')({
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minHeight: '200px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontFamily: 'inherit',
    maxHeight: '300px',  // Adjust as needed
    overflowY: 'auto',
});

const ButtonContainer = styled('div')({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    padding: '0px 0', // Adjust padding as needed to fit within the gray box limits
});

const Highlighted = styled('span')({
    backgroundColor: '#ffeb3b', // Yellowish background for additions.
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

// Reusable diff and highlighting function.
function generateHighlightedComponents(
    originalText: string,
    currentText: string
): React.ReactNode[] {
    const diff = diffWords(originalText, currentText);

    return diff.map((part, index) => {
        if (part.added) {
            return (
                <Highlighted key={`added-${index}`}>
                    {part.value}
                </Highlighted>
            );
        }
        if (part.removed) {
            return (
                <Removed key={`removed-${index}`}>
                    {part.value}
                </Removed>
            );
        }
        return (
            <span key={`unchanged-${index}`}>
                {part.value}
            </span>
        );
    });
}

// Define interfaces for API response shapes
interface DocumentRowFromAPI {
    tags?: string | string[];
    comment?: string;
    summary?: string;
    link?: string;
    title?: string;
    severityLevels?: string;
    severity_levels?: string;
    responsible?: string;
    [key: string]: unknown;
}

interface DelegatorFromAPI {
    id: string;
    fullName: string;
}

// interface ApiErrorResponse { // Removed as unused
//     response?: {
//         data?: {
//             detail?: string;
//         };
//     };
// }

// ------------ Component -----------------

const ValidatorDocPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();  // Get the location object
    const { DocumentId } = location.state || {};
    // State for the metadata fields
    const [summary, setSummary] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [documentTitle, setDocumentTitle] = useState('');
    const [sourceLink, setSourceLink] = useState('');
    const [delegator, setDelegator] = useState<HCDropDownValue>();
    const [severity, setSeverity] = useState<HCDropDownValue | undefined>();
    const [comment, setComment] = useState('');

    const [delegatorOptions, setDelegatorOptions] = useState<HCDropDownValue[]>([]);
    const [authorSuggestion, setAuthorSuggestion] = useState('');
    const [originalSummary, setOriginalSummary] = useState('');
    const [showDiff, setShowDiff] = useState(false);
    const [loading, setLoading] = useState(false);

    const authContext = useAuthContext();
    const user = authContext?.user;

    const severityOptions = [
        { id: '0', value: 'Public' },
        { id: '1', value: 'Low' },
        { id: '2', value: 'Medium' },
        { id: '3', value: 'High' },
        { id: '4', value: 'Critical' },
    ];

    // Handlers
    const handleSeverityChange = (selectedOption: HCDropDownValue) => {
        setSeverity(selectedOption);
    };

    // When "Modify" is clicked, allow editing
    const handleModify = () => {
        setOriginalSummary(summary);
        setIsEditing(true);
    };

    // When "Update" is clicked, save changes and disable editing
    const handleUpdate = async () => {
        setShowDiff(true);
        setIsEditing(false);
    };

    const handleReject = async () => {
        if (!comment || !summary) {
            toast.error('Comment and summary are required to reject.');
            return;
        }

        const userConfirmed = confirm('Are you sure you want to reject this document?');
        if (!userConfirmed) return;

        try {
            const delegatorVal = delegator ? delegator.id : '';
            const severityVal = severity ? severity.value : authorSuggestion;

            // Construct payload for API call
            const payload = {
                doc_id: DocumentId,
                comment,
                summary,
                reviewer: delegatorVal,
                ...(severityVal && { severity_levels: severityVal }), // Include severity if available
            };

            // Make the API call to the backend
            await axios.post(
                `${VAULT_API_URL}/api/v1/validator/reject-document`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${user?.token ?? ''}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Handle successful response
            success('Document successfully rejected.');
            navigate('/applications/console/ValidatorStartPage');
        } catch (err) {
            console.error('Error while rejecting the file:', err);
            showError('An error occurred while rejecting the document.');
        }
    };

    const handleAccept = async () => {
        try {
            // Ensure safety in accessing severity
            const severityVal = severity?.value || '';

            console.log('Severity:', severity);

            // Construct the payload for the API call
            const payload = {
                doc_id: DocumentId, // Ensure DocumentId is available
                comment: comment,
                summary: summary,
                ...(severityVal && { severity_levels: severityVal }), // Include severity if present
            };

            // Call the Python backend API
            await axios.post(
                `${VAULT_API_URL}/api/v1/validator/accept-document`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${user?.token ?? ''}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            success('Document successfully updated.');
            navigate('/applications/console/ValidatorStartPage'); // Redirect on success
        } catch (error) {
            console.error('Unexpected error:', error);
            showError('An unexpected error occurred. Please try again.');
        }
    };

    const handleDelegateBtn = async () => {
        try {
            if (!delegator) {
                showError({ message: 'Please select an expert before proceeding.' });
                return;
            }

            // The selected delegate from the dropdown
            const delegatorVal = delegator.id;

            // Optionally you can handle severity too if needed:
            const severityVal = severity ? severity.value : authorSuggestion;

            // Build an update object
            const updateFields: Partial<DocumentRowFromAPI> = {
                comment,
                status: 'On Review',
                summary,
                responsible: delegatorVal,
                ...(severityVal && { severity_levels: severityVal }),
            };

            // Build the payload for the API
            const payload = {
                doc_id: DocumentId,
                delegator_id: user?.user.id,
                assignee_id: delegatorVal,
                comment: updateFields.comment,
                status: updateFields.status,
                summary: updateFields.summary,
                severity_levels: severityVal,
            };

            // Send the request to your Python back-end
            await axios.post(
                `${VAULT_API_URL}/api/v1/validator/delegate-document`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${user?.token ?? ''}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Handle success
            success('Document successfully delegated!');
            navigate('/applications/console/ValidatorStartPage');
        } catch (error: unknown) {
            console.error('Error in delegate logic:', error);
            let errorMessage = 'An error occurred. Please try again.';
            if (axios.isAxiosError(error) && error.response?.data && typeof error.response.data === 'object' && 'detail' in error.response.data) {
                errorMessage = (error.response.data as {detail?: string}).detail ?? errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            showError(errorMessage);
        }
    };

    const handleDelegate = (selectedOption: HCDropDownValue) => {
        setDelegator(selectedOption);
    };

    const fetchDocumentFromAPI = async () => {
        if (!user?.token || !DocumentId) return;
        setLoading(true);
        try {
            const {data} = await axios.post<{document: DocumentRowFromAPI}>(
                `${VAULT_API_URL}/api/v1/validator/fetch_document_by_id`,
                {document_id: DocumentId},
                {headers: {Authorization: `Bearer ${user?.token}`}}
            );
            const docRow = data.document;
            setComment(docRow.comment || '');
            setSummary(docRow.summary || '');
            setOriginalSummary(docRow.summary || '');
            setSourceLink(docRow.link || '');
            setDocumentTitle(docRow.title || 'Document Title Missing');
            if (docRow.tags) {
                const fetchedTags = Array.isArray(docRow.tags) ? docRow.tags : JSON.parse(docRow.tags as string);
                setTags(fetchedTags.map((tag: string) => tag));
            }

            // Use severity_levels (snake_case) primarily
            const authorSuggestionValue = docRow.severity_levels || docRow.severityLevels;

            if (authorSuggestionValue) {
                try {
                    // Attempt to parse as JSON first
                    const severityData = JSON.parse(authorSuggestionValue as string);
                    // Check if it's an object with the expected property
                    if (typeof severityData === 'object' && severityData !== null && 'author_suggestion' in severityData) {
                        setAuthorSuggestion(severityData.author_suggestion || '');
                        const currentSeverity = severityOptions.find(opt => opt.value === severityData.author_suggestion);
                        setSeverity(currentSeverity || undefined);
                    } else {
                        // If parsed but not the expected object, or if it's a string that JSON.parse handled
                        // Treat authorSuggestionValue as the direct suggestion string.
                        setAuthorSuggestion(authorSuggestionValue as string);
                        const currentSeverity = severityOptions.find(opt => opt.value === authorSuggestionValue);
                        setSeverity(currentSeverity || undefined);
                    }
                } catch (parseError) {
                    // If JSON.parse fails, it means authorSuggestionValue is likely a direct string like "Low"
                    console.warn('Failed to parse severity_levels as JSON, treating as direct string:', parseError);
                    setAuthorSuggestion(authorSuggestionValue as string);
                    const currentSeverity = severityOptions.find(opt => opt.value === authorSuggestionValue);
                    setSeverity(currentSeverity || undefined);
                }
            }
        } catch (err: unknown) {
            console.error('Error fetching document data from backend:', err);
            let errorMessage = 'An unexpected error occurred while fetching data.';
            if (axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object' && 'detail' in err.response.data) {
                errorMessage = (err.response.data as {detail?: string}).detail ?? errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchDelegators = async () => {
        if (!user?.token) return;
        try {
            // Assuming the API expects user_id in the POST body for fetching delegators
            const response = await axios.post<{ delegators: DelegatorFromAPI[] }>(
                `${VAULT_API_URL}/api/v1/validator/fetch_delegators`,
                { user_id: user?.user.id }, 
                { headers: { Authorization: `Bearer ${user?.token}`}}
            );
            setDelegatorOptions(response.data.delegators.map((del) => ({ id: del.id, value: del.fullName })));
        } catch (err: unknown) { 
            let errorMessage = 'An error occurred while fetching delegators';
            if (axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object' && 'detail' in err.response.data) {
                errorMessage = (err.response.data as {detail?: string}).detail ?? errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            showError(errorMessage);
            console.error('Error fetching Delegators:', err);
        }
    };

    const highlightedComponents = useMemo(() => {
        if (showDiff) {
            return generateHighlightedComponents(originalSummary, summary);
        }
        return <span>{summary}</span>;
    }, [originalSummary, summary, showDiff]);

    useEffect(() => {
        if (user?.token && DocumentId) {
            fetchDocumentFromAPI();
            fetchDelegators();
        }
    }, [user, DocumentId]);

    return (
        <DancingBotGridComponent botState={'greeting'}>
            <HeaderContainer>
                <WelcomeText>{documentTitle}</WelcomeText>
            </HeaderContainer>
            {loading && <LoaderContainer><HCLoader/></LoaderContainer>}
            <PageWrapper>
                {/* Header (Title) at top */}
                <HeaderTitle>Please correct this Information</HeaderTitle>

                {/* Big Gray Box with two columns */}
                <ContentBox>
                    {/* Left Column: Summary */}
                    <LeftColumn>
                        <TitleContainer>
                            <SectionTitle>Summary</SectionTitle>
                            {isEditing ? (
                                <SummaryTextField
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    inputProps={{
                                        placeholder: 'Edit your summary here...',
                                        rows: 16
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
                                    sx={{ mt: 2, background: '#e66334', ':hover': { background: '#FF8234' } }}
                                    hcVariant="primary"
                                    size="large"
                                    text="Modify"
                                    onClick={handleModify}
                                    disabled={isEditing} // Disable if already editing
                                />
                                <HCButton
                                    sx={{ mt: 2, background: '#e66334', ':hover': { background: '#FF8234' } }}
                                    hcVariant="primary"
                                    size="large"
                                    text="Update"
                                    onClick={handleUpdate}
                                    disabled={!isEditing} // Enable only when editing is active
                                />
                            </ButtonContainer>
                        </TitleContainer>
                        {/* Tags */}
                        <TitleContainer>
                            <div>
                                <Subtitle>Tags</Subtitle>
                                <TagContainer>
                                    {tags.map((tag, idx) => (
                                        <TagChip key={idx}>{tag}</TagChip>
                                    ))}
                                </TagContainer>
                            </div>
                        </TitleContainer>
                    </LeftColumn>

                    {/* Right Column: Tags, Conf/Linked Docs side by side, Delegate, Bottom Buttons */}
                    <RightColumn>
                        <TitleContainer>
                            <Subtitle>Document Title</Subtitle>
                            <label>{documentTitle}</label>
                        </TitleContainer>
                        {/* Confidentiality + Linked Docs side by side */}
                        <TwoColumnRow>
                            <ConfidentialityContainer>
                                <Subtitle>Confidentiality level</Subtitle>
                                <label>Author&apos;s suggestion</label>
                                <HCTextField
                                    type="text"
                                    value={authorSuggestion}
                                />

                                <label>Your suggestion</label>
                                {/* Severity Level Dropdown using the provided HCDropDown */}
                                <HCDropDown
                                    inputProps={{ placeholder: 'Select' }}
                                    label="Severity Level"
                                    onChange={handleSeverityChange}
                                    options={severityOptions}
                                    value={severity}
                                />
                            </ConfidentialityContainer>

                            <LinkedDocsContainer>
                                <Subtitle>Linked documents</Subtitle>
                                <DocItem>{sourceLink}</DocItem>
                            </LinkedDocsContainer>
                        </TwoColumnRow>

                        <TitleContainer>
                            <label>Comment</label>
                            <HCTextField
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </TitleContainer>

                        {/* Delegate section */}
                        <DelegateSection>
                            <LinkedDocsContainer>
                                <Subtitle>Delegate to an Expert</Subtitle>
                                <HCDropDown
                                    inputProps={{ placeholder: 'Select' }}
                                    onChange={handleDelegate}
                                    options={delegatorOptions}
                                    value={delegator}
                                    required={true}
                                />
                                <HCButton
                                    sx={{ textTransform: 'capitalize' }}
                                    text="DELEGATE & RETURN"
                                    onClick={handleDelegateBtn}
                                    hcVariant="primary"
                                    endIcon={<HCIcon icon={'ApplyToAll'} />}
                                />
                            </LinkedDocsContainer>
                        </DelegateSection>

                        {/* Bottom Buttons */}
                        <ButtonRow>
                            <HCButton
                                sx={{ textTransform: 'capitalize' }}
                                text="REJECT"
                                hcVariant="secondary"
                                onClick={handleReject}
                            />
                            <HCButton
                                sx={{ textTransform: 'capitalize' }}
                                text="ACCEPT"
                                hcVariant="primary"
                                onClick={handleAccept}
                            />
                        </ButtonRow>
                    </RightColumn>
                </ContentBox>
            </PageWrapper>
        </DancingBotGridComponent>
    );
};

export default ValidatorDocPage;
