import { DecoratorNode, SerializedLexicalNode, Spread } from 'lexical';
import { LexicalCommand, createCommand } from 'lexical';
import * as React from 'react';
import {HCButtonIcon, HCButtonIconType} from '../HCIcon';
import './iconStyle.css';

// Define the serialized data structure for persistence
export type SerializedInlineIconNode = Spread<
    {
        iconName: string;
        styles: React.CSSProperties;
    },
    SerializedLexicalNode // Extends the base serialized node structure
>;

// Define a custom node class extending DecoratorNode
export class InlineIconNode extends DecoratorNode<JSX.Element> {
    private _iconPath: string;
    private _styles: React.CSSProperties;

    constructor(iconName: string, styles: React.CSSProperties, key?: string) {
        super(key); // Pass the key to the base class
        this._iconPath = iconName; // Assign the icon name
        this._styles = styles;
    }

    // Returning the type of this custom node
    static getType(): string {
        return 'inline-icon';
    }

    // Clones the current node, keeping the icon path and key
    static clone(node: InlineIconNode): InlineIconNode {
        return new InlineIconNode(node._iconPath, node._styles, node.getKey());
    }

    // Creates a DOM element representing the icon container
    createDOM(): HTMLElement {
        const span = document.createElement('span');
        span.className = 'selected-icon';
        span.style.fontSize = 'inherit';
        span.style.color = 'inherit';
        return span;
    }

    // Prevents unnecessary DOM updates (Lexical optimization)
    updateDOM(): false {
        return false;
    }

    // Returns a React component that renders the icon inside the editor
    decorate(): JSX.Element {
        return <IconComponent iconName={this._iconPath} styles={this._styles} />;
    }

    // Exports the node's data to JSON for persistence
    exportJSON(): SerializedInlineIconNode {
        return {
            type: 'inline-icon',
            version: 1,
            iconName: this._iconPath, // Store the icon path for persistence
            styles: this._styles,
        };
    }

    // Imports JSON data to recreate an InlineIconNode instance
    static importJSON(serializedNode: SerializedInlineIconNode): InlineIconNode {
        return new InlineIconNode(serializedNode.iconName, serializedNode.styles);
    }
}

// Rendering the icon
const IconComponent: React.FC<{ iconName: string, styles: React.CSSProperties }> = ({ iconName, styles }) => {
    return (
        <HCButtonIcon icon={iconName as HCButtonIconType} style={styles} className='btn-icon-item'/>
    );
};

// Create an InlineIconNode instance
export function $createInlineIconNode(iconName: string, styles: React.CSSProperties): InlineIconNode {
    return new InlineIconNode(iconName, styles);
}

// Lexical command to insert an inline icon node into the editor
export const INSERT_INLINE_ICON_COMMAND: LexicalCommand<string> = createCommand(
    'INSERT_INLINE_ICON_COMMAND'
);