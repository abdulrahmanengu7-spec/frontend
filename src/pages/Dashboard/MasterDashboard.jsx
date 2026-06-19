import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import "./Dashboard.css";

const money = (v) =>
  Number(v || 0).toLocaleString("en-PK", {
    maximumFractionDigits: 0,
  });

const categories = ["Inventory", "Non Inventory", "Services", "Patty Cash"];

export default function MasterDashboard() {
  const [data, setData] = useState({
    totals: {},
    categorySummary: [],
    monthly: [],
    quickBoard: [],
  });

  useEffect(() => {
    api.get("/dashboard/master").then((res) => setData(res.data));
  }, []);

  const totals = data.totals || {};

  const categoryRows = data.categorySummary?.length
    ? data.categorySummary
    : (data.stock || []).map((r) => ({
        category: r._id,
        items: r.items,
        balance: r.balance,
        stockValue: r.value,
      }));

  const maxMonth = useMemo(
    () =>
      Math.max(
        1,
        ...(data.monthly || []).map((m) =>
          Math.max(m.inwardTotal || 0, m.issuanceTotal || 0)
        )
      ),
    [data.monthly]
  );

  return (
    <div className="dashboard-page excel-dashboard">
      <div className="excel-title-block">
        <h1>INVENTORY &amp; NON INVENTORY DASHBOARD</h1>
        <h2>LOTTE KOLSON PVT LTD</h2>
      </div>

      <div className="excel-kpi-grid">
        <div className="kpi-box">
          <span>Inventory Stock Value (PKR)</span>
          <b>{money(totals.inventoryStockValue)}</b>
        </div>

        <div className="kpi-box">
          <span>Non Inventory Stock Value (PKR)</span>
          <b>{money(totals.nonInventoryStockValue)}</b>
        </div>

        <div className="kpi-box">
          <span>Total Stock Value (PKR)</span>
          <b>{money(totals.totalStockValue)}</b>
        </div>

        <div className="kpi-box">
          <span>Total Inward Value (PKR)</span>
          <b>{money(totals.totalInwardValue)}</b>
        </div>

        <div className="kpi-box">
          <span>Total Issuance Value (PKR)</span>
          <b>{money(totals.totalIssuanceValue)}</b>
        </div>
      </div>

      <div className="excel-section two-col">
        <div className="excel-panel">
          <h3>QUICK DECISION BOARD</h3>

          <table className="excel-small-table">
            <thead>
              <tr>
                <th>Board</th>
                <th>Current</th>
                <th>Signal</th>
                <th>Next Action</th>
                <th>Owner</th>
              </tr>
            </thead>

            <tbody>
              {(data.quickBoard || []).map((r, i) => (
                <tr key={i}>
                  <td>{r.label}</td>
                  <td>
                    {typeof r.current === "number"
                      ? money(r.current)
                      : r.current}
                  </td>
                  <td>
                    <span
                      className={`signal ${String(r.signal || "")
                        .toLowerCase()
                        .replaceAll(" ", "-")}`}
                    >
                      {r.signal}
                    </span>
                  </td>
                  <td>{r.nextAction}</td>
                  <td>{r.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="excel-panel">
          <h3>CATEGORY WISE SUMMARY</h3>

          <table className="excel-small-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Items</th>
                <th>Balance</th>
                <th>Stock Value</th>
                <th>Inward</th>
                <th>Issuance</th>
                <th>Gap</th>
              </tr>
            </thead>

            <tbody>
              {categoryRows.map((r) => (
                <tr key={r.category}>
                  <td>{r.category}</td>
                  <td>{money(r.items)}</td>
                  <td>{money(r.balance)}</td>
                  <td>{money(r.stockValue)}</td>
                  <td>{money(r.inwardValue)}</td>
                  <td>{money(r.issuanceValue)}</td>
                  <td>{money(r.gap)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="excel-panel month-panel">
        <h3>MONTH WISE PRICE SUMMARY (MAY 2026 - DEC 2026)</h3>
        <p>
          Inward &amp; Issuance Price Value by Inventory / Non Inventory /
          Services / Patty Cash
        </p>

        <div className="month-grid">
          {(data.monthly || []).map((m) => (
            <div className="month-card" key={m.key}>
              <h4>{m.label}</h4>

              <div className="bars">
                <div className="bar-row">
                  <span>Inward</span>
                  <div>
                    <i
                      style={{
                        width: `${Math.max(
                          4,
                          (Number(m.inwardTotal || 0) / maxMonth) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <b>{money(m.inwardTotal)}</b>
                </div>

                <div className="bar-row">
                  <span>Issuance</span>
                  <div>
                    <i
                      style={{
                        width: `${Math.max(
                          4,
                          (Number(m.issuanceTotal || 0) / maxMonth) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <b>{money(m.issuanceTotal)}</b>
                </div>
              </div>

              <table>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c}>
                      <td>{c}</td>
                      <td>{money(m.inwardValues?.[c])}</td>
                      <td>{money(m.issuanceValues?.[c])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
