import * as React from 'react';
import {HCModal} from './HCModal';
import {HCIcon} from '../HCIcon';

export interface HCDeleteModalProps {
    open: boolean;
    title: string;
    message: string;
    onCancel(): void;
    onDelete(): void;
}

export function HCDeleteModal(props: HCDeleteModalProps) {
    return (
        <HCModal options={{
            type: 'confirm',
            title: props.title,
            renderContent(): React.ReactNode {
                return props.message;
            },
            icon: (
                <HCIcon icon={'Trash'} />
            ),
            confirmText: 'Delete',
            onCancel: props.onCancel,
            onConfirm: props.onDelete
        }} open={props.open} />
    );
}