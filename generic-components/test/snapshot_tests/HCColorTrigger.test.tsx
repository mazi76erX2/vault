import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCColorTrigger} from '../../src/HCColorPicker/components';
import {HCIcon} from '../../src/HCIcon';

it('should test a default HCColorTrigger', () => {
    const result = render(
        <HCStyledProvider>
            <HCColorTrigger
                onClick={() => {}}
                selectedColor={'#232323'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCColorTrigger Small', () => {
    const result = render(
        <HCStyledProvider>
            <HCColorTrigger
                onClick={() => {}}
                selectedColor={'#232323'}
                size={'small'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCColorTrigger Medium', () => {
    const result = render(
        <HCStyledProvider>
            <HCColorTrigger
                onClick={() => {}}
                selectedColor={'#232323'}
                size={'medium'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCColorTrigger Large', () => {
    const result = render(
        <HCStyledProvider>
            <HCColorTrigger
                onClick={() => {}}
                selectedColor={'#232323'}
                size={'large'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCColorTrigger Vertical True', () => {
    const result = render(
        <HCStyledProvider>
            <HCColorTrigger
                onClick={() => {}}
                selectedColor={'#232323'}
                label={'Vertical True'}
                vertical={true}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCColorTrigger Custom Icon', () => {
    const result = render(
        <HCStyledProvider>
            <HCColorTrigger
                onClick={() => {}}
                selectedColor={'#232323'}
                label={'Vertical True'}
                customIcon={<HCIcon icon={'CellSettings'}/>}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
