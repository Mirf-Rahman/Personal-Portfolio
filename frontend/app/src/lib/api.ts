// API client for communicating with the backend
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
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  // Handle 204 No Content responses
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null as T;
}

// Helper to get image URLs from the backend
export function getImageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}/api/files/${path}`;
}
