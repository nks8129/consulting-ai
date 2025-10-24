import { useState } from "react";

interface CreateOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OpportunityFormData) => void;
  isSubmitting?: boolean;
}

export interface OpportunityFormData {
  name: string;
  clientName: string;
  description: string;
  stakeholders: string;
}

export function CreateOpportunityModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreateOpportunityModalProps) {
  const [formData, setFormData] = useState<OpportunityFormData>({
    name: "",
    clientName: "",
    description: "",
    stakeholders: "",
  });

  const [errors, setErrors] = useState<Partial<OpportunityFormData>>({});

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Partial<OpportunityFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Opportunity name is required";
    }
    if (!formData.clientName.trim()) {
      newErrors.clientName = "Client name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        name: "",
        clientName: "",
        description: "",
        stakeholders: "",
      });
      setErrors({});
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      clientName: "",
      description: "",
      stakeholders: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Create New Opportunity
            </h2>
            <button
              onClick={handleClose}
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Opportunity Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Opportunity Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Acme Corp Digital Transformation"
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-300 focus:ring-blue-500 dark:border-slate-700"
                } bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Client Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="e.g., Acme Corporation"
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.clientName
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-300 focus:ring-blue-500 dark:border-slate-700"
                } bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100`}
              />
              {errors.clientName && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.clientName}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the engagement objectives, scope, and key focus areas..."
                rows={4}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.description
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-300 focus:ring-blue-500 dark:border-slate-700"
                } bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100`}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.description}</p>
              )}
            </div>

            {/* Stakeholders */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Key Stakeholders <span className="text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.stakeholders}
                onChange={(e) => setFormData({ ...formData, stakeholders: e.target.value })}
                placeholder="e.g., John Smith (CTO), Sarah Johnson (VP Operations)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Separate multiple stakeholders with commas
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              )}
              {isSubmitting ? "Creating..." : "Create Opportunity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
