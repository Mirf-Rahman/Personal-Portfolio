"use client";

import { useState, useRef, useEffect } from "react";
import { uploadFile } from "@/lib/api";

interface PDFUploadProps {
  value: string;
  onChange: (url: string) => void;
  onFileSelect?: (file: File) => void;
  label?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

export default function PDFUpload({
  value,
  onChange,
  onFileSelect,
  label = "PDF File",
  maxSize = 5,
  disabled = false,
}: PDFUploadProps) {
  const [activeTab, setActiveTab] = useState<"url" | "upload">("upload");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when value changes
  useEffect(() => {
    if (value) {
      setPreviewUrl(value);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processFile(file);
  };

  const processFile = (file: File) => {
    // Validate file type - PDF only
    if (file.type !== "application/pdf") {
      setUploadError("Please select a PDF file");
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setUploadError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setUploadError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    // Notify parent of file selection
    if (onFileSelect) {
      onFileSelect(file);
    }

    // Auto-upload when file is selected
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);

    try {
      const url = await uploadFile(file);
      onChange(url);
      setActiveTab("url"); // Switch to URL tab after successful upload
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload file"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    processFile(file);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleTabSwitch = (tab: "url" | "upload") => {
    setActiveTab(tab);
    setUploadError(null);
    if (tab === "url") {
      setSelectedFile(null);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium block">{label}</label>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => handleTabSwitch("upload")}
          disabled={disabled}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "upload"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Upload PDF
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch("url")}
          disabled={disabled}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "url"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Enter URL
        </button>
      </div>

      {/* Upload Tab Content */}
      {activeTab === "upload" && (
        <div className="space-y-2">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed border-border rounded-md p-6 text-center transition-colors ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-primary cursor-pointer"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              disabled={disabled}
              className="hidden"
            />
            {uploading ? (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">
                  Drag and drop a PDF here, or
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Choose PDF File
                </button>
                {selectedFile && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected: {selectedFile.name} (
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            )}
          </div>
          {uploadError && (
            <p className="text-sm text-destructive">{uploadError}</p>
          )}
        </div>
      )}

      {/* URL Tab Content */}
      {activeTab === "url" && (
        <div className="space-y-2">
          <input
            type="url"
            value={value}
            onChange={handleUrlChange}
            disabled={disabled}
            placeholder="https://..."
            className="w-full px-3 py-2 border rounded-md bg-background disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      )}

      {/* PDF Preview */}
      {previewUrl && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Preview:</p>
          <div className="border rounded-md p-2 bg-muted/50">
            <embed
              src={previewUrl}
              type="application/pdf"
              className="w-full h-48 rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}
