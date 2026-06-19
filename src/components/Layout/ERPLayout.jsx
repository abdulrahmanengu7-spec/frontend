import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiArrowDown, FiArrowUp, FiBarChart2, FiBox, FiDollarSign, FiClipboard, FiFileText, FiGrid, FiHome, FiLogOut, FiMenu, FiSettings, FiTool, FiTruck, FiUser, FiX } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import "./ERPLayout.css";

const sections = [
  {
    title: "SECTION 1 — DASHBOARD",
    adminOnly: true,
    items: [
      { to: "/master-dashboard", label: "Master Dashboard", icon: <FiHome /> },
      { to: "/machine-dashboard", label: "Machine Dashboard", icon: <FiGrid /> },
    ],
  },
  {
    title: "SECTION 2 — STOCK MODULE",
    items: [
      { to: "/inventory", label: "Inventory", icon: <FiBox /> },
      { to: "/non-inventory", label: "Non Inventory", icon: <FiClipboard /> },
      { to: "/services", label: "Services", icon: <FiTool /> },
      { to: "/patty-cash", label: "Patty Cash", icon: <FiDollarSign /> },
    ],
  },
  {
    title: "SECTION 3 — TRANSACTIONS",
    items: [
      { to: "/daily-inward", label: "Inward (Stock Add)", icon: <FiTruck /> },
      { to: "/daily-issuance", label: "Issuance (Stock Minus)", icon: <FiClipboard /> },
    ],
  },
  {
    title: "SECTION 4 — MASTER DATA",
    adminOnly: true,
    items: [
      { to: "/lists", label: "Lists", icon: <FiSettings /> },
      { to: "/admin", label: "Admin Panel", icon: <FiUser />, superOnly: true },
    ],
  },
  {
    title: "SECTION 5 — INWARDS / OUTWARDS",
    items: [
      { to: "/outward-gate-pass-records", label: "Outward Gate Pass Records", icon: <FiFileText /> },
      { to: "/iutn-outward-record", label: "IUTN Outward Record", icon: <FiTruck /> },
    ],
  },
  {
    title: "SECTION 6 — FUEL CONSUMPTION",
    adminOnly: true,
    items: [
      { to: "/fuel-executive-dashboard", label: "Petrol Consumption Dashboard", icon: <FiBarChart2 /> },
      { to: "/monthly-travel-entries", label: "Monthly Travel Entries", icon: <FiDollarSign /> },
    ],
  },
  {
    title: "SECTION 7 — TOOLS ISSUANCE",
    items: [
      { to: "/tools-issuance", label: "Tools Issuance", icon: <FiTool /> },
    ],
  },
];

export default function ERPLayout() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState({ name: "", department: "", phone: "" });
  const [password, setPassword] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const { user, logout, refreshProfile, setUser } = useAuth();
  const navigate = useNavigate();

  const doLogout = () => {
    logout();
    navigate("/login");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  };

  const openProfile = async () => {
    try {
      const latest = await refreshProfile();
      setProfile({ name: latest?.name || "", department: latest?.department || "", phone: latest?.phone || "" });
      setProfileOpen(true);
    } catch (e) {
      toast.error(e.response?.data?.message || "Profile load failed");
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put("/auth/profile", profile);
      setUser(res.data.user || res.data);
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e.response?.data?.message || "Profile update failed");
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put("/auth/change-password", password);
      setPassword({ oldPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed");
    } catch (e) {
      toast.error(e.response?.data?.message || "Password change failed");
    }
  };

  useEffect(() => {
    document.body.classList.toggle("modal-open", profileOpen);
    return () => document.body.classList.remove("modal-open");
  }, [profileOpen]);

  return (
    <div className="erp-shell">
      <header className="erp-header">
        <button className="burger-btn" onClick={() => setOpen(true)}><FiMenu /></button>
        <div className="erp-title">LOTTE KOLSON STORE MANAGEMENT SYSTEM</div>
        <div className="erp-user">
          <button className="profile-chip" onClick={openProfile} title="Click to update profile"><FiUser /> {user?.name || user?.email}</button>
          <button onClick={doLogout}><FiLogOut /> Logout</button>
        </div>
      </header>

      <aside className={`erp-sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-head">
          <b>ERP MENU</b>
          <button onClick={() => setOpen(false)}><FiX /></button>
        </div>
        {sections
          .filter(section => !section.adminOnly || ["admin", "superadmin"].includes(user?.role))
          .map((section) => (
          <div className="menu-section" key={section.title}>
            <h4>{section.title}</h4>
            {section.items
              .filter(item => !item.superOnly || user?.role === "superadmin")
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
                >
                  {item.icon}<span>{item.label}</span>
                </NavLink>
              ))}
          </div>
        ))}
      </aside>

      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      {profileOpen && (
        <div className="profile-modal-backdrop" onClick={() => setProfileOpen(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-head">
              <div>
                <h2>Update Profile</h2>
                <p>{user?.email} • {user?.role}</p>
              </div>
              <button onClick={() => setProfileOpen(false)}><FiX /></button>
            </div>

            <form className="profile-form" onSubmit={saveProfile}>
              <label>Name<input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} /></label>
              <label>Department<input value={profile.department} onChange={e => setProfile({ ...profile, department: e.target.value })} /></label>
              <label>Phone<input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} /></label>
              <button className="primary-btn">Save Profile</button>
            </form>

            <form className="profile-form password-form" onSubmit={changePassword}>
              <h3>Change Password</h3>
              <label>Old Password<input type="password" value={password.oldPassword} onChange={e => setPassword({ ...password, oldPassword: e.target.value })} /></label>
              <label>New Password<input type="password" value={password.newPassword} onChange={e => setPassword({ ...password, newPassword: e.target.value })} /></label>
              <label>Confirm Password<input type="password" value={password.confirmPassword} onChange={e => setPassword({ ...password, confirmPassword: e.target.value })} /></label>
              <button className="dark-btn">Change Password</button>
            </form>
          </div>
        </div>
      )}

      <main className="erp-main">
        <Outlet />
      </main>

      <div className="scroll-float-tools" aria-label="Page scroll controls">
        <button type="button" onClick={scrollToTop} title="Scroll Up"><FiArrowUp /></button>
        <button type="button" onClick={scrollToBottom} title="Scroll Down"><FiArrowDown /></button>
      </div>
    </div>
  );
}
