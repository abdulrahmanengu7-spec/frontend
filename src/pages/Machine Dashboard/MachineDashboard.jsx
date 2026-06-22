import { useMemo, useState } from "react";
import "./MachineDashboard.css";

const months = [
  { key: "may2026", label: "May-2026", color: "#dc2626" },
  { key: "jun2026", label: "Jun-2026", color: "#2563eb" },
  { key: "jul2026", label: "Jul-2026", color: "#f59e0b" },
];

const emptyMonth = {
  inventory: 0,
  nonInventory: 0,
  services: 0,
  pattyCash: 0,
};

const initialRows = [
  {
    machineName: "Sama No: 11",
    may2026: { inventory: 0, nonInventory: 0, services: 0, pattyCash: 0 },
    jun2026: { inventory: 0, nonInventory: 0, services: 0, pattyCash: 0 },
    jul2026: { inventory: 0, nonInventory: 0, services: 0, pattyCash: 0 },
  },
  {
    machineName: "Taping Machine No: 02",
    may2026: { inventory: 13200, nonInventory: 2000, services: 0, pattyCash: 0 },
    jun2026: { inventory: 3750, nonInventory: 512, services: 0, pattyCash: 0 },
    jul2026: { inventory: 0, nonInventory: 0, services: 0, pattyCash: 0 },
  },
  {
    machineName: "Ishida No: 12",
    may2026: { inventory: 15650, nonInventory: 1650, services: 0, pattyCash: 0 },
    jun2026: { inventory: 470, nonInventory: 512, services: 0, pattyCash: 0 },
    jul2026: { inventory: 0, nonInventory: 0, services: 0, pattyCash: 0 },
  },
  {
    machineName: "Ishida No: 05",
    may2026: { inventory: 10000, nonInventory: 1456, services: 0, pattyCash: 0 },
    jun2026: { inventory: 4900, nonInventory: 512, services: 0, pattyCash: 0 },
    jul2026: { inventory: 0, nonInventory: 0, services: 0, pattyCash: 0 },
  },
  {
    machineName: "Ishida No: 06",
    may2026: { inventory: 0, nonInventory: 1100, services: 0, pattyCash: 1020 },
    jun2026: { inventory: 0, nonInventory: 12500, services: 0, pattyCash: 0 },
    jul2026: { inventory: 0, nonInventory: 0, services: 0, pattyCash: 0 },
  },
  {
    machineName: "Seasoning Pin Mall",
    may2026: { inventory: 7966, nonInventory: 595, services: 0, pattyCash: 0 },
    jun2026: { inventory: 5500, nonInventory: 256, services: 0, pattyCash: 0 },
    jul2026: { inventory: 0, nonInventory: 0, services: 0, pattyCash: 0 },
  },
  {
    machineName: "Korea No: 03",
    may2026: { inventory: 12425, nonInventory: 0, services: 0, pattyCash: 0 },
    jun2026: { inventory: 0, nonInventory: 0, services: 0, pattyCash: 0 },
    jul2026: { inventory: 0, nonInventory: 0, services: 0, pattyCash: 0 },
  },
  {
    machineName: "Air Compressor No: 01 (New)",
    may2026: { inventory: 1375, nonInventory: 9465, services: 0, pattyCash: 0 },
    jun2026: { inventory: 0, nonInventory: 900, services: 0, pattyCash: 0 },
    jul2026: { inventory: 0, nonInventory: 0, services: 0, pattyCash: 0 },
  },
  {
    machineName: "Korea No: 02",
    may2026: { inventory: 0, nonInventory: 280, services: 0, pattyCash: 0 },
    jun2026: { inventory: 10000, nonInventory: 256, services: 0, pattyCash: 0 },
    jul2026: { inventory: 0, nonInventory: 0, services: 0, pattyCash: 0 },
  },
  {
    machineName: "Air Compressor No: 02 (Old)",
    may2026: { inventory: 0, nonInventory: 9725, services: 0, pattyCash: 0 },
    jun2026: { inventory: 0, nonInventory: 0, services: 0, pattyCash: 0 },
    jul2026: { inventory: 0, nonInventory: 0, services: 0, pattyCash: 0 },
  },
  {
    machineName: "Fuel Charges",
    may2026: { inventory: 0, nonInventory: 0, services: 0, pattyCash: 8029 },
    jun2026: { inventory: 0, nonInventory: 0, services: 0, pattyCash: 1450 },
    jul2026: { inventory: 0, nonInventory: 0, services: 0, pattyCash: 0 },
  },
];

const money = (value) =>
  Number(value || 0).toLocaleString("en-PK", {
    maximumFractionDigits: 0,
  });

const monthTotal = (data = emptyMonth) =>
  Number(data.inventory || 0) +
  Number(data.nonInventory || 0) +
  Number(data.services || 0) +
  Number(data.pattyCash || 0);

export default function MachineDashboard() {
  const [rows] = useState(initialRows);

  const summary = useMemo(() => {
    const totalMachines = rows.filter((row) => row.machineName !== "Fuel Charges").length;

    const grandTotal = rows.reduce((sum, row) => {
      return (
        sum +
        months.reduce((mSum, month) => mSum + monthTotal(row[month.key]), 0)
      );
    }, 0);

    const activeMachines = rows.filter((row) =>
      months.some((month) => monthTotal(row[month.key]) > 0)
    ).length;

    return { totalMachines, activeMachines, grandTotal };
  }, [rows]);

  const monthlyTotals = useMemo(() => {
    return months.map((month) => ({
      ...month,
      total: rows.reduce((sum, row) => sum + monthTotal(row[month.key]), 0),
    }));
  }, [rows]);

  const maxTotal = Math.max(...monthlyTotals.map((item) => item.total), 1);

  return (
    <div className="machinePage">
      <div className="machineHeader">
        <h1>Machine Dashboard</h1>
        <h2>LOTTE KOLSON PVT LTD</h2>
      </div>

      <div className="machineGrid">
        <div className="machineBox blue">
          <h3>Total Machines</h3>
          <p>{summary.totalMachines}</p>
        </div>

        <div className="machineBox green">
          <h3>Active Machines</h3>
          <p>{summary.activeMachines}</p>
        </div>

        <div className="machineBox red">
          <h3>Grand Total Price</h3>
          <p>{money(summary.grandTotal)}</p>
        </div>
      </div>

      <div className="machineTableBox">
        <table className="machineTable">
          <thead>
            <tr>
              <th className="stickyMachineCol mainMachineHead" rowSpan="2">
                Machine Name
              </th>

              {months.map((month) => (
                <th
                  key={month.key}
                  className="monthHeader"
                  colSpan="5"
                  style={{ background: month.color }}
                >
                  {month.label}
                </th>
              ))}
            </tr>

            <tr>
              {months.map((month) => (
                <ReactMonthHeaders key={month.key} monthKey={month.key} />
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.machineName}>
                <td className="stickyMachineCol machineNameCell">
                  {row.machineName}
                </td>

                {months.map((month) => {
                  const data = row[month.key] || emptyMonth;
                  const total = monthTotal(data);

                  return (
                    <ReactMonthCells
                      key={`${row.machineName}-${month.key}`}
                      rowKey={`${row.machineName}-${month.key}`}
                      data={data}
                      total={total}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="machineChartBox">
        <div className="chartTitle">
          <h3>Issuance Price Graph</h3>
          <span>X-Axis: Month | Y-Axis: Price</span>
        </div>

        <div className="chartArea">
          <div className="yAxisText">Price</div>

          <div className="chartGrid">
            {monthlyTotals.map((month) => {
              const height = Math.max((month.total / maxTotal) * 260, month.total > 0 ? 18 : 4);

              return (
                <div className="barGroup" key={month.key}>
                  <div className="barValue">{money(month.total)}</div>

                  <div className="barTrack">
                    <div
                      className="barFill"
                      style={{
                        height: `${height}px`,
                        background: month.color,
                      }}
                    />
                  </div>

                  <div className="barMonth">{month.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="xAxisText">Month</div>
      </div>
    </div>
  );
}

function ReactMonthHeaders({ monthKey }) {
  return (
    <>
      <th className="subHeader" key={`${monthKey}-inv`}>
        Inventory
      </th>
      <th className="subHeader" key={`${monthKey}-non`}>
        Non Inventory
      </th>
      <th className="subHeader" key={`${monthKey}-ser`}>
        Services
      </th>
      <th className="subHeader" key={`${monthKey}-patty`}>
        Patty Cash
      </th>
      <th className="subHeader totalSubHeader" key={`${monthKey}-total`}>
        Month Total
      </th>
    </>
  );
}

function ReactMonthCells({ rowKey, data, total }) {
  return (
    <>
      <td key={`${rowKey}-inv`}>{money(data.inventory)}</td>
      <td key={`${rowKey}-non`}>{money(data.nonInventory)}</td>
      <td key={`${rowKey}-ser`}>{money(data.services)}</td>
      <td key={`${rowKey}-patty`}>{money(data.pattyCash)}</td>
      <td key={`${rowKey}-total`} className="monthTotalCell">
        {money(total)}
      </td>
    </>
  );
}
