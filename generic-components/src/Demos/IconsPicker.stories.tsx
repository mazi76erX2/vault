
import React from 'react';
import {Meta, StoryObj} from '@storybook/react';
import {HCButtonIcon, HCButtonIconType, HCIconsPicker} from '../HCIcon';
import {Box} from '@mui/material';
import {HCButton} from '../HCButton';
import {HCImageCropper} from '../HCImageCropper';

const meta = {
    title: 'Demos/Pickers',
} satisfies Meta<unknown>;

export default meta;

type Story = StoryObj<unknown>;

export const IconsPicker: Story = {
    render() {
        const [showIcons, setShowIcons] = React.useState(false);
        const [value, setValue] = React.useState<HCButtonIconType>();

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
                    <HCButton hcVariant={'primary'} text={'ICONS'} onClick={() => setShowIcons((prev) => !prev)} />
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

export const ImageCropPicker: Story = {


    render() {
        const [file, setFile] = React.useState<File>();

        const [imgSrc, setImgSrc] = React.useState<string>();

        React.useEffect(() => {
            if (file) {
                const fileReader = new FileReader();
                fileReader.onloadend = () => {
                    setImgSrc(fileReader.result as string);
                };

                fileReader.readAsDataURL(file);
            }
        }, [file]);
        return (
            <Box>
                <input type={'file'} accept={'image/*'} onChange={({target}) => {
                    if (target.files && target.files[0]) setFile(target.files[0]);
                }}/>
                {imgSrc && (
                    <HCImageCropper onClose={() => {
                        setFile(undefined);
                        setImgSrc(undefined);
                    }} updateAvatar={(src) => {
                        console.log(src);
                        setFile(undefined);
                        setImgSrc(undefined);
                    }} imgSrc={imgSrc}/>
                )}
            </Box>
        );
    }
};