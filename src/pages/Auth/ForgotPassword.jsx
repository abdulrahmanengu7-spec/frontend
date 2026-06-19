import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiHelpCircle, FiLock, FiMail } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "./AuthLayout";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [form, setForm] = useState({ email: "", answer: "", newPassword: "" });
  const [show, setShow] = useState(false);
  const set = (k, v) => setForm({ ...form, [k]: v });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(form.email, form.answer, form.newPassword);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Password reset failed");
    }
  };

  return (
    <AuthLayout subtitle="Reset your password with security question">
      <form onSubmit={submit} className="auth-form">
        <h2 className="auth-title">Forgot Password</h2>
        <div className="input-wrap"><FiMail className="icon" /><input type="email" placeholder="Email Address" value={form.email} onChange={e => set("email", e.target.value)} /></div>
        <p className="auth-center auth-small">What is your best friend name?</p>
        <div className="input-wrap"><FiHelpCircle className="icon" /><input placeholder="Security Answer" value={form.answer} onChange={e => set("answer", e.target.value)} /></div>
        <div className="input-wrap"><FiLock className="icon" /><input type={show ? "text" : "password"} placeholder="New Password" value={form.newPassword} onChange={e => set("newPassword", e.target.value)} /><span className="eye" onClick={() => setShow(!show)}>{show ? <FiEyeOff /> : <FiEye />}</span></div>
        <button className="auth-button" type="submit">Reset Password</button>
        <p className="auth-center auth-small"><span onClick={() => navigate("/login")} className="auth-link">Back to Sign In</span></p>
      </form>
    </AuthLayout>
  );
}
