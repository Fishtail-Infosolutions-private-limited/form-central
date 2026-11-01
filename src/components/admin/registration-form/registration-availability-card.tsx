"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Loader2,
  Save,
  Info,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateSiteSettingsAction } from "@/server/actions/site-settings-actions";

interface RegistrationAvailabilityCardProps {
  siteSetting: any;
  onSaved?: (newSettings: any) => void;
}

export function RegistrationAvailabilityCard({
  siteSetting,
  onSaved,
}: RegistrationAvailabilityCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(siteSetting?.isRegistrationOpen ?? true);

  // Dates formatted for datetime-local input
  const [openDate, setOpenDate] = useState<string>(
    siteSetting?.registrationOpeningDate
      ? new Date(siteSetting.registrationOpeningDate).toISOString().slice(0, 16)
      : ""
  );
  const [closeDate, setCloseDate] = useState<string>(
    siteSetting?.registrationClosingDate
      ? new Date(siteSetting.registrationClosingDate).toISOString().slice(0, 16)
      : ""
  );

  // Compute effective status
  const now = new Date();
  const openingDateTime = openDate ? new Date(openDate) : null;
  const closingDateTime = closeDate ? new Date(closeDate) : null;

  let effectiveStatus: "OPEN" | "NOT_OPEN_YET" | "DEADLINE_PASSED" | "MANUALLY_CLOSED" = "OPEN";
  let statusBadgeText = "Registration Open & Accepting Entries";
  let badgeColorClass = "bg-[#F4F7FA] text-[#263238] border-warm-stone";

  if (!isOpen) {
    effectiveStatus = "MANUALLY_CLOSED";
    statusBadgeText = "Registration Manually Closed by Admin";
    badgeColorClass = "bg-rose-50 text-rose-700 border-rose-200";
  } else if (openingDateTime && now < openingDateTime) {
    effectiveStatus = "NOT_OPEN_YET";
    statusBadgeText = `Scheduled: Opens on ${openingDateTime.toLocaleDateString("en-US", { timeZone: "Asia/Kathmandu" })}`;
    badgeColorClass = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (closingDateTime && now > closingDateTime) {
    effectiveStatus = "DEADLINE_PASSED";
    statusBadgeText = `Registration Closed: Passed ${closingDateTime.toLocaleDateString("en-US", { timeZone: "Asia/Kathmandu" })}`;
    badgeColorClass = "bg-rose-50 text-rose-700 border-rose-200";
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateSiteSettingsAction({
        isRegistrationOpen: isOpen,
        registrationOpeningDate: openDate ? new Date(openDate) : null,
        registrationClosingDate: closeDate ? new Date(closeDate) : null,
      });

      if (res.success) {
        toast.success("Registration availability settings saved!");
        if (onSaved && res.setting) {
          onSaved(res.setting);
        }
      } else {
        toast.error(res.error || "Failed to update availability");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-[#DCE5ED] bg-white shadow-xs">
      <CardHeader className="pb-3 border-b border-[#DCE5ED]/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-bold text-[#263238] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-dark-taupe" />
              <span>Registration Availability &amp; Automated Timeline</span>
            </CardTitle>
            <CardDescription className="text-xs text-taupe-grey">
              Control when public candidates can begin and finish submitting applications.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badgeColorClass}`}
            >
              {effectiveStatus === "OPEN" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : effectiveStatus === "NOT_OPEN_YET" ? (
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-rose-600" />
              )}
              <span>{statusBadgeText}</span>
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl border border-[#DCE5ED] bg-[#F4F7FA]">
          <div>
            <span className="text-xs font-bold text-[#263238] block">Master Registration Switch</span>
            <span className="text-[11px] text-taupe-grey">
              Instantly toggle candidate registration open or closed across all public routes.
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isOpen ? (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Accepting Submissions
              </span>
            ) : (
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Closed
              </span>
            )}
            <button
              type="button"
              role="switch"
              aria-checked={isOpen}
              onClick={() => setIsOpen(!isOpen)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 border transition-colors duration-200 ease-in-out focus:outline-none ${
                isOpen ? "bg-[#183153] border-[#183153]" : "bg-slate-300 border-slate-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isOpen ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#183153] flex items-center justify-between">
              <span>Opening Date &amp; Time</span>
              <span className="text-[10px] text-[#546E7A]">Nepal Time (UTC+05:45)</span>
            </Label>
            <Input
              type="datetime-local"
              value={openDate}
              onChange={(e) => setOpenDate(e.target.value)}
              className="h-9 text-xs border-[#DCE5ED] bg-white font-mono"
            />
            <p className="text-[11px] text-[#546E7A]">
              Before this date, prospective participants cannot submit registration.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#183153] flex items-center justify-between">
              <span>Closing Deadline</span>
              <span className="text-[10px] text-[#546E7A]">Nepal Time (UTC+05:45)</span>
            </Label>
            <Input
              type="datetime-local"
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
              className="h-9 text-xs border-[#DCE5ED] bg-white font-mono"
            />
            <p className="text-[11px] text-[#546E7A]">
              Leave blank to keep registration open indefinitely until manually toggled off.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#DCE5ED]/50">
          <p className="text-[11px] text-[#546E7A] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#356FA8] shrink-0" />
            <span>
              Existing registered candidates can continue checking application status even after closure.
            </span>
          </p>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 bg-[#183153] hover:bg-[#12243D] text-white text-xs h-9 px-4 font-bold shadow-xs"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save Availability</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


