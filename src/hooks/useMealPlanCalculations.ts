import {useState, useCallback} from "react";
import {supabase} from "@/integrations/supabase/client";

export interface AlimentoV2 {
	id: string;
	nome: string;
	categoria: string;
	medida_padrao_referencia: string;
	peso_referencia_g: number;
	kcal_por_referencia: number;
	ptn_g_por_referencia: number;
	cho_g_por_referencia: number;
	lip_g_por_referencia: number;
	fibra_g_por_referencia?: number;
	sodio_mg_por_referencia?: number;
}

export interface ItemRefeicao {
	id?: string; // ID from Supabase (optional, only present after saving)
	alimento_id: string;
	alimento_nome: string;
	quantidade: number; // Múltiplo da medida padrão
	medida_utilizada: string;
	peso_total_g: number;
	kcal_calculado: number;
	ptn_g_calculado: number;
	cho_g_calculado: number;
	lip_g_calculado: number;
}

export interface Refeicao {
	nome: string;
	numero: number;
	horario_sugerido?: string;
	itens: ItemRefeicao[];
	alvo_kcal: number;
	alvo_ptn_g: number;
	alvo_cho_g: number;
	alvo_lip_g: number;
}

export interface RefeicaoTotals {
	kcal: number;
	ptn_g: number;
	cho_g: number;
	lip_g: number;
}

export const useMealPlanCalculations = () => {
	const [alimentos, setAlimentos] = useState<AlimentoV2[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Buscar alimentos do Supabase (tabela alimentos_v2)
	 */
	const searchAlimentos = useCallback(async (query: string) => {
		if (!query || query.length < 2) {
			setAlimentos([]);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const {data, error: supabaseError} = await supabase
				.from("alimentos_v2")
				.select("*")
				.ilike("nome", `%${query}%`)
				.eq("ativo", true)
				.order("nome")
				.limit(20);

			if (supabaseError) throw supabaseError;

			setAlimentos(data as AlimentoV2[]);
		} catch (err) {
			console.error("Erro ao buscar alimentos:", err);
			setError("Erro ao buscar alimentos");
			setAlimentos([]);
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Calcular item de refeição (LÓGICA FIEL À PLANILHA)
	 * Fórmula: valor_consumido = valor_por_referencia * quantidade
	 */
	const calculateItemRefeicao = useCallback(
		(alimento: AlimentoV2, quantidade: number): ItemRefeicao => {
			return {
				alimento_id: alimento.id,
				alimento_nome: alimento.nome,
				quantidade,
				medida_utilizada: alimento.medida_padrao_referencia,
				peso_total_g: Number((alimento.peso_referencia_g * quantidade).toFixed(2)),
				kcal_calculado: Number((alimento.kcal_por_referencia * quantidade).toFixed(2)),
				ptn_g_calculado: Number((alimento.ptn_g_por_referencia * quantidade).toFixed(2)),
				cho_g_calculado: Number((alimento.cho_g_por_referencia * quantidade).toFixed(2)),
				lip_g_calculado: Number((alimento.lip_g_por_referencia * quantidade).toFixed(2)),
			};
		},
		[]
	);

	/**
	 * Calcular totais da refeição (soma de todos os itens)
	 */
	const calculateRefeicaoTotals = useCallback((itens: ItemRefeicao[]): RefeicaoTotals => {
		return itens.reduce(
			(totals, item) => ({
				kcal: totals.kcal + item.kcal_calculado,
				ptn_g: totals.ptn_g + item.ptn_g_calculado,
				cho_g: totals.cho_g + item.cho_g_calculado,
				lip_g: totals.lip_g + item.lip_g_calculado,
			}),
			{kcal: 0, ptn_g: 0, cho_g: 0, lip_g: 0}
		);
	}, []);

	/**
	 * Calcular totais diários (soma de todas as refeições)
	 */
	const calculateDailyTotals = useCallback(
		(refeicoes: Refeicao[]): RefeicaoTotals => {
			return refeicoes.reduce(
				(dailyTotals, refeicao) => {
					const refeicaoTotals = calculateRefeicaoTotals(refeicao.itens);
					return {
						kcal: dailyTotals.kcal + refeicaoTotals.kcal,
						ptn_g: dailyTotals.ptn_g + refeicaoTotals.ptn_g,
						cho_g: dailyTotals.cho_g + refeicaoTotals.cho_g,
						lip_g: dailyTotals.lip_g + refeicaoTotals.lip_g,
					};
				},
				{kcal: 0, ptn_g: 0, cho_g: 0, lip_g: 0}
			);
		},
		[calculateRefeicaoTotals]
	);

	return {
		alimentos,
		loading,
		error,
		searchAlimentos,
		calculateItemRefeicao,
		calculateRefeicaoTotals,
		calculateDailyTotals,
	};
};
