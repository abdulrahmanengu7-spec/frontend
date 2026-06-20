import { useRef, useState } from "react";
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
}) {
  const { canWrite, canExport, canDelete } = useAuth();
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const pickFile = () => fileRef.current?.click();

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

  const filterData = async () => {
    setBusy(true);
    try {
      if (onFilter) {
        await onFilter(search);
      } else if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      filterData();
    }
  };

  return (
    <div className="page-toolbar">
      <div>
        <h1>{title}</h1>
      </div>

      <div className="toolbar-actions">
        <div className="search-box">
          <FiSearch />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search / Filter..."
          />
        </div>

        <button type="button" onClick={filterData} disabled={busy}>
          <FiFilter /> Filter
        </button>

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
    </div>
  );
}
