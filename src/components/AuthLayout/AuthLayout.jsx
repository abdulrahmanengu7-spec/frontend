export default function AuthLayout({ children }) {
  return (
    <div className="authPage">

      <div className="authCard">

        <div className="authHeader">
          <h1 className="titleRed">Lotte Kolson PVT LTD</h1>
          <h2 className="titleBlack">Store Management System</h2>
        </div>

        <div className="authBody">
          {children}
        </div>

      </div>

    </div>
  );
}