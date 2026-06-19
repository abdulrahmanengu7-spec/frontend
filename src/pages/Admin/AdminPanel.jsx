import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/api";
import "./AdminPanel.css";

const blank = { name: "", email: "", password: "", role: "user", department: "", phone: "", securityAnswer: "" };
const roles = ["user", "admin", "superadmin"];
const ownerEmail = "abdulrahman4463810@gmail.com";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    const res = await api.get("/admin/users");
    setUsers(res.data || []);
  };
  useEffect(() => { load().catch(e => toast.error(e.response?.data?.message || "Admin data load failed")); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u => !q || JSON.stringify(u).toLowerCase().includes(q));
  }, [users, search]);

  const reset = () => { setForm(blank); setEditingId(null); };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/admin/users/${editingId}`, payload);
        toast.success("User updated");
      } else {
        await api.post("/admin/users", form);
        toast.success("User created");
      }
      reset();
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed");
    }
  };

  const edit = (u) => {
    setEditingId(u._id || u.id);
    setForm({ name: u.name || "", email: u.email || "", password: "", role: u.role || "user", department: u.department || "", phone: u.phone || "", securityAnswer: "" });
  };

  const changeRole = async (u, role) => {
    try {
      await api.post("/admin/change-role", { userId: u._id || u.id, role });
      toast.success("Role updated");
      load();
    } catch (e) { toast.error(e.response?.data?.message || "Role update failed"); }
  };

  const remove = async (u) => {
    if (!confirm(`Delete user ${u.name || u.email}?`)) return;
    try {
      await api.delete(`/admin/users/${u._id || u.id}`);
      toast.success("User deleted");
      load();
    } catch (e) { toast.error(e.response?.data?.message || "Delete failed"); }
  };

  return (
    <div className="admin-panel">
      <div className="admin-head">
        <div>
          <h1>Admin Panel</h1>
          
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." />
      </div>

      <form className="admin-form" onSubmit={save}>
        <h2>{editingId ? "Update User" : "Create User"}</h2>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name" required />
        <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" required disabled={form.email === ownerEmail} />
        <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editingId ? "New Password (optional)" : "Password"} type="password" required={!editingId} />
        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} disabled={form.email === ownerEmail}>{roles.map(r => <option key={r} value={r}>{r}</option>)}</select>
        <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="Department" />
        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" />
        <input value={form.securityAnswer} onChange={e => setForm({ ...form, securityAnswer: e.target.value })} placeholder="Best Friend Answer" />
        <div className="admin-form-actions"><button className="save-user">{editingId ? "Update" : "Create"}</button>{editingId && <button type="button" onClick={reset}>Cancel</button>}</div>
      </form>

      <div className="admin-card">
        <h2>User List</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Phone</th><th>Action</th></tr></thead>
            <tbody>{filtered.map(u => {
              const id = u._id || u.id;
              const locked = u.email === ownerEmail;
              return <tr key={id}><td>{u.name}</td><td>{u.email}</td><td><select value={u.role} disabled={locked} onChange={e => changeRole(u, e.target.value)}>{roles.map(r => <option key={r} value={r}>{r}</option>)}</select>{locked && <small> protected</small>}</td><td>{u.department}</td><td>{u.phone}</td><td><button onClick={() => edit(u)}>Edit</button><button className="delete-user" disabled={locked} onClick={() => remove(u)}>Delete</button></td></tr>;
            })}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
