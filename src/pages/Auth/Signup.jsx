import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "./AuthLayout";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", bestFriend: "", password: "", confirm: "" });
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const set = (k, v) => setForm({ ...form, [k]: v });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error("Passwords do not match");
    try {
      await signup(form);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <AuthLayout subtitle="Join us today! Create your new account">
      <form onSubmit={submit} className="auth-form">
        <h2 className="auth-title">Create Account</h2>
        <div className="input-wrap"><FiUser className="icon" /><input placeholder="Full Name" value={form.name} onChange={e => set("name", e.target.value)} /></div>
        <div className="input-wrap"><FiMail className="icon" /><input type="email" placeholder="Email Address" value={form.email} onChange={e => set("email", e.target.value)} /></div>
        <div className="input-wrap"><FiUser className="icon" /><input placeholder="What is your best friend name?" value={form.bestFriend} onChange={e => set("bestFriend", e.target.value)} /></div>
        <div className="input-wrap"><FiLock className="icon" /><input type={show1 ? "text" : "password"} placeholder="Password" value={form.password} onChange={e => set("password", e.target.value)} /><span className="eye" onClick={() => setShow1(!show1)}>{show1 ? <FiEyeOff /> : <FiEye />}</span></div>
        <div className="input-wrap"><FiLock className="icon" /><input type={show2 ? "text" : "password"} placeholder="Confirm Password" value={form.confirm} onChange={e => set("confirm", e.target.value)} /><span className="eye" onClick={() => setShow2(!show2)}>{show2 ? <FiEyeOff /> : <FiEye />}</span></div>
        <label className="auth-check"><input type="checkbox" required /> I agree to the <span className="auth-link">Terms & Conditions</span></label>
        <button className="auth-button" type="submit">Sign Up</button>
        <p className="auth-center auth-small">Already have an account? <span onClick={() => navigate("/login")} className="auth-link">Sign In</span></p>
      </form>
    </AuthLayout>
  );
}
