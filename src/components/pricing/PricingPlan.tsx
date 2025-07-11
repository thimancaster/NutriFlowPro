
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
					? "bg-white border-2 border-green-500 shadow-lg"
					: "bg-white border border-gray-200"
			} flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
			{badge && (
				<div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
					<Badge className="bg-green-600 text-white px-6 py-2 font-bold text-sm">
						{badge}
					</Badge>
				</div>
			)}

			<CardHeader className="text-center pb-4">
				<CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
				<div className="mt-4">
					<span className="text-4xl font-bold text-green-600">
						{price}
					</span>
					{priceDetail && (
						<span className="text-gray-600">{priceDetail}</span>
					)}
				</div>
				{description && (
					<CardDescription className="text-sm text-gray-600 mt-2">
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
							<span className="text-sm text-gray-700">
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
