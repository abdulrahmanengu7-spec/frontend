import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import PageToolbar from "../../components/Table/PageToolbar";
import { exportRowsExcel, exportRowsPDF } from "../../utils/exporters";
import "./StockPage.css";

const columns = [
  { key: "srNo", label: "Sr No" },
  { key: "itemCode", label: "Item Code" },
  { key: "itemDescription", label: "Item Description" },
  { key: "uom", label: "UOM", selectGroup: "UOM" },
  { key: "openingQty", label: "Opening Qty", num: true },
  { key: "inwardQty", label: "Inward Qty", readOnly: true },
  { key: "issuedQty", label: "Issued Qty", readOnly: true },
  { key: "balanceQty", label: "Balance Qty", readOnly: true },
  { key: "unitPrice", label: "Unit Price", num: true },
  { key: "totalValue", label: "Total Value", readOnly: true },
  { key: "location", label: "Location" },
];

export default function StockPage({ category, apiCategory, title }) {
  const { canWrite, canDelete } = useAuth();

  const [rows, setRows] = useState([]);
  const [lists, setLists] = useState({});
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({});

  const load = async () => {
    try {
      const res = await api.get(`/stock/${apiCategory}`, {
        params: { q: search },
      });

      setRows(res.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Refresh failed");
    }
  };

  useEffect(() => {
    load();
  }, [apiCategory]);

  useEffect(() => {
    api
      .get("/lists")
      .then((res) => setLists(res.data || {}))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return rows.filter((r) => {
      return !q || JSON.stringify(r).toLowerCase().includes(q);
    });
  }, [rows, search]);

  const startAdd = () => {
    const newRow = {
      category,
      itemCode: "",
      itemDescription: "",
      uom: "",
      openingQty: 0,
      inwardQty: 0,
      issuedQty: 0,
      balanceQty: 0,
      unitPrice: 0,
      totalValue: 0,
      location: "",
    };

    setDraft(newRow);
    setEditing("new");
  };

  const recalcDraft = (next) => {
    const openingQty = Number(next.openingQty || 0);
    const inwardQty = Number(next.inwardQty || 0);
    const issuedQty = Number(next.issuedQty || 0);
    const unitPrice = Number(next.unitPrice || 0);

    const balanceQty = openingQty + inwardQty - issuedQty;
    const totalValue = balanceQty * unitPrice;

    return {
      ...next,
      balanceQty,
      totalValue,
    };
  };

  const save = async () => {
    try {
      if (!draft.itemCode || !draft.itemDescription) {
        return toast.error("Item Code and Description required");
      }

      if (editing === "new") {
        await api.post(`/stock/${apiCategory}`, {
          ...draft,
          category,
        });
      } else {
        await api.put(`/stock/${editing}`, draft);
      }

      toast.success("Saved successfully");
      setEditing(null);
      setDraft({});
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed");
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this item?")) return;

    try {
      await api.delete(`/stock/${id}`);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  };

  const importExcel = async (file) => {
    try {
      if (!file) {
        return toast.error("Please select an Excel file first");
      }

      if (!/\.(xlsx|xls|xlsm)$/i.test(file.name)) {
        return toast.error("Only Excel files are allowed (.xlsx, .xls, .xlsm)");
      }

      const form = new FormData();

      /*
        IMPORTANT:
        Backend route upload.single("file") use kar raha hai.
        Is liye yahan field name "file" hi rehna chahiye.
      */
      form.append("file", file);
      form.append("sheetName", title);

      const res = await api.post(`/stock/${apiCategory}/import`, form);

      toast.success(`Imported ${res.data?.imported || 0} rows in ${title}`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Excel import failed");
    }
  };

  const deleteAll = async () => {
    if (!confirm(`Delete ALL rows from ${title}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await api.delete(`/stock/${apiCategory}/all`);
      toast.success(`Deleted ${res.data?.deleted || 0} rows`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete all failed");
    }
  };

  const renderCell = (r, col, idx) => {
    const isEdit = editing === r._id || (editing === "new" && r._id === "new");

    if (!isEdit) {
      return col.key === "srNo" ? idx + 1 : r[col.key] ?? "";
    }

    if (col.key === "srNo") {
      return idx + 1;
    }

    if (col.selectGroup) {
      const options = lists[col.selectGroup]?.map((x) => x.value) || [];

      return (
        <select
          value={draft[col.key] ?? ""}
          onChange={(e) =>
            setDraft(recalcDraft({ ...draft, [col.key]: e.target.value }))
          }
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
        value={draft[col.key] ?? ""}
        type={col.num ? "number" : "text"}
        onChange={(e) =>
          setDraft(recalcDraft({ ...draft, [col.key]: e.target.value }))
        }
      />
    );
  };

  const data =
    editing === "new" ? [{ ...draft, _id: "new" }, ...filtered] : filtered;

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
        onExportPDF={() =>
          exportRowsPDF(
            filtered,
            [...columns, { key: "action", label: "Action" }],
            title
          )
        }
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
            {data.map((r, idx) => (
              <tr key={r._id}>
                {columns.map((c) => (
                  <td key={c.key}>{renderCell(r, c, idx)}</td>
                ))}

                <td className="action-cell">
                  {canWrite && (editing === r._id || r._id === "new") && (
                    <button className="save-btn" onClick={save}>
                      Save
                    </button>
                  )}

                  {canWrite && editing !== r._id && r._id !== "new" && (
                    <button
                      onClick={() => {
                        setEditing(r._id);
                        setDraft(r);
                      }}
                    >
                      Edit
                    </button>
                  )}

                  {canWrite && editing && (
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
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="empty-cell">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
