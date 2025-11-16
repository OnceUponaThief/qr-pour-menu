import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRoles } from "@/hooks/useRoles";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { hasRole, isAdmin, isUser, refresh } = useRoles();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/admin/login");
          return;
        }

        // If a specific role is required, check for it
        if (requiredRole) {
          const hasRequiredRole = hasRole(requiredRole);
          if (!hasRequiredRole) {
            // User doesn't have the required role, redirect to unauthorized
            navigate("/unauthorized");
            return;
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/admin/login");
      } else if (!session) {
        navigate("/admin/login");
      } else {
        refresh(); // Refresh roles when auth state changes
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, requiredRole, hasRole, isAdmin, isUser, refresh]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;