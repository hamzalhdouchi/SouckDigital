import { ApiError } from "./client";
import { useAuthStore } from "@/lib/store/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

export const uploadApi = {
  uploadImage: async (file: File, folder: string): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const token = useAuthStore.getState().token;
    const res = await fetch(`${API_URL}/upload/image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { message?: string };
      throw new ApiError(res.status, err.message ?? "Upload échoué");
    }
    return res.json() as Promise<{ url: string }>;
  },

  uploadImages: async (files: File[], folder: string): Promise<{ urls: string[] }> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    formData.append("folder", folder);
    const token = useAuthStore.getState().token;
    const res = await fetch(`${API_URL}/upload/images`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new ApiError(res.status, "Upload échoué");
    return res.json() as Promise<{ urls: string[] }>;
  },
};
