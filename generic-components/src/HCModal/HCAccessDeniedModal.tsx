import * as React from 'react';
import {HCModal} from './HCModal';
import {Box} from '@mui/material';
import {HCIcon} from '../HCIcon';

export interface HCAccessDeniedModalProps {
    isOpen?: boolean;
    onClose?(): void;
}
export const HCAccessDeniedModal = (props: HCAccessDeniedModalProps) => {
    return (
        <HCModal open={props.isOpen} options={{
            title: 'Access Denied',
            type: 'confirm',
            confirmOnly: true,
            confirmText: 'GO BACK',
            renderContent(): React.ReactNode {
                return (
                    <Box sx={{
                        textAlign: 'center',
                        lineHeight: '24px',
                    }}>
                        <Box sx={{
                            mb: 3,
                        }}>
                            <HCIcon style={{
                                height: '100px'
                            }} icon="FillUnavailable" color="#292929" />
                        </Box>
                      Please note, your user does not have access to this function.
                        <br/>
                      Please contact your System Administrator for assistance.
                    </Box>
                );
            },
            onConfirm() {
                props.onClose && props.onClose();
            }
        }} />
    );
};