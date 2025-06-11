import React, {useEffect, useState} from "react";
import {getFoodsWithNutrition} from "@/integrations/supabase/functions";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {Button} from "@/components/ui/button";
import {useToast} from "@/hooks/use-toast";
import {ChevronLeft, ChevronRight, Loader2} from "lucide-react";

interface FoodListProps {
	searchTerm: string;
	categoryId: string | null;
	onFoodSelect: (foodId: string) => void;
}

interface Food {
	id: string;
	name: string;
	food_group?: string;
	calories: number;
	protein: number;
	carbs: number;
	fats: number;
}

const FoodList: React.FC<FoodListProps> = ({searchTerm, categoryId, onFoodSelect}) => {
	const [foods, setFoods] = useState<Food[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const {toast} = useToast();

	const pageSize = 24; // 24 items per page for a nice grid

	useEffect(() => {
		setCurrentPage(1); // Reset to first page when search changes
		fetchFoods(1);
	}, [searchTerm, categoryId]);

	const fetchFoods = async (page: number) => {
		if (page === 1) {
			setLoading(true);
		} else {
			setLoadingMore(true);
		}

		try {
			const filters = {
				searchTerm: searchTerm || undefined,
				category: categoryId || undefined,
				page,
				pageSize,
			};

			const result = await getFoodsWithNutrition(filters);

			setFoods(result.data);
			setTotalPages(result.totalPages);
			setTotalCount(result.count);
			setCurrentPage(page);
		} catch (error) {
			console.error("Error fetching foods:", error);
			toast({
				title: "Erro",
				description: "Não foi possível carregar os alimentos.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
			setLoadingMore(false);
		}
	};

	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= totalPages && !loadingMore) {
			fetchFoods(newPage);
		}
	};

	if (loading) {
		return (
			<div className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{Array.from({length: 6}, (_, index) => (
						<Card key={`food-loading-${index}`} className="overflow-hidden">
							<CardContent className="p-0">
								<div className="p-4 space-y-2">
									<Skeleton className="h-5 w-3/4" />
									<Skeleton className="h-4 w-1/2" />
									<div className="flex space-x-2 mt-2">
										<Skeleton className="h-5 w-16" />
										<Skeleton className="h-5 w-16" />
										<Skeleton className="h-5 w-16" />
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (foods.length === 0) {
		return (
			<div className="text-center py-10">
				<p className="text-muted-foreground">
					{searchTerm || categoryId
						? "Nenhum alimento encontrado com os filtros aplicados"
						: "Nenhum alimento encontrado"}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Results info */}
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					Mostrando {(currentPage - 1) * pageSize + 1}-
					{Math.min(currentPage * pageSize, totalCount)} de {totalCount} alimentos
				</p>
				<p className="text-sm text-muted-foreground">
					Página {currentPage} de {totalPages}
				</p>
			</div>

			{/* Foods grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{foods.map((food) => (
					<Card
						key={food.id}
						className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
						onClick={() => onFoodSelect(food.id)}>
						<CardContent className="p-4">
							<h3 className="font-medium text-base truncate">{food.name}</h3>
							{food.food_group && (
								<Badge variant="outline" className="mt-1">
									{food.food_group}
								</Badge>
							)}
							<div className="flex justify-between mt-3">
								<div className="text-center">
									<p className="text-xs text-muted-foreground">Calorias</p>
									<p className="font-medium">{food.calories}</p>
								</div>
								<div className="text-center">
									<p className="text-xs text-muted-foreground">Proteína</p>
									<p className="font-medium">{food.protein}g</p>
								</div>
								<div className="text-center">
									<p className="text-xs text-muted-foreground">Carbs</p>
									<p className="font-medium">{food.carbs}g</p>
								</div>
								<div className="text-center">
									<p className="text-xs text-muted-foreground">Gordura</p>
									<p className="font-medium">{food.fats}g</p>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1 || loadingMore}>
						<ChevronLeft className="h-4 w-4" />
						Anterior
					</Button>

					<div className="flex items-center space-x-1">
						{/* Show page numbers */}
						{Array.from({length: Math.min(5, totalPages)}, (_, i) => {
							let pageNum;
							if (totalPages <= 5) {
								pageNum = i + 1;
							} else if (currentPage <= 3) {
								pageNum = i + 1;
							} else if (currentPage >= totalPages - 2) {
								pageNum = totalPages - 4 + i;
							} else {
								pageNum = currentPage - 2 + i;
							}

							return (
								<Button
									key={pageNum}
									variant={currentPage === pageNum ? "default" : "outline"}
									size="sm"
									onClick={() => handlePageChange(pageNum)}
									disabled={loadingMore}
									className="w-10">
									{loadingMore && currentPage === pageNum ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										pageNum
									)}
								</Button>
							);
						})}
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages || loadingMore}>
						Próxima
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			)}
		</div>
	);
};

export default FoodList;
