import { Fragment, useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import "./MachineDashboard.css";

const TX_ENDPOINTS = [
  "/tx/issuance?limit=10000",
  "/transactions/issuance?limit=10000",
  "/transaction/issuance?limit=10000",
];

const LIST_ENDPOINTS = [
  "/lists",
  "/list",
  "/lookups",
  "/settings/lists",
];

const emptyMonth = {
  inventory: 0,
  nonInventory: 0,
  services: 0,
  pattyCash: 0,
};

const defaultMonths = [
  { key: "2026-05", label: "May-2026", color: "#dc2626", order: 202605 },
  { key: "2026-06", label: "Jun-2026", color: "#2563eb", order: 202606 },
  { key: "2026-07", label: "Jul-2026", color: "#f59e0b", order: 202607 },
];

const chartColors = [
  "#dc2626",
  "#2563eb",
  "#f59e0b",
  "#16a34a",
  "#7c3aed",
  "#0891b2",
  "#ea580c",
  "#be123c",
  "#0f766e",
  "#4338ca",
  "#65a30d",
  "#9333ea",
];

function cleanText(value) {
  return String(value ?? "").trim();
}

function norm(value) {
  return cleanText(value).toLowerCase().replace(/\s+/g, " ");
}

function number(value) {
  const n = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function money(value) {
  return Number(value || 0).toLocaleString("en-PK", {
    maximumFractionDigits: 0,
  });
}

function getArray(payload) {
  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.transactions)) return payload.transactions;
  if (Array.isArray(payload?.result)) return payload.result;

  if (Array.isArray(payload?.data?.rows)) return payload.data.rows;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.transactions)) return payload.data.transactions;
  if (Array.isArray(payload?.data?.result)) return payload.data.result;

  return [];
}

async function loadFirstArray(endpoints) {
  for (const endpoint of endpoints) {
    try {
      const res = await api.get(endpoint);
      const rows = getArray(res.data);

      if (rows.length) return rows;
    } catch {
      // next endpoint try karo
    }
  }

  return [];
}

function getIssueDate(row) {
  return (
    row.issueDate ||
    row.issuanceDate ||
    row.date ||
    row.deliveryDate ||
    row.createdAt ||
    row.updatedAt
  );
}

function getMonthInfo(dateValue, index = 0) {
  const d = new Date(dateValue);

  if (Number.isNaN(d.getTime())) return null;

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const key = `${year}-${String(month).padStart(2, "0")}`;

  const label = d
    .toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    })
    .replace(" ", "-");

  return {
    key,
    label,
    order: Number(`${year}${String(month).padStart(2, "0")}`),
    color: chartColors[index % chartColors.length],
  };
}

function getCategoryKey(category) {
  const c = norm(category);

  if (c.includes("non")) return "nonInventory";
  if (c.includes("service")) return "services";
  if (c.includes("patty") || c.includes("petty") || c.includes("cash")) return "pattyCash";

  return "inventory";
}

function getRowTotal(row) {
  const directTotal =
    row.total ??
    row.totalValue ??
    row.amount ??
    row.priceTotal ??
    row.issueTotal ??
    row.value;

  const direct = number(directTotal);
  if (direct) return direct;

  const qty = number(row.qtyIssued ?? row.issueQty ?? row.qty ?? row.quantity);
  const price = number(row.unitPrice ?? row.price ?? row.rate);

  return qty * price;
}

function getRawMachine(row) {
  return (
    row.equipmentName ||
    row.equipment ||
    row.machineName ||
    row.machine ||
    row.machineNo ||
    row.machineNumber ||
    row.machineId ||
    row.equipmentId ||
    row.issuedMachine ||
    row.issuedToMachine ||
    row.sectionMachine ||
    ""
  );
}

function isMachineGroup(groupName) {
  const g = norm(groupName);
  return (
    g.includes("machine") ||
    g.includes("equipment") ||
    g.includes("equip") ||
    g.includes("machine name") ||
    g.includes("equipment name")
  );
}

function addMap(map, key, label) {
  const k = cleanText(key);
  const l = cleanText(label);

  if (!k || !l) return;

  map[k] = l;
  map[norm(k)] = l;
}

function getLabelFromObject(item) {
  return (
    item.label ||
    item.name ||
    item.title ||
    item.value ||
    item.text ||
    item.machineName ||
    item.equipmentName ||
    item.equipment ||
    item.machine ||
    ""
  );
}

function buildEquipmentMap(payload) {
  const map = {};

  function readArray(arr, groupName = "") {
    if (!Array.isArray(arr)) return;

    const machineGroup = isMachineGroup(groupName);

    arr.forEach((item, index) => {
      if (typeof item === "string" || typeof item === "number") {
        if (machineGroup) {
          addMap(map, index + 1, item);
          addMap(map, index, item);
          addMap(map, item, item);
        }

        return;
      }

      if (!item || typeof item !== "object") return;

      const itemGroup =
        item.group ||
        item.type ||
        item.category ||
        item.listName ||
        item.listType ||
        item.title ||
        groupName;

      const label = getLabelFromObject(item);
      const shouldMap =
        machineGroup ||
        isMachineGroup(itemGroup) ||
        item.machineName ||
        item.equipmentName ||
        item.machine ||
        item.equipment;

      if (shouldMap && label) {
        addMap(map, item._id, label);
        addMap(map, item.id, label);
        addMap(map, item.key, label);
        addMap(map, item.code, label);
        addMap(map, item.value, label);
        addMap(map, item.no, label);
        addMap(map, item.number, label);
        addMap(map, item.srNo, label);
        addMap(map, item.machineId, label);
        addMap(map, item.equipmentId, label);
        addMap(map, index + 1, label);
        addMap(map, label, label);
      }

      readArray(item.items, itemGroup);
      readArray(item.values, itemGroup);
      readArray(item.options, itemGroup);
      readArray(item.list, itemGroup);
      readArray(item.children, itemGroup);
    });
  }

  function walk(node, groupName = "") {
    if (Array.isArray(node)) {
      readArray(node, groupName);
      node.forEach((child) => walk(child, groupName));
      return;
    }

    if (!node || typeof node !== "object") return;

    const nextGroup =
      node.group ||
      node.type ||
      node.category ||
      node.listName ||
      node.listType ||
      node.title ||
      node.name ||
      groupName;

    readArray(node.items, nextGroup);
    readArray(node.values, nextGroup);
    readArray(node.options, nextGroup);
    readArray(node.rows, nextGroup);
    readArray(node.data, nextGroup);

    Object.values(node).forEach((value) => {
      if (value && typeof value === "object") walk(value, nextGroup);
    });
  }

  walk(payload);

  return map;
}

function resolveMachineName(rawValue, equipmentMap) {
  const raw = cleanText(rawValue);

  if (!raw) return "Without Equipment Name";

  const direct = equipmentMap[raw] || equipmentMap[norm(raw)];
  if (direct) return direct;

  if (/^\d+$/.test(raw)) {
    return `Equipment ID ${raw}`;
  }

  return raw;
}

function getMonthTotal(data = emptyMonth) {
  return (
    number(data.inventory) +
    number(data.nonInventory) +
    number(data.services) +
    number(data.pattyCash)
  );
}

export default function MachineDashboard() {
  const [issueRows, setIssueRows] = useState([]);
  const [equipmentMap, setEquipmentMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadDashboard() {
      setLoading(true);
      setErrorText("");

      try {
        const [issuanceData, listData] = await Promise.all([
          loadFirstArray(TX_ENDPOINTS),
          loadFirstArray(LIST_ENDPOINTS),
        ]);

        if (!alive) return;

        setIssueRows(issuanceData);
        setEquipmentMap(buildEquipmentMap(listData));
      } catch (error) {
        if (!alive) return;
        setErrorText(error?.message || "Machine dashboard data load failed");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      alive = false;
    };
  }, []);

  const monthDefs = useMemo(() => {
    const found = new Map();

    issueRows.forEach((row) => {
      const month = getMonthInfo(getIssueDate(row), found.size);
      if (!month) return;

      if (!found.has(month.key)) {
        found.set(month.key, {
          ...month,
          color: chartColors[found.size % chartColors.length],
        });
      }
    });

    const result = [...found.values()].sort((a, b) => a.order - b.order);

    return result.length ? result : defaultMonths;
  }, [issueRows]);

  const rows = useMemo(() => {
    const machineMap = new Map();

    issueRows.forEach((item) => {
      const month = getMonthInfo(getIssueDate(item));
      if (!month) return;

      const rawMachine = getRawMachine(item);
      const machineName = resolveMachineName(rawMachine, equipmentMap);
      const machineKey = norm(machineName);
      const categoryKey = getCategoryKey(item.category);
      const total = getRowTotal(item);

      if (!machineMap.has(machineKey)) {
        const monthsObj = {};

        monthDefs.forEach((m) => {
          monthsObj[m.key] = { ...emptyMonth };
        });

        machineMap.set(machineKey, {
          machineName,
          months: monthsObj,
          hasUnmappedId: /^Equipment ID \d+$/.test(machineName),
        });
      }

      const row = machineMap.get(machineKey);

      if (!row.months[month.key]) {
        row.months[month.key] = { ...emptyMonth };
      }

      row.months[month.key][categoryKey] += total;
    });

    return [...machineMap.values()].sort((a, b) =>
      a.machineName.localeCompare(b.machineName)
    );
  }, [issueRows, equipmentMap, monthDefs]);

  const monthlyTotals = useMemo(() => {
    return monthDefs.map((month, index) => ({
      ...month,
      color: month.color || chartColors[index % chartColors.length],
      total: rows.reduce((sum, row) => sum + getMonthTotal(row.months[month.key]), 0),
    }));
  }, [rows, monthDefs]);

  const summary = useMemo(() => {
    const grandTotal = monthlyTotals.reduce((sum, month) => sum + month.total, 0);
    const activeMachines = rows.filter((row) =>
      monthDefs.some((month) => getMonthTotal(row.months[month.key]) > 0)
    ).length;

    return {
      totalMachines: rows.length,
      activeMachines,
      grandTotal,
    };
  }, [rows, monthlyTotals, monthDefs]);

  const maxTotal = Math.max(...monthlyTotals.map((item) => item.total), 1);
  const unresolvedCount = rows.filter((row) => row.hasUnmappedId).length;

  return (
    <div className="machinePage">
      <div className="machineHeader">
        <h1>Machine Dashboard</h1>
        <h2>LOTTE KOLSON PVT LTD</h2>
      </div>

      <div className="machineGrid">
        <div className="machineBox blue">
          <h3>Total Equipment</h3>
          <p>{loading ? "..." : summary.totalMachines}</p>
        </div>

        <div className="machineBox green">
          <h3>Active Equipment</h3>
          <p>{loading ? "..." : summary.activeMachines}</p>
        </div>

        <div className="machineBox red">
          <h3>Issuance Total Price</h3>
          <p>{loading ? "..." : money(summary.grandTotal)}</p>
        </div>
      </div>

      {errorText && <div className="machineAlert error">{errorText}</div>}

      {unresolvedCount > 0 && (
        <div className="machineAlert warn">
          {unresolvedCount} equipment IDs list se name me convert nahi huay. Lists API me
          Equipment/Machine Name mapping check karo.
        </div>
      )}

      <div className="machineTableBox">
        <table className="machineTable">
          <thead>
            <tr>
              <th className="stickyMachineCol mainMachineHead" rowSpan="2">
                Equipment / Machine Name
              </th>

              {monthDefs.map((month) => (
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
              {monthDefs.map((month) => (
                <Fragment key={month.key}>
                  <th className="subHeader">Inventory</th>
                  <th className="subHeader">Non Inventory</th>
                  <th className="subHeader">Services</th>
                  <th className="subHeader">Patty Cash</th>
                  <th className="subHeader totalSubHeader">Month Total</th>
                </Fragment>
              ))}
            </tr>
          </thead>

          <tbody>
            {!loading && rows.length === 0 && (
              <tr>
                <td className="emptyCell" colSpan={1 + monthDefs.length * 5}>
                  No issuance data found
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td className="emptyCell" colSpan={1 + monthDefs.length * 5}>
                  Loading machine dashboard...
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((row) => (
                <tr key={row.machineName}>
                  <td className="stickyMachineCol machineNameCell">
                    {row.machineName}
                  </td>

                  {monthDefs.map((month) => {
                    const data = row.months[month.key] || emptyMonth;
                    const total = getMonthTotal(data);

                    return (
                      <Fragment key={`${row.machineName}-${month.key}`}>
                        <td>{money(data.inventory)}</td>
                        <td>{money(data.nonInventory)}</td>
                        <td>{money(data.services)}</td>
                        <td>{money(data.pattyCash)}</td>
                        <td className="monthTotalCell">{money(total)}</td>
                      </Fragment>
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
              const height = Math.max(
                (month.total / maxTotal) * 260,
                month.total > 0 ? 18 : 4
              );

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
