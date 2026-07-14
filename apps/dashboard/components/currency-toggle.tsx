"use client";

import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from "react";
import type { SupportedCurrency } from "@/lib/currency";
import { getStoredCurrency } from "@/lib/currency";

interface CurrencyContextValue {
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  toggleCurrency: () => void;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "USD",
  setCurrency: () => {},
  toggleCurrency: () => {},
});

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>("USD");

  useEffect(() => {
    setCurrencyState(getStoredCurrency());
  }, []);

  const setCurrency = useCallback((c: SupportedCurrency) => {
    setCurrencyState(c);
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred_currency", c);
    }
  }, []);

  const toggleCurrency = useCallback(() => {
    setCurrency(currency === "USD" ? "NGN" : "USD");
  }, [currency, setCurrency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, toggleCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function CurrencyToggle() {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <button
      onClick={toggleCurrency}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
      title="Toggle currency display"
    >
      {currency === "USD" ? (
        <>
          <span className="text-green-600 font-bold">$</span> USD
        </>
      ) : (
        <>
          <span className="text-green-600 font-bold">₦</span> NGN
        </>
      )}
      <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    </button>
  );
}
