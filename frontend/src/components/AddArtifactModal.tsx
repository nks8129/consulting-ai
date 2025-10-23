import { useState } from "react";

interface AddArtifactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (artifact: ArtifactFormData) => void;
  phase: string;
}

export interface ArtifactFormData {
  type: string;
  title: string;
  content: string;
  file?: File;
  tags: string[];
}

const ARTIFACT_TYPES = [
  { id: "meeting_note", label: "Meeting Note", emoji: "📝", description: "Notes from client meetings" },
  { id: "pain_point", label: "Pain Point", emoji: "⚠️", description: "Problems identified" },
  { id: "process_map", label: "Process Map", emoji: "🗺️", description: "Current/future state processes" },
  { id: "requirement", label: "Requirement", emoji: "📋", description: "Functional or technical requirements" },
  { id: "risk", label: "Risk/Blocker", emoji: "🚨", description: "Risks and dependencies" },
  { id: "deliverable", label: "Deliverable", emoji: "📄", description: "Final deliverables (BRD, specs)" },
  { id: "stakeholder_note", label: "Stakeholder Note", emoji: "👤", description: "Stakeholder feedback" },
  { id: "other", label: "Other", emoji: "📎", description: "Other documentation" },
];

export function AddArtifactModal({ isOpen, onClose, onSubmit, phase }: AddArtifactModalProps) {
  const [mode, setMode] = useState<"type" | "file">("type");
  const [selectedType, setSelectedType] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "type" && (!selectedType || !title || !content)) {
      alert("Please fill in all required fields");
      return;
    }
    
    if (mode === "file" && (!selectedType || !title || !file)) {
      alert("Please select a file and provide details");
      return;
    }

    onSubmit({
      type: selectedType,
      title,
      content: mode === "file" ? `File: ${file?.name}` : content,
      file: file || undefined,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    });

    // Reset form
    setSelectedType("");
    setTitle("");
    setContent("");
    setFile(null);
    setTags("");
    setMode("type");
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Add Artifact - {phase.replace("_", " ")}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Mode Selection */}
          <div className="mb-6 flex gap-3">
            <button
              type="button"
              onClick={() => setMode("type")}
              className={`flex-1 rounded-lg border-2 p-4 text-center transition-all ${
                mode === "type"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
              }`}
            >
              <div className="text-3xl mb-3">✍️</div>
              <div className="text-base font-semibold text-slate-900 dark:text-slate-100">Type Content</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Manually enter information</div>
            </button>
            <button
              type="button"
              onClick={() => setMode("file")}
              className={`flex-1 rounded-lg border-2 p-4 text-center transition-all ${
                mode === "file"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
              }`}
            >
              <div className="text-3xl mb-3">📎</div>
              <div className="text-base font-semibold text-slate-900 dark:text-slate-100">Upload File</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Attach documents</div>
            </button>
          </div>

          {/* Artifact Type Selection */}
          <div className="mb-6">
            <label className="mb-3 block text-base font-semibold text-slate-700 dark:text-slate-300">
              Artifact Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ARTIFACT_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className={`rounded-lg border p-4 text-left transition-all ${
                    selectedType === type.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{type.emoji}</span>
                    <div className="flex-1">
                      <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{type.label}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{type.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="mb-3 block text-base font-semibold text-slate-700 dark:text-slate-300">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., CTO Meeting - Approval Process Discussion"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              required
            />
          </div>

          {/* Content or File Upload */}
          {mode === "type" ? (
            <div className="mb-4">
              <label className="mb-3 block text-base font-semibold text-slate-700 dark:text-slate-300">
                Content *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter detailed information, notes, or description..."
                rows={8}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base leading-relaxed text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                required
              />
            </div>
          ) : (
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Upload File *
              </label>
              <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? (
                    <div>
                      <div className="text-4xl mb-2">📄</div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {file.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="mt-2 text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">📎</div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        Click to upload file
                      </div>
                      <div className="text-sm text-slate-500">
                        PDF, Word, Excel, PowerPoint, Text
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tags (optional)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., urgent, approval-workflow, CTO"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            <p className="mt-1 text-xs text-slate-500">Separate tags with commas</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Add Artifact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
