import * as React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const languageMap = {
  javascript: javascript(),
  python: python(),
  json: json(),
  html: html(),
  css: css(),
};

export interface CodeEditorProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  language?: keyof typeof languageMap;
  height?: string;
  readOnly?: boolean;
  required?: boolean;
  helperText?: string;
  className?: string;
  placeholder?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  label,
  value = '',
  onChange,
  language = 'javascript',
  height = '200px',
  readOnly,
  required,
  helperText,
  className,
  placeholder,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-destructive')}>
          {label}
        </Label>
      )}
      <div className="border rounded-md overflow-hidden">
        <CodeMirror
          value={value}
          height={height}
          extensions={[languageMap[language]]}
          onChange={onChange}
          readOnly={readOnly}
          placeholder={placeholder}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            searchKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>
      {helperText && <p className="text-sm text-muted-foreground">{helperText}</p>}
    </div>
  );
};

CodeEditor.displayName = 'CodeEditor';
