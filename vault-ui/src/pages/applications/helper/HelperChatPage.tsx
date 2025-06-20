import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    error as showError,
    HCContextFrameMD,
    HCIcon,
    HCLoader,
    HCMarkdownView,
    HCRadioButton,
    HCRadioButtonGroupType,
    HCRadioButtonOption,
    HCTextareaAutosize,
    success,
} from 'generic-components';
import { useAuthContext } from '../../../hooks/useAuthContext';
import axios from 'axios';
import { Box, styled } from '@mui/material';
import assistantIcon from '../../../assets/assistant-icon.png';
import { VAULT_API_URL } from '../../../config';
import { LoginResponseDTO } from '../../../types/LoginResponseDTO';

// Define the radio button options
const options: HCRadioButtonOption[] = [
    { id: 'chat', label: 'Chat Frame' },
    { id: 'context', label: 'Context Frame' },
];

// Default theme settings
const defaultThemeSettings = {
    userChatBubbleColor: '#007bff',
    botChatBubbleColor: '#e5e5ea',
    sendButtonAndBox: '#007bff',
    font: 'Arial',
    userChatFontColor: '#ffffff',
    botChatFontColor: '#000000',
    logo: '',
    botProfilePicture: ''
};

interface ThemeSettings {
    userChatBubbleColor: string;
    botChatBubbleColor: string;
    sendButtonAndBox: string;
    font: string;
    userChatFontColor: string;
    botChatFontColor: string;
    logo: string;
    botProfilePicture: string;
}

interface ThemeSettingsFromApi {
    userChatBubbleColor: string;
    botChatBubbleColor: string;
    sendButtonAndBox: string;
    font: string;
    userChatFontColor: string;
    botChatFontColor: string;
    logo: string | null;
    botProfilePicture: string | null;
}

// Styled components
const Container = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100vh',
    padding: '20px',
    backgroundColor: '#f5f5f5',
});

const RadioButtonContainer = styled('div')({
    position: 'absolute',
    top: '10px',
    right: '10px',
    display: 'flex',
    gap: '10px',
    padding: '10px',
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '5px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
});

const LoaderContainer = styled(Container)({
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
});

const ChatContainer = styled('div')({
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '20px',
});

// Dynamic styled components that use theme
const UserMessage = styled('div')<{ themeSettings: ThemeSettings }>(({ themeSettings }) => ({
    alignSelf: 'flex-end',
    backgroundColor: themeSettings.userChatBubbleColor,
    color: themeSettings.userChatFontColor,
    padding: '10px',
    borderRadius: '10px',
    maxWidth: '70%',
    overflowWrap: 'break-word',
    fontFamily: themeSettings.font,
}));

const BotMessage = styled('div')<{ themeSettings: ThemeSettings }>(({ themeSettings }) => ({
    alignSelf: 'flex-start',
    backgroundColor: themeSettings.botChatBubbleColor,
    color: themeSettings.botChatFontColor,
    padding: '10px',
    borderRadius: '10px',
    maxWidth: '70%',
    display: 'grid',
    gridTemplateColumns: 'min-content 1fr',
    gap: '8px',
    fontFamily: themeSettings.font,
}));

const BotIcon = styled('img')({
    width: '30px',
    height: '30px',
    marginRight: '10px',
    borderRadius: '50%',
    margin: '10px 8px'
});

// Dynamic send button styles
const SendButton = styled(Box)<{ themeSettings: ThemeSettings }>(({ themeSettings }) => ({
    bottom: 0,
    display: 'flex',
    padding: '16px 14px',
    position: 'absolute',
    right: 0,
    color: themeSettings.sendButtonAndBox,
    cursor: 'pointer',
    '&:hover': {
        opacity: 0.8,
    },
}));

const HelperChatPage: React.FC = () => {
    const location = useLocation();
    const { isResume, ChatId } = location.state || {};

    const authContext = useAuthContext();

    if (!authContext) {
        return <HCLoader />; 
    }

    const { user: authUser, isLoggedIn, isLoadingUser } = authContext;
    const user = authUser as LoginResponseDTO;

    const [loading, setLoading] = useState(false);
    const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings);
    const [botProfilePicSrc, setBotProfilePicSrc] = useState<string>(assistantIcon);

    // Store messages and input
    const [messages, setMessages] = useState([
        { id: 1, text: 'Welcome! How can I help you today?', sender: 'bot' },
    ]);
    const [newMessage, setNewMessage] = useState('');

    // Radio button state for switching between chat and context view
    const [selectedOption, setSelectedOption] = useState<HCRadioButtonOption>(options[0]);
    const [helperChatId, setHelperChatId] = useState<number | null>(null);

    // Dynamic markdown content state with an initial text
    const [markdownContent, setMarkdownContent] = useState<string>('# 🔍 Search Results\n');
    const hasFetchedRef = useRef(false);

    const fetchThemeSettings = async () => {
        if (!user?.token) {
            console.error('Cannot fetch theme settings, user or token missing.');
            return;
        }

        try {
            console.log('Fetching theme settings for helper chat...');
            const response = await axios.post<{ status: string, theme_settings: ThemeSettingsFromApi }>(
                `${VAULT_API_URL}/api/v1/companies/get_theme_settings`,
                { user_id: user.user.id },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data.status === 'success') {
                const settings = response.data.theme_settings;
                
                const appliedTheme: ThemeSettings = {
                    userChatBubbleColor: settings.userChatBubbleColor || defaultThemeSettings.userChatBubbleColor,
                    botChatBubbleColor: settings.botChatBubbleColor || defaultThemeSettings.botChatBubbleColor,
                    sendButtonAndBox: settings.sendButtonAndBox || defaultThemeSettings.sendButtonAndBox,
                    font: settings.font || defaultThemeSettings.font,
                    userChatFontColor: settings.userChatFontColor || defaultThemeSettings.userChatFontColor,
                    botChatFontColor: settings.botChatFontColor || defaultThemeSettings.botChatFontColor,
                    logo: settings.logo || defaultThemeSettings.logo,
                    botProfilePicture: settings.botProfilePicture || defaultThemeSettings.botProfilePicture
                };
                
                console.log('Applied theme settings in helper chat:', appliedTheme);
                setThemeSettings(appliedTheme);
                
                // Set bot profile picture
                if (settings.botProfilePicture) {
                    setBotProfilePicSrc(settings.botProfilePicture);
                } else {
                    setBotProfilePicSrc(assistantIcon);
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load theme settings';
            console.error('Error fetching theme settings:', error);
            showError({ message: errorMessage });
        }
    };

    // Fetch theme settings when the user is available
    useEffect(() => {
        if (!isLoadingUser && isLoggedIn && user) {
            fetchThemeSettings();
        }
    }, [isLoadingUser, isLoggedIn, user]);

    useEffect(() => {
        (async () => {
            try {
                if (!user) {
                    showError({ message: 'User not logged in' });
                    return;
                }

                if (hasFetchedRef.current) return;
                hasFetchedRef.current = true;

                if (!isResume) {
                    //TODO check user signed in and add authorisation bearer token etc.

                    // const {data: {session}} = await supabase.auth.getSession();
                    // const authToken = session?.access_token;
                    //
                    // if (!authToken) {
                    //     showError({message: 'No valid session'});
                    //     return;
                    // }

                    // Call FastAPI endpoint
                    const response = await axios.post(
                        `${VAULT_API_URL}/api/v1/helper/add_new_chat_session`,
                        {
                            user_id: user.user.id,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${user.token ?? ''}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );
                    // Validate response structure
                    if (!response.data || !response.data.helper_chat_id) {
                        showError({ message: 'Invalid response from the server.' });
                    }
                    if (response.data.helper_chat_id === 'None') {
                        showError({ message: 'Invalid response from the server.' });
                        return;
                    }

                    success({ message: 'Successfully created new chat session.' });
                    setHelperChatId(response.data.helper_chat_id);

                } else {

                    // If we *are* resuming, check if we have a chat_msgId

                    const finalChatId = ChatId;
                    setHelperChatId(finalChatId);


                    // Now fetch the conversation from chat_messages_collector
                    if (!finalChatId) return;

                    // Call FastAPI endpoint
                    const response = await axios.post(
                        `${VAULT_API_URL}/api/v1/helper/get_helper_chat_message`,
                        {
                            chat_id: finalChatId,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${user.token ?? ''}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );
                    // Validate response structure
                    if (!response.data || !response.data.message) {
                        showError({ message: 'Invalid response from the server.' });
                    }
                    const chatData = response.data.message[0];

                    if (!chatData) {
                        showError({ message: 'No stored messages found.' });
                        console.log('No stored messages found.');
                        return;
                    }
                    console.log('chatData', chatData);
                    // Map each chat pair to an array of messages.
                    const oldMessages = chatData.messages.flatMap((pair: [string, string], idx: number) => {
                        const userMessage = {
                            id: idx * 2 + 1,
                            text: pair[0],
                            sender: 'user' as const,
                        };
                        const botMessage = {
                            id: idx * 2 + 2,
                            text: pair[1],
                            sender: 'bot' as const,
                        };
                        return [userMessage, botMessage];
                    });


                    success({ message: 'Successfully fetched old conversation.' });
                    // Overwrite local messages with stored conversation
                    setMessages(oldMessages);
                }

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                console.error('Error fetching old conversation:', err);
                showError({ message: errorMessage });
            }
        })();
    }, [isLoadingUser, isLoggedIn, isResume, ChatId, user]);


    // Handle radio button change selections
    const handleFrameChange = (checked: boolean, item: HCRadioButtonOption) => {
        if (checked) {
            setSelectedOption(item);
        }
    };

    const generateAnswers = async (userAnswer: string) => {
        try {
            if (!user) {
                showError({ message: 'User not logged in' });
                return;
            }

            // Call FastAPI endpoint
            const response = await axios.post(
                `${VAULT_API_URL}/api/v1/helper/generate_answer_response`,
                {
                    // chat_prompt_id: chat_msgId,
                    user_text: userAnswer,
                    user_id: user.user.id,
                    chat_id: helperChatId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${user.token ?? ''}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            // Validate response structure
            if (!response.data || !response.data.helper_response) {
                showError({ message: 'Invalid response from the server.' });
            }
            // Validate response structure
            if (!response.data || !response.data.confidence) {
                showError({ message: 'Invalid response from the server.' });
            }
            if (!response.data || !response.data.md_text_formatted) {
                showError({ message: 'Invalid response from the server.' });
            }


            //here update the chatbot
            const helperResponse = response.data.helper_response;  // The follow-up question from backend
            // We're not using confidence, but keeping it in the response
            const mdTextFormatted = response.data.md_text_formatted;
            // The follow-up question from backend
            setMarkdownContent(mdTextFormatted);
            // Update the chatbot UI with the user's message and the follow-up question
            setMessages((prevMessages) => [
                ...prevMessages,
                { id: Date.now() + 1, text: helperResponse, sender: 'bot' },  // Bot's follow-up question
            ]);


        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            console.error('Error:', error);
            showError({ message: errorMessage });
        }
    };

    // Handler for sending a new message
    const handleSendMessage = async () => {
        try {
            if (newMessage.trim() !== '') {
                const message = {
                    id: Date.now(),
                    text: newMessage,
                    sender: 'user',
                };
                setLoading(true);

                setMessages([...messages, message]);
                setNewMessage('');
                // Send the user response to the backend
                await generateAnswers(message.text);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            console.error('Error:', error);
            showError({ message: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <RadioButtonContainer>
                <HCRadioButton
                    hcType={{
                        type: 'group',
                        options,
                        defaultValue: selectedOption,
                        name: 'frame-selection',
                        row: true,
                    } as HCRadioButtonGroupType}
                    hcVariant="primary"
                    onRadioSelect={handleFrameChange}
                />
            </RadioButtonContainer>

            {selectedOption.id === 'context' ? (
                <HCContextFrameMD content={markdownContent} components={{
                    hr() {
                        return null;
                    }
                }} />
            ) : (
                <ChatContainer>
                    {messages.map(message =>
                        message.sender === 'bot' ? (
                            <BotMessage key={message.id} themeSettings={themeSettings}>
                                <BotIcon src={botProfilePicSrc} alt="Assistant" />
                                <div>
                                    <HCMarkdownView content={message.text} />
                                </div>
                            </BotMessage>
                        ) : (
                            <UserMessage key={message.id} themeSettings={themeSettings}>{message.text}</UserMessage>
                        )
                    )}
                </ChatContainer>
            )}

            {selectedOption.id === 'chat' && (
                <HCTextareaAutosize
                    value={newMessage}
                    inputPadding="0 16px 0 0 !important"
                    inputProps={{
                        endAdornment: <SendButton 
                            themeSettings={themeSettings}
                            onClick={handleSendMessage}
                        >
                            <HCIcon icon="Send" />
                        </SendButton>,
                        placeholder: 'Type your message here...'
                    }}
                    type="textArea"
                    onKeyDown={e => {
                        if (e.key.toLowerCase() === 'enter') handleSendMessage();
                    }}
                    onTextChanged={(text) => {
                        setNewMessage(text || '');
                    }}
                />
            )}

            {loading && (
                <LoaderContainer>
                    <HCLoader />
                </LoaderContainer>
            )}
        </Container>
    );
};

export default HelperChatPage;
