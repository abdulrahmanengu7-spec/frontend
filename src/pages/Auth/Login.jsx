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

  useEffect(() => {
    // Login page open hote hi fields empty rakho
    setEmail("");
    setPassword("");
    setShow(false);

    // Old saved login keys remove
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

    // Browser autofill agar delay se value dalay to usko bhi clear karo
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
      navigate("/master-dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <AuthLayout subtitle="Sign in to continue to your account">
      <form onSubmit={submit} className="auth-form" autoComplete="off">
        {/* Dummy hidden inputs to stop browser autofill */}
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

          <span className="eye" onClick={() => setShow((v) => !v)}>
            {show ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>

        <div className="auth-row">
          <label className="remember">
            <input type="checkbox" autoComplete="off" />
            Remember me
          </label>

          <span
            className="auth-link auth-small"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </span>
        </div>

        <button className="auth-button" type="submit">
          Sign In
        </button>

        <p className="auth-center auth-small">
          Don&apos;t have an account?{" "}
          <span className="auth-link" onClick={() => navigate("/signup")}>
            Sign Up
          </span>
        </p>
      </form>
    </AuthLayout>
  );
}
