
import * as React from "react";
import type { ToastActionElement } from "@/components/ui/toast";

export type ToastProps = {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive" | "warning" | "success";
  open?: boolean;
  duration?: number;
};

export type ToasterToast = Required<Pick<ToastProps, "id">> & ToastProps & {
  open: boolean;
};

export interface State {
  toasts: ToasterToast[];
}

export const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

export type ActionType = typeof actionTypes;

export type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: string;
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: string;
    };

export type ToastApi = {
  toast: (props: ToastProps) => {
    id: string;
    dismiss: () => void;
    update: (props: ToastProps) => void;
  };
  dismiss: (toastId?: string) => void;
  error: (title: string, message: string) => void;
  success: (title: string, message: string) => void;
  warning: (title: string, message: string) => void;
  networkError: () => void;
};

export const TOAST_LIMIT = 5;
export const TOAST_REMOVE_DELAY = 5000; // Default toast time: 5 seconds
export const NETWORK_ERROR_TOAST_ID = 'network-error-toast';
