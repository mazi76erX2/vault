import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCCheckBox} from '../../src/HCCheckBox';
import {CheckBoxSize} from '../../src/theme';

it('should test a HCCheckBox Primary Checked', () => {
    const result = render(
        <HCStyledProvider>
            <HCCheckBox
                hcType={{
                    type: 'single',
                    checked: true
                }}
                label={'Checked'}
                hcVariant={'primary'} />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCCheckBox Primary Unchecked', () => {
    const result = render(
        <HCStyledProvider>
            <HCCheckBox
                hcType={{
                    type: 'single',
                    checked: false
                }}
                label={'Unchecked'}
                hcVariant={'primary'} />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCCheckBox Neutral Checked', () => {
    const result = render(
        <HCStyledProvider>
            <HCCheckBox
                hcType={{
                    type: 'single',
                    checked: true
                }}
                label={'Checked'}
                hcVariant={'neutral'} />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCCheckBox Neutral Unchecked', () => {
    const result = render(
        <HCStyledProvider>
            <HCCheckBox
                hcType={{
                    type: 'single',
                    checked: false
                }}
                label={'Checked'}
                hcVariant={'neutral'} />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCCheckBox Primary Checked Disabled', () => {
    const result = render(
        <HCStyledProvider>
            <HCCheckBox
                hcType={{
                    type: 'single',
                    checked: true
                }}
                disabled
                label={'Checked'}
                hcVariant={'primary'} />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCCheckBox Primary Unchecked Disabled', () => {
    const result = render(
        <HCStyledProvider>
            <HCCheckBox
                hcType={{
                    type: 'single',
                    checked: false
                }}
                disabled
                label={'Unchecked'}
                hcVariant={'primary'} />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCCheckBox Group Primary Checked', () => {
    const result = render(
        <HCStyledProvider>
            <HCCheckBox
                hcType={{
                    type: 'group',
                    options: [
                        {
                            checked: true,
                            disabled: true,
                            id: 'checkbox1',
                            label: 'Disabled'
                        },
                        {
                            checked: false,
                            disabled: true,
                            id: 'checkbox2',
                            label: 'Disabled - Unchecked'
                        },
                        {
                            checked: true,
                            id: 'checkbox3',
                            label: 'Active'
                        },
                        {
                            id: 'checkbox4',
                            label: 'Inactive'
                        }
                    ]
                }}
                label={'Group Primary'}
                hcVariant={'primary'} />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCCheckBox Group Neutral Checked', () => {
    const result = render(
        <HCStyledProvider>
            <HCCheckBox
                hcType={{
                    type: 'group',
                    options: [
                        {
                            checked: true,
                            disabled: true,
                            id: 'checkbox1',
                            label: 'Disabled'
                        },
                        {
                            checked: false,
                            disabled: true,
                            id: 'checkbox2',
                            label: 'Disabled - Unchecked'
                        },
                        {
                            checked: true,
                            id: 'checkbox3',
                            label: 'Active'
                        },
                        {
                            id: 'checkbox4',
                            label: 'Inactive'
                        }
                    ]
                }}
                label={'Group Neutral'}
                hcVariant={'neutral'} />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCCheckBox Small Primary', () => {
    const result = render(
        <HCStyledProvider>
            <HCCheckBox
                hcType={{
                    type: 'single',
                    checked: false
                }}
                size={CheckBoxSize.Small}
                label={'Small'}
                hcVariant={'primary'} />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCCheckBox Medium Primary', () => {
    const result = render(
        <HCStyledProvider>
            <HCCheckBox
                hcType={{
                    type: 'single',
                    checked: false
                }}
                size={CheckBoxSize.Medium}
                label={'Small'}
                hcVariant={'primary'} />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCCheckBox Large Primary', () => {
    const result = render(
        <HCStyledProvider>
            <HCCheckBox
                hcType={{
                    type: 'single',
                    checked: false
                }}
                size={CheckBoxSize.Large}
                label={'Small'}
                hcVariant={'primary'} />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCCheckBox Small Neutral', () => {
    const result = render(
        <HCStyledProvider>
            <HCCheckBox
                hcType={{
                    type: 'single',
                    checked: false
                }}
                size={CheckBoxSize.Small}
                label={'Small'}
                hcVariant={'neutral'} />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCCheckBox Medium Neutral', () => {
    const result = render(
        <HCStyledProvider>
            <HCCheckBox
                hcType={{
                    type: 'single',
                    checked: false
                }}
                size={CheckBoxSize.Medium}
                label={'Small'}
                hcVariant={'neutral'} />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCCheckBox Large Neutral', () => {
    const result = render(
        <HCStyledProvider>
            <HCCheckBox
                hcType={{
                    type: 'single',
                    checked: false
                }}
                size={CheckBoxSize.Large}
                label={'Small'}
                hcVariant={'neutral'} />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
