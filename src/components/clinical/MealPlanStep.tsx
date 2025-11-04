import React, {useState, useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Progress} from "@/components/ui/progress";
import {Utensils, Search, Plus, Trash2, AlertCircle, CheckCircle2} from "lucide-react";
import {useConsultationData} from "@/contexts/ConsultationDataContext";
import {usePatient} from "@/contexts/patient/PatientContext";
import {useAuth} from "@/contexts/auth/AuthContext";
import {useMealPlanCalculations, Refeicao, AlimentoV2} from "@/hooks/useMealPlanCalculations";
import {useMealPlanExport} from "@/hooks/useMealPlanExport";
import {
	persistCompleteMealPlan,
	addItemToRefeicao,
	deleteItemRefeicao,
} from "@/services/mealPlanPersistenceService";
import {useToast} from "@/hooks/use-toast";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {ScrollArea} from "@/components/ui/scroll-area";

// Distribuição padrão de calorias por refeição (%)
const DISTRIBUICAO_PADRAO = [0.25, 0.1, 0.3, 0.1, 0.2, 0.05]; // Café, Lanche AM, Almoço, Lanche PM, Jantar, Ceia

const REFEICOES_TEMPLATE = [
	{nome: "Café da Manhã", numero: 1, horario_sugerido: "07:00"},
	{nome: "Lanche da Manhã", numero: 2, horario_sugerido: "10:00"},
	{nome: "Almoço", numero: 3, horario_sugerido: "12:30"},
	{nome: "Lanche da Tarde", numero: 4, horario_sugerido: "15:30"},
	{nome: "Jantar", numero: 5, horario_sugerido: "19:00"},
	{nome: "Ceia", numero: 6, horario_sugerido: "21:30"},
];

type MacroType = "ptn" | "lip" | "cho";

// Helper to safely extract number from macro (handles both objects and numbers)
const getMacroNumber = (v: any): number => {
	if (!v) return 0;
	if (typeof v === 'object' && 'grams' in v) return v.grams ?? 0;
	if (typeof v === 'number') return v;
	return 0;
};

const MealPlanStep: React.FC = () => {
	const {consultationData, updateConsultationData} = useConsultationData();
	const {activePatient} = usePatient();
	const {user} = useAuth();
	const {toast} = useToast();
	const {
		alimentos,
		loading: searchingAlimentos,
		searchAlimentos,
		calculateItemRefeicao,
		calculateRefeicaoTotals,
		calculateDailyTotals,
	} = useMealPlanCalculations();
	const {exportToPDF} = useMealPlanExport();

	const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [activeRefeicaoIndex, setActiveRefeicaoIndex] = useState<number | null>(null);
	const [selectedAlimento, setSelectedAlimento] = useState<AlimentoV2 | null>(null);
	const [quantidade, setQuantidade] = useState<string>("1");
	const [editingDistribution, setEditingDistribution] = useState(false);
	const [macroDistribution, setMacroDistribution] = useState({
		ptn: [...DISTRIBUICAO_PADRAO],
		lip: [...DISTRIBUICAO_PADRAO],
		cho: [...DISTRIBUICAO_PADRAO],
	});
	const [isSaving, setIsSaving] = useState(false);
	const [savedRefeicaoIds, setSavedRefeicaoIds] = useState<Record<number, string>>({});

	// Inicializar refeições com alvos baseados no VET
	useEffect(() => {
		if (consultationData?.results?.vet && refeicoes.length === 0) {
			const vet = consultationData.results.vet;
			const macros = consultationData.results.macros;

			// Extract numbers safely from macros
			const ptnG = getMacroNumber(macros.protein);
			const choG = getMacroNumber(macros.carbs);
			const lipG = getMacroNumber(macros.fat);

			console.log('[MEAL_PLAN] Initializing with macros:', { ptnG, choG, lipG });

		const initialRefeicoes: Refeicao[] = REFEICOES_TEMPLATE.map((template, idx) => ({
			...template,
			itens: [],
			// CORRECT CALCULATION: Sum of all macros with their distributions
			alvo_kcal: Math.round(
				(ptnG * 4 * macroDistribution.ptn[idx]) +
				(choG * 4 * macroDistribution.cho[idx]) +
				(lipG * 9 * macroDistribution.lip[idx])
			),
			alvo_ptn_g: Math.round(ptnG * macroDistribution.ptn[idx]),
			alvo_cho_g: Math.round(choG * macroDistribution.cho[idx]),
			alvo_lip_g: Math.round(lipG * macroDistribution.lip[idx]),
		}));

			setRefeicoes(initialRefeicoes);
		}
	}, [consultationData?.results, refeicoes.length, macroDistribution]);

	// Recalcular alvos quando distribuição mudar
	const updateMealTargets = () => {
		if (!consultationData?.results) return;

		const vet = consultationData.results.vet;
		const macros = consultationData.results.macros;

		// Extract numbers safely from macros
		const ptnG = getMacroNumber(macros.protein);
		const choG = getMacroNumber(macros.carbs);
		const lipG = getMacroNumber(macros.fat);

	setRefeicoes((prev) =>
		prev.map((ref, idx) => ({
			...ref,
			// CORRECT CALCULATION: Sum of all macros with their distributions
			alvo_kcal: Math.round(
				(ptnG * 4 * macroDistribution.ptn[idx]) +
				(choG * 4 * macroDistribution.cho[idx]) +
				(lipG * 9 * macroDistribution.lip[idx])
			),
			alvo_ptn_g: Math.round(ptnG * macroDistribution.ptn[idx]),
			alvo_cho_g: Math.round(choG * macroDistribution.cho[idx]),
			alvo_lip_g: Math.round(lipG * macroDistribution.lip[idx]),
		}))
	);
	};

	// Validar distribuição (soma = 100%)
	const validateDistribution = (macro: MacroType): boolean => {
		const sum = macroDistribution[macro].reduce((acc, val) => acc + val, 0);
		return Math.abs(sum - 1.0) < 0.01; // Tolerance for floating point
	};

	const getDistributionError = (macro: MacroType): string | null => {
		const sum = macroDistribution[macro].reduce((acc, val) => acc + val, 0);
		const percent = sum * 100;
		if (Math.abs(percent - 100) > 0.5) {
			return `${percent.toFixed(1)}% (deve somar 100%)`;
		}
		return null;
	};

	const handleDistributionChange = (macro: MacroType, refeicaoIdx: number, value: string) => {
		const numValue = parseFloat(value) || 0;
		const percentValue = numValue / 100; // Convert % to decimal

		setMacroDistribution((prev) => ({
			...prev,
			[macro]: prev[macro].map((v, idx) => (idx === refeicaoIdx ? percentValue : v)),
		}));
	};

	const applyDistribution = () => {
		// Validate all distributions
		const ptnValid = validateDistribution("ptn");
		const lipValid = validateDistribution("lip");
		const choValid = validateDistribution("cho");

		if (!ptnValid || !lipValid || !choValid) {
			toast({
				title: "Distribuição Inválida",
				description: "Todos os macronutrientes devem somar 100%",
				variant: "destructive",
			});
			return;
		}

		updateMealTargets();
		setEditingDistribution(false);

		toast({
			title: "Distribuição Aplicada",
			description: "Alvos de cada refeição recalculados",
		});
	};

	// Buscar alimentos quando o usuário digita
	useEffect(() => {
		const delaySearch = setTimeout(() => {
			if (searchQuery.length >= 2) {
				searchAlimentos(searchQuery);
			}
		}, 300);

		return () => clearTimeout(delaySearch);
	}, [searchQuery, searchAlimentos]);

	const handleAddAlimento = async () => {
		if (!selectedAlimento || activeRefeicaoIndex === null) {
			toast({
				title: "Erro",
				description: "Selecione um alimento e uma refeição",
				variant: "destructive",
			});
			return;
		}

		const qtd = parseFloat(quantidade);
		if (isNaN(qtd) || qtd <= 0) {
			toast({
				title: "Quantidade Inválida",
				description: "Digite uma quantidade válida",
				variant: "destructive",
			});
			return;
		}

		const item = calculateItemRefeicao(selectedAlimento, qtd);

		// Add to local state
		setRefeicoes((prev) => {
			const newRefeicoes = [...prev];
			newRefeicoes[activeRefeicaoIndex].itens.push(item);
			return newRefeicoes;
		});

		// If meal plan is already saved, persist to Supabase
		const refeicaoId = savedRefeicaoIds[activeRefeicaoIndex];
		if (refeicaoId) {
			try {
				await addItemToRefeicao(refeicaoId, item);
				console.log("[MEAL_PLAN] Item added to Supabase");
			} catch (error) {
				console.error("[MEAL_PLAN] Error adding item to Supabase:", error);
				toast({
					title: "Aviso",
					description: "Item adicionado localmente, mas não foi salvo no banco.",
					variant: "default",
				});
			}
		}

		// Reset
		setSelectedAlimento(null);
		setSearchQuery("");
		setQuantidade("1");

		toast({
			title: "Alimento Adicionado",
			description: `${item.quantidade}x ${selectedAlimento.medida_padrao_referencia} de ${selectedAlimento.nome}`,
		});
	};

	const handleRemoveItem = async (refeicaoIndex: number, itemIndex: number) => {
		const item = refeicoes[refeicaoIndex].itens[itemIndex];

		// Remove from local state
		setRefeicoes((prev) => {
			const newRefeicoes = [...prev];
			newRefeicoes[refeicaoIndex].itens.splice(itemIndex, 1);
			return newRefeicoes;
		});

		// If item has an ID (was saved), delete from Supabase
		if (item.id) {
			try {
				await deleteItemRefeicao(item.id);
				console.log("[MEAL_PLAN] Item deleted from Supabase");
				toast({
					title: "Item Removido",
					description: "Item removido do plano",
				});
			} catch (error) {
				console.error("[MEAL_PLAN] Error deleting item from Supabase:", error);
				toast({
					title: "Aviso",
					description: "Item removido localmente, mas erro ao deletar do banco.",
					variant: "default",
				});
			}
		}
	};

	const handleSaveMealPlan = async () => {
		if (!consultationData?.results || !activePatient || !user?.id) {
			toast({
				title: "❌ Erro",
				description: "Dados insuficientes para salvar o plano.",
				variant: "destructive",
			});
			return;
		}

		const totalItens = refeicoes.reduce((sum, ref) => sum + ref.itens.length, 0);

		console.log('[SAVE] Starting meal plan save:', {
			user_id: user.id,
			patient_id: activePatient.id,
			refeicoes_count: refeicoes.length,
			total_itens: totalItens,
			vet: consultationData.results.vet
		});

		setIsSaving(true);
		try {
			// Calculate percentages - safely extract numbers
			const totalCalories = consultationData.results.vet;
			const ptnG = getMacroNumber(consultationData.results.macros.protein);
			const choG = getMacroNumber(consultationData.results.macros.carbs);
			const lipG = getMacroNumber(consultationData.results.macros.fat);
			
			const ptnPercentual = ((ptnG * 4) / totalCalories) * 100;
			const choPercentual = ((choG * 4) / totalCalories) * 100;
			const lipPercentual = ((lipG * 9) / totalCalories) * 100;

			// Save to Supabase
			console.log('[SAVE] Calling persistCompleteMealPlan...');
			const result = await persistCompleteMealPlan({
				user_id: user.id,
				patient_id: activePatient.id,
				calculation_id: consultationData.id,
				vet_kcal: consultationData.results.vet,
				ptn_g_dia: ptnG,
				ptn_kcal: ptnG * 4,
				ptn_valor: 1.6, // Default value or from input
				ptn_tipo_definicao: "g_kg",
				ptn_percentual: ptnPercentual,
				cho_g_dia: choG,
				cho_kcal: choG * 4,
				cho_percentual: choPercentual,
				lip_g_dia: lipG,
				lip_kcal: lipG * 9,
				lip_valor: 1.0, // Default value or from input
				lip_tipo_definicao: "g_kg",
				lip_percentual: lipPercentual,
				refeicoes: refeicoes.map((ref, idx) => ({
					nome_refeicao: ref.nome,
					numero_refeicao: ref.numero,
					horario_sugerido: ref.horario_sugerido,
					ptn_percentual: macroDistribution.ptn[idx] * 100,
					cho_percentual: macroDistribution.cho[idx] * 100,
					lip_percentual: macroDistribution.lip[idx] * 100,
					itens: ref.itens,
				})),
			});

			console.log('[SAVE] Persistence successful:', result);

			// Store refeicao IDs for future operations
			setSavedRefeicaoIds(result.refeicaoIds);

			// Update context
			updateConsultationData({
				mealPlan: {
					refeicoes,
					dailyTotals: calculateDailyTotals(refeicoes),
				},
			});

			toast({
				title: "✅ Plano Alimentar Salvo",
				description: `${refeicoes.length} refeições e ${totalItens} alimentos salvos com sucesso!`,
			});
		} catch (error) {
			console.error("❌ [SAVE] Error saving meal plan:", error);
			toast({
				title: "❌ Erro ao salvar",
				description: error instanceof Error ? error.message : "Não foi possível salvar o plano no banco de dados.",
				variant: "destructive",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleExportPDF = async () => {
		if (!activePatient) return;

		await exportToPDF({
			refeicoes,
			patientName: activePatient.name,
			patientAge: activePatient.age,
			patientGender:
				activePatient.gender === "male"
					? "male"
					: activePatient.gender === "female"
					? "female"
					: undefined,
			nutritionistName: user?.email || undefined,
			notes: consultationData?.notes,
		});
	};

	if (!consultationData?.results?.vet) {
		return (
			<Card>
				<CardContent className="p-6 text-center">
					<AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
					<p className="text-muted-foreground">Complete o cálculo nutricional primeiro</p>
				</CardContent>
			</Card>
		);
	}

	const dailyTotals = calculateDailyTotals(refeicoes);
	const vetTarget = consultationData.results.vet;
	const progressPercent = (dailyTotals.kcal / vetTarget) * 100;

	return (
		<div className="space-y-6">
			{/* Header com Resumo Diário */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Utensils className="h-5 w-5 text-primary" />
						Plano Alimentar - {activePatient?.name}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
						<div>
							<p className="text-sm text-muted-foreground">Calorias</p>
							<p className="text-2xl font-bold">{Math.round(dailyTotals.kcal)}</p>
							<p className="text-xs text-muted-foreground">/ {vetTarget} kcal</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Proteína</p>
							<p className="text-2xl font-bold">{Math.round(dailyTotals.ptn_g)}g</p>
							<p className="text-xs text-muted-foreground">
								/ {getMacroNumber(consultationData.results.macros.protein)}g
							</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Carboidratos</p>
							<p className="text-2xl font-bold">{Math.round(dailyTotals.cho_g)}g</p>
							<p className="text-xs text-muted-foreground">
								/ {getMacroNumber(consultationData.results.macros.carbs)}g
							</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Gorduras</p>
							<p className="text-2xl font-bold">{Math.round(dailyTotals.lip_g)}g</p>
							<p className="text-xs text-muted-foreground">
								/ {getMacroNumber(consultationData.results.macros.fat)}g
							</p>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span>Progresso</span>
							<span>{progressPercent.toFixed(1)}%</span>
						</div>
						<Progress value={Math.min(progressPercent, 100)} className="h-2" />
					</div>
				</CardContent>
			</Card>

			{/* Distribuição de Macros por Refeição */}
			<Card>
				<CardHeader>
					<div className="flex justify-between items-center">
						<CardTitle className="text-lg">
							Distribuição de Macros por Refeição
						</CardTitle>
						<Button
							variant={editingDistribution ? "default" : "outline"}
							size="sm"
							onClick={() => setEditingDistribution(!editingDistribution)}>
							{editingDistribution ? "Cancelar" : "Editar Distribuição"}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{editingDistribution ? (
						<div className="space-y-4">
							<Alert>
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									Ajuste as porcentagens de cada macro para cada refeição. A soma
									de cada macro deve ser 100%.
								</AlertDescription>
							</Alert>

							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead>
										<tr className="border-b">
											<th className="text-left py-2">Refeição</th>
											<th className="text-center py-2">
												<div className="flex items-center justify-center gap-2">
													Proteína (%)
													<Badge variant={validateDistribution("ptn") ? "default" : "destructive"} className="text-xs">
														{getDistributionError("ptn") || "✓ 100%"}
													</Badge>
												</div>
											</th>
											<th className="text-center py-2">
												<div className="flex items-center justify-center gap-2">
													Lipídios (%)
													<Badge variant={validateDistribution("lip") ? "default" : "destructive"} className="text-xs">
														{getDistributionError("lip") || "✓ 100%"}
													</Badge>
												</div>
											</th>
											<th className="text-center py-2">
												<div className="flex items-center justify-center gap-2">
													Carboidratos (%)
													<Badge variant={validateDistribution("cho") ? "default" : "destructive"} className="text-xs">
														{getDistributionError("cho") || "✓ 100%"}
													</Badge>
												</div>
											</th>
										</tr>
									</thead>
									<tbody>
										{REFEICOES_TEMPLATE.map((template, idx) => (
											<tr key={idx} className="border-b">
												<td className="py-2 font-medium">
													{template.nome}
												</td>
												<td className="text-center">
													<Input
														type="number"
														step="0.1"
														min="0"
														max="100"
														value={(
															macroDistribution.ptn[idx] * 100
														).toFixed(1)}
														onChange={(e) =>
															handleDistributionChange(
																"ptn",
																idx,
																e.target.value
															)
														}
														className="w-20 mx-auto text-center"
													/>
												</td>
												<td className="text-center">
													<Input
														type="number"
														step="0.1"
														min="0"
														max="100"
														value={(
															macroDistribution.lip[idx] * 100
														).toFixed(1)}
														onChange={(e) =>
															handleDistributionChange(
																"lip",
																idx,
																e.target.value
															)
														}
														className="w-20 mx-auto text-center"
													/>
												</td>
												<td className="text-center">
													<Input
														type="number"
														step="0.1"
														min="0"
														max="100"
														value={(
															macroDistribution.cho[idx] * 100
														).toFixed(1)}
														onChange={(e) =>
															handleDistributionChange(
																"cho",
																idx,
																e.target.value
															)
														}
														className="w-20 mx-auto text-center"
													/>
												</td>
											</tr>
										))}
										<tr className="font-bold">
											<td className="py-2">TOTAL</td>
											<td className="text-center">
												<Badge
													variant={
														validateDistribution("ptn")
															? "default"
															: "destructive"
													}>
													{(
														macroDistribution.ptn.reduce(
															(a, b) => a + b,
															0
														) * 100
													).toFixed(1)}
													%
												</Badge>
											</td>
											<td className="text-center">
												<Badge
													variant={
														validateDistribution("lip")
															? "default"
															: "destructive"
													}>
													{(
														macroDistribution.lip.reduce(
															(a, b) => a + b,
															0
														) * 100
													).toFixed(1)}
													%
												</Badge>
											</td>
											<td className="text-center">
												<Badge
													variant={
														validateDistribution("cho")
															? "default"
															: "destructive"
													}>
													{(
														macroDistribution.cho.reduce(
															(a, b) => a + b,
															0
														) * 100
													).toFixed(1)}
													%
												</Badge>
											</td>
										</tr>
									</tbody>
								</table>
							</div>

							{/* Validation Errors */}
							{(!validateDistribution("ptn") ||
								!validateDistribution("lip") ||
								!validateDistribution("cho")) && (
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>
										<div className="space-y-1">
											{getDistributionError("ptn") && (
												<div>• Proteína: {getDistributionError("ptn")}</div>
											)}
											{getDistributionError("lip") && (
												<div>• Lipídios: {getDistributionError("lip")}</div>
											)}
											{getDistributionError("cho") && (
												<div>
													• Carboidratos: {getDistributionError("cho")}
												</div>
											)}
										</div>
									</AlertDescription>
								</Alert>
							)}

							<Button
								onClick={applyDistribution}
								className="w-full"
								disabled={
									!validateDistribution("ptn") ||
									!validateDistribution("lip") ||
									!validateDistribution("cho")
								}>
								<CheckCircle2 className="h-4 w-4 mr-2" />
								Aplicar Distribuição
							</Button>
						</div>
					) : (
						<div className="text-sm text-muted-foreground text-center py-4">
							Clique em "Editar Distribuição" para personalizar a distribuição de
							macros por refeição
						</div>
					)}
				</CardContent>
			</Card>

			{/* Busca de Alimentos */}
			{activeRefeicaoIndex !== null && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Adicionar Alimento</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex gap-2">
							<div className="flex-1 relative">
								<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Buscar alimento..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>
							<Input
								type="number"
								step="0.1"
								min="0.1"
								placeholder="Qtd"
								value={quantidade}
								onChange={(e) => setQuantidade(e.target.value)}
								className="w-20"
							/>
							<Button onClick={handleAddAlimento} disabled={!selectedAlimento}>
								<Plus className="h-4 w-4" />
							</Button>
						</div>

						{searchingAlimentos && (
							<p className="text-sm text-muted-foreground">Buscando...</p>
						)}

						{alimentos.length > 0 && (
							<ScrollArea className="h-48 border rounded-lg">
								<div className="p-2 space-y-1">
									{alimentos.map((alimento) => (
										<div
											key={alimento.id}
											onClick={() => setSelectedAlimento(alimento)}
											className={`p-3 rounded-lg cursor-pointer transition-colors ${
												selectedAlimento?.id === alimento.id
													? "bg-primary text-primary-foreground"
													: "hover:bg-accent"
											}`}>
											<div className="flex justify-between items-start">
												<div>
													<p className="font-medium">{alimento.nome}</p>
													<p className="text-xs opacity-80">
														{alimento.medida_padrao_referencia} (
														{alimento.peso_referencia_g}g)
													</p>
												</div>
												<div className="text-right text-sm">
													<p className="font-bold">
														{alimento.kcal_por_referencia} kcal
													</p>
													<p className="text-xs opacity-80">
														P:{alimento.ptn_g_por_referencia}g C:
														{alimento.cho_g_por_referencia}g L:
														{alimento.lip_g_por_referencia}g
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							</ScrollArea>
						)}
					</CardContent>
				</Card>
			)}

			{/* Refeições */}
			{refeicoes.map((refeicao, refeicaoIdx) => {
				const totals = calculateRefeicaoTotals(refeicao.itens);
				const kcalProgress = (totals.kcal / refeicao.alvo_kcal) * 100;
				const isActive = activeRefeicaoIndex === refeicaoIdx;

				return (
					<Card key={refeicaoIdx} className={isActive ? "border-primary" : ""}>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<CardTitle className="text-lg">{refeicao.nome}</CardTitle>
									{refeicao.horario_sugerido && (
										<Badge variant="outline">{refeicao.horario_sugerido}</Badge>
									)}
								</div>
								<Button
									size="sm"
									variant={isActive ? "default" : "outline"}
									onClick={() =>
										setActiveRefeicaoIndex(isActive ? null : refeicaoIdx)
									}>
									{isActive ? "Selecionada" : "Selecionar"}
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Alvos vs Atual */}
							<div className="bg-muted/50 p-3 rounded-lg">
								<div className="grid grid-cols-4 gap-2 text-sm">
									<div>
										<p className="text-muted-foreground">Kcal</p>
										<p className="font-bold">
											{Math.round(totals.kcal)} / {refeicao.alvo_kcal}
										</p>
									</div>
									<div>
										<p className="text-muted-foreground">PTN</p>
										<p className="font-bold">
											{Math.round(totals.ptn_g)}g / {refeicao.alvo_ptn_g}g
										</p>
									</div>
									<div>
										<p className="text-muted-foreground">CHO</p>
										<p className="font-bold">
											{Math.round(totals.cho_g)}g / {refeicao.alvo_cho_g}g
										</p>
									</div>
									<div>
										<p className="text-muted-foreground">LIP</p>
										<p className="font-bold">
											{Math.round(totals.lip_g)}g / {refeicao.alvo_lip_g}g
										</p>
									</div>
								</div>
								<Progress
									value={Math.min(kcalProgress, 100)}
									className="h-1 mt-2"
								/>
							</div>

							{/* Lista de Itens */}
							{refeicao.itens.length === 0 ? (
								<Alert>
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>
										Nenhum alimento adicionado. Selecione esta refeição e busque
										alimentos acima.
									</AlertDescription>
								</Alert>
							) : (
								<div className="space-y-2">
									{refeicao.itens.map((item, itemIdx) => (
										<div
											key={itemIdx}
											className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
											<div className="flex-1">
												<p className="font-medium">{item.alimento_nome}</p>
												<p className="text-sm text-muted-foreground">
													{item.quantidade}x {item.medida_utilizada} (
													{item.peso_total_g}g)
												</p>
											</div>
											<div className="text-right mr-4">
												<p className="font-bold">
													{Math.round(item.kcal_calculado)} kcal
												</p>
												<p className="text-xs text-muted-foreground">
													P:{Math.round(item.ptn_g_calculado)}g C:
													{Math.round(item.cho_g_calculado)}g L:
													{Math.round(item.lip_g_calculado)}g
												</p>
											</div>
											<Button
												size="icon"
												variant="ghost"
												onClick={() =>
													handleRemoveItem(refeicaoIdx, itemIdx)
												}>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				);
			})}

			{/* Botões de Ação */}
			<div className="flex justify-end gap-4">
				<Button
					onClick={handleExportPDF}
					size="lg"
					variant="outline"
					className="w-full md:w-auto">
					<Utensils className="mr-2 h-4 w-4" />
					Exportar PDF
				</Button>
				<Button
					onClick={handleSaveMealPlan}
					size="lg"
					disabled={isSaving}
					className="w-full md:w-auto">
					{isSaving ? (
						<>
							<span className="mr-2 h-4 w-4 animate-spin">⏳</span>
							Salvando...
						</>
					) : (
						<>
							<CheckCircle2 className="mr-2 h-4 w-4" />
							Salvar Plano Alimentar
						</>
					)}
				</Button>
			</div>
		</div>
	);
};

export default MealPlanStep;
