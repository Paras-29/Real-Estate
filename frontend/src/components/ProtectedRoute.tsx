import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserTypes?: ('agent' | 'company' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredUserTypes = ['agent', 'company', 'admin'] 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If not authenticated, display toast and redirect to login with the attempted route
  if (!isAuthenticated) {
    toast({
      title: "Authentication Required",
      description: "Please login to view this page.",
      variant: "destructive",
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but doesn't have required user type
  if (user && !requiredUserTypes.includes(user.userType)) {
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated and has proper permissions, render the component
  return <>{children}</>;
};

export default ProtectedRoute; 