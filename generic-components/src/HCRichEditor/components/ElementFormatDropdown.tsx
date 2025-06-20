import React from 'react';
import {
    ElementFormatType,
    FORMAT_ELEMENT_COMMAND,
    INDENT_CONTENT_COMMAND,
    LexicalEditor,
    OUTDENT_CONTENT_COMMAND
} from 'lexical';
import DropDown, {DropDownItem} from './DropDown';
import {Divider} from '@mui/material';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatIndentDecreaseIcon from '@mui/icons-material/FormatIndentDecrease';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';

export const ELEMENT_FORMAT_OPTIONS: {
    [key in Exclude<ElementFormatType, ''>]: {
        icon: string;
        iconRTL: string;
        name: string;
    };
} = {
    center: {
        icon: 'center-align',
        iconRTL: 'center-align',
        name: 'Center Align',
    },
    end: {
        icon: 'right-align',
        iconRTL: 'left-align',
        name: 'End Align',
    },
    justify: {
        icon: 'justify-align',
        iconRTL: 'justify-align',
        name: 'Justify Align',
    },
    left: {
        icon: 'left-align',
        iconRTL: 'left-align',
        name: 'Left Align',
    },
    right: {
        icon: 'right-align',
        iconRTL: 'right-align',
        name: 'Right Align',
    },
    start: {
        icon: 'left-align',
        iconRTL: 'right-align',
        name: 'Start Align',
    },
};

const alignIcon: {[key: string]: JSX.Element} = {
    'center-align': <FormatAlignCenterIcon />,
    'right-align': <FormatAlignRightIcon />,
    'justify-align': <FormatAlignJustifyIcon />,
    'left-align': <FormatAlignLeftIcon />,
};

export function ElementFormatDropdown({
    editor,
    value,
    isRTL,
    disabled = false,
}: {
    editor: LexicalEditor;
    value: ElementFormatType;
    isRTL: boolean;
    disabled: boolean;
}) {
    const formatOption = ELEMENT_FORMAT_OPTIONS[value || 'left'];

    return (
        <DropDown
            disabled={disabled}
            buttonLabel={formatOption.name}
            buttonIconClassName={`icon ${
                isRTL ? formatOption.iconRTL : formatOption.icon
            }`}
            icon={alignIcon[formatOption.icon]}
            buttonClassName="toolbar-item spaced alignment"
            buttonAriaLabel="Formatting options for text alignment">
            <DropDownItem
                onClick={() => {
                    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
                }}
                className="item">
                <FormatAlignLeftIcon />
                <span className="text">Left Align</span>
            </DropDownItem>
            <DropDownItem
                onClick={() => {
                    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
                }}
                className="item">
                <FormatAlignCenterIcon />
                <span className="text">Center Align</span>
            </DropDownItem>
            <DropDownItem
                onClick={() => {
                    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
                }}
                className="item">
                <FormatAlignRightIcon />
                <span className="text">Right Align</span>
            </DropDownItem>
            <DropDownItem
                onClick={() => {
                    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
                }}
                className="item">
                <FormatAlignJustifyIcon />
                <span className="text">Justify Align</span>
            </DropDownItem>
            <DropDownItem
                onClick={() => {
                    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'start');
                }}
                className="item">
                <FormatAlignLeftIcon />
                <span className="text">Start Align</span>
            </DropDownItem>
            <DropDownItem
                onClick={() => {
                    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'end');
                }}
                className="item">
                <FormatAlignRightIcon />
                <span className="text">End Align</span>
            </DropDownItem>
            <Divider />
            <DropDownItem
                onClick={() => {
                    editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
                }}
                className="item">
                <FormatIndentDecreaseIcon />
                <span className="text">Outdent</span>
            </DropDownItem>
            <DropDownItem
                onClick={() => {
                    editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
                }}
                className="item">
                <FormatIndentIncreaseIcon />
                <span className="text">Indent</span>
            </DropDownItem>
        </DropDown>
    );
}
