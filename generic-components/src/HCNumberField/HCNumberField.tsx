import * as React from 'react';
import {HCTextField, HCTextFieldProps} from '../HCTextField';

export interface HCNumberFieldProps extends Omit<HCTextFieldProps, 'type'> {

}
export const HCNumberField = React.memo((props: HCNumberFieldProps) => {
    const { inputProps: hcInputProps, ...restProps } = props;

    return (
        <HCTextField {...restProps} inputProps={{
            ...hcInputProps,
            inputProps: {
                ...hcInputProps?.inputProps,
            }
        }} type='numberField' />
    );
});

HCNumberField.displayName = 'HCNumberField';