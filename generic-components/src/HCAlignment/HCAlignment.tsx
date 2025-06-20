import * as React from 'react';
import { HCIcon } from '../HCIcon';
import {Tooltip} from '@mui/material';

export interface HCAlignmentOptions {
    id: 'left' | 'center' | 'right' | 'top' |  'bottom';
    disabled?: boolean;
    value: boolean;
    tooltipText?: string;
    tooltipPlacement?: 'top' | 'right' | 'bottom' | 'left';
}

export interface HCAlignmentProps {
    // Accept Vertical or Horizontal
    alignment: 'vertical' | 'horizontal' | 'position';
    selectedOption: 'left' | 'center' | 'right' | 'top' | 'bottom';
    options: HCAlignmentOptions[];
    onChange: (option: HCAlignmentOptions) => void;
    hasCenter? : boolean;
    disabled? : boolean;
    hasToolTip?: boolean;
}

export const HCAlignment = React.memo((props: HCAlignmentProps) => {
    const { selectedOption, onChange, hasToolTip } = props;

    // Helper function to handle option click
    const handleOptionClick = (option: HCAlignmentOptions) => {
        if (!option.disabled) {
            onChange(option);
        }
    };

    // Render the appropriate icon based on the option
    const renderIcon = (optionId: 'left' | 'center' | 'right' | 'top' |  'bottom') => {
        switch (optionId) {
        case 'left':
            return <HCIcon
                icon={props.alignment === 'position' ? 'PositionLeft' :'AlignLeft'}
                color="#292929" />;
        case 'center':
            return <HCIcon
                icon={props.alignment === 'position' ? 'PositionCenter' : (props.alignment === 'vertical' ? 'AlignCenterV' : 'AlignCenterH')}
                color="#292929"
            />;
        case 'right':
            return <HCIcon
                icon={ props.alignment === 'position' ? 'PositionRight' : 'AlignRight'}
                color="#292929"
            />;
        case 'top':
            return <HCIcon
                icon={props.alignment === 'position' ? 'PositionTop' : 'AlignTop'}
                color="#292929" />;
        case 'bottom':
            return <HCIcon
                icon={props.alignment === 'position' ? 'PositionBottom' : 'AlignBottom'}
                color="#292929" />;
        default:
            return null;
        }
    };

    return (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px'}}>
            {props.options.map(option =>
            {
                return !hasToolTip ? (
                    <button
                        key={option.id}
                        disabled={props.disabled}
                        onClick={() => handleOptionClick(option)}
                        style={{
                            backgroundColor: option.id === selectedOption ? '#ddd' : '#fff',
                            border: '1px solid #292929',
                            cursor: option.disabled ? 'not-allowed' : 'pointer',
                            opacity: option.disabled ? 0.5 : 1,
                            padding: 0,
                            height: '32px',
                            width: '32px',
                            borderRadius: '3px',
                        }}
                    >
                        {renderIcon(option.id)}
                    </button>

                ) : (<>
                    <Tooltip
                        arrow placement={option.tooltipPlacement}
                        title={option.tooltipText}
                    >
                        <button
                            key={option.id}
                            disabled={props.disabled}
                            onClick={() => handleOptionClick(option)}
                            style={{
                                backgroundColor: option.id === selectedOption ? '#ddd' : '#fff',
                                border: '1px solid #292929',
                                cursor: option.disabled ? 'not-allowed' : 'pointer',
                                opacity: option.disabled ? 0.5 : 1,
                                padding: 0,
                                height: '32px',
                                width: '32px',
                                borderRadius: '3px',
                            }}
                        >
                            {renderIcon(option.id)}
                        </button>
                    </Tooltip>

                </>);

            }
            )}
        </div>
    );
});

HCAlignment.displayName = 'HCAlignment';