import * as React from 'react';
import {HCMarkdownViewProps, HCMarkdownView} from './HCMarkdownView';
import {Divider, Paper, styled, useTheme} from '@mui/material';
import {HCHeaderLabel} from '../HCHeaderLabel';
import {MUITheme} from '../theme';
import { ExtraProps } from 'react-markdown';

const StyledPaper = styled(Paper)(({theme}) => ({
    width: '100%',
    maxWidth: '100%',
    padding: '25px',
    '& div': {
        width: '100%',
        maxWidth: '100%',
        display: 'grid !important',
        color: theme.textColor.black,
        '& *': {
            marginRight: 0
        }
    }
}));

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingVariant = `h${HeadingLevel}`;

export interface HCContextFrameMDProps extends HCMarkdownViewProps {}
export const HCContextFrameMD = (props: HCContextFrameMDProps) => {
    const theme: typeof MUITheme = useTheme();
    const renderHeading = (
        props: React.ClassAttributes<HTMLHeadingElement> & React.HTMLAttributes<HTMLHeadingElement> & ExtraProps,
        configs: {
            variant: HeadingVariant;
            divider?: boolean;
        }
    ) => {
        const { variant, divider } = configs;
        return (
            <>
                <HCHeaderLabel title={props.children} typographyProps={{
                    variant
                }} />
                {divider && (
                    <Divider sx={{
                        mb: 2,
                        mt: 1,
                    }} />
                )}
            </>
        );
    };
    
    return (
        <StyledPaper>
            <HCMarkdownView {...props} components={{
                h1: (props) => renderHeading(props, { variant: 'h1', divider: true }),
                h2: (props) => renderHeading(props, { variant: 'h2' }),
                h3: (props) => renderHeading(props, { variant: 'h3' }),
                h4: (props) => renderHeading(props, { variant: 'h4' }),
                h5: (props) => renderHeading(props, { variant: 'h5' }),
                h6: (props) => renderHeading(props, { variant: 'h6' }),
                a(props) {
                    return (
                        <>
                            <a {...props} target="_blank" rel="noreferrer" style={{
                                ...props.style,
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                color: theme.palette.primary.main,
                                fontWeight: 'normal',
                                textDecoration: 'none',
                            }} />
                            <Divider sx={{
                                mb: 2,
                                mt: 1,
                            }} />
                        </>
                    );
                },
                div(props) {
                    return <div {...props} style={{
                        ...props.style,
                        width: '100%',
                    }} />;
                },
                ...props.components,
            }}/>
        </StyledPaper>
    );
};