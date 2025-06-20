import React, {useEffect, useMemo, useState} from 'react';
import {error as showError, HCButton, HCDropDown, HCDropDownValue, HCTextField} from 'generic-components';
import {useLocation, useNavigate} from 'react-router-dom';
import axios from 'axios';
// import {getCurrentUser} from '../../../services/auth/Auth.service';
import {useAuthContext} from '../../../hooks/useAuthContext';
import {styled} from '@mui/material';
import {VAULT_API_URL} from '../../../config';
import { diffWords } from 'diff';
import { LoginResponseDTO } from '../../../types/LoginResponseDTO';

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
    borderRadius: '8px',
    border: '1px solid #ddd',
    maxHeight: '300px',  // Adjust as needed
    overflowY: 'auto',
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
    const diff = diffWords(originalText || '', currentText || '');
    return diff.map((part, index) => {
        if (part.added) {
            return <Highlighted key={index}>{part.value}</Highlighted>;
        }
        if (part.removed) {
            return <Removed key={index}>{part.value}</Removed>;
        }
        return <span key={index}>{part.value}</span>;
    });
}

// ------------ Component -----------------

const ExpertDocPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const DocumentId = location.state?.DocumentId;

    // State for form fields
    const [tags, setTags] = useState<string[]>([]);
    const [comment, setComment] = useState<string>('');
    const [summary, setSummary] = useState<string>('');
    const [originalSummary, setOriginalSummary] = useState<string>('');
    const [documentTitle, setDocumentTitle] = useState<string>('');
    const [sourceLink, setSourceLink] = useState<string>('');
    const [authorSuggestion, setAuthorSuggestion] = useState<string>('');
    const [severity, setSeverity] = useState<HCDropDownValue | undefined>(undefined);
    const [isEditing, setIsEditing] = useState(false);
    const [delegator] = useState<HCDropDownValue | undefined>(undefined);

    const authContext = useAuthContext();
    const user = authContext?.user as LoginResponseDTO;

    const handleSeverityChange = (selectedOption: HCDropDownValue | undefined) => {
        setSeverity(selectedOption);
    };

    const handleReject = async () => {
        try {
            // The selected delegate from the dropdown
            const delegatorVal = delegator?.id || '';

            // Optionally you can handle severity too if needed:
            const severityVal = severity ? severity.value : authorSuggestion;

            const updateFields = {
                doc_id: DocumentId,
                comment,
                summary,
                reviewer: delegatorVal,
                severity_levels: severityVal || null,
            };

            const response =
                await axios.put(`${VAULT_API_URL}/api/v1/expert/reject-document`, updateFields, { headers: {
                    Authorization: `Bearer ${user.token ?? ''}`,
                    'Content-Type': 'application/json' }
                });

            if (response.status === 200) {
                navigate('/applications/console/ExpertStartPage');
            } else {
                showError({ message: 'Unexpected response: ' + response.statusText });
            }
        } catch (err) {
            showError({ message: 'Error while rejecting the file: ' + (err instanceof Error ? err.message : String(err)) });
        }
    };

    const handleAccept = async () => {
        // Your "Accept" logic
        const severityVal = severity ? severity.value : authorSuggestion;

        const payload = {
            doc_id: DocumentId,
            comment,
            summary,
            severity_levels: severityVal === '' ? undefined : severityVal,
        };

        try {
            const response = await axios
                .post(`${VAULT_API_URL}/api/v1/expert/accept-document`, payload, { headers: {
                    Authorization: `Bearer ${user.token ?? ''}`,
                    'Content-Type': 'application/json' }
                });
            console.log(response.data); // or handle it as needed
            navigate('/applications/console/ExpertStartPage');
        } catch (error: unknown) {
            let errorMessage = 'Failed to update document';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            showError({ message: errorMessage });
        }
    };

    // When "Modify" is clicked, allow editing
    const handleModify = () => {
        setIsEditing(true);
    };

    // When "Update" is clicked, save changes and disable editing
    const handleUpdate = async () => {
        setIsEditing(false);
    };

    useEffect(() => {
        const fetchExistingDoc = async () => {
            try {
                console.log('start');
                // If not resuming, skip
                if (!DocumentId) return;
                // const currentUser = await getCurrentUser(); // getCurrentUser seems to be unused elsewhere too
                // if (!currentUser) {
                //     showError('User not logged in');
                //     return;
                // }

                // 2) Fetch existing doc from "documents" table
                const response = await axios
                    .get(`${VAULT_API_URL}/api/v1/expert/get-document/${DocumentId}`, { headers: {
                        Authorization: `Bearer ${user.token ?? ''}`,
                        'Content-Type': 'application/json' }
                    });
                const docRow = response.data;

                if (docRow.tags) {
                    const existingTags = Array.isArray(docRow.tags)
                        ? docRow.tags
                        : JSON.parse(docRow.tags);
                    setTags(existingTags);
                }

                // Example fields: "tags", "employee_contact", "link", "title", "responsible", "severity_levels"
                if (docRow.tags) {
                    // Might be stored as a JSON string or array
                    const existingTags = Array.isArray(docRow.tags)
                        ? docRow.tags
                        : JSON.parse(docRow.tags);
                    setTags(existingTags);
                }
                if (docRow.comment) setComment(docRow.comment);
                if (docRow.summary) setSummary(docRow.summary);
                if (docRow.summary) setOriginalSummary(docRow.summary);

                if (docRow.link) setSourceLink(docRow.link);
                if (docRow.title) setDocumentTitle(docRow.title);
                if (docRow.severity_levels) setAuthorSuggestion(docRow.severity_levels);
                console.log('author suggestion: ', authorSuggestion);
            } catch (err: unknown) {
                console.error('Error fetching existing doc data:', err);
                if (err instanceof Error) {
                    showError({ message: err.message });
                } else {
                    showError({ message: 'An unknown error occurred' });
                }
            }
        };

        fetchExistingDoc();
    }, [DocumentId, user?.token]);

    const highlightedComponents = useMemo(() => {
        return generateHighlightedComponents(originalSummary, summary);
    }, [originalSummary, summary]);

    return (
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
                                sx={{mt: 2, background: '#e66334', ':hover': {background: '#FF8234'}}}
                                hcVariant="primary"
                                size="large"
                                text="Modify"
                                onClick={handleModify}
                                disabled={isEditing} // Disable if already editing
                            />
                            <HCButton
                                sx={{mt: 2, background: '#e66334', ':hover': {background: '#FF8234'}}}
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
                            <HCDropDown
                                id="severity-dropdown"
                                value={severity}
                                showPlaceholder
                                onChange={handleSeverityChange}
                                options={[
                                    {id: 'low', value: 'low'},
                                    {id: 'medium', value: 'medium'},
                                    {id: 'high', value: 'high'},
                                ]}
                                inputProps={{
                                    placeholder: 'Select severity'
                                }}
                            />
                        </ConfidentialityContainer>

                        <LinkedDocsContainer>
                            <Subtitle>Linked Documents</Subtitle>
                            <DocItem>
                                <a href={sourceLink} target="_blank" rel="noopener noreferrer">
                                    {sourceLink}
                                </a>
                            </DocItem>
                        </LinkedDocsContainer>
                    </TwoColumnRow>

                    {/* Comment section */}
                    <TitleContainer>
                        <SectionTitle>Comments</SectionTitle>
                        <HCTextField
                            type="textArea"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            inputProps={{
                                placeholder: 'Enter your comments here...',
                                rows: 4
                            }}
                        />
                    </TitleContainer>

                    {/* Buttons at bottom */}
                    <ButtonRow>
                        <HCButton
                            sx={{mt: 2, background: '#e66334', ':hover': {background: '#FF8234'}}}
                            hcVariant="primary"
                            size="large"
                            text="ACCEPT"
                            onClick={handleAccept}
                        />
                        <HCButton
                            sx={{mt: 2}}
                            hcVariant="secondary"
                            size="large"
                            text="REJECT"
                            onClick={handleReject}
                        />
                    </ButtonRow>
                </RightColumn>
            </ContentBox>
        </PageWrapper>
    );
};

export default ExpertDocPage; 