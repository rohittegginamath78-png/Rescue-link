import { useState, useEffect } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import authService from "../services/authService";

export default function AdminVerifiedRescuers() {
  const [rescuers, setRescuers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRescuer, setSelectedRescuer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [city, setCity] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchVerifiedRescuers();
  }, [page, specialty, city]);

  const fetchVerifiedRescuers = async () => {
    try {
      setLoading(true);
      setError("");
      let query = `/admin/verified-rescuers?page=${page}&limit=10`;
      if (specialty) query += `&specialty=${specialty}`;
      if (city) query += `&city=${city}`;

      const data = await authService.request(query);
      setRescuers(data.rescuers);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || "Failed to load verified rescuers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rescuerId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this rescuer? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      await authService.request(`/admin/rescuer/${rescuerId}`, {
        method: "DELETE",
      });
      fetchVerifiedRescuers();
      setShowModal(false);
      setSelectedRescuer(null);
    } catch (err) {
      setActionError(err.message || "Failed to delete rescuer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisable = async (rescuerId, disabled) => {
    try {
      setActionLoading(true);
      setActionError("");
      await authService.request(`/admin/rescuer/${rescuerId}/disable`, {
        method: "PATCH",
        body: JSON.stringify({ disabled: !disabled }),
      });
      fetchVerifiedRescuers();
      setShowModal(false);
      setSelectedRescuer(null);
    } catch (err) {
      setActionError(err.message || "Failed to update rescuer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      setActionLoading(true);
      setActionError("");
      await authService.request(`/admin/rescuer/${selectedRescuer._id}`, {
        method: "PATCH",
        body: JSON.stringify(editForm),
      });
      fetchVerifiedRescuers();
      setEditMode(false);
      setShowModal(false);
      setSelectedRescuer(null);
    } catch (err) {
      setActionError(err.message || "Failed to save changes");
    } finally {
      setActionLoading(false);
    }
  };

  const SpecialtyBadge = ({ specialty }) => {
    const colors = {
      reptiles: "bg-red-100 text-red-800",
      birds: "bg-purple-100 text-purple-800",
      mammals: "bg-blue-100 text-blue-800",
      all: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colors[specialty] || colors.all}`}
      >
        {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
      </span>
    );
  };

  const RescuerModal = ({ rescuer, onClose }) => {
    if (!rescuer) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              {editMode ? "Edit Rescuer" : "Rescuer Details"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="p-6 space-y-4">
            {actionError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {actionError}
              </div>
            )}

            {editMode ? (
              // Edit Form
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={editForm.whatsapp || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, whatsapp: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NGO Name
                    </label>
                    <input
                      type="text"
                      value={editForm.ngoName || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, ngoName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={editForm.instagram || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, instagram: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={editForm.address || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={editForm.notes || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows="3"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="available24hr"
                    checked={editForm.available24hr || false}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        available24hr: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <label
                    htmlFor="available24hr"
                    className="text-sm font-medium text-gray-700"
                  >
                    Available 24/7
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveEdit}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    {actionLoading ? "Saving..." : "💾 Save Changes"}
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditForm({});
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-800">{rescuer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">City</p>
                    <p className="font-medium text-gray-800">{rescuer.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-800">{rescuer.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">WhatsApp</p>
                    <p className="font-medium text-gray-800">
                      {rescuer.whatsapp || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">NGO</p>
                    <p className="font-medium text-gray-800">
                      {rescuer.ngoName || "Independent"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium">
                      {rescuer.disabled ? (
                        <span className="text-red-600">🚫 Disabled</span>
                      ) : (
                        <span className="text-green-600">✅ Active</span>
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Specialties</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {rescuer.specialties?.map((specialty) => (
                      <SpecialtyBadge key={specialty} specialty={specialty} />
                    ))}
                  </div>
                </div>

                {rescuer.instagram && (
                  <div>
                    <p className="text-sm text-gray-600">Instagram</p>
                    <a
                      href={rescuer.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {rescuer.instagram}
                    </a>
                  </div>
                )}

                {rescuer.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded mt-1">
                      {rescuer.notes}
                    </p>
                  </div>
                )}

                <div className="bg-gray-100 p-3 rounded text-sm text-gray-600">
                  <p>Added by: {rescuer.addedBy}</p>
                  <p>
                    Verified:{" "}
                    {new Date(rescuer.verifiedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setEditMode(true);
                      setEditForm(rescuer);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDisable(rescuer._id, rescuer.disabled)}
                    disabled={actionLoading}
                    className={`flex-1 font-medium py-2 px-4 rounded-lg text-white ${
                      rescuer.disabled
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-yellow-600 hover:bg-yellow-700"
                    }`}
                  >
                    {rescuer.disabled ? "✅ Enable" : "⏸️ Disable"}
                  </button>
                  <button
                    onClick={() => handleDelete(rescuer._id)}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            ✅ Verified Rescuers
          </h1>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Specialty
              </label>
              <select
                value={specialty}
                onChange={(e) => {
                  setSpecialty(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Specialties</option>
                <option value="reptiles">🐍 Reptiles</option>
                <option value="birds">🦅 Birds</option>
                <option value="mammals">🐘 Mammals</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setPage(1);
                }}
                placeholder="Search city..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-600">
                <div className="animate-spin w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full mx-auto mb-4"></div>
                <p>Loading verified rescuers...</p>
              </div>
            </div>
          ) : rescuers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No verified rescuers found
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rescuers.map((rescuer) => (
                <div
                  key={rescuer._id}
                  className={`rounded-lg shadow p-4 hover:shadow-md transition duration-200 ${
                    rescuer.disabled ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-800">
                          {rescuer.name}
                        </h3>
                        {rescuer.disabled && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">📍 {rescuer.city}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {rescuer.specialties?.map((specialty) => (
                          <SpecialtyBadge
                            key={specialty}
                            specialty={specialty}
                          />
                        ))}
                      </div>
                      {rescuer.ngoName && (
                        <p className="text-sm text-gray-600 mt-2">
                          🏢 {rescuer.ngoName}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedRescuer(rescuer);
                        setShowModal(true);
                        setEditMode(false);
                      }}
                      className="ml-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 whitespace-nowrap"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center space-x-4 mt-8">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() =>
                      setPage(Math.min(pagination.pages, page + 1))
                    }
                    disabled={page === pagination.pages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <RescuerModal
          rescuer={selectedRescuer}
          onClose={() => {
            setShowModal(false);
            setSelectedRescuer(null);
            setEditMode(false);
          }}
        />
      )}
    </div>
  );
}
