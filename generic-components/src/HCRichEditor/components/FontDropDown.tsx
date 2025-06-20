import React, {useCallback} from 'react';
import {$getSelection, LexicalEditor} from 'lexical';
import {
    $patchStyleText,
} from '@lexical/selection';
import DropDown, {DropDownItem} from './DropDown';
import {dropDownActiveClass} from './BlockFormatDropDown';
import {HCIcon} from '../../HCIcon';


export const FONT_FAMILY_OPTIONS: [string, string][] = [
    ['Arial', 'Arial'],
    ['ArialUnicodeMS', 'ArialUnicodeMS'],
    ['Calibri', 'Calibri'],
    ['Tahoma', 'Tahoma'],
    ['Verdana', 'Verdana'],
];

export const FONT_SIZE_OPTIONS: [string, string][] = [
    ['10px', '10px'],
    ['11px', '11px'],
    ['12px', '12px'],
    ['13px', '13px'],
    ['14px', '14px'],
    ['15px', '15px'],
    ['16px', '16px'],
    ['17px', '17px'],
    ['18px', '18px'],
    ['19px', '19px'],
    ['20px', '20px'],
];

export function FontDropDown({
    editor,
    value,
    style,
    disabled = false,
}: {
    editor: LexicalEditor;
    value: string;
    style: string;
    disabled?: boolean;
}): JSX.Element {
    const handleClick = useCallback(
        (option: string) => {
            editor.update(() => {
                const selection = $getSelection();
                if (selection !== null) {
                    $patchStyleText(selection, {
                        [style]: option,
                    });
                }
            });
        },
        [editor, style],
    );

    const buttonAriaLabel =
        style === 'font-family'
            ? 'Formatting options for font family'
            : 'Formatting options for font size';

    return (
        <DropDown
            disabled={disabled}
            buttonClassName={'toolbar-item ' + style}
            buttonLabel={value}
            buttonAriaLabel={buttonAriaLabel}
            icon={<HCIcon icon="Type" color="#292929" />}>
            {(style === 'font-family' ? FONT_FAMILY_OPTIONS : FONT_SIZE_OPTIONS).map(
                ([option, text]) => (
                    <DropDownItem
                        className={`item ${dropDownActiveClass(value === option)} ${
                            style === 'font-size' ? 'fontsize-item' : ''
                        }`}
                        onClick={() => handleClick(option)}
                        key={option}>
                        <span className="text">{text}</span>
                    </DropDownItem>
                ),
            )}
        </DropDown>
    );
}
