/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import React, {Dispatch, useEffect, useRef} from 'react';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {
    mergeRegister,
    $getNearestNodeOfType,
    $getNearestBlockElementAncestorOrThrow
} from '@lexical/utils';
import {
    $getRoot,
    $getSelection,
    $isRangeSelection, $isRootOrShadowRoot, CLEAR_EDITOR_COMMAND,
    ElementFormatType, ElementNode, FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND, INDENT_CONTENT_COMMAND, LexicalNode, OUTDENT_CONTENT_COMMAND,
    SELECTION_CHANGE_COMMAND
} from 'lexical';
import {useCallback, useState} from 'react';
import {getSelectedNode} from './utils/getSelectedNode';
import {$isLinkNode, TOGGLE_LINK_COMMAND} from '@lexical/link';
import {$isTableSelection} from '@lexical/table';
import {
    $getSelectionStyleValueForProperty,
    $patchStyleText,
    $setBlocksType
} from '@lexical/selection';
import {
    $isListNode,
    ListNode,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import {
    $isHeadingNode,
    $isQuoteNode,
} from '@lexical/rich-text';
import {
    $createParagraphNode,
    $isElementNode,
    $isTextNode,
    COMMAND_PRIORITY_CRITICAL,
    COMMAND_PRIORITY_NORMAL,
    KEY_MODIFIER_COMMAND,
    INSERT_PARAGRAPH_COMMAND
} from 'lexical';
import {sanitizeUrl} from './utils/url';
import {$isDecoratorBlockNode} from '@lexical/react/LexicalDecoratorBlockNode';
import {BlockFormatDropDown} from './components/BlockFormatDropDown';
import {FontDropDown} from './components/FontDropDown';
import {FontSize} from './plugins/ToolbarPlugin/FontSize';
import {styled} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatIndentDecreaseIcon from '@mui/icons-material/FormatIndentDecrease';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import DropdownColorPicker from './ui/DropdownColorPicker';
import {shouldForwardProp} from '../Utilities/Utils';
import {HCToolbarProps} from './HCRichEditor';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import {CellIconProps, HCIconSearchField} from '../HCIconSearchField';

function Divider() {
    return <div className="divider" />;
}

export const blockTypeToBlockName = {
    bullet: 'Bulleted List',
    check: 'Check List',
    code: 'Code Block',
    h1: 'Heading 1',
    h2: 'Heading 2',
    h3: 'Heading 3',
    h4: 'Heading 4',
    h5: 'Heading 5',
    h6: 'Heading 6',
    number: 'Numbered List',
    paragraph: 'Normal',
    quote: 'Quote',
};

export const rootTypeToRootName = {
    root: 'Root',
    table: 'Table',
};

export function ToolbarPlugin({
    setIsLinkEditMode,
    onClose,
    leftPosition,
    topPosition,
    clearField,
    scale,
    fontFamilyProp,
    toolbarProps,
    onIconSelection,
    isIconSelected,
    showIconPicker,
}: {
    setIsLinkEditMode: Dispatch<boolean>;
    onClose: () => void;
    leftPosition: number | null;
    topPosition: number | null;
    clearField: () => void;
    scale: number;
    fontFamilyProp: string;
    toolbarProps: HCToolbarProps;
    onIconSelection?: (iconSelected?: CellIconProps) => void;
    isIconSelected?:boolean;
    showIconPicker?:boolean
}): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const [activeEditor, setActiveEditor] = useState(editor);
    const [blockType, setBlockType] =
        useState<keyof typeof blockTypeToBlockName>('paragraph');
    const [fontSize, setFontSize] = useState<string>(toolbarProps.fontSize);
    const [fontColor, setFontColor] = useState<string>(toolbarProps.fontColor);
    const [bgColor, setBgColor] = useState<string>(toolbarProps.bgColor);
    const [fontFamily, setFontFamily] = useState<string>(toolbarProps.fontFamily);
    const [elementFormat, setElementFormat] = useState<ElementFormatType>(toolbarProps.elementFormat);
    const [isLink, setIsLink] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(toolbarProps.isUnderline);
    const [isStrikethrough, setIsStrikethrough] = useState(toolbarProps.isStrikethrough);
    const [isEditable, setIsEditable] = useState(() => editor.isEditable());
    const [pressed, setPressed] = useState(false);
    const [position, setPosition] = useState({x: leftPosition || 0, y: topPosition || 0});
    const ref = useRef<HTMLDivElement>(null);

    const isEditorEmpty = editor.getEditorState().read(() => {
        const root = $getRoot();
        return root.getChildrenSize() === 1;
    });

    if (isEditorEmpty) {
        if (!isBold && toolbarProps.isBold) {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }
        if (!isItalic && toolbarProps.isItalic) {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }
    }

    const $updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            let element =
                anchorNode.getKey() === 'root'
                    ? anchorNode
                    : $findMatchingParent(anchorNode, (e) => {
                        const parent = e.getParent();
                        return parent !== null && $isRootOrShadowRoot(parent);
                    });

            if (element === null) {
                element = anchorNode.getTopLevelElementOrThrow();
            }

            const elementKey = element.getKey();
            const elementDOM = activeEditor.getElementByKey(elementKey);

            // Update text format
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));
            setIsStrikethrough(selection.hasFormat('strikethrough'));

            // Update links
            const node = getSelectedNode(selection);
            const parent = node.getParent();
            if ($isLinkNode(parent) || $isLinkNode(node)) {
                setIsLink(true);
            } else {
                setIsLink(false);
            }

            if (elementDOM !== null) {
                if ($isListNode(element)) {
                    const parentList = $getNearestNodeOfType<ListNode>(
                        anchorNode,
                        ListNode,
                    );
                    const type = parentList
                        ? parentList.getListType()
                        : element.getListType();
                    setBlockType(type);
                } else {
                    const type = $isHeadingNode(element)
                        ? element.getTag()
                        : element.getType();
                    if (type in blockTypeToBlockName) {
                        setBlockType(type as keyof typeof blockTypeToBlockName);
                    }
                }
            }
            // Handle buttons
            setFontColor(
                $getSelectionStyleValueForProperty(selection, 'color', fontColor || '#000'),
            );
            setBgColor(
                $getSelectionStyleValueForProperty(
                    selection,
                    'background-color',
                    '',
                ),
            );
            setFontFamily(
                $getSelectionStyleValueForProperty(selection, 'font-family', fontFamilyProp),
            );
            let matchingParent;
            if ($isLinkNode(parent)) {
                // If node is a link, we need to fetch the parent paragraph node to set format
                matchingParent = $findMatchingParent(
                    node,
                    (parentNode) => $isElementNode(parentNode) && !parentNode.isInline(),
                );
            }

            // If matchingParent is a valid node, pass it's format type
            const elementFormat = $isElementNode(matchingParent)
                ? matchingParent.getFormatType()
                : $isElementNode(node)
                    ? node.getFormatType()
                    : parent?.getFormatType();
            setElementFormat(elementFormat || 'left');
        }
        if ($isRangeSelection(selection) || $isTableSelection(selection)) {
            setFontSize(
                $getSelectionStyleValueForProperty(selection, 'font-size', fontSize),
            );
        }
    }, [activeEditor, editor]);

    useEffect(() => {
        editor.registerCommand(
            INSERT_PARAGRAPH_COMMAND,
            () => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) {
                    return false;
                }
                selection.insertParagraph();
                return true;
            },
            COMMAND_PRIORITY_CRITICAL
        );
        return editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            (_payload, newEditor) => {
                setActiveEditor(newEditor);
                $updateToolbar();
                return false;
            },
            COMMAND_PRIORITY_CRITICAL,
        );
    }, [editor, $updateToolbar]);

    useEffect(() => {
        activeEditor.getEditorState().read(() => {
            $updateToolbar();
        });
    }, [activeEditor, $updateToolbar]);

    useEffect(() => {
        return mergeRegister(
            editor.registerEditableListener((editable) => {
                setIsEditable(editable);
            }),
            activeEditor.registerUpdateListener(({editorState}) => {
                editorState.read(() => {
                    $updateToolbar();
                });
            })
        );
    }, [$updateToolbar, activeEditor, editor]);

    useEffect(() => {
        return activeEditor.registerCommand(
            KEY_MODIFIER_COMMAND,
            (payload) => {
                const event: KeyboardEvent = payload;
                const {code, ctrlKey, metaKey} = event;

                if (code === 'KeyK' && (ctrlKey || metaKey)) {
                    event.preventDefault();
                    let url: string | null;
                    if (!isLink) {
                        setIsLinkEditMode(true);
                        url = sanitizeUrl('https://');
                    } else {
                        setIsLinkEditMode(false);
                        url = null;
                    }
                    return activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
                }
                return false;
            },
            COMMAND_PRIORITY_NORMAL,
        );
    }, [activeEditor, isLink, setIsLinkEditMode]);

    const applyStyleText = useCallback(
        (styles: Record<string, string>, skipHistoryStack?: boolean) => {
            activeEditor.update(
                () => {
                    const selection = $getSelection();
                    if (selection !== null) {
                        $patchStyleText(selection, styles);
                    }
                },
                skipHistoryStack ? {tag: 'historic'} : {},
            );
        },
        [activeEditor],
    );

    const clearFormatting = useCallback(() => {
        activeEditor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection) || $isTableSelection(selection)) {
                const anchor = selection.anchor;
                const focus = selection.focus;
                const nodes = selection.getNodes();
                const extractedNodes = selection.extract();

                if (anchor.key === focus.key && anchor.offset === focus.offset) {
                    return;
                }

                nodes.forEach((node, idx) => {
                    // We split the first and last node by the selection
                    // So that we don't format unselected text inside those nodes
                    if ($isTextNode(node)) {
                        // Use a separate variable to ensure TS does not lose the refinement
                        let textNode = node;
                        if (idx === 0 && anchor.offset !== 0) {
                            textNode = textNode.splitText(anchor.offset)[1] || textNode;
                        }
                        if (idx === nodes.length - 1) {
                            textNode = textNode.splitText(focus.offset)[0] || textNode;
                        }
                        /**
                         * If the selected text has one format applied
                         * selecting a portion of the text, could
                         * clear the format to the wrong portion of the text.
                         *
                         * The cleared text is based on the length of the selected text.
                         */
                        // We need this in case the selected text only has one format
                        const extractedTextNode = extractedNodes[0];
                        if (nodes.length === 1 && $isTextNode(extractedTextNode)) {
                            textNode = extractedTextNode;
                        }

                        if (textNode.__style !== '') {
                            textNode.setStyle('');
                        }
                        if (textNode.__format !== 0) {
                            textNode.setFormat(0);
                            $getNearestBlockElementAncestorOrThrow(textNode).setFormat('');
                        }
                        node = textNode;
                    } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
                        node.replace($createParagraphNode(), true);
                    } else if ($isDecoratorBlockNode(node)) {
                        node.setFormat('');
                    }
                });
            }
        });
    }, [activeEditor]);

    const formatParagraph = () => {
        activeEditor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createParagraphNode());
            }
        });
    };

    const onClearField = () => {
        editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
        clearField();
    };

    const onFontColorSelect = useCallback(
        (value: string, skipHistoryStack: boolean) => {
            applyStyleText({color: value}, skipHistoryStack);
        },
        [applyStyleText],
    );

    const onBgColorSelect = useCallback(
        (value: string, skipHistoryStack: boolean) => {
            applyStyleText({'background-color': value}, skipHistoryStack);
        },
        [applyStyleText],
    );

    const insertLink = useCallback(() => {
        if (!isLink) {
            setIsLinkEditMode(true);
            activeEditor.dispatchCommand(
                TOGGLE_LINK_COMMAND,
                sanitizeUrl('https://'),
            );
        } else {
            setIsLinkEditMode(false);
            activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
    }, [activeEditor, isLink, setIsLinkEditMode]);

    let currentX = position.x || 0;
    let currentY = position.y || 0;
    const onMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (pressed && ref) {
            currentX += (event.movementX * (1 / scale));
            currentY += (event.movementY * (1 / scale));
            //
            if (ref.current) {
                ref.current.style.left = `${currentX}px`;
                ref.current.style.top = `${currentY}px`;
            }
        }
    };

    return (
        <ToolbarDiv
            className="toolbar"
            leftPosition={position.x || 0} topPosition={position.y || 0}
            ref={ref}
            onMouseMove={onMouseMove}
        >
            <div className='row'>
                <button
                    onClick={() => onClose()}
                    title={'OK'}
                    type="button"
                    className="toolbar-item spaced"
                    aria-label="OK">
                    OK
                </button>

                <Divider />

                <button
                    disabled={!isEditable}
                    onClick={() => {
                        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
                    }}
                    className={'toolbar-item spaced ' + (isBold ? 'active' : '')}
                    title={'Bold (Ctrl+B)'}
                    type="button"
                    aria-label={'Format text as bold. Shortcut: Ctrl+B'}>
                    <FormatBoldIcon />
                </button>
                <button
                    disabled={!isEditable}
                    onClick={() => {
                        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
                    }}
                    className={'toolbar-item spaced ' + (isItalic ? 'active' : '')}
                    title={'Italic (Ctrl+I)'}
                    type="button"
                    aria-label={'Format text as italics. Shortcut: Ctrl+I'}>
                    <FormatItalicIcon />
                </button>
                <button
                    disabled={!isEditable}
                    onClick={() => {
                        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
                    }}
                    className={'toolbar-item spaced ' + (isUnderline ? 'active' : '')}
                    title={'Underline (Ctrl+U)'}
                    type="button"
                    aria-label={'Format text to underlined. Shortcut: Ctrl+U'}>
                    <FormatUnderlinedIcon />
                </button>
                <button
                    disabled={!isEditable}
                    onClick={() => {
                        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND,'strikethrough');
                    }}
                    className={'toolbar-item spaced ' + (isStrikethrough ? 'active' : '')}
                    title={'Strikethrough'}
                    type="button"
                    aria-label={'Format text with a strikethrough'}>
                    <StrikethroughSIcon />
                </button>

                <Divider />

                <DropdownColorPicker
                    disabled={!isEditable}
                    buttonClassName="toolbar-item color-picker"
                    buttonAriaLabel="Formatting text color"
                    buttonIconClassName="icon font-color"
                    color={fontColor}
                    onChange={onFontColorSelect}
                    title="text color"
                    customIcon={<FormatColorTextIcon />}
                />
                <DropdownColorPicker
                    disabled={!isEditable}
                    buttonClassName="toolbar-item color-picker"
                    buttonAriaLabel="Formatting text color"
                    buttonIconClassName="icon font-color"
                    color={bgColor}
                    onChange={onBgColorSelect}
                    title="bg color"
                    customIcon={<BorderColorIcon />}
                />

                <Divider />

                <button
                    disabled={!isEditable}
                    onClick={() => {
                        activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
                    }}
                    className={'toolbar-item spaced ' + (elementFormat === 'left' ? 'active' : '')}
                    type="button"
                    aria-label={'Left Align'}>
                    <FormatAlignLeftIcon />
                </button>
                <button
                    disabled={!isEditable}
                    onClick={() => {
                        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
                    }}
                    className={'toolbar-item spaced ' + (elementFormat === 'center' ? 'active' : '')}
                    type="button"
                    aria-label={'Center Align'}>
                    <FormatAlignCenterIcon />
                </button>
                <button
                    disabled={!isEditable}
                    onClick={() => {
                        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
                    }}
                    className={'toolbar-item spaced ' + (elementFormat === 'right' ? 'active' : '')}
                    type="button"
                    aria-label={'Right Align'}>
                    <FormatAlignRightIcon />
                </button>
                <button
                    disabled={!isEditable}
                    onClick={() => {
                        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
                    }}
                    className={'toolbar-item spaced ' + (elementFormat === 'justify' ? 'active' : '')}
                    type="button"
                    aria-label={'Justify Align'}>
                    <FormatAlignJustifyIcon />
                </button>

                <Divider />

                <button
                    disabled={!isEditable}
                    onClick={() => {
                        if (blockType !== 'number')
                            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
                        else
                            formatParagraph();
                    }}
                    className={'toolbar-item spaced ' + (blockType === 'number' ? 'active' : '')}
                    type="button"
                    aria-label={'Numbered List'}>
                    <FormatListNumberedIcon />
                </button>
                <button
                    disabled={!isEditable}
                    onClick={() => {
                        if (blockType !== 'bullet')
                            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
                        else
                            formatParagraph();
                    }}
                    className={'toolbar-item spaced ' + (blockType === 'bullet' ? 'active' : '')}
                    type="button"
                    aria-label={'Bullet List'}>
                    <FormatListBulletedIcon />
                </button>
                <button
                    disabled={!isEditable}
                    onClick={() => {
                        editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
                    }}
                    className={'toolbar-item spaced '}
                    type="button"
                    aria-label={'Outdent'}>
                    <FormatIndentDecreaseIcon />
                </button>
                <button
                    disabled={!isEditable}
                    onClick={() => {
                        editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
                    }}
                    className={'toolbar-item spaced '}
                    type="button"
                    aria-label={'Indent'}>
                    <FormatIndentIncreaseIcon />
                </button>

                <Divider />

                <button
                    disabled={!isEditable}
                    onClick={insertLink}
                    className={'toolbar-item spaced ' + (isLink ? 'active' : '')}
                    aria-label="Insert link"
                    title="Insert link"
                    type="button">
                    <InsertLinkIcon />
                </button>
            </div>
            <div className='row'>
                {blockType in blockTypeToBlockName && activeEditor === editor && (
                    <>
                        <BlockFormatDropDown
                            disabled={!isEditable}
                            blockType={blockType}
                            editor={activeEditor}
                        />
                        <Divider />
                    </>
                )}
                <FontDropDown
                    disabled={!isEditable}
                    style={'font-family'}
                    value={fontFamily}
                    editor={activeEditor}
                />
                <Divider />
                <FontSize
                    selectionFontSize={fontSize.slice(0, -2)}
                    editor={activeEditor}
                    disabled={!isEditable}
                />
                <Divider />

                {/* TODO: Implement variables dropdown here */}
                {/*<Divider />*/}
                <button
                    disabled={!isEditable}
                    onClick={clearFormatting}
                    className={'toolbar-item spaced'}
                    type="button"
                    aria-label={'Clear Formatting'}>
                    <FormatClearIcon />
                </button>
                <Divider />
                <button
                    disabled={!isEditable}
                    onClick={onClearField}
                    className={'toolbar-item spaced'}
                    type="button"
                    aria-label={'Delete the content of the document'}>
                    <InsertDriveFileOutlinedIcon />
                </button>

                {showIconPicker && (
                    // Icon Picker
                    <HCIconSearchField
                        placeholder='Search icon'
                        editor={editor}
                        onIconSelection={onIconSelection}
                        isIconSelected={isIconSelected}
                    />
                )}

                <button
                    className={`toolbar-item spaced toolbar-item-right ${!showIconPicker ? 'absolute' : ''}`}
                    type="button"
                    aria-label={'Drag Tools'}
                    onMouseDown={() => setPressed(true)}
                    onMouseUp={() => {
                        setPressed(false);
                        setPosition({
                            x: currentX,
                            y: currentY
                        });
                    }}>
                    <DragIndicatorIcon />
                </button>
            </div>
        </ToolbarDiv>
    );
}

const $findMatchingParent: {
    <T extends LexicalNode>(
        startingNode: LexicalNode,
        findFn: (node: LexicalNode) => node is T,
    ): T | null;
    (
        startingNode: LexicalNode,
        findFn: (node: LexicalNode) => boolean,
    ): LexicalNode | null;
} = (
    startingNode: LexicalNode,
    findFn: (node: LexicalNode) => boolean,
): LexicalNode | null => {
    let curr: ElementNode | LexicalNode | null = startingNode;

    while (curr !== $getRoot() && curr != null) {
        if (findFn(curr)) {
            return curr;
        }

        curr = curr.getParent();
    }

    return null;
};

const ToolbarDiv = styled('div', {shouldForwardProp: (prop) => shouldForwardProp(prop, ['leftPosition', 'topPosition'])})<{ leftPosition: number; topPosition: number }>`
  display: flex;
  margin-bottom: 1px;
  background: #fff;
  padding: 4px;
  vertical-align: middle;
  height: 80px;
  position: fixed;
  width: 727px;
  top: ${props => props.topPosition}px;
  left: ${props => props.leftPosition}px;
  z-index: 150000;
  border: 1px solid;
  flex-direction: column;
  
  .row {
    display: flex;
    height: 36px
  }
  
  .color-picker {
    width: 52px;
    padding: 0px !important;
  }

  button.toolbar-item {
    border: 0;
    display: flex;
    background: none;
    border-radius: 10px;
    padding: 8px;
    cursor: pointer;
    vertical-align: middle;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
  }
  
  button.toolbar-item-right {
    right: 4px;
      
      &.absolute{
          position: absolute;
      }
  }

  button.toolbar-item:disabled {
    cursor: not-allowed;
  }

  button.toolbar-item.spaced {
    margin-right: 2px;
  }

  button.toolbar-item i.format {
    background-size: contain;
    display: inline-block;
    height: 18px;
    width: 18px;
    margin-top: 2px;
    vertical-align: -0.25em;
    display: flex;
    opacity: 0.6;
  }

  button.toolbar-item:disabled i.format {
    opacity: 0.2;
  }

  button.toolbar-item.active {
    background-color: rgb(117 117 117 / 30%);
  }

  button.toolbar-item.active i {
    opacity: 1;
  }

  .toolbar-item:hover:not([disabled]) {
    background-color: #eee;
  }

  .divider {
    width: 1px;
    background-color: #eee;
    margin: 0 4px;
  }

  .toolbar-item .text {
    display: flex;
    line-height: 20px;
    vertical-align: middle;
    font-size: 14px;
    color: #777;
    text-overflow: ellipsis;
    width: 70px;
    overflow: hidden;
    height: 20px;
    text-align: left;
    padding-right: 5px;
  }

  .toolbar-item .icon {
    display: flex;
    width: 20px;
    height: 20px;
    user-select: none;
    margin-right: 8px;
    line-height: 16px;
    background-size: contain;
  }

  .font-size-input {
    font-weight: 700;
    font-size: 14px;
    color: #777;
    border-radius: 5px;
    border-color: grey;
    height: 29px;
    padding: 2px 4px;
    text-align: center;
    width: 50px;
    margin-top: 4px;
  }

  input[type='number']::-webkit-outer-spin-button,
  input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }

  .add-icon {
    background-repeat: no-repeat;
    background-position: center;
  }

  .minus-icon {
    background-repeat: no-repeat;
    background-position: center;
  }

  button.font-decrement {
    padding: 0px;
    margin-right: 3px;
  }

  button.font-increment {
    padding: 0px;
    margin-left: 3px;
  }
`;
