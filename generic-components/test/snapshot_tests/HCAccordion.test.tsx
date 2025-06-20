import {expect, it} from 'vitest';
import {HCAccordion} from '../../src/HCAccordion';
import React from 'react';
import {render} from '@testing-library/react';


it('should test a default HCAccordion', () => {
    const result = render(
        <HCAccordion
            title={'Default Accordion'}
        >
            <span>Test Content</span>
        </HCAccordion>
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCAccordion with red title', () => {
    const result = render(
        <HCAccordion
            title={'Default Accordion'}
            titleSx={{
                color: '#ff0000'
            }}
        >
            <span>Test Content</span>
        </HCAccordion>
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCAccordion with red content', () => {
    const result = render(
        <HCAccordion
            title={'Default Accordion'}
            contentSx={{
                color: '#ff0000'
            }}
        >
            <span>Test Content</span>
        </HCAccordion>
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCAccordion with red container', () => {
    const result = render(
        <HCAccordion
            title={'Default Accordion'}
            containerSx={{
                color: '#ff0000'
            }}
        >
            <span>Test Content</span>
        </HCAccordion>
    );

    expect(result).toMatchSnapshot();
});

it('should test a HCAccordion with red header', () => {
    const result = render(
        <HCAccordion
            title={'Default Accordion'}
            headerSx={{
                color: '#ff0000'
            }}
        >
            <span>Test Content</span>
        </HCAccordion>
    );

    expect(result).toMatchSnapshot();
});
