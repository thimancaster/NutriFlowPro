
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientNew from './pages/PatientNew';
import Appointments from './pages/Appointments';
import CalculatorPage from './pages/Calculator';
import PatientAnthropometry from './pages/PatientAnthropometry';
import PatientHistory from './pages/PatientHistory';
import MealPlans from './pages/MealPlans';
import { AuthProvider } from './contexts/auth/AuthContext';
import { ToastProvider } from '@/components/ui/toast-provider';
import Clinical from './pages/Clinical';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedLayout from './components/layouts/ProtectedLayout';

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
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route element={<ProtectedLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/patients/new" element={<PatientNew />} />
                <Route path="/patients/:id/edit" element={<PatientNew />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/calculator" element={<CalculatorPage />} />
                <Route path="/patient-anthropometry/:patientId" element={<PatientAnthropometry />} />
                <Route path="/patient-history/:patientId" element={<PatientHistory />} />
                <Route path="/meal-plans" element={<MealPlans />} />
                <Route path="/clinical" element={<Clinical />} />
              </Route>
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
