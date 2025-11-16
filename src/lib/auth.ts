import { supabase } from "@/integrations/supabase/client";
import { assignRole } from "@/lib/roles";

/**
 * Assign default role to a user
 * This function should be called after user registration
 */
export async function assignDefaultRole(userId: string): Promise<boolean> {
  try {
    // By default, assign 'user' role to all new users
    const success = await assignRole(userId, "user");
    return success;
  } catch (error) {
    console.error("Error assigning default role:", error);
    return false;
  }
}

/**
 * Assign admin role to a user
 * This should only be called by administrators
 */
export async function assignAdminRole(userId: string): Promise<boolean> {
  try {
    const success = await assignRole(userId, "admin");
    return success;
  } catch (error) {
    console.error("Error assigning admin role:", error);
    return false;
  }
}


/**
 * Initialize user roles
 * This function checks if a user has any roles and assigns a default if not
 */
export async function initializeUserRoles(userId: string): Promise<boolean> {
  try {
    // Check if user already has roles
    const { data: existingRoles, error } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .limit(1);

    if (error) {
      console.error("Error checking existing roles:", error);
      return false;
    }

    // If user has no roles, assign default role
    if (!existingRoles || existingRoles.length === 0) {
      return await assignDefaultRole(userId);
    }

    return true;
  } catch (error) {
    console.error("Error initializing user roles:", error);
    return false;
  }
}