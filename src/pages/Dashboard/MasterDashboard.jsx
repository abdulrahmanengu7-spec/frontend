import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import "./Dashboard.css";

const categories = ["Inventory", "Non Inventory", "Services", "Patty Cash"];

const defaultMonths = [
  { key: "2026-05", label: "May-2026" },
  { key: "2026-06", label: "Jun-2026" },
  { key: "2026-07", label: "Jul-2026" },
  { key: "2026-08", label: "Aug-2026" },
  { key: "2026-09", label: "Sep-2026" },
  { key: "2026-10", label: "Oct-2026" },
  { key: "2026-11", label: "Nov-2026" },
  { key: "2026-12", label: "Dec-2026" },
];

const money = (value) =>
  Number(value || 0).toLocaleString("en-PK", {
    maximumFractionDigits: 0,
  });

const num = (value) => {
  const n = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
};

const emptyValues = () => ({
  Inventory: 0,
  "Non Inventory": 0,
  Services: 0,
  "Patty Cash": 0,
});

function normalizeMonthly(monthly = []) {
  const monthlyMap = new Map();

  monthly.forEach((m) => {
    monthlyMap.set(m.key || m.label, m);
  });

  return defaultMonths.map((month) => {
    const row = monthlyMap.get(month.key) || monthlyMap.get(month.label) || {};

    const inwardValues = {
      ...emptyValues(),
      ...(row.inwardValues || {}),
    };

    const issuanceValues = {
      ...emptyValues(),
      ...(row.issuanceValues || {}),
    };

    const inwardTotal =
      num(row.inwardTotal) ||
      categories.reduce((sum, cat) => sum + num(inwardValues[cat]), 0);

    const issuanceTotal =
      num(row.issuanceTotal) ||
      categories.reduce((sum, cat) => sum + num(issuanceValues[cat]), 0);

    return {
      key: month.key,
      label: row.label || month.label,
      inwardValues,
      issuanceValues,
      inwardTotal,
      issuanceTotal,
      gap: num(row.gap) || issuanceTotal - inwardTotal,
    };
  });
}

export default function MasterDashboard() {
  const [data, setData] = useState({
    totals: {},
    categorySummary: [],
    monthly: [],
    quickBoard: [],
    stock: [],
  });

  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setErrorText("");

    try {
      const res = await api.get("/dashboard/master");

      setData({
        totals: res.data?.totals || {},
        categorySummary: res.data?.categorySummary || [],
        monthly: res.data?.monthly || [],
        quickBoard: res.data?.quickBoard || [],
        stock: res.data?.stock || [],
      });
    } catch (error) {
      console.error("Master dashboard load failed:", error);
      setErrorText(
        error?.response?.data?.message ||
          error?.message ||
          "Dashboard load failed"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const monthlyRows = useMemo(() => normalizeMonthly(data.monthly), [data.monthly]);

  const totalFromMonthly = useMemo(() => {
    const totalInwardValue = monthlyRows.reduce(
      (sum, row) => sum + num(row.inwardTotal),
      0
    );

    const totalIssuanceValue = monthlyRows.reduce(
      (sum, row) => sum + num(row.issuanceTotal),
      0
    );

    return {
      totalInwardValue,
      totalIssuanceValue,
      issuanceGap: totalIssuanceValue - totalInwardValue,
    };
  }, [monthlyRows]);

  const totals = useMemo(() => {
    return {
      inventoryStockValue: num(data.totals?.inventoryStockValue),
      nonInventoryStockValue: num(data.totals?.nonInventoryStockValue),
      totalStockValue: num(data.totals?.totalStockValue),
      totalInwardValue:
        num(data.totals?.totalInwardValue) || totalFromMonthly.totalInwardValue,
      totalIssuanceValue:
        num(data.totals?.totalIssuanceValue) ||
        totalFromMonthly.totalIssuanceValue,
      issuanceGap:
        num(data.totals?.issuanceGap) || totalFromMonthly.issuanceGap,
    };
  }, [data.totals, totalFromMonthly]);

  const categoryRows = useMemo(() => {
    if (data.categorySummary?.length) return data.categorySummary;

    return (data.stock || []).map((row) => ({
      category: row._id,
      items: row.items,
      balance: row.balance,
      stockValue: row.value,
      inwardValue: 0,
      issuanceValue: 0,
      gap: 0,
    }));
  }, [data.categorySummary, data.stock]);

  const maxMonth = useMemo(() => {
    return Math.max(
      1,
      ...monthlyRows.map((m) =>
        Math.max(num(m.inwardTotal), num(m.issuanceTotal))
      )
    );
  }, [monthlyRows]);

  return (
    <div className="dashboard-page excel-dashboard">
      <div className="excel-title-block">
        <h1>INVENTORY &amp; NON INVENTORY DASHBOARD</h1>
        <h2>LOTTE KOLSON PVT LTD</h2>
      </div>

      {errorText && <div className="dashboard-error">{errorText}</div>}

      <div className="excel-kpi-grid">
        <div className="kpi-box">
          <span>Inventory Stock Value (PKR)</span>
          <b>{loading ? "..." : money(totals.inventoryStockValue)}</b>
        </div>

        <div className="kpi-box">
          <span>Non Inventory Stock Value (PKR)</span>
          <b>{loading ? "..." : money(totals.nonInventoryStockValue)}</b>
        </div>

        <div className="kpi-box">
          <span>Total Stock Value (PKR)</span>
          <b>{loading ? "..." : money(totals.totalStockValue)}</b>
        </div>

        <div className="kpi-box inward-kpi">
          <span>Total Inward Value (PKR)</span>
          <b>{loading ? "..." : money(totals.totalInwardValue)}</b>
        </div>

        <div className="kpi-box issuance-kpi">
          <span>Total Issuance Value (PKR)</span>
          <b>{loading ? "..." : money(totals.totalIssuanceValue)}</b>
        </div>

        <div className="kpi-box gap-kpi">
          <span>Issuance Gap (PKR)</span>
          <b>{loading ? "..." : money(totals.issuanceGap)}</b>
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
              {(data.quickBoard || []).map((row, index) => (
                <tr key={index}>
                  <td>{row.label}</td>
                  <td>
                    {typeof row.current === "number"
                      ? money(row.current)
                      : row.current}
                  </td>
                  <td>
                    <span
                      className={`signal ${String(row.signal || "")
                        .toLowerCase()
                        .replaceAll(" ", "-")}`}
                    >
                      {row.signal}
                    </span>
                  </td>
                  <td>{row.nextAction}</td>
                  <td>{row.owner}</td>
                </tr>
              ))}

              {!loading && !data.quickBoard?.length && (
                <tr>
                  <td colSpan="5">No quick board data found</td>
                </tr>
              )}
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
              {categoryRows.map((row) => (
                <tr key={row.category}>
                  <td>{row.category}</td>
                  <td>{money(row.items)}</td>
                  <td>{money(row.balance)}</td>
                  <td>{money(row.stockValue)}</td>
                  <td>{money(row.inwardValue)}</td>
                  <td>{money(row.issuanceValue)}</td>
                  <td>{money(row.gap)}</td>
                </tr>
              ))}

              {!loading && categoryRows.length === 0 && (
                <tr>
                  <td colSpan="7">No category summary found</td>
                </tr>
              )}
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
          {monthlyRows.map((month) => (
            <div className="month-card" key={month.key}>
              <h4>{month.label}</h4>

              <div className="bars">
                <div className="bar-row inward-row">
                  <span>Inward</span>
                  <div>
                    <i
                      style={{
                        width: `${Math.max(
                          4,
                          (num(month.inwardTotal) / maxMonth) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <b>{money(month.inwardTotal)}</b>
                </div>

                <div className="bar-row issuance-row">
                  <span>Issuance</span>
                  <div>
                    <i
                      style={{
                        width: `${Math.max(
                          4,
                          (num(month.issuanceTotal) / maxMonth) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <b>{money(month.issuanceTotal)}</b>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Inward</th>
                    <th>Issuance</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr key={category}>
                      <td>{category}</td>
                      <td>{money(month.inwardValues?.[category])}</td>
                      <td>{money(month.issuanceValues?.[category])}</td>
                    </tr>
                  ))}

                  <tr className="month-total-row">
                    <td>Total</td>
                    <td>{money(month.inwardTotal)}</td>
                    <td>{money(month.issuanceTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
