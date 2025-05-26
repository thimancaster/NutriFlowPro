import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientNew from "./pages/PatientNew";
import PatientProfile from "./pages/PatientProfile";
import Appointments from "./pages/Appointments";
import CalculatorPage from "./pages/Calculator";
import PatientAnthropometry from "./pages/PatientAnthropometry";
import PatientHistory from "./pages/PatientHistory";
import MealPlans from "./pages/MealPlans";
import Settings from "./pages/Settings";
import {AuthProvider} from "./contexts/auth/AuthContext";
import {ToastProvider} from "@/components/ui/toast-provider";
import Clinical from "./pages/Clinical";
import Consultation from "./pages/Consultation";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import ProtectedLayout from "./components/layouts/ProtectedLayout";
import {ConsultationProvider} from "./contexts/ConsultationContext";
import {PatientProvider} from "@/contexts/PatientContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import FoodDatabase from "./pages/FoodDatabase";
import AuthHandler from "./components/auth/AuthHandler";

// Create a client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			retry: 1,
		},
	},
});

const App = () => {
	console.log("App component rendering");

	return (
		<QueryClientProvider client={queryClient}>
			<Router>
				<AuthProvider>
					<ToastProvider>
						<ConsultationProvider>
							<PatientProvider>
								<Routes>
									{/* Public routes */}
									<Route path="/" element={<Index />} />
									<Route path="/login" element={<Login />} />
									<Route path="/register" element={<Register />} />
									<Route path="/forgot-password" element={<ForgotPassword />} />
									<Route path="/reset-password" element={<ResetPassword />} />
									<Route path="/auth/callback" element={<AuthHandler />} />

									{/* Protected routes */}
									<Route element={<ProtectedLayout />}>
										<Route path="/dashboard" element={<Dashboard />} />
										<Route path="/patients" element={<Patients />} />
										<Route path="/patients/new" element={<PatientNew />} />
										<Route path="/patients/:id" element={<PatientProfile />} />
										<Route path="/patients/:id/edit" element={<PatientNew />} />
										{/* Alternative route pattern for edit */}
										<Route path="/patients/edit/:id" element={<PatientNew />} />
										<Route path="/appointments" element={<Appointments />} />
										<Route path="/calculator" element={<CalculatorPage />} />
										<Route
											path="/consultation/:id"
											element={<Consultation />}
										/>
										<Route
											path="/patient-anthropometry/:patientId"
											element={<PatientAnthropometry />}
										/>
										<Route
											path="/patient-history/:patientId"
											element={<PatientHistory />}
										/>
										<Route path="/meal-plans" element={<MealPlans />} />
										<Route path="/food-database" element={<FoodDatabase />} />
										<Route path="/clinical" element={<Clinical />} />
										<Route path="/settings" element={<Settings />} />
									</Route>
								</Routes>
							</PatientProvider>
						</ConsultationProvider>
					</ToastProvider>
				</AuthProvider>
			</Router>
		</QueryClientProvider>
	);
};

export default App;
