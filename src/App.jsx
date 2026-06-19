import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ERPLayout from "./components/Layout/ERPLayout";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import MasterDashboard from "./pages/Dashboard/MasterDashboard";
import MachineDashboard from "./pages/Dashboard/MachineDashboard";
import StockPage from "./pages/Stock/StockPage";
import TransactionPage from "./pages/Transactions/TransactionPage";
import ListsPage from "./pages/Lists/ListsPage";
import AdminPanel from "./pages/Admin/AdminPanel";
import GenericExcelPage from "./pages/SectionPages/GenericExcelPage";
import FuelDashboard from "./pages/SectionPages/FuelDashboard";
import { sectionPages } from "./pages/SectionPages/sectionDefinitions";

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}


function AdminOrSuper({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!["admin", "superadmin"].includes(user.role)) {
    return <div className="access-denied">Access Denied — This section is hidden for user role</div>;
  }
  return children;
}

function DefaultHome() {
  const { user } = useAuth();
  return <Navigate to={user?.role === "user" ? "/inventory" : "/master-dashboard"} replace />;
}

function SuperOnly({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "superadmin") {
    return <div className="access-denied">Access Denied — Super Admin Only</div>;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/" element={<Protected><ERPLayout /></Protected>}>
        <Route index element={<DefaultHome />} />
        <Route path="master-dashboard" element={<AdminOrSuper><MasterDashboard /></AdminOrSuper>} />
        <Route path="machine-dashboard" element={<AdminOrSuper><MachineDashboard /></AdminOrSuper>} />
        <Route path="inventory" element={<StockPage category="Inventory" apiCategory="inventory" title="Inventory" />} />
        <Route path="non-inventory" element={<StockPage category="Non Inventory" apiCategory="noninventory" title="Non Inventory" />} />
        <Route path="services" element={<StockPage category="Services" apiCategory="services" title="Services" />} />
        <Route path="patty-cash" element={<StockPage category="Patty Cash" apiCategory="pattycash" title="Patty Cash" />} />
        <Route path="daily-inward" element={<TransactionPage type="inward" title="Daily Inward" />} />
        <Route path="daily-issuance" element={<TransactionPage type="issuance" title="Daily Issuance" />} />
        <Route path="lists" element={<AdminOrSuper><ListsPage /></AdminOrSuper>} />
        <Route path="admin" element={<SuperOnly><AdminPanel /></SuperOnly>} />
        <Route path="outward-gate-pass-records" element={<GenericExcelPage config={sectionPages.outwardGatePass} />} />
        <Route path="iutn-outward-record" element={<GenericExcelPage config={sectionPages.iutnOutward} />} />
        <Route path="fuel-executive-dashboard" element={<AdminOrSuper><FuelDashboard /></AdminOrSuper>} />
        <Route path="monthly-travel-entries" element={<AdminOrSuper><GenericExcelPage config={sectionPages.monthlyTravel} /></AdminOrSuper>} />
        <Route path="tools-issuance" element={<GenericExcelPage config={sectionPages.toolsIssuance} />} />
      </Route>
    </Routes>
  );
}
