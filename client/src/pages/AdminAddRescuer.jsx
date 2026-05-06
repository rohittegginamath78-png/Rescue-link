import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import authService from "../services/authService";

export default function AdminAddRescuer() {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    phone: "",
    whatsapp: "",
    specialties: [],
    ngoName: "",
    instagram: "",
    notes: "",
    address: "",
    available24hr: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const specialtyOptions = [
    { value: "reptiles", label: "🐍 Reptiles (Snake Rescue)" },
    { value: "birds", label: "🦅 Birds (Bird Rescue)" },
    { value: "mammals", label: "🐘 Mammals (Wildlife Rescue)" },
    { value: "all", label: "🆘 All Animals" },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSpecialtyChange = (specialty) => {
    setFormData((prev) => {
      const newSpecialties = prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty];

      return {
        ...prev,
        specialties: newSpecialties.length > 0 ? newSpecialties : ["all"],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validation
    if (!formData.name || !formData.city || !formData.phone) {
      setError("Name, city, and phone are required");
      setLoading(false);
      return;
    }

    try {
      const result = await authService.request("/admin/add-rescuer", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setSuccess("Rescuer added successfully! Redirecting...");
      setTimeout(() => {
        navigate("/admin/verified-rescuers");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to add rescuer");
    } finally {
      setLoading(false);
    }
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
            ➕ Add New Rescuer
          </h1>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                {success}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Rescuers added by admin are automatically
                verified and will appear in public search results immediately.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow p-6 space-y-6"
            >
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rescuer Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., John Smith"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g., Bangalore"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g., +91 9876543210"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="e.g., +91 9876543210"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Animal Specialties <span className="text-red-600">*</span>
                </label>
                <div className="space-y-2">
                  {specialtyOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-3"
                    >
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(option.value)}
                        onChange={() => handleSpecialtyChange(option.value)}
                        className="rounded"
                      />
                      <span className="text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* NGO Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NGO Name (if applicable)
                </label>
                <input
                  type="text"
                  name="ngoName"
                  value={formData.ngoName}
                  onChange={handleInputChange}
                  placeholder="e.g., Wildlife Rescue Foundation"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Instagram */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram / Profile Link
                </label>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder="e.g., https://instagram.com/rescuer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Full address details"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes / Description
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional information about the rescuer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>

              {/* Available 24/7 */}
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="available24hr"
                  checked={formData.available24hr}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <span className="text-gray-700 font-medium">
                  Available 24/7
                </span>
              </label>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                >
                  {loading ? "Adding Rescuer..." : "✅ Add Rescuer"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/dashboard")}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-4 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
