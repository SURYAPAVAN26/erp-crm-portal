import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isHydrated } = useAuthStore();

  if (!isHydrated) return null;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
