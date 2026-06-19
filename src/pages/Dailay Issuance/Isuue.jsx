import { useState } from "react";
import "./Issue.css";

export default function Issue() {

  const [rows, setRows] = useState([]);

  const add = () => {
    setRows([...rows, { id:Date.now(), code:"", qty:0 }]);
  };

  return (
    <div className="page">

      <button onClick={add}>➕ Add Issue</button>

      <table>
        <thead>
          <tr>
            <th>Item Code</th>
            <th>Qty Issue</th>
          </tr>
        </thead>

        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td><input /></td>
              <td><input /></td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}