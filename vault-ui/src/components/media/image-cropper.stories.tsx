import type { Meta, StoryObj } from '@storybook/react';
import { ImageCropper } from './image-cropper';

const meta = {
  title: 'Media/ImageCropper',
  component: ImageCropper,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ImageCropper>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleImage = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';

export const Default: Story = {
  args: {
    label: 'Crop Profile Picture',
    image: sampleImage,
  },
};

export const Square: Story = {
  args: {
    label: 'Square Crop',
    image: sampleImage,
    aspect: 1,
  },
};

export const Round: Story = {
  args: {
    label: 'Round Crop',
    image: sampleImage,
    aspect: 1,
    cropShape: 'round',
  },
};

export const Portrait: Story = {
  args: {
    label: 'Portrait Crop',
    image: sampleImage,
    aspect: 9 / 16,
  },
};
