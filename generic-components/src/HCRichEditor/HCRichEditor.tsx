import React, {useEffect, useRef, useState} from 'react';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ClearEditorPlugin} from '@lexical/react/LexicalClearEditorPlugin';
import {LinkPlugin} from '@lexical/react/LexicalLinkPlugin';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import {ToolbarPlugin} from './ToolbarPlugin';
import {PlaygroundEditorTheme} from './plugins/PlaygroundEditorTheme';
import {ElementFormatType, Klass, LexicalEditor, LexicalNode} from 'lexical';
import {CodeHighlightNode, CodeNode} from '@lexical/code';
import {HashtagNode} from '@lexical/hashtag';
import {AutoLinkNode, LinkNode} from '@lexical/link';
import {ListItemNode, ListNode} from '@lexical/list';
import {MarkNode} from '@lexical/mark';
import {OverflowNode} from '@lexical/overflow';
import {HorizontalRuleNode} from '@lexical/react/LexicalHorizontalRuleNode';
import {HeadingNode, QuoteNode} from '@lexical/rich-text';
import {TableCellNode, TableNode, TableRowNode} from '@lexical/table';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {styled} from '@mui/material';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import {shouldForwardProp} from '../Utilities/Utils';
import {MaxLengthPlugin} from './plugins/MaxLengthPlugin';
import Placeholder from './ui/Placeholder';
import {InlineIconNode} from '../HCIconSearchField/InlineIconNode';
import {CellIconProps} from '../HCIconSearchField';
// import TreeViewPlugin from './plugins/TreeViewPlugin';

interface TitleNMProps {
    editMode: boolean;
    inputBackgroundColor: string;
    fontSize: number;
}

const TitleDiv = styled(ContentEditable, {shouldForwardProp: (prop) => shouldForwardProp(prop, ['editMode', 'inputBackgroundColor', 'fontSize'])})<TitleNMProps>(({editMode, inputBackgroundColor, fontSize}) => {
    if (editMode) {
        return ({
            fontSize: `${fontSize}px`,
            backgroundColor: inputBackgroundColor,
            paddingLeft: '5px',
            '& p': {
                margin: '0px'
            },
            minHeight: '20px'
        });
    } else {
        return ({
            fontSize: `${fontSize}px`,
            '& p': {
                margin: '0px'
            },
            minHeight: '20px'
        });
    }
});

const PlaygroundNodes: Array<Klass<LexicalNode>> = [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    HashtagNode,
    CodeHighlightNode,
    AutoLinkNode,
    LinkNode,
    OverflowNode,
    HorizontalRuleNode,
    MarkNode,
    InlineIconNode
];

export interface HCRichEditorProps {
    editMode: boolean;
    value: string;
    inputBackgroundColor: string;
    onValueChange: (value: string) => void;
    onClose: (value: string) => void;
    className?: string;
    defaultValue: string;
    scale: number;
    fontSize: number;
    fontFamily: string;
    isBold: boolean;
    isItalic: boolean;
    isInTable?: boolean;
    socketValue?: string;
    onFocus?: () => void;
    maxLength?: number;
    placeholder?: string;
    getEditorState?: (state: LexicalEditor) => void;
    defaultOpenTools?: boolean;
    fontColor?:string;
    onIconSelection?: ( iconSelected?: CellIconProps) => void;
    isIconSelected?:boolean;
    showIconPicker?:boolean;
}

export interface HCToolbarProps {
    fontSize: string;
    fontColor: string;
    bgColor: string;
    fontFamily: string;
    elementFormat: ElementFormatType;
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    isStrikethrough: boolean;
}

export const HCRichEditor = (props: HCRichEditorProps) => {
    const [editMode, setEditMode] = useState(props.editMode);
    const fontColor = props?.fontColor || '#000';
    const [openTools, setOpenTools] = useState<boolean>(props.defaultOpenTools || false);
    const [currentValue, setCurrentValue] = useState(props.value || props.defaultValue);
    const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);
    const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
    const [toolbarProps] = useState<HCToolbarProps>({
        fontSize: `${props.fontSize}px`,
        fontColor: fontColor,
        bgColor: '',
        fontFamily: props.fontFamily,
        elementFormat: 'left',
        isBold: props.isBold,
        isItalic: props.isItalic,
        isUnderline: false,
        isStrikethrough: false
    });

    // useEffect(() => {
    //     setCurrentValue(props.value || props.defaultValue);
    // }, [props.value]);

    const onRef = (_floatingAnchorElem: HTMLDivElement) => {
        if (_floatingAnchorElem !== null) {
            setFloatingAnchorElem(_floatingAnchorElem);
        }
    };

    const editorRef = useRef<HTMLDivElement>(null);

    const inputBackgroundColor = props.inputBackgroundColor;

    useEffect(() => {
        setEditMode(props.editMode);
    }, [props.editMode]);

    const onValueChange = (value: string) => {
        setCurrentValue(value);
        // if (props.value !== value)
        //      props.onValueChange(value ? value : currentValue);
    };

    const onClose = (value?: string) => {
        if (props.value !== value)
            props.onClose(value ? value : currentValue);
        setOpenTools(false);
        setIsLinkEditMode(false);
    };

    const clearField = () => {
        setCurrentValue(props.defaultValue);
        onClose(props.defaultValue);
    };

    function onError(error: unknown) {
        console.error(error);
    }

    const initialConfig = {
        editorState: currentValue,
        namespace: 'HCRichEditor',
        theme: PlaygroundEditorTheme,
        onError,
        nodes: [
            ...PlaygroundNodes
        ]
    };

    const [previousSocketValue, setPreviousSocketValue] = React.useState('');

    const MyOnChangePlugin = (pluginProps: {onChange: (value: string) => void}) => {
        const {onChange} = pluginProps;
        const [editor] = useLexicalComposerContext();
        useEffect(() => {
            editor.setEditable(editMode);
            if (props.getEditorState) {
                props.getEditorState(editor);
            }
            return editor.registerUpdateListener(({editorState}) => {
                const editorStateJSON = editorState.toJSON();
                onChange(JSON.stringify(editorStateJSON));
                if (props.getEditorState)
                    props.getEditorState(editor);
            });
        }, [editor, onChange]);
        useEffect(() => {
            if (props.getEditorState) {
                props.getEditorState(editor);
            }
            if (props.socketValue && props.socketValue !== previousSocketValue) {
                const state = editor.parseEditorState(props.socketValue);
                editor.setEditorState(state);
                setPreviousSocketValue(props.socketValue);
            }
        }, [props.socketValue]);
        return null;
    };

    // useEffect(() => {
    //     setPropValueChanged(true);
    // }, [props.value]);

    const contentAreaRef = useRef<HTMLDivElement>(null);

    let topPosition = 0;
    let leftPosition = 0;

    if (contentAreaRef && contentAreaRef.current && contentAreaRef.current.parentElement && contentAreaRef.current.parentElement.parentElement) {
        let elementToUse = contentAreaRef.current;

        if (!props.isInTable && contentAreaRef.current.getBoundingClientRect().height > contentAreaRef.current.parentElement.parentElement.getBoundingClientRect().height) {
            elementToUse = contentAreaRef.current.parentElement.parentElement as HTMLDivElement;
        }

        const rect = elementToUse.getBoundingClientRect();
        topPosition = rect.top + rect.height + 5; // +5 for a little bit extra space
        leftPosition = rect.left + 50;

        // 736 = The Width of the RTE Controls popup
        if ((leftPosition + 727) > document.body.getBoundingClientRect().right) {
            leftPosition -= ((leftPosition + 727 + 50) - document.body.getBoundingClientRect().right);
        }

        // if (topPosition < 72) {
        //     topPosition = elementToUse.offsetTop + elementToUse.getBoundingClientRect().height + 5;
        // }
    }

    const [shouldClose, setShouldClose] = useState(false);

    const handle = (event: MouseEvent) => {
        const editor = editorRef.current;

        if (editor && openTools) {
            const target = event.target;

            handleEvent(editor, target);
        }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
        const editor = editorRef.current;

        if (editor && openTools && event.key === 'Tab') {
            const target = event.target;

            handleEvent(editor, target);
        }
    };

    const handleEvent = (editor: HTMLDivElement | null, target: EventTarget | null) => {
        if (editor && openTools) {
            if (
                editorRef.current &&
                editorRef.current.contains(target as Node)
            ) {
                return;
            }

            const ddEditorElem = document.getElementById('dropdown-editor');
            const cpWrapperElem = document.getElementById('color-picker-wrapper');

            // This logic is specifically to check the SVG icon for Link Edit
            const isSVG = target instanceof SVGElement;
            let shouldClose = true;
            if (isSVG) {
                if (target instanceof SVGSVGElement) {
                    const className = (target as SVGElement).attributes.getNamedItem('class');
                    if (className && className.value.indexOf('link-edit-icon') >= 0) {
                        shouldClose = false;
                    }

                } else if (target instanceof SVGPathElement) {
                    const d = (target as SVGElement).attributes.getNamedItem('d');
                    if (d && d.value === 'M22 24H2v-4h20zM13.06 5.19l3.75 3.75L7.75 18H4v-3.75zm4.82 2.68-3.75-3.75 1.83-1.83c.39-.39 1.02-.39 1.41 0l2.34 2.34c.39.39.39 1.02 0 1.41z')
                        shouldClose = false;
                }
            }

            if (!editor.contains(target as Node)
                && (ddEditorElem ? !ddEditorElem.contains(target as Node) : true)
                && (cpWrapperElem ? !cpWrapperElem.contains(target as Node) : true)
                && shouldClose) {
                setShouldClose(true);
            }
        }
    };

    useEffect(() => {
        const editor = editorRef.current;

        document.addEventListener('mousedown', handle);
        document.addEventListener('keyup', handleKeyPress);
        if (editor !== null && openTools) {
            return () => {
                document.removeEventListener('mousedown', handle);
                document.removeEventListener('keyup', handleKeyPress);
            };
        }
    }, [editorRef, openTools]);

    useEffect(() => {
        if (shouldClose) {
            onClose();
            setShouldClose(false);
        }
    }, [shouldClose, currentValue]);

    if (openTools && props.onFocus) {
        props.onFocus();
    }

    return (
        <>
            <LexicalComposer initialConfig={initialConfig} key={props.value}>
                <div className={`editor-container ${props.className ? props.className : ''}`} style={{width: '100%'}} ref={editorRef}>
                    {openTools &&
                        <ToolbarPlugin
                            setIsLinkEditMode={setIsLinkEditMode}
                            onClose={onClose}
                            leftPosition={leftPosition}
                            topPosition={topPosition}
                            clearField={clearField}
                            scale={props.scale}
                            fontFamilyProp={props.fontFamily}
                            toolbarProps={toolbarProps}
                            onIconSelection={props.onIconSelection}
                            isIconSelected={props.isIconSelected}
                            showIconPicker={props.showIconPicker}
                        />}
                    <div className='editor-inner' ref={contentAreaRef}>
                        <RichTextPlugin
                            contentEditable={<div className={'editor'} style={{fontSize: props.fontSize, fontFamily: props.fontFamily, color: fontColor}} ref={onRef}><TitleDiv
                                editMode={editMode}
                                inputBackgroundColor={inputBackgroundColor}
                                onFocus={() => editMode && setOpenTools(true)}
                                fontSize={props.fontSize}
                                contentEditable={editMode}
                            /></div>}
                            placeholder={<Placeholder color={fontColor || '#858484'}>{props.placeholder ? props.placeholder : ''}</Placeholder>}
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        {props.maxLength !== undefined && props.maxLength > 0 && <MaxLengthPlugin maxLength={props.maxLength} />}
                        <HistoryPlugin />
                        <ListPlugin />
                        <LinkPlugin />
                        <ClearEditorPlugin />
                        {/*<TreeViewPlugin />*/}
                        <MyOnChangePlugin onChange={onValueChange} />
                        {openTools && floatingAnchorElem && (
                            <>
                                <FloatingLinkEditorPlugin
                                    anchorElem={floatingAnchorElem}
                                    isLinkEditMode={isLinkEditMode}
                                />
                            </>
                        )}
                    </div>
                </div>
            </LexicalComposer>
        </>
    );
};
