import { Link, useLocation, useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const navItems = [
  { label: "Overview", path: "/admin/dashboard" },
  { label: "Pending review", path: "/admin/pending-rescuers" },
  { label: "Verified network", path: "/admin/verified-rescuers" },
  { label: "Add rescuer", path: "/admin/add-rescuer" },
];

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const admin = authService.getAdmin();

  const handleLogout = () => {
    authService.logout();
    navigate("/admin/login");
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close admin navigation"
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <Link to="/admin/dashboard" className="block">
            <p className="text-lg font-semibold text-slate-950">RescueLink</p>
            <p className="mt-1 text-sm text-slate-500">Moderation console</p>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-green-50 text-green-800"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 px-6 py-5">
          <p className="text-xs font-medium uppercase text-slate-400">
            Signed in
          </p>
          <p className="mt-1 truncate text-sm font-medium text-slate-800">
            {admin?.email || "Admin"}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
