import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {
    HCNotationManualColourItem,
    HCNotationManualTextItem,
    HCNotationManualVisualItem
} from '../../src/HCNotationManualBasic';

it('should test a default HCNotationManualColourItem', () => {
    const result = render(
        <HCStyledProvider>
            <HCNotationManualColourItem
                label={'Color Item Label'}
                value={{
                    normal: '#FF0000',
                    colourBlind: '#FF0000'
                }}
                id={'past'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCNotationManualTextItem', () => {
    const result = render(
        <HCStyledProvider>
            <HCNotationManualTextItem
                label={'Text Item Label'}
                onChange={() => {}}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCNotationManualTextItem Bold', () => {
    const result = render(
        <HCStyledProvider>
            <HCNotationManualTextItem
                label={'Text Item Label'}
                onChange={() => {}}
                isBold={true}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCNotationManualTextItem Italic', () => {
    const result = render(
        <HCStyledProvider>
            <HCNotationManualTextItem
                label={'Text Item Label'}
                onChange={() => {}}
                isItalic={true}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCNotationManualTextItem Bold Italic', () => {
    const result = render(
        <HCStyledProvider>
            <HCNotationManualTextItem
                label={'Text Item Label'}
                onChange={() => {}}
                isBold={true}
                isItalic={true}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCNotationManualTextItem Disabled', () => {
    const result = render(
        <HCStyledProvider>
            <HCNotationManualTextItem
                label={'Text Item Label'}
                onChange={() => {}}
                disabled={true}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCNotationManualVisualItem', () => {
    const result = render(
        <HCStyledProvider>
            <HCNotationManualVisualItem
                label={'Visual Item label'}
                items={[
                    {
                        id: 'Item1',
                        value: 'Item 1'
                    },
                    {
                        id: 'Item2',
                        value: 'Item 2'
                    },
                    {
                        id: 'Item3',
                        value: 'Item 3'
                    }
                ]}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCNotationManualVisualItem with Selected Item', () => {
    const result = render(
        <HCStyledProvider>
            <HCNotationManualVisualItem
                label={'Visual Item label'}
                items={[
                    {
                        id: 'Item1',
                        value: 'Item 1'
                    },
                    {
                        id: 'Item2',
                        value: 'Item 2'
                    },
                    {
                        id: 'Item3',
                        value: 'Item 3'
                    }
                ]}
                value={{
                    id: 'Item2',
                    value: 'Item 2'
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
