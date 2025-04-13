"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { claimsApi, CreateClaimDto } from "@/services/api";
import { useRouter } from "next/navigation";
import { useDropzone, FileRejection } from "react-dropzone";

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

      // Handle rejected files
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
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Insurance Claim Form</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="mb-4">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a claim type</option>
            <option value="Auto">Auto</option>
            <option value="Home">Home</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supporting Documents
          </label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-blue-500">Drop the files here ...</p>
            ) : (
              <p className="text-gray-600">
                Drag & drop files here, or click to select files
                <br />
                <span className="text-sm text-gray-500">
                  (PDF, PNG, JPG, JPEG, GIF up to 10MB)
                </span>
              </p>
            )}
          </div>
        </div>

        {formData.files && formData.files.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Selected Files:
            </h3>
            <ul className="space-y-2">
              {formData.files.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <div className="flex-1">
                    <span className="text-sm text-gray-600 truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500 block">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div
            className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={createClaimMutation.isPending}
          className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200 ${
            createClaimMutation.isPending ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {createClaimMutation.isPending ? "Submitting..." : "Submit Claim"}
        </button>
      </form>
    </div>
  );
}
