import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom'; // Import useNavigate for programmatic navigation
import {error as showError, HCButton, HCLoader, HCTextareaAutosize, HCIcon} from 'generic-components';
import {useAuthContext} from '../../../hooks/useAuthContext';
// import type {LoginResponseDTO} from '../../../types/LoginResponseDTO'; // REMOVED
import Api from '../../../services/Instance'; // Import the new Api instance
import {Box, styled} from '@mui/material';
import assistantIcon from '../../../assets/assistant-icon.png';
import { formatColor, hexToRgba } from '../../../utils/colorUtils'; // Corrected import path
import { AxiosError } from 'axios'; // Add this at the top if not present

// A known good public image URL for testing default
// const defaultFallbackBotIcon = 'https://www.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png'; // REMOVED

// Theme settings interface and defaults
interface ChatThemeSettings {
    userChatBubbleColor: string;
    botChatBubbleColor: string;
    sendButtonAndBox: string;
    font: string;
    logo: string;
    botProfilePicture: string;
    userChatFontColor: string;
    botChatFontColor: string;
}
const defaultThemeSettings: ChatThemeSettings = {
    userChatBubbleColor: '#ececec',
    botChatBubbleColor: '#f0f0f0',
    sendButtonAndBox: '#ffffff',
    font: 'Arial, sans-serif',
    logo: '',
    botProfilePicture: '',
    userChatFontColor: '#000000',
    botChatFontColor: '#000000',
};

// Helper functions formatColor and hexToRgba are now imported from colorUtils.ts

const Container = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100vh',
    padding: '20px',
    backgroundColor: '#f5f5f5',
});

const LoaderContainer = styled(Container)({
    position: 'fixed', // Keep the loader fixed over the page
    top: 0,
    left: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Slightly dim background
    zIndex: 1000, // Ensure it stays above other elements
    justifyContent: 'center', // Center loader horizontally
    alignItems: 'center', // Center loader vertically
});
const ChatContainer = styled('div')({
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '20px',
});

const ChatTextField = styled(HCTextareaAutosize)({
    flex: 1,
});

// Define chat data message type
interface ChatDataMsg {
   role: string;
   content: string;
}

// Added interface for the fetch_chat_conversation response
interface FetchChatConversationResponse {
    chatMessagesId?: number;
    messages?: ChatDataMsg[];
    // Potentially other fields like session_id, user_id, etc.
}

// Define BotMessage and UserMessage with direct props
const UserMessage = styled('div')({
    alignSelf: 'flex-end',
    padding: '10px',
    borderRadius: '10px',
    maxWidth: '70%',
});

const BotMessage = styled('div')({
    alignSelf: 'flex-start',
    padding: '10px',
    borderRadius: '10px',
    maxWidth: '70%',
    display: 'flex',
    alignItems: 'center',
});

const BotIcon = styled('img')({
    width: '30px',
    height: '30px',
    marginRight: '10px',
    borderRadius: '50%',
});

const ButtonsContainer = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    gap: '50px',
    margin: 30,
});

const CollectorChatPage = () => {
    // State for the chat messages
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const location = useLocation();  // Get the location object
    const {question, sessionId, chat_msgId: chatMsgId, isResume} = location.state || {};  // Retrieved state keys

    const [messages, setMessages] = useState([
        {id: 1, text: question ? question : 'Welcome! How can I help you today?', sender: 'bot'},
    ]);
    // State for the new message input
    const [newMessage, setNewMessage] = useState('');
    const authContextHook = useAuthContext();

    // Handle undefined context before destructuring
    if (!authContextHook) {
        return <HCLoader />;
    }
    const {user} = authContextHook;

    // Theme settings state
    const [themeSettings, setThemeSettings] = useState<ChatThemeSettings>(defaultThemeSettings);

    // Load theme settings from API on mount
    useEffect(() => {
        async function loadThemeSettings() {
            try {
                if (!user?.user?.id) {
                    console.warn('[CollectorChatPage] User not logged in, cannot load theme settings');
                    return;
                }
                const userId = user.user.id;
                const response = await Api.post(
                    '/api/v1/companies/get_theme_settings',
                    { user_id: userId }
                );
                if (response.data?.status === 'success') {
                    const settings = response.data.theme_settings;
                    console.log('[CollectorChatPage] API theme settings received:', settings);
                    setThemeSettings({
                        userChatBubbleColor: formatColor(settings.userChatBubbleColor) || defaultThemeSettings.userChatBubbleColor,
                        botChatBubbleColor: formatColor(settings.botChatBubbleColor) || defaultThemeSettings.botChatBubbleColor,
                        sendButtonAndBox: formatColor(settings.sendButtonAndBox) || defaultThemeSettings.sendButtonAndBox,
                        font: settings.font ?? defaultThemeSettings.font,
                        logo: settings.logo ?? defaultThemeSettings.logo,
                        // Ensure that if settings.botProfilePicture is null/undefined, we use defaultThemeSettings.botProfilePicture
                        botProfilePicture: settings.botProfilePicture || defaultThemeSettings.botProfilePicture, 
                        userChatFontColor: formatColor(settings.userChatFontColor) || defaultThemeSettings.userChatFontColor,
                        botChatFontColor: formatColor(settings.botChatFontColor) || defaultThemeSettings.botChatFontColor,
                    });
                } else {
                    console.warn('[CollectorChatPage] Failed to get success status for theme settings:', response.data);
                }
            } catch (err) {
                console.error('[CollectorChatPage] Error loading theme settings:', err);
                if (!(err instanceof AxiosError && err.response?.status === 401)) {
                    showError({ message: 'Failed to load theme settings.' });
                }
            }
        }
        if (user?.user?.id) loadThemeSettings();
    }, [user]);

    useEffect(() => {
        (async () => {
            try {
                if (!authContextHook.user) {
                    showError('User not logged in');
                    return;
                }
                
                if (!sessionId) {
                    return;
                }

                if (!isResume) {
                    return;
                }

                const response = await Api.post(
                    '/api/v1/collector/fetch_chat_conversation',
                    { session_id: sessionId }
                );

                const rawData = response.data;
                const fetchedMessages = rawData.messages;

                if (!fetchedMessages) {
                    console.log('No stored messages found.');
                    return;
                }

                // Filter out system messages and map to the correct format
                interface ChatMessage {
                    role: string;
                    content: string;
                }

                const formattedMessages = fetchedMessages
                    .filter((m: ChatMessage) => m.role !== 'system')
                    .map((m: ChatMessage, index: number) => ({
                        id: Date.now() + index,
                        text: m.content,
                        sender: m.role === 'assistant' ? 'bot' : m.role
                    }));

                setMessages(formattedMessages);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err);
                if (!(err instanceof AxiosError && err.response?.status === 401)) {
                    showError({ message });
                }
            }
        })();
    }, [isResume, sessionId, authContextHook.user]);

    const generateFollowUpQuestions = async (userAnswer: string) => {
        try {
            if (!authContextHook.user) {
                showError({message: 'User not logged in'});
                return;
            }

            const response = await Api.post(
                '/api/v1/collector/generate_question_response',
                {
                    chat_prompt_id: chatMsgId,
                    user_text: userAnswer
                }
            );
            if (!response.data || !response.data.follow_up_question) {
                showError({message: 'Invalid response from the server.'});
                return;
            }

            const followUpQuestion = response.data.follow_up_question;
            setMessages((prevMessages) => [
                ...prevMessages,
                {id: Date.now() + 1, text: followUpQuestion, sender: 'bot'},
            ]);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            if (!(error instanceof AxiosError && error.response?.status === 401)) {
                showError({ message });
            }
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
                await generateFollowUpQuestions(message.text);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            if (!(error instanceof AxiosError && error.response?.status === 401)) {
                showError({ message });
            }
        } finally {
            setLoading(false);
        }
    };
    const handleContinue = async () => {
        try {
            setLoading(true);
            if (!authContextHook.user) {
                showError({message: 'User not logged in'});
                setLoading(false);
                return;
            }

            const response = await Api.post(
                '/api/v1/collector/generate_summary',
                {chat_prompt_id: chatMsgId}
            );

            if (!response.data || !response.data.chat_summary) {
                showError({message: 'Error generating text.'});
                setLoading(false);
                return;
            }

            const generatedSummary = response.data.chat_summary;
            navigate('/applications/collector/CollectorSummaryPage', {state: {generatedSummary, sessionId, isResume}});
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            if (!(error instanceof AxiosError && error.response?.status === 401)) {
                showError({ message });
            }
        } finally {
            setLoading(false);
        }
    };

    // Add a log inside the map function to see what src is being used
    console.log('[CollectorChatPage] Rendering messages. Current themeSettings.botProfilePicture:', themeSettings.botProfilePicture);

    return (
        <Container>
            {/* Loader overlay */}
            {loading && (
                <LoaderContainer>
                    <HCLoader/>
                </LoaderContainer>
            )}

            <ChatContainer>
                {messages.map((message) => {
                    const botIconSrc = themeSettings.botProfilePicture ? themeSettings.botProfilePicture : assistantIcon;
                    if (message.sender === 'bot') {
                        console.log('[CollectorChatPage] Rendering BotMessage. Using icon src:', botIconSrc);
                    }
                    return message.sender === 'bot' ? (
                        <BotMessage
                            key={message.id}
                            style={{
                                backgroundColor: themeSettings.botChatBubbleColor,
                                color: themeSettings.botChatFontColor,
                                fontFamily: themeSettings.font,
                            }}
                        >
                            <BotIcon src={botIconSrc} alt="AI"/>
                            <span>{message.text}</span>
                        </BotMessage>
                    ) : (
                        <UserMessage
                            key={message.id}
                            style={{
                                backgroundColor: themeSettings.userChatBubbleColor,
                                color: themeSettings.userChatFontColor,
                                fontFamily: themeSettings.font,
                            }}
                        >
                            {message.text}
                        </UserMessage>
                    );
                })}
            </ChatContainer>

            <ChatTextField
                value={newMessage}
                inputPadding="0 16px 0 0 !important"
                inputProps={{
                    endAdornment: <Box sx={{
                        // Primarily for positioning and click handling
                        bottom: 0, 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px 14px', 
                        position: 'absolute', 
                        right: 0, 
                        cursor: 'pointer' 
                    }}
                    onClick={handleSendMessage}
                    >
                        <Box sx={{ // Wrapper for icon styling
                            display: 'flex', 
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'filter 0.2s ease-in-out',
                            ...(newMessage.trim() !== '' && {
                                filter: `drop-shadow(0px 1px 3px ${hexToRgba(themeSettings.sendButtonAndBox, 1)})`,
                            })
                        }}>
                            <HCIcon 
                                icon="Send" 
                                color={formatColor(themeSettings.sendButtonAndBox) || undefined} 
                            />
                        </Box>
                    </Box>,
                    placeholder: 'Type your message here...',
                    style: {
                        fontFamily: themeSettings.font,
                        color: themeSettings.userChatFontColor,
                    }
                }}
                type="textArea"
                onKeyDown={e => {
                    if (e.key.toLowerCase() === 'enter') handleSendMessage();
                }}
                onTextChanged={(text) => {
                    setNewMessage(text || '');
                }}
            />
            {/* Continue Button */}
            <ButtonsContainer>
                <HCButton sx={{mt: 2, background: '#e66334', ':hover': {background: '#FF8234'}}} hcVariant="primary"
                    size="large" endIcon={<HCIcon icon={'ArrowRight1'}/>}
                    text={loading ? 'Summarizing...' : 'Finish Chat & Summarize'}
                    disabled={loading || messages.length <= 1} onClick={handleContinue}/>
            </ButtonsContainer>
        </Container>
    );
};
export default CollectorChatPage;

