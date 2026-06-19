import logo from "../../assets/logo.png";
import "./Auth.css";

export default function AuthLayout({ subtitle, children }) {
  return (
    <div className="auth-layout">
      <main className="auth-main">
        <section className="auth-card">
          <img src={logo} className="auth-logo" alt="Lotte Kolson Logo" />
          <p className="auth-subtitle">{subtitle}</p>
          {children}
        </section>
      </main>
    </div>
  );
}
