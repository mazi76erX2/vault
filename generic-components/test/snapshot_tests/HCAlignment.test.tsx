import React from 'react';
import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCAlignment, HCAlignmentOptions} from '../../src/HCAlignment';

const alignmentOptions: HCAlignmentOptions[] = [
    {
        id: 'top',
        value: true,
        disabled: false
    },
    {
        id: 'bottom',
        value: true,
        disabled: false
    },
    {
        id: 'center',
        value: true,
        disabled: false
    },
    {
        id: 'left',
        value: true,
        disabled: false
    },
    {
        id: 'right',
        value: true,
        disabled: false
    }
];

/** Vertical Alignment **/

it('should test a HCAlignment Vertical Top', () => {
    const result = render(
        <HCAlignment
            alignment={'vertical'}
            selectedOption={'top'}
            options={alignmentOptions}
            onChange={() => {}}
        />
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCAlignment Vertical Top hasTooltip', () => {
    const result = render(
        <HCAlignment
            alignment={'vertical'}
            selectedOption={'top'}
            options={alignmentOptions}
            onChange={() => {}}
            hasToolTip={true}
        />
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCAlignment Vertical Center', () => {
    const result = render(
        <HCAlignment
            alignment={'vertical'}
            selectedOption={'center'}
            options={alignmentOptions}
            onChange={() => {}}
        />
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCAlignment Vertical Bottom', () => {
    const result = render(
        <HCAlignment
            alignment={'vertical'}
            selectedOption={'bottom'}
            options={alignmentOptions}
            onChange={() => {}}
        />
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCAlignment Vertical Left', () => {
    const result = render(
        <HCAlignment
            alignment={'vertical'}
            selectedOption={'left'}
            options={alignmentOptions}
            onChange={() => {}}
        />
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCAlignment Vertical Right', () => {
    const result = render(
        <HCAlignment
            alignment={'vertical'}
            selectedOption={'right'}
            options={alignmentOptions}
            onChange={() => {}}
        />
    );

    expect(result).toMatchSnapshot();
});

/** Horizontal Alignment **/

it('should test a HCAlignment Horizontal Top', () => {
    const result = render(
        <HCAlignment
            alignment={'horizontal'}
            selectedOption={'top'}
            options={alignmentOptions}
            onChange={() => {}}
        />
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCAlignment Horizontal Center', () => {
    const result = render(
        <HCAlignment
            alignment={'horizontal'}
            selectedOption={'center'}
            options={alignmentOptions}
            onChange={() => {}}
        />
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCAlignment Horizontal Bottom', () => {
    const result = render(
        <HCAlignment
            alignment={'horizontal'}
            selectedOption={'bottom'}
            options={alignmentOptions}
            onChange={() => {}}
        />
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCAlignment Horizontal Left', () => {
    const result = render(
        <HCAlignment
            alignment={'horizontal'}
            selectedOption={'left'}
            options={alignmentOptions}
            onChange={() => {}}
        />
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCAlignment Horizontal Right', () => {
    const result = render(
        <HCAlignment
            alignment={'horizontal'}
            selectedOption={'right'}
            options={alignmentOptions}
            onChange={() => {}}
        />
    );

    expect(result).toMatchSnapshot();
});

/** Horizontal Alignment **/

it('should test a HCAlignment Position Top', () => {
    const result = render(
        <HCAlignment
            alignment={'position'}
            selectedOption={'top'}
            options={alignmentOptions}
            onChange={() => {}}
        />
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCAlignment Position Center', () => {
    const result = render(
        <HCAlignment
            alignment={'position'}
            selectedOption={'center'}
            options={alignmentOptions}
            onChange={() => {}}
        />
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCAlignment Position Bottom', () => {
    const result = render(
        <HCAlignment
            alignment={'position'}
            selectedOption={'bottom'}
            options={alignmentOptions}
            onChange={() => {}}
        />
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCAlignment Position Left', () => {
    const result = render(
        <HCAlignment
            alignment={'position'}
            selectedOption={'left'}
            options={alignmentOptions}
            onChange={() => {}}
        />
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCAlignment Position Right', () => {
    const result = render(
        <HCAlignment
            alignment={'position'}
            selectedOption={'right'}
            options={alignmentOptions}
            onChange={() => {}}
        />
    );

    expect(result).toMatchSnapshot();
});
