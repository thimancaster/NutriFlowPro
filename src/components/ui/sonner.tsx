import {useTheme} from "next-themes";
import {Toaster as Sonner, toast} from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({...props}: ToasterProps) => {
	const {theme = "system"} = useTheme();

	return (
		<>
			<style>{`
				/* Target all possible close button selectors */
				.close-button,
				[data-sonner-toast] button[data-close-button],
				[data-sonner-toast] .close-button,
				.sonner button[data-close-button],
				.sonner .close-button,
				[data-close-button] {
					position: absolute !important;
					top: 6px !important;
					right: 6px !important;
					left: auto !important;
					width: 32px !important;
					height: 32px !important;
					background: transparent !important;
					border: none !important;
					color: #64748b !important;
					display: flex !important;
					align-items: center !important;
					justify-content: center !important;
					border-radius: 50% !important;
					cursor: pointer !important;
					z-index: 1000 !important;
					transition: all 0.2s ease !important;
					font-size: 20px !important;
					line-height: 1 !important;
					padding: 0 !important;
					margin: 0 !important;
					transform: none !important;
				}
				/* Target the icon inside the close button */
				.close-button svg,
				[data-sonner-toast] button[data-close-button] svg,
				[data-sonner-toast] .close-button svg,
				.sonner button[data-close-button] svg,
				.sonner .close-button svg,
				[data-close-button] svg {
					width: 20px !important;
					height: 20px !important;
				}
				.close-button::before,
				[data-sonner-toast] button[data-close-button]::before,
				[data-sonner-toast] .close-button::before,
				.sonner button[data-close-button]::before,
				.sonner .close-button::before,
				[data-close-button]::before {
					font-size: 20px !important;
					line-height: 1 !important;
				}
				.close-button:hover,
				[data-sonner-toast] button[data-close-button]:hover,
				[data-sonner-toast] .close-button:hover,
				.sonner button[data-close-button]:hover,
				.sonner .close-button:hover,
				[data-close-button]:hover {
					background: #f1f5f9 !important;
					color: #475569 !important;
				}
				.dark .close-button,
				.dark [data-sonner-toast] button[data-close-button],
				.dark [data-sonner-toast] .close-button,
				.dark .sonner button[data-close-button],
				.dark .sonner .close-button,
				.dark [data-close-button] {
					color: #94a3b8 !important;
				}
				.dark .close-button:hover,
				.dark [data-sonner-toast] button[data-close-button]:hover,
				.dark [data-sonner-toast] .close-button:hover,
				.dark .sonner button[data-close-button]:hover,
				.dark .sonner .close-button:hover,
				.dark [data-close-button]:hover {
					background: #1e293b !important;
					color: #e2e8f0 !important;
				}
			`}</style>
			<Sonner
				theme={theme as ToasterProps["theme"]}
				className="toaster group"
				position="bottom-right"
				expand={true}
				richColors={true}
				offset="16px"
				closeButton={true}
				toastOptions={{
					duration: 5000,
					style: {
						maxWidth: "350px",
						minWidth: "300px",
						width: "350px",
						fontSize: "16px",
						marginRight: "16px",
						paddingRight: "40px", // Make room for close button
						position: "relative",
					},
					classNames: {
						toast: "group toast group-[.toaster]:bg-white dark:group-[.toaster]:bg-slate-950 group-[.toaster]:text-slate-950 dark:group-[.toaster]:text-slate-50 group-[.toaster]:border group-[.toaster]:border-slate-200 dark:group-[.toaster]:border-slate-800 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg group-[.toaster]:p-6 group-[.toaster]:pr-10 group-[.toaster]:max-w-[350px] group-[.toaster]:relative",
						title: "group-[.toast]:text-base group-[.toast]:font-semibold group-[.toast]:mb-1",
						description:
							"group-[.toast]:text-sm group-[.toast]:opacity-90 group-[.toast]:mt-1",
						closeButton: "close-button",
						actionButton:
							"group-[.toast]:bg-slate-900 group-[.toast]:text-slate-50 group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:text-sm group-[.toast]:rounded-md group-[.toast]:mt-3",
						cancelButton:
							"group-[.toast]:bg-slate-100 group-[.toast]:text-slate-900 group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:text-sm group-[.toast]:rounded-md group-[.toast]:mt-3",
					},
				}}
				{...props}
			/>
		</>
	);
};

export {Toaster, toast};
