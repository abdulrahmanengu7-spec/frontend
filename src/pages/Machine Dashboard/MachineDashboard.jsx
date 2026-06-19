import "./MachineDashboard.css";

export default function MachineDashboard() {
  return (
    <div className="machinePage">

      {/* HEADER */}
      <div className="machineHeader">
        <h1>Machine Dashboard</h1>
        <h2>LOTTE KOLSON PVT LTD</h2>
      </div>

      {/* SUMMARY */}
      <div className="machineGrid">

        <div className="box blue">
          <h3>Total Machines</h3>
          <p>0</p>
        </div>

        <div className="box green">
          <h3>Active Machines</h3>
          <p>0</p>
        </div>

        <div className="box red">
          <h3>Maintenance</h3>
          <p>0</p>
        </div>

      </div>

      {/* TABLE */}
      <div className="tableBox">

        <table>
          <thead>
            <tr>
              <th>Machine Name</th>
              <th>Stock Used</th>
              <th>Issuance</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>M-01</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>Active</td>
            </tr>

            <tr>
              <td>M-02</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>Maintenance</td>
            </tr>

          </tbody>
        </table>

      </div>

    </div>
  );
}