export type SupportedCurrency = "USD" | "NGN";

export interface CurrencyDisplay {
  symbol: string;
  code: SupportedCurrency;
  locale: string;
}

export const CURRENCIES: Record<SupportedCurrency, CurrencyDisplay> = {
  USD: { symbol: "$", code: "USD", locale: "en-US" },
  NGN: { symbol: "₦", code: "NGN", locale: "en-NG" },
};

export function getCurrencyFromLocale(locale?: string): SupportedCurrency {
  if (!locale) return "USD";
  const upper = locale.toUpperCase();
  if (upper.includes("NG")) return "NGN";
  if (upper.startsWith("EN-NG")) return "NGN";
  if (upper.startsWith("HA")) return "NGN";
  if (upper.startsWith("YO")) return "NGN";
  if (upper.startsWith("IG")) return "NGN";
  return "USD";
}

export function getStoredCurrency(): SupportedCurrency {
  if (typeof window === "undefined") return "USD";
  const stored = localStorage.getItem("preferred_currency");
  if (stored === "NGN" || stored === "USD") return stored;
  return getCurrencyFromLocale(navigator.language);
}

export function formatPrice(
  usd: string | number,
  ngn: string | number | null | undefined,
  currency: SupportedCurrency,
): string {
  const usdNum = Number(usd);
  if (currency === "NGN" && ngn !== null && ngn !== undefined && ngn !== "") {
    const ngnNum = Number(ngn);
    return `₦${ngnNum.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${usdNum.toFixed(2)}`;
}

export function formatPriceWithCurrency(
  usd: string | number,
  ngn: string | number | null | undefined,
  currency: SupportedCurrency,
): string {
  const usdNum = Number(usd);
  if (currency === "NGN" && ngn !== null && ngn !== undefined && ngn !== "") {
    const ngnNum = Number(ngn);
    return `₦${ngnNum.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo`;
  }
  return `$${usdNum.toFixed(2)}/mo`;
}
