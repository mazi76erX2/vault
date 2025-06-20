import * as React from 'react';
import {Box, Dialog, DialogContent, SxProps, Typography} from '@mui/material';
import {HCButton, HCButtonProps} from '../HCButton';

export type HCModalTypeOptions = {
    type: 'confirm',
    title: string;
    renderContent(): React.ReactNode;
    cancelText?: string;
    confirmText?: string;
    icon?: React.ReactNode;
    onCancel?(): void;
    onConfirm(): void;
    confirmOnly?: boolean;
} | {
    type: 'custom',
    title: string;
    renderContent(): React.ReactNode;
    actions?: HCButtonProps[];
    actionsAlignment?: 'start' | 'center' | 'end';
    maxWidth?: string;
    maxHeight?: string;
    borderRadius?: string;
    width?: string;
    height?: string;
    margin?: string;
    padding?: string;
} | {
    type: 'base',
    title: string;
    renderContent(): React.ReactNode;
    icon?: React.ReactNode;
}

export interface HCModalProps {
    open?: boolean;
    options: HCModalTypeOptions
}

export const HCModal = React.memo((props: HCModalProps) => {
    const {open, options} = props;

    // If you specify a style here, it will check if an option was provided for it, if not it will return the normal style value.
    const getCustomStyles = (defaults: { maxWidth?: string; maxHeight?: string; borderRadius?: string; width?: string; height?: string, padding?: string, margin? : string }) => {
        if (props.options.type !== 'custom') {
            return defaults;
        }

        const useOptionOrDefault = (optionValue?: string, defaultValue?: string) => {
            return defaultValue !== undefined && optionValue !== undefined ? optionValue : defaultValue;
        };

        return {
            maxWidth:       useOptionOrDefault(props.options.maxWidth, defaults.maxWidth),
            maxHeight:      useOptionOrDefault(props.options.maxHeight, defaults.maxHeight),
            borderRadius:   useOptionOrDefault(props.options.borderRadius, defaults.borderRadius),
            width:          useOptionOrDefault(props.options.width, defaults.width ?? 'auto'),
            height:         useOptionOrDefault(props.options.height, defaults.height ?? 'auto'),
            padding:        useOptionOrDefault(props.options.padding, defaults.padding),
            margin:         useOptionOrDefault(props.options.margin, defaults.margin)
        };
    };

    const titleStyle: SxProps = {
        fontSize: '20px',
        fontWeight: '500',
        fontStretch: 'normal',
        fontStyle: 'normal',
        lineHeight: 'normal',
        letterSpacing: 'normal',
        mb: '24px',
        textTransform: 'uppercase',
    };

    const messageStyle: SxProps = {
        fontSize: '16px',
        fontWeight: 'normal',
        fontStretch: 'normal',
        fontStyle: 'normal',
        lineHeight: 'normal',
        letterSpacing: 'normal',
        mb: '24px',
        ...getCustomStyles({height: 'auto', })
    };

    const className = 'hc-modal';

    const renderConfirm = () => {
        if (options.type !== 'confirm') return null;
        const {confirmText, cancelText, title, renderContent, icon, onCancel, onConfirm, confirmOnly} = options;
        return (
            <Dialog
                open={!!open}
                PaperProps={{ sx: { borderRadius: '15px' } }}
            >
                <DialogContent sx={{
                    p: '32px',
                    maxWidth: '650px',
                    borderRadius: '15px !important',
                }} className={className}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: '201px'
                    }}>
                        {icon && (
                            <Box sx={{
                                width: '63.1px',
                                height: '63.1px',
                                borderRadius: '50%',
                                background: '#313131',
                                mb: '24px',
                                p: '12px',
                                color: '#fff'
                            }}>
                                {icon}
                            </Box>
                        )}
                        <Typography sx={{
                            ...titleStyle,
                            textAlign: 'center',
                        }}>{title}</Typography>
                        <Box sx={{
                            ...messageStyle,
                        }}>{renderContent()}</Box>
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                    }}>
                        {!confirmOnly && (
                            <HCButton sx={{
                                mr: 2
                            }} size={'small'} onClick={onCancel} text={cancelText ?? 'CANCEL'}   hcVariant={'secondary'}/>
                        )}
                        <HCButton onClick={onConfirm} size={'small'} text={confirmText ?? 'CONFIRM'} hcVariant={'primary'}  />
                    </Box>
                </DialogContent>
            </Dialog>
        );
    };

    const renderCustom = () => {
        if (options.type !== 'custom') return null;
        const {actionsAlignment = 'end', actions, title, renderContent} = options;
        return (
            <Dialog 
                open={!!open}
                PaperProps={{ sx: { ...getCustomStyles({
                    borderRadius: '15px',
                    margin: '32px',
                    maxWidth: '600px',
                    width: 'auto',
                    maxHeight: 'calc(100% - 64px)',
                    height: 'auto'
                }) } }}
            >
                <DialogContent className={className} sx={{
                    ...getCustomStyles(
                        {
                            maxWidth: '650px',
                            maxHeight: 'none',
                            borderRadius: '15px',
                            padding: '32px'
                        }),
                }}>
                    <Box sx={{
                        minWidth: '201px',
                        ...getCustomStyles({
                            height: 'auto'
                        })
                    }}>
                        { title.length > 0 && <Typography sx={titleStyle}>{title}</Typography>}
                        <Box sx={messageStyle}>{renderContent()}</Box>
                        {actions && (
                            <Box sx={{
                                display: 'flex',
                                justifyContent: actionsAlignment,
                            }}>
                                {actions.map((action, index) => (
                                    <HCButton key={index} sx={{
                                        ml: 2
                                    }} size={'small'} {...action} />
                                ))}
                            </Box>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>
        );
    };

    const renderBase = () => {
        if (options.type !== 'base') return null;
        const {title, renderContent, icon} = options;
        return (
            <Dialog
                open={!!open}
                PaperProps={{ sx: { borderRadius: '15px' } }}
            >
                <DialogContent className={className} sx={{
                    p: '32px',
                    maxWidth: '650px',
                    borderRadius: '15px !important',
                }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: '201px'
                    }}>
                        {icon && (
                            <Box sx={{
                                width: '63.1px',
                                height: '63.1px',
                                borderRadius: '50%',
                                background: '#313131',
                                mb: '24px',
                                p: '12px',
                                color: '#fff'
                            }}>
                                {icon}
                            </Box>
                        )}
                        <Typography sx={{
                            ...titleStyle,
                            textAlign: 'center',
                        }}>{title}</Typography>
                        <Box sx={messageStyle}>{renderContent()}</Box>
                    </Box>
                </DialogContent>
            </Dialog>
        );
    };

    return (
        <>{options.type === 'confirm' ? (
            <>{renderConfirm()}</>
        ) : options.type === 'base' ? (
            <>{renderBase()}</>
        ): (
            <>{renderCustom()}</>
        )}</>
    );
});

HCModal.displayName = 'HCModal';