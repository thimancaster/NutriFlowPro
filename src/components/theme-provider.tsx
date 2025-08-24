import React, {createContext, useContext, useEffect, useState} from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
};

type ThemeProviderState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
	theme: "system",
	setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Utility function to safely access localStorage
const safeLocalStorage = {
	getItem: (key: string): string | null => {
		try {
			return localStorage.getItem(key);
		} catch {
			return null;
		}
	},
	setItem: (key: string, value: string): void => {
		try {
			localStorage.setItem(key, value);
		} catch (error) {
			console.warn("Failed to save to localStorage:", error);
		}
	},
};

export function ThemeProvider({
	children,
	defaultTheme = "system",
	storageKey = "vite-ui-theme",
	...props
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(defaultTheme);
	const [mounted, setMounted] = useState(false);

	// Handle initial theme loading after component mounts
	useEffect(() => {
		const savedTheme = safeLocalStorage.getItem(storageKey) as Theme;
		if (savedTheme && ["dark", "light", "system"].includes(savedTheme)) {
			setTheme(savedTheme);
		}
		setMounted(true);
	}, [storageKey]);

	useEffect(() => {
		if (!mounted) return;

		const root = window.document.documentElement;

		root.classList.remove("light", "dark");

		if (theme === "system") {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";

			root.classList.add(systemTheme);

			// Listen for system theme changes
			const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
			const handleChange = (e: MediaQueryListEvent) => {
				root.classList.remove("light", "dark");
				root.classList.add(e.matches ? "dark" : "light");
			};

			mediaQuery.addEventListener("change", handleChange);
			return () => mediaQuery.removeEventListener("change", handleChange);
		}

		root.classList.add(theme);
	}, [theme, mounted]);

	const value = {
		theme,
		setTheme: (newTheme: Theme) => {
			safeLocalStorage.setItem(storageKey, newTheme);
			setTheme(newTheme);
		},
	};

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeProviderContext);

	if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

	return context;
};
