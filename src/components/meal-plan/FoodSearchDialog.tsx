import React, {useState, useEffect, useCallback, useRef} from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Search, Loader2, ChevronLeft, ChevronRight} from "lucide-react";
import {FoodService, Food} from "@/services/foodService";

interface FoodSearchDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onFoodSelect: (food: Food) => void;
	mealType?: string;
}

// Helper component for rendering food list content
const FoodListContent: React.FC<{
	error: string;
	isLoading: boolean;
	foods: Food[];
	searchQuery: string;
	selectedCategory: string;
	mealType?: string;
	ignoreMealTypeFilter: boolean;
	onFoodSelect: (food: Food) => void;
	onRetry: () => void;
	onForceReset: () => void;
	showLoadingHelp: boolean;
}> = ({
	error,
	isLoading,
	foods,
	searchQuery,
	selectedCategory,
	mealType,
	ignoreMealTypeFilter,
	onFoodSelect,
	onRetry,
	onForceReset,
	showLoadingHelp,
}) => {
	if (error) {
		return (
			<div className="text-center p-8 text-red-500 min-h-[200px] flex flex-col justify-center">
				<p>{error}</p>
				<div className="flex flex-col gap-2 mt-4">
					<Button variant="outline" onClick={onRetry}>
						Tentar novamente
					</Button>
					<Button variant="outline" onClick={onForceReset} className="text-orange-600">
						Reiniciar busca
					</Button>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8 min-h-[200px]">
				<div className="text-center">
					<div className="flex items-center justify-center mb-4">
						<Loader2 className="h-6 w-6 animate-spin mr-2" />
						Buscando alimentos...
					</div>
					{showLoadingHelp && (
						<div className="mt-4">
							<p className="text-sm text-gray-600 mb-3">
								A busca está demorando mais que o esperado
							</p>
							<Button variant="outline" onClick={onForceReset} size="sm">
								Reiniciar busca
							</Button>
						</div>
					)}
				</div>
			</div>
		);
	}

	if (foods.length === 0) {
		const hasActiveFilters =
			searchQuery || selectedCategory || (mealType && !ignoreMealTypeFilter);

		return (
			<div className="text-center p-8 text-gray-500 min-h-[200px] flex flex-col justify-center">
				{hasActiveFilters ? (
					"Nenhum alimento encontrado com os filtros aplicados"
				) : (
					<div className="space-y-4">
						<p>
							Digite o nome de um alimento ou selecione uma categoria para começar a
							busca
						</p>
						<Button variant="outline" onClick={onRetry} disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									Carregando...
								</>
							) : (
								"Mostrar todos os alimentos"
							)}
						</Button>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="divide-y">
			{foods.map((food) => (
				<button
					key={food.id}
					type="button"
					className="p-4 hover:bg-gray-50 cursor-pointer transition-colors text-left border-none bg-transparent w-full"
					onClick={() => onFoodSelect(food)}
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							onFoodSelect(food);
						}
					}}>
					<div className="flex justify-between items-start">
						<div className="flex-1">
							<h4 className="font-medium text-gray-900">{food.name}</h4>
							<div className="flex gap-2 mt-1">
								<Badge variant="secondary" className="text-xs">
									{food.food_group}
								</Badge>
								{food.is_organic && (
									<Badge variant="outline" className="text-xs text-green-600">
										Orgânico
									</Badge>
								)}
							</div>
							<p className="text-sm text-gray-600 mt-1">
								{food.portion_size} {food.portion_unit}
							</p>
						</div>
						<div className="text-right text-sm">
							<div className="font-medium">{food.calories} kcal</div>
							<div className="text-gray-500">
								P: {food.protein}g | C: {food.carbs}g | G: {food.fats}g
							</div>
						</div>
					</div>
				</button>
			))}
		</div>
	);
};

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
	const [error, setError] = useState("");
	const [abortController, setAbortController] = useState<AbortController | null>(null);
	const [actualItemsPerPage, setActualItemsPerPage] = useState(20); // Track actual items per page
	const [showLoadingHelp, setShowLoadingHelp] = useState(false); // Show help after prolonged loading

	// Use a ref to track if we've done the initial search to prevent loops
	const hasInitialSearched = useRef(false);
	const isSearchInProgress = useRef(false);

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

	// Helper function to determine if search should proceed
	const shouldPerformSearch = useCallback(
		(forceSearch: boolean) => {
			const hasSearchQuery = searchQuery.trim();
			const hasSpecificCategory = selectedCategory && selectedCategory !== "";
			const hasMealType = mealType && !ignoreMealTypeFilter;

			return (
				forceSearch ||
				hasSearchQuery ||
				hasSpecificCategory ||
				hasMealType ||
				(selectedCategory === "" && hasInitialSearched.current)
			);
		},
		[searchQuery, selectedCategory, mealType, ignoreMealTypeFilter]
	);

	// Helper function to reset search state
	const resetSearchState = useCallback(() => {
		setFoods([]);
		setTotalPages(1);
		setTotalCount(0);
		setCurrentPage(1);
		setIsLoading(false);
		setLoadingMore(false);
		setError("");
	}, []);

	// Force reset function to break out of stuck states
	const forceReset = useCallback(() => {
		console.log("🔄 Force reset initiated");

		// Abort any ongoing requests
		if (abortController) {
			abortController.abort();
		}

		// Force reset all flags and states
		isSearchInProgress.current = false;
		hasInitialSearched.current = false;
		setAbortController(null);
		setShowLoadingHelp(false);

		// Reset UI state
		resetSearchState();

		console.log("✅ Force reset completed");
	}, [abortController, resetSearchState]);

	// Helper function to build search filters - made more stable
	const buildSearchFilters = useCallback(
		(
			page: number,
			forceSearch: boolean,
			searchParams: {
				searchQuery: string;
				selectedCategory: string;
				mealType?: string;
				ignoreMealTypeFilter: boolean;
			}
		) => {
			const filters: any = {
				page,
				pageSize,
				forceLoad: forceSearch,
			};

			const hasSearchQuery = searchParams.searchQuery.trim();
			const hasSpecificCategory =
				searchParams.selectedCategory && searchParams.selectedCategory !== "";
			const hasMealType = searchParams.mealType && !searchParams.ignoreMealTypeFilter;

			if (hasSearchQuery) {
				filters.query = searchParams.searchQuery.trim();
			}

			if (hasSpecificCategory) {
				filters.food_group = searchParams.selectedCategory;
			}

			if (hasMealType) {
				filters.meal_time = searchParams.mealType;
			}

			return filters;
		},
		[pageSize]
	);

	// Helper function to calculate actual page size - made more stable
	const calculateActualPageSize = useCallback(
		(
			forceSearch: boolean,
			searchParams: {
				selectedCategory: string;
				searchQuery: string;
				mealType?: string;
				ignoreMealTypeFilter: boolean;
			}
		) => {
			const categorySelected =
				searchParams.selectedCategory && searchParams.selectedCategory !== "";
			const queryEntered = searchParams.searchQuery.trim();
			const mealTypeActive = searchParams.mealType && !searchParams.ignoreMealTypeFilter;
			const isSimpleCategorySearch = categorySelected && !queryEntered && !mealTypeActive;

			return forceSearch || isSimpleCategorySearch ? 100 : pageSize;
		},
		[pageSize]
	);

	// Helper function to handle search errors
	const handleSearchError = useCallback((error: any, abortController: AbortController) => {
		console.error("Search error:", error);

		if (abortController.signal.aborted) {
			console.log("Search was aborted");
			return;
		}

		if (error instanceof Error) {
			if (error.message === "Search timeout") {
				setError("A busca está demorando muito. Tente novamente.");
			} else if (error.message.includes("Database query timeout")) {
				setError("Conexão com o banco de dados está lenta. Tente novamente.");
			} else {
				setError("Erro ao buscar alimentos. Tente novamente.");
			}
		} else {
			setError("Erro ao buscar alimentos. Tente novamente.");
		}

		setFoods([]);
		setTotalCount(0);
	}, []);

	// Main search function - simplified by extracting helper functions
	const performSearch = useCallback(
		async (page: number, forceSearch: boolean = false) => {
			console.log("performSearch called:", {
				page,
				forceSearch,
				selectedCategory,
				isLoading,
				loadingMore,
			});

			// Check if we should search
			if (!shouldPerformSearch(forceSearch)) {
				console.log("Skipping search - no search criteria provided");
				resetSearchState();
				return;
			}

			// Prevent concurrent searches
			if ((isLoading || loadingMore || isSearchInProgress.current) && !forceSearch) {
				console.log("Search already in progress, skipping...");
				return;
			}

			// Set up search
			isSearchInProgress.current = true;

			if (abortController) {
				abortController.abort();
			}

			const newAbortController = new AbortController();
			setAbortController(newAbortController);

			if (page === 1) {
				setIsLoading(true);
			} else {
				setLoadingMore(true);
			}

			try {
				const searchParams = {
					searchQuery,
					selectedCategory,
					mealType,
					ignoreMealTypeFilter,
				};

				const filters = buildSearchFilters(page, forceSearch, searchParams);
				console.log("🔍 Search params:", searchParams);
				console.log("🔧 Built filters:", filters);
				console.log("Searching with filters:", filters);

				// Execute search with timeout (reduced to match service timeout)
				const searchPromise = FoodService.searchFoods(filters);
				const timeoutPromise = new Promise((_, reject) => {
					setTimeout(() => reject(new Error("Search timeout")), 12000); // Reduced from 20s to 12s
				});

				const results = (await Promise.race([searchPromise, timeoutPromise])) as any;
				console.log("API call completed with results:", {
					hasResults: !!results,
					dataLength: results?.data?.length,
					count: results?.count,
				});

				if (newAbortController.signal.aborted) {
					console.log("Search request was aborted");
					return;
				}

				// Process results
				const foods = results?.data ?? [];
				const totalCount = results?.count ?? 0;
				const totalPages = results?.totalPages ?? 1;
				const actualPageSize = calculateActualPageSize(forceSearch, searchParams);

				console.log("📦 Processing results:", {
					foodsCount: foods.length,
					selectedCategory,
					sampleFoods: foods
						.slice(0, 3)
						.map((f) => ({name: f.name, food_group: f.food_group})),
				});

				if (page === 1) {
					setFoods(foods);
					setActualItemsPerPage(actualPageSize);
				} else {
					setFoods((prev) => [...prev, ...foods]);
				}

				setTotalCount(totalCount);
				setTotalPages(totalPages);
				setCurrentPage(page);
				setError("");
			} catch (error) {
				handleSearchError(error, newAbortController);
			} finally {
				if (!newAbortController.signal.aborted) {
					console.log("Search completed, resetting loading states");
					setIsLoading(false);
					setLoadingMore(false);
				} else {
					console.log("Search was aborted, keeping loading states");
				}
				setAbortController(null);
				isSearchInProgress.current = false;
			}
		},
		[
			shouldPerformSearch,
			resetSearchState,
			buildSearchFilters,
			calculateActualPageSize,
			handleSearchError,
		]
	);

	// Separate function for initial search to avoid useCallback dependencies
	const performInitialSearch = useCallback(async () => {
		if (hasInitialSearched.current || isSearchInProgress.current) {
			return;
		}

		hasInitialSearched.current = true;
		setCurrentPage(1);
		console.log("Triggering forced search on dialog open");

		const filters: any = {
			page: 1,
			pageSize,
			forceLoad: true,
		};

		console.log("Initial search with filters:", filters);

		try {
			isSearchInProgress.current = true;
			setIsLoading(true);

			// Add timeout protection for initial search
			const searchPromise = FoodService.searchFoods(filters);
			const timeoutPromise = new Promise((_, reject) => {
				setTimeout(() => reject(new Error("Initial search timeout")), 12000); // Reduced to 12 seconds to be closer to service timeout
			});

			const results = (await Promise.race([searchPromise, timeoutPromise])) as any;
			console.log("Initial search completed:", results);

			const foods = results?.data ?? [];
			const totalCount = results?.count ?? 0;
			const totalPages = results?.totalPages ?? 1;

			setFoods(foods);
			setTotalCount(totalCount);
			setTotalPages(totalPages);
			setCurrentPage(1);
			setActualItemsPerPage(100); // Force load uses 100 items per page
			setError("");
		} catch (error) {
			console.error("Initial search error:", error);
			if (error instanceof Error) {
				if (error.message === "Initial search timeout") {
					setError("Carregamento inicial está demorando muito. Tente novamente.");
				} else if (error.message.includes("Database query timeout")) {
					setError("Conexão com o banco de dados está lenta. Tente novamente.");
				} else {
					setError("Erro ao carregar alimentos iniciais. Tente novamente.");
				}
			} else {
				setError("Erro ao carregar alimentos iniciais");
			}
			setFoods([]);
			setTotalCount(0);
		} finally {
			setIsLoading(false);
			isSearchInProgress.current = false; // Always reset this flag
		}
	}, [pageSize]);

	// Effect for when dialog opens - use ref to prevent infinite loops
	useEffect(() => {
		console.log("Dialog open effect triggered:", {
			isOpen,
			hasInitialSearched: hasInitialSearched.current,
		});
		if (isOpen) {
			performInitialSearch();

			// Aggressive safety reset: if search is stuck, force reset after 15 seconds
			const safetyTimeout = setTimeout(() => {
				if (isSearchInProgress.current || isLoading || loadingMore) {
					console.warn(
						"⚠️ Force resetting stuck search - dialog has been loading for 15+ seconds"
					);
					forceReset();
				}
			}, 15000); // Reduced from 30s to 15s for faster recovery

			return () => clearTimeout(safetyTimeout);
		} else if (!isOpen) {
			// Reset ref when dialog closes
			hasInitialSearched.current = false;
			isSearchInProgress.current = false;
			console.log("Dialog closed, resetting search state");
		}
	}, [isOpen, performInitialSearch, forceReset, isLoading, loadingMore]);

	// Effect for search query changes (debounced)
	useEffect(() => {
		if (isOpen && searchQuery.trim()) {
			const timeoutId = setTimeout(() => {
				setCurrentPage(1);
				performSearch(1);
			}, 300); // Debounce search queries

			return () => clearTimeout(timeoutId);
		}
	}, [searchQuery, isOpen, performSearch]);

	// Effect for category changes
	useEffect(() => {
		if (isOpen && hasInitialSearched.current) {
			const timeoutId = setTimeout(() => {
				setCurrentPage(1);
				performSearch(1);
			}, 100);

			return () => clearTimeout(timeoutId);
		}
	}, [selectedCategory, isOpen, performSearch]);

	// Effect for meal type filter changes
	useEffect(() => {
		if (isOpen && hasInitialSearched.current) {
			const timeoutId = setTimeout(() => {
				setCurrentPage(1);
				performSearch(1);
			}, 150);

			return () => clearTimeout(timeoutId);
		}
	}, [ignoreMealTypeFilter, isOpen, performSearch]);

	// Effect to show loading help after prolonged loading
	useEffect(() => {
		if (isLoading) {
			setShowLoadingHelp(false);
			const helpTimeout = setTimeout(() => {
				setShowLoadingHelp(true);
			}, 5000); // Show help after 5 seconds of loading

			return () => {
				clearTimeout(helpTimeout);
				setShowLoadingHelp(false);
			};
		} else {
			setShowLoadingHelp(false);
		}
	}, [isLoading]);

	// Helper function to get meal type display name
	const getMealTypeDisplayName = useCallback((mealType: string): string => {
		const mealTypeMap: Record<string, string> = {
			breakfast: "Café da manhã",
			lunch: "Almoço",
			dinner: "Jantar",
		};
		return mealTypeMap[mealType] || mealType;
	}, []);

	// Helper function for handling page changes
	const handlePageChange = useCallback(
		(newPage: number) => {
			if (newPage >= 1 && newPage <= totalPages && !loadingMore) {
				performSearch(newPage);
			}
		},
		[totalPages, loadingMore, performSearch]
	);

	// Helper function for handling food selection
	const handleFoodSelect = useCallback(
		(food: Food) => {
			onFoodSelect(food);
			onClose();
		},
		[onFoodSelect, onClose]
	);

	// Helper function for handling dialog close with cleanup
	const handleClose = useCallback(() => {
		// Cancel any ongoing search requests
		if (abortController) {
			abortController.abort();
			setAbortController(null);
		}

		// Reset all state
		setSearchQuery("");
		setSelectedCategory("");
		setFoods([]);
		setCurrentPage(1);
		setTotalPages(1);
		setTotalCount(0);
		setIsLoading(false);
		setLoadingMore(false);
		setIgnoreMealTypeFilter(false);
		setError("");
		setActualItemsPerPage(20);

		// Reset the refs
		hasInitialSearched.current = false;
		isSearchInProgress.current = false;

		onClose();
	}, [abortController, onClose]);

	// Cleanup effect to cancel requests on unmount
	useEffect(() => {
		return () => {
			if (abortController) {
				abortController.abort();
			}
		};
	}, [abortController]);

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-4xl h-[80vh] overflow-hidden flex flex-col">
				<DialogHeader className="flex-shrink-0">
					<DialogTitle>Buscar Alimentos</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 flex-1 overflow-hidden flex flex-col min-h-0">
					{/* Filtros */}
					<div className="space-y-3 flex-shrink-0">
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
										Filtro ativo: {getMealTypeDisplayName(mealType)}
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
					<div className="flex-1 overflow-y-auto border rounded-lg min-h-[420px] max-h-[420px]">
						<FoodListContent
							error={error}
							isLoading={isLoading}
							foods={foods}
							searchQuery={searchQuery}
							selectedCategory={selectedCategory}
							mealType={mealType}
							ignoreMealTypeFilter={ignoreMealTypeFilter}
							onFoodSelect={handleFoodSelect}
							onRetry={() => {
								setError("");
								performSearch(1, true);
							}}
							onForceReset={forceReset}
							showLoadingHelp={showLoadingHelp}
						/>
					</div>

					{/* Pagination Controls - Fixed Footer */}
					{foods.length > 0 && (
						<div className="space-y-3 pt-2 border-t flex-shrink-0 bg-white">
							<div className="flex items-center justify-between text-sm text-gray-600">
								<span>
									Mostrando {(currentPage - 1) * actualItemsPerPage + 1}-
									{Math.min(currentPage * actualItemsPerPage, totalCount)} de{" "}
									{totalCount} alimentos
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

					<div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
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
