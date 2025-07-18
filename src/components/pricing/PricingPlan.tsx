
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
					? "bg-white/95 border-2 border-green-500 shadow-lg backdrop-blur-sm"
					: "bg-white/90 border border-gray-200 backdrop-blur-sm"
			} flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 rounded-2xl`}>
			{/* Badge removido daqui pois agora é renderizado no container pai */}

			<CardHeader className="text-center pb-4 pt-6">
				<CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
				<div className="mt-4">
					<span className="text-4xl font-bold text-green-600">
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
							className="flex items-start gap-3">
							<feature.icon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
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
