import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/api";

const AuthContext = createContext();

function normalizeUser(user) {
  if (!user) return null;

  return {
    ...user,
    id: user.id || user._id,
  };
}

function safeParseUser(savedUser) {
  try {
    if (!savedUser) return null;
    return normalizeUser(JSON.parse(savedUser));
  } catch (error) {
    localStorage.removeItem("sms_user");
    return null;
  }
}

// Old saved login credentials ko remove karne ke liye
function clearSavedLoginCredentials() {
  const keysToRemove = [
    "savedEmail",
    "savedPassword",
    "rememberEmail",
    "rememberPassword",
    "loginEmail",
    "loginPassword",
    "email",
    "password",
    "adminEmail",
    "adminPassword",
    "sms_email",
    "sms_password",
    "sms_saved_email",
    "sms_saved_password",
  ];

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => {
    const saved = localStorage.getItem("sms_user");
    return safeParseUser(saved);
  });

  const setUser = (u, token) => {
    const normalized = normalizeUser(u);

    setUserState(normalized);

    if (normalized) {
      localStorage.setItem("sms_user", JSON.stringify(normalized));
    } else {
      localStorage.removeItem("sms_user");
    }

    if (token) {
      localStorage.setItem("sms_token", token);
    }
  };

  const refreshProfile = async () => {
    const res = await api.get("/auth/profile");

    const profileUser = res.data?.user || res.data;
    setUser(profileUser);

    return normalizeUser(profileUser);
  };

  const login = async (email, password) => {
    const cleanEmail = String(email || "").trim();
    const cleanPassword = String(password || "");

    if (!cleanEmail || !cleanPassword) {
      toast.error("Please fill all fields ❌");
      return false;
    }

    const res = await api.post("/auth/login", {
      email: cleanEmail,
      password: cleanPassword,
    });

    setUser(res.data.user, res.data.token);

    // Password/email ko save nahi karna
    clearSavedLoginCredentials();

    toast.success("Login successful");
    return true;
  };

  const signup = async (payload) => {
    await api.post("/auth/register", payload);
    toast.success("Account created successfully");
    return true;
  };

  const forgotPassword = async (email, answer, newPassword) => {
    await api.post("/auth/forgot", {
      email,
      answer,
      newPassword,
    });

    toast.success("Password updated successfully");
    return true;
  };

  const logout = () => {
    localStorage.removeItem("sms_token");
    localStorage.removeItem("sms_user");

    // Login page par email/password auto na aaye
    clearSavedLoginCredentials();

    setUserState(null);
    toast.info("Logged out");
  };

  useEffect(() => {
    // Page load par old saved login credentials remove
    clearSavedLoginCredentials();

    const token = localStorage.getItem("sms_token");

    if (!token) return;

    refreshProfile().catch(() => {
      localStorage.removeItem("sms_token");
      localStorage.removeItem("sms_user");
      setUserState(null);
    });
  }, []);

  const can = useMemo(
    () => ({
      isSuperAdmin: user?.role === "superadmin",
      isAdminOrSuper: ["admin", "superadmin"].includes(user?.role),
      canDelete: user?.role === "superadmin",
      canWrite: ["admin", "superadmin"].includes(user?.role),
      canExport: ["admin", "superadmin"].includes(user?.role),
    }),
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        refreshProfile,
        login,
        signup,
        forgotPassword,
        logout,
        ...can,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
