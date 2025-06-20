import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCRichEditor} from '../../src/HCRichEditor';

const DEFAULT_CELL_VALUE = '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

it('should test a default HCRichEditor', () => {
    const result = render(
        <HCStyledProvider>
            <HCRichEditor
                editMode={true}
                value={DEFAULT_CELL_VALUE}
                inputBackgroundColor={'#C8C8C8'}
                onValueChange={() => {}}
                onClose={() => {}}
                defaultValue={DEFAULT_CELL_VALUE}
                scale={1}
                fontSize={10}
                fontFamily={'Arial'}
                isBold={false}
                isItalic={false}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCRichEditor ViewOnly', () => {
    const result = render(
        <HCStyledProvider>
            <HCRichEditor
                editMode={false}
                value={DEFAULT_CELL_VALUE}
                inputBackgroundColor={'#C8C8C8'}
                onValueChange={() => {}}
                onClose={() => {}}
                defaultValue={DEFAULT_CELL_VALUE}
                scale={1}
                fontSize={10}
                fontFamily={'Arial'}
                isBold={false}
                isItalic={false}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCRichEditor Toolbar Plugin', () => {
    const result = render(
        <HCStyledProvider>
            <HCRichEditor
                editMode={true}
                value={DEFAULT_CELL_VALUE}
                inputBackgroundColor={'#C8C8C8'}
                onValueChange={() => {}}
                onClose={() => {}}
                defaultValue={DEFAULT_CELL_VALUE}
                scale={1}
                fontSize={10}
                fontFamily={'Arial'}
                isBold={false}
                isItalic={false}
                defaultOpenTools={true}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
