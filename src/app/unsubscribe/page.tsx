"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Trophy, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  let decodedEmail = "";
  if (token) {
    try {
      const decoded = atob(token.replace(/-/g, "+").replace(/_/g, "/"));
      decodedEmail = decoded.split(":")[0] || "";
    } catch {
      decodedEmail = "";
    }
  }

  const handleUnsubscribe = async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to update email preferences.");
      }
    } catch (e: any) {
      setStatus("error");
      setErrorMessage(e.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-zinc-200 p-8 text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-[#292821] text-white flex items-center justify-center mx-auto shadow-md">
          <Trophy className="w-6 h-6 text-[#B69A65]" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-[#292821]">Email Preferences</h1>
          <p className="text-xs text-[#292821]/60 mt-1">
            Manage your announcement subscription for The Origin Foundation.
          </p>
        </div>

        {status === "idle" && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600">
              {decodedEmail ? (
                <>
                  Are you sure you want to unsubscribe <strong>{decodedEmail}</strong> from promotional event announcements and updates?
                </>
              ) : (
                "Are you sure you want to unsubscribe from non-essential promotional communications?"
              )}
            </p>
            <p className="text-xs text-zinc-400">
              Note: You will still receive critical transactional notices regarding your registered entries (such as OTP codes and registration receipts).
            </p>
            <Button
              onClick={handleUnsubscribe}
              className="w-full bg-[#292821] hover:bg-[#3C332A] text-white font-bold h-10 text-xs rounded-xl"
            >
              Confirm Unsubscribe
            </Button>
          </div>
        )}

        {status === "loading" && (
          <div className="py-6 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-[#B69A65] animate-spin" />
            <p className="text-xs text-zinc-500">Updating your email preferences...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 py-4">
            <div className="w-10 h-10 rounded-full bg-[#FAF5EE] text-[#B69A65] flex items-center justify-center mx-auto border border-[#E8DFD0]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-[#292821]">Successfully Unsubscribed</h2>
            <p className="text-xs text-zinc-500">
              Your email preferences have been recorded. You will no longer receive non-essential announcement campaigns from this event organizer.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 py-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-[#A64B36] flex items-center justify-center mx-auto border border-rose-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-[#292821]">Unable to Process Request</h2>
            <p className="text-xs text-[#A64B36]">{errorMessage || "Invalid or expired token."}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#B69A65] animate-spin" />
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}

