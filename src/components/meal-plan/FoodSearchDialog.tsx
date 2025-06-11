import React, {useState, useEffect} from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Search, Loader2, ChevronLeft, ChevronRight} from "lucide-react";
import {FoodService, Food} from "@/services/foodService";
import {useToast} from "@/hooks/use-toast";

interface FoodSearchDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onFoodSelect: (food: Food) => void;
	mealType?: string;
}

const FoodSearchDialog: React.FC<FoodSearchDialogProps> = ({
	isOpen,
	onClose,
	onFoodSelect,
	mealType,
}) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [foods, setFoods] = useState<Food[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<string>("");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [loadingMore, setLoadingMore] = useState(false);
	const [ignoreMealTypeFilter, setIgnoreMealTypeFilter] = useState(false);
	const {toast} = useToast();

	const pageSize = 20; // 20 items per page for dialog

	const categories = [
		{value: "", label: "Todas as categorias"},
		{value: "proteinas", label: "Proteínas"},
		{value: "frutas", label: "Frutas"},
		{value: "cereais_e_graos", label: "Cereais e Grãos"},
		{value: "tuberculos", label: "Tubérculos"},
		{value: "vegetais", label: "Vegetais"},
		{value: "gorduras", label: "Gorduras"},
		{value: "bebidas", label: "Bebidas"},
		{value: "massas", label: "Massas"},
		{value: "condimentos", label: "Condimentos"},
		{value: "pratos_prontos", label: "Pratos Prontos"},
		{value: "lanches", label: "Lanches"},
	];

	const searchFoods = async (page: number = currentPage) => {
		if (page === 1) {
			setIsLoading(true);
		} else {
			setLoadingMore(true);
		}

		try {
			const filters: any = {
				page,
				pageSize,
			};

			if (searchQuery) {
				filters.query = searchQuery;
			}

			if (selectedCategory) {
				filters.food_group = selectedCategory;
			}

			if (mealType && !ignoreMealTypeFilter) {
				filters.meal_time = mealType;
			}

			console.log("Searching with filters:", filters); // Debug log

			const results = await FoodService.searchFoods(filters);
			setFoods(results.data);
			setTotalPages(results.totalPages);
			setTotalCount(results.count);
			setCurrentPage(page);
		} catch (error) {
			console.error("Erro ao buscar alimentos:", error);
			toast({
				title: "Erro",
				description: "Erro ao buscar alimentos",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
			setLoadingMore(false);
		}
	};

	useEffect(() => {
		if (isOpen) {
			setCurrentPage(1);
			searchFoods(1);
		}
	}, [isOpen, searchQuery, selectedCategory, mealType, ignoreMealTypeFilter]);

	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= totalPages && !loadingMore) {
			searchFoods(newPage);
		}
	};

	const handleFoodSelect = (food: Food) => {
		onFoodSelect(food);
		onClose();
	};

	const handleClose = () => {
		setSearchQuery("");
		setSelectedCategory("");
		setFoods([]);
		setCurrentPage(1);
		setTotalPages(1);
		setTotalCount(0);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle>Buscar Alimentos</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 flex-1 overflow-hidden flex flex-col">
					{/* Filtros */}
					<div className="space-y-3">
						<div className="relative">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
							<Input
								placeholder="Digite o nome do alimento..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9"
							/>
						</div>

						<div className="flex flex-wrap gap-2">
							{categories.map((category) => (
								<Button
									key={category.value}
									variant={
										selectedCategory === category.value ? "default" : "outline"
									}
									size="sm"
									onClick={() => setSelectedCategory(category.value)}>
									{category.label}
								</Button>
							))}
						</div>

						{/* Meal Type Filter Toggle */}
						{mealType && (
							<div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
								<div className="flex items-center space-x-2">
									<span className="text-sm font-medium text-blue-700">
										Filtro ativo:{" "}
										{mealType === "breakfast"
											? "Café da manhã"
											: mealType === "lunch"
											? "Almoço"
											: mealType === "dinner"
											? "Jantar"
											: mealType}
									</span>
									<span className="text-xs text-blue-600">
										({totalCount} alimentos disponíveis)
									</span>
								</div>
								<Button
									variant={ignoreMealTypeFilter ? "default" : "outline"}
									size="sm"
									onClick={() => setIgnoreMealTypeFilter(!ignoreMealTypeFilter)}>
									{ignoreMealTypeFilter
										? "Mostrar todos os alimentos"
										: "Ver todos os alimentos"}
								</Button>
							</div>
						)}
					</div>

					{/* Lista de Alimentos */}
					<div className="flex-1 overflow-y-auto border rounded-lg">
						{isLoading ? (
							<div className="flex items-center justify-center p-8">
								<Loader2 className="h-6 w-6 animate-spin mr-2" />
								Buscando alimentos...
							</div>
						) : foods.length === 0 ? (
							<div className="text-center p-8 text-gray-500">
								{searchQuery || selectedCategory
									? "Nenhum alimento encontrado com os filtros aplicados"
									: "Digite para buscar alimentos"}
							</div>
						) : (
							<div className="divide-y">
								{foods.map((food) => (
									<div
										key={food.id}
										className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
										onClick={() => handleFoodSelect(food)}>
										<div className="flex justify-between items-start">
											<div className="flex-1">
												<h4 className="font-medium text-gray-900">
													{food.name}
												</h4>
												<div className="flex gap-2 mt-1">
													<Badge variant="secondary" className="text-xs">
														{food.food_group}
													</Badge>
													{food.is_organic && (
														<Badge
															variant="outline"
															className="text-xs text-green-600">
															Orgânico
														</Badge>
													)}
												</div>
												<p className="text-sm text-gray-600 mt-1">
													{food.portion_size} {food.portion_unit}
												</p>
											</div>

											<div className="text-right text-sm">
												<div className="font-medium">
													{food.calories} kcal
												</div>
												<div className="text-gray-500">
													P: {food.protein}g | C: {food.carbs}g | G:{" "}
													{food.fats}g
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Results info and pagination */}
					{!isLoading && totalCount > 0 && (
						<div className="space-y-3 pt-2">
							<div className="flex items-center justify-between text-sm text-gray-600">
								<span>
									Mostrando {(currentPage - 1) * pageSize + 1}-
									{Math.min(currentPage * pageSize, totalCount)} de {totalCount}{" "}
									alimentos
								</span>
								<span>
									Página {currentPage} de {totalPages}
								</span>
							</div>

							{/* Pagination Controls */}
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
										{/* Show page numbers (simplified for dialog) */}
										{Array.from({length: Math.min(3, totalPages)}, (_, i) => {
											let pageNum;
											if (totalPages <= 3) {
												pageNum = i + 1;
											} else if (currentPage <= 2) {
												pageNum = i + 1;
											} else if (currentPage >= totalPages - 1) {
												pageNum = totalPages - 2 + i;
											} else {
												pageNum = currentPage - 1 + i;
											}

											return (
												<Button
													key={pageNum}
													variant={
														currentPage === pageNum
															? "default"
															: "outline"
													}
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
					)}

					<div className="flex justify-end gap-2 pt-4 border-t">
						<Button variant="outline" onClick={handleClose}>
							Cancelar
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default FoodSearchDialog;
