import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "./AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    setEmail("");
    setPassword("");
    setShow(false);
    setRemember(false);

    localStorage.removeItem("savedEmail");
    localStorage.removeItem("savedPassword");
    localStorage.removeItem("rememberEmail");
    localStorage.removeItem("rememberPassword");
    localStorage.removeItem("loginEmail");
    localStorage.removeItem("loginPassword");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminPassword");

    sessionStorage.removeItem("savedEmail");
    sessionStorage.removeItem("savedPassword");
    sessionStorage.removeItem("rememberEmail");
    sessionStorage.removeItem("rememberPassword");
    sessionStorage.removeItem("loginEmail");
    sessionStorage.removeItem("loginPassword");
    sessionStorage.removeItem("adminEmail");
    sessionStorage.removeItem("adminPassword");

    const timer = setTimeout(() => {
      setEmail("");
      setPassword("");
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await login(cleanEmail, cleanPassword);
      toast.success("Login successful");
      navigate("/master-dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <AuthLayout subtitle="Sign in to continue to your account">
      <form onSubmit={submit} className="auth-form" autoComplete="off">
        <input
          type="text"
          name="fake-user-name"
          autoComplete="off"
          style={{ display: "none" }}
          tabIndex="-1"
          aria-hidden="true"
        />

        <input
          type="password"
          name="fake-user-password"
          autoComplete="new-password"
          style={{ display: "none" }}
          tabIndex="-1"
          aria-hidden="true"
        />

        <h2 className="auth-title">Welcome Back!</h2>

        <div className="input-wrap">
          <FiMail className="icon" />

          <input
            type="email"
            name="login_email_blank"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
          />
        </div>

        <div className="input-wrap">
          <FiLock className="icon" />

          <input
            type={show ? "text" : "password"}
            name="login_password_blank"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
          />

          <button
            type="button"
            className="eye"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        <div className="auth-row">
          <label className="remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              autoComplete="off"
            />
            Remember me
          </label>

          <button
            type="button"
            className="auth-link auth-small auth-link-btn"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </button>
        </div>

        <button className="auth-button" type="submit">
          Sign In
        </button>

        <p className="auth-center auth-small">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            className="auth-link auth-link-btn"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
