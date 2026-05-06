import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import About from "./pages/About";
import Chat from "./pages/Chat";
import Guide from "./pages/Guide";
import Landing from "./pages/Landing";
import Rescuer from "./pages/Rescuer";
import KnowARescuer from "./pages/KnowARescuer";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPendingRescuers from "./pages/AdminPendingRescuers";
import AdminVerifiedRescuers from "./pages/AdminVerifiedRescuers";
import AdminAddRescuer from "./pages/AdminAddRescuer";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/rescuer" element={<Rescuer />} />
          <Route path="/find-rescuer" element={<Rescuer />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/about" element={<About />} />
          <Route path="/know-a-rescuer" element={<KnowARescuer />} />
        </Route>

        {/* Admin Routes - Login (public) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Routes - Protected */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/pending-rescuers"
          element={
            <ProtectedAdminRoute>
              <AdminPendingRescuers />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/verified-rescuers"
          element={
            <ProtectedAdminRoute>
              <AdminVerifiedRescuers />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/add-rescuer"
          element={
            <ProtectedAdminRoute>
              <AdminAddRescuer />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}
