import { useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import "./AdminPanel.css";

const roles = ["user", "admin", "superadmin"];

export default function AdminPanel({ go }) {
  const { users = [], changeRole, deleteUser, user } = useAuth();
  const [search, setSearch] = useState("");

  const currentRole = String(user?.role || "").toLowerCase();
  const isSuperAdmin = currentRole === "superadmin";

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return users;

    return users.filter((u) => {
      return JSON.stringify(u).toLowerCase().includes(q);
    });
  }, [users, search]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      superadmin: users.filter((u) => u.role === "superadmin").length,
      admin: users.filter((u) => u.role === "admin").length,
      user: users.filter((u) => u.role === "user").length,
    };
  }, [users]);

  const handleBack = () => {
    if (typeof go === "function") {
      go("home");
      return;
    }

    window.history.back();
  };

  const handleDelete = (email) => {
    if (!isSuperAdmin) return;

    if (!confirm("Delete this user?")) return;

    deleteUser(email);
  };

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <div className="admin-hero-left">
          <button className="admin-back-btn" type="button" onClick={handleBack}>
            <FiArrowLeft />
            <span>Back</span>
          </button>

          <div>
            <p className="admin-eyebrow">User Management</p>
            <h1>Admin Panel</h1>
            <p className="admin-subtitle">
              Manage users, roles and system access professionally.
            </p>
          </div>
        </div>

        <div className="admin-login-card">
          <div className="admin-login-icon">
            <FiShield />
          </div>

          <div>
            <span>Logged in as</span>
            <b>{user?.role || "Unknown"}</b>
          </div>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span>Total Users</span>
          <b>{stats.total}</b>
        </div>

        <div className="admin-stat-card">
          <span>Super Admin</span>
          <b>{stats.superadmin}</b>
        </div>

        <div className="admin-stat-card">
          <span>Admin</span>
          <b>{stats.admin}</b>
        </div>

        <div className="admin-stat-card">
          <span>Users</span>
          <b>{stats.user}</b>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-head">
          <div>
            <h2>User List</h2>
            <p>Update roles and remove users from one clean panel.</p>
          </div>

          <div className="admin-search-box">
            <FiSearch />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
            />
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
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
              {filteredUsers.map((u, i) => {
                const userRole = u.role || "user";
                const isProtected =
                  u.protected ||
                  u.isProtected ||
                  String(u.email || "").toLowerCase() ===
                    String(user?.email || "").toLowerCase();

                return (
                  <tr key={u.email || i}>
                    <td>
                      <div className="admin-user-cell">
                        <span className="admin-avatar">
                          <FiUser />
                        </span>

                        <div>
                          <b>{u.name || "-"}</b>
                          {isProtected && (
                            <small className="protected-text">protected</small>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="admin-info-cell">
                        <FiMail />
                        <span>{u.email || "-"}</span>
                      </div>
                    </td>

                    <td>
                      <div className="admin-info-cell">
                        <FiPhone />
                        <span>{u.phone || "-"}</span>
                      </div>
                    </td>

                    <td>
                      <div className="role-control">
                        <span className={`role-badge role-${userRole}`}>
                          {userRole}
                        </span>

                        <select
                          value={userRole}
                          disabled={!isSuperAdmin || isProtected}
                          onChange={(e) => changeRole(u.email, e.target.value)}
                        >
                          {roles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td>
                      {isSuperAdmin ? (
                        <button
                          className="admin-delete-btn"
                          type="button"
                          disabled={isProtected}
                          onClick={() => handleDelete(u.email)}
                        >
                          <FiTrash2 />
                          <span>Delete</span>
                        </button>
                      ) : (
                        <span className="no-access">No access</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5">
                    <div className="admin-empty">
                      <FiUsers />
                      <b>No users found</b>
                      <span>Try another search keyword.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
                          }
