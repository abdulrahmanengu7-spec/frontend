import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import PageToolbar from "../../components/Table/PageToolbar";
import { exportRowsExcel, exportRowsPDF } from "../../utils/exporters";
import "../Stock/StockPage.css";

const defaultCategories = ["Inventory", "Non Inventory", "Services", "Patty Cash"];

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

function getListValue(item) {
  if (typeof item === "string") return item;

  return (
    item?.value ||
    item?.name ||
    item?.label ||
    item?.title ||
    item?.text ||
    ""
  );
}

function uniqueValues(values) {
  return [...new Set(values.map(cleanText).filter(Boolean))];
}

export default function TransactionPage({ type, title }) {
  const { canWrite, canDelete } = useAuth();

  const columns = type === "inward" ? inwardColumns : issueColumns;

  const lookupTimerRef = useRef(null);
  const lookupRequestRef = useRef(0);

  const [rows, setRows] = useState([]);
  const [lists, setLists] = useState({});
  const [search, setSearch] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({});

  const load = async (q = "") => {
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
    setAdvancedFilters({});
    setEditing(null);
    setDraft({});

    if (lookupTimerRef.current) {
      clearTimeout(lookupTimerRef.current);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useEffect(() => {
    api
      .get("/lists")
      .then((res) => setLists(res.data || {}))
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (lookupTimerRef.current) {
        clearTimeout(lookupTimerRef.current);
      }
    };
  }, []);

  const categoryOptions = useMemo(() => {
    const possibleGroups = [
      lists.Category,
      lists.Categories,
      lists.category,
      lists.categories,
      lists["Stock Category"],
      lists["Item Category"],
    ];

    const fromLists = possibleGroups
      .flatMap((group) => (Array.isArray(group) ? group : []))
      .map(getListValue);

    return uniqueValues([...fromLists, ...defaultCategories]);
  }, [lists]);

  const getSelectGroupOptions = (groupName) => {
    return uniqueValues((lists[groupName] || []).map(getListValue));
  };

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
        type: col.type || (col.num ? "number" : "text"),
        options: col.select
          ? categoryOptions
          : col.selectGroup
          ? uniqueValues((lists[col.selectGroup] || []).map(getListValue))
          : [],
      }));
  }, [columns, categoryOptions, lists]);

  const clearItemFields = (next) => {
    return {
      ...next,
      itemDescription: "",
      uom: "",
      unitPrice: 0,
      openQty: 0,
      balanceQty: 0,
      total: 0,
      _stockBalance: 0,
    };
  };

  const recalcTransactionDraft = (next) => {
    const unitPrice = Number(next.unitPrice || 0);
    const qtyReceived = Number(next.qtyReceived || 0);
    const qtyIssued = Number(next.qtyIssued || 0);
    const stockBalance = Number(
      next._stockBalance ?? next.openQty ?? next.balanceQty ?? 0
    );

    if (type === "inward") {
      return {
        ...next,
        openQty: stockBalance,
        balanceQty: stockBalance + qtyReceived,
        total: qtyReceived * unitPrice,
      };
    }

    return {
      ...next,
      balanceQty: stockBalance - qtyIssued,
      total: qtyIssued * unitPrice,
    };
  };

  const applyLookupResult = (baseDraft, item) => {
    const stockBalance = Number(item.balanceQty || 0);
    const unitPrice = Number(item.unitPrice || 0);

    const withStock = {
      ...baseDraft,
      itemCode: cleanText(baseDraft.itemCode),
      category: cleanText(baseDraft.category),
      itemDescription: item.itemDescription || "",
      uom: item.uom || "",
      unitPrice,
      openQty: stockBalance,
      _stockBalance: stockBalance,
    };

    return recalcTransactionDraft(withStock);
  };

  const runLookup = async (baseDraft = draft, showError = false) => {
    if (lookupTimerRef.current) {
      clearTimeout(lookupTimerRef.current);
    }

    const itemCode = cleanText(baseDraft.itemCode);
    const category = cleanText(baseDraft.category);

    if (!itemCode) {
      setDraft((prev) =>
        clearItemFields({
          ...prev,
          itemCode: "",
        })
      );
      return;
    }

    if (!category) return;

    const requestId = lookupRequestRef.current + 1;
    lookupRequestRef.current = requestId;

    try {
      const res = await api.get("/stock/lookup", {
        params: {
          itemCode,
          category,
        },
      });

      if (lookupRequestRef.current !== requestId) return;

      const item = res.data || {};

      setDraft((prev) => {
        const currentCode = cleanText(prev.itemCode);
        const currentCategory = cleanText(prev.category);

        if (currentCode !== itemCode || currentCategory !== category) {
          return prev;
        }

        return applyLookupResult(prev, item);
      });
    } catch (e) {
      if (lookupRequestRef.current !== requestId) return;

      if (showError) {
        toast.error("Item not found in selected category");
      }

      setDraft((prev) => {
        const currentCode = cleanText(prev.itemCode);
        const currentCategory = cleanText(prev.category);

        if (currentCode !== itemCode || currentCategory !== category) {
          return prev;
        }

        return clearItemFields(prev);
      });
    }
  };

  const setField = (key, value) => {
    let next = {
      ...draft,
      [key]: value,
    };

    if (key === "itemCode") {
      if (lookupTimerRef.current) {
        clearTimeout(lookupTimerRef.current);
      }

      const itemCode = cleanText(value);

      if (!itemCode) {
        setDraft(clearItemFields(next));
        return;
      }

      setDraft(next);

      lookupTimerRef.current = setTimeout(() => {
        runLookup(next, false);
      }, 700);

      return;
    }

    if (key === "category") {
      setDraft(next);

      if (cleanText(next.itemCode)) {
        runLookup(next, false);
      }

      return;
    }

    if (["qtyReceived", "qtyIssued"].includes(key)) {
      next = recalcTransactionDraft(next);
    }

    setDraft(next);
  };

  const startAdd = () => {
    const firstCategory = categoryOptions[0] || "Inventory";

    if (lookupTimerRef.current) {
      clearTimeout(lookupTimerRef.current);
    }

    if (type === "inward") {
      setDraft({
        deliveryDate: today(),
        category: firstCategory,
        itemCode: "",
        itemDescription: "",
        uom: "",
        qtyReceived: 0,
        openQty: 0,
        unitPrice: 0,
        total: 0,
        _stockBalance: 0,
      });
    } else {
      setDraft({
        date: today(),
        category: firstCategory,
        itemCode: "",
        itemDescription: "",
        uom: "",
        qtyIssued: 0,
        balanceQty: 0,
        unitPrice: 0,
        total: 0,
        _stockBalance: 0,
      });
    }

    setEditing("new");
  };

  const save = async () => {
    try {
      const cleanDraft = { ...draft };
      delete cleanDraft._stockBalance;

      if (editing === "new") {
        await api.post(`/transactions/${type}`, cleanDraft);
      } else {
        await api.put(`/transactions/${editing}`, cleanDraft);
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
    if (lookupTimerRef.current) {
      clearTimeout(lookupTimerRef.current);
    }

    setEditing(row._id);

    setDraft({
      ...row,
      date: dateValue(row.date),
      deliveryDate: dateValue(row.deliveryDate),
      _stockBalance: Number(row.openQty ?? row.balanceQty ?? 0),
    });
  };

  const renderCell = (row, col, idx) => {
    const isEdit =
      editing === row._id || (editing === "new" && row._id === "new");

    if (!isEdit) {
      if (col.key === "srNo") return idx + 1;

      if (["date", "deliveryDate"].includes(col.key) && row[col.key]) {
        return dateValue(row[col.key]);
      }

      return row[col.key] ?? "";
    }

    if (col.select) {
      return (
        <select
          value={draft[col.key] || categoryOptions[0] || "Inventory"}
          onChange={(e) => setField(col.key, e.target.value)}
        >
          {categoryOptions.map((categoryName) => (
            <option key={categoryName} value={categoryName}>
              {categoryName}
            </option>
          ))}
        </select>
      );
    }

    if (col.selectGroup) {
      const options = getSelectGroupOptions(col.selectGroup);

      return (
        <select
          value={draft[col.key] || ""}
          onChange={(e) => setField(col.key, e.target.value)}
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
        type={col.type || (col.num ? "number" : "text")}
        value={
          ["date", "deliveryDate"].includes(col.key)
            ? dateValue(draft[col.key])
            : draft[col.key] ?? ""
        }
        onChange={(e) => setField(col.key, e.target.value)}
        onBlur={(e) => {
          if (col.key === "itemCode" && cleanText(e.target.value)) {
            runLookup(
              {
                ...draft,
                itemCode: e.target.value,
              },
              false
            );
          }
        }}
        onKeyDown={(e) => {
          if (col.key === "itemCode" && e.key === "Enter") {
            e.preventDefault();

            runLookup(
              {
                ...draft,
                itemCode: e.currentTarget.value,
              },
              true
            );
          }
        }}
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
    if (!confirm(`Delete ALL rows from ${title}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await api.delete(`/transactions/${type}/all`);
      toast.success(`Deleted ${res.data?.deleted || 0} rows`);
      load(search);
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete all failed");
    }
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
        onExportPDF={() => exportRowsPDF(filtered, columns, title)}
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
