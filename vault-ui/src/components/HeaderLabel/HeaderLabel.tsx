import React from 'react';
import {HCHeaderLabelProps, HCHeaderLabel} from 'generic-components';
export interface HeaderLabelProps extends HCHeaderLabelProps{

}
export function HeaderLabel(props: HeaderLabelProps) {
    return (
        <HCHeaderLabel {...props} infoIcon={true} />
    );
}