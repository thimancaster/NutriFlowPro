import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {supabase} from "@/integrations/supabase/client";
import {useAuth} from "@/contexts/auth/AuthContext";
import {Loader2} from "lucide-react";
import {logger} from "@/utils/logger";

/**
 * AuthHandler component
 * Handles post-authentication redirects and URL cleaning
 * Used when returning from OAuth providers like Google
 */
const AuthHandler: React.FC = () => {
	const navigate = useNavigate();
	const {updateAuthState} = useAuth();
	const hasProcessedAuth = useRef(false);
	const [isProcessing, setIsProcessing] = useState(true);

	useEffect(() => {
		// Check if there's an access_token in the URL (sign of OAuth redirect)
		const hasAuthParams =
			window.location.hash.includes("access_token") ||
			window.location.search.includes("code=") ||
			window.location.hash.includes("refresh_token");

		console.log("AuthHandler - URL details:", {
			pathname: window.location.pathname,
			hash: window.location.hash,
			search: window.location.search,
			hasAuthParams,
		});

		if (hasAuthParams && !hasProcessedAuth.current) {
			hasProcessedAuth.current = true;
			logger.info("Auth redirect detected, processing session...");

			// Log the hash content for debugging
			console.log("OAuth hash content:", window.location.hash);

			// Don't clean URL immediately - let Supabase process the tokens first

			// Set up auth state change listener
			const {data} = supabase.auth.onAuthStateChange(async (event, session) => {
				logger.debug(`Auth event in handler: ${event}`);
				console.log("Auth state change:", {
					event,
					hasSession: !!session,
					userEmail: session?.user?.email,
				});

				if (event === "SIGNED_IN" && session) {
					logger.info("User authenticated successfully");
					console.log("User session established:", {
						userId: session.user?.id,
						userEmail: session.user?.email,
						accessToken: session.access_token ? "present" : "missing",
					});

					// Clean the URL now that we have a session
					window.history.replaceState(null, "", window.location.pathname);

					// Get remember me preference (or default to false)
					const rememberMe = localStorage.getItem("remember_me") === "true";

					// Update auth state with the new session
					await updateAuthState(session, rememberMe);

					// Navigate to dashboard
					setIsProcessing(false);
					navigate("/dashboard", {replace: true});
				} else if (event === "SIGNED_OUT" || (event === "INITIAL_SESSION" && !session)) {
					console.log("Auth event without session:", {
						event,
						expectedSession: hasAuthParams,
					});
					// If we expected a session but didn't get one, wait a bit more
					setTimeout(async () => {
						const {
							data: {session: currentSession},
						} = await supabase.auth.getSession();
						console.log("Delayed session check:", {hasSession: !!currentSession});
						if (!currentSession && hasAuthParams) {
							console.log("No session found after OAuth, redirecting to login");
							setIsProcessing(false);
							navigate("/login", {replace: true});
						}
					}, 3000); // Increased delay
				}
			});

			// Also check current session as a fallback
			setTimeout(async () => {
				try {
					const {
						data: {session},
					} = await supabase.auth.getSession();
					console.log("Fallback session check:", {hasSession: !!session});

					if (session) {
						console.log("Found session in fallback check");
						window.history.replaceState(null, "", window.location.pathname);
						await updateAuthState(session, false);
						setIsProcessing(false);
						navigate("/dashboard", {replace: true});
					}
				} catch (error) {
					console.error("Fallback session check error:", error);
				}
			}, 1000);

			// Cleanup subscription when component unmounts
			return () => {
				data.subscription.unsubscribe();
			};
		} else if (!hasAuthParams && !hasProcessedAuth.current) {
			// No auth params at all, redirect to login only if we haven't processed auth yet
			setTimeout(() => {
				if (!hasProcessedAuth.current) {
					logger.debug("No auth parameters detected, redirecting to login");
					console.log("No auth params found, redirecting to login");
					setIsProcessing(false);
					navigate("/login", {replace: true});
				}
			}, 1000);
		}
	}, [navigate, updateAuthState]);

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100">
			<Loader2 className="h-12 w-12 animate-spin text-blue-600" />
			<p className="mt-4 text-lg font-medium text-gray-700">
				{isProcessing ? "Autenticando..." : "Redirecionando..."}
			</p>
			<p className="mt-2 text-sm text-gray-500">
				{isProcessing ? "Processando login..." : "Redirecionando para o dashboard..."}
			</p>
		</div>
	);
};

export default AuthHandler;
