import * as React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {HCFormControl, HCFormControlBaseProps} from '../HCFormCommon';
import {Box, Dialog, DialogContent, DialogTitle} from '@mui/material';
import {HCIcon} from '../HCIcon';
import {HCButton} from '../HCButton';
export interface HCCodeEditorProps extends HCFormControlBaseProps {
    value?: string;
    onChange?(value?: string): void
}

export const HCCodeEditor = ({ size = 'medium', formControlSx, id, value, onChange, errorText, helperText, required, label, labelPlacement, vertical, textColor, disabled}: HCCodeEditorProps) => {
    const idFor = id;
    const [openModal, setOpenModal] = React.useState(false);
    const [code, setCode] = React.useState(value);

    const renderEditor = React.useCallback(() => (
        <Box sx={{
            position: 'relative',
            ...openModal ? {
                height: '70vh'
            } : {
                minHeight: '50px',
            }
        }}>
            <CodeMirror {...openModal ? {
                height: '70vh'
            } : {
                minHeight: '50px',
            }} lang={'css'} value={code} onChange={(val) => {
                setCode(val);
            }} />
            {!openModal && (
                <HCIcon icon={openModal ? 'Minimize1' : 'Maximize1'} style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 22,
                    height: 22,
                    margin: 4,
                }} onClick={() => {
                    setOpenModal(!openModal);
                }} />
            )}
        </Box>
    ), [code, openModal]);

    React.useEffect(() => {
        onChange && onChange(code);
    }, [code]);

    React.useEffect(() => {
        if (value !== code) {
            setCode(value);
        }
    }, [value]);
    return (
        <>
            <HCFormControl disabled={disabled} textColor={textColor} vertical={vertical} formControlSx={formControlSx} {...vertical ? { labelPlacement } : {}} size={size} required={required} errorText={errorText} label={label} id={idFor} helperText={helperText} input={
                <>{renderEditor()}</>
            }/>
            <Dialog
                open={openModal}
                sx={{'& .MuiDialog-paper': {width: '90%', height: 'min-content'}}}
                maxWidth="xl"
            >
                <DialogTitle>Expression Editor</DialogTitle>
                <DialogContent sx={{overflow: 'hidden', pt: 2,}}>
                    {renderEditor()}
                </DialogContent>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr min-content min-content',
                    gridGap: '16px',
                    p: 2,
                }}>
                    <Box />
                    <HCButton onClick={() => {
                        setOpenModal(false);
                    }} size={'small'} hcVariant={'tertiary'} text={'Cancel'} />
                    <HCButton onClick={() => {
                        setOpenModal(false);
                    }} size={'small'} hcVariant={'primary'} text={'Okay'} />
                </Box>
            </Dialog>
        </>
    );
};