import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { Plus, Save, Trash2 } from "lucide-react";

const meta = {
  title: "Components/Forms/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile button component built on shadcn/ui with loading states and icon support.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    hcVariant: {
      control: "select",
      options: ["primary", "secondary", "tertiary"],
      description: "The visual variant of the button",
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
      description: "The size of the button",
    },
    loading: {
      control: "boolean",
      description: "Shows loading spinner",
    },
    disabled: {
      control: "boolean",
      description: "Disables the button",
    },
    outlined: {
      control: "boolean",
      description: "Shows outlined variant",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "Primary Button",
    hcVariant: "primary",
    size: "medium",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary Button",
    hcVariant: "secondary",
    size: "medium",
  },
};

export const Tertiary: Story = {
  args: {
    children: "Tertiary Button",
    hcVariant: "tertiary",
    size: "medium",
  },
};

export const PrimaryOutlined: Story = {
  args: {
    children: "Outlined Button",
    hcVariant: "primary",
    outlined: true,
    size: "medium",
  },
};

export const WithStartIcon: Story = {
  args: {
    children: "Add User",
    hcVariant: "primary",
    startIcon: <Plus className="h-4 w-4" />,
  },
};

export const WithEndIcon: Story = {
  args: {
    children: "Save",
    hcVariant: "primary",
    endIcon: <Save className="h-4 w-4" />,
  },
};

export const IconOnly: Story = {
  args: {
    hcVariant: "primary",
    children: <Trash2 className="h-4 w-4" />,
    className: "w-10 h-10 p-0",
  },
};

export const Loading: Story = {
  args: {
    children: "Saving...",
    loading: true,
    loadingText: "Please wait",
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled Button",
    disabled: true,
  },
};

export const Small: Story = {
  args: {
    children: "Small Button",
    size: "small",
  },
};

export const Large: Story = {
  args: {
    children: "Large Button",
    size: "large",
  },
};

// Interactive example
export const Interactive: Story = {
  render: () => {
    const [loading, setLoading] = React.useState(false);

    const handleClick = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    };

    return (
      <Button
        hcVariant="primary"
        loading={loading}
        onClick={handleClick}
        loadingText="Saving..."
      >
        Click Me
      </Button>
    );
  },
};
