import {toast} from "sonner";

export interface ToastProps {
	title?: string;
	description?: string;
	variant?: "default" | "destructive" | "success" | "warning" | "network-error";
	action?: React.ReactNode;
}

const useToast = () => {
	const showToast = (props: ToastProps) => {
		const {title, description, variant = "default", action} = props;

		// Combine title and description for the message
		const message = title || "";
		const desc = description || "";

		switch (variant) {
			case "success":
				return toast.success(message, {
					description: desc,
					action: action as any,
				});

			case "destructive":
				return toast.error(message, {
					description: desc,
					action: action as any,
				});

			case "warning":
				return toast.warning(message, {
					description: desc,
					action: action as any,
				});

			case "network-error":
				return toast.error(message, {
					description: desc,
					action: action as any,
					className: "network-error-toast",
				});

			case "default":
			default:
				return toast(message, {
					description: desc,
					action: action as any,
				});
		}
	};

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
				toast.dismiss(id);
			} else {
				toast.dismiss();
			}
		},
		// Provide empty toasts array for compatibility
		toasts: [],
	};
};

export {useToast, toast};
