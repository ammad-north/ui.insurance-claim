"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { claimsApi, CreateClaimDto } from "@/services/api";
import { useRouter } from "next/navigation";
import { useDropzone, FileRejection } from "react-dropzone";
import { DocumentArrowUpIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function Form() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateClaimDto>({
    claim_type: "",
    agent_name: "",
    files: [],
  });
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const reasons = rejectedFiles.map((file) => {
          if (file.errors[0].code === "file-too-large") {
            return `${file.file.name} is too large (max 10MB)`;
          }
          if (file.errors[0].code === "file-invalid-type") {
            return `${file.file.name} has invalid type (allowed: PDF, PNG, JPG, JPEG, GIF)`;
          }
          return `${file.file.name} was rejected`;
        });
        setError(`Some files were rejected: ${reasons.join(", ")}`);
      }

      setFormData((prev) => ({
        ...prev,
        files: [...(prev.files || []), ...acceptedFiles],
      }));
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const createClaimMutation = useMutation({
    mutationFn: claimsApi.createClaim,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      router.push("/claims");
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createClaimMutation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files?.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">New Insurance Claim</h1>
          <p className="mt-2 text-gray-600">Submit a new insurance claim with supporting documents</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="agent_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Agent Name
                </label>
                <input
                  type="text"
                  id="agent_name"
                  name="agent_name"
                  value={formData.agent_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="claim_type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Claim Type
                </label>
                <select
                  id="claim_type"
                  name="claim_type"
                  value={formData.claim_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  required
                >
                  <option value="">Select a claim type</option>
                  <option value="Auto">Auto</option>
                  <option value="Home">Home</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Supporting Documents
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center space-y-2">
                <DocumentArrowUpIcon className="w-12 h-12 text-gray-400" />
                {isDragActive ? (
                  <p className="text-blue-500 font-medium">Drop the files here ...</p>
                ) : (
                  <>
                    <p className="text-gray-600">
                      Drag & drop files here, or click to select files
                    </p>
                    <p className="text-sm text-gray-500">
                      (PDF, PNG, JPG, JPEG, GIF up to 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {formData.files && formData.files.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Selected Files:
              </h3>
              <ul className="space-y-3">
                {formData.files.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="flex-1">
                      <span className="text-sm text-gray-900 truncate block">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <XCircleIcon className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={createClaimMutation.isPending}
            className={`w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200 ${
              createClaimMutation.isPending ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {createClaimMutation.isPending ? "Submitting..." : "Submit Claim"}
          </button>
        </form>
      </div>
    </div>
  );
}
