import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import PageToolbar from "../../components/Table/PageToolbar";
import TableScrollButtons from "../../components/Table/TableScrollButtons";
import { exportRowsExcel, exportRowsPDF } from "../../utils/exporters";
import "./GenericExcelPage.css";

function blankRow(columns) {
  return columns.reduce((acc, col) => {
    acc[col.key] = col.type === "number" ? 0 : "";
    return acc;
  }, {});
}

function normalizeIncomingRow(row, columns) {
  const data = row?.data || row || {};
  const normalized = {};

  columns.forEach((col) => {
    normalized[col.key] = data[col.key] ?? data[col.label] ?? "";
  });

  return normalized;
}

function num(value) {
  const n = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function monthFromDate(value) {
  if (!value) return "";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function recalcMonthlyTravel(row) {
  const next = { ...row };

  next.Month = next.Date ? monthFromDate(next.Date) : next.Month || "";

  const going = num(next["Going Dist.(KM)"]);
  const returning = num(next["Return Dist.(KM)"]);
  const fuelPaid = num(next["Fuel Paid (Rs.)"]);
  const fuelRate = num(next["Fuel Rate (Rs./Ltr)"]);

  next["Going Dist.(KM)"] = going;
  next["Return Dist.(KM)"] = returning;
  next["Total Dist.(KM)"] = Number((going + returning).toFixed(2));
  next["Fuel Paid (Rs.)"] = fuelPaid;
  next["Fuel Rate (Rs./Ltr)"] = fuelRate;
  next["Petrol (Liters)"] = fuelRate
    ? Number((fuelPaid / fuelRate).toFixed(3))
    : 0;
  next["No. of Trips"] = num(next["No. of Trips"]);

  return next;
}

function validateMonthlyTravel(row) {
  if (!row.Date) return "Date is required";
  if (!row["Purpose / Justification of Visit"]) {
    return "Purpose / justification is required";
  }
  if (!row["From Location"]) return "From location is required";
  if (!row["To Market / Vendor"]) return "Market / vendor is required";
  if (num(row["No. of Trips"]) <= 0) {
    return "Number of trips must be greater than 0";
  }
  if (num(row["Fuel Rate (Rs./Ltr)"]) < 0) {
    return "Fuel rate cannot be negative";
  }

  return "";
}

export default function GenericExcelPage({ config }) {
  const { canWrite, canDelete } = useAuth();

  const tableRef = useRef(null);

  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({});
  const [busy, setBusy] = useState(false);
  const [filters, setFilters] = useState({
    month: "",
    date: "",
    vendor: "",
  });

  const endpoint = `/sections/${config.sectionKey}/${config.pageKey}`;
  const columns = config.columns;
  const isMonthlyTravel = config.pageKey === "monthly-travel-entries";

  const load = async () => {
    setBusy(true);

    try {
      const res = await api.get(endpoint, {
        params: { q: search },
      });

      setRecords(res.data || []);
      return res.data || [];
    } catch (e) {
      toast.error(e.response?.data?.message || `${config.title} refresh failed`);
      return [];
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.pageKey]);

  const flatRows = useMemo(() => {
    return records.map((r) => ({
      ...normalizeIncomingRow(r, columns),
      _id: r._id || r.id,
    }));
  }, [records, columns]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return flatRows.filter((row) => {
      const textMatch =
        !q || JSON.stringify(row).toLowerCase().includes(q);

      if (!textMatch) return false;

      if (isMonthlyTravel) {
        if (filters.month && row.Month !== filters.month) return false;

        if (
          filters.date &&
          String(row.Date || "").slice(0, 10) !== filters.date
        ) {
          return false;
        }

        if (
          filters.vendor &&
          !String(row["To Market / Vendor"] || "")
            .toLowerCase()
            .includes(filters.vendor.toLowerCase())
        ) {
          return false;
        }
      }

      return true;
    });
  }, [flatRows, search, filters, isMonthlyTravel]);

  const monthOptions = useMemo(() => {
    return Array.from(new Set(flatRows.map((r) => r.Month).filter(Boolean)));
  }, [flatRows]);

  const startAdd = () => {
    const row = blankRow(columns);
    setDraft(isMonthlyTravel ? recalcMonthlyTravel(row) : row);
    setEditing("new");
  };

  const updateDraft = (key, value) => {
    const next = {
      ...draft,
      [key]: value,
    };

    setDraft(isMonthlyTravel ? recalcMonthlyTravel(next) : next);
  };

  const save = async () => {
    try {
      const payload = isMonthlyTravel ? recalcMonthlyTravel(draft) : draft;

      if (isMonthlyTravel) {
        const error = validateMonthlyTravel(payload);
        if (error) {
          toast.error(error);
          return;
        }
      }

      if (editing === "new") {
        await api.post(endpoint, {
          data: payload,
          title: config.title,
        });
      } else {
        await api.put(`/sections/${editing}`, {
          data: payload,
        });
      }

      toast.success("Saved successfully");
      setEditing(null);
      setDraft({});
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this row?")) return;

    try {
      await api.delete(`/sections/${id}`);
      toast.success("Row deleted");
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  };

  const deleteAll = async () => {
    if (!confirm(`Delete ALL rows from ${config.title}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await api.delete(`${endpoint}/all`);
      toast.success(`Deleted ${res.data?.deleted || 0} rows`);
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete all failed");
    }
  };

  const importExcel = async (file) => {
    try {
      const form = new FormData();

      form.append("file", file);
      form.append("sheetName", config.title);
      form.append("columns", JSON.stringify(columns));

      const res = await api.post(`${endpoint}/import`, form);

      toast.success(`Imported ${res.data?.imported || 0} rows`);
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Excel file import failed");
    }
  };

  const data =
    editing === "new" ? [{ ...draft, _id: "new" }, ...filtered] : filtered;

  const renderCell = (row, col, idx) => {
    const isEdit =
      editing === row._id || (editing === "new" && row._id === "new");

    if (!isEdit) {
      if (/^s\/?n$|^sr #$|^srno$/i.test(col.key) && !row[col.key]) {
        return idx + 1;
      }

      if (col.type === "number") {
        return Number(row[col.key] || 0).toLocaleString(undefined, {
          maximumFractionDigits: 3,
        });
      }

      return row[col.key] ?? "";
    }

    const readOnly =
      col.readOnly ||
      (isMonthlyTravel &&
        ["Month", "Total Dist.(KM)", "Petrol (Liters)"].includes(col.key));

    return (
      <input
        type={col.type || "text"}
        disabled={readOnly}
        value={draft[col.key] ?? ""}
        onChange={(e) => updateDraft(col.key, e.target.value)}
      />
    );
  };

  return (
    <div className={`excel-section-page ${config.theme || "default"}`}>
      <PageToolbar
        title={config.title}
        search={search}
        setSearch={setSearch}
        onAdd={startAdd}
        onRefresh={load}
        onFilter={load}
        onImportExcel={importExcel}
        onDeleteAll={deleteAll}
        onExportExcel={() =>
          exportRowsExcel(
            filtered.map(({ _id, ...row }) => row),
            `${config.title}.xlsx`
          )
        }
        onExportPDF={() => exportRowsPDF(filtered, columns, config.title)}
      />

      {isMonthlyTravel && (
        <div className="travel-filters">
          <label>
            Month
            <select
              value={filters.month}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  month: e.target.value,
                })
              }
            >
              <option value="">All Months</option>

              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label>
            Date
            <input
              type="date"
              value={filters.date}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  date: e.target.value,
                })
              }
            />
          </label>

          <label>
            Vendor / Market
            <input
              value={filters.vendor}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  vendor: e.target.value,
                })
              }
              placeholder="Filter vendor"
            />
          </label>

          <button
            type="button"
            onClick={() =>
              setFilters({
                month: "",
                date: "",
                vendor: "",
              })
            }
          >
            Clear Filters
          </button>
        </div>
      )}

      <div className="sheet-card">
        <div className="sheet-title-band">{config.sheetTitle}</div>
        <div className="sheet-group-band">{config.groupTitle}</div>

        <div className="sheet-meta-row">
          <span>Source design: {config.sourceFile}</span>
          <span>Rows: {filtered.length}</span>
          {busy && <span>Refreshing...</span>}
        </div>

        <div className="table-area excel-table-area">
          <div className="excel-table-wrap table-scroll-box" ref={tableRef}>
            <table
              className="excel-like-table"
              style={{
                minWidth: columns.reduce(
                  (sum, c) => sum + (c.width || 140),
                  140
                ),
              }}
            >
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} style={{ width: col.width }}>
                      {col.label}
                    </th>
                  ))}

                  <th className="action-th">Action</th>
                </tr>
              </thead>

              <tbody>
                {data.map((row, idx) => (
                  <tr key={row._id || idx}>
                    {columns.map((col) => (
                      <td key={col.key} style={{ width: col.width }}>
                        {renderCell(row, col, idx)}
                      </td>
                    ))}

                    <td className="action-cell">
                      {canWrite &&
                        (editing === row._id || row._id === "new") && (
                          <button className="save-btn" onClick={save}>
                            Save
                          </button>
                        )}

                      {canWrite &&
                        editing !== row._id &&
                        row._id !== "new" && (
                          <button
                            onClick={() => {
                              setEditing(row._id);
                              setDraft(
                                isMonthlyTravel
                                  ? recalcMonthlyTravel(
                                      normalizeIncomingRow(row, columns)
                                    )
                                  : normalizeIncomingRow(row, columns)
                              );
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

                      {canDelete && row._id !== "new" && (
                        <button
                          className="delete-btn"
                          onClick={() => remove(row._id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {!data.length && (
                  <tr>
                    <td colSpan={columns.length + 1} className="empty-row">
                      No data yet. Use Add Row or Import Excel to enter your
                      records.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <TableScrollButtons targetRef={tableRef} />
        </div>
      </div>
    </div>
  );
}
