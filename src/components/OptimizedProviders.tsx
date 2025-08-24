import React, {memo, useMemo} from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "@/contexts/auth/AuthContext";
import {PatientProvider} from "@/contexts/patient/PatientContext";
import {ConsultationProvider} from "@/contexts/ConsultationContext";
import {MealPlanWorkflowProvider} from "@/contexts/MealPlanWorkflowContext";
import {ThemeProvider} from "@/components/theme-provider";

interface OptimizedProvidersProps {
	children: React.ReactNode;
}

// Create QueryClient outside component to prevent recreation on every render
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Increase stale time to reduce unnecessary refetches
			staleTime: 5 * 60 * 1000, // 5 minutes
			// Keep data in cache longer
			gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
			// Reduce background refetches
			refetchOnWindowFocus: false,
			// Enable retries but with exponential backoff
			retry: 2,
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		},
	},
});

const OptimizedProviders: React.FC<OptimizedProvidersProps> = memo(({children}) => {
	const memoizedChildren = useMemo(() => children, [children]);

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>
				<BrowserRouter>
					<AuthProvider>
						<PatientProvider>
							<ConsultationProvider>
								<MealPlanWorkflowProvider>
									{memoizedChildren}
								</MealPlanWorkflowProvider>
							</ConsultationProvider>
						</PatientProvider>
					</AuthProvider>
				</BrowserRouter>
			</ThemeProvider>
		</QueryClientProvider>
	);
});

OptimizedProviders.displayName = "OptimizedProviders";

export default OptimizedProviders;
