
export interface Toast {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

export type ToastProps = Omit<Toast, "id">;

export interface State {
  toasts: Toast[];
}

export interface ToastApi {
  toast: (props: ToastProps) => void;
  dismiss: (toastId?: string) => void;
  error: (props: Omit<ToastProps, "variant">) => void;
  success: (props: Omit<ToastProps, "variant">) => void;
  warning: (props: Omit<ToastProps, "variant">) => void;
  networkError: (props?: Omit<ToastProps, "variant" | "title" | "description">) => void;
}

export type Action =
  | {
      type: "ADD_TOAST";
      toast: Toast;
    }
  | {
      type: "UPDATE_TOAST";
      toast: Partial<Toast>;
      id: string;
    }
  | {
      type: "DISMISS_TOAST";
      toastId?: string;
    }
  | {
      type: "REMOVE_TOAST";
      toastId?: string;
    };

export const TOAST_LIMIT = 5;

export const TOAST_REMOVE_DELAY = 1000000;

export const NETWORK_ERROR_TOAST_ID = 'network-error';
