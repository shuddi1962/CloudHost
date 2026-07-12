"use client";

import { useState } from "react";
import Link from "next/link";

export default function BillingPage() {
  const [tab, setTab] = useState<"invoices" | "quotes" | "transactions">("invoices");

  const invoices = [
    { id: "INV-2024", date: "Jul 10, 2026", due: "Jul 24, 2026", amount: 24.99, status: "Unpaid", items: "Business Hosting - Monthly" },
    { id: "INV-2023", date: "Jun 10, 2026", due: "Jun 24, 2026", amount: 49.99, status: "Paid", items: "cPanel Pro License (2x)" },
    { id: "INV-2022", date: "May 10, 2026", due: "May 24, 2026", amount: 12.99, status: "Paid", items: "SSL Certificate - PositiveSSL" },
    { id: "INV-2021", date: "Apr 10, 2026", due: "Apr 24, 2026", amount: 89.99, status: "Paid", items: "Business Hosting - Quarterly" },
    { id: "INV-2020", date: "Mar 10, 2026", due: "Mar 24, 2026", amount: 24.99, status: "Cancelled", items: "Business Hosting - Monthly" },
    { id: "INV-2019", date: "Feb 10, 2026", due: "Feb 24, 2026", amount: 24.99, status: "Refunded", items: "Business Hosting - Monthly" },
  ];

  const transactions = [
    { id: "TXN-12841", date: "Jun 24, 2026", description: "Payment - Invoice INV-2023", method: "Visa *4242", amount: -49.99, status: "Completed" },
    { id: "TXN-12840", date: "May 24, 2026", description: "Payment - Invoice INV-2022", method: "Visa *4242", amount: -12.99, status: "Completed" },
    { id: "TXN-12839", date: "Apr 24, 2026", description: "Payment - Invoice INV-2021", method: "PayPal", amount: -89.99, status: "Completed" },
  ];

  return (
    <div className="text-[13px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#1c3f66]">Billing & Invoices</h1>
          <p className="text-xs text-gray-500">View and pay invoices, manage billing information</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-red-600 font-medium bg-red-50 px-3 py-1.5 rounded">$24.99 Due</span>
          <button className="px-3 py-1.5 bg-[#3cb878] text-white rounded text-xs font-medium hover:bg-[#2da066]">Pay Now</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Paid", value: "$177.96", color: "text-[#3cb878]" },
          { label: "Outstanding", value: "$24.99", color: "text-[#e2372f]" },
          { label: "Pending Credits", value: "$0.00", color: "text-[#e08a1e]" },
          { label: "Next Due Date", value: "Jul 24, 2026", color: "text-[#1c3f66]" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-lg font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-100 px-5 py-3">
          <div className="flex items-center gap-4">
            {(["invoices", "quotes", "transactions"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`text-xs font-medium pb-1 border-b-2 transition-colors ${tab === t ? "border-[#1c3f66] text-[#1c3f66]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                {t === "invoices" ? "Invoices" : t === "quotes" ? "Quotes" : "Transactions"}
              </button>
            ))}
          </div>
        </div>

        {tab === "invoices" && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-2 font-medium text-gray-600">Invoice #</th>
                  <th className="text-left px-5 py-2 font-medium text-gray-600">Date</th>
                  <th className="text-left px-5 py-2 font-medium text-gray-600">Due Date</th>
                  <th className="text-left px-5 py-2 font-medium text-gray-600">Items</th>
                  <th className="text-right px-5 py-2 font-medium text-gray-600">Amount</th>
                  <th className="text-left px-5 py-2 font-medium text-gray-600">Status</th>
                  <th className="text-right px-5 py-2 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-2.5 font-medium text-gray-800">{inv.id}</td>
                    <td className="px-5 py-2.5 text-gray-500">{inv.date}</td>
                    <td className="px-5 py-2.5 text-gray-500">{inv.due}</td>
                    <td className="px-5 py-2.5 text-gray-600">{inv.items}</td>
                    <td className="px-5 py-2.5 text-right font-medium text-gray-800">${inv.amount.toFixed(2)}</td>
                    <td className="px-5 py-2.5">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${inv.status === "Paid" ? "bg-[#3cb878]/10 text-[#3cb878]" : inv.status === "Unpaid" ? "bg-[#e2372f]/10 text-[#e2372f]" : inv.status === "Cancelled" ? "bg-gray-100 text-gray-500" : "bg-[#e08a1e]/10 text-[#e08a1e]"}`}>{inv.status}</span>
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      {inv.status === "Unpaid" && <button className="text-[10px] text-[#1c3f66] hover:underline font-medium">Pay Now</button>}
                      <button className="text-[10px] text-gray-500 hover:underline ml-2">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "transactions" && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-2 font-medium text-gray-600">Transaction #</th>
                  <th className="text-left px-5 py-2 font-medium text-gray-600">Date</th>
                  <th className="text-left px-5 py-2 font-medium text-gray-600">Description</th>
                  <th className="text-left px-5 py-2 font-medium text-gray-600">Method</th>
                  <th className="text-right px-5 py-2 font-medium text-gray-600">Amount</th>
                  <th className="text-left px-5 py-2 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-2.5 font-medium text-gray-800">{t.id}</td>
                    <td className="px-5 py-2.5 text-gray-500">{t.date}</td>
                    <td className="px-5 py-2.5 text-gray-600">{t.description}</td>
                    <td className="px-5 py-2.5 text-gray-500">{t.method}</td>
                    <td className="px-5 py-2.5 text-right font-medium text-[#3cb878]">${Math.abs(t.amount).toFixed(2)}</td>
                    <td className="px-5 py-2.5">
                      <span className="text-[10px] font-medium text-[#3cb878]">{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "quotes" && (
          <div className="p-8 text-center text-gray-400 text-sm">
            No quotes have been requested.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-100 pt-4">
        <span>Billing cycle: Monthly · Payment method: Visa *4242</span>
        <Link href="/dashboard/settings" className="text-[#1c3f66] hover:underline font-medium">Manage Payment Methods</Link>
      </div>
    </div>
  );
}
