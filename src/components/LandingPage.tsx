import React from "react";
import HeroSection from "./landing/HeroSection";
import FeaturesSection from "./landing/FeaturesSection";
import PricingSection from "./landing/PricingSection";
import TestimonialsSection from "./landing/TestimonialsSection";
import CtaSection from "./landing/CtaSection";
import DebugSupabase from "./DebugSupabase";
import CategoryDebugger from "./CategoryDebugger";
import FoodSearchDebugger from "./FoodSearchDebugger";

const LandingPage = () => {
	return (
		<div className="min-h-screen">
			<HeroSection />

			{/* Temporary debug component */}
			<div className="container mx-auto px-4 py-8 space-y-4">
				<DebugSupabase />
				<CategoryDebugger />
				<FoodSearchDebugger />
			</div>

			<FeaturesSection />
			<PricingSection />
			<TestimonialsSection />
			<CtaSection />
		</div>
	);
};

export default LandingPage;
