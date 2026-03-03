"use client";

import PaymentMethods from "./PaymentMethods";
import PaymentSummary from "./PaymentSummary";
import { usePaymentPage } from "@/hooks/payment/usePaymentPage";

export default function PaymentPageShell() {
  const { method, setMethod, isSubmitting, summaryLines, handleConfirm } =
    usePaymentPage();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="custom-container py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Checkout
        </h1>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <PaymentMethods selected={method} onChange={setMethod} />
          </div>

          <div className="space-y-4">
            <PaymentSummary lines={summaryLines} />

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting || summaryLines.length === 0}
              className="w-full rounded-full bg-[#EE4D2D] text-white py-3 text-sm font-semibold hover:bg-[#EE4D2D]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Processing..." : "Confirm and pay"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

