import * as React from 'react';
import {Box, Stack, SxProps, useTheme} from '@mui/material';
import {MUITheme} from '../theme';

export interface HCSegmentTabsItem {
    label: string;
    render?(): React.ReactNode
}

export interface HCSegmentTabsProps {
    items: HCSegmentTabsItem[];
    onTabItemChanged?(index: number, item: HCSegmentTabsItem): void;
    activeIndex?: number;
    fullWidth?: boolean;
    border?: boolean;
    height?: string;
}

export function HCSegmentTabs({onTabItemChanged,items, activeIndex, fullWidth, border, height}: HCSegmentTabsProps) {
    const theme: typeof MUITheme = useTheme();
    const [active, setActive] = React.useState(() => activeIndex ?? 0);

    const activeItem = React.useMemo(() => items[active], [items, active]);
    const tabStyle: SxProps = React.useMemo(() => {
        if (!fullWidth) {
            return {
                display: 'flex',
                alignItems: 'center',
            };
        } else {
            const gridTemplateColumns = items.map(() => `calc(100%/${items.length})`).join(' ');
            return  {
                display: 'grid',
                gridTemplateColumns,
            };
        }
    }, [fullWidth, items]);
    React.useEffect(() => {
        if (typeof activeIndex !== 'undefined') setActive(activeIndex);
    }, [activeIndex]);

    if (!activeItem) return null;
    return (
        <Stack>
            <Box sx={tabStyle}>
                {items.map((item, index) => {
                    const isActive = active === index;
                    const isLast = index === (items.length - 1);

                    return (
                        <Box key={index} role={'button'} sx={{
                            userSelect: 'none',
                            minWidth: '150px',
                            height: '40px',
                            px: '31px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isActive ? theme.palette.primary.main : '#fff',
                            color: isActive ? '#fff' : '#000',
                            cursor: 'pointer',
                            fontSize: '12px',
                            textWrap: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            fontWeight: '500',
                            borderLeft: border && index === 0 ?`solid 0.8px ${isActive ? theme.palette.primary.main : '#b2b1b1'}` : '',
                            borderTop: border ? `solid 0.8px ${isActive ? theme.palette.primary.main : '#b2b1b1'}` : '0',
                            borderBottom: isActive ? `solid 0.8px ${theme.palette.primary.main}` : 'solid 0.8px #b2b1b1',
                            borderRight:  border && isLast ?`solid 0.8px ${isActive ? theme.palette.primary.main : '#b2b1b1'}` :!isActive && (index < (items.length - 1)) ? 'solid 0.8px #b2b1b1' : '',
                        }} onClick={() => {
                            if (onTabItemChanged) onTabItemChanged(index, item);
                            setActive(index);
                        }}>
                            {item.label.toUpperCase()}
                        </Box>
                    );
                })}
            </Box>
            {items.map((item, index) => {
                const isActive = active === index;
                if (!item.render) return null;
                return (
                    <Stack key={index} sx={{
                        display: !isActive ? 'none' : undefined,
                        boxShadow: 'box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1)',
                        ...height ? {
                            height,
                            overflowY: 'auto',
                        } : {}
                    }}>
                        {item.render()}
                    </Stack>
                );
            })}
        </Stack>
    );
}