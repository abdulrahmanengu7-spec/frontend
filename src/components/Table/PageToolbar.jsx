import { useRef, useState } from "react";
import { FiDownload, FiFileText, FiFilter, FiPlus, FiRefreshCcw, FiSearch, FiTrash2, FiUpload } from "react-icons/fi";
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

  return (
    <div className="page-toolbar">
      <div>
        <h1>{title}</h1>
       
      </div>
      <div className="toolbar-actions">
        <div className="search-box"><FiSearch /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search / Filter..." /></div>
        <button type="button" onClick={() => (onFilter ? onFilter() : onRefresh?.())}><FiFilter /> Filter</button>
        {canWrite && onAdd && <button type="button" onClick={onAdd}><FiPlus /> Add Row</button>}
        {canWrite && onImportExcel && <button type="button" onClick={pickFile} disabled={busy}><FiUpload /> Import Excel</button>}
        {canWrite && onImportExcel && <input ref={fileRef} className="hidden-file" type="file" accept=".xlsx,.xls,.xlsm" onChange={importFile} />}
        {canExport && onExportExcel && <button type="button" onClick={onExportExcel}><FiDownload /> Export Excel</button>}
        {canExport && onExportPDF && <button type="button" onClick={onExportPDF}><FiFileText /> Export PDF</button>}
        {onRefresh && <button type="button" onClick={refresh} disabled={busy}><FiRefreshCcw /> {busy ? "Working..." : "Refresh"}</button>}
        {canDelete && onDeleteAll && <button type="button" className="danger-toolbar-btn" onClick={onDeleteAll}><FiTrash2 /> Delete All</button>}
      </div>
    </div>
  );
}
