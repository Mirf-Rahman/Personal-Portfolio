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
      "Content-Type": "application/json",
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
  options: RequestInit = {},
): Promise<T> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Not authenticated. Please log in again.");
  }

  return fetchApi<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
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
