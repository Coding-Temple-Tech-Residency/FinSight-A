const API_BASE_URL =
  `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api/v1`;

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? `API request failed: ${response.status}`);
  }

  return response;
}

export default apiFetch;