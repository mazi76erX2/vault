import * as React from 'react';
import Markdown, {Components} from 'react-markdown';

export interface HCMarkdownViewProps {
  content?: string;
  components?: Components;
}
export const HCMarkdownView = (props: HCMarkdownViewProps) => {
    const {content, components} = props;
    return (
        <Markdown
            components={{
                a(props) {
                    return <a {...props} target="_blank" rel="noreferrer" />;
                },
                ul(props) {
                    return (
                        <>
                            <br/>
                            <ul {...props} />
                            <br/>
                        </>
                    );
                },
                ...components,
            }}
        >{content}</Markdown>
    );
};