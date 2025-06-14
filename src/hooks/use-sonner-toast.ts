
import {toast as sonnerToast} from "sonner";

export interface ToastProps {
	title?: string;
	description?: string;
	variant?: "default" | "destructive" | "success" | "warning" | "network-error";
	action?: React.ReactNode;
}

const showToast = (props: ToastProps) => {
	const {title, description, variant = "default", action} = props;

	// Combine title and description for the message
	const message = title || "";
	const desc = description || "";

	switch (variant) {
		case "success":
			return sonnerToast.success(message, {
				description: desc,
				action: action as any,
			});

		case "destructive":
			return sonnerToast.error(message, {
				description: desc,
				action: action as any,
			});

		case "warning":
			return sonnerToast.warning(message, {
				description: desc,
				action: action as any,
			});

		case "network-error":
			return sonnerToast.error(message, {
				description: desc,
				action: action as any,
				className: "network-error-toast",
			});

		case "default":
		default:
			return sonnerToast(message, {
				description: desc,
				action: action as any,
			});
	}
};

const useToast = () => {
	const success = (props: ToastProps) => showToast({...props, variant: "success"});
	const error = (props: ToastProps) => showToast({...props, variant: "destructive"});
	const warning = (props: ToastProps) => showToast({...props, variant: "warning"});
	const networkError = (props: ToastProps) => showToast({...props, variant: "network-error"});

	return {
		toast: showToast,
		success,
		error,
		warning,
		networkError,
		dismiss: (id?: string | number) => {
			if (id) {
				sonnerToast.dismiss(id);
			} else {
				sonnerToast.dismiss();
			}
		},
		// Provide empty toasts array for compatibility
		toasts: [],
	};
};

export {useToast, showToast as toast};
