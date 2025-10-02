# 🧪 Checklist de Testes - NutriFlow Pro

Este documento contém todos os testes manuais necessários para validar a aplicação após a refatoração.

---

## ✅ FASE 3: VALIDAÇÃO FUNCIONAL

### 🔐 1. Sistema de Autenticação

#### 1.1 Login
- [ ] Login com credenciais válidas funciona
- [ ] Login com credenciais inválidas exibe erro apropriado
- [ ] Após login, redireciona para `/app` (dashboard)
- [ ] Não há loop infinito de redirecionamento
- [ ] Token é armazenado corretamente no localStorage

#### 1.2 Logout
- [ ] Botão de logout está visível no menu do usuário
- [ ] Logout redireciona para `/login`
- [ ] Token é removido do localStorage
- [ ] Não é possível acessar rotas protegidas após logout

#### 1.3 Proteção de Rotas
- [ ] Tentar acessar `/app` sem login redireciona para `/login`
- [ ] `ProtectedRoute` exibe loading enquanto verifica sessão
- [ ] Após verificação, se autenticado, exibe conteúdo
- [ ] `initialLoad` previne loops de redirecionamento

#### 1.4 Recuperação de Senha
- [ ] Link "Esqueci minha senha" funciona
- [ ] Email é enviado com link de reset
- [ ] Link de reset funciona e permite criar nova senha

---

### 🧭 2. Navegação

#### 2.1 Navbar Desktop
- [ ] Logo "NutriFlow Pro" redireciona para `/app`
- [ ] Link "Dashboard" funciona (`/app`)
- [ ] Link "Pacientes" funciona (`/app/patients`)
- [ ] Link "Agendamentos" funciona (`/app/appointments`)
- [ ] Link "Calculadora" funciona (`/app/calculator`)
- [ ] Link "Plano Alimentar" funciona (`/app/meal-plans`)
- [ ] Link "Clínico" funciona (`/app/clinical`)
- [ ] Link ativo tem estilo diferenciado
- [ ] Não há link "Consulta" (removido com sucesso)

#### 2.2 Navbar Mobile
- [ ] Menu hamburguer abre/fecha corretamente
- [ ] Todos os links funcionam igual à versão desktop
- [ ] Toggle de tema está visível no mobile
- [ ] Ao clicar em um link, o menu fecha automaticamente

#### 2.3 Menu do Usuário
- [ ] Avatar/nome do usuário é exibido corretamente
- [ ] Menu dropdown abre ao clicar
- [ ] Opção "Configurações" redireciona para `/app/settings`
- [ ] Opção "Logout" funciona

#### 2.4 Navegação Geral
- [ ] Não há rotas quebradas (404) ao clicar em links
- [ ] Histórico do navegador funciona (botão voltar)
- [ ] URLs são consistentes (sem `/app` duplicado)

---

### 🧮 3. Calculadora Nutricional

#### 3.1 Interface
- [ ] Formulário de entrada carrega corretamente
- [ ] Campos obrigatórios são validados
- [ ] Dropdowns (sexo, atividade, objetivo) funcionam

#### 3.2 Cálculos
- [ ] Ao clicar "Calcular", resultados são exibidos
- [ ] **3 fórmulas são exibidas**:
  - [ ] Harris-Benedict
  - [ ] Mifflin-St Jeor
  - [ ] Tinsley
- [ ] Valores de TMB estão corretos
- [ ] Valores de GET estão corretos
- [ ] Distribuição de macronutrientes é exibida
- [ ] Valores são formatados corretamente (kcal, gramas)

#### 3.3 Validação
- [ ] Campos vazios exibem erro ao tentar calcular
- [ ] Peso/altura negativos são rejeitados
- [ ] Idade inválida é rejeitada

#### 3.4 Uso do Motor Oficial
**⚠️ CRÍTICO**: Verificar no código que a calculadora usa `useOfficialCalculations`
- [ ] Arquivo: `src/pages/Calculator.tsx`
- [ ] Importa e usa `useOfficialCalculations`
- [ ] Não há lógica de cálculo duplicada/local

---

### 🩺 4. Fluxo Clínico Unificado

#### 4.1 Entrada no Fluxo
- [ ] Rota `/app/clinical` carrega corretamente
- [ ] `ClinicalWorkflowContext` está ativo
- [ ] Não há erros de console relacionados a contextos

#### 4.2 Etapa 1: Seleção de Paciente
- [ ] Lista de pacientes é exibida
- [ ] Busca/filtro de pacientes funciona
- [ ] Ao selecionar paciente, avança para próxima etapa
- [ ] Opção "Novo Paciente" está disponível

#### 4.3 Etapa 2: Anamnese/Antropometria
- [ ] Formulário de dados clínicos é exibido
- [ ] Campos são salvos ao preencher
- [ ] Se paciente tem histórico, dados são pré-preenchidos
- [ ] Botão "Próximo" avança para cálculos

#### 4.4 Etapa 3: Cálculos Nutricionais
- [ ] **Usa o mesmo motor da calculadora** (`useOfficialCalculations`)
- [ ] Dados do paciente são usados automaticamente
- [ ] Resultados são exibidos
- [ ] Pode editar parâmetros e recalcular

#### 4.5 Etapa 4: Geração de Plano Alimentar
- [ ] Baseado nos cálculos da etapa anterior
- [ ] Permite distribuir calorias entre refeições
- [ ] Pode adicionar/remover refeições

#### 4.6 Etapa 5: Salvamento
- [ ] Dados são salvos no Supabase
- [ ] Confirmação de sucesso é exibida
- [ ] Pode exportar relatório
- [ ] Pode voltar ao dashboard

#### 4.7 Navegação Entre Etapas
- [ ] Botão "Voltar" funciona em todas as etapas
- [ ] Botão "Próximo" funciona em todas as etapas
- [ ] Estado é mantido ao navegar entre etapas
- [ ] Pode sair do fluxo e retomar depois

#### 4.8 Histórico de Sessões
- [ ] Ao selecionar paciente com histórico, lista é exibida
- [ ] Pode visualizar sessões anteriores
- [ ] Pode iniciar nova sessão baseada em anterior

---

### 📦 5. Outras Funcionalidades

#### 5.1 Dashboard
- [ ] Cards de resumo são exibidos
- [ ] Gráficos carregam corretamente
- [ ] Dados estão atualizados

#### 5.2 Pacientes
- [ ] Lista de pacientes carrega
- [ ] Busca funciona
- [ ] Pode criar novo paciente
- [ ] Pode editar paciente existente
- [ ] Pode visualizar perfil do paciente

#### 5.3 Planos Alimentares
- [ ] Lista de planos é exibida
- [ ] Pode criar novo plano
- [ ] Pode editar plano existente
- [ ] Pode exportar plano

#### 5.4 Configurações
- [ ] Pode editar dados do perfil
- [ ] Pode alterar senha
- [ ] Toggle de tema funciona (light/dark)

---

## 🐛 6. Verificação de Erros

### Console do Navegador
- [ ] Não há erros de JavaScript
- [ ] Não há warnings críticos do React
- [ ] Não há erros de importação de módulos
- [ ] Não há erros de tipos TypeScript

### Network
- [ ] Requisições à API retornam status 200/201
- [ ] Não há requisições falhando (400/500)
- [ ] Autenticação Supabase funciona

### Performance
- [ ] Páginas carregam em menos de 2 segundos
- [ ] Navegação entre páginas é fluida
- [ ] Não há travamentos ou lentidão

---

## 📊 7. Compatibilidade

### Navegadores
- [ ] Chrome/Edge (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

### Responsividade
- [ ] Layout funciona em desktop (1920x1080)
- [ ] Layout funciona em tablet (768x1024)
- [ ] Layout funciona em mobile (375x667)
- [ ] Menu mobile funciona corretamente
- [ ] Não há elementos cortados ou sobrepostos

---

## ✅ Como Usar Este Checklist

1. **Imprima ou abra em outra tela** este documento
2. **Teste cada item** na ordem apresentada
3. **Marque com ✅** itens que passaram
4. **Marque com ❌** itens que falharam
5. **Anote observações** ao lado de cada item, se necessário

### Exemplo de Anotação

```
✅ Login com credenciais válidas funciona
❌ Login com credenciais inválidas exibe erro apropriado
   → Obs: Erro genérico, não específica se é email ou senha
```

---

## 🚨 Itens Críticos (Prioridade Máxima)

Se algum destes falhar, **PARE** e reporte imediatamente:

1. ❗ **Autenticação**: Login/logout funcionando
2. ❗ **Navegação**: Todas as rotas principais acessíveis
3. ❗ **Calculadora**: Exibe as 3 fórmulas corretas
4. ❗ **Fluxo Clínico**: Pode criar uma sessão completa
5. ❗ **Salvamento**: Dados persistem no banco

---

## 📝 Relatório de Bugs

Se encontrar bugs, reporte com:
- **Descrição**: O que aconteceu
- **Passos**: Como reproduzir
- **Esperado**: O que deveria acontecer
- **Screenshots**: Se possível
- **Console**: Erros do console do navegador

**Template:**
```
BUG: [Título curto]

Descrição: 
[O que aconteceu]

Passos para reproduzir:
1. [Primeiro passo]
2. [Segundo passo]
3. [...]

Comportamento esperado:
[O que deveria acontecer]

Screenshots:
[Link ou anexo]

Erros do console:
[Copiar e colar]
```

---

**Boa sorte nos testes! 🚀**

**Última Atualização**: 2025-10-02
