import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {HCCardButton} from './HCCardButton';
import {Box, Typography} from '@mui/material';

const meta = {
    title: 'Components/HCCardButton',
    component: HCCardButton,
} satisfies Meta<typeof HCCardButton>;

export default meta;

type Story = StoryObj<typeof HCCardButton>;

export  const BasicCard: Story = {
    args: {
        hcVariant: 'primary',
        children: (
            <Typography variant={'h2'}>Title</Typography>
        )
    }
};

export  const GridCards: Story = {
    args: {
        hcVariant: 'primary',
    },
    render() {
        const renderButtonContent = () => {
            return (
                <>
                    <Typography variant={'h2'}>Title</Typography>
                    <Typography variant={'body1'}>Content goes here</Typography>
                </>
            );
        };

        return (
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gridGap: '16px',
            }}>
                <HCCardButton hcVariant={'primary'}>{renderButtonContent()}</HCCardButton>
                <HCCardButton hcVariant={'secondary'}>{renderButtonContent()}</HCCardButton>
                <HCCardButton hcVariant={'tertiary'}>{renderButtonContent()}</HCCardButton>
                <HCCardButton hcVariant={'primary'} outlined={true}>{renderButtonContent()}</HCCardButton>
                <HCCardButton hcVariant={'secondary'} outlined={true}>{renderButtonContent()}</HCCardButton>
                <HCCardButton hcVariant={'tertiary'} outlined={true}>{renderButtonContent()}</HCCardButton>
            </Box>
        );
    }
};