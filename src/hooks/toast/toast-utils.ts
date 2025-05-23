
import { TOAST_REMOVE_DELAY } from "./toast-types";
import { dispatch as storeDispatch, ActionType } from "./toast-types";

const TOAST_REMOVE_DELAY_MS = 1000;

export const addToRemoveQueue = (toastId: string) => {
  setTimeout(() => {
    storeDispatch({ type: ActionType.REMOVE_TOAST, id: toastId });
  }, TOAST_REMOVE_DELAY_MS);
};
