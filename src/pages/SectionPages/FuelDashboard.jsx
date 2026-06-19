import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/api";
import PageToolbar from "../../components/Table/PageToolbar";
import { exportRowsExcel, exportRowsPDF } from "../../utils/exporters";
import { sectionPages } from "./sectionDefinitions";
import "./GenericExcelPage.css";
import "./FuelDashboard.css";

function num(value) {
  const n = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function monthFromDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function normalizeRow(record) {
  const data = record?.data || record || {};
  const month = data.Month || monthFromDate(data.Date);
  const going = num(data["Going Dist.(KM)"]);
  const returning = num(data["Return Dist.(KM)"]);
  const totalDistance = num(data["Total Dist.(KM)"]) || going + returning;
  const fuelPaid = num(data["Fuel Paid (Rs.)"]);
  const fuelRate = num(data["Fuel Rate (Rs./Ltr)"]);
  const petrol = num(data["Petrol (Liters)"]) || (fuelRate ? fuelPaid / fuelRate : 0);
  return {
    ...data,
    Month: month,
    "No. of Trips": num(data["No. of Trips"]),
    "Total Dist.(KM)": totalDistance,
    "Fuel Paid (Rs.)": fuelPaid,
    "Petrol (Liters)": petrol,
  };
}

const fixedMonths = ["May 2026", "June 2026", "July 2026", "August 2026", "September 2026", "October 2026", "November 2026", "December 2026"];
const summaryColumns = [
  { key: "Month Period", label: "Month Period" },
  { key: "No. of Trips", label: "No. of Trips" },
  { key: "Total Distance (KM)", label: "Total Distance (KM)" },
  { key: "Total Fuel (Ltrs)", label: "Total Fuel (Ltrs)" },
  { key: "Total Price (Rs.)", label: "Total Price (Rs.)" },
];

export default function FuelDashboard() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const monthlyConfig = sectionPages.monthlyTravel;
  const endpoint = `/sections/${monthlyConfig.sectionKey}/${monthlyConfig.pageKey}`;

  const load = async () => {
    setBusy(true);
    try {
      const res = await api.get(endpoint);
      setRecords(res.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Dashboard refresh failed");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { load(); }, []);

  const normalized = useMemo(() => records.map(normalizeRow), [records]);
  const months = useMemo(() => {
    const extra = normalized.map(r => r.Month).filter(Boolean).filter(m => !fixedMonths.includes(m));
    return [...fixedMonths, ...Array.from(new Set(extra))];
  }, [normalized]);

  const summary = useMemo(() => months.map(month => {
    const rows = normalized.filter(r => r.Month === month);
    return {
      "Month Period": month,
      "No. of Trips": rows.reduce((s, r) => s + num(r["No. of Trips"]), 0),
      "Total Distance (KM)": rows.reduce((s, r) => s + num(r["Total Dist.(KM)"]), 0),
      "Total Fuel (Ltrs)": rows.reduce((s, r) => s + num(r["Petrol (Liters)"]), 0),
      "Total Price (Rs.)": rows.reduce((s, r) => s + num(r["Fuel Paid (Rs.)"]), 0),
    };
  }), [months, normalized]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return summary.filter(row => !q || JSON.stringify(row).toLowerCase().includes(q));
  }, [summary, search]);

  const totals = useMemo(() => summary.reduce((acc, row) => ({
    "Month Period": "Cumulative Total",
    "No. of Trips": acc["No. of Trips"] + num(row["No. of Trips"]),
    "Total Distance (KM)": acc["Total Distance (KM)"] + num(row["Total Distance (KM)"]),
    "Total Fuel (Ltrs)": acc["Total Fuel (Ltrs)"] + num(row["Total Fuel (Ltrs)"]),
    "Total Price (Rs.)": acc["Total Price (Rs.)"] + num(row["Total Price (Rs.)"]),
  }), { "Month Period": "Cumulative Total", "No. of Trips": 0, "Total Distance (KM)": 0, "Total Fuel (Ltrs)": 0, "Total Price (Rs.)": 0 }), [summary]);

  const importExcel = async (file) => {
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("sheetName", monthlyConfig.title);
      form.append("columns", JSON.stringify(monthlyConfig.columns));
      const res = await api.post(`${endpoint}/import`, form);
      toast.success(`Imported ${res.data?.imported || 0} Monthly Travel rows`);
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Excel import failed");
    }
  };

  const fmt = (value, digits = 2) => Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: digits });

  return (
    <div className="fuel-dashboard-page excel-section-page fuel">
      <PageToolbar
        title="Petrol Consumption Dashboard"
        search={search}
        setSearch={setSearch}
        onRefresh={load}
        onFilter={load}
        onImportExcel={importExcel}
        onExportExcel={() => exportRowsExcel([...summary, totals], "Petrol Consumption Dashboard.xlsx")}
        onExportPDF={() => exportRowsPDF([...summary, totals], summaryColumns, "Petrol Consumption Dashboard")}
      />

      <div className="fuel-hero-card">
        <div>
          <p className="eyebrow">ENGINEERING - PETROL MANAGEMENT DASHBOARD</p>
          <h2>Petrol Consumption Dashboard</h2>
          
        </div>
        <div className="fuel-total-card">
          <span>Cumulative Fuel Price</span>
          <b>Rs. {fmt(totals["Total Price (Rs.)"])}</b>
          <small>{fmt(totals["Total Fuel (Ltrs)"], 3)} Liters • {fmt(totals["Total Distance (KM)"])} KM</small>
        </div>
      </div>

      <div className="fuel-info-grid">
        <div><span>Employee Name</span><b>Zeeshan Aslam</b></div>
        <div><span>Designation</span><b>Store Incharge (Engineering)</b></div>
        <div><span>Report Framework</span><b>May 2026 - Dec 2026</b></div>
        <div><span>Travel Records</span><b>{normalized.length}</b></div>
      </div>

      <div className="sheet-card fuel-summary-card">
        <div className="sheet-title-band">Month-wise Petrol Consumption Summary</div>
        <div className="sheet-meta-row">
          <span>Data Source: Monthly Travel Entries</span>
          <span>{busy ? "Refreshing..." : `Rows: ${filtered.length}`}</span>
        </div>
        <div className="excel-table-wrap fuel-table-wrap">
          <table className="excel-like-table fuel-summary-table">
            <thead>
              <tr>{summaryColumns.map(col => <th key={col.key}>{col.label}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row["Month Period"]}>
                  <td>{row["Month Period"]}</td>
                  <td>{fmt(row["No. of Trips"], 0)}</td>
                  <td>{fmt(row["Total Distance (KM)"])}</td>
                  <td>{fmt(row["Total Fuel (Ltrs)"], 3)}</td>
                  <td>Rs. {fmt(row["Total Price (Rs.)"])}</td>
                </tr>
              ))}
              <tr className="cumulative-row">
                <td>{totals["Month Period"]}</td>
                <td>{fmt(totals["No. of Trips"], 0)}</td>
                <td>{fmt(totals["Total Distance (KM)"])}</td>
                <td>{fmt(totals["Total Fuel (Ltrs)"], 3)}</td>
                <td>Rs. {fmt(totals["Total Price (Rs.)"])}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
