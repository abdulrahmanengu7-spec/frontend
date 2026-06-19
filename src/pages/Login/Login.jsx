import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import Input from "../../components/Input/Input";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";
import "./Login.css";

export default function Login({ go }) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  // Page open hote hi fields empty rakho
  useEffect(() => {
    setEmail("");
    setPassword("");
    setShow(false);

    // Browser autofill ko clear karne ke liye small delay
    const timer = setTimeout(() => {
      setEmail("");
      setPassword("");
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      toast.error("Please fill all fields ❌");
      return;
    }

    try {
      const ok = await login(cleanEmail, cleanPassword);

      if (ok) {
        toast.success("Login Successful 🚀");
        go("home");
      } else {
        toast.error("Invalid Email or Password ❌");
      }
    } catch (error) {
      toast.error(error?.message || "Login failed ❌");
    }
  };

  return (
    <AuthLayout subtitle="Sign in to continue to your account">
      <form
        onSubmit={handleLogin}
        className="auth-form login-form"
        autoComplete="off"
      >
        {/* Hidden dummy fields: browser saved password autofill ko stop karne ke liye */}
        <input
          type="text"
          name="fake-user"
          autoComplete="username"
          style={{ display: "none" }}
          tabIndex="-1"
        />
        <input
          type="password"
          name="fake-password"
          autoComplete="current-password"
          style={{ display: "none" }}
          tabIndex="-1"
        />

        <h2 className="auth-title">Welcome Back!</h2>

        <Input
          icon={<FiMail size={17} />}
          type="email"
          name="login_email_no_autofill"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
        />

        <Input
          icon={<FiLock size={17} />}
          type={show ? "text" : "password"}
          name="login_password_no_autofill"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
          rightElement={
            <button
              className="icon-btn"
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <FiEyeOff size={17} /> : <FiEye size={17} />}
            </button>
          }
        />

        <div className="auth-row">
          <label className="remember">
            <input type="checkbox" autoComplete="off" />
            <span>Remember me</span>
          </label>

          <span className="auth-link" onClick={() => go("forgot")}>
            Forgot Password?
          </span>
        </div>

        <button className="auth-button" type="submit">
          Sign In
        </button>

        <p className="auth-center auth-small">
          Don’t have an account?{" "}
          <span className="auth-link" onClick={() => go("signup")}>
            Sign Up
          </span>
        </p>
      </form>
    </AuthLayout>
  );
                    }
