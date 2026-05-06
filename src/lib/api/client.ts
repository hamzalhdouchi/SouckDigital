const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  try {
    const { useAuthStore } = require("@/lib/store/auth");
    return useAuthStore.getState().token ?? null;
  } catch {
    return null;
  }
}

function getRefreshToken(): string | null {
  try {
    const { useAuthStore } = require("@/lib/store/auth");
    return useAuthStore.getState().refreshToken ?? null;
  } catch {
    return null;
  }
}

async function tryRefresh(): Promise<string | null> {
  const rt = getRefreshToken();
  if (!rt) return null;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { accessToken: string };
    const { useAuthStore } = require("@/lib/store/auth");
    useAuthStore.getState().setTokens(data.accessToken, rt);
    return data.accessToken;
  } catch {
    return null;
  }
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(0, "Impossible de joindre le serveur. Vérifiez votre connexion.");
  }

  if (res.status === 401 && retry) {
    const newToken = await tryRefresh();
    if (newToken) {
      return apiRequest<T>(path, options, false);
    }
    try {
      const { useAuthStore } = require("@/lib/store/auth");
      useAuthStore.getState().logout();
    } catch { /* noop */ }
    if (typeof window !== "undefined") {
      window.location.href = "/fr/auth/login";
    }
    throw new ApiError(401, "Session expirée, veuillez vous reconnecter.");
  }

  if (res.status >= 500) {
    let message = `Erreur serveur (${res.status})`;
    try {
      const body = await res.json() as { message?: string };
      message = body?.message ?? message;
    } catch { /* ignore */ }
    if (typeof window !== "undefined") {
      try {
        const { toast } = require("sonner");
        toast.error("Le serveur est temporairement indisponible. Réessayez dans quelques instants.");
      } catch { /* sonner not loaded yet */ }
    }
    throw new ApiError(res.status, message);
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    let errors: Record<string, string> | undefined;
    try {
      const body = await res.json() as { message?: string; error?: string; errors?: Record<string, string> };
      message = body?.message ?? body?.error ?? message;
      errors = body?.errors;
    } catch { /* ignore */ }
    throw new ApiError(res.status, message, errors);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function get<T>(path: string, options?: RequestInit) {
  return apiRequest<T>(path, { ...options, method: "GET" });
}

export function post<T>(path: string, body?: unknown, options?: RequestInit) {
  return apiRequest<T>(path, {
    ...options,
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function put<T>(path: string, body?: unknown, options?: RequestInit) {
  return apiRequest<T>(path, {
    ...options,
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function patch<T>(path: string, body?: unknown, options?: RequestInit) {
  return apiRequest<T>(path, {
    ...options,
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function del<T>(path: string, options?: RequestInit) {
  return apiRequest<T>(path, { ...options, method: "DELETE" });
}

export function serverGet<T>(path: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${API_URL}${path}`, { headers, cache: "no-store" }).then(async (res) => {
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { message?: string };
      throw new ApiError(res.status, body?.message ?? `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  });
}

export default apiRequest;
