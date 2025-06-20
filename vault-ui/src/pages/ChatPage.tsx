import React, { useState, useEffect, useRef } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Paper,
    List,
    ListItem,
    ListItemText,
    TextField,
    IconButton,
    Box,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { styled } from '@mui/system';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {VAULT_API_URL} from '../config';

// Define the shape of a chat message
interface ChatMessage {
    id: number;
    sender: string;
    content: string;
    timestamp: string;
}

// Styled components
const ChatContainer = styled(Container)(({ theme }) => ({
    marginTop: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    height: '80vh',
}));

const MessagesPaper = styled(Paper)(({ theme }) => ({
    flex: 1,
    padding: theme.spacing(2),
    overflowY: 'auto',
    marginBottom: theme.spacing(2),
}));

const InputBox = styled(Box)({
    display: 'flex',
    alignItems: 'center',
});

export const ChatPage: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    // const ws = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const location = useLocation();
    
    // Retrieve the selected question passed from the previous page
    const { selectedQuestion } = location.state || {};

    // Add the initial question to the message list upon rendering
    useEffect(() => {
        if (selectedQuestion) {
            const initialMessage: ChatMessage = {
                id: Date.now(),
                sender: 'Bot',
                content: selectedQuestion.question,
                timestamp: new Date().toLocaleTimeString(),
            };
            setMessages([initialMessage]);

            // Create a new session in the backend
            createNewSession(selectedQuestion.question);
        }
    }, [selectedQuestion]);

    // Function to create a new session in the backend
    const createNewSession = async (question: string) => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}'); // Example user retrieval
            const userId = currentUser?.user?.id; // Replace with your auth management logic

            const response = await axios.post(`${VAULT_API_URL}/api/sessions`, {
                user_id: userId,
                question,
            });

            if (response.data?.session_id) {
                // Initialize WebSocket with session ID
                initializeWebSocket();
            }
        } catch (error) {
            console.error('Failed to create session:', error);
        }
    };

    // Scroll to the bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize WebSocket connection
    const initializeWebSocket = () => {
        // ws.current = new WebSocket(`${VAULT_API_WEBSOCKET_URL}/ws/${session_id}`); // Attach session_id
        //
        // ws.current.onopen = () => {
        //     console.log('WebSocket connection established');
        // };
        //
        // ws.current.onmessage = (event) => {
        //     const data = event.data;
        //     const message: ChatMessage = {
        //         id: Date.now(),
        //         sender: 'Server',
        //         content: data,
        //         timestamp: new Date().toLocaleTimeString(),
        //     };
        //     setMessages((prevMessages) => [...prevMessages, message]);
        // };
        //
        // ws.current.onclose = () => {
        //     console.log('WebSocket connection closed');
        // };
        //
        // ws.current.onerror = (error) => {
        //     console.error('WebSocket error:', error);
        // };
    };

    // Cleanup WebSocket on unmount
    useEffect(() => {
        return () => {
            // ws.current?.close();
        };
    }, []);

    // Handle sending a message
    const sendMessage = () => {
        if (newMessage.trim() === '') return;
        const message: ChatMessage = {
            id: Date.now(),
            sender: 'You',
            content: newMessage,
            timestamp: new Date().toLocaleTimeString(),
        };
        // ws.current?.send(newMessage);
        setMessages((prevMessages) => [...prevMessages, message]);
        setNewMessage('');
    };

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div>
            {/* AppBar */}
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6">Chat Room</Typography>
                </Toolbar>
            </AppBar>

            {/* Chat Container */}
            <ChatContainer maxWidth="md">
                {/* Messages List */}
                <MessagesPaper elevation={3}>
                    <List>
                        {messages.map((msg) => (
                            <ListItem key={msg.id} alignItems="flex-start">
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="subtitle2"
                                            color={msg.sender === 'You' ? 'primary' : 'secondary'}
                                        >
                                            {msg.sender}
                                        </Typography>
                                    }
                                    secondary={<Typography variant="body2">{msg.content}</Typography>}
                                />
                                <Typography
                                    variant="caption"
                                    color="textSecondary"
                                    style={{ marginLeft: 'auto' }}
                                >
                                    {msg.timestamp}
                                </Typography>
                            </ListItem>
                        ))}
                        <div ref={messagesEndRef}></div>
                    </List>
                </MessagesPaper>

                {/* Input Box */}
                <InputBox>
                    <TextField
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        fullWidth
                        placeholder="Type a message..."
                    />
                    <IconButton color="primary" onClick={sendMessage}>
                        <SendIcon />
                    </IconButton>
                </InputBox>
            </ChatContainer>
        </div>
    );
};

export default ChatPage;
