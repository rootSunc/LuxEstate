import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import { useAuthSession } from "../context/AuthSessionContext";

export default function PrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  const { authChecking } = useAuthSession();

  if (authChecking) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-slate-600">
        Loading session...
      </div>
    );
  }

  return currentUser ? <Outlet /> : <Navigate to="/sign-in" />;
}
