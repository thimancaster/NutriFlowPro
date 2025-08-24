import React, {useEffect, useState} from "react";
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Heart} from "lucide-react";
import {supabase} from "@/integrations/supabase/client";
import {useToast} from "@/hooks/use-toast";
import {useNavigate} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {getTestimonials} from "@/utils/seedTestimonials";
import StarRating from "./StarRating";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface Testimonial {
	id?: string;
	name: string;
	role: string;
	content: string;
	approved?: boolean;
	rating?: number;
}

interface DashboardTestimonialsProps {
	showTitle?: boolean;
}

const DashboardTestimonials: React.FC<DashboardTestimonialsProps> = ({showTitle = true}) => {
	const navigate = useNavigate();
	const [fallbackTestimonials, setFallbackTestimonials] = useState<Testimonial[]>([]);
	const [activeIndex, setActiveIndex] = useState(0);

	// Setup autoplay plugin with reduced polling for performance
	const autoplayOptions = {
		delay: 10000, // 10 seconds per slide for reading time (increased from 7s)
		stopOnInteraction: true, // Stop on user interaction
		rootNode: (emblaRoot: any) => emblaRoot.parentElement, // Needed for proper functioning
	};

	const [emblaRef, emblaApi] = useEmblaCarousel(
		{
			loop: true,
			align: "center",
			skipSnaps: false,
		},
		[Autoplay(autoplayOptions)]
	);

	// Update active index when slide changes
	useEffect(() => {
		if (!emblaApi) return;

		const onSelect = () => {
			setActiveIndex(emblaApi.selectedScrollSnap());
		};

		emblaApi.on("select", onSelect);
		return () => {
			emblaApi.off("select", onSelect);
		};
	}, [emblaApi]);

	// Immediately use testimonial fallbacks
	useEffect(() => {
		setFallbackTestimonials(getTestimonials());
	}, []);

	// Load testimonials from database with improved error handling
	const {
		data: dbTestimonials,
		isLoading,
		error,
	} = useQuery<Testimonial[]>({
		queryKey: ["testimonials"],
		queryFn: async () => {
			try {
				// Add explicit column selection and limit the quantity
				const {data, error} = await supabase
					.from("testimonials")
					.select("id,name,role,content,approved,rating")
					.eq("approved", true)
					.limit(10) // Limit to 10 for performance
					.order("created_at", {ascending: false});

				if (error) {
					console.warn("Error fetching testimonials:", error);
					return [];
				}

				return data || [];
			} catch (err) {
				console.warn("Error in testimonial query:", err);
				return [];
			}
		},
		retry: 1, // Reduce retries to improve performance
		staleTime: 5 * 60 * 1000, // Cache for 5 minutes
		gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (replaced cacheTime)
	});

	// Determine which testimonials to show: database or fallback
	const testimonials =
		dbTestimonials && dbTestimonials.length > 0 ? dbTestimonials : fallbackTestimonials;

	const handleAddTestimonial = () => {
		navigate("/add-testimonial");
	};

	if (isLoading && fallbackTestimonials.length === 0) {
		return (
			<Card className="nutri-card shadow-lg border-none">
				<CardHeader>
					<CardTitle>Carregando depoimentos...</CardTitle>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card className="nutri-card shadow-lg border-none">
			{showTitle && (
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<div className="flex items-center">
							<Heart className="h-5 w-5 text-red-500 mr-2" />
							<span>Depoimentos de Usuários</span>
						</div>
						<Button
							variant="outline"
							className="text-nutri-blue hover:bg-nutri-blue hover:text-white transition-colors border-nutri-blue"
							onClick={handleAddTestimonial}>
							Adicionar Depoimento
						</Button>
					</CardTitle>
					<CardDescription>
						O que os nutricionistas estão dizendo sobre o NutriFlow Pro
					</CardDescription>
				</CardHeader>
			)}
			<CardContent className="py-2 relative">
				{testimonials && testimonials.length > 0 ? (
					<div className="relative">
						{/* Gradient masks for fade effect on sides */}
						<div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card to-transparent z-20 pointer-events-none"></div>
						<div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent z-20 pointer-events-none"></div>

						<div className="overflow-hidden" ref={emblaRef}>
							<div className="flex py-6 px-2">
								{testimonials.map((testimonial, index) => (
									<div
										key={testimonial.id || index}
										className="min-w-0 flex-[0_0_90%] md:flex-[0_0_45%] mx-2">
										<div
											className={`p-6 rounded-lg bg-card border border-border transition-all duration-500 ${
												index === activeIndex
													? "scale-105 shadow-xl"
													: "scale-95 opacity-70"
											}`}>
											<div className="mb-3">
												<StarRating rating={testimonial.rating || 5} />
											</div>
											<p
												className={`italic mb-4 ${
													index === activeIndex
														? "text-foreground"
														: "text-muted-foreground"
												}`}>
												&quot;{testimonial.content}&quot;
											</p>
											<p className="font-medium text-nutri-blue">
												{testimonial.name}
											</p>
											<p className="text-sm text-muted-foreground">
												{testimonial.role}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				) : (
					<div className="text-center py-8">
						<p className="text-muted-foreground">Nenhum depoimento encontrado</p>
						<div className="mt-4">
							<Button
								variant="outline"
								onClick={handleAddTestimonial}
								className="border-nutri-blue text-nutri-blue hover:bg-nutri-blue hover:text-white">
								Seja o primeiro a deixar um depoimento
							</Button>
						</div>
					</div>
				)}

				{testimonials && testimonials.length > 1 && (
					<div className="flex justify-center mt-6 gap-2">
						<Button
							size="icon"
							variant="outline"
							className="rounded-full h-8 w-8 border-nutri-blue text-nutri-blue hover:bg-nutri-blue hover:text-white"
							onClick={() => emblaApi?.scrollPrev()}>
							<span className="sr-only">Anterior</span>←
						</Button>
						<Button
							size="icon"
							variant="outline"
							className="rounded-full h-8 w-8 border-nutri-blue text-nutri-blue hover:bg-nutri-blue hover:text-white"
							onClick={() => emblaApi?.scrollNext()}>
							<span className="sr-only">Próximo</span>→
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default DashboardTestimonials;
