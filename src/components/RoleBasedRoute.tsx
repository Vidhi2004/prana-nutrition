import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "dietitian" | "patient")[];
}

export const RoleBasedRoute = ({ children, allowedRoles }: RoleBasedRouteProps) => {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!role) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "dietitian") return <Navigate to="/dashboard" replace />;
    if (role === "patient") return <Navigate to="/patient" replace />;
  }

  return <>{children}</>;
};
