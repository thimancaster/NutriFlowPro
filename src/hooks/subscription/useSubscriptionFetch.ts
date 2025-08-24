import {User} from "@supabase/supabase-js";
import {supabase} from "@/integrations/supabase/client";
import {PREMIUM_EMAILS, DEVELOPER_EMAILS} from "@/constants/subscriptionConstants";
import {SubscriptionData} from "../useSubscriptionQuery";
import {subscriptionCache} from "./useSubscriptionCache";

/**
 * Service for fetching subscription data
 */
export const useSubscriptionFetch = () => {
	/**
	 * Fetch subscription data from the database
	 */
	const fetchSubscriptionData = async (user: User | null): Promise<SubscriptionData> => {
		// Not authenticated - return default data
		if (!user) {
			return {
				isPremium: false,
				role: "user",
				email: null,
			};
		}

		try {
			// Check cache first
			const cachedData = subscriptionCache.get(user);
			if (cachedData) {
				return cachedData;
			}

			// Fast path: Check developer emails first - highest priority
			if (user.email && DEVELOPER_EMAILS.includes(user.email)) {
				const result = {
					isPremium: true,
					role: "developer",
					email: user.email,
					subscriptionStart: new Date().toISOString(),
					subscriptionEnd: null,
				};

				subscriptionCache.set(user, result);
				return result;
			}

			// Then check premium emails
			if (user.email && PREMIUM_EMAILS.includes(user.email)) {
				const result = {
					isPremium: true,
					role: "premium",
					email: user.email,
					subscriptionStart: new Date().toISOString(),
					subscriptionEnd: null,
				};

				subscriptionCache.set(user, result);
				return result;
			}

			// Try to check subscription in database (graceful fallback if table doesn't exist)
			let subscriptionData = null;
			try {
				const {data, error} = await supabase
					.from("subscribers")
					.select("is_premium, role, email, subscription_start, subscription_end")
					.eq("user_id", user.id)
					.maybeSingle();

				if (!error && data) {
					subscriptionData = data;
				}
			} catch (dbError) {
				// Database table doesn't exist or no permissions - that's ok, we'll use fallback
				// Log only for developers, don't show anything to regular users
				if (process.env.NODE_ENV === "development") {
					console.log(
						"Subscribers table not accessible, using email-based fallback:",
						dbError
					);
				}
			}

			// If we have subscription data from database, use it
			if (subscriptionData) {
				const result = {
					isPremium: subscriptionData.is_premium || false,
					role: subscriptionData.role || "user",
					email: subscriptionData.email || user.email,
					subscriptionStart: subscriptionData.subscription_start,
					subscriptionEnd: subscriptionData.subscription_end,
				};

				subscriptionCache.set(user, result);
				return result;
			}

			// Fallback: default free tier for all other users
			const result = {
				isPremium: false,
				role: "user",
				email: user.email || null,
				subscriptionStart: null,
				subscriptionEnd: null,
			};

			subscriptionCache.set(user, result);
			return result;
		} catch (error) {
			// Log errors only in development, stay silent in production
			if (process.env.NODE_ENV === "development") {
				console.error("Error in subscription query:", error);
			}

			// On any error, check email lists first, then default to free
			if (user?.email && DEVELOPER_EMAILS.includes(user.email)) {
				const result = {
					isPremium: true,
					role: "developer",
					email: user.email,
					subscriptionStart: new Date().toISOString(),
					subscriptionEnd: null,
				};

				subscriptionCache.set(user, result);
				return result;
			}

			if (user?.email && PREMIUM_EMAILS.includes(user.email)) {
				const result = {
					isPremium: true,
					role: "premium",
					email: user.email,
					subscriptionStart: new Date().toISOString(),
					subscriptionEnd: null,
				};

				subscriptionCache.set(user, result);
				return result;
			}

			// Default to free tier
			const result = {
				isPremium: false,
				role: "user",
				email: user?.email || null,
				subscriptionStart: null,
				subscriptionEnd: null,
			};

			subscriptionCache.set(user, result);
			return result;
		}
	};

	return {fetchSubscriptionData};
};
