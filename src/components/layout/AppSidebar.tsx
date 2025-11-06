import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Calculator,
  Utensils,
  Calendar,
  Settings,
  FileText,
  MessageSquare,
  Stethoscope, // New icon for unified consultation
  Shield // Admin icon
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Pacientes", path: "/patients" },
  { 
    icon: Stethoscope, 
    label: "Atendimento", 
    path: "/atendimento",
    description: "Fluxo unificado de consulta"
  },
  { 
    icon: Calculator, 
    label: "Calculadora", 
    path: "/calculator",
    badge: "LEGACY" // Mark as deprecated
  },
  { icon: Utensils, label: "Planos Alimentares", path: "/meal-plans" },
  { icon: Calendar, label: "Consultas", path: "/appointments" },
  { icon: Settings, label: "Configurações", path: "/settings" },
  { icon: MessageSquare, label: "Depoimentos", path: "/testimonials" },
  { 
    icon: Shield, 
    label: "Admin", 
    path: "/admin",
    description: "Painel administrativo"
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    className="w-full justify-start"
                  >
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
