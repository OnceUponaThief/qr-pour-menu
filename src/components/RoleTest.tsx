import { useEffect, useState } from "react";
import { useRoles } from "@/hooks/useRoles";
import { supabase } from "@/integrations/supabase/client";

const RoleTest = () => {
  const { roles, isAdmin, isUser, loading } = useRoles();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    
    fetchUserId();
  }, []);

  if (loading) {
    return <div>Loading role information...</div>;
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h2 className="text-xl font-bold mb-4">Role Test Component</h2>
      
      <div className="space-y-2">
        <p><strong>User ID:</strong> {userId || "Not logged in"}</p>
        <p><strong>Is Admin:</strong> {isAdmin ? "Yes" : "No"}</p>
        <p><strong>Is User:</strong> {isUser ? "Yes" : "No"}</p>
        
        <div>
          <strong>All Roles:</strong>
          {roles.length > 0 ? (
            <ul className="list-disc pl-5 mt-1">
              {roles.map((role) => (
                <li key={role.id}>{role.role}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No roles assigned</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleTest;