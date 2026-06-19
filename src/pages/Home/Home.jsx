import "./Home.css";

export default function Home() {
  return (
    <div className="homePage">

      {/* HEADER */}
      <div className="headerBox">
        <h1>INVENTORY & NON INVENTORY SYSTEM</h1>
        <h2>LOTTE KOLSON PVT LTD</h2>
      </div>

      {/* TOP SUMMARY BOXES */}
      <div className="summaryGrid">

        <div className="box blue">
          <h3>Inventory</h3>
          <p>0</p>
        </div>

        <div className="box green">
          <h3>Non Inventory</h3>
          <p>0</p>
        </div>

        <div className="box yellow">
          <h3>Total Stock</h3>
          <p>0</p>
        </div>

        <div className="box red">
          <h3>Issuance</h3>
          <p>0</p>
        </div>

      </div>

      {/* MACHINE TABLE */}
      <div className="tableBox">

        <h3>Machine System</h3>

        <table>
          <thead>
            <tr>
              <th>Machine</th>
              <th>Stock</th>
              <th>Issued</th>
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
              <td>Active</td>
            </tr>

          </tbody>
        </table>

      </div>

    </div>
  );
}