import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCAccessDeniedModal, HCDeleteModal, HCModal} from '../../src/HCModal';
import {HCIcon} from '../../src/HCIcon';
import {Box, Typography} from '@mui/material';
import {HCPasswordField} from '../../src/HCPasswordField';
import {HCNotification} from '../../src/HCNotification/HCNotification';
import {HCTextField} from '../../src/HCTextField';
import {HCDatePicker} from '../../src/HCDatePicker';
import {success} from '../../src/HCNotification';

it('should test a default HCModal', () => {
    const result = render(
        <HCStyledProvider>
            <HCModal
                open={true}
                options={{
                    title: 'DELETE USER',
                    type: 'confirm',
                    renderContent: () => (
                        <p style={{
                            textAlign: 'center',
                        }}>ARE YOU SURE YOU WANT TO PERMANENTLY DELETE THIS USER?<br/> THIS ACTION CAN NOT BE UNDONE?
                        </p>
                    ),
                    onCancel() {
                    },
                    onConfirm() {
                    },
                    icon: (
                        <HCIcon icon={'Trash'} />
                    )
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCModal Base Type', () => {
    const result = render(
        <HCStyledProvider>
            <HCModal
                open={true}
                options={{
                    title: 'DELETE USER',
                    type: 'base',
                    renderContent: () => (
                        <p style={{
                            textAlign: 'center',
                        }}>ARE YOU SURE YOU WANT TO PERMANENTLY DELETE THIS USER?<br/> THIS ACTION CAN NOT BE UNDONE?
                        </p>
                    ),
                    icon: (
                        <HCIcon icon={'Trash'} />
                    )
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCModal Delete Endpoint', () => {
    const result = render(
        <HCStyledProvider>
            <HCModal
                open={true}
                options={{
                    title: 'DELETE ENDPOINT',
                    type: 'confirm',
                    renderContent: () => (
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
                            }} type={'text'} onChange={() => {}} value={''}/>
                        </Box>
                    ),
                    onCancel() {
                    },
                    onConfirm() {
                    },
                    icon: (
                        <HCIcon icon={'Trash'} />
                    )
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCModal Copy ApiKey Data', () => {
    const result = render(
        <HCStyledProvider>
            <HCModal
                open={true}
                options={{
                    title: 'API INTEGRATION KEY',
                    type: 'custom',
                    actionsAlignment: 'end',
                    renderContent: () => (
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
                                <HCDatePicker disabled value={'2024/11/22'} label={'EXPIRY DATE'} />
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
                    ),
                    actions: [
                        {
                            text: 'Save',
                            hcVariant: 'primary',
                            onClick() {

                            }
                        }
                    ]
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDeleteModal', () => {
    const result = render(
        <HCStyledProvider>
            <HCDeleteModal
                open={true}
                title={'Delete Modal'}
                message={'Are you sure you want to delete this?'}
                onCancel={() => {}}
                onDelete={() => {}}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCAccessDeniedModal', () => {
    const result = render(
        <HCStyledProvider>
            <HCAccessDeniedModal
                isOpen={true}
                onClose={() => {}}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
