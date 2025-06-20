import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCCodeEditor} from '../../src/HCCodeEditor';


it('should test a default HCCodeEditor', () => {
    const result = render(
        <HCStyledProvider>
            <HCCodeEditor
                label={'Code Editor'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
