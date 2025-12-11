/**
 * GLOBAL SEARCH COMPONENT
 * Command palette style search with Ctrl+K shortcut
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { 
  Search, 
  User, 
  Calendar, 
  FileText, 
  Calculator, 
  Settings, 
  BarChart3,
  Trophy,
  Utensils,
  Database
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';

interface SearchResult {
  id: string;
  type: 'patient' | 'page' | 'action';
  title: string;
  description?: string;
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
}

const GlobalSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Search patients
  const { data: patients } = useQuery({
    queryKey: ['global-search-patients', query],
    queryFn: async () => {
      if (!user?.id || !query.trim()) return [];
      
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, email')
        .eq('user_id', user.id)
        .ilike('name', `%${query}%`)
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!query.trim() && !!user?.id,
  });

  // Static pages for quick navigation
  const pages: SearchResult[] = [
    { id: 'dashboard', type: 'page', title: 'Dashboard', icon: <BarChart3 className="h-4 w-4" />, href: '/dashboard' },
    { id: 'patients', type: 'page', title: 'Pacientes', icon: <User className="h-4 w-4" />, href: '/patients' },
    { id: 'appointments', type: 'page', title: 'Agendamentos', icon: <Calendar className="h-4 w-4" />, href: '/appointments' },
    { id: 'clinical', type: 'page', title: 'Atendimento Clínico', icon: <Utensils className="h-4 w-4" />, href: '/clinical' },
    { id: 'calculator', type: 'page', title: 'Calculadora Nutricional', icon: <Calculator className="h-4 w-4" />, href: '/calculator' },
    { id: 'reports', type: 'page', title: 'Relatórios', icon: <FileText className="h-4 w-4" />, href: '/reports' },
    { id: 'gamification', type: 'page', title: 'Conquistas', icon: <Trophy className="h-4 w-4" />, href: '/gamification' },
    { id: 'food-database', type: 'page', title: 'Banco de Alimentos', icon: <Database className="h-4 w-4" />, href: '/food-database' },
    { id: 'settings', type: 'page', title: 'Configurações', icon: <Settings className="h-4 w-4" />, href: '/settings' },
  ];

  // Quick actions
  const actions: SearchResult[] = [
    { id: 'new-patient', type: 'action', title: 'Novo Paciente', description: 'Cadastrar um novo paciente', icon: <User className="h-4 w-4" />, href: '/patients/new' },
    { id: 'new-consultation', type: 'action', title: 'Nova Consulta', description: 'Iniciar um novo atendimento', icon: <FileText className="h-4 w-4" />, href: '/clinical' },
  ];

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery('');
    if (result.href) {
      navigate(result.href);
    } else if (result.action) {
      result.action();
    }
  };

  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-md border transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Buscar...</span>
        <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Buscar pacientes, páginas, ações..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          
          {/* Patient Results */}
          {patients && patients.length > 0 && (
            <CommandGroup heading="Pacientes">
              {patients.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={patient.name}
                  onSelect={() => handleSelect({
                    id: patient.id,
                    type: 'patient',
                    title: patient.name,
                    icon: <User className="h-4 w-4" />,
                    href: `/patients/${patient.id}`
                  })}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>{patient.name}</span>
                  {patient.email && (
                    <span className="ml-2 text-xs text-muted-foreground">{patient.email}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Quick Actions */}
          <CommandGroup heading="Ações Rápidas">
            {actions.map((action) => (
              <CommandItem
                key={action.id}
                value={action.title}
                onSelect={() => handleSelect(action)}
              >
                {action.icon}
                <span className="ml-2">{action.title}</span>
                {action.description && (
                  <span className="ml-2 text-xs text-muted-foreground">{action.description}</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Pages */}
          <CommandGroup heading="Páginas">
            {filteredPages.map((page) => (
              <CommandItem
                key={page.id}
                value={page.title}
                onSelect={() => handleSelect(page)}
              >
                {page.icon}
                <span className="ml-2">{page.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;
