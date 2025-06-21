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
					? "bg-gradient-to-br from-nutri-green/25 to-nutri-blue/25 dark:from-nutri-green/40 dark:to-nutri-blue/40 border-2 border-nutri-green/50 dark:border-nutri-green/60 shadow-xl shadow-nutri-green/20 dark:shadow-nutri-green/30 scale-105 z-10"
					: "bg-white dark:bg-card border-gray-200 dark:border-gray-700"
			} flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
			{badge && (
				<div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
					<Badge className="bg-gradient-to-r from-nutri-green to-nutri-blue text-white px-6 py-2 font-bold text-sm shadow-lg animate-pulse">
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
