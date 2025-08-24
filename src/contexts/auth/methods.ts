import {supabase} from "@/integrations/supabase/client";
import {secureLogin, secureLogout} from "@/utils/security/secureAuth";
import {auditLogService} from "@/services/auditLogService";

export const login = async (
	email: string,
	password: string,
	remember: boolean = false,
	toast: any
) => {
	try {
		const result = await secureLogin(email, password, remember);

		if (result.success) {
			toast({
				title: "Login realizado com sucesso",
				description: "Bem-vindo de volta!",
			});
		} else {
			toast({
				title: "Erro no login",
				description: result.error?.message || "Credenciais inválidas",
				variant: "destructive",
			});
		}

		return result;
	} catch (error: any) {
		toast({
			title: "Erro no login",
			description: error.message,
			variant: "destructive",
		});
		return {success: false, error};
	}
};

export const signup = async (email: string, password: string, name: string, toast: any) => {
	try {
		const {data, error} = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {name},
				emailRedirectTo: `${window.location.origin}/auth/callback`,
			},
		});

		if (error) {
			toast({
				title: "Erro no cadastro",
				description: error.message,
				variant: "destructive",
			});
			return {success: false, error};
		}

		if (data.user) {
			await auditLogService.logEvent({
				user_id: data.user.id,
				event_type: "user_signup",
				event_data: {
					email,
					name,
					timestamp: new Date().toISOString(),
				},
			});

			toast({
				title: "Cadastro realizado",
				description: "Verifique seu email para ativar a conta",
			});
		}

		return {success: true, data};
	} catch (error: any) {
		toast({
			title: "Erro no cadastro",
			description: error.message,
			variant: "destructive",
		});
		return {success: false, error};
	}
};

export const logout = async (toast: any, queryClient: any, updateAuthState: any) => {
	try {
		const result = await secureLogout();

		if (result.success) {
			await updateAuthState(null);
			queryClient.clear();

			toast({
				title: "Logout realizado",
				description: "Sessão encerrada com segurança",
			});
		}

		return result;
	} catch (error: any) {
		toast({
			title: "Erro no logout",
			description: error.message,
			variant: "destructive",
		});
		return {success: false, error};
	}
};

export const resetPassword = async (email: string, toast: any) => {
	try {
		const {error} = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/reset-password`,
		});

		if (error) throw error;

		toast({
			title: "Email enviado",
			description: "Verifique sua caixa de entrada",
		});

		return {success: true};
	} catch (error: any) {
		toast({
			title: "Erro",
			description: error.message,
			variant: "destructive",
		});
		return {success: false, error};
	}
};

export const signInWithGoogle = async (toast: any) => {
	try {
		const {error} = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}/auth/callback`,
			},
		});

		if (error) throw error;
		return {success: true};
	} catch (error: any) {
		toast({
			title: "Erro no login com Google",
			description: error.message,
			variant: "destructive",
		});
		return {success: false, error};
	}
};
