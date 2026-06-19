import { useEffect, useState } from "react";
import api from "../../api/api";
import "./Dashboard.css";

const money = (v) => Number(v || 0).toLocaleString("en-PK", { maximumFractionDigits: 0 });

export default function MachineDashboard() {
  const [data, setData] = useState({ months: [], categories: [], rows: [], grandTotal: 0, categoryTotals: {} });
  useEffect(() => { api.get("/dashboard/machine").then(res => setData(res.data)); }, []);
  return (
    <div className="dashboard-page machine-excel">
      <div className="excel-title-block">
        <h1>Machine Wise Issuance Dashboard</h1>
        <h2>Inventory + Non Inventory issuance value by Equipment/Machine Issuance from May 2026 to Dec 2026</h2>
      </div>
      <div className="machine-summary-cards">
        <div className="kpi-box"><span>Grand Total</span><b>{money(data.grandTotal)}</b></div>
        {(data.categories || []).map(c => <div className="kpi-box" key={c}><span>{c}</span><b>{money(data.categoryTotals?.[c])}</b></div>)}
      </div>
      <div className="machine-table-wrap">
        <table className="machine-table">
          <thead>
            <tr><th rowSpan="2" className="machine-name">Machine Name</th>{(data.months || []).map(m => <th key={m.key} colSpan={(data.categories || []).length + 1}>{m.label}</th>)}<th rowSpan="2">Grand Total</th></tr>
            <tr>{(data.months || []).flatMap(m => [...(data.categories || []).map(c => <th key={`${m.key}-${c}`}>{c}</th>), <th key={`${m.key}-total`}>Month Total</th>])}</tr>
          </thead>
          <tbody>
            {(data.rows || []).map(r => (
              <tr key={r.machine}>
                <td className="machine-name">{r.machine}</td>
                {(data.months || []).flatMap(m => {
                  const cell = r.months?.[m.key] || { values: {}, monthTotal: 0 };
                  return [...(data.categories || []).map(c => <td key={`${r.machine}-${m.key}-${c}`}>{money(cell.values?.[c])}</td>), <td className="month-total" key={`${r.machine}-${m.key}-total`}>{money(cell.monthTotal)}</td>];
                })}
                <td className="grand-total-cell">{money(r.grandTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
