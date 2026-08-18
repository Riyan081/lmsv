import { headers } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Server-side API fetch helper.
 * Automatically forwards auth cookies from the incoming request.
 *
 * Usage (in Server Components):
 *   const data = await api.get("/api/departments");
 *   const result = await api.post("/api/attendance/mark", body);
 */
async function fetchAPI<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; pagination?: any }> {
  const headersList = await headers();
  const cookie = headersList.get("cookie") || "";

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
        ...options.headers,
      },
      cache: "no-store",
    });

    const json = await res.json();
    return json;
  } catch (error) {
    console.error(`[API] Failed to fetch ${path}:`, error);
    return { success: false, error: "Failed to connect to API" };
  }
}

export const api = {
  get: <T = any>(path: string) => fetchAPI<T>(path),

  post: <T = any>(path: string, body: any) =>
    fetchAPI<T>(path, { method: "POST", body: JSON.stringify(body) }),

  put: <T = any>(path: string, body: any) =>
    fetchAPI<T>(path, { method: "PUT", body: JSON.stringify(body) }),

  patch: <T = any>(path: string, body: any) =>
    fetchAPI<T>(path, { method: "PATCH", body: JSON.stringify(body) }),

  delete: <T = any>(path: string) =>
    fetchAPI<T>(path, { method: "DELETE" }),
};
