import type { Meta, StoryObj } from "@storybook/react";
import { VoiceRecorder } from "./VoiceRecorder";

const meta: Meta<typeof VoiceRecorder> = {
  title: "Auth/VoiceRecorder",
  component: VoiceRecorder,
  tags: ["autodocs"],
  argTypes: {
    onRecordingComplete: { action: "recordingComplete" },
  },
};

export default meta;
type Story = StoryObj<typeof VoiceRecorder>;

export const Default: Story = {
  args: {},
};
