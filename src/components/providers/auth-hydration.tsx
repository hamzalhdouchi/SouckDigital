"use client";

// Render children immediately — Zustand persist stores handle their own
// rehydration from cookies/localStorage without blocking first paint.
export function AuthHydration({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
