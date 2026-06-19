import { useAuth } from "./AuthContext";

export default function PrivateRoute({ children }) {
  const { user } = useAuth();

  // ❌ NOT LOGGED IN → HOME BLOCK
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center text-red-600 font-bold text-xl">
        ❌ Please Login First
      </div>
    );
  }

  return children;
}