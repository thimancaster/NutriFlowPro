
import React from "react";
import HeroSection from "./landing/HeroSection";
import FeaturesSection from "./landing/FeaturesSection";
import PricingSection from "./landing/PricingSection";
import TestimonialsSection from "./landing/TestimonialsSection";
import CtaSection from "./landing/CtaSection";

const LandingPage = () => {
	return (
		<main className="min-h-screen landing-page">
			<HeroSection />
			<FeaturesSection />
			<PricingSection />
			<TestimonialsSection />
			<CtaSection />
		</main>
	);
};

export default LandingPage;
