import {$createParagraphNode, $getSelection, $isRangeSelection, LexicalEditor} from 'lexical';
import React from 'react';
import {blockTypeToBlockName} from '../ToolbarPlugin';
import {
    $setBlocksType,
} from '@lexical/selection';
import {
    $createHeadingNode,
    HeadingTagType,
} from '@lexical/rich-text';
import DropDown, {DropDownItem} from './DropDown';
import NotesIcon from '@mui/icons-material/Notes';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import {HCIcon} from '../../HCIcon';

export const blockTypeToBlockIcon = {
    bullet: <FormatListBulletedIcon />,
    check: undefined,
    code: undefined,
    h1: <HCIcon icon="H1" color="#292929" />,
    h2: <HCIcon icon="H2" color="#292929" />,
    h3: undefined,
    h4: undefined,
    h5: undefined,
    h6: undefined,
    number: <FormatListNumberedIcon />,
    paragraph: <NotesIcon />,
    quote: undefined,
};

export function BlockFormatDropDown({
    editor,
    blockType,
    disabled = false,
}: {
    blockType: keyof typeof blockTypeToBlockName;
    editor: LexicalEditor;
    disabled?: boolean;
}): JSX.Element {
    const formatParagraph = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createParagraphNode());
            }
        });
    };

    const formatHeading = (headingSize: HeadingTagType) => {
        if (blockType !== headingSize) {
            editor.update(() => {
                const selection = $getSelection();
                $setBlocksType(selection, () => $createHeadingNode(headingSize));
            });
        }
    };

    return (
        <DropDown
            disabled={disabled}
            buttonClassName="toolbar-item block-controls"
            buttonLabel={blockTypeToBlockName[blockType]}
            icon={blockTypeToBlockIcon[blockType]}
            buttonAriaLabel="Formatting options for text style">
            <DropDownItem
                className={'item ' + dropDownActiveClass(blockType === 'paragraph')}
                onClick={formatParagraph}>
                <NotesIcon />
                <span className="text">Normal</span>
            </DropDownItem>
            <DropDownItem
                className={'item ' + dropDownActiveClass(blockType === 'h1')}
                onClick={() => formatHeading('h1')}>
                <HCIcon icon="H1" color="#292929" />
                <span className="text">Heading 1</span>
            </DropDownItem>
            <DropDownItem
                className={'item ' + dropDownActiveClass(blockType === 'h2')}
                onClick={() => formatHeading('h2')}>
                <HCIcon icon="H2" color="#292929" />
                <span className="text">Heading 2</span>
            </DropDownItem>
            <DropDownItem
                className={'item ' + dropDownActiveClass(blockType === 'h3')}
                onClick={() => formatHeading('h3')}>

                <span className="text">Heading 3</span>
            </DropDownItem>
            <DropDownItem
                className={'item ' + dropDownActiveClass(blockType === 'h4')}
                onClick={() => formatHeading('h4')}>

                <span className="text">Heading 4</span>
            </DropDownItem>
            <DropDownItem
                className={'item ' + dropDownActiveClass(blockType === 'h5')}
                onClick={() => formatHeading('h5')}>

                <span className="text">Heading 5</span>
            </DropDownItem>
            <DropDownItem
                className={'item ' + dropDownActiveClass(blockType === 'h6')}
                onClick={() => formatHeading('h6')}>

                <span className="text">Heading 6</span>
            </DropDownItem>
        </DropDown>
    );
}

export function dropDownActiveClass(active: boolean) {
    if (active) {
        return 'active dropdown-item-active';
    } else {
        return '';
    }
}
