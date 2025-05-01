
import { PREMIUM_EMAILS } from "@/constants/authConstants";

interface SubscriptionData {
  isPremium: boolean;
  role: string;
  email: string | null;
  subscriptionStart?: string | null;
  subscriptionEnd?: string | null;
}

/**
 * Validates if a user has premium status based on either their email or subscription data
 * @param email User's email address
 * @param subscriptionData Data from subscription database
 * @returns Boolean indicating premium status
 */
export const validatePremiumStatus = (
  email: string | null | undefined,
  subscriptionData: SubscriptionData | null | undefined
): boolean => {
  // Priority check: Email in premium list always gets premium status
  if (email && PREMIUM_EMAILS.includes(email)) {
    console.log("Email premium confirmado:", email);
    return true;
  }

  // Fallback to subscription data check
  if (subscriptionData?.isPremium) {
    return true;
  }

  return false;
};

/**
 * Checks if a subscription has expired
 * @param subscriptionEnd Subscription end date as ISO string
 * @returns Boolean indicating if subscription is expired
 */
export const isSubscriptionExpired = (subscriptionEnd: string | null | undefined): boolean => {
  if (!subscriptionEnd) return false;
  return new Date() > new Date(subscriptionEnd);
};
