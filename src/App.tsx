import React from "react";
import {Toaster} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import OptimizedProviders from "./components/OptimizedProviders";
import AppRoutes from "./routes";

const App = () => (
	<OptimizedProviders>
		<TooltipProvider>
			<Toaster />
			<AppRoutes />
		</TooltipProvider>
	</OptimizedProviders>
);

export default App;
