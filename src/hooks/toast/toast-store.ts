import { v4 as uuidv4 } from "uuid";
import { Action, TOAST_LIMIT, ToastProps, State, NETWORK_ERROR_TOAST_ID } from "./toast-types";
import { reducer } from "./toast-reducer";
import { addToRemoveQueue } from "./toast-utils";

export const listeners: Array<(state: State) => void> = [];

export let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

export function toast(props: ToastProps) {
  const id = uuidv4();
  const { duration = 5000, ...restProps } = props;

  const update = (props: ToastProps) => {
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
      id,
    });
  };

  const dismiss = () => {
    dispatch({ type: "DISMISS_TOAST", toastId: id });
  };

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...restProps,
      id,
      duration,
      onDismiss: dismiss,
      onUpdate: update,
    },
  });

  return {
    id,
    dismiss,
    update,
  };
}

export function error(props: Omit<ToastProps, "variant">) {
  return toast({ ...props, variant: "destructive" });
}

export function success(props: Omit<ToastProps, "variant">) {
  return toast({ ...props, variant: "success" });
}

export function warning(props: Omit<ToastProps, "variant">) {
  return toast({ ...props, variant: "warning" });
}

export function networkError(props?: Omit<ToastProps, "variant" | "title" | "description">) {
  const existingToast = memoryState.toasts.find(t => t.id === NETWORK_ERROR_TOAST_ID);
  
  if (existingToast) {
    // If the toast already exists, we'll just keep it there
    return { id: NETWORK_ERROR_TOAST_ID, dismiss: () => {} };
  }
  
  return toast({
    id: NETWORK_ERROR_TOAST_ID,
    title: "Conexão Perdida",
    description: "Verifique sua conexão com a internet e tente novamente.",
    variant: "destructive",
    duration: 0, // Keep it visible until dismissed
    ...props,
  });
}
