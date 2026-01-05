import type { Meta, StoryObj } from "@storybook/react";
import { User, Settings, Bell, Lock } from "lucide-react";
import React from "react";
import { SegmentTabs } from "./segment-tabs";

const meta = {
  title: "Layout/SegmentTabs",
  component: SegmentTabs,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof SegmentTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const simpleTabs = [
  {
    value: "tab1",
    label: "Tab 1",
    content: <div className="p-4">Content for Tab 1</div>,
  },
  {
    value: "tab2",
    label: "Tab 2",
    content: <div className="p-4">Content for Tab 2</div>,
  },
  {
    value: "tab3",
    label: "Tab 3",
    content: <div className="p-4">Content for Tab 3</div>,
  },
];

const tabsWithIcons = [
  {
    value: "profile",
    label: "Profile",
    icon: <User className="h-4 w-4" />,
    content: <div className="p-4">Profile settings content</div>,
  },
  {
    value: "settings",
    label: "Settings",
    icon: <Settings className="h-4 w-4" />,
    content: <div className="p-4">General settings content</div>,
  },
  {
    value: "notifications",
    label: "Notifications",
    icon: <Bell className="h-4 w-4" />,
    content: <div className="p-4">Notification preferences</div>,
  },
  {
    value: "security",
    label: "Security",
    icon: <Lock className="h-4 w-4" />,
    content: <div className="p-4">Security settings</div>,
  },
];

export const Simple: Story = {
  args: {
    tabs: simpleTabs,
  },
};

export const WithIcons: Story = {
  args: {
    tabs: tabsWithIcons,
  },
};

export const WithDisabled: Story = {
  args: {
    tabs: [
      ...simpleTabs.slice(0, 2),
      {
        value: "disabled",
        label: "Disabled",
        content: <div>This tab is disabled</div>,
        disabled: true,
      },
    ],
  },
};
