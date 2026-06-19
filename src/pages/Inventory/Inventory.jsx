import { useEffect, useState } from "react";
import "./Inventory.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  getInventory,
  addInventory,
  updateInventory,
  deleteInventory
} from "../../api/inventoryApi";

export default function Inventory() {

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");

  // ================= LOAD =================
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getInventory();
      setRows(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= ADD ROW =================
  const addRow = async () => {
    try {
      await addInventory({
        itemCode: "",
        itemDescription: "",
        uom: "",
        opening: 0,
        inward: 0,
        issue: 0,
        price: 0,
        location: ""
      });

      loadData();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= UPDATE FIELD =================
  const update = (id, key, value) => {
    setRows(prev =>
      prev.map(r =>
        r._id === id ? { ...r, [key]: value } : r
      )
    );
  };

  // ================= SAVE (FORMULA ENGINE FIXED) =================
  const saveRow = async (row) => {

    const inward = Number(row.inward || 0);
    const issue = Number(row.issue || 0);
    const price = Number(row.price || 0);

    const balance = inward - issue;
    const total = balance * price;

    await updateInventory(row._id, {
      ...row,
      balance,
      total
    });

    loadData();
  };

  // ================= DELETE =================
  const delRow = async (id) => {
    await deleteInventory(id);
    loadData();
  };

  // ================= SEARCH FIX =================
  const filtered = rows.filter(r => {
    const s = search.toLowerCase();

    return (
      (r.itemCode || "").toLowerCase().includes(s) ||
      (r.itemDescription || "").toLowerCase().includes(s) ||
      (r.uom || "").toLowerCase().includes(s) ||
      (r.location || "").toLowerCase().includes(s)
    );
  });

  // ================= PDF EXPORT FIX =================
  const exportPDF = () => {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [[
        "SR",
        "Item Code",
        "Description",
        "UOM",
        "Opening",
        "Inward",
        "Issue",
        "Balance",
        "Price",
        "Total",
        "Location"
      ]],

      body: filtered.map((r, i) => [
        i + 1,
        r.itemCode,
        r.itemDescription,
        r.uom,
        r.opening,
        r.inward,
        r.issue,
        r.balance,
        r.price,
        r.total,
        r.location
      ])
    });

    doc.save("inventory.pdf");
  };

  return (
    <div className="invPage">

      {/* TOP BAR (CENTER FIXED) */}
      <div className="topBar">

        <input
          placeholder="Search Item Code / Description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button className="addBtn" onClick={addRow}>
          ➕ Add Row
        </button>

        <button className="pdfBtn" onClick={exportPDF}>
          📄 Export PDF
        </button>

      </div>

      {/* TABLE */}
      <div className="tableBox">

        <table>

          <thead>
            <tr>
              <th>Sr No</th>
              <th>Item Code</th>
              <th>Description</th>
              <th>UOM</th>
              <th>Opening</th>
              <th>Inward</th>
              <th>Issue</th>
              <th>Balance</th>
              <th>Price</th>
              <th>Total</th>
              <th>Location</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filtered.map((r, i) => (
              <tr key={r._id}>

                {/* SR */}
                <td>{i + 1}</td>

                {/* ITEM CODE (FIXED SHOW ISSUE) */}
                <td>
                  <input
                    value={r.itemCode || ""}
                    onChange={(e) => update(r._id, "itemCode", e.target.value)}
                  />
                </td>

                <td>
                  <input
                    value={r.itemDescription || ""}
                    onChange={(e) => update(r._id, "itemDescription", e.target.value)}
                  />
                </td>

                <td>
                  <input
                    value={r.uom || ""}
                    onChange={(e) => update(r._id, "uom", e.target.value)}
                  />
                </td>

                <td>{r.opening}</td>

                <td>
                  <input
                    value={r.inward || 0}
                    onChange={(e) => update(r._id, "inward", e.target.value)}
                  />
                </td>

                <td>
                  <input
                    value={r.issue || 0}
                    onChange={(e) => update(r._id, "issue", e.target.value)}
                  />
                </td>

                <td>{r.balance}</td>

                <td>
                  <input
                    value={r.price || 0}
                    onChange={(e) => update(r._id, "price", e.target.value)}
                  />
                </td>

                <td>{r.total}</td>

                <td>
                  <input
                    value={r.location || ""}
                    onChange={(e) => update(r._id, "location", e.target.value)}
                  />
                </td>

                {/* ACTION FIX */}
                <td>
                  <button onClick={() => saveRow(r)}>
                    💾 Save
                  </button>

                  <button onClick={() => delRow(r._id)}>
                    🗑
                  </button>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}