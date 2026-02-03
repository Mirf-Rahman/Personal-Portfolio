// API client for communicating with the backend
import { getAuthToken } from "./auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      // Only set Content-Type if not already set (FormData should not have it)
      ...(options.headers && !(options.body instanceof FormData) && { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    // Try to parse error message from response
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // If parsing fails, use default message
    }
    throw new Error(errorMessage);
  }

  // Handle 204 No Content responses
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null as T;
}

// Authenticated fetch that automatically includes JWT token
export async function authenticatedFetch<T>(
  endpoint: string,
  options: RequestInit & { isFormData?: boolean } = {},
): Promise<T> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Not authenticated. Please log in again.");
  }

  const { isFormData, ...fetchOptions } = options;

  // If it's FormData, don't set Content-Type (browser will set it with boundary)
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  // Add existing headers
  if (options.headers) {
    const existingHeaders = options.headers as Record<string, string>;
    Object.assign(headers, existingHeaders);
  }

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return fetchApi<T>(endpoint, {
    ...fetchOptions,
    headers,
  });
}

// Helper to get image URLs from the backend
export function getImageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}/api/files/${path}`;
}

// Upload a file to DigitalOcean Spaces
export async function uploadFile(file: File): Promise<string> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Not authenticated. Please log in again.");
  }

  // Create FormData with the file
  const formData = new FormData();
  formData.append("file", file);

  // Upload to backend
  const response = await fetch(`${API_URL}/api/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type - browser will set it with boundary for FormData
    },
    body: formData,
  });

  if (!response.ok) {
    // Try to parse error message from response
    let errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // If parsing fails, use default message
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.url; // Return the CDN URL
}
