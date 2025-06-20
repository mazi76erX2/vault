import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCSegmentTabs, HCSegmentTabsItem} from '../../src/HCSegmentTabs';

const options: HCSegmentTabsItem[] = [
    {
        label: 'One',
        render: () => <>One</>
    },
    {
        label: 'Two Long',
        render: () => <>Two</>
    },
    {
        label: 'Three',
        render: () => <>Three</>
    }
];

it('should test a default HCSegmentTabs', () => {
    const result = render(
        <HCStyledProvider>
            <HCSegmentTabs
                items={options}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCSegmentTabs FullWidth', () => {
    const result = render(
        <HCStyledProvider>
            <HCSegmentTabs
                items={options}
                fullWidth
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCSegmentTabs Border', () => {
    const result = render(
        <HCStyledProvider>
            <HCSegmentTabs
                items={options}
                border
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCSegmentTabs FullWidth Border', () => {
    const result = render(
        <HCStyledProvider>
            <HCSegmentTabs
                items={options}
                fullWidth
                border
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCSegmentTabs ActiveIndex 1', () => {
    const result = render(
        <HCStyledProvider>
            <HCSegmentTabs
                items={options}
                activeIndex={1}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCSegmentTabs ActiveIndex 2', () => {
    const result = render(
        <HCStyledProvider>
            <HCSegmentTabs
                items={options}
                activeIndex={2}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
