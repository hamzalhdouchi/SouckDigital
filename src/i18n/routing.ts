import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "ar", "az"],
  defaultLocale: "fr",
});

export type Locale = (typeof routing.locales)[number];

export const RTL_LOCALES: Locale[] = ["ar"];

export function isRTL(locale: string): boolean {
  return RTL_LOCALES.includes(locale as Locale);
}
