
import * as React from "react";
import { useState } from "react";

import type { ToastActionElement } from "@/components/ui/toast";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000; // Definido para 5 segundos, tempo padrão para toasts
const NETWORK_ERROR_TOAST_ID = 'network-error-toast';

export type ToastProps = {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive" | "warning" | "success";
  open?: boolean;
  duration?: number; // Adicionando opção de customizar duração
};

type ToasterToast = Required<Pick<ToastProps, "id">> & ToastProps & {
  open: boolean;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

type ActionType = typeof actionTypes;

type Action =
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

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string, duration = TOAST_REMOVE_DELAY) => {
  if (toastTimeouts.has(toastId)) {
    clearTimeout(toastTimeouts.get(toastId));
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, duration);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

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

function toast(props: ToastProps) {
  const id = props.id || Math.random().toString(36).slice(2, 9);
  const duration = props.duration || TOAST_REMOVE_DELAY;
  
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
  
  // Configurar auto-dismiss após duração especificada
  addToRemoveQueue(id, duration);

  return {
    id,
    dismiss,
    update,
  };
}

function error(title: string, message: string) {
  return toast({
    title,
    description: message,
    variant: "destructive",
    duration: 5000
  });
}

function success(title: string, message: string) {
  return toast({
    title,
    description: message,
    variant: "success",
    duration: 3000
  });
}

function warning(title: string, message: string) {
  return toast({
    title,
    description: message,
    variant: "warning",
    duration: 4000
  });
}

// Função específica para erros de rede, com verificação para não mostrar duplicados
function networkError() {
  // Verificar se já temos um toast de erro de rede ativo
  const hasNetworkErrorToast = memoryState.toasts.some(t => t.id === NETWORK_ERROR_TOAST_ID);
  
  if (!hasNetworkErrorToast) {
    toast({
      id: NETWORK_ERROR_TOAST_ID,
      title: "Erro de conexão",
      description: "Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde.",
      variant: "destructive",
      duration: 10000 // Toast de erro de rede fica mais tempo na tela
    });
  }
}

function useToast() {
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
    dismiss: (toastId?: string) => {
      dispatch({ type: "DISMISS_TOAST", toastId });
    },
    error,
    success,
    warning,
    networkError
  };
}

export { useToast, toast };
