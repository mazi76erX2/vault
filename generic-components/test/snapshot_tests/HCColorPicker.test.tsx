import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCColorPicker} from '../../src/HCColorPicker';
import {HCIcon} from '../../src/HCIcon';


it('should test a default HCColorPicker', () => {
    const result = render(
        <HCStyledProvider>
            <HCColorPicker

            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCColorPicker with params', () => {
    const result = render(
        <HCStyledProvider>
            <HCColorPicker
                fallbackBackgroundColor="#fff"
                iconColor="#000"
                marginLeft="0px"
                marginRight="0px"
                updateLive
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCColorPicker with a custom icon', () => {
    const result = render(
        <HCStyledProvider>
            <HCColorPicker
                customIcon={<HCIcon icon={'CellSettings'}/>}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCColorPicker with a selected color as background', () => {
    const result = render(
        <HCStyledProvider>
            <HCColorPicker
                fallbackBackgroundColor="#fff"
                iconColor="#000"
                marginLeft="0px"
                marginRight="0px"
                updateLive
                color={'#292929'}
                useSelectedAsBackground={true}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});


