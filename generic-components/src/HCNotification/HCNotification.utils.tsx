import React from 'react';
import toast, {ToastPosition} from 'react-hot-toast';
import {HCNotification} from './HCNotification';

type HCNotificationUtilOptions = {
    message: string,
    duration?: number,
    onClose?: () => void,
    position?: ToastPosition,
    id?: string,
}

type HCNotificationMessage = string | HCNotificationUtilOptions;

export function success(props: HCNotificationMessage) {
    const options: HCNotificationUtilOptions = typeof props === 'string' ? {
        message: props,
        id: slugify(props),
    } : {
        ...props,
        id: props.id || slugify(props.message),
    };

    const {message, duration, onClose} = options;

    toast((t) => (
        <HCNotification hcVariant={'success'} message={message} onClose={() => {
            if (onClose) onClose();
            toast.dismiss(t.id);
        }}/>
    ), {
        duration,
        style: {
            padding: 0,
        },
        position: options?.position,
        id: options.id,
    });
}

export function error(props: HCNotificationMessage) {
    const options: HCNotificationUtilOptions = typeof props === 'string' ? {
        message: props,
        id: slugify(props),
    } : {
        ...props,
        id: props.id || slugify(props.message),
    };

    const {message, duration, onClose} = options;

    toast((t) => (
        <HCNotification hcVariant={'failure'} message={message} onClose={() => {
            if (onClose) onClose();
            toast.dismiss(t.id);
        }}/>
    ), {
        duration,
        style: {
            padding: 0,
        },
        position: options?.position,
        id: options.id,
    });
}

export function info(props: HCNotificationMessage) {
    const options: HCNotificationUtilOptions = typeof props === 'string' ? {
        message: props,
        id: slugify(props),
    } : {
        ...props,
        id: props.id || slugify(props.message),
    };

    const {message, duration, onClose} = options;

    toast((t) => (
        <HCNotification hcVariant={'info'} message={message} onClose={() => {
            if (onClose) onClose();
            toast.dismiss(t.id);
        }}/>
    ), {
        duration,
        style: {
            padding: 0,
        },
        position: options?.position,
        id: options.id,
    });
}

export function warning(props: HCNotificationMessage) {
    const options: HCNotificationUtilOptions = typeof props === 'string' ? {
        message: props,
        id: slugify(props),
    } : {
        ...props,
        id: props.id || slugify(props.message),
    };

    const {message, duration, onClose} = options;

    toast((t) => (
        <HCNotification hcVariant={'warning'} message={message} onClose={() => {
            if (onClose) onClose();
            toast.dismiss(t.id);
        }}/>
    ), {
        duration,
        style: {
            padding: 0,
        },
        position: options?.position,
        id: options.id,
    });
}

export function danger(props: HCNotificationMessage) {
    const options: HCNotificationUtilOptions = typeof props === 'string' ? {
        message: props,
        id: slugify(props),
    } : {
        ...props,
        id: props.id || slugify(props.message),
    };

    const {message, duration, onClose} = options;

    toast((t) => (
        <HCNotification hcVariant={'danger'} message={message} onClose={() => {
            if (onClose) onClose();
            toast.dismiss(t.id);
        }}/>
    ), {
        duration,
        style: {
            padding: 0,
        },
        position: options?.position,
        id: options.id,
    });
}

type HCNotificationAsyncOptions = {
    runner: Promise<unknown>;
    successText: string;
    failureText: string;
    loadingText: string;
    position?: ToastPosition,
    id?: string,
}

export async function asyncNotification({loadingText, failureText, successText, runner, position, id}: HCNotificationAsyncOptions) {
    await toast.promise(runner, {
        success: <HCNotification hcVariant={'success'} message={successText}/>,
        error: <HCNotification hcVariant={'failure'} message={failureText}/>,
        loading: <HCNotification hcVariant={'loading'} message={loadingText}/>
    }, {
        icon: null,
        style: {
            padding: 0,
        },
        position,
        id,
    });
}

function slugify(str: string) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim leading/trailing white space
    str = str.toLowerCase(); // convert string to lowercase
    str = str.replace(/[^a-z0-9 -]/g, '') // remove any non-alphanumeric characters
        .replace(/\s+/g, '-') // replace spaces with hyphens
        .replace(/-+/g, '-'); // remove consecutive hyphens
    return str;
}