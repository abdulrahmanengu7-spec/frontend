import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import PageToolbar from "../../components/Table/PageToolbar";
import { exportRowsExcel, exportRowsPDF } from "../../utils/exporters";
import "../Stock/StockPage.css";

const categories = ["Inventory", "Non Inventory", "Services", "Patty Cash"];

const inwardColumns = [
  { key: "srNo", label: "Sr" },
  { key: "deliveryDate", label: "Delivery Date", type: "date" },
  { key: "itemCode", label: "Item Code" },
  { key: "itemDescription", label: "Item Description", readOnly: true },
  { key: "category", label: "Category", select: true },
  { key: "uom", label: "UOM", readOnly: true },
  { key: "qtyReceived", label: "Qty Received", num: true },
  { key: "openQty", label: "Open Qty", readOnly: true },
  { key: "unitPrice", label: "Unit Price", readOnly: true },
  { key: "total", label: "Total", readOnly: true },
  { key: "vendorSupplier", label: "Vendor/Supplier", selectGroup: "Vendor/Supplier" },
  { key: "department", label: "Department", selectGroup: "Department" },
  { key: "receivedBy", label: "Received By" },
  { key: "grnStatusWithDate", label: "GRN Status with Date" },
];

const issueColumns = [
  { key: "srNo", label: "Sr" },
  { key: "date", label: "Date", type: "date" },
  { key: "itemCode", label: "Item Code" },
  { key: "itemDescription", label: "Item Description", readOnly: true },
  { key: "category", label: "Category", select: true },
  { key: "uom", label: "UOM", readOnly: true },
  { key: "qtyIssued", label: "Qty Issued", num: true },
  { key: "balanceQty", label: "Balance Qty", readOnly: true },
  { key: "equipmentName", label: "Equipment Name", selectGroup: "Equipment Name" },
  { key: "subEquipmentName", label: "Sub Equipment Name" },
  { key: "issuedTo", label: "Issued To", selectGroup: "Issued To" },
  { key: "shift", label: "Shift", selectGroup: "Shift" },
  { key: "department", label: "Department", selectGroup: "Department" },
  { key: "unitPrice", label: "Unit Price", readOnly: true },
  { key: "total", label: "Total", readOnly: true },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function TransactionPage({ type, title }) {
  const { canWrite, canDelete } = useAuth();
  const columns = type === "inward" ? inwardColumns : issueColumns;
  const [rows, setRows] = useState([]);
  const [lists, setLists] = useState({});
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({});

  const load = async () => {
    try {
      const res = await api.get(`/transactions/${type}`, { params: { q: search } });
      setRows(res.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Refresh failed");
    }
  };

  useEffect(() => { load(); }, [type]);
  useEffect(() => { api.get("/lists").then(res => setLists(res.data || {})).catch(() => {}); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(r => !q || JSON.stringify(r).toLowerCase().includes(q));
  }, [rows, search]);

  const lookup = async (next) => {
    if (!next.itemCode || !next.category) return next;
    try {
      const res = await api.get("/stock/lookup", { params: { itemCode: next.itemCode, category: next.category } });
      const item = res.data;
      return {
        ...next,
        itemDescription: item.itemDescription,
        uom: item.uom,
        unitPrice: item.unitPrice,
        openQty: item.balanceQty,
        balanceQty: item.balanceQty,
        total: type === "inward"
          ? Number(next.qtyReceived || 0) * Number(item.unitPrice || 0)
          : Number(next.qtyIssued || 0) * Number(item.unitPrice || 0),
      };
    } catch { return next; }
  };

  const setField = async (key, value) => {
    let next = { ...draft, [key]: value };
    if (["itemCode", "category"].includes(key)) next = await lookup(next);
    if (key === "qtyReceived") next.total = Number(value || 0) * Number(next.unitPrice || 0);
    if (key === "qtyIssued") next.total = Number(value || 0) * Number(next.unitPrice || 0);
    setDraft(next);
  };

  const startAdd = () => {
    setDraft(type === "inward"
      ? { deliveryDate: today(), category: "Inventory", itemCode: "", qtyReceived: 0 }
      : { date: today(), category: "Inventory", itemCode: "", qtyIssued: 0 });
    setEditing("new");
  };

  const save = async () => {
    try {
      const url = editing === "new" ? `/transactions/${type}` : `/transactions/${editing}`;
      const method = editing === "new" ? api.post : api.put;
      await method(url, draft);
      toast.success("Saved and stock updated");
      setEditing(null);
      setDraft({});
      load();
    } catch (e) { toast.error(e.response?.data?.message || "Save failed"); }
  };

  const del = async (id) => {
    if (!confirm("Delete this row?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success("Deleted and stock recalculated");
      load();
    } catch (e) { toast.error(e.response?.data?.message || "Delete failed"); }
  };

  const renderCell = (r, col, idx) => {
    const isEdit = editing === r._id || (editing === "new" && r._id === "new");
    if (!isEdit) {
      if (col.key === "srNo") return idx + 1;
      if (["date", "deliveryDate"].includes(col.key) && r[col.key]) return String(r[col.key]).slice(0, 10);
      return r[col.key] ?? "";
    }
    if (col.select) {
      const opts = (lists.Category?.map(x => x.value).filter(v => categories.includes(v)) || categories);
      return <select value={draft[col.key] || "Inventory"} onChange={e => setField(col.key, e.target.value)}>{opts.map(c => <option key={c}>{c}</option>)}</select>;
    }
    if (col.selectGroup) {
      const options = lists[col.selectGroup]?.map(x => x.value) || [];
      return <select value={draft[col.key] || ""} onChange={e => setField(col.key, e.target.value)}><option value="">Select</option>{options.map(v => <option key={v} value={v}>{v}</option>)}</select>;
    }
    return <input disabled={col.readOnly} type={col.type || (col.num ? "number" : "text")} value={draft[col.key] ?? ""} onChange={e => setField(col.key, e.target.value)} />;
  };

  const importExcel = async (file) => {
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("sheetName", title);
      const res = await api.post(`/transactions/${type}/import`, form);
      const failed = res.data?.failed ? `, Failed ${res.data.failed}` : "";
      toast.success(`Imported ${res.data?.imported || 0} rows${failed}`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Excel import failed");
    }
  };


  const deleteAll = async () => {
    if (!confirm(`Delete ALL rows from ${title}? This cannot be undone.`)) return;
    try {
      const res = await api.delete(`/transactions/${type}/all`);
      toast.success(`Deleted ${res.data?.deleted || 0} rows`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete all failed");
    }
  };

  const data = editing === "new" ? [{ ...draft, _id: "new" }, ...filtered] : filtered;

  return (
    <div className="erp-page">
      <PageToolbar
        title={title}
        search={search}
        setSearch={setSearch}
        onAdd={startAdd}
        onRefresh={load}
        onFilter={load}
        onDeleteAll={deleteAll}
        onExportExcel={() => exportRowsExcel(filtered, `${title}.xlsx`)}
        onExportPDF={() => exportRowsPDF(filtered, columns, title)}
        onImportExcel={importExcel}
      />
      <div className="table-wrap">
        <table className="erp-table">
          <thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}<th>Action</th></tr></thead>
          <tbody>
            {data.map((r, idx) => (
              <tr key={r._id}>
                {columns.map(c => <td key={c.key}>{renderCell(r, c, idx)}</td>)}
                <td className="action-cell">
                  {canWrite && (editing === r._id || r._id === "new") && <button className="save-btn" onClick={save}>Save</button>}
                  {canWrite && editing !== r._id && r._id !== "new" && <button onClick={() => { setEditing(r._id); setDraft(r); }}>Edit</button>}
                  {canWrite && editing && <button onClick={() => { setEditing(null); setDraft({}); }}>Cancel</button>}
                  {canDelete && r._id !== "new" && <button className="delete-btn" onClick={() => del(r._id)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
