import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCRadioButton, HCRadioButtonOption} from '../../src/HCRadioButton';
import {CheckBoxSize} from '../../src/theme';

const options: HCRadioButtonOption[] = [
    {
        disabled: true,
        id: 'RadioButton1',
        label: 'Disabled'
    },
    {
        disabled: true,
        id: 'RadioButton2',
        label: 'Disabled - Unchecked'
    },
    {
        id: 'RadioButton3',
        label: 'Active'
    },
    {
        id: 'RadioButton4',
        label: 'Inactive'
    }
];

it('should test a default HCRadioButton Single Primary', () => {
    const result = render(
        <HCStyledProvider>
            <HCRadioButton
                hcType={{
                    type: 'single'
                }}
                label={'Single primary RadioButton'}
                hcVariant={'primary'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCRadioButton Single Neutral', () => {
    const result = render(
        <HCStyledProvider>
            <HCRadioButton
                hcType={{
                    type: 'single'
                }}
                label={'Single neutral RadioButton'}
                hcVariant={'neutral'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCRadioButton Single Neutral Checked', () => {
    const result = render(
        <HCStyledProvider>
            <HCRadioButton
                hcType={{
                    type: 'single',
                    checked: true
                }}
                label={'Single neutral RadioButton'}
                hcVariant={'neutral'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCRadioButton Single Primary Disabled', () => {
    const result = render(
        <HCStyledProvider>
            <HCRadioButton
                hcType={{
                    type: 'single',
                    disabled: true
                }}
                label={'Single primary RadioButton'}
                hcVariant={'primary'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCRadioButton Single Primary Disabled Checked', () => {
    const result = render(
        <HCStyledProvider>
            <HCRadioButton
                hcType={{
                    type: 'single',
                    disabled: true,
                    checked: true
                }}
                label={'Single primary RadioButton'}
                hcVariant={'primary'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCRadioButton Group Primary', () => {
    const result = render(
        <HCStyledProvider>
            <HCRadioButton
                hcType={{
                    type: 'group',
                    options: options,
                    name: 'ButtonTest',
                    defaultValue: {
                        disabled: true,
                        id: 'RadioButton1',
                        label: 'Disabled'
                    }
                }}
                label={'Group primary RadioButton'}
                hcVariant={'primary'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCRadioButton Group Primary Row Layout', () => {
    const result = render(
        <HCStyledProvider>
            <HCRadioButton
                hcType={{
                    type: 'group',
                    options: options,
                    name: 'ButtonTest',
                    row: true,
                    defaultValue: {
                        disabled: true,
                        id: 'RadioButton1',
                        label: 'Disabled'
                    }
                }}
                label={'Group primary RadioButton Row Layout'}
                hcVariant={'primary'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCRadioButton Single Primary Small', () => {
    const result = render(
        <HCStyledProvider>
            <HCRadioButton
                hcType={{
                    type: 'single'
                }}
                label={'Single primary RadioButton Small'}
                hcVariant={'primary'}
                size={CheckBoxSize.Small}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCRadioButton Single Primary Medium', () => {
    const result = render(
        <HCStyledProvider>
            <HCRadioButton
                hcType={{
                    type: 'single'
                }}
                label={'Single primary RadioButton Medium'}
                hcVariant={'primary'}
                size={CheckBoxSize.Medium}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCRadioButton Single Primary Large', () => {
    const result = render(
        <HCStyledProvider>
            <HCRadioButton
                hcType={{
                    type: 'single'
                }}
                label={'Single primary RadioButton Large'}
                hcVariant={'primary'}
                size={CheckBoxSize.Large}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
