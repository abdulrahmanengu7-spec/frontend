import "./Auth.css";

export default function AuthLayout({ subtitle, children }) {
  return (
    <div className="auth-layout">
      <main className="auth-main">
        <section className="auth-card">
          <img
            src={`${import.meta.env.BASE_URL}logo.png?v=6`}
            className="auth-logo"
            alt="Lotte Kolson Store Management System"
          />

          <p className="auth-subtitle">{subtitle}</p>

          {children}
        </section>
      </main>
    </div>
  );
}
