import * as React from 'react';
import {useState} from 'react';
import {HCTextField, HCTextFieldProps} from '../HCTextField';
import {HCIcon} from '../HCIcon';
import {MUITheme} from '../theme';
import {styled} from '@mui/system';
import {Box} from '@mui/material';
import {HCFormControl} from '../HCFormCommon';

export const HCPasswordField = React.memo((props: HCTextFieldProps) => {
    const [showPWD, setShowPWD] = useState(false);
    const onPWDVisibilityToggle = () => setShowPWD(!showPWD);
    return (
        <HCTextField {...props} inputProps={{
            ...props.inputProps,
            endAdornment: showPWD ? <HCIcon icon={'Eye'} onClick={onPWDVisibilityToggle} /> : <HCIcon icon={'EyeOff'} onClick={onPWDVisibilityToggle} />
        }} password={!showPWD} />
    );
});
HCPasswordField.displayName = 'HCPasswordField';

const HCPasswordFieldNoAutoFillContainer = styled(Box)`
    width: 100%;
    height: 40px;
    display: grid;
    grid-template-columns: auto 35px;
    grid-template-rows: 40px;
    background: #e8e8e8;
    
    & input {
        width: 100%;
        appearance: none;
        border: none;
        background: none;
        padding: 10px 5px 10px 12px;

        &:focus {
            outline: none;
        }
    }
    
    &:has(input:focus) {
        outline: 2px solid ${MUITheme.palette.primary.main};
    }
    
    &:has(input.error-input){
        outline: 2px solid ${MUITheme.error.hex};
    }

    &:has(input.error-input:focus){
        outline: 2px solid ${MUITheme.error.hex};
    }
`;

export const HCPasswordFieldNoAutoFill = React.memo((props: HCTextFieldProps) => {
    const [showPWD, setShowPWD] = useState(false);

    const { value, id, label, onChange, required, errorText } = props;

    const onPWDVisibilityToggle = () => setShowPWD(!showPWD);

    const className = errorText ? 'error-input' : '';

    return (
        <HCFormControl label={label} id={id} errorText={errorText} required={required} input={
            <HCPasswordFieldNoAutoFillContainer>
                <input placeholder={props.inputProps?.placeholder} autoCorrect={'none'} className={`${className} ${!showPWD ? 'disk-font' : ''}`} value={value as string} id={id} onChange={onChange} />
                <Box sx={{
                    display: 'flex',
                    placeItems: 'center',
                }}>
                    <HCIcon icon={showPWD ? 'Eye' : 'EyeOff'} onClick={onPWDVisibilityToggle} />
                </Box>
            </HCPasswordFieldNoAutoFillContainer>
        } />
    );
});
HCPasswordFieldNoAutoFill.displayName = 'HCPasswordFieldNoAutoFill';