
import React from "react";
import {Link} from "react-router-dom";
import {useAuth} from "@/contexts/auth/AuthContext";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {LogOut, User} from "lucide-react";

export const UserMenu: React.FC = () => {
	const {user, logout} = useAuth();

	const handleSignOut = async () => {
		await logout();
	};

	if (!user) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="relative h-8 w-8 rounded-full transition-transform duration-200 hover:scale-110">
					<Avatar className="h-8 w-8">
						<AvatarImage
							src={user.user_metadata?.avatar_url || ""}
							alt={user.email || ""}
						/>
						<AvatarFallback className="bg-primary/20 text-primary">
							{user.email?.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-56 bg-popover text-popover-foreground border border-border shadow-lg z-50"
				align="end"
				forceMount>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none text-foreground">
							{user.user_metadata?.name || user.email}
						</p>
						<p className="text-xs leading-none text-muted-foreground">
							{user.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator className="border-border" />
				<DropdownMenuItem asChild>
					<Link
						to="/profile"
						className="cursor-pointer text-foreground hover:bg-accent transition-colors duration-200">
						<User className="mr-2 h-4 w-4" />
						<span>Perfil</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator className="border-border" />
				<DropdownMenuItem
					onClick={handleSignOut}
					className="cursor-pointer text-foreground hover:bg-accent transition-colors duration-200">
					<LogOut className="mr-2 h-4 w-4" />
					<span>Sair</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
