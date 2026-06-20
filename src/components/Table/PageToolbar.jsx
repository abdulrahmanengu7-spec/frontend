import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiDownload,
  FiFileText,
  FiFilter,
  FiPlus,
  FiRefreshCcw,
  FiSearch,
  FiTrash2,
  FiUpload,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import "./PageToolbar.css";

function cleanText(value) {
  return String(value || "").trim();
}

function getOptionValue(option) {
  if (typeof option === "string" || typeof option === "number") {
    return String(option);
  }

  return String(
    option?.value ||
      option?.name ||
      option?.label ||
      option?.title ||
      option?.text ||
      ""
  );
}

function getOptionLabel(option) {
  if (typeof option === "string" || typeof option === "number") {
    return String(option);
  }

  return String(
    option?.label ||
      option?.name ||
      option?.value ||
      option?.title ||
      option?.text ||
      ""
  );
}

export default function PageToolbar({
  title,
  search,
  setSearch,
  onAdd,
  onExportExcel,
  onExportPDF,
  onRefresh,
  onImportExcel,
  onDeleteAll,
  onFilter,
  filterFields = [],
}) {
  const { canWrite, canExport, canDelete } = useAuth();

  const fileRef = useRef(null);

  const [busy, setBusy] = useState(false);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filterValues, setFilterValues] = useState({});

  const activeFilterCount = useMemo(() => {
    return Object.values(filterValues).filter(
      (value) => cleanText(value) !== ""
    ).length;
  }, [filterValues]);

  useEffect(() => {
    setFilterValues({});
    setShowAdvancedFilter(false);

    if (onFilter) {
      onFilter({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const pickFile = () => {
    fileRef.current?.click();
  };

  const importFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file || !onImportExcel) return;

    setBusy(true);

    try {
      await onImportExcel(file);
    } finally {
      setBusy(false);
    }
  };

  const refresh = async () => {
    if (!onRefresh) return;

    setBusy(true);

    try {
      await onRefresh();
    } finally {
      setBusy(false);
    }
  };

  const openFilterBox = () => {
    setShowAdvancedFilter((prev) => !prev);
  };

  const changeFilter = (key, value) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyAdvancedFilter = () => {
    if (onFilter) {
      onFilter(filterValues);
    }

    setShowAdvancedFilter(false);
  };

  const clearAdvancedFilter = () => {
    setFilterValues({});

    if (onFilter) {
      onFilter({});
    }

    setShowAdvancedFilter(false);
  };

  const handleFilterKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyAdvancedFilter();
    }

    if (e.key === "Escape") {
      setShowAdvancedFilter(false);
    }
  };

  return (
    <div className="page-toolbar">
      <div>
        <h1>{title}</h1>
      </div>

      <div className="toolbar-right-area">
        <div className="toolbar-actions">
          <div className="search-box">
            <FiSearch />

            <input
              value={search || ""}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
            />
          </div>

          {onFilter && (
            <button type="button" onClick={openFilterBox}>
              <FiFilter />
              Filter {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
            </button>
          )}

          {canWrite && onAdd && (
            <button type="button" onClick={onAdd} disabled={busy}>
              <FiPlus /> Add Row
            </button>
          )}

          {canWrite && onImportExcel && (
            <button type="button" onClick={pickFile} disabled={busy}>
              <FiUpload /> Import Excel
            </button>
          )}

          {canWrite && onImportExcel && (
            <input
              ref={fileRef}
              className="hidden-file"
              type="file"
              accept=".xlsx,.xls,.xlsm"
              onChange={importFile}
            />
          )}

          {canExport && onExportExcel && (
            <button type="button" onClick={onExportExcel} disabled={busy}>
              <FiDownload /> Export Excel
            </button>
          )}

          {canExport && onExportPDF && (
            <button type="button" onClick={onExportPDF} disabled={busy}>
              <FiFileText /> Export PDF
            </button>
          )}

          {onRefresh && (
            <button type="button" onClick={refresh} disabled={busy}>
              <FiRefreshCcw /> {busy ? "Working..." : "Refresh"}
            </button>
          )}

          {canDelete && onDeleteAll && (
            <button
              type="button"
              className="danger-toolbar-btn"
              onClick={onDeleteAll}
              disabled={busy}
            >
              <FiTrash2 /> Delete All
            </button>
          )}
        </div>

        {showAdvancedFilter && onFilter && (
          <div className="advanced-filter-box" onKeyDown={handleFilterKeyDown}>
            <div className="advanced-filter-header">
              <h3>Advanced Filter</h3>

              <button
                type="button"
                onClick={() => setShowAdvancedFilter(false)}
              >
                ×
              </button>
            </div>

            {filterFields.length === 0 ? (
              <div className="advanced-filter-empty">
                No filter fields available
              </div>
            ) : (
              <div className="advanced-filter-grid">
                {filterFields.map((field) => {
                  const options = Array.isArray(field.options)
                    ? field.options
                    : [];

                  return (
                    <div className="advanced-filter-field" key={field.key}>
                      <label>{field.label}</label>

                      {options.length ? (
                        <select
                          value={filterValues[field.key] || ""}
                          onChange={(e) =>
                            changeFilter(field.key, e.target.value)
                          }
                        >
                          <option value="">All</option>

                          {options.map((option) => {
                            const value = getOptionValue(option);
                            const label = getOptionLabel(option);

                            if (!value) return null;

                            return (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <input
                          type={
                            field.type === "date"
                              ? "date"
                              : field.type === "number"
                              ? "number"
                              : "text"
                          }
                          value={filterValues[field.key] || ""}
                          onChange={(e) =>
                            changeFilter(field.key, e.target.value)
                          }
                          placeholder={`Filter by ${field.label}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="advanced-filter-actions">
              <button type="button" onClick={applyAdvancedFilter}>
                Apply Filter
              </button>

              <button type="button" onClick={clearAdvancedFilter}>
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
