"use client";

import { useState, useRef, useEffect } from "react";
import { uploadFile } from "@/lib/api";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
}

export default function ImageUpload({
  value,
  onChange,
  label = "Image URL",
  accept = "image/*",
  maxSize = 10,
}: ImageUploadProps) {
  const [activeTab, setActiveTab] = useState<"url" | "upload">("url");
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

  // Create preview URL for selected file
  useEffect(() => {
    if (selectedFile && activeTab === "upload") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, [selectedFile, activeTab]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
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
      setSelectedFile(null);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Failed to upload file");
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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please drop an image file");
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
    handleUpload(file);
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
          onClick={() => handleTabSwitch("url")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "url"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Enter URL
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch("upload")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "upload"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Upload File
        </button>
      </div>

      {/* URL Tab Content */}
      {activeTab === "url" && (
        <div className="space-y-2">
          <input
            type="url"
            value={value}
            onChange={handleUrlChange}
            placeholder="https://..."
            className="w-full px-3 py-2 border rounded-md bg-background"
          />
        </div>
      )}

      {/* Upload Tab Content */}
      {activeTab === "upload" && (
        <div className="space-y-2">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-border rounded-md p-6 text-center hover:border-primary transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
            />
            {uploading ? (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Drag and drop an image here, or
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium"
                >
                  Choose File
                </button>
                {selectedFile && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected: {selectedFile.name}
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

      {/* Image Preview */}
      {previewUrl && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Preview:</p>
          <div className="border rounded-md p-2 bg-muted/50">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-48 mx-auto object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}
