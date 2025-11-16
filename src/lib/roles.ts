import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string | null;
}

/**
 * Get all roles for a user
 */
export async function getUserRoles(userId: string): Promise<UserRole[]> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user roles:", error);
    return [];
  }

  return data as UserRole[];
}

/**
 * Check if user has a specific role
 */
export async function hasRole(userId: string, role: AppRole): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: role,
  });

  if (error) {
    console.error("Error checking user role:", error);
    return false;
  }

  return data;
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  return await hasRole(userId, "admin");
}


/**
 * Check if user is a regular user
 */
export async function isRegularUser(userId: string): Promise<boolean> {
  return await hasRole(userId, "user");
}

/**
 * Assign a role to a user
 */
export async function assignRole(
  userId: string,
  role: AppRole
): Promise<boolean> {
  const { error } = await supabase.from("user_roles").insert({
    user_id: userId,
    role: role,
  });

  if (error) {
    console.error("Error assigning role:", error);
    return false;
  }

  return true;
}

/**
 * Remove a role from a user
 */
export async function removeRole(
  userId: string,
  role: AppRole
): Promise<boolean> {
  const { error } = await supabase
    .from("user_roles")
    .delete()
    .match({ user_id: userId, role: role });

  if (error) {
    console.error("Error removing role:", error);
    return false;
  }

  return true;
}

/**
 * Get current user's roles
 */
export async function getCurrentUserRoles(): Promise<UserRole[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return [];
  }

  return await getUserRoles(session.user.id);
}

/**
 * Check if current user has a specific role
 */
export async function currentUserHasRole(role: AppRole): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return false;
  }

  return await hasRole(session.user.id, role);
}

/**
 * Check if current user is admin
 */
export async function currentUserIdAdmin(): Promise<boolean> {
  return await currentUserHasRole("admin");
}
