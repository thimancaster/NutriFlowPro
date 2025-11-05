# NutriFlow Pro: Alinhamento, Coeficiente Comum e Detalhamento de Implementação (V2.0)

## 1. Validação do Alinhamento com a Planilha Central

A análise da planilha **PLANILHADIETACOMCARDÁPIO.xlsx** confirmou o alinhamento do **Coeficiente Comum de Alinhamento** proposto, que é a **"Fonte Única de Verdade"**.

A planilha reforça a estrutura de cálculo que o sistema deve adotar:
1.  **Cálculo de Macros por Dia:** A aba `Macros por DIA` é a fonte de verdade para a definição dos macronutrientes totais (PTN, LIP, CHO) e do Valor Energético Total (VET).
2.  **Distribuição por Refeição:** As abas `REF1` a `REF6` confirmam a necessidade de implementar um sistema de **6 refeições** com distribuição percentual dos macros e calorias, permitindo a montagem do cardápio.

**Conclusão da Validação:** O plano de ação anterior (criação do documento mestre e refatoração do código para usar valores formalizados) está **totalmente validado** pela estrutura da planilha. A principal inconsistência (valores de g/kg para PTN) deve ser resolvida no novo documento mestre (`NUTRIFLOW_PRO_SPEC_V2.0.md`) adotando os valores da "Planilha Central" (conforme detalhado no `AUDIT_NUTRITIONAL_SYSTEM.md`).

## 2. Detalhamento de Implementação: Novas Equações Nutricionais

Para elevar a precisão e a aplicabilidade clínica do NutriFlow Pro, a implementação das equações sugeridas é fundamental. O detalhamento a seguir fornece as informações necessárias para a implementação no módulo de cálculos (`src/utils/macronutrientCalculations.ts` ou similar).

### 2.1. Equações para Estimativa do Gasto Energético (TMB/GET)

| Equação | Quando Usar | Fórmula (TMB) | Parâmetros de Entrada |
| :--- | :--- | :--- | :--- |
| **Mifflin-St Jeor** | População em geral, incluindo sobrepeso e obesidade. | **Homens:** \((10 \times P) + (6.25 \times A) - (5 \times I) + 5\) | Peso (P) em kg, Altura (A) em cm, Idade (I) em anos. |
| | | **Mulheres:** \((10 \times P) + (6.25 \times A) - (5 \times I) - 161\) | |
| **Katch-McArdle** | Atletas e indivíduos com percentual de gordura corporal baixo e conhecido. | \(370 + (21.6 \times MM)\) | Massa Magra (MM) em kg. |
| **Cunningham** | Atletas, baseada na massa magra. | \((22 \times MM) + 500\) | Massa Magra (MM) em kg. |
| **OMS/FAO/UNU** | Contextos de saúde pública, populações específicas e mais jovens. | **Fórmulas por Faixa Etária e Sexo:** (Exemplo: Homens 18-30 anos: \((15.3 \times P) + 679\)) | Peso (P) em kg, Idade (I) em anos, Sexo. |
| **Penn State** | Pacientes em estado crítico (UTIs), especialmente com obesidade mórbida. | **Penn State 2003b:** \(GEB = (Mifflin \times 0.96) + (VE \times 31) + (Tmax \times 167) - 6212\) | Mifflin-St Jeor TMB, Ventilação Minuto (VE), Temperatura Máxima (Tmax). **Nota:** Requer dados clínicos avançados. |

**Nota de Implementação:** O NutriFlow Pro deve permitir que o nutricionista selecione a fórmula mais apropriada para o perfil do paciente, com sugestões automáticas baseadas no perfil (ex: Katch-McArdle sugerida para "Atleta").

### 2.2. Equações para Estimativa da Composição Corporal

A implementação dessas equações requer a coleta de dados antropométricos adicionais (dobras cutâneas).

| Método | Quando Usar | Parâmetros de Entrada | Saída |
| :--- | :--- | :--- | :--- |
| **Dobras Cutâneas (Jackson & Pollock, Durnin & Womersley)** | Estimativa indireta do percentual de gordura corporal. | Espessura de dobras cutâneas (tríceps, bíceps, subescapular, suprailíaca, etc.) em mm. | Densidade Corporal (DC) e Percentual de Gordura Corporal (%GC). |
| **Equações de Evans** | Estimativa do percentual de gordura corporal para atletas. | Dobras cutâneas específicas. | Percentual de Gordura Corporal (%GC). |

**Fluxo de Implementação:**
1.  Criar um novo formulário de entrada de dados antropométricos para as dobras cutâneas.
2.  Implementar as fórmulas de Densidade Corporal (DC) e, em seguida, a fórmula de Siri para o Percentual de Gordura Corporal (%GC): \(\%GC = (495 / DC) - 450\).
3.  O resultado do %GC deve ser usado como *input* para as equações de TMB baseadas em Massa Magra (MM), como Katch-McArdle e Cunningham, onde \(MM = P - (P \times \%GC)\).

## 3. Plano de Ação Consolidado (V2.0)

O plano de ação para o alinhamento e a expansão do NutriFlow Pro é o seguinte:

| Etapa | Ação | Coeficiente Comum |
| :--- | :--- | :--- |
| **1. Documentação Mestra** | Criar o arquivo `NUTRIFLOW_PRO_SPEC_V2.0.md`. | **Fonte Única de Verdade** (Documentação) |
| **2. Formalização de Macros** | No novo documento, formalizar os valores de PTN/LIP (g/kg) adotando os valores da "Planilha Central" (ex: Atleta PTN = 2.2 g/kg). | **Fonte Única de Verdade** (Regra de Negócio) |
| **3. Implementação de TMB/GET** | Implementar as novas equações de TMB/GET (Mifflin-St Jeor, Katch-McArdle, Cunningham, OMS/FAO/UNU, Penn State) no código. | **Precisão Clínica** |
| **4. Implementação de Composição Corporal** | Implementar as equações de dobras cutâneas para calcular a Massa Magra (MM) e usá-la como *input* para Katch-McArdle e Cunningham. | **Precisão Clínica** |
| **5. Refatoração do Código** | Garantir que o `ConsultationDataProvider` seja a única fonte de estado e lógica de cálculo, eliminando o código legado. | **Fonte Única de Verdade** (Arquitetura) |
| **6. Arquivamento** | Mover todos os documentos antigos para uma pasta `docs/LEGACY` no GitHub. | **Limpeza e Alinhamento** |

---
### Referências
[1] Conteúdo da ideia proposta (`pasted_content.txt`).
[2] Análise da Planilha Central (`PLANILHADIETACOMCARDÁPIO.xlsx`).
[3] Detalhamento das Equações de TMB (Katch-McArdle, Cunningham, OMS/FAO/UNU, Penn State) - Pesquisa de Implementação.
[4] Detalhamento das Equações de Composição Corporal (Dobras Cutâneas) - Pesquisa de Implementação.
