import {supabase} from "@/integrations/supabase/client";
import {ItemRefeicao} from "@/hooks/useMealPlanCalculations";

// Interfaces
interface PlanoNutricionalDiarioData {
	user_id: string;
	patient_id: string;
	calculation_id?: string;
	vet_kcal: number;
	ptn_g_dia: number;
	ptn_kcal: number;
	ptn_valor: number;
	ptn_tipo_definicao: "g_kg" | "percentual";
	ptn_percentual: number;
	cho_g_dia: number;
	cho_kcal: number;
	cho_percentual: number;
	lip_g_dia: number;
	lip_kcal: number;
	lip_valor: number;
	lip_tipo_definicao: "g_kg" | "percentual";
	lip_percentual: number;
	refeicoes?: Array<{
		nome_refeicao: string;
		numero_refeicao: number;
		horario_sugerido?: string;
		ptn_percentual: number;
		cho_percentual: number;
		lip_percentual: number;
		itens: ItemRefeicao[];
	}>;
}

interface RefeicaoDistribuicaoData {
	plano_nutricional_id: string;
	nome_refeicao: string;
	numero_refeicao: number;
	horario_sugerido?: string;
	ptn_percentual: number;
	cho_percentual: number;
	lip_percentual: number;
	ptn_g: number;
	cho_g: number;
	lip_g: number;
	kcal_total: number;
}

interface ItemRefeicaoData extends ItemRefeicao {
	refeicao_id: string;
	ordem?: number;
}

/**
 * Save plano_nutricional_diario
 */
export async function savePlanoNutricionalDiario(
	planoData: Omit<PlanoNutricionalDiarioData, "refeicoes">
): Promise<string> {
	try {
		const {data, error} = await supabase
			.from("plano_nutricional_diario")
			.insert({
				user_id: planoData.user_id,
				patient_id: planoData.patient_id,
				calculation_id: planoData.calculation_id,
				vet_kcal: planoData.vet_kcal,
				ptn_g_dia: planoData.ptn_g_dia,
				ptn_kcal: planoData.ptn_kcal,
				ptn_valor: planoData.ptn_valor,
				ptn_tipo_definicao: planoData.ptn_tipo_definicao,
				ptn_percentual: planoData.ptn_percentual,
				cho_g_dia: planoData.cho_g_dia,
				cho_kcal: planoData.cho_kcal,
				cho_percentual: planoData.cho_percentual,
				lip_g_dia: planoData.lip_g_dia,
				lip_kcal: planoData.lip_kcal,
				lip_valor: planoData.lip_valor,
				lip_tipo_definicao: planoData.lip_tipo_definicao,
				lip_percentual: planoData.lip_percentual,
			})
			.select("id")
			.single();

		if (error) {
			console.error("Error saving plano_nutricional_diario:", error);
			throw new Error("Erro ao salvar plano nutricional");
		}

		console.log("[PERSISTENCE] Plano nutricional saved:", data.id);
		return data.id;
	} catch (error) {
		console.error("Exception in savePlanoNutricionalDiario:", error);
		throw error;
	}
}

/**
 * Save refeicao_distribuicao
 */
export async function saveRefeicaoDistribuicao(
	distribuicoes: RefeicaoDistribuicaoData[]
): Promise<Array<{id: string; numero_refeicao: number}>> {
	try {
		const {data, error} = await supabase
			.from("refeicoes_distribuicao")
			.insert(distribuicoes)
			.select("id, numero_refeicao");

		if (error) {
			console.error("Error saving refeicoes_distribuicao:", error);
			throw new Error("Erro ao salvar distribuição de refeições");
		}

		console.log("[PERSISTENCE] Distribuicoes saved:", data.length);
		return data;
	} catch (error) {
		console.error("Exception in saveRefeicaoDistribuicao:", error);
		throw error;
	}
}

/**
 * Save itens_refeicao
 */
export async function saveItensRefeicao(itens: ItemRefeicaoData[]): Promise<void> {
	try {
		const {error} = await supabase.from("itens_refeicao").insert(
			itens.map((item, idx) => ({
				refeicao_id: item.refeicao_id,
				alimento_id: item.alimento_id,
				quantidade: item.quantidade,
				medida_utilizada: item.medida_utilizada,
				peso_total_g: item.peso_total_g,
				kcal_calculado: item.kcal_calculado,
				ptn_g_calculado: item.ptn_g_calculado,
				cho_g_calculado: item.cho_g_calculado,
				lip_g_calculado: item.lip_g_calculado,
				ordem: item.ordem || idx,
			}))
		);

		if (error) {
			console.error("Error saving itens_refeicao:", error);
			throw new Error("Erro ao salvar itens da refeição");
		}

		console.log("[PERSISTENCE] Itens saved:", itens.length);
	} catch (error) {
		console.error("Exception in saveItensRefeicao:", error);
		throw error;
	}
}

/**
 * Update a specific item in itens_refeicao
 */
export async function updateItemRefeicao(
	itemId: string,
	updates: Partial<ItemRefeicaoData>
): Promise<void> {
	try {
		const {error} = await supabase
			.from("itens_refeicao")
			.update({
				quantidade: updates.quantidade,
				medida_utilizada: updates.medida_utilizada,
				peso_total_g: updates.peso_total_g,
				kcal_calculado: updates.kcal_calculado,
				ptn_g_calculado: updates.ptn_g_calculado,
				cho_g_calculado: updates.cho_g_calculado,
				lip_g_calculado: updates.lip_g_calculado,
				ordem: updates.ordem,
			})
			.eq("id", itemId);

		if (error) {
			console.error("Error updating item_refeicao:", error);
			throw new Error("Erro ao atualizar item da refeição");
		}

		console.log("[PERSISTENCE] Item updated:", itemId);
	} catch (error) {
		console.error("Exception in updateItemRefeicao:", error);
		throw error;
	}
}

/**
 * Delete a specific item from itens_refeicao
 */
export async function deleteItemRefeicao(itemId: string): Promise<void> {
	try {
		const {error} = await supabase.from("itens_refeicao").delete().eq("id", itemId);

		if (error) {
			console.error("Error deleting item_refeicao:", error);
			throw new Error("Erro ao deletar item da refeição");
		}

		console.log("[PERSISTENCE] Item deleted:", itemId);
	} catch (error) {
		console.error("Exception in deleteItemRefeicao:", error);
		throw error;
	}
}

/**
 * Add a single item to an existing refeicao
 */
export async function addItemToRefeicao(
	refeicaoId: string,
	item: Omit<ItemRefeicaoData, "refeicao_id">
): Promise<string> {
	try {
		const {data, error} = await supabase
			.from("itens_refeicao")
			.insert({
				refeicao_id: refeicaoId,
				alimento_id: item.alimento_id,
				quantidade: item.quantidade,
				medida_utilizada: item.medida_utilizada,
				peso_total_g: item.peso_total_g,
				kcal_calculado: item.kcal_calculado,
				ptn_g_calculado: item.ptn_g_calculado,
				cho_g_calculado: item.cho_g_calculado,
				lip_g_calculado: item.lip_g_calculado,
				ordem: item.ordem || 0,
			})
			.select("id")
			.single();

		if (error) {
			console.error("Error adding item to refeicao:", error);
			throw new Error("Erro ao adicionar item à refeição");
		}

		console.log("[PERSISTENCE] Item added to refeicao:", data.id);
		return data.id;
	} catch (error) {
		console.error("Exception in addItemToRefeicao:", error);
		throw error;
	}
}

/**
 * Orchestrator: Complete workflow to save meal plan with all related data
 */
export const persistCompleteMealPlan = async (
	planoData: PlanoNutricionalDiarioData
): Promise<{
	planoId: string;
	success: boolean;
	refeicaoIds: Record<number, string>; // Map of refeicao numero to ID
}> => {
	try {
		console.log("[PERSISTENCE] Starting complete meal plan save...");

		const {refeicoes, ...planoDataOnly} = planoData;

		// Step 1: Save plano_nutricional_diario
		const planoId = await savePlanoNutricionalDiario(planoDataOnly);
		console.log("[PERSISTENCE] Plano saved:", planoId);

		const refeicaoIds: Record<number, string> = {};

		if (!refeicoes || refeicoes.length === 0) {
			return {planoId, success: true, refeicaoIds};
		}

		// Step 2: Prepare distribuicoes
		const distribuicoes: RefeicaoDistribuicaoData[] = refeicoes.map((ref) => ({
			plano_nutricional_id: planoId,
			nome_refeicao: ref.nome_refeicao,
			numero_refeicao: ref.numero_refeicao,
			horario_sugerido: ref.horario_sugerido,
			ptn_percentual: ref.ptn_percentual,
			cho_percentual: ref.cho_percentual,
			lip_percentual: ref.lip_percentual,
			ptn_g: 0, // Will be calculated from items
			cho_g: 0,
			lip_g: 0,
			kcal_total: 0,
		}));

		// Step 3: Save distribuicoes
		const createdRefeicoes = await saveRefeicaoDistribuicao(distribuicoes);
		console.log("[PERSISTENCE] Distribuicoes saved:", createdRefeicoes.length);

		// Build refeicaoIds map
		createdRefeicoes.forEach((ref) => {
			refeicaoIds[ref.numero_refeicao] = ref.id;
		});

		// Step 4: Save meal items with refeicao_id
		const allItens: ItemRefeicaoData[] = [];
		createdRefeicoes.forEach((ref) => {
			const refData = refeicoes.find((r) => r.numero_refeicao === ref.numero_refeicao);
			if (refData?.itens) {
				refData.itens.forEach((item, idx) => {
					allItens.push({
						...item,
						refeicao_id: ref.id,
						ordem: idx,
					});
				});
			}
		});

		if (allItens.length > 0) {
			await saveItensRefeicao(allItens);
		}

		console.log("[PERSISTENCE] Complete meal plan saved successfully:", planoId);
		return {planoId, success: true, refeicaoIds};
	} catch (error) {
		console.error("[PERSISTENCE] Error in complete workflow:", error);
		throw error;
	}
};
