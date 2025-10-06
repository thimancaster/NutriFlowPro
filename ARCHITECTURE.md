# 🏗️ Arquitetura NutriFlow Pro

**Data:** 06 de Outubro de 2025  
**Versão:** 2.0 - Pós-Refatoração Completa

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Sistema de Rotas](#sistema-de-rotas)
3. [Gestão de Estado (Contextos)](#gestão-de-estado)
4. [Motor de Cálculo Nutricional](#motor-de-cálculo-nutricional)
5. [Camada de Serviços](#camada-de-serviços)
6. [Componentes Principais](#componentes-principais)
7. [Fluxo de Dados](#fluxo-de-dados)
8. [Banco de Dados (Supabase)](#banco-de-dados)

---

## 🎯 Visão Geral

O NutriFlow Pro é uma plataforma SaaS para nutricionistas brasileiros, construída com:

- **Frontend:** React 18 + TypeScript + Vite
- **Estilização:** Tailwind CSS + shadcn/ui
- **Roteamento:** React Router v6
- **Backend:** Supabase (PostgreSQL + Auth + Storage + RPC)
- **Formulários:** React Hook Form + Zod
- **Data Fetching:** TanStack Query (React Query)

---

## 🛣️ Sistema de Rotas

### Rotas Públicas

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | `Index.tsx` | Landing page (redireciona para `/app` se autenticado) |
| `/login` | `Login.tsx` | Autenticação de usuários |
| `/signup` | `UnifiedSignup.tsx` | Cadastro de novos usuários |
| `/pricing` | `Pricing.tsx` | Planos e preços |
| `/forgot-password` | `ForgotPassword.tsx` | Recuperação de senha |
| `/reset-password` | `ResetPassword.tsx` | Redefinição de senha |
| `/auth/callback` | `AuthHandler.tsx` | Callback de autenticação |

### Rotas Protegidas (Prefixo `/app`)

| Rota | Página | Descrição |
|------|--------|-----------|
| `/app` | `Dashboard.tsx` | Dashboard principal |
| `/app/patients` | `Patients.tsx` | Listagem de pacientes |
| `/app/patients/:patientId` | `PatientProfile.tsx` | Perfil do paciente |
| `/app/appointments` | `AppointmentsPage.tsx` | Agendamentos |
| `/app/clinical` | `Clinical.tsx` | Fluxo clínico completo |
| `/app/calculator` | `Calculator.tsx` | Calculadora nutricional |
| `/app/meal-plans` | `MealPlans.tsx` | Planos alimentares |
| `/app/food-database` | `FoodDatabase.tsx` | Base de alimentos |
| `/app/settings` | `SettingsPage.tsx` | Configurações do usuário |
| `/app/subscription` | `Subscription.tsx` | Assinatura e pagamentos |
| `/app/debug` | `SystemDebug.tsx` | Debug do sistema (dev only) |

### ⚠️ REGRA CRÍTICA: Use Constants!

**SEMPRE** use as constants de `src/constants/routes.ts`:

```typescript
import { ROUTES, buildRoute } from '@/constants/routes';

// ✅ CORRETO
navigate(ROUTES.APP_DASHBOARD);
navigate(buildRoute.patientProfile(patientId));

// ❌ ERRADO
navigate('/dashboard'); // Rota não existe!
navigate('/app/patients/' + patientId); // Usar helper
```

---

## 🔄 Gestão de Estado (Contextos)

### Contextos Ativos

#### 1. `AuthContext` (`src/contexts/auth/AuthContext.tsx`)
**Responsabilidade:** Autenticação e autorização
- Estado do usuário logado
- Login/Logout
- Verificação de sessão
- Proteção de rotas

**Uso:**
```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

#### 2. `ClinicalWorkflowContext` (`src/contexts/clinical/ClinicalWorkflowContext.tsx`)
**Responsabilidade:** Fluxo de atendimento clínico
- Gerenciamento de etapas (anamnese → cálculos → plano)
- Paciente ativo na consulta
- Navegação entre steps

**Uso:**
```typescript
const { currentStep, nextStep, activePatient } = useClinicalWorkflow();
```

#### 3. `UnifiedNutritionContext` (`src/contexts/nutrition/UnifiedNutritionContext.tsx`)
**Responsabilidade:** Dados nutricionais da consulta
- Resultados de cálculos (TMB, GET, Macros)
- Targets nutricionais
- Plano alimentar gerado

**Uso:**
```typescript
const { calculationResults, setTargets } = useUnifiedNutrition();
```

#### 4. `PatientContext` (`src/contexts/patient/PatientContext.tsx`)
**Responsabilidade:** Gestão de pacientes
- CRUD de pacientes
- Seleção de paciente ativo
- Histórico de consultas

**Uso:**
```typescript
const { patients, selectedPatient, updatePatient } = usePatient();
```

#### 5. `MealPlanContext` (`src/contexts/MealPlanContext.tsx`)
**Responsabilidade:** Planos alimentares
- Geração de planos
- Edição de refeições
- Histórico de planos

**Uso:**
```typescript
const { generatePlan, currentPlan } = useMealPlan();
```

### 🗑️ Contextos Removidos (Obsoletos)
- ❌ `ConsultationDataContext` → Substituído por `UnifiedNutritionContext`
- ❌ `SecureAuthContext` → Nunca foi usado
- ❌ `CalculatorContext` → Funcionalidade movida para hooks

---

## 🧮 Motor de Cálculo Nutricional

### Localização Centralizada
**REGRA CRÍTICA:** TODO cálculo DEVE usar:
- **Hook:** `src/hooks/useOfficialCalculations.ts`
- **Fórmulas:** `src/utils/nutrition/official/formulas.ts`
- **Interface:** `src/components/calculator/official/OfficialCalculatorForm.tsx`

### Fórmulas Implementadas

#### 1. TMB (Taxa Metabólica Basal)
**Fórmula:** Harris-Benedict Revisada
```typescript
// Homens
TMB = 88.362 + (13.397 × peso) + (4.799 × altura) - (5.677 × idade)

// Mulheres
TMB = 447.593 + (9.247 × peso) + (3.098 × altura) - (4.330 × idade)
```

#### 2. GET (Gasto Energético Total)
**Fórmula:** TMB × Fator de Atividade × Ajuste por Objetivo
```typescript
Fatores de Atividade:
- Sedentário: 1.2
- Leve: 1.375
- Moderado: 1.55
- Intenso: 1.725
- Muito Intenso: 1.9

Ajustes por Objetivo:
- Emagrecimento: -500 kcal
- Hipertrofia: +400 kcal
- Manutenção: 0 kcal
```

#### 3. Macronutrientes
**Proteína (g/kg):**
- Eutrófico: 1.2 g/kg
- Sobrepeso/Obesidade: 2.0 g/kg
- Atleta: 1.8 g/kg

**Lipídios (g/kg):**
- Eutrófico: 0.8 g/kg
- Sobrepeso/Obesidade: 0.5 g/kg
- Atleta: 1.0 g/kg

**Carboidratos:**
```typescript
Carboidratos (kcal) = GET - (Proteína × 4) - (Lipídios × 9)
Carboidratos (g) = Carboidratos (kcal) / 4
```

---

## 🔌 Camada de Serviços

### Estrutura de Serviços (`src/services/`)

```
services/
├── patient/
│   └── operations/
│       ├── createPatient.ts
│       ├── updatePatient.ts
│       ├── deletePatient.ts
│       └── fetchPatients.ts
├── mealPlan/
│   └── mealPlanService.ts
├── calculation/
│   └── calculationService.ts
└── auth/
    └── authService.ts
```

### Padrão de Serviço

```typescript
// Exemplo: updatePatient.ts
export const updatePatient = async (
  patientId: string,
  data: Partial<Patient>
): Promise<{ success: boolean; data?: Patient; error?: string }> => {
  try {
    const { data: result, error } = await supabase
      .from('patients')
      .update(data)
      .eq('id', patientId)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

---

## 🧩 Componentes Principais

### Layout
- **`Layout.tsx`:** Container principal (Navbar + Outlet)
- **`Navbar.tsx`:** Barra de navegação superior
- **`ProtectedRoute.tsx`:** Wrapper para rotas autenticadas

### Navegação
- **`NavbarDesktopNavigation.tsx`:** Menu desktop
- **`NavbarMobileMenu.tsx`:** Menu mobile (hamburguer)
- **`NavbarUserMenu.tsx`:** Menu do usuário (avatar + dropdown)

### Calculadora
- **`OfficialCalculatorForm.tsx`:** Formulário de inputs
- **`CalculatorResults.tsx`:** Display de resultados
- **`useOfficialCalculations.ts`:** Hook de cálculos

### Plano Alimentar
- **`MealPlanGenerator.tsx`:** Gerador de planos
- **`MealPlanCard.tsx`:** Card de refeição
- **`MealPlanService.ts`:** Comunicação com RPC

---

## 📊 Fluxo de Dados

### Fluxo de Geração de Plano Alimentar

```
Usuário preenche targets
    ↓
MealPlanGenerator.tsx
    ↓
MealPlanService.generateMealPlan()
    ↓
Supabase RPC: generate_meal_plan_with_cultural_rules
    ↓
Seleciona alimentos culturalmente apropriados
    ↓
Calcula porções baseadas em targets
    ↓
Insere em meal_plans + meal_plan_items
    ↓
Retorna meal_plan_id
    ↓
React Query invalida cache
    ↓
Componente re-renderiza com novo plano
```

### Fluxo de Autenticação

```
Login.tsx
    ↓
AuthContext.login()
    ↓
Supabase Auth
    ↓
Sucesso? → Set user state → Navigate para /app
    ↓
ProtectedRoute verifica auth
    ↓
Renderiza Layout + Dashboard
```

---

## 🗄️ Banco de Dados (Supabase)

### Tabelas Principais

| Tabela | Registros | Descrição |
|--------|-----------|-----------|
| `patients` | 0 | Dados dos pacientes |
| `foods` | 3.481 | Base de alimentos (TACO + USDA) |
| `meal_plans` | 0 | Planos alimentares gerados |
| `meal_plan_items` | 0 | Itens individuais dos planos |
| `meal_cultural_rules` | ~50 | Regras culturais brasileiras |
| `anthropometry` | 0 | Medidas antropométricas |
| `calculations` | 0 | Histórico de cálculos |

### RPC Functions

#### `generate_meal_plan_with_cultural_rules`
**Entrada:**
- `p_user_id`: UUID
- `p_patient_id`: UUID
- `p_target_calories`: NUMERIC
- `p_target_protein`: NUMERIC
- `p_target_carbs`: NUMERIC
- `p_target_fats`: NUMERIC
- `p_date`: TEXT (opcional)

**Saída:** UUID (meal_plan_id)

**Lógica:**
1. Cria registro base em `meal_plans`
2. Define distribuição calórica:
   - Café: 25%
   - Lanche manhã: 10%
   - Almoço: 30%
   - Lanche tarde: 10%
   - Jantar: 20%
   - Ceia: 5%
3. Para cada refeição:
   - Seleciona alimentos culturalmente apropriados (`meal_cultural_rules`)
   - Calcula porções baseadas nas metas
   - Insere em `meal_plan_items`
4. Atualiza JSON em `meal_plans.meals`

### Row Level Security (RLS)

**Padrão de Políticas:**
```sql
-- Usuários acessam apenas seus próprios dados
CREATE POLICY "users_own_data"
ON table_name
FOR ALL
USING (user_id = auth.uid());

-- Usuários acessam dados dos seus pacientes
CREATE POLICY "users_access_patient_data"
ON table_name
FOR ALL
USING (
  patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  )
);
```

---

## 🚀 Próximos Passos

### Melhorias Planejadas
1. ✅ Unificação de rotas e limpeza de código
2. ⏳ Cache com Redis para regras culturais
3. ⏳ Processamento assíncrono de planos complexos
4. ⏳ Personalização de distribuição calórica
5. ⏳ Sistema de templates de planos

### Performance
- Implementar lazy loading em todas as rotas (✅ Feito)
- Code splitting por feature
- Cache de queries frequentes
- Optimistic updates

---

## 📝 Convenções de Código

### Nomenclatura
- **Componentes:** PascalCase (`PatientCard.tsx`)
- **Hooks:** camelCase com prefixo `use` (`usePatient.ts`)
- **Serviços:** camelCase (`patientService.ts`)
- **Contextos:** PascalCase com sufixo `Context` (`AuthContext.tsx`)
- **Constants:** UPPER_SNAKE_CASE (`ROUTES`, `API_ENDPOINTS`)

### Estrutura de Arquivos
```typescript
// 1. Imports externos
import React from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Imports internos (components, hooks, utils)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth/AuthContext';

// 3. Tipos e interfaces
interface Props {
  data: string;
}

// 4. Componente
export default function Component({ data }: Props) {
  // 4.1. Hooks
  const navigate = useNavigate();
  
  // 4.2. Estado
  const [state, setState] = useState();
  
  // 4.3. Effects
  useEffect(() => {}, []);
  
  // 4.4. Handlers
  const handleClick = () => {};
  
  // 4.5. Render
  return <div />;
}
```

---

**Última Atualização:** 06/10/2025  
**Mantenedor:** Equipe NutriFlow Pro  
**Contato:** Documentação mantida via Lovable + GitHub
