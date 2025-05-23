
import { Dispatch } from "react";

export enum ActionType {
  ADD_TOAST = "ADD_TOAST",
  UPDATE_TOAST = "UPDATE_TOAST",
  DISMISS_TOAST = "DISMISS_TOAST",
  REMOVE_TOAST = "REMOVE_TOAST",
}

export const TOAST_LIMIT = 20;
export const TOAST_REMOVE_DELAY = 5000;
export const NETWORK_ERROR_TOAST_ID = "network-error";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "warning" | "network-error";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "warning" | "network-error";
}

export interface State {
  toasts: Toast[];
}

export interface Action {
  type: ActionType;
  toast?: Toast;
  id?: string;
}

export type ToastApi = {
  toast: (props: ToastProps) => { id: string; dismiss: () => void; update: (props: ToastProps) => void };
  dismiss: (id?: string) => void;
  error: (props: ToastProps) => { id: string; dismiss: () => void; update: (props: ToastProps) => void };
  success: (props: ToastProps) => { id: string; dismiss: () => void; update: (props: ToastProps) => void };
  warning: (props: ToastProps) => { id: string; dismiss: () => void; update: (props: ToastProps) => void };
  networkError: (props: ToastProps) => { id: string; dismiss: () => void; update: (props: ToastProps) => void };
};

// Export dispatch function type
export const dispatch: Dispatch<Action> = (action: Action) => {};
