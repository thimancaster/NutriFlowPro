
import { TOAST_REMOVE_DELAY, ActionType } from "./toast-types";
import { dispatch } from "./toast-store";

const TOAST_REMOVE_DELAY_MS = TOAST_REMOVE_DELAY;

export const addToRemoveQueue = (toastId: string) => {
  setTimeout(() => {
    dispatch({ type: ActionType.REMOVE_TOAST, id: toastId });
  }, TOAST_REMOVE_DELAY_MS);
};
