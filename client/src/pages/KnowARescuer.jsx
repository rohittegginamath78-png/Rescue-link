import { useState } from "react";
import { submitRescuerForm } from "../services/api";

const initialFormData = {
  name: "",
  city: "",
  phone: "",
  whatsapp: "",
  specialties: [],
  instagram: "",
  ngoName: "",
  notes: "",
  submitterEmail: "",
  submitterPhone: "",
  isThisRescuer: false,
};

const specialtyOptions = [
  { value: "reptiles", label: "Snake Rescue", detail: "Snakes and reptiles" },
  { value: "birds", label: "Bird Rescue", detail: "Birds and fledglings" },
  { value: "mammals", label: "Wildlife Rescue", detail: "Wild animals" },
  { value: "dog-cat", label: "Dog/Cat Rescue", detail: "Street animals" },
  { value: "other", label: "Other", detail: "Special cases" },
];

function normalizePhone(value) {
  return value.replace(/[^\d+]/g, "");
}

function isValidPhone(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

export default function KnowARescuer() {
  const [formData, setFormData] = useState(initialFormData);
  const [submitterType, setSubmitterType] = useState("known");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [warning, setWarning] = useState("");

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectSubmitterType = (type) => {
    setSubmitterType(type);
    updateField("isThisRescuer", type === "self");
  };

  const toggleSpecialty = (specialty) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((item) => item !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const validate = () => {
    if (!formData.name.trim() || !formData.city.trim() || !formData.phone.trim()) {
      return "Rescuer name, city, and phone number are required.";
    }

    if (!isValidPhone(formData.phone)) {
      return "Enter a valid phone number with 10 to 15 digits.";
    }

    if (formData.whatsapp && !isValidPhone(formData.whatsapp)) {
      return "Enter a valid WhatsApp number with 10 to 15 digits.";
    }

    if (formData.submitterPhone && !isValidPhone(formData.submitterPhone)) {
      return "Enter a valid contact number for yourself.";
    }

    if (formData.specialties.length === 0) {
      return "Select at least one animal specialty.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setWarning("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const result = await submitRescuerForm({
        ...formData,
        name: formData.name.trim(),
        city: formData.city.trim(),
        phone: normalizePhone(formData.phone),
        whatsapp: formData.whatsapp ? normalizePhone(formData.whatsapp) : "",
        instagram: formData.instagram.trim(),
        ngoName: formData.ngoName.trim(),
        notes: formData.notes.trim(),
        submitterEmail: formData.submitterEmail.trim(),
        submitterPhone: formData.submitterPhone
          ? normalizePhone(formData.submitterPhone)
          : "",
      });

      if (result.warning) {
        setWarning(result.warning);
      }

      setSuccess(
        "Thank you for helping expand the wildlife rescue network. Your submission will be reviewed before becoming publicly visible.",
      );
      setFormData(initialFormData);
      setSubmitterType("known");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Submission failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-green-50 via-white to-white">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-16">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-medium text-green-800 shadow-sm">
            Community powered rescue network
          </div>
          <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-gray-950 sm:text-5xl">
            Know a Wildlife Rescuer?
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-700">
            Help expand the RescueLink wildlife emergency network by suggesting
            trusted rescuers, NGOs, bird rescuers, snake rescuers, or wildlife
            volunteers.
          </p>
          <p className="mt-3 text-base font-medium text-green-800">
            Rescuers can also submit their own information for verification.
          </p>

          <div className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
            {[
              ["Verified first", "Pending submissions stay hidden until reviewed."],
              ["Local knowledge", "Cities and specialties help people find nearby help."],
              ["Simple review", "Admins approve, reject, disable, or update records."],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-lg border border-green-100 bg-white p-4 shadow-sm"
              >
                <p className="text-sm font-semibold text-gray-950">{title}</p>
                <p className="mt-1 text-sm leading-6 text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-green-100 bg-white p-5 shadow-lg">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => selectSubmitterType("known")}
              className={`rounded-lg border p-4 text-left transition ${
                submitterType === "known"
                  ? "border-green-600 bg-green-50 text-green-950"
                  : "border-gray-200 text-gray-700 hover:border-green-300"
              }`}
            >
              <span className="block text-sm font-semibold">
                I know a rescuer
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                Suggest someone trusted.
              </span>
            </button>
            <button
              type="button"
              onClick={() => selectSubmitterType("self")}
              className={`rounded-lg border p-4 text-left transition ${
                submitterType === "self"
                  ? "border-green-600 bg-green-50 text-green-950"
                  : "border-gray-200 text-gray-700 hover:border-green-300"
              }`}
            >
              <span className="block text-sm font-semibold">
                I am a rescuer
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                Submit yourself.
              </span>
            </button>
          </div>

          {submitterType === "self" && (
            <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
              Your profile will be reviewed before becoming publicly visible.
            </p>
          )}
        </aside>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-xl sm:p-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-950">
              Rescuer details
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Only approved rescuers appear in public search results.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {warning && (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {warning}
            </div>
          )}
          {success && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {success}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Rescuer Name" required>
              <input
                value={formData.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="form-input"
                placeholder="Full name"
              />
            </Field>

            <Field label="City" required>
              <input
                value={formData.city}
                onChange={(event) => updateField("city", event.target.value)}
                className="form-input"
                placeholder="Bangalore"
              />
            </Field>

            <Field label="Phone Number" required>
              <input
                value={formData.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="form-input"
                inputMode="tel"
                placeholder="+91 98765 43210"
              />
            </Field>

            <Field label="WhatsApp Number">
              <input
                value={formData.whatsapp}
                onChange={(event) =>
                  updateField("whatsapp", event.target.value)
                }
                className="form-input"
                inputMode="tel"
                placeholder="+91 98765 43210"
              />
            </Field>
          </div>

          <div className="mt-5">
            <label className="text-sm font-semibold text-gray-800">
              Animal Specialty <span className="text-red-600">*</span>
            </label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {specialtyOptions.map((option) => {
                const selected = formData.specialties.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleSpecialty(option.value)}
                    className={`rounded-lg border p-4 text-left transition ${
                      selected
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-gray-950">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      {option.detail}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Instagram/Profile Link">
              <input
                value={formData.instagram}
                onChange={(event) =>
                  updateField("instagram", event.target.value)
                }
                className="form-input"
                placeholder="https://instagram.com/..."
              />
            </Field>

            <Field label="NGO Name">
              <input
                value={formData.ngoName}
                onChange={(event) => updateField("ngoName", event.target.value)}
                className="form-input"
                placeholder="Independent or NGO name"
              />
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Notes/Description">
              <textarea
                value={formData.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                className="form-input min-h-28 resize-y"
                placeholder="What animals do they help with? Which areas do they cover?"
              />
            </Field>
          </div>

          <label className="mt-5 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={formData.isThisRescuer}
              onChange={(event) => {
                updateField("isThisRescuer", event.target.checked);
                setSubmitterType(event.target.checked ? "self" : "known");
              }}
              className="h-4 w-4 rounded border-gray-300 text-green-600"
            />
            I am this rescuer
          </label>

          {!formData.isThisRescuer && (
            <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-950">
                Your contact information
              </p>
              <p className="mt-1 text-sm text-blue-800">
                Optional, but helpful if admins need to verify details.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Your Email">
                  <input
                    type="email"
                    value={formData.submitterEmail}
                    onChange={(event) =>
                      updateField("submitterEmail", event.target.value)
                    }
                    className="form-input"
                    placeholder="you@example.com"
                  />
                </Field>
                <Field label="Your Phone">
                  <input
                    value={formData.submitterPhone}
                    onChange={(event) =>
                      updateField("submitterPhone", event.target.value)
                    }
                    className="form-input"
                    inputMode="tel"
                    placeholder="+91 98765 43210"
                  />
                </Field>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 inline-flex w-full items-center justify-center rounded-lg bg-green-700 px-5 py-3 text-base font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading && (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {loading ? "Submitting..." : "Submit for review"}
          </button>
        </form>
      </section>
    </div>
  );
}

function Field({ label, required = false, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-800">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}
