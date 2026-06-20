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

function cleanText(value) {
  return String(value || "").trim();
}

function dateValue(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export default function TransactionPage({ type, title }) {
  const { canWrite, canDelete } = useAuth();

  const columns = type === "inward" ? inwardColumns : issueColumns;

  const [rows, setRows] = useState([]);
  const [lists, setLists] = useState({});
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({});

  const load = async (q = search) => {
    try {
      const res = await api.get(`/transactions/${type}`, {
        params: { q },
      });

      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Refresh failed");
    }
  };

  useEffect(() => {
    load("");
    setSearch("");
    setEditing(null);
    setDraft({});
  }, [type]);

  useEffect(() => {
    api
      .get("/lists")
      .then((res) => setLists(res.data || {}))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;

    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
  }, [rows, search]);

  const lookup = async (next) => {
    const itemCode = cleanText(next.itemCode);
    const category = cleanText(next.category);

    if (!itemCode || !category) return next;

    try {
      const res = await api.get("/stock/lookup", {
        params: {
          itemCode,
          category,
        },
      });

      const item = res.data || {};

      const stockBalance = Number(item.balanceQty || 0);
      const unitPrice = Number(item.unitPrice || 0);
      const qtyReceived = Number(next.qtyReceived || 0);
      const qtyIssued = Number(next.qtyIssued || 0);

      return {
        ...next,
        itemCode,
        category,
        itemDescription: item.itemDescription || "",
        uom: item.uom || "",
        unitPrice,
        openQty: stockBalance,
        balanceQty:
          type === "issuance"
            ? stockBalance - qtyIssued
            : stockBalance + qtyReceived,
        total:
          type === "inward"
            ? qtyReceived * unitPrice
            : qtyIssued * unitPrice,
      };
    } catch (e) {
      toast.error("Item not found in selected category");

      return {
        ...next,
        itemDescription: "",
        uom: "",
        unitPrice: 0,
        openQty: 0,
        balanceQty: 0,
        total: 0,
      };
    }
  };

  const setField = async (key, value) => {
    let next = {
      ...draft,
      [key]: value,
    };

    if (["itemCode", "category", "qtyReceived", "qtyIssued"].includes(key)) {
      next = await lookup(next);
    }

    setDraft(next);
  };

  const startAdd = () => {
    if (type === "inward") {
      setDraft({
        deliveryDate: today(),
        category: "Inventory",
        itemCode: "",
        itemDescription: "",
        uom: "",
        qtyReceived: 0,
        openQty: 0,
        unitPrice: 0,
        total: 0,
      });
    } else {
      setDraft({
        date: today(),
        category: "Inventory",
        itemCode: "",
        itemDescription: "",
        uom: "",
        qtyIssued: 0,
        balanceQty: 0,
        unitPrice: 0,
        total: 0,
      });
    }

    setEditing("new");
  };

  const save = async () => {
    try {
      if (editing === "new") {
        await api.post(`/transactions/${type}`, draft);
      } else {
        await api.put(`/transactions/${editing}`, draft);
      }

      toast.success("Saved and stock updated");
      setEditing(null);
      setDraft({});
      load(search);
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed");
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this row?")) return;

    try {
      await api.delete(`/transactions/${id}`);
      toast.success("Deleted and stock recalculated");
      load(search);
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  };

  const startEdit = (row) => {
    setEditing(row._id);

    setDraft({
      ...row,
      date: dateValue(row.date),
      deliveryDate: dateValue(row.deliveryDate),
    });
  };

  const getCategoryOptions = () => {
    const fromList =
      lists.Category?.map((x) => x.value)
        ?.filter((v) => categories.includes(v)) || [];

    return fromList.length ? fromList : categories;
  };

  const renderCell = (r, col, idx) => {
    const isEdit = editing === r._id || (editing === "new" && r._id === "new");

    if (!isEdit) {
      if (col.key === "srNo") return idx + 1;

      if (["date", "deliveryDate"].includes(col.key) && r[col.key]) {
        return dateValue(r[col.key]);
      }

      return r[col.key] ?? "";
    }

    if (col.select) {
      const opts = getCategoryOptions();

      return (
        <select
          value={draft[col.key] || "Inventory"}
          onChange={(e) => setField(col.key, e.target.value)}
        >
          {opts.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      );
    }

    if (col.selectGroup) {
      const options = lists[col.selectGroup]?.map((x) => x.value) || [];

      return (
        <select
          value={draft[col.key] || ""}
          onChange={(e) => setField(col.key, e.target.value)}
        >
          <option value="">Select</option>
          {options.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        disabled={col.readOnly}
        type={col.type || (col.num ? "number" : "text")}
        value={
          ["date", "deliveryDate"].includes(col.key)
            ? dateValue(draft[col.key])
            : draft[col.key] ?? ""
        }
        onChange={(e) => setField(col.key, e.target.value)}
      />
    );
  };

  const importExcel = async (file) => {
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("sheetName", title);

      const res = await api.post(`/transactions/${type}/import`, form);

      const failed = res.data?.failed ? `, Failed ${res.data.failed}` : "";
      toast.success(`Imported ${res.data?.imported || 0} rows${failed}`);

      load(search);
    } catch (e) {
      toast.error(e.response?.data?.message || "Excel import failed");
    }
  };

  const deleteAll = async () => {
    if (!confirm(`Delete ALL rows from ${title}? This cannot be undone.`)) return;

    try {
      const res = await api.delete(`/transactions/${type}/all`);
      toast.success(`Deleted ${res.data?.deleted || 0} rows`);
      load(search);
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
        onRefresh={() => load(search)}
        onFilter={(q) => load(q)}
        onDeleteAll={deleteAll}
        onExportExcel={() => exportRowsExcel(filtered, `${title}.xlsx`)}
        onExportPDF={() => exportRowsPDF(filtered, columns, title)}
        onImportExcel={importExcel}
      />

      <div className="table-wrap">
        <table className="erp-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((r, idx) => {
              const isCurrentEdit =
                editing === r._id || (editing === "new" && r._id === "new");

              return (
                <tr key={r._id}>
                  {columns.map((c) => (
                    <td key={c.key}>{renderCell(r, c, idx)}</td>
                  ))}

                  <td className="action-cell">
                    {canWrite && isCurrentEdit && (
                      <button className="save-btn" onClick={save}>
                        Save
                      </button>
                    )}

                    {canWrite && !isCurrentEdit && r._id !== "new" && (
                      <button onClick={() => startEdit(r)}>Edit</button>
                    )}

                    {canWrite && isCurrentEdit && (
                      <button
                        onClick={() => {
                          setEditing(null);
                          setDraft({});
                        }}
                      >
                        Cancel
                      </button>
                    )}

                    {canDelete && r._id !== "new" && (
                      <button className="delete-btn" onClick={() => del(r._id)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
