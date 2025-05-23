
import { Action, ActionType, State, Toast, ToastProps } from "./toast-types";
import { addToRemoveQueue } from "./toast-utils";
import { ReactNode } from "react";

export const TOAST_LIMIT = 20;
export const TOAST_REMOVE_DELAY = 1000000;

export let memoryState: State = { toasts: [] };

export let listeners: Array<(state: State) => void> = [];

export const dispatch = (action: Action) => {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case ActionType.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case ActionType.DISMISS_TOAST: {
      const { id } = action;

      // Side effects
      if (id) {
        addToRemoveQueue(id);
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === id || id === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }

    case ActionType.REMOVE_TOAST:
      if (action.id === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.id),
      };

    default:
      return state;
  }
};

const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const toast = (props: ToastProps) => {
  const id = props.id || generateId();
  
  const update = (updatedProps: ToastProps) =>
    dispatch({
      type: ActionType.UPDATE_TOAST,
      toast: { ...updatedProps, id },
    });

  const dismiss = () => dispatch({ type: ActionType.DISMISS_TOAST, id });

  // Create a complete Toast object with required 'open' and 'onOpenChange' properties
  const newToast: Toast = {
    ...props,
    id,
    open: true,
    onOpenChange: (open) => {
      if (!open) dismiss();
    },
  };

  dispatch({
    type: ActionType.ADD_TOAST,
    toast: newToast,
  });

  return {
    id,
    dismiss,
    update,
  };
};

export const success = (props: ToastProps) => {
  return toast({ ...props, variant: "success" });
};

export const error = (props: ToastProps) => {
  return toast({ ...props, variant: "destructive" });
};

export const warning = (props: ToastProps) => {
  return toast({ ...props, variant: "warning" });
};

export const networkError = (props: ToastProps) => {
  return toast({ ...props, variant: "network-error" });
};
