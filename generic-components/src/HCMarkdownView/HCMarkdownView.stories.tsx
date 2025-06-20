import type { Meta, StoryObj } from '@storybook/react';

import {HCMarkdownView} from './HCMarkdownView';
import {getStoryDescription} from '../utils';

const meta = {
    title: 'Components/HCMarkdownView',
    component: HCMarkdownView,
    parameters: getStoryDescription('component', '## About\nHCMarkdownView.\n')
} satisfies Meta<typeof HCMarkdownView>;

export default meta;

type Story = StoryObj<typeof HCMarkdownView>;


const content = `
To create a new Table 2.0 visualization in TRUECHART, follow these steps:\n\n1. **Select the TRUECHART Object**: Start with an initial TRUECHART object or choose a grid cell where you want to create the table.\n\n2. **Choose Table Visualization**: In the cell type selector, select "Table" from the options available below the chart or commenting section.\n\n3. **Ensure Dimensions and Measures**: The table elements will be disabled unless at least one dimension and one measure are available for the TRUECHART object.\n\n4. **Create Initial Legacy Table**: After selecting the table visualization, a legacy table will be created initially.\n\n5. **Activate Table 2.0**: To switch to the new Table 2.0, click the toggle at the top of the table settings.\n\n6. **Adjust Settings**: Once the new table is activated, you can configure various settings related to dimensions and measures as needed.\n\nBy following these steps, you can successfully create and configure a new table in TRUECHART.
`;
export  const BasicHCMarkdownView: Story = {
    args: {
        content,
    },
};