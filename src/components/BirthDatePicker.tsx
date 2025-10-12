import React, {useState} from "react";
import {Calendar as CalendarIcon, ChevronLeft, ChevronRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {cn} from "@/lib/utils";
import {format} from "date-fns";

interface BirthDatePickerProps {
	value?: Date;
	onChange: (date: Date | undefined) => void;
	error?: boolean;
}

const months = [
	"Janeiro",
	"Fevereiro",
	"Março",
	"Abril",
	"Maio",
	"Junho",
	"Julho",
	"Agosto",
	"Setembro",
	"Outubro",
	"Novembro",
	"Dezembro",
];

const getDaysInMonth = (year: number, month: number) => {
	return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
	return new Date(year, month, 1).getDay();
};

export const BirthDatePicker: React.FC<BirthDatePickerProps> = ({value, onChange, error}) => {
	const currentYear = new Date().getFullYear();
	const [displayMonth, setDisplayMonth] = useState(value?.getMonth() ?? 0);
	const [displayYear, setDisplayYear] = useState(value?.getFullYear() ?? currentYear - 25);
	const [open, setOpen] = useState(false);

	// Generate years from 1900 to current year
	const years = Array.from({length: currentYear - 1900 + 1}, (_, i) => 1900 + i).reverse();

	const daysInMonth = getDaysInMonth(displayYear, displayMonth);
	const firstDay = getFirstDayOfMonth(displayYear, displayMonth);

	// Create array of days
	const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
	const emptyDays = Array.from({length: firstDay}, (_, i) => i);

	const handleDayClick = (day: number) => {
		const newDate = new Date(displayYear, displayMonth, day);
		onChange(newDate);
		setOpen(false);
	};

	const handleMonthChange = (month: string) => {
		setDisplayMonth(parseInt(month));
	};

	const handleYearChange = (year: string) => {
		setDisplayYear(parseInt(year));
	};

	const previousMonth = () => {
		if (displayMonth === 0) {
			setDisplayMonth(11);
			setDisplayYear(displayYear - 1);
		} else {
			setDisplayMonth(displayMonth - 1);
		}
	};

	const nextMonth = () => {
		if (displayMonth === 11) {
			setDisplayMonth(0);
			setDisplayYear(displayYear + 1);
		} else {
			setDisplayMonth(displayMonth + 1);
		}
	};

	const isSelected = (day: number) => {
		if (!value) return false;
		return (
			value.getDate() === day &&
			value.getMonth() === displayMonth &&
			value.getFullYear() === displayYear
		);
	};

	const isToday = (day: number) => {
		const today = new Date();
		return (
			today.getDate() === day &&
			today.getMonth() === displayMonth &&
			today.getFullYear() === displayYear
		);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"w-full justify-start text-left font-normal",
						!value && "text-muted-foreground",
						error && "border-red-500"
					)}>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{value ? format(value, "dd/MM/yyyy") : <span>Selecione uma data</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<div className="p-3 space-y-3 bg-background">
					{/* Header with Month/Year Selectors */}
					<div className="flex items-center justify-between gap-2">
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={previousMonth}>
							<ChevronLeft className="h-4 w-4" />
						</Button>

						<div className="flex gap-2">
							<Select
								value={displayMonth.toString()}
								onValueChange={handleMonthChange}>
								<SelectTrigger className="w-[130px] h-8">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{months.map((month) => (
										<SelectItem
											key={month}
											value={months.indexOf(month).toString()}>
											{month}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select value={displayYear.toString()} onValueChange={handleYearChange}>
								<SelectTrigger className="w-[100px] h-8">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="max-h-[200px]">
									{years.map((year) => (
										<SelectItem key={year} value={year.toString()}>
											{year}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={nextMonth}>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>

					{/* Calendar Grid */}
					<div className="space-y-2">
						{/* Weekday headers */}
						<div className="grid grid-cols-7 gap-1 text-center">
							{["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
								<div
									key={day}
									className="text-xs font-medium text-muted-foreground w-9 h-9 flex items-center justify-center">
									{day}
								</div>
							))}
						</div>

						{/* Days grid */}
						<div className="grid grid-cols-7 gap-1">
							{/* Empty cells for days before month starts */}
							{emptyDays.map((emptyDay) => (
								<div key={`empty-${emptyDay}`} className="w-9 h-9" />
							))}

							{/* Actual days */}
							{days.map((day) => (
								<Button
									key={day}
									variant="ghost"
									size="sm"
									onClick={() => handleDayClick(day)}
									className={cn(
										"h-9 w-9 p-0 font-normal",
										isSelected(day) &&
											"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
										isToday(day) &&
											!isSelected(day) &&
											"bg-accent text-accent-foreground",
										"hover:bg-accent"
									)}>
									{day}
								</Button>
							))}
						</div>
					</div>

					{/* Quick actions */}
					<div className="flex justify-end pt-2 border-t">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								const today = new Date();
								setDisplayMonth(today.getMonth());
								setDisplayYear(today.getFullYear());
							}}>
							Hoje
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};
