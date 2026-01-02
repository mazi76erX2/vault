import * as React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface RichEditorProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  minHeight?: string;
}

const theme = {
  paragraph: 'mb-2',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
};

const onError = (error: Error) => {
  console.error('Lexical error:', error);
};

export const RichEditor: React.FC<RichEditorProps> = ({
  label,
  placeholder = 'Enter text...',
  readOnly,
  required,
  error,
  helperText,
  className,
  minHeight = '200px',
}) => {
  const initialConfig = {
    namespace: 'RichEditor',
    theme,
    onError,
    editable: !readOnly,
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-destructive')}>
          {label}
        </Label>
      )}

      <LexicalComposer initialConfig={initialConfig}>
        <div
          className={cn(
            'relative border rounded-md',
            error && 'border-destructive',
          )}
        >
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={cn(
                  'outline-none p-4',
                  readOnly && 'opacity-50 cursor-not-allowed',
                )}
                style={{ minHeight }}
                readOnly={readOnly}
              />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none select-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
        </div>
      </LexicalComposer>

      {(error || helperText) && (
        <p className={cn('text-sm', error ? 'text-destructive' : 'text-muted-foreground')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

RichEditor.displayName = 'RichEditor';
