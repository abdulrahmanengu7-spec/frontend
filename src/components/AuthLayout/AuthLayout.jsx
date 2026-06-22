import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import "./AuthLayout.css";

export default function AuthLayout({ children, subtitle }) {
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
        <div className="authBody">
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
