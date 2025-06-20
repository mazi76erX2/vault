/* eslint linebreak-style: 0 */
import React, { useState, useEffect } from 'react';
import { HCButton, HCColorPicker, HCDropDown, HCIcon, HCTextareaAutosize, HCImageCropper, HCLoader, error as showError, success } from 'generic-components';
import { styled, Box, Checkbox, FormControlLabel, Grid, Paper } from '@mui/material';
import assistantIcon from '../../assets/assistant-icon.png';
import Api from '../../services/Instance';
import { AxiosError } from 'axios';
import {
    addHashIfMissing,
    hexToRgba,
    getContrastColor,
    isColorReadable
} from '../../utils/colorUtils';
import { useAuthContext } from '../../hooks/useAuthContext';

const Container = styled('div')({
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
});

const Section = styled(Grid)({
    marginBottom: '20px',
});

const Label = styled('div')({
    fontSize: '14px',
    marginBottom: '8px',
});

const PreviewContainer = styled(Paper)({
    margin: '20px 0',
    padding: '20px',
    height: '400px',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #ccc',
});

const ChatContainer = styled('div')({
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '20px',
});

// Dynamic styled components with color contrast calculation
interface MessageProps {
  bgcolor: string;
  fontColor: string;
}

const UserMessage = styled('div', {
    shouldForwardProp: (prop) => prop !== 'bgcolor' && prop !== 'fontColor'
})<MessageProps>(({ bgcolor, fontColor }) => {
    // Only use the contrast color if the font color would be illegible
    const textColor = isColorReadable(bgcolor, fontColor) ? fontColor : getContrastColor(bgcolor);
    return {
        alignSelf: 'flex-end',
        backgroundColor: bgcolor,
        color: textColor,
        padding: '10px',
        borderRadius: '10px',
        maxWidth: '70%',
    };
});

const BotMessage = styled('div', {
    shouldForwardProp: (prop) => prop !== 'bgcolor' && prop !== 'fontColor'
})<MessageProps>(({ bgcolor, fontColor }) => {
    // Only use the contrast color if the font color would be illegible
    const textColor = isColorReadable(bgcolor, fontColor) ? fontColor : getContrastColor(bgcolor);
    return {
        alignSelf: 'flex-start',
        backgroundColor: bgcolor,
        color: textColor,
        padding: '10px',
        borderRadius: '10px',
        maxWidth: '70%',
        display: 'flex',
        alignItems: 'center',
    };
});

const BotIcon = styled('img')({
    width: '30px',
    height: '30px',
    marginRight: '10px',
    borderRadius: '50%',
});

const InputField = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
});

const BrowseButton = styled(HCButton)({
    height: '32px',
    minWidth: '80px',
});

const ButtonsContainer = styled('div')({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
});

interface FontOption {
    id: string;
    value: string;
}

// Interface to represent the theme settings format received from the API
// eslint-disable-next-line @typescript-eslint/naming-convention
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

const BusinessThemePage = () => {
    // Theme state
    const [loading, setLoading] = useState(false);
    const [userChatColor, setUserChatColor] = useState('#007bff');
    const [botChatColor, setBotChatColor] = useState('#e5e5ea');
    const [sendButtonColor, setSendButtonColor] = useState('#FF8234');

    // State for INTENDED font colors (what user picks/API loads initially)
    const [intendedUserChatFontColor, setIntendedUserChatFontColor] = useState('#000000');
    const [intendedBotChatFontColor, setIntendedBotChatFontColor] = useState('#000000');

    // State for EFFECTIVE font colors (contrast-adjusted, for display in picker and preview)
    const [effectiveUserChatFontColor, setEffectiveUserChatFontColor] = useState('#000000');
    const [effectiveBotChatFontColor, setEffectiveBotChatFontColor] = useState('#000000');

    // Other states (logo, bot profile pic, font, etc. remain the same)
    const [logoPreview, setLogoPreview] = useState<string>('');
    const [botProfilePicPreview, setBotProfilePicPreview] = useState<string>(assistantIcon);
    const [selectedFont, setSelectedFont] = useState<FontOption>({ id: 'tahoma', value: 'Tahoma' });
    const [sameAsLogo, setSameAsLogo] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [currentImageSrc, setCurrentImageSrc] = useState<string>('');
    const [isLogoUpload, setIsLogoUpload] = useState(false);

    const authContext = useAuthContext();
    const fontOptions: FontOption[] = [
        { id: 'arial', value: 'Arial' },
        { id: 'tahoma', value: 'Tahoma' },
        { id: 'times', value: 'Times New Roman' },
        { id: 'verdana', value: 'Verdana' },
        { id: 'roboto', value: 'Roboto' },
    ];
    const messages = [
        { id: 1, text: 'Hello! How can I help you today?', sender: 'bot' },
        { id: 2, text: 'I need information about your services.', sender: 'user' },
        { id: 3, text: 'I\'d be happy to help with that. What specific services are you interested in?', sender: 'bot' },
    ];
    const [previewMessage, setPreviewMessage] = useState('Some preview text');

    // Handle file uploads with cropping
    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>, isLogo: boolean): void => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const fileUrl = URL.createObjectURL(file);
            setCurrentImageSrc(fileUrl);
            setIsLogoUpload(isLogo);
            setShowCropper(true);
        }
    };

    // Handle logo upload
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
        handleFileSelection(e, true);
    };
  
    // Handle bot pic upload
    const handleBotPicUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
        handleFileSelection(e, false);
    };

    // Handle image crop completion
    const handleCropComplete = (croppedImageData: string): void => {
        if (isLogoUpload) {
            setLogoPreview(croppedImageData);
            
            // Convert base64 string to file object for upload
            const byteString = atob(croppedImageData.split(',')[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            
            const logoFileToSet = new File([ab], 'logo.png', { type: 'image/png' });
            
            // If "Same as Logo" is checked, also set bot profile pic
            if (sameAsLogo) {
                setBotProfilePicPreview(croppedImageData);
            }
        } else {
            setBotProfilePicPreview(croppedImageData);
            
            // Convert base64 string to file object for upload
            const byteString = atob(croppedImageData.split(',')[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            
            const botPicFileToSet = new File([ab], 'bot_profile_picture.png', { type: 'image/png' });
        }
        
        setShowCropper(false);
    };

    // Handle cropper close
    const handleCropperClose = (): void => {
        setShowCropper(false);
    };

    // Handle checkbox change
    const handleSameAsLogoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setSameAsLogo(e.target.checked);
        if (e.target.checked && logoPreview) {
            setBotProfilePicPreview(logoPreview);
        }
    };

    // Fetch current theme settings
    useEffect(() => {
        const fetchThemeSettings = async (): Promise<void> => {
            try {
                setLoading(true);
                if (!authContext?.user?.user?.id) {
                    showError('User not logged in or user ID not available.');
                    setLoading(false); return;
                }
                const userId = authContext.user.user.id;
                const response = await Api.post('/api/v1/companies/get_theme_settings', { user_id: userId });

                if (response.data && response.data.theme_settings) {
                    const settings = response.data.theme_settings as ThemeSettingsFromApi;
                    setUserChatColor(addHashIfMissing(settings.userChatBubbleColor));
                    setBotChatColor(addHashIfMissing(settings.botChatBubbleColor));
                    setSendButtonColor(addHashIfMissing(settings.sendButtonAndBox));
                    
                    // Set INTENDED font colors from API
                    setIntendedUserChatFontColor(addHashIfMissing(settings.userChatFontColor));
                    setIntendedBotChatFontColor(addHashIfMissing(settings.botChatFontColor));
                    
                    setSelectedFont(fontOptions.find(f => f.value === settings.font) || { id: 'tahoma', value: 'Tahoma' });
                    setLogoPreview(settings.logo || '');
                    setBotProfilePicPreview(settings.botProfilePicture || assistantIcon);
                    success({ message: 'Theme settings loaded.' });
                } else {
                    showError('Failed to load theme settings.');
                }
            } catch (err) {
                console.error('Error fetching theme settings:', err);
                if (!(err instanceof AxiosError && err.response?.status === 401)) {
                    showError({ message: 'Could not fetch theme settings.' });
                }
            } finally {
                setLoading(false);
            }
        };
        if (authContext?.user?.user?.id) fetchThemeSettings();
    }, [authContext?.user?.user?.id]); // Removed fontOptions from dependencies as it's stable

    // Effect to update EFFECTIVE user chat font color based on contrast
    useEffect(() => {
        const effectiveColor = isColorReadable(userChatColor, intendedUserChatFontColor)
            ? intendedUserChatFontColor
            : getContrastColor(userChatColor);
        setEffectiveUserChatFontColor(addHashIfMissing(effectiveColor));
    }, [userChatColor, intendedUserChatFontColor]);

    // Effect to update EFFECTIVE bot chat font color based on contrast
    useEffect(() => {
        const effectiveColor = isColorReadable(botChatColor, intendedBotChatFontColor)
            ? intendedBotChatFontColor
            : getContrastColor(botChatColor);
        setEffectiveBotChatFontColor(addHashIfMissing(effectiveColor));
    }, [botChatColor, intendedBotChatFontColor]);

    const handleSave = async (): Promise<void> => {
        try {
            setLoading(true);
            if (!authContext?.user?.user?.id) {
                showError('User not logged in or user ID not available.');
                setLoading(false); return;
            }
            const userId = authContext.user.user.id;
            
            // Only send base64 data for NEW uploads, not existing URLs
            const logoToSend = logoPreview && logoPreview.startsWith('data:image') ? logoPreview : null;
            const botPicToSend = (botProfilePicPreview && 
                                  botProfilePicPreview !== assistantIcon && 
                                  botProfilePicPreview.startsWith('data:image')) ? botProfilePicPreview : null;
            
            const themeSettingsPayload = {
                user_chat_bubble_colour: userChatColor,
                bot_chat_bubble_colour: botChatColor,
                send_button_and_box: sendButtonColor,
                font: selectedFont.value,
                // Save INTENDED font colors
                user_chat_font_colour: intendedUserChatFontColor,
                bot_chat_font_colour: intendedBotChatFontColor,
                logo: logoToSend,
                bot_profile_picture: botPicToSend,
            };
            
            // Debug logging to see what's being sent
            console.log('[BusinessThemePage] Saving theme settings with payload:', {
                ...themeSettingsPayload,
                logo: logoToSend ? `[base64 data: ${logoToSend.substring(0, 50)}...]` : 'null (no new upload)',
                bot_profile_picture: botPicToSend ? `[base64 data: ${botPicToSend.substring(0, 50)}...]` : 'null (no new upload)',
            });
            
            const response = await Api.post('/api/v1/companies/update_theme_settings', { user_id: userId, theme_settings: themeSettingsPayload });
            console.log('[BusinessThemePage] Save response:', response.data);
            success({ message: 'Theme settings saved successfully.' });
            
            // Refetch theme settings to get updated values from server
            setTimeout(async () => {
                try {
                    const refreshResponse = await Api.post('/api/v1/companies/get_theme_settings', { user_id: userId });
                    if (refreshResponse.data && refreshResponse.data.theme_settings) {
                        const settings = refreshResponse.data.theme_settings as ThemeSettingsFromApi;
                        setUserChatColor(addHashIfMissing(settings.userChatBubbleColor));
                        setBotChatColor(addHashIfMissing(settings.botChatBubbleColor));
                        setSendButtonColor(addHashIfMissing(settings.sendButtonAndBox));
                        setIntendedUserChatFontColor(addHashIfMissing(settings.userChatFontColor));
                        setIntendedBotChatFontColor(addHashIfMissing(settings.botChatFontColor));
                        setSelectedFont(fontOptions.find(f => f.value === settings.font) || { id: 'tahoma', value: 'Tahoma' });
                        setLogoPreview(settings.logo || '');
                        setBotProfilePicPreview(settings.botProfilePicture || assistantIcon);
                        console.log('[BusinessThemePage] Theme settings refreshed after save');
                    }
                } catch (err) {
                    console.error('Error refreshing theme settings after save:', err);
                }
            }, 1000);
        } catch (err) {
            console.error('Error saving theme settings:', err);
            if (!(err instanceof AxiosError && err.response?.status === 401)) {
                const message = err instanceof AxiosError && err.response?.data?.detail
                    ? err.response.data.detail
                    : 'Failed to save theme settings.';
                showError({ message });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            {/* Loading overlay */}
            {loading && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    zIndex: 1000,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <HCLoader />
                </div>
            )}
      
            {/* <h2>Business Theme Settings</h2> */}
            
            <Grid container spacing={3}>
                <Section item xs={12} md={3}>
                    <Label>User chat bubble colour</Label>
                    <HCColorPicker 
                        color={userChatColor}
                        onColorChanged={(color) => setUserChatColor(color.hex)}
                    />
                </Section>
        
                <Section item xs={12} md={3}>
                    <Label>Bot chat bubble colour</Label>
                    <HCColorPicker 
                        color={botChatColor}
                        onColorChanged={(color) => setBotChatColor(color.hex)}
                    />
                </Section>
        
                <Section item xs={12} md={3}>
                    <Label>Send button and box</Label>
                    <HCColorPicker 
                        color={sendButtonColor}
                        onColorChanged={(color) => setSendButtonColor(color.hex)}
                    />
                </Section>

                <Section item xs={12} md={3}>
                    <Label>Logo</Label>
                    <InputField>
                        <input 
                            type="text" 
                            value={logoPreview ? 'Image selected' : ''}
                            disabled 
                            style={{ flex: 1, height: '32px', padding: '0 8px' }}
                            aria-label="Logo filename"
                            placeholder="No file selected"
                        />
                        <input 
                            type="file" 
                            id="logo-upload" 
                            style={{ display: 'none' }} 
                            onChange={handleLogoUpload} 
                            accept="image/*"
                            aria-label="Upload logo"
                        />
                        <label htmlFor="logo-upload">
                            <BrowseButton 
                                text="Browse" 
                                hcVariant="secondary" 
                                component="span"
                            />
                        </label>
                    </InputField>
                    {logoPreview && (
                        <Box sx={{ marginTop: '10px', border: '1px solid #ccc', padding: '5px', display: 'inline-block' }}>
                            <img 
                                src={logoPreview} 
                                alt="Logo Preview" 
                                style={{ display: 'block', maxWidth: '200px', maxHeight: '100px' }} 
                            />
                        </Box>
                    )}
                </Section>

                <Section item xs={12} md={3}>
                    <Label>User chat font colour</Label>
                    <HCColorPicker 
                        color={effectiveUserChatFontColor}
                        onColorChanged={(color) => setIntendedUserChatFontColor(color.hex)}
                    />
                </Section>

                <Section item xs={12} md={3}>
                    <Label>Bot chat font colour</Label>
                    <HCColorPicker 
                        color={effectiveBotChatFontColor}
                        onColorChanged={(color) => setIntendedBotChatFontColor(color.hex)}
                    />
                </Section>

                <Section item xs={12} md={3}>
                    <Label>Font family</Label>
                    <HCDropDown
                        value={selectedFont}
                        options={fontOptions}
                        onChange={(font) => font && setSelectedFont(font)}
                    />
                </Section>
        
                <Section item xs={12} md={3}>
                    <Label>Bot profile picture</Label>
                    <InputField>
                        <input 
                            type="text" 
                            value={botProfilePicPreview !== assistantIcon ? 'Image selected' : ''}
                            disabled 
                            style={{ flex: 1, height: '32px', padding: '0 8px' }}
                            aria-label="Bot profile picture filename"
                            placeholder="No file selected"
                        />
                        <input 
                            type="file" 
                            id="bot-pic-upload" 
                            style={{ display: 'none' }} 
                            onChange={handleBotPicUpload} 
                            accept="image/*"
                            disabled={sameAsLogo}
                            aria-label="Upload bot profile picture"
                        />
                        <label htmlFor="bot-pic-upload">
                            <BrowseButton 
                                text="Browse" 
                                hcVariant="secondary" 
                                component="span" 
                                disabled={sameAsLogo}
                            />
                        </label>
                    </InputField>
                    <FormControlLabel
                        control={
                            <Checkbox 
                                checked={sameAsLogo}
                                onChange={handleSameAsLogoChange}
                            />
                        }
                        label="Same as Logo"
                    />
                    {botProfilePicPreview && botProfilePicPreview !== assistantIcon && (
                        <Box sx={{ marginTop: '10px', border: '1px solid #ccc', padding: '5px', display: 'inline-block' }}>
                            <img 
                                src={botProfilePicPreview} 
                                alt="Bot Profile Picture Preview" 
                                style={{ display: 'block', maxWidth: '200px', maxHeight: '100px' }} 
                            />
                        </Box>
                    )}
                </Section>
        

            </Grid>
      
            <Label>Preview</Label>
            <PreviewContainer>
                <ChatContainer>
                    {messages.map((message) => (
                        message.sender === 'bot' ? (
                            <BotMessage 
                                key={message.id} 
                                bgcolor={addHashIfMissing(botChatColor)} 
                                fontColor={addHashIfMissing(effectiveBotChatFontColor)}
                            >
                                <BotIcon src={botProfilePicPreview} alt="AI" />
                                <span style={{ fontFamily: selectedFont.value }}>{message.text}</span>
                            </BotMessage>
                        ) : (
                            <UserMessage 
                                key={message.id} 
                                bgcolor={addHashIfMissing(userChatColor)} 
                                fontColor={addHashIfMissing(effectiveUserChatFontColor)}
                            >
                                <span style={{ fontFamily: selectedFont.value }}>{message.text}</span>
                            </UserMessage>
                        )
                    ))}
                </ChatContainer>
        
                {/* Updated Chat Input Area - mirrors CollectorChatPage structure */}
                <HCTextareaAutosize
                    value={previewMessage} // Use dummy state for preview
                    onTextChanged={(text) => setPreviewMessage(text || '')} // Allow typing for preview effect
                    inputPadding="0 16px 0 0 !important"
                    inputProps={{
                        endAdornment: <Box sx={{
                            // Primarily for positioning and click handling
                            bottom: '8px', 
                            right: '10px', 
                            display: 'flex', 
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px', // Keep padding for clickable area
                            position: 'absolute',
                            cursor: 'pointer' 
                        }}
                        onClick={() => console.log('Preview send clicked')}
                        >
                            <Box sx={{ // Wrapper for icon styling
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'filter 0.2s ease-in-out',
                                ...(previewMessage.trim() !== '' && {
                                    filter: `drop-shadow(0px 2px 8px ${hexToRgba(sendButtonColor, 0.3)})`,
                                })
                            }}>
                                <HCIcon 
                                    icon="Send" 
                                    color={addHashIfMissing(sendButtonColor) || undefined} 
                                />
                            </Box>
                        </Box>,
                        placeholder: 'Type your message here...',
                        style: {
                            fontFamily: selectedFont.value,
                            color: addHashIfMissing(effectiveUserChatFontColor)
                        }
                    }}
                    type="textArea"
                />
            </PreviewContainer>
      
            <ButtonsContainer>
                <HCButton 
                    text="Cancel" 
                    hcVariant="secondary"
                />
                <HCButton 
                    text={loading ? 'Saving...' : 'Save'} 
                    hcVariant="primary"
                    sx={{ background: '#FF8234', ':hover': { background: '#e66334' } }}
                    onClick={handleSave}
                    disabled={loading}
                />
            </ButtonsContainer>

            {/* Image Cropper */}
            {showCropper && (
                <HCImageCropper
                    imgSrc={currentImageSrc}
                    onClose={handleCropperClose}
                    updateAvatar={handleCropComplete}
                />
            )}
        </Container>
    );
};

export default BusinessThemePage;
