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

function cleanText(value) {
  return String(value || "").trim();
}

function toNumber(value) {
  return Number(value || 0);
}

export default function StockPage({ category, apiCategory, title }) {
  const { canWrite, canDelete } = useAuth();

  const [rows, setRows] = useState([]);
  const [lists, setLists] = useState({});
  const [search, setSearch] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({});

  const load = async (q = "") => {
    try {
      const res = await api.get(`/stock/${apiCategory}`, {
        params: { q },
      });

      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Stock refresh failed:", e);
      toast.error(e.response?.data?.message || "Refresh failed");
    }
  };

  useEffect(() => {
    setSearch("");
    setAdvancedFilters({});
    setEditing(null);
    setDraft({});
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiCategory]);

  useEffect(() => {
    api
      .get("/lists")
      .then((res) => setLists(res.data || {}))
      .catch((e) => {
        console.warn("Lists load failed:", e);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = cleanText(search).toLowerCase();

    const activeFilters = Object.entries(advancedFilters).filter(
      ([, value]) => cleanText(value) !== ""
    );

    return rows.filter((row) => {
      const searchMatch =
        !q || JSON.stringify(row).toLowerCase().includes(q);

      const advancedMatch = activeFilters.every(([key, value]) => {
        const rowValue = String(row[key] ?? "").toLowerCase();
        const filterValue = String(value ?? "").toLowerCase();

        return rowValue.includes(filterValue);
      });

      return searchMatch && advancedMatch;
    });
  }, [rows, search, advancedFilters]);

  const filterFields = useMemo(() => {
    return columns
      .filter((col) => col.key !== "srNo")
      .map((col) => ({
        key: col.key,
        label: col.label,
        type: col.num ? "number" : "text",
        options: col.selectGroup
          ? lists[col.selectGroup]?.map((x) => x.value) || []
          : [],
      }));
  }, [lists]);

  const recalcDraft = (next) => {
    const openingQty = toNumber(next.openingQty);
    const inwardQty = toNumber(next.inwardQty);
    const issuedQty = toNumber(next.issuedQty);
    const unitPrice = toNumber(next.unitPrice);

    const balanceQty = openingQty + inwardQty - issuedQty;
    const totalValue = balanceQty * unitPrice;

    return {
      ...next,
      category,
      openingQty,
      inwardQty,
      issuedQty,
      unitPrice,
      balanceQty,
      totalValue,
    };
  };

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

  const startEdit = (row) => {
    setEditing(row._id);

    setDraft(
      recalcDraft({
        ...row,
        category: row.category || category,
      })
    );
  };

  const save = async () => {
    try {
      const finalDraft = recalcDraft({
        ...draft,
        itemCode: cleanText(draft.itemCode),
        itemDescription: cleanText(draft.itemDescription),
        uom: cleanText(draft.uom),
        location: cleanText(draft.location),
        category,
      });

      if (!finalDraft.itemCode || !finalDraft.itemDescription) {
        return toast.error("Item Code and Description required");
      }

      if (editing === "new") {
        await api.post(`/stock/${apiCategory}`, finalDraft);
      } else {
        await api.put(`/stock/${editing}`, finalDraft);
      }

      toast.success("Saved successfully");
      setEditing(null);
      setDraft({});
      await load(search);
    } catch (e) {
      console.error("Stock save failed:", e);
      toast.error(e.response?.data?.message || "Save failed");
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this item?")) return;

    try {
      await api.delete(`/stock/${id}`);
      toast.success("Deleted");
      await load(search);
    } catch (e) {
      console.error("Stock delete failed:", e);
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
      form.append("file", file);
      form.append("sheetName", title || category || apiCategory);
      form.append("category", category);

      const res = await api.post(`/stock/${apiCategory}/import`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(
        res.data?.message ||
          `Imported ${res.data?.imported || 0} rows in ${title}`
      );

      setEditing(null);
      setDraft({});
      await load(search);
    } catch (e) {
      console.error("Excel import failed:", e);
      toast.error(
        e.response?.data?.message ||
          e.message ||
          "Excel import failed. Please check backend import route."
      );
    }
  };

  const deleteAll = async () => {
    if (!confirm(`Delete ALL rows from ${title}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await api.delete(`/stock/${apiCategory}/all`);
      toast.success(`Deleted ${res.data?.deleted || 0} rows`);
      await load(search);
    } catch (e) {
      console.error("Delete all failed:", e);
      toast.error(e.response?.data?.message || "Delete all failed");
    }
  };

  const renderCell = (row, col, idx) => {
    const isEdit =
      editing === row._id || (editing === "new" && row._id === "new");

    if (!isEdit) {
      if (col.key === "srNo") return idx + 1;

      if (col.num || col.readOnly) {
        return Number(row[col.key] || 0).toLocaleString("en-PK", {
          maximumFractionDigits: 2,
        });
      }

      return row[col.key] ?? "";
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
            setDraft(
              recalcDraft({
                ...draft,
                [col.key]: e.target.value,
              })
            )
          }
        >
          <option value="">Select</option>

          {options.map((value) => (
            <option key={value} value={value}>
              {value}
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
          setDraft(
            recalcDraft({
              ...draft,
              [col.key]: e.target.value,
            })
          )
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
        onRefresh={() => load(search)}
        onFilter={setAdvancedFilters}
        filterFields={filterFields}
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
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}

              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, idx) => {
              const isCurrentEdit =
                editing === row._id ||
                (editing === "new" && row._id === "new");

              return (
                <tr key={row._id}>
                  {columns.map((col) => (
                    <td key={col.key}>{renderCell(row, col, idx)}</td>
                  ))}

                  <td className="action-cell">
                    {canWrite && isCurrentEdit && (
                      <button className="save-btn" onClick={save}>
                        Save
                      </button>
                    )}

                    {canWrite && !isCurrentEdit && row._id !== "new" && (
                      <button onClick={() => startEdit(row)}>Edit</button>
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

                    {canDelete && row._id !== "new" && (
                      <button
                        className="delete-btn"
                        onClick={() => del(row._id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

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
