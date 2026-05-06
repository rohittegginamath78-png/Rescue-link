import { useEffect, useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import authService from "../services/authService";

const specialtyLabels = {
  reptiles: "Snake rescue",
  birds: "Bird rescue",
  mammals: "Wildlife rescue",
  "dog-cat": "Dog/Cat rescue",
  other: "Other",
  all: "General rescue",
};

export default function AdminPendingRescuers() {
  const [rescuers, setRescuers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRescuer, setSelectedRescuer] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    fetchPendingRescuers();
  }, [page]);

  const fetchPendingRescuers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await authService.request(
        `/admin/pending-rescuers?page=${page}&limit=10`,
      );
      setRescuers(data.rescuers);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || "Failed to load pending rescuers");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (rescuerId) => {
    try {
      setActionLoading(true);
      setActionError("");
      await authService.request(`/admin/rescuer/${rescuerId}/verify`, {
        method: "PATCH",
      });
      await fetchPendingRescuers();
      setSelectedRescuer(null);
    } catch (err) {
      setActionError(err.message || "Failed to verify rescuer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (rescuerId, reason) => {
    try {
      setActionLoading(true);
      setActionError("");
      await authService.request(`/admin/rescuer/${rescuerId}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      });
      await fetchPendingRescuers();
      setSelectedRescuer(null);
    } catch (err) {
      setActionError(err.message || "Failed to reject rescuer");
    } finally {
      setActionLoading(false);
    }
  };

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
              <h1 className="text-2xl font-semibold text-slate-950">
                Pending review
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Community submissions are private until an admin verifies them.
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {error && <Alert>{error}</Alert>}

          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Review queue
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Check contact, city, specialty, and supporting notes.
                </p>
              </div>
              <span className="text-sm font-medium text-slate-500">
                {pagination?.total ?? rescuers.length} pending
              </span>
            </div>

            {loading ? (
              <LoadingState label="Loading pending submissions" />
            ) : rescuers.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="divide-y divide-slate-100">
                {rescuers.map((rescuer) => (
                  <RescuerRow
                    key={rescuer._id}
                    rescuer={rescuer}
                    onReview={() => {
                      setActionError("");
                      setSelectedRescuer(rescuer);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">
                Page {page} of {pagination.pages}
              </span>
              <button
                type="button"
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>

      {selectedRescuer && (
        <ReviewModal
          rescuer={selectedRescuer}
          actionError={actionError}
          actionLoading={actionLoading}
          onClose={() => setSelectedRescuer(null)}
          onVerify={handleVerify}
          onReject={handleReject}
        />
      )}
    </div>
  );
}

function RescuerRow({ rescuer, onReview }) {
  return (
    <div className="grid gap-4 px-5 py-4 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-center">
      <div>
        <h3 className="font-semibold text-slate-950">{rescuer.name}</h3>
        <p className="mt-1 text-sm text-slate-500">
          {formatCity(rescuer.city)} · submitted {formatDate(rescuer.submittedAt)}
        </p>
      </div>

      <div className="text-sm text-slate-600">
        <p>{rescuer.phone}</p>
        <p className="mt-1 text-slate-400">{rescuer.whatsapp || "No WhatsApp"}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {rescuer.specialties?.map((specialty) => (
          <SpecialtyBadge key={specialty} specialty={specialty} />
        ))}
      </div>

      <button
        type="button"
        onClick={onReview}
        className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
      >
        Review
      </button>
    </div>
  );
}

function ReviewModal({
  rescuer,
  actionError,
  actionLoading,
  onClose,
  onVerify,
  onReject,
}) {
  const [rejectReason, setRejectReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Review submission
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Approving makes this rescuer visible in public search.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700"
          >
            x
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {actionError && <Alert>{actionError}</Alert>}

          <div className="grid gap-4 sm:grid-cols-2">
            <Detail label="Name" value={rescuer.name} />
            <Detail label="City" value={formatCity(rescuer.city)} />
            <Detail label="Phone" value={rescuer.phone} />
            <Detail label="WhatsApp" value={rescuer.whatsapp || "-"} />
            <Detail label="NGO" value={rescuer.ngoName || "Independent"} />
            <Detail label="Added by" value={rescuer.addedBy || "community"} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-slate-400">
              Specialties
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {rescuer.specialties?.map((specialty) => (
                <SpecialtyBadge key={specialty} specialty={specialty} />
              ))}
            </div>
          </div>

          {rescuer.instagram && (
            <Detail
              label="Profile link"
              value={
                <a
                  href={rescuer.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 underline-offset-2 hover:underline"
                >
                  {rescuer.instagram}
                </a>
              }
            />
          )}

          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Notes</p>
            <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">
              {rescuer.notes || "No notes provided."}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-950">
              Submitter contact
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {rescuer.submitterEmail || "Anonymous"}
              {rescuer.submitterPhone ? ` · ${rescuer.submitterPhone}` : ""}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Submitted {formatDateTime(rescuer.submittedAt)}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Rejection reason
            </label>
            <textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
              rows="3"
              placeholder="Optional internal note"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onReject(rescuer._id, rejectReason)}
            disabled={actionLoading}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => onVerify(rescuer._id)}
            disabled={actionLoading}
            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
          >
            {actionLoading ? "Processing..." : "Verify and publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SpecialtyBadge({ specialty }) {
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
      {specialtyLabels[specialty] || specialty}
    </span>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {value}
      </p>
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
    <div className="flex h-64 items-center justify-center">
      <div className="text-center text-sm text-slate-500">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-green-200 border-t-green-700" />
        {label}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-5 py-16 text-center">
      <p className="text-sm font-medium text-slate-700">
        No submissions need review.
      </p>
      <p className="mt-1 text-sm text-slate-500">
        New community rescuer submissions will appear here.
      </p>
    </div>
  );
}

function formatCity(city) {
  if (!city) return "-";
  return city
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}
