import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { FiRefreshCcw, FiTrash2, FiUpload } from "react-icons/fi";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import "./ListsPage.css";

const defaultGroups = ["Equipment Name", "Category", "Shift", "UOM", "Department", "Issued To", "Vendor/Supplier", "Location"];

export default function ListsPage() {
  const { canWrite, canDelete } = useAuth();
  const [lists, setLists] = useState({});
  const [form, setForm] = useState({ group: "Equipment Name", value: "" });
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const groups = useMemo(() => Array.from(new Set([...defaultGroups, ...Object.keys(lists || {})])), [lists]);
  const load = async () => {
    setBusy(true);
    try {
      const res = await api.get("/lists");
      setLists(res.data || {});
    } catch (e) {
      toast.error(e.response?.data?.message || "Lists refresh/load failed");
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.group || !form.value) return toast.error("Enter group and value");
    try {
      if (editing) {
        await api.put(`/lists/${editing}`, form);
        toast.success("List item updated");
      } else {
        await api.post("/lists", form);
        toast.success("List item added");
      }
      setForm({ ...form, value: "" });
      setEditing(null);
      await load();
    } catch (e) { toast.error(e.response?.data?.message || "Save failed"); }
  };

  const startEdit = (item, group) => {
    setEditing(item.id);
    setForm({ group, value: item.value });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const del = async (id) => {
    if (!confirm("Delete this dropdown item?")) return;
    try {
      await api.delete(`/lists/${id}`);
      toast.success("Deleted");
      await load();
    } catch (e) { toast.error(e.response?.data?.message || "Delete failed"); }
  };

  const importFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setBusy(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/lists/import", formData);
      toast.success(`File imported: ${res.data?.imported || 0} list values added`);
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || "List file import failed");
    } finally {
      setBusy(false);
    }
  };

  const deleteAll = async () => {
    if (!confirm("Delete ALL dropdown/list values? This cannot be undone.")) return;
    try {
      setBusy(true);
      const res = await api.delete("/lists/all");
      toast.success(`Deleted ${res.data?.deleted || 0} list values`);
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete all failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="lists-page">
      <div className="lists-head">
        <div><h1>Lists / Dropdown Management</h1></div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search list values..." />
      </div>

      <div className="list-actions-row">
        {canWrite && <button onClick={() => fileRef.current?.click()} disabled={busy}><FiUpload /> File Import</button>}
        {canWrite && <input ref={fileRef} className="hidden-file" type="file" accept=".xlsx,.xls,.xlsm" onChange={importFile} />}
        <button onClick={load} disabled={busy}><FiRefreshCcw /> {busy ? "Working..." : "Refresh"}</button>
        {canDelete && <button className="danger" onClick={deleteAll} disabled={busy}><FiTrash2 /> Delete All</button>}
      </div>

      <div className="list-add">
        <select value={form.group} onChange={e => setForm({ ...form, group: e.target.value })}>{groups.map(g => <option key={g}>{g}</option>)}</select>
        <input value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder="List value" />
        {canWrite && <button onClick={save}>{editing ? "Update" : "Add"}</button>}
        {editing && <button className="cancel-list" onClick={() => { setEditing(null); setForm({ ...form, value: "" }); }}>Cancel</button>}
      </div>
      <div className="list-grid">
        {groups.map(g => {
          const items = (lists[g] || []).filter(x => !search || `${g} ${x.value}`.toLowerCase().includes(search.toLowerCase()));
          return (
            <div className="list-card" key={g}>
              <h3>{g} <span>{items.length}</span></h3>
              {items.map(x => <p key={x.id}><span>{x.value}</span><em>{canWrite && <button onClick={() => startEdit(x, g)}>Edit</button>}{canDelete && <button className="x" onClick={() => del(x.id)}>Delete</button>}</em></p>)}
              {!items.length && <small>No values</small>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
