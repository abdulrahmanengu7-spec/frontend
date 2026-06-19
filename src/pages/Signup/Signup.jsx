import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import Input from "../../components/Input/Input";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";
import "./Signup.css";

export default function Signup({ go }) {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bestFriend, setBestFriend] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const submit = (e) => {
    e.preventDefault();

    if (!name || !email || !bestFriend || !password || !confirm) {
      toast.error("Please fill all fields ❌");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match ❌");
      return;
    }

    const ok = signup({ name, email, bestFriend, password });

    if (ok) {
      toast.success("Account Created Successfully 🚀");
      go("login");
    } else {
      toast.error("Email already exists ❌");
    }
  };

  return (
    <AuthLayout subtitle="Join us today! Create your new account">
      <form onSubmit={submit} className="auth-form signup-form">
        <h2 className="auth-title">Create Account</h2>

        <Input icon={<FiUser size={17} />} type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input icon={<FiMail size={17} />} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input icon={<FiUser size={17} />} type="text" placeholder="What is your best friend name?" value={bestFriend} onChange={(e) => setBestFriend(e.target.value)} required />

        <Input
          icon={<FiLock size={17} />}
          type={showPass ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          rightElement={<button className="icon-btn" type="button" onClick={() => setShowPass((v) => !v)}>{showPass ? <FiEyeOff size={17} /> : <FiEye size={17} />}</button>}
        />

        <Input
          icon={<FiLock size={17} />}
          type={showConfirm ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          rightElement={<button className="icon-btn" type="button" onClick={() => setShowConfirm((v) => !v)}>{showConfirm ? <FiEyeOff size={17} /> : <FiEye size={17} />}</button>}
        />

        <label className="auth-check">
          <input type="checkbox" required />
          <span>I agree to the <span className="auth-link">Terms & Conditions</span></span>
        </label>

        <button type="submit" className="auth-button">Sign Up</button>

        <p className="auth-center auth-small">
          Already have an account? <span onClick={() => go("login")} className="auth-link">Sign In</span>
        </p>
      </form>
    </AuthLayout>
  );
}
