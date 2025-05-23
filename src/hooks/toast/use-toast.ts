
import * as React from "react";
import { useState } from "react";
import { ActionType, State, ToastProps, ToastApi } from "./toast-types";
import { listeners, memoryState, toast, error, success, warning, networkError, dispatch } from "./toast-store";

export function useToast(): ToastApi & State {
  const [state, setState] = useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (id?: string) => {
      dispatch({ type: ActionType.DISMISS_TOAST, id });
    },
    error,
    success,
    warning,
    networkError
  };
}

export { toast, type ToastProps, type ToastApi };
