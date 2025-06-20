import type { Meta, StoryObj } from '@storybook/react';

import {HCContextFrameMD} from './HCContextFrameMD';
import {getStoryDescription} from '../utils';

const meta = {
    title: 'Components/HCContextFrameMD',
    component: HCContextFrameMD,
    parameters: getStoryDescription('component', '## About\nHCContextFrameMD.\n')
} satisfies Meta<typeof HCContextFrameMD>;

export default meta;

type Story = StoryObj<typeof HCContextFrameMD>;


const content = `
# 🔍 Search Results
### 2023-01-26 | Getting Started with TRUECHART4QLIKVIEW | 0.7334863 
[https://hicogroupconfluence.atlassian.net/wiki/spaces/tckb/pages/329867/Getting+Started+with+TRUECHART4QLIKVIEW](https://hicogroupconfluence.atlassian.net/wiki/spaces/tckb/pages/329867/Getting+Started+with+TRUECHART4QLIKVIEW) 
---------------
 
### 2024-06-20T14:22:33Z | Event Agenda v2 (1).pdf | 0.7320554 
[https://highcoordinationde.sharepoint.com/sites/Hicohome/Shared%20Documents/012-Events-Trainings-Webinars/Events/2019/06-13_Witside_AI-in-Action_Athen/Event%20Agenda%20v2%20(1).pdf](https://highcoordinationde.sharepoint.com/sites/Hicohome/Shared%20Documents/012-Events-Trainings-Webinars/Events/2019/06-13_Witside_AI-in-Action_Athen/Event%20Agenda%20v2%20(1).pdf) 
---------------
 
### 2025-02-03T10:01:55Z | 2501_HICO News January 2025.pdf | 0.7292739 
[https://highcoordinationde.sharepoint.com/sites/Hicohome/Shared%20Documents/002-News/2025/2501_HICO%20News%20January%202025.pdf](https://highcoordinationde.sharepoint.com/sites/Hicohome/Shared%20Documents/002-News/2025/2501_HICO%20News%20January%202025.pdf) 
---------------
 
### 2024-04-29T15:06:45Z | Success Story Voit EN V1.pdf | 0.7287921 
[https://highcoordinationde.sharepoint.com/sites/Hicohome/Shared%20Documents/011-Success-Stories-Marketing/Voit/02_Case%20Study_EN/Success%20Story%20Voit%20EN%20V1.pdf](https://highcoordinationde.sharepoint.com/sites/Hicohome/Shared%20Documents/011-Success-Stories-Marketing/Voit/02_Case%20Study_EN/Success%20Story%20Voit%20EN%20V1.pdf) 
---------------
 
### 2024-11-11T11:41:10Z | Voit_Quotes_Agreed.docx | 0.7266804 
[https://highcoordinationde.sharepoint.com/sites/Hicohome/_layouts/15/Doc.aspx?sourcedoc=%7B6F577A63-24C5-4E92-BE3E-2529F80C2BB8%7D&file=Voit_Quotes_Agreed.docx&action=default&mobileredirect=true](https://highcoordinationde.sharepoint.com/sites/Hicohome/_layouts/15/Doc.aspx?sourcedoc=%7B6F577A63-24C5-4E92-BE3E-2529F80C2BB8%7D&file=Voit_Quotes_Agreed.docx&action=default&mobileredirect=true) 
---------------
`;

export  const BasicHCContextFrameMD: Story = {
    args: {
        content,
    },
};