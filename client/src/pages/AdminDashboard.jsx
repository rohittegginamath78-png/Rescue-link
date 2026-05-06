import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import authService from "../services/authService";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");
      setStats(await authService.request("/admin/dashboard-stats"));
    } catch (err) {
      setError(err.message || "Failed to load moderation overview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminShell
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      title="Moderation overview"
      description="Review community submissions and keep the public rescue network accurate."
    >
      {error && <Alert>{error}</Alert>}

      {loading ? (
        <LoadingState label="Loading overview" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Verified rescuers" value={stats?.totalVerified} />
            <StatCard label="Awaiting review" value={stats?.totalPending} />
            <StatCard label="NGO records" value={stats?.totalNGOs} />
            <StatCard label="Snake rescue contacts" value={stats?.snakeRescuers} />
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-950">
                Primary workflow
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Pending submissions stay private until approved.
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              <ActionRow
                title="Review pending rescuers"
                description="Verify contact details, specialty, NGO status, and notes before publishing."
                href="/admin/pending-rescuers"
                cta="Open review queue"
              />
              <ActionRow
                title="Manage verified network"
                description="Edit public records, disable stale contacts, or remove incorrect data."
                href="/admin/verified-rescuers"
                cta="Manage records"
              />
              <ActionRow
                title="Add a verified rescuer"
                description="Use this for trusted contacts confirmed outside the community form."
                href="/admin/add-rescuer"
                cta="Add record"
              />
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}

function AdminShell({ sidebarOpen, setSidebarOpen, title, description, children }) {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-950">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 lg:hidden"
            >
              Menu
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value ?? "-"}</p>
    </div>
  );
}

function ActionRow({ title, description, href, cta }) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <Link
        to={href}
        className="inline-flex shrink-0 justify-center rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
      >
        {cta}
      </Link>
    </div>
  );
}

function Alert({ children }) {
  return (
    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {children}
    </div>
  );
}

function LoadingState({ label }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg border border-slate-200 bg-white">
      <div className="text-center text-sm text-slate-500">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-green-200 border-t-green-700" />
        {label}
      </div>
    </div>
  );
}
