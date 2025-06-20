import {beforeEach, expect, it, vitest} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCLoader} from '../../src/HCLoader';

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

it('should test a default HCLoader', () => {
    const result = render(
        <HCStyledProvider>
            <HCLoader className="HCLoader" />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
