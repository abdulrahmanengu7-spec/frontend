import { useAuth } from "../../context/AuthContext";
import "./AdminPanel.css";

export default function AdminPanel({ go }) {

  const { users, changeRole, deleteUser, user } = useAuth();

  return (
    <div className="admin-page">

      <div className="admin-card">

        {/* BACK BUTTON */}
        <button className="back-btn" onClick={() => go("home")}>
          ← Back
        </button>

        <h1>Admin Pannel</h1>

        <p className="admin-user">
          Logged in as: <b>{user?.role}</b>
        </p>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users?.map((u, i) => (
              <tr key={i}>

                <td>{u.name || "-"}</td>
                <td>{u.email}</td>
                <td>{u.phone || "-"}</td>

                {/* ROLE CHANGE */}
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.email, e.target.value)}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                    <option value="superadmin">superadmin</option>
                  </select>
                </td>

                {/* DELETE BUTTON (ONLY SUPER ADMIN) */}
                <td>
                  {user?.role === "superadmin" && (
                    <button
                      className="delete-btn"
                      onClick={() => deleteUser(u.email)}
                    >
                      Delete
                    </button>
                  )}
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}