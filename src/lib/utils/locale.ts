export function localeName(
  item: { name: string; nameAr?: string | null },
  locale: string
): string {
  return locale === "ar" && item.nameAr ? item.nameAr : item.name;
}

export function formatPrice(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

export function formatRelativeDate(dateString: string, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale === "ar" ? "ar-MA" : "fr", {
    numeric: "auto",
  });
  const diff = (new Date(dateString).getTime() - Date.now()) / 1000;
  if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  return rtf.format(Math.round(diff / 86400), "day");
}
