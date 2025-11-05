import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Utensils, ArrowLeft } from 'lucide-react';
import MealPlanStep from '@/components/clinical/MealPlanStep';
import { useConsultationData } from '@/contexts/ConsultationDataContext';

/**
 * MealPlanBuilder Page (Legacy - Redirects to V2)
 * 
 * This page now redirects to the new MealPlanBuilderV2 with redesigned UI
 */
const MealPlanBuilder: React.FC = () => {
	const navigate = useNavigate();
	
	// Redirect to V2
	React.useEffect(() => {
		navigate('/meal-plan-builder-v2', { replace: true });
	}, [navigate]);

	return null;
};

export default MealPlanBuilder;
