import {defineConfig} from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import {componentTagger} from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({mode}) => ({
	server: {
		host: "::",
		port: 8080,
	},
	plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		// Optimize chunks for better caching
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ["react", "react-dom"],
					ui: [
						"@radix-ui/react-dialog",
						"@radix-ui/react-select",
						"@radix-ui/react-tabs",
					],
					charts: ["recharts"],
					animations: ["framer-motion"],
					router: ["react-router-dom"],
					query: ["@tanstack/react-query"],
					supabase: ["@supabase/supabase-js"],
					forms: ["react-hook-form", "@hookform/resolvers"],
					dates: ["date-fns"],
					icons: ["lucide-react"],
				},
			},
		},
		// Increase chunk size warning limit
		chunkSizeWarningLimit: 1000,
		// Enable source maps in development only
		sourcemap: mode === "development",
	},
	// Optimize dependencies
	optimizeDeps: {
		include: [
			"react",
			"react-dom",
			"react-router-dom",
			"@tanstack/react-query",
			"lucide-react",
			"lodash",
			"lodash/get",
			"lodash/debounce",
		],
		exclude: [
			// Large dependencies that should be loaded lazily
			"jspdf",
			"embla-carousel-react",
		],
	},
}));
