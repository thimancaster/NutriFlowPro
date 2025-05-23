
# NutriFlow Pro: Arquitetura da Aplicação

## Visão Geral

NutriFlow Pro é uma aplicação web para nutricionistas gerenciarem pacientes, realizar cálculos nutricionais, criar planos alimentares e gerenciar agendamentos. A aplicação segue uma arquitetura cliente-servidor, com o frontend React se comunicando com o backend Supabase.

## Frontend

### Tecnologias Principais

- **React**: Biblioteca JavaScript para construção de interfaces de usuário
- **TypeScript**: Superset JavaScript que adiciona tipagem estática
- **Vite**: Ferramenta de build moderna para desenvolvimento rápido
- **React Router**: Roteamento declarativo para aplicações React
- **TanStack Query (React Query)**: Gerenciamento de estado de dados e caching
- **Shadcn UI / Tailwind CSS**: Sistema de design e framework de utilitários CSS
- **React Hook Form**: Biblioteca para formulários performáticos e com validação
- **Zod**: Biblioteca de validação de esquema TypeScript
- **React Joyride**: Implementação de tours guiados
- **jsPDF**: Geração de documentos PDF no lado cliente

### Estrutura de Diretórios

```
src/
├── components/         # Componentes React reutilizáveis
│   ├── ui/             # Componentes básicos de UI
│   ├── patient/        # Componentes relacionados a pacientes
│   ├── calculator/     # Componentes da calculadora nutricional
│   └── ...
├── contexts/           # Contextos React para gerenciamento de estado global
├── hooks/              # Hooks React personalizados
├── pages/              # Componentes de página de nível superior
├── services/           # Serviços para comunicação com backend
├── tests/              # Testes unitários e de integração
├── types/              # Definições de tipos TypeScript
└── utils/              # Funções utilitárias
```

### Padrões Arquiteturais

1. **Component-Based Architecture**: A interface é construída com componentes reutilizáveis e compostos.
2. **Context API + Hooks**: Gerenciamento de estado global usando Context API do React e hooks personalizados.
3. **Service Layer**: Abstração da comunicação com o backend em serviços específicos de domínio.
4. **Data Fetching Pattern**: Uso de TanStack Query para busca, cache e sincronização de estado com o servidor.
5. **Error Boundary Pattern**: Componentes para capturar e lidar com erros em limites específicos.

## Backend (Supabase)

### Tecnologias

- **PostgreSQL**: Sistema de banco de dados relacional
- **Supabase Auth**: Autenticação e gerenciamento de usuários
- **Supabase Storage**: Armazenamento de arquivos (imagens, PDFs)
- **Supabase Functions**: Edge functions serverless para lógica de backend personalizada

### Esquema do Banco de Dados

Principais tabelas:

- **users**: Informações dos usuários (nutricionistas)
- **patients**: Cadastro de pacientes
- **consultations**: Registros de consultas nutricionais
- **meal_plans**: Planos alimentares criados
- **meal_plan_items**: Itens individuais dos planos alimentares
- **appointments**: Agendamentos de consultas
- **foods**: Banco de dados de alimentos com informações nutricionais

## Fluxo de Dados

1. **Autenticação**: O usuário faz login usando o serviço de autenticação do Supabase.
2. **Gerenciamento de Estado**: Os dados do usuário autenticado, pacientes ativos, etc. são armazenados em contextos React.
3. **Operações de Dados**:
   - Leitura: Os componentes usam hooks personalizados que chamam serviços para buscar dados do Supabase
   - Escrita: As operações de escrita são processadas por serviços que persistem os dados no Supabase
4. **Caching**: TanStack Query gerencia o cache de consultas, invalidação e revalidação

## Integração e Testes

- **Testes Unitários**: Jest/Vitest para testar componentes isolados e funções utilitárias
- **Testes de Integração**: Testing Library para testar comportamentos de componentes e fluxos
- **Testes E2E**: Playwright para simular interações reais de usuário

## Decisões de Design

- **Tema Claro/Escuro**: Suporte a temas usando CSS Variables e Context API.
- **Design System**: Uso de componentes Shadcn UI para consistência visual e acessibilidade.
- **Responsividade**: Design adaptável para dispositivos móveis, tablets e desktop.
- **Tipagem Forte**: TypeScript é usado em toda a aplicação para segurança de tipo e autocompletação.
- **Centralização de Erros**: Sistema centralizado de tratamento de erros com feedback visual consistente.
- **Código Modular**: Separação de responsabilidades em componentes, hooks, serviços e utilidades menores e focados.

## Monitoramento e Logging

- **Client-side Logging**: Sistema de logging estruturado para capturar eventos e erros no frontend.
- **Error Tracking**: Integração com serviço de rastreamento de erros para monitoramento em produção.
