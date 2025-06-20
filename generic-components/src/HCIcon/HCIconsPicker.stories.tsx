import {Meta, StoryObj} from '@storybook/react';
import {HCButtonIcon, HCButtonIconType, HCIconsPicker, HCIconsPickerProps} from './HCIconsPicker';
import React from 'react';
import {Box} from '@mui/material';
import {HCButton} from '../HCButton';

const meta: Meta<HCIconsPickerProps>  = {
    title: 'Components/HCIconsPicker',
} satisfies Meta<typeof HCIconsPicker>;

export default meta;

type Story = StoryObj<typeof HCIconsPicker>;

export const BasicIconsPicker: Story = {
    args: {
        open: true,
        value: 'ArrowBottomLeft1'
    },
    render(args) {
        const [showIcons, setShowIcons] = React.useState(args.open);
        const [value, setValue] = React.useState<HCButtonIconType>(args.value as HCButtonIconType);

        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                p: 10
            }}>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: value ? '40px 1fr' : '1fr',
                    gridGap: '8px',
                    mb: 2,
                }}>
                    {value && (
                        <Box style={{
                            height: '40px',
                            width: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <HCButtonIcon icon={value} />
                        </Box>
                    )}
                    <HCButton hcVariant={'primary'} text={'TOGGLE ICONS'} onClick={() => setShowIcons((prev) => !prev)} />
                </Box>
                <Box>
                    <HCIconsPicker open={showIcons} value={value} onChange={(iconName) => {
                        setValue(iconName as HCButtonIconType);
                    }} height={'300px'}/>
                </Box>
            </Box>
        );
    }
};