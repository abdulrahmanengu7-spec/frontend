import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";
import Sidebar from "./Sidebar";

export default function Header({ go, user }) {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <>
      <header className="topbar">
        <div className="burger" onClick={() => setOpen(true)}>☰</div>

        <div className="title">STORE MANAGEMENT SYSTEM</div>

        <div className="user-area">
          <div className="user-info" title={user?.email || ""}>
            <span className="user-icon">👤</span>
            <span className="username">{user?.name || user?.email || "User"}</span>
          </div>

          <button
            className="logout"
            onClick={() => {
              logout();
              go("login");
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <Sidebar open={open} setOpen={setOpen} go={go} user={user} />
    </>
  );
}
