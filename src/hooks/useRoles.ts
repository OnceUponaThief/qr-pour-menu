import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  getCurrentUserRoles,
  currentUserHasRole,
  AppRole,
  UserRole,
} from "@/lib/roles";

export const useRoles = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const userRoles = await getCurrentUserRoles();
        setRoles(userRoles);
      } catch (err) {
        setError("Failed to fetch user roles");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        if (session?.user) {
          fetchRoles();
        } else {
          setRoles([]);
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const hasRole = (role: AppRole) => {
    return roles.some((userRole) => userRole.role === role);
  };

  const isAdmin = hasRole("admin");
  const isUser = hasRole("user");

  return {
    roles,
    loading,
    error,
    hasRole,
    isAdmin,
    isUser,
    refresh: () => {
      // Re-fetch roles
      const fetchRoles = async () => {
        try {
          setLoading(true);
          const userRoles = await getCurrentUserRoles();
          setRoles(userRoles);
        } catch (err) {
          setError("Failed to fetch user roles");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchRoles();
    },
  };
};

export const useHasRole = (role: AppRole) => {
  const [hasRole, setHasRole] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        setLoading(true);
        const result = await currentUserHasRole(role);
        setHasRole(result);
      } catch (err) {
        console.error("Error checking role:", err);
        setHasRole(false);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [role]);

  return { hasRole, loading };
};