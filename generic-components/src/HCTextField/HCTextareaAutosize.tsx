import * as React from 'react';
import { HCTextField, HCTextFieldProps } from './HCTextField';

export interface HCTextareaAutosizeProps extends Omit<HCTextFieldProps, 'onChange'> {
    minRows?: number;
    maxRows?: number;
    rows?: number;
    onTextChanged?(text?: string): void;
}

export const HCTextareaAutosize = React.memo(({maxRows, minRows, rows = undefined, value: initValue, onKeyDown, onTextChanged, ...textFieldProps}: HCTextareaAutosizeProps) => {
    const [value, setValue] = React.useState(initValue);

    React.useEffect(() => {
        setValue(initValue);
    }, [initValue]);

    React.useEffect(() => {
        onTextChanged && onTextChanged(value as string);
    }, [value]);

    return (
        <HCTextField {...textFieldProps} type='textArea' inputProps={{
            ...textFieldProps.inputProps,
            minRows,
            maxRows,
            rows,
        }} onChange={(event) => {
            setValue(event.currentTarget.value);
        }} value={value} onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && onKeyDown) {
                e.preventDefault();
                onKeyDown && onKeyDown(e);
            } else if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
                
                const {value} = e.currentTarget;
                const {start, end} = getCursorPos(e.currentTarget as HTMLTextAreaElement);
                
                // Replace characters in value using the start and end index
                const newValue  = value.substring(0, start)+ '\n' + value.substring(end);
                setValue(newValue);
            }
        }} />
    );
});

HCTextareaAutosize.displayName = 'HCTextareaAutosize';

function getCursorPos(input: HTMLTextAreaElement) {
    return {
        start: input.selectionStart,
        end: input.selectionEnd
    };
}