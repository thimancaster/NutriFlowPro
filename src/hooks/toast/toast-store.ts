
import { State, Action, reducer } from ".";
import { ToastProps, ToasterToast, NETWORK_ERROR_TOAST_ID } from "./toast-types";
import { addToRemoveQueue } from "./toast-utils";

export const listeners: Array<(state: State) => void> = [];
export let memoryState: State = { toasts: [] };

export function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

export function toast(props: ToastProps) {
  const id = props.id || Math.random().toString(36).slice(2, 9);
  const duration = props.duration || 5000; // Default to 5 seconds if not specified
  
  const update = (props: ToastProps) => {
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });
  };

  const dismiss = () => {
    dispatch({ type: "DISMISS_TOAST", toastId: id });
  };

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
    },
  });
  
  // Configure auto-dismiss after specified duration
  addToRemoveQueue(id, duration);

  return {
    id,
    dismiss,
    update,
  };
}

export function error(title: string, message: string) {
  return toast({
    title,
    description: message,
    variant: "destructive",
    duration: 5000
  });
}

export function success(title: string, message: string) {
  return toast({
    title,
    description: message,
    variant: "success",
    duration: 3000
  });
}

export function warning(title: string, message: string) {
  return toast({
    title,
    description: message,
    variant: "warning",
    duration: 4000
  });
}

// Specific function for network errors, with check to avoid duplicates
export function networkError() {
  // Check if we already have a network error toast active
  const hasNetworkErrorToast = memoryState.toasts.some(t => t.id === NETWORK_ERROR_TOAST_ID);
  
  if (!hasNetworkErrorToast) {
    toast({
      id: NETWORK_ERROR_TOAST_ID,
      title: "Erro de conexão",
      description: "Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde.",
      variant: "destructive",
      duration: 10000 // Network error toast stays longer on screen
    });
  }
}
