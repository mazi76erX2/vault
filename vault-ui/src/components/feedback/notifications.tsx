import { toast } from "sonner";

export interface NotificationOptions {
  duration?: number;
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
}

export const notification = {
  success: (message: string, options?: NotificationOptions) => {
    toast.success(message, {
      duration: options?.duration ?? 3000,
      position: options?.position ?? "bottom-left",
    });
  },

  error: (message: string, options?: NotificationOptions) => {
    toast.error(message, {
      duration: options?.duration ?? 4000,
      position: options?.position ?? "bottom-left",
    });
  },

  info: (message: string, options?: NotificationOptions) => {
    toast.info(message, {
      duration: options?.duration ?? 3000,
      position: options?.position ?? "bottom-left",
    });
  },

  warning: (message: string, options?: NotificationOptions) => {
    toast.warning(message, {
      duration: options?.duration ?? 3000,
      position: options?.position ?? "bottom-left",
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
  ) => toast.promise(promise, messages),
};
