import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCTextField} from '../../src/HCTextField';
import {HCIcon} from '../../src/HCIcon';

it('should test a default HCTextField', () => {
    const result = render(
        <HCStyledProvider>
            <HCTextField
                label={'Basic TextField'}
                type={'text'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCTextField Placeholder', () => {
    const result = render(
        <HCStyledProvider>
            <HCTextField
                label={'Basic TextField'}
                type={'text'}
                inputProps={{
                    placeholder: 'Basic Placeholder'
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCTextField Required', () => {
    const result = render(
        <HCStyledProvider>
            <HCTextField
                label={'Basic TextField'}
                type={'text'}
                required
                inputProps={{
                    placeholder: 'Basic Placeholder'
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCTextField Helper Text', () => {
    const result = render(
        <HCStyledProvider>
            <HCTextField
                label={'Basic TextField'}
                type={'text'}
                helperText={'Some Helper Text'}
                inputProps={{
                    placeholder: 'Basic Placeholder'
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCTextField Error Text', () => {
    const result = render(
        <HCStyledProvider>
            <HCTextField
                label={'Basic TextField'}
                type={'text'}
                errorText={'Some Error Text'}
                inputProps={{
                    placeholder: 'Basic Placeholder'
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCTextField Helper & Error Text', () => {
    const result = render(
        <HCStyledProvider>
            <HCTextField
                label={'Basic TextField'}
                type={'text'}
                helperText={'Some Helper Text'}
                errorText={'Some Error Text'}
                inputProps={{
                    placeholder: 'Basic Placeholder'
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCTextField with Icons Start & End', () => {
    const result = render(
        <HCStyledProvider>
            <HCTextField
                label={'Basic TextField'}
                type={'text'}
                inputProps={{
                    placeholder: 'Basic Placeholder',
                    startAdornment: <HCIcon icon={'ActionIcon'} />,
                    endAdornment: <HCIcon icon={'GridIcon'} />
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCTextField with Icon Start', () => {
    const result = render(
        <HCStyledProvider>
            <HCTextField
                label={'Basic TextField'}
                type={'text'}
                inputProps={{
                    placeholder: 'Basic Placeholder',
                    startAdornment: <HCIcon icon={'ActionIcon'} />
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCTextField with Icon End', () => {
    const result = render(
        <HCStyledProvider>
            <HCTextField
                label={'Basic TextField'}
                type={'text'}
                inputProps={{
                    placeholder: 'Basic Placeholder',
                    endAdornment: <HCIcon icon={'GridIcon'} />
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCTextField with Button End', () => {
    const result = render(
        <HCStyledProvider>
            <HCTextField
                label={'Basic TextField'}
                type={'text'}
                inputProps={{
                    placeholder: 'Basic Placeholder',
                    endAdornment: <button onClick={() => {}}>
                        <HCIcon icon={'Calendar1'}/>
                    </button>
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCTextField Multiline (TextArea)', () => {
    const result = render(
        <HCStyledProvider>
            <HCTextField
                label={'Basic TextField'}
                type={'textArea'}
                inputProps={{
                    placeholder: 'Basic Placeholder'
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCTextField Multiline (TextArea) Required - 4 Rows', () => {
    const result = render(
        <HCStyledProvider>
            <HCTextField
                label={'Basic TextField'}
                type={'textArea'}
                required
                inputProps={{
                    placeholder: 'Basic Placeholder'
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCTextField Multiline (TextArea) Required - 8 Rows', () => {
    const result = render(
        <HCStyledProvider>
            <HCTextField
                label={'Basic TextField'}
                type={'textArea'}
                required
                inputProps={{
                    placeholder: 'Basic Placeholder',
                    rows: 8
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
