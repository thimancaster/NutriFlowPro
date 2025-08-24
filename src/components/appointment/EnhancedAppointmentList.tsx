import React, {useState} from "react";
import {Card, CardHeader, CardContent, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {Checkbox} from "@/components/ui/checkbox";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {PlusCircle, Search, Filter, Calendar, Grid, List, BarChart3, Grip} from "lucide-react";
import {Appointment, AppointmentStatus} from "@/types/appointment";
import {useBulkAppointmentOperations} from "@/hooks/appointments/useBulkAppointmentOperations";
import AppointmentCalendarView from "./AppointmentCalendarView";
import DragDropAppointmentCalendar from "./DragDropAppointmentCalendar";
import AppointmentAnalyticsDashboard from "./analytics/AppointmentAnalyticsDashboard";
import BulkOperationsToolbar from "./BulkOperationsToolbar";
import QuickActionsMenu from "./QuickActionsMenu";
import {format, parseISO} from "date-fns";
import {ptBR} from "date-fns/locale";

interface EnhancedAppointmentListProps {
	appointments: Appointment[];
	isLoading: boolean;
	error: Error | null;
	onAddNew: () => void;
	onEdit: (appointment: Appointment) => void;
	onDelete: (id: string) => void;
	onRefresh: () => Promise<void>;
}

const EnhancedAppointmentList: React.FC<EnhancedAppointmentListProps> = ({
	appointments,
	isLoading,
	error,
	onAddNew,
	onEdit,
	onDelete,
	onRefresh,
}) => {
	const [viewMode, setViewMode] = useState<"list" | "calendar" | "dragdrop" | "analytics">(
		"list"
	);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());

	const {selectedAppointments, toggleSelection, selectAll, clearSelection} =
		useBulkAppointmentOperations(onRefresh);

	// Filter appointments based on search and status
	const filteredAppointments = appointments.filter((appointment) => {
		const matchesSearch =
			appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			appointment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
			appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	const handleAppointmentClick = (appointment: Appointment) => {
		onEdit(appointment);
	};

	const handleAppointmentUpdate = (updatedAppointment: Appointment) => {
		// Update the appointment in the local state
		onRefresh();
	};

	if (isLoading) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center justify-center">
						<div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
						Carregando agendamentos...
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="text-center text-red-600">
						<p>Erro ao carregar agendamentos: {error.message}</p>
						<Button onClick={onRefresh} className="mt-2">
							Tentar Novamente
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header with filters and view toggle */}
			<Card>
				<CardHeader className="pb-4">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
						<CardTitle className="text-2xl font-bold">
							Sistema de Agendamentos
						</CardTitle>
						<div className="flex flex-wrap items-center gap-2">
							<Button
								variant={viewMode === "list" ? "default" : "outline"}
								size="sm"
								onClick={() => setViewMode("list")}>
								<List className="h-4 w-4 mr-2" />
								Lista
							</Button>
							<Button
								variant={viewMode === "calendar" ? "default" : "outline"}
								size="sm"
								onClick={() => setViewMode("calendar")}>
								<Calendar className="h-4 w-4 mr-2" />
								Calendário
							</Button>
							<Button
								variant={viewMode === "dragdrop" ? "default" : "outline"}
								size="sm"
								onClick={() => setViewMode("dragdrop")}>
								<Grip className="h-4 w-4 mr-2" />
								Interativo
							</Button>
							<Button
								variant={viewMode === "analytics" ? "default" : "outline"}
								size="sm"
								onClick={() => setViewMode("analytics")}>
								<BarChart3 className="h-4 w-4 mr-2" />
								Analytics
							</Button>
							<Button
								onClick={onAddNew}
								className="bg-nutri-green hover:bg-nutri-green-dark">
								<PlusCircle className="mr-2 h-4 w-4" />
								Nova Consulta
							</Button>
						</div>
					</div>

					{/* Filters - Only show for list view */}
					{viewMode === "list" && (
						<div className="flex flex-col sm:flex-row gap-4 mt-4">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Buscar por paciente, tipo ou notas..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="w-48">
									<Filter className="h-4 w-4 mr-2" />
									<SelectValue placeholder="Filtrar por status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Todos os Status</SelectItem>
									<SelectItem value="scheduled">Agendado</SelectItem>
									<SelectItem value="completed">Concluído</SelectItem>
									<SelectItem value="cancelled">Cancelado</SelectItem>
									<SelectItem value="no_show">Faltou</SelectItem>
									<SelectItem value="rescheduled">Reagendado</SelectItem>
								</SelectContent>
							</Select>
						</div>
					)}
				</CardHeader>
			</Card>

			{/* Bulk Operations Toolbar - Only show for list view */}
			{viewMode === "list" && (
				<BulkOperationsToolbar
					selectedAppointments={selectedAppointments}
					appointments={filteredAppointments}
					onClearSelection={clearSelection}
					onRefresh={onRefresh}
				/>
			)}

			{/* Content based on view mode */}
			{viewMode === "analytics" ? (
				<AppointmentAnalyticsDashboard />
			) : viewMode === "dragdrop" ? (
				<DragDropAppointmentCalendar
					appointments={filteredAppointments}
					onAppointmentUpdate={handleAppointmentUpdate}
					onAppointmentClick={handleAppointmentClick}
				/>
			) : viewMode === "calendar" ? (
				<AppointmentCalendarView
					appointments={filteredAppointments}
					onDateSelect={setSelectedDate}
					onAppointmentClick={handleAppointmentClick}
					onNewAppointment={onAddNew}
					selectedDate={selectedDate}
				/>
			) : (
				<Card>
					<CardContent className="p-6">
						{filteredAppointments.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								<Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
								<p>Nenhum agendamento encontrado</p>
								<Button variant="outline" className="mt-4" onClick={onAddNew}>
									Criar Primeiro Agendamento
								</Button>
							</div>
						) : (
							<div className="space-y-4">
								{/* Select All */}
								<div className="flex items-center gap-2 pb-2 border-b">
									<Checkbox
										checked={
											selectedAppointments.length ===
											filteredAppointments.length
										}
										onCheckedChange={(checked) => {
											if (checked) {
												selectAll(filteredAppointments);
											} else {
												clearSelection();
											}
										}}
									/>
									<span className="text-sm text-muted-foreground">
										Selecionar todos ({filteredAppointments.length})
									</span>
								</div>

								{/* Appointments List */}
								{filteredAppointments.map((appointment) => (
									<div
										key={appointment.id}
										className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg-elevated transition-colors group">
										<Checkbox
											checked={selectedAppointments.includes(appointment.id)}
											onCheckedChange={() => toggleSelection(appointment.id)}
										/>

										{/* Avatar/Time Badge */}
										<div className="flex-shrink-0">
											<div className="bg-nutri-blue-light/20 dark:bg-nutri-blue/20 text-nutri-blue dark:text-nutri-blue h-12 w-16 rounded-lg flex items-center justify-center font-medium text-sm">
												{appointment.start_time
													? format(
															parseISO(appointment.start_time),
															"HH:mm"
													  )
													: format(parseISO(appointment.date), "dd")}
											</div>
										</div>

										<div
											className="flex-1 cursor-pointer min-w-0"
											onClick={() => handleAppointmentClick(appointment)}>
											{/* Header with patient name and date */}
											<div className="flex items-start justify-between mb-2">
												<div className="min-w-0 flex-1">
													<h3 className="font-semibold text-gray-900 dark:text-dark-text-primary truncate">
														{appointment.patientName ||
															"Paciente não encontrado"}
													</h3>
													<p className="text-sm text-muted-foreground">
														{format(
															parseISO(appointment.date),
															"dd/MM/yyyy - EEEE",
															{locale: ptBR}
														)}
														{appointment.start_time && (
															<span className="ml-2 font-medium">
																às{" "}
																{format(
																	parseISO(
																		appointment.start_time
																	),
																	"HH:mm"
																)}
															</span>
														)}
													</p>
												</div>
											</div>

											{/* Status and Type Badges */}
											<div className="flex items-center gap-2 mb-2">
												<Badge
													variant={
														appointment.status === "completed"
															? "success"
															: appointment.status === "cancelled"
															? "destructive"
															: appointment.status === "no_show"
															? "warning"
															: "info"
													}
													className="text-xs">
													{appointment.status === "scheduled"
														? "Agendado"
														: appointment.status === "completed"
														? "Concluído"
														: appointment.status === "cancelled"
														? "Cancelado"
														: appointment.status === "no_show"
														? "Faltou"
														: appointment.status === "rescheduled"
														? "Reagendado"
														: appointment.status}
												</Badge>
												<Badge variant="outline" className="text-xs">
													{appointment.type === "initial"
														? "Avaliação Inicial"
														: appointment.type === "followup"
														? "Acompanhamento"
														: appointment.type === "reevaluation"
														? "Reavaliação"
														: appointment.type}
												</Badge>
											</div>

											{/* Notes */}
											{appointment.notes && (
												<p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
													{appointment.notes}
												</p>
											)}
										</div>

										{/* Quick Actions */}
										<div className="flex-shrink-0">
											<QuickActionsMenu
												appointment={appointment}
												onUpdate={handleAppointmentUpdate}
												onDelete={onDelete}
											/>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default EnhancedAppointmentList;
