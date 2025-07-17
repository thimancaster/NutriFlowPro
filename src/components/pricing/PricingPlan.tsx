
import React from "react";
import {LucideIcon} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";

interface FeatureItem {
	icon: LucideIcon;
	text: string;
}

interface PricingPlanProps {
	title: string;
	price: string;
	priceDetail?: string;
	description?: string;
	badge?: string;
	highlighted?: boolean;
	features: FeatureItem[];
	ctaButton: React.ReactNode;
}

const PricingPlan: React.FC<PricingPlanProps> = ({
	title,
	price,
	priceDetail,
	description,
	badge,
	highlighted = false,
	features,
	ctaButton,
}) => {
	return (
		<Card
			className={`relative ${
				highlighted
					? "gradient-glass border-2 border-green-500 shadow-xl"
					: "glass-card border border-gray-200"
			} flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 smooth-lift scale-bounce group`}>
			{badge && (
				<div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-30">
					<Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 font-bold text-sm shadow-lg animate-pulse-soft">
						{badge}
					</Badge>
				</div>
			)}

			<CardHeader className={`text-center ${badge ? 'pt-8' : 'pt-6'} pb-4`}>
				<CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
				<div className="mt-4">
					<span className="text-4xl font-bold text-green-600 transition-transform duration-300 group-hover:scale-105">
						{price}
					</span>
					{priceDetail && (
						<span className="text-gray-700">{priceDetail}</span>
					)}
				</div>
				{description && (
					<CardDescription className="text-sm text-gray-700 mt-2">
						{description}
					</CardDescription>
				)}
			</CardHeader>

			<CardContent className="flex-grow">
				<ul className="space-y-3">
					{features.map((feature, index) => (
						<li
							key={`${feature.text}-${index}`}
							className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
							<feature.icon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
							<span className="text-sm text-gray-800">
								{feature.text}
							</span>
						</li>
					))}
				</ul>
			</CardContent>

			<CardFooter className="pt-6">{ctaButton}</CardFooter>
		</Card>
	);
};

export default PricingPlan;
