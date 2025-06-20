import {expect, it} from 'vitest';
import React from 'react';
import {render} from '@testing-library/react';
import {HCButton} from '../../src/HCButton';
import {HCIcon} from '../../src/HCIcon';
import {HCStyledProvider} from '../../src/HCStyledProvider';

it('should test a default HCButton Primary', () => {
    const result = render(
        <HCStyledProvider>
            <HCButton
                hcVariant={'primary'}
                text={'Primary'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCButton Secondary', () => {
    const result = render(
        <HCStyledProvider>
            <HCButton
                hcVariant={'secondary'}
                text={'Secondary'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCButton Tertiary', () => {
    const result = render(
        <HCStyledProvider>
            <HCButton
                hcVariant={'tertiary'}
                text={'Tertiary'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCButton Primary Disabled', () => {
    const result = render(
        <HCStyledProvider>
            <HCButton
                hcVariant={'primary'}
                disabled
                text={'Disabled'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a small HCButton Primary', () => {
    const result = render(
        <HCStyledProvider>
            <HCButton
                hcVariant={'primary'}
                text={'Small'}
                size={'small'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a medium HCButton Primary', () => {
    const result = render(
        <HCStyledProvider>
            <HCButton
                hcVariant={'primary'}
                text={'Medium'}
                size={'medium'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a large HCButton Primary', () => {
    const result = render(
        <HCStyledProvider>
            <HCButton
                hcVariant={'primary'}
                text={'Large'}
                size={'large'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCButton Primary with a start icon', () => {
    const result = render(
        <HCStyledProvider>
            <HCButton
                hcVariant={'primary'}
                text={'Start Icon'}
                startIcon={<HCIcon icon={'CellSettings'}/>}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCButton Primary with an end icon', () => {
    const result = render(
        <HCStyledProvider>
            <HCButton
                hcVariant={'primary'}
                text={'End Icon'}
                endIcon={<HCIcon icon={'CellSettings'}/>}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCButton Primary with a start and end icon', () => {
    const result = render(
        <HCStyledProvider>
            <HCButton
                hcVariant={'primary'}
                text={'End Icon'}
                startIcon={<HCIcon icon={'ActionIcon'}/>}
                endIcon={<HCIcon icon={'CellSettings'}/>}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCButton Primary only an icon', () => {
    const result = render(
        <HCStyledProvider>
            <HCButton
                hcVariant={'primary'}
                startIcon={<HCIcon icon={'ActionIcon'}/>}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCButton Secondary only an icon', () => {
    const result = render(
        <HCStyledProvider>
            <HCButton
                hcVariant={'secondary'}
                startIcon={<HCIcon icon={'ActionIcon'}/>}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCButton Tertiary only an icon', () => {
    const result = render(
        <HCStyledProvider>
            <HCButton
                hcVariant={'tertiary'}
                startIcon={<HCIcon icon={'ActionIcon'}/>}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

