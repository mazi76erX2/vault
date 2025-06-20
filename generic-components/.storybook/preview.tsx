import {Preview} from "@storybook/react";
import {HCStyledProvider} from '../src/HCStyledProvider/HCStyledProvider';
import {Toaster} from 'react-hot-toast';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
        <HCStyledProvider>
          <Toaster position={'bottom-left'} />
          <Story />
        </HCStyledProvider>
    )
  ],
};

export default preview;
