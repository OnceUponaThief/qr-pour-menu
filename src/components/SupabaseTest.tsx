import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>("Checking...");
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic connection
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setConnectionStatus(`Session Error: ${sessionError.message}`);
          return;
        }
        
        setUser(sessionData?.session?.user || null);
        setConnectionStatus("Connected successfully!");
        
        // If user is logged in, check their roles
        if (sessionData?.session?.user) {
          const { data: roleData, error: roleError } = await supabase
            .from("user_roles")
            .select("*")
            .eq("user_id", sessionData.session.user.id);
            
          if (roleError) {
            console.error("Role check error:", roleError);
          } else {
            setRoles(roleData || []);
          }
        }
      } catch (error: any) {
        setConnectionStatus(`Connection failed: ${error.message}`);
      }
    };
    
    testConnection();
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-blue-50 mb-4">
      <h2 className="text-xl font-bold mb-2">Supabase Connection Test</h2>
      
      <div className="space-y-2">
        <p><strong>Connection Status:</strong> {connectionStatus}</p>
        
        {user && (
          <>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>User Email:</strong> {user.email}</p>
          </>
        )}
        
        {roles.length > 0 && (
          <div>
            <strong>User Roles:</strong>
            <ul className="list-disc pl-5 mt-1">
              {roles.map((role) => (
                <li key={role.id}>{role.role}</li>
              ))}
            </ul>
          </div>
        )}
        
        {!user && <p className="text-muted-foreground">Not logged in</p>}
      </div>
    </div>
  );
};

export default SupabaseTest;