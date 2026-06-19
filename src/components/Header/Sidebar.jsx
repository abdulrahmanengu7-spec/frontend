import "./Sidebar.css";

export default function Sidebar({ open, setOpen, go, user }) {
  const menu = [
    { name: "Master Dashboard", page: "Master Dashboard", icon: "🏠" },
    ...(user?.role === "superadmin"
      ? [{ name: "Admin Pannel", page: "admin", icon: "🛡️" }]
      : []),
    { name: "Machine Dashboard", page: "Machine Dashboard", icon: "⚙️" },
    { name: "Inventory", page: "inventory", icon: "📦" },
    { name: "Non Inventory", page: "noninventory", icon: "📋" },
    { name: "Services", page: "services", icon: "🔧" },
    { name: "Petty Cash", page: "petty", icon: "💰" },
  ];

  return (
    <div className={open ? "sidebar active" : "sidebar"}>
      <div className="close" onClick={() => setOpen(false)}>✖</div>

      <h3>MENU</h3>

      {menu.map((m) => (
        <div
          key={m.page}
          className="item"
          onClick={() => {
            go(m.page);
            setOpen(false);
          }}
        >
          <span>{m.icon}</span> {m.name}
        </div>
      ))}
    </div>
  );
}
