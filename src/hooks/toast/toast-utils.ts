
import { TOAST_REMOVE_DELAY } from "./toast-types";
import { dispatch } from "./toast-store";

const REMOVE_DELAY = TOAST_REMOVE_DELAY;

export const removalQueue = new Map<string, ReturnType<typeof setTimeout>>();

export function addToRemoveQueue(toastId: string): void {
  // If toast with ID already marked for removal, do nothing
  if (removalQueue.has(toastId)) return;

  const timeout = setTimeout(() => {
    removalQueue.delete(toastId);
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, REMOVE_DELAY);

  removalQueue.set(toastId, timeout);
}
