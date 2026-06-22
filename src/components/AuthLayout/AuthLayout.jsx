import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

export default function AuthLayout({ children }) {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <div className="authPage">
      <button
        type="button"
        className="auth-theme-toggle"
        onClick={toggleTheme}
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {isDark ? <FiSun /> : <FiMoon />}
        <span>{theme === "dark" ? "Light" : "Dark"}</span>
      </button>

      <div className="authCard">
        <div className="authHeader">
          <h1 className="titleRed">Lotte Kolson PVT LTD</h1>
          <h2 className="titleBlack">Store Management System</h2>
        </div>

        <div className="authBody">{children}</div>
      </div>
    </div>
  );
}
