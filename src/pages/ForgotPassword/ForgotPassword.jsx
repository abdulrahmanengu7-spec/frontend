import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import Input from "../../components/Input/Input";
import { FiMail, FiHelpCircle, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";
import "./ForgotPassword.css";

export default function ForgotPassword({ go }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [answer, setAnswer] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);

  const submit = (e) => {
    e.preventDefault();

    if (!email || !answer || !pass) {
      toast.error("All fields are required ❌");
      return;
    }

    const ok = resetPassword(email, answer, pass);

    if (ok) {
      toast.success("Password Updated Successfully 🚀");
      go("login");
    } else {
      toast.error("Invalid Email or Security Answer ❌");
    }
  };

  return (
    <AuthLayout subtitle="Reset your password with security question">
      <form onSubmit={submit} className="auth-form forgot-form">
        <h2 className="auth-title">Forgot Password</h2>

        <Input icon={<FiMail size={17} />} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <p className="forgot-note">What is your best friend name?</p>

        <Input icon={<FiHelpCircle size={17} />} placeholder="Security Answer" value={answer} onChange={(e) => setAnswer(e.target.value)} required />

        <Input
          icon={<FiLock size={17} />}
          type={show ? "text" : "password"}
          placeholder="New Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
          rightElement={<button className="icon-btn" type="button" onClick={() => setShow((v) => !v)}>{show ? <FiEyeOff size={17} /> : <FiEye size={17} />}</button>}
        />

        <button className="auth-button" type="submit">Reset Password</button>

        <p className="auth-center auth-small">
          <span onClick={() => go("login")} className="auth-link">Back to Sign In</span>
        </p>
      </form>
    </AuthLayout>
  );
}
