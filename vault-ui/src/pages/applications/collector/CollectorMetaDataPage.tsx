import React, {useEffect, useState} from 'react';
import {
    error as showError,
    HCButton,
    HCDropDown,
    HCDropDownValue,
    HCIcon,
    HCLoader,
    HCTextField,
    success
} from 'generic-components';
import CollectorPageLayout from '../../CollectorLayoutPage';
import {useLocation, useNavigate} from 'react-router-dom'; // Import useLocation to retrieve passed data // Import useNavigate for programmatic navigation
// import axios from 'axios'; // No longer needed directly
import {useAuthContext} from '../../../hooks/useAuthContext';
import {styled} from '@mui/material';
// import {VAULT_API_URL} from '../../../config'; // No longer needed
import Api from '../../../services/Instance'; // Import Api instance
import { AxiosError } from 'axios'; // Import AxiosError

interface ValidatorProfile {
    id: string;
    full_name: string;
}

interface DocumentStatus {
    id: string;
    title: string;
    responsible: string;
    status: string;
}

const FormContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    height: '100%',
    overflowY: 'auto',
});

const LoaderContainer = styled(FormContainer)({
    position: 'fixed', // Keep the loader fixed over the page
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Slightly dim background
    zIndex: 1000, // Ensure it stays above other elements
    justifyContent: 'center', // Center loader horizontally
    alignItems: 'center', // Center loader vertically
});

const InputField = styled(HCTextField)({
    width: '100%',
});

const TagsContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
});

const Label = styled('label')({
    marginBottom: '5px',
    fontWeight: 'bold',
});

const GenerateTagsRow = styled('div')({
    display: 'flex',
    justifyContent: 'flex-start',
});

const TagInputContainer = styled('div')({
    display: 'flex',
    gap: '10px',
});

const TagList = styled('div')({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px', // Reduced gap for a compact look
});

const TagItem = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    padding: '2px 6px', // Even smaller padding for compact tags
    backgroundColor: '#eee',
    borderRadius: '5px',
    fontSize: '11px', // Reduce font size further
});

const RemoveButton = styled('button')({
    padding: '0px 5px', // Minimal padding
    minWidth: '20px', // Very small button size
    height: '20px', // Ensures a square shape
    fontSize: '10px', // Smaller font for the 'X'
    backgroundColor: '#888',
    color: '#fff',
    borderRadius: '50%',
    lineHeight: '1', // Ensure button remains compact
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer', // Ensures better usability
});

const SubmitButtonContainer = styled('div')({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'center',
});

const CollectorMetaDataPage = () => {
    const navigate = useNavigate();
    const location = useLocation();  // Get the location object
    const { summary_text: summaryText, session_id: sessionId, is_resume: isResume } = location.state || {};
    // State for the metadata fields
    const [contact, setContact] = useState('');
    const [documentTitle, setDocumentTitle] = useState('');
    const [sourceLink, setSourceLink] = useState('');
    const [validator, setValidator] = useState<HCDropDownValue>();
    const [severity, setSeverity] = useState<HCDropDownValue>();
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [responsibleId, setResponsibleId] = useState<string | null>(null); // Store the responsible ID for matching

    const authContext = useAuthContext();
    const [validatorOptions, setValidatorOptions] = useState<HCDropDownValue[]>([]);
    const [loading, setLoading] = useState(false);

    const severityOptions = [
        {id: '0', value: 'Public'},
        {id: '1', value: 'Low'},
        {id: '2', value: 'Medium'},
        {id: '3', value: 'High'},
        {id: '4', value: 'Critical'},
    ];

    console.log('summaryText:', summaryText);

    useEffect(() => {
        const fetchExistingDoc = async () => {
            if (!authContext || !authContext.user?.user?.id) { // Check authContext and user ID
                showError({message: 'User not logged in or user ID not available.'});
                return;
            }
            // If not resuming, skip
            if (!isResume || !sessionId) {
                return;
            }

            try {
                setLoading(true); // Moved setLoading true here
                // Use Api instance
                const response = await Api.post(
                    '/api/v1/collector/fetch_existing_doc',
                    { session_id: sessionId }
                    // Headers are managed by Api instance
                );
                const docRow = response.data.document;

                // Debug logging
                console.log('Full API Response:', response.data);
                console.log('Document Data:', docRow);
                console.log('Document Title:', docRow.title);
                console.log('Document Type:', typeof docRow.title);
                console.log('Responsible ID:', docRow.responsible);
                console.log('Responsible Type:', typeof docRow.responsible);

                // Example fields: "tags", "employee_contact", "link", "title", "responsible", "severity_levels"
                if (docRow.tags) {
                    // Might be stored as a JSON string or array
                    const existingTags = Array.isArray(docRow.tags)
                        ? docRow.tags
                        : JSON.parse(docRow.tags);
                    setTags(existingTags);
                }

                if (docRow.employee_contact) setContact(docRow.employee_contact);
                if (docRow.link) setSourceLink(docRow.link);

                // Enhanced handling of document title
                if (docRow.title !== undefined) {
                    console.log('Setting document title to:', docRow.title);
                    setDocumentTitle(docRow.title || ''); // Handle null values
                } else {
                    // Try alternative field names that might contain the title
                    console.log('Title field missing, checking alternatives');
                    const possibleTitleFields = ['name', 'document_title', 'doc_title'];
                    for (const field of possibleTitleFields) {
                        if (docRow[field] !== undefined) {
                            console.log(`Found title in alternative field: ${field}`);
                            setDocumentTitle(docRow[field] || '');
                            break;
                        }
                    }
                }

                // Store the responsible ID for matching with validator options later
                if (docRow.responsible) {
                    setResponsibleId(docRow.responsible);
                }

                // Find matching severity option
                if (docRow.severity_levels) {
                    const severityOption = severityOptions.find(option => option.value === docRow.severity_levels);
                    if (severityOption) {
                        setSeverity(severityOption);
                    }
                }

                success({ message: 'Existing document found.' });
                // If there's anything else, map it accordingly
            } catch (err: unknown) {
                console.error('Error fetching existing doc data:', err);
                if (!(err instanceof AxiosError && err.response?.status === 401)) {
                    showError({message: err instanceof Error ? err.message : String(err)});
                }
            } finally {
                setLoading(false); // Ensure loading is false
            }
        };

        if (isResume && sessionId && authContext && authContext.user?.user?.id) { // Added authContext check here
            fetchExistingDoc();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isResume, sessionId, authContext]); // Added authContext to dependencies

    useEffect(() => {
        // If we have both validator options and a responsible ID, try to match them
        if (validatorOptions.length > 0 && responsibleId) {
            console.log('Trying to match responsible ID:', responsibleId);
            console.log('Available validator options:', validatorOptions);

            // Try to match both as string and as potential UUID
            const matchedOption = validatorOptions.find(option =>
                option.id === responsibleId ||
                option.id === responsibleId.toString() ||
                option.id.toString() === responsibleId
            );

            if (matchedOption) {
                console.log('Found matching validator option:', matchedOption);
                setValidator(matchedOption);
            } else {
                console.error('Could not find matching validator option for ID:', responsibleId);
            }
        }
    }, [validatorOptions, responsibleId]);

    // Handlers for dropdown changes. Assume the onChange returns the selected option.
    const handleValidatorChange = (selectedOption: HCDropDownValue) => {
        setValidator(selectedOption);
    };

    const handleSeverityChange = (selectedOption: HCDropDownValue) => {
        setSeverity(selectedOption);
    };

    // Handler to "generate" default tags
    const handleGenerateTags = async () => {
        if (!authContext || !authContext.user?.user?.id) { // Check authContext and user ID
            showError({message: 'User not logged in or user ID not available.'});
            return;
        }

        try {
            setLoading(true);
            console.log('text:', summaryText);
            // Use Api instance
            const response = await Api.post(
                '/api/v1/collector/generate_tags',
                {text: summaryText}
                // Headers are managed by Api instance
            );

            if (!response.data || !response.data.tags) {
                throw new Error('Error generating text.');
            }
            const generatedTags = response.data.tags;
            setTags(generatedTags);
        } catch (err: unknown) {
            if (!(err instanceof AxiosError && err.response?.status === 401)) {
                showError({message: err instanceof Error ? err.message : String(err)});
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchValidators = async () => {
            if (!authContext || !authContext.user?.user?.id || !authContext.isLoggedIn) {
                if(!authContext?.isLoadingUser) {
                    showError({message: 'User not logged in, cannot fetch validators.'});
                }
                return;
            }

            try {
                setLoading(true);
                const response = await Api.get<{validators: ValidatorProfile[]}>(
                    '/api/v1/collector/get_validators'
                );

                if (!response.data) {
                    showError({message: 'Failed to fetch validators'}); 
                    setLoading(false);
                    return;
                }
                const data = response.data;
                if (data && data.validators) {
                    const formattedOptions = data.validators.map((profile: ValidatorProfile) => ({
                        id: profile.id,
                        value: profile.full_name,
                    }));
                    console.log('Formatted validator options:', formattedOptions);
                    setValidatorOptions(formattedOptions);
                } else {
                    setValidatorOptions([]); // Clear options if data is not as expected
                }
            } catch (err: unknown) {
                console.error('Error fetching validators:', err);
                if (!(err instanceof AxiosError && err.response?.status === 401)) {
                    showError({message: err instanceof Error ? err.message : String(err)});
                }
            } finally {
                setLoading(false);
            }
        };
        if(authContext && !authContext.isLoadingUser) {
            fetchValidators();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authContext]);

    // Handler to add a new tag
    const handleAddTag = () => {
        if (newTag.trim() !== '') {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    // Handler to remove an existing tag
    const handleRemoveTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    // Handler for form submission (e.g., when the user clicks Continue)
    const handleSubmit = async () => {
        if (!authContext || !authContext.user?.user?.id) { // Check authContext and user ID
            showError({message: 'User not logged in or user ID not available.'});
            return;
        }

        const metadata = {
            contact,
            documentTitle,
            sourceLink,
            validator,
            severity,
            tags,
        };
        console.log('Metadata submitted:', metadata);
        setLoading(true);
        try {
            // Use Api instance
            const response = await Api.post(
                '/api/v1/collector/update_session_and_document',
                {
                    session_id: sessionId,
                    tags: tags,
                    contact: contact,
                    source_link: sourceLink,
                    document_title: documentTitle,
                    validator_id: validator?.id,
                    severity: severity?.value,
                    user_id: authContext.user.user.id // Use checked user ID
                }
                // Headers are managed by Api instance
            );

            console.log(response.data?.message);
            success({message: response.data?.message || 'Metadata updated successfully'}); // show success message
            navigate('/applications/collector/CollectorInitQuestionsPage');
        } catch (error) {
            if (!(error instanceof AxiosError && error.response?.status === 401)) {
                if (error instanceof AxiosError && error.response?.data && typeof error.response.data === 'object' && 'detail' in error.response.data) {
                    showError({message: (error.response.data as {detail?: string}).detail || 'Failed to update session and document'});
                } else {
                    showError({message: 'An unexpected error occurred'});
                }
            }
            console.error('Error submitting metadata:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <CollectorPageLayout headline1="Add the Metadata" showContinueButton={false}>
            <FormContainer>
                {loading && (
                    <LoaderContainer>
                        <HCLoader />
                    </LoaderContainer>
                )}
                {/* Designated Contact */}
                <InputField
                    label="Designated Contact"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    inputProps={{
                        placeholder: 'Enter designated contact'
                    }}
                    type={'text'}
                />

                {/* Document Title */}
                <InputField
                    label="Document Title"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    type={'text'}
                    required
                />

                {/* Source/Reference Link */}
                <InputField
                    label="Source/Reference Link"
                    value={sourceLink}
                    onChange={(e) => setSourceLink(e.target.value)}
                    inputProps={{
                        placeholder: 'Enter source/reference link'
                    }}
                    type={'text'}
                />

                {/* Validator Dropdown using the provided HCDropDown */}
                <HCDropDown
                    inputProps={{placeholder: 'Select'}}
                    label="Validator"
                    onChange={handleValidatorChange}
                    options={validatorOptions}
                    value={validator}
                />

                {/* Severity Level Dropdown using the provided HCDropDown */}
                <HCDropDown
                    inputProps={{placeholder: 'Select'}}
                    label="Severity Level"
                    onChange={handleSeverityChange}
                    options={severityOptions}
                    value={severity}
                />

                {/* Tags Container */}
                <TagsContainer>
                    <Label>Tags</Label>
                    <GenerateTagsRow>
                        <HCButton
                            sx={{mt: 2, background: '#e66334', ':hover': { background: '#FF8234' }}}
                            hcVariant="primary"
                            size="large"
                            text={'Generate Tags'}
                            onClick={handleGenerateTags}
                        />
                    </GenerateTagsRow>
                    <TagInputContainer>
                        <HCTextField
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            action={{
                                hcVariant: 'secondary',
                                onClick: handleAddTag,
                                startIcon: <HCIcon icon="FillSignPlus" color="#e66334" />
                            }}
                            type={'text'}
                        />

                    </TagInputContainer>
                    <TagList>
                        {tags.map((tag, index) => (
                            <TagItem key={index}>
                                <span>{tag}</span>
                                <RemoveButton
                                    onClick={() => handleRemoveTag(index)}
                                >
                                    ✖
                                </RemoveButton>
                            </TagItem>
                        ))}
                    </TagList>
                </TagsContainer>

                {/* Submit / Continue Button fixed at the bottom */}
                <SubmitButtonContainer>
                    <HCButton
                        sx={{mt: 2, background: '#e66334', ':hover': { background: '#FF8234' }}}
                        hcVariant="primary"
                        size="large"
                        text="Store the document"
                        onClick={handleSubmit}
                    />
                </SubmitButtonContainer>
            </FormContainer>
        </CollectorPageLayout>
    );
};

export default CollectorMetaDataPage;
