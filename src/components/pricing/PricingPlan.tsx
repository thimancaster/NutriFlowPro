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
					? "bg-gradient-to-br from-nutri-green/20 to-nutri-blue/20 dark:from-nutri-green/30 dark:to-nutri-blue/30 border-nutri-blue border-2"
					: "bg-white dark:bg-card border-gray-200 dark:border-gray-700"
			} flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
			{badge && (
				<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
					<Badge className="bg-nutri-green text-white px-4 py-1 font-semibold">
						{badge}
					</Badge>
				</div>
			)}

			<CardHeader className="text-center pb-4">
				<CardTitle className="text-xl font-bold">{title}</CardTitle>
				<div className="mt-4">
					<span className="text-4xl font-bold text-nutri-green dark:text-dark-accent-green">
						{price}
					</span>
					{priceDetail && (
						<span className="text-gray-600 dark:text-gray-400">{priceDetail}</span>
					)}
				</div>
				{description && (
					<CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
						{description}
					</CardDescription>
				)}
			</CardHeader>

			<CardContent className="flex-grow">
				<ul className="space-y-3">
					{features.map((feature, index) => (
						<li
							key={`${feature.text}-${index}`}
							className="flex items-start gap-3 animate-fade-in"
							style={{animationDelay: `${index * 0.1}s`}}>
							<feature.icon className="h-5 w-5 text-nutri-green dark:text-dark-accent-green mt-0.5 flex-shrink-0" />
							<span className="text-sm text-gray-700 dark:text-gray-300">
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
