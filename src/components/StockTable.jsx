import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

import {
  addRow,
  updateRow,
  deleteRow
} from "../api/stockApi";

export default function StockTable({ type, data, reload }) {

  const [rows, setRows] = useState(data || []);

  // ➕ ADD ROW
  const handleAdd = async () => {
    const res = await addRow(type, {
      itemCode: "",
      itemDescription: "",
      uom: "",
      openingQty: 0,
      inwardQty: 0,
      issuedQty: 0,
      balanceQty: 0,
      unitPrice: 0,
      totalValue: 0,
      location: ""
    });

    toast.success("Row Added");
    reload();
  };

  // ✏️ CHANGE
  const handleChange = (id, key, value) => {
    setRows(prev =>
      prev.map(r =>
        r._id === id ? { ...r, [key]: value } : r
      )
    );
  };

  // 💾 SAVE (WITH FORMULA)
  const handleSave = async (row) => {

    const balance =
      Number(row.openingQty) +
      Number(row.inwardQty) -
      Number(row.issuedQty);

    const totalValue =
      balance * Number(row.unitPrice);

    await updateRow(type, row._id, {
      ...row,
      balanceQty: balance,
      totalValue
    });

    toast.success("Saved");
    reload();
  };

  // 🗑 DELETE
  const handleDelete = async (id) => {
    await deleteRow(type, id);
    toast.error("Deleted");
    reload();
  };

  // 📄 PDF
  const exportPDF = () => {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [[
        "Code","Description","UOM","Opening","Inward","Issue","Balance"
      ]],
      body: rows.map(r => [
        r.itemCode,
        r.itemDescription,
        r.uom,
        r.openingQty,
        r.inwardQty,
        r.issuedQty,
        r.balanceQty
      ])
    });

    doc.save(`${type}.pdf`);
  };

  return (
    <div>

      {/* ACTION BAR */}
      <div className="topBar">
        <button onClick={handleAdd}>➕ Add Row</button>
        <button onClick={exportPDF}>📄 Export PDF</button>
      </div>

      {/* TABLE */}
      <div className="tableBox">

        <table>

          <thead>
            <tr>
              <th>Item Code</th>
              <th>Description</th>
              <th>UOM</th>
              <th>Opening</th>
              <th>Inward</th>
              <th>Issue</th>
              <th>Balance</th>
              <th>Price</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {rows.map(row => (
              <tr key={row._id}>

                <td>
                  <input value={row.itemCode}
                    onChange={(e)=>handleChange(row._id,"itemCode",e.target.value)}
                  />
                </td>

                <td>
                  <input value={row.itemDescription}
                    onChange={(e)=>handleChange(row._id,"itemDescription",e.target.value)}
                  />
                </td>

                <td>
                  <input value={row.uom}
                    onChange={(e)=>handleChange(row._id,"uom",e.target.value)}
                  />
                </td>

                <td>
                  <input value={row.openingQty}
                    onChange={(e)=>handleChange(row._id,"openingQty",e.target.value)}
                  />
                </td>

                <td>
                  <input value={row.inwardQty}
                    onChange={(e)=>handleChange(row._id,"inwardQty",e.target.value)}
                  />
                </td>

                <td>
                  <input value={row.issuedQty}
                    onChange={(e)=>handleChange(row._id,"issuedQty",e.target.value)}
                  />
                </td>

                <td>{row.balanceQty}</td>
                <td>{row.unitPrice}</td>
                <td>{row.totalValue}</td>

                <td>
                  <button onClick={()=>handleSave(row)}>💾</button>
                  <button onClick={()=>handleDelete(row._id)}>🗑</button>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>
    </div>
  );
}