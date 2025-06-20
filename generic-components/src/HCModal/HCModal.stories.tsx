import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {HCModal, HCModalProps} from './HCModal';
import {HCIcon} from '../HCIcon';
import {Box, Typography} from '@mui/material';
import {HCButton} from '../HCButton';
import {HCTextField} from '../HCTextField';
import {HCNotification} from '../HCNotification/HCNotification';
import {success} from '../HCNotification';
import {HCDatePicker} from '../HCDatePicker';
import {HCPasswordField} from '../HCPasswordField';

const meta: Meta<HCModalProps> = {
    title: 'Components/HCModal',
    component: HCModal,
} satisfies Meta<typeof HCModal>;

export default meta;

type Story = StoryObj<typeof HCModal>;

export const BasicModal: Story = {
    args: {
        open: true,
        options: {
            title: 'DELETE USER',
            type: 'confirm',
            renderContent: () => <p style={{
                textAlign: 'center',
            }}>ARE YOU SURE YOU WANT TO PERMANENTLY DELETE THIS USER?<br/> THIS ACTION CAN NOT BE UNDONE?</p>,
            onCancel() {
            },
            onConfirm() {
            },
            icon: (
                <HCIcon icon={'Trash'} />
            )
        },
    },
    render(args) {
        const [open, setOpen] = React.useState(false);
        return (
            <Box>
                <HCButton hcVariant={'primary'} text={'Open Modal'} onClick={() => setOpen(true)} />
                {open && (
                    <HCModal {...args} options={{
                        ...args.options,
                        type: 'confirm',
                        title: args.options.title,
                        renderContent: args.options.renderContent,
                        onCancel() {
                            setOpen(false);
                        },
                        onConfirm() {
                            setOpen(false);
                        }
                    }} open={open} />
                )}
            </Box>
        );
    }
};

const renderCustomDelete = () => {
    const [password, setPassword] = React.useState('');

    return (
        <Box sx={{
            width: '100%',
        }}>
            <Typography sx={{
                textAlign: 'center',
                mb: 4
            }}>
                This endpoint is being used across
                <span style={{
                    color: '#f18920'
                }}> 3 apps</span>,<br/>
                Please enter your password to delete this multi-endpoint:
            </Typography>
            <HCPasswordField inputProps={{
                startAdornment: <HCIcon icon={'Lock'}/>,
            }} type={'text'} onChange={({target}) => setPassword(target.value)} value={password}/>
        </Box>
    );
};

export const DeleteEndpointModal: Story = {
    render(args) {
        const [open, setOpen] = React.useState(false);

        return (
            <Box>
                <HCButton hcVariant={'primary'} text={'Open Modal'} onClick={() => setOpen(true)} />
                {open && (
                    <HCModal {...args} options={{
                        type: 'confirm',
                        title: 'DELETE ENDPOINT',
                        icon: (
                            <HCIcon icon={'Trash'} />
                        ),
                        onCancel() {
                            setOpen(false);
                        },
                        onConfirm() {
                            setOpen(false);
                        },
                        renderContent: renderCustomDelete,
                    }} open={open} />
                )}
            </Box>
        );
    }
};

const renderCustomWithForm = () => {
    return (
        <Box sx={{
            width: '100%',
        }}>
            <HCNotification iconColor={'#313131'} hcVariant={'info'} message={'Make sure you copy the API key and store it in a secure location. \nThis key will not be shown again.'} standalone fullWidth />
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'calc(100% / 2 - 12px) calc(100% / 2 - 12px)',
                gridGap: '24px'
            }}>
                <HCTextField type={'text'} value={'appName'} label={'APP NAME'} inputProps={{
                    inputProps: {
                        disabled: true,
                    }
                }}/>
                <HCDatePicker disabled value={new Date()} label={'EXPIRY DATE'} />
            </Box>
            <HCTextField inputProps={{
                endAdornment: (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'end',
                    }} onClick={async () => {
                        success('API key copied to clipboard!');
                    }}>
                        <HCIcon icon={'Copy'} />
                    </Box>
                )
            }} type={'textArea'} value={'apiKey'} label={'API KEY'} />
        </Box>
    );
};

export const CopyApikeyDataModal: Story = {
    render(args) {
        const [open, setOpen] = React.useState(false);
        return (
            <Box>
                <HCButton hcVariant={'primary'} text={'Open Modal'} onClick={() => setOpen(true)} />
                {open && (
                    <HCModal {...args} options={{
                        type: 'custom',
                        title: 'API INTEGRATION KEY',
                        actionsAlignment: 'end',
                        renderContent: renderCustomWithForm,
                        actions: [
                            {
                                text: 'Save',
                                hcVariant: 'primary',
                                onClick() {
                                    setOpen(false);
                                }
                            }
                        ],
                    }} open={open} />
                )}
            </Box>
        );
    }
};