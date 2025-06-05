import * as React from "react";
import {useLocation, Link} from "react-router-dom";
import {Home} from "lucide-react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Map routes to friendly names
const routeNameMap: Record<string, string> = {
	"": "Início",
	dashboard: "Dashboard",
	patients: "Pacientes",
	patient: "Paciente",
	new: "Novo",
	calculator: "Calculadora",
	"meal-plans": "Planos Alimentares",
	"meal-plan": "Plano Alimentar",
	appointments: "Agendamentos",
	settings: "Configurações",
};

export function BreadcrumbNav() {
	const location = useLocation();
	const pathSegments = location.pathname.split("/").filter(Boolean);

	// Special case for patient routes with IDs
	const breadcrumbItems = pathSegments.map((segment, index) => {
		let name = routeNameMap[segment] || segment;

		// Handle patient IDs
		if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
			name = "Detalhes"; // Generic name for ID segments
		}

		const url = `/${pathSegments.slice(0, index + 1).join("/")}`;
		const isLast = index === pathSegments.length - 1;

		return {
			name,
			url,
			isLast,
		};
	});

	return (
		<Breadcrumb className="mb-4">
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link to="/">
							<Home className="h-4 w-4" />
							<span className="sr-only">Home</span>
						</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />

				{breadcrumbItems.flatMap((item, index) => {
					const elements = [
						<BreadcrumbItem key={`item-${index}`}>
							{item.isLast ? (
								<BreadcrumbPage>{item.name}</BreadcrumbPage>
							) : (
								<BreadcrumbLink asChild>
									<Link to={item.url}>{item.name}</Link>
								</BreadcrumbLink>
							)}
						</BreadcrumbItem>,
					];

					if (!item.isLast) {
						elements.push(<BreadcrumbSeparator key={`sep-${index}`} />);
					}

					return elements;
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
