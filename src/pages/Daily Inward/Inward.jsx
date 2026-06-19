import { useState } from "react";
import "./Inward.css";

export default function Inward() {

  const [rows, setRows] = useState([]);

  const add = () => {
    setRows([
      ...rows,
      { id: Date.now(), code:"", desc:"", qty:0 }
    ]);
  };

  return (
    <div className="page">

      <button onClick={add}>➕ Add Inward</button>

      <table>
        <thead>
          <tr>
            <th>Item Code</th>
            <th>Description</th>
            <th>Qty Received</th>
          </tr>
        </thead>

        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td><input /></td>
              <td><input /></td>
              <td><input /></td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}