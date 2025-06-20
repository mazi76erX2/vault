import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {getStoryDescription} from '../utils';
import {HCIcon, HCIconProps} from './HCIcon';
import {Box, Paper, Typography} from '@mui/material';
import {HCColorPicker} from '../HCColorPicker';
import {Icon} from '../icons';
import {HCNumberField} from '../HCNumberField';

const meta: Meta<HCIconProps> = {
    title: 'Components/HCIcon',
    component: HCIcon,
    parameters: getStoryDescription('component', '## About\nCustom component used in react-hot-toast.\n')
} satisfies Meta<typeof HCIcon>;

export default meta;

type Story = StoryObj<typeof HCIcon>;

export const ArrowIcon: Story = {
    args: {
        icon: 'AirportSign1',
        style: {
            width: 40,
            height: 40,
        }
    }
};

export const IconList: Story = {
    args: {
        icon: 'User',
        color: '#292929'
    },
    render(props) {
        const [icon, setIcon] = React.useState(props.icon);
        const [strokeWidth, setStrokeWidth] = React.useState(1);
        const [color, setColor] = React.useState<string>(props.color ? props.color : '#292929');
        const iconList = () => {
            return Object.keys(Icon).sort();
        };

        React.useEffect(() => {
            if (props.color) setColor(props.color);
        }, [props.color]);

        return (
            <Paper sx={{
                display: 'grid',
                gridTemplateRows: '160px 100px 80px calc(95vh - 340px)',
                overflow: 'hidden',
            }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <HCIcon style={{
                        width: 200,
                        height: 200,
                        color,
                    }} strokeWidth={strokeWidth} icon={icon} color={color}/>
                </Box>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <code>{`<HCIcon icon="${icon}" color="${color}" />`}</code>
                </Box>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: '100px auto',
                    gridGap: 16,
                }}>
                    <HCNumberField size={'medium'} label={'Stroke Width'} value={strokeWidth} onChange={({target}) => {
                        setStrokeWidth(Number(target.value ?? '0'));
                    }} inputProps={{
                        endAdornment: 'px'
                    }} />
                    <HCColorPicker size={'medium'} label={'Stroke Color'} color={color} onColorChanged={(color) => setColor(color.hex)} />
                    
                </Box>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: '25% 25% 25% 25%',
                    overflow: 'auto',
                    py: 2,
                    border: '1px solid #ddd',
                    px: 2,
                }}>
                    {iconList().map((key) => {
                        const thisIcon = key as keyof typeof Icon;
                        return (
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '90px',
                                flexDirection: 'column',
                                mb: 2,
                                cursor: 'pointer',
                            }} key={key} onClick={() => setIcon(thisIcon)}>
                                <Box sx={{
                                    width: '50px',
                                    height: '50px',
                                    ':hover': {
                                        background: '#eee',
                                    }
                                }}>
                                    <HCIcon size={50} className={thisIcon} icon={thisIcon} />
                                </Box>
                                <Typography sx={{
                                    mt: 1
                                }}>{thisIcon}</Typography>
                            </Box>
                        );
                    })}
                </Box>
            </Paper>
        );
    }
};