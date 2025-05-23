import { Toast, Action, State, TOAST_LIMIT, ToastProps } from "./toast-types";
import { addToRemoveQueue } from "./toast-utils";
import { v4 as uuidv4 } from "uuid";

export const listeners: Array<(state: State) => void> = [];
export const memoryState: State = { toasts: [] };

export const dispatch = (action: Action) => {
  memoryState.toasts = reducer(memoryState.toasts, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
};

export const toast = (props: ToastProps) => {
  const id = props.id || uuidv4();

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      duration: props.duration || 5000,
    },
  });

  return {
    id,
    dismiss: () => dismiss(id),
    update: (props: ToastProps) => update(id, props),
  };
};

export const error = (props: Omit<ToastProps, "variant">) => {
  return toast({ ...props, variant: "destructive" });
};

export const success = (props: Omit<ToastProps, "variant">) => {
  return toast({ ...props, variant: "success" });
};

export const warning = (props: Omit<ToastProps, "variant">) => {
  return toast({ ...props, variant: "warning" });
};

export const networkError = (props?: Omit<ToastProps, "variant" | "title" | "description">) => {
  return toast({
    title: "Network Error",
    description: "Please check your internet connection and try again.",
    variant: "destructive",
    ...props,
  });
};

export const dismiss = (toastId?: string) => {
  dispatch({ type: "DISMISS_TOAST", toastId });
};

export const update = (id: string, props: ToastProps) => {
  dispatch({
    type: "UPDATE_TOAST",
    toast: { ...props },
    id,
  });
};

const reducer = (toasts: Toast[], action: Action): Toast[] => {
  switch (action.type) {
    case "ADD_TOAST":
      return [action.toast, ...toasts].slice(0, TOAST_LIMIT);

    case "UPDATE_TOAST":
      return toasts.map((t) =>
        t.id === action.id ? { ...t, ...action.toast } : t
      );

    case "DISMISS_TOAST": {
      const { toastId } = action;

      // If no ID was provided, dismiss all toasts
      if (toastId === undefined) {
        return toasts.map((t) => ({
          ...t,
          duration: 0,
        }));
      }

      // Otherwise, dismiss the toast with the matching ID
      return toasts.map((t) =>
        t.id === toastId ? { ...t, duration: 0 } : t
      );
    }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return [];
      }
      return toasts.filter((t) => t.id !== action.toastId);

    default:
      return toasts;
  }
};
