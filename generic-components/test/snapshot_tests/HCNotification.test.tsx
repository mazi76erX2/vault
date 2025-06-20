import {beforeEach, expect, it, vitest} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCNotification} from '../../src/HCNotification/HCNotification';

beforeEach(() => {
    const mockIntersectionObserver = vitest.fn();
    mockIntersectionObserver.mockReturnValue({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null,
    });
    window.ResizeObserver = mockIntersectionObserver;
    window.IntersectionObserver = mockIntersectionObserver;
});

it('should test a default HCNotification: Info', () => {
    const result = render(
        <HCStyledProvider>
            <HCNotification iconColor={'#313131'} hcVariant={'info'} message={'Basic message for notification.'} standalone fullWidth />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCNotification: Loading', () => {
    const result = render(
        <HCStyledProvider>
            <HCNotification iconColor={'#313131'} hcVariant={'loading'} message={'Basic message for notification.'} standalone fullWidth />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCNotification: Success', () => {
    const result = render(
        <HCStyledProvider>
            <HCNotification iconColor={'#313131'} hcVariant={'success'} message={'Basic message for notification.'} standalone fullWidth />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCNotification: Danger', () => {
    const result = render(
        <HCStyledProvider>
            <HCNotification iconColor={'#313131'} hcVariant={'danger'} message={'Basic message for notification.'} standalone fullWidth />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCNotification: Failure', () => {
    const result = render(
        <HCStyledProvider>
            <HCNotification iconColor={'#313131'} hcVariant={'failure'} message={'Basic message for notification.'} standalone fullWidth />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCNotification: Warning', () => {
    const result = render(
        <HCStyledProvider>
            <HCNotification iconColor={'#313131'} hcVariant={'warning'} message={'Basic message for notification.'} standalone fullWidth />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
