import type {Meta, StoryObj} from '@storybook/react';

import React from 'react';
import {HCNotification, HCNotificationProps} from './HCNotification';
import {getStoryDescription} from '../utils';
import {HCButton} from '../HCButton';
import {asyncNotification, error, success} from './HCNotification.utils';

const meta: Meta<HCNotificationProps> = {
    title: 'Components/HCNotification',
    component: HCNotification,
    parameters: getStoryDescription('component', '## About\nCustom component used in react-hot-toast.\n')
} satisfies Meta<typeof HCNotification>;

export default meta;

type Story = StoryObj<typeof HCNotification>;

export const BasicHCNotification: Story = {
    args: {
        message: 'Data saved successfully!',
        hcVariant: 'success',
    }
};

export const TriggerSuccessNotice: Story = {
    render() {
        return (
            <HCButton hcVariant={'primary'} text={'Success'} onClick={() => {
                success({
                    message: 'Data updated!',
                    position: 'bottom-center'
                });
            }}/>
        );
    }
};

export const TriggerFailureNotice: Story = {
    render() {
        return (
            <HCButton hcVariant={'primary'} text={'Failure'} onClick={() => {
                error({
                    message: 'Data not updated!'
                });
            }}/>
        );
    }
};

export const TriggerAsyncSuccessNotice: Story = {
    render() {
        const successPromise = new Promise((resolve) => {
            setTimeout(() => resolve(null), 5000);
        });
        return (
            <HCButton hcVariant={'primary'} text={'Success Load'} onClick={() => {
                asyncNotification({
                    runner: successPromise,
                    loadingText: 'Loading',
                    successText: 'Data loaded!',
                    failureText: 'Failed to load data',
                });
            }}/>
        );
    }
};

export const TriggerAsyncFailureNotice: Story = {
    render() {
        const successPromise = new Promise((_resolve, reject) => {
            setTimeout(() => reject(null), 5000);
        });
        return (
            <HCButton hcVariant={'primary'} text={'Failure Load'} onClick={() => {
                asyncNotification({
                    runner: successPromise,
                    loadingText: 'Loading',
                    successText: 'Data loaded!',
                    failureText: 'Failed to load data',
                });
            }}/>
        );
    }
};