"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Clock,
  Compass,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface DatesVenueTabProps {
  data: {
    grandFinaleDate: string; // YYYY-MM-DD
    grandFinaleTime: string;
    auditionDate: string;    // YYYY-MM-DD
    auditionTime: string;
    eventSchedule: string;
    dateInstructions: string;
    eventVenue: string;
    venueAddress: string;
    venueCity: string;
    venueDirections: string;
    venueInstructions: string;
    registrationOpeningDate?: string; // YYYY-MM-DD
    registrationClosingDate?: string; // YYYY-MM-DD
    isRegistrationOpen?: boolean;
  };
  onChange: (updates: Partial<DatesVenueTabProps["data"]>) => void;
}

export function DatesVenueTab({ data, onChange }: DatesVenueTabProps) {
  const isFinaleSet = Boolean(data.grandFinaleDate);
  const isAuditionSet = Boolean(data.auditionDate);
  const isVenueSet = Boolean(data.eventVenue && data.eventVenue.trim().toLowerCase() !== "to be announced");
  const isRegOpen = data.isRegistrationOpen ?? true;
  const isRegOpeningSet = Boolean(data.registrationOpeningDate);
  const isRegClosingSet = Boolean(data.registrationClosingDate);

  return (
    <div className="space-y-6">
      {/* Live Status Summary Banner */}
      <div className="p-4 rounded-xl border border-[var(--color-brand-border,#DCD8D1)] bg-[var(--color-brand-surface,#F3F1ED)]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-text,#292824)]">
              Public Schedule & Venue Presentation
            </span>
          </div>
          <p className="text-xs text-[var(--color-brand-muted,#8A8580)]">
            When dates or venues are not yet locked in, our public pages cleanly indicate{" "}
            <span className="font-semibold text-[var(--color-brand-text,#292824)]">"To Be Announced"</span> or{" "}
            <span className="font-semibold text-[var(--color-brand-text,#292824)]">"Opening Soon"</span> to ensure professional transparency.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold border ${
              !isRegOpen
                ? "bg-rose-50 text-rose-800 border-rose-300"
                : isRegClosingSet
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : isRegOpeningSet
                ? "bg-amber-50 text-amber-800 border-amber-300"
                : "bg-blue-50 text-blue-800 border-blue-300"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              Registration:{" "}
              {!isRegOpen
                ? "Closed"
                : isRegClosingSet
                ? `Closes ${data.registrationClosingDate}`
                : isRegOpeningSet
                ? `Starts ${data.registrationOpeningDate}`
                : "Soon"}
            </span>
          </span>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold border ${
              isFinaleSet
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-amber-50 text-amber-800 border-amber-300"
            }`}
          >
            {isFinaleSet ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            <span>Finale: {isFinaleSet ? data.grandFinaleDate : "To Be Announced"}</span>
          </span>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold border ${
              isVenueSet
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-amber-50 text-amber-800 border-amber-300"
            }`}
          >
            {isVenueSet ? <CheckCircle2 className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
            <span>Venue: {isVenueSet ? data.eventVenue : "To Be Announced"}</span>
          </span>
        </div>
      </div>

      {/* Online Registration Window Card */}
      <Card className="border-[var(--color-brand-border,#DCD8D1)] bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-[var(--color-brand-border,#DCD8D1)]/60 bg-[var(--color-brand-surface,#F3F1ED)]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-[#183153] text-white flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#356FA8]" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-[var(--color-brand-text,#292824)]">
                  Online Registration Window
                </CardTitle>
                <CardDescription className="text-xs text-[var(--color-brand-muted,#8A8580)]">
                  Controls the live registration banner, deadline countdown, and public candidate entry status.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
                {isRegOpen ? "Registrations Active" : "Registrations Paused"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isRegOpen}
                onClick={() => onChange({ isRegistrationOpen: !isRegOpen })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  isRegOpen ? "bg-[#183153]" : "bg-warm-stone"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isRegOpen ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)] flex items-center justify-between">
                <span>Registration Opening Date</span>
                <span className="text-[10px] text-[var(--color-brand-muted,#8A8580)]">If unset, displays "Soon"</span>
              </Label>
              <Input
                type="date"
                value={data.registrationOpeningDate || ""}
                onChange={(e) => onChange({ registrationOpeningDate: e.target.value })}
                className="h-10 text-xs font-mono border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[#183153]"
              />
              <p className="text-[11px] text-[var(--color-brand-muted,#8A8580)]">
                If in the future, homepage indicates <strong>"Starts [Date]"</strong>.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)] flex items-center justify-between">
                <span>Registration Closing Date (Deadline)</span>
                <span className="text-[10px] text-[var(--color-brand-muted,#8A8580)]">Official deadline</span>
              </Label>
              <Input
                type="date"
                value={data.registrationClosingDate || ""}
                onChange={(e) => onChange({ registrationClosingDate: e.target.value })}
                className="h-10 text-xs font-mono border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[#183153]"
              />
              <p className="text-[11px] text-[var(--color-brand-muted,#8A8580)]">
                When set, homepage displays <strong>"Official Online Registrations Are Currently Open &bull; Deadline: [Date]"</strong>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grand Finale & Audition Dates Card */}
      <Card className="border-[var(--color-brand-border,#DCD8D1)] bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-[var(--color-brand-border,#DCD8D1)]/60 bg-[var(--color-brand-surface,#F3F1ED)]/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[var(--color-brand-primary,#5C5751)] text-white flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <CardTitle className="text-base font-serif font-bold text-[var(--color-brand-text,#292824)]">
                Key Event Dates & Times
              </CardTitle>
              <CardDescription className="text-xs text-[var(--color-brand-muted,#8A8580)]">
                Grand Finale ceremony and physical audition rounds in Nepal Time (UTC+05:45).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          {/* Grand Finale */}
          <div className="p-4 rounded-lg border border-[var(--color-brand-border,#DCD8D1)] bg-[var(--color-brand-surface,#F3F1ED)]/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color-brand-text,#292824)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Grand Finale Ceremony</span>
              </span>
              {!isFinaleSet && (
                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Unset &bull; Shows "To Be Announced"
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
                  Grand Finale Date
                </Label>
                <Input
                  type="date"
                  value={data.grandFinaleDate}
                  onChange={(e) => onChange({ grandFinaleDate: e.target.value })}
                  className="h-10 text-xs font-mono border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
                  Grand Finale Time / Slot
                </Label>
                <Input
                  value={data.grandFinaleTime}
                  onChange={(e) => onChange({ grandFinaleTime: e.target.value })}
                  placeholder="e.g. 1:00 PM onwards or Gates open 11:30 AM"
                  className="h-10 text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
                />
              </div>
            </div>
          </div>

          {/* Audition Rounds */}
          <div className="p-4 rounded-lg border border-[var(--color-brand-border,#DCD8D1)] bg-[var(--color-brand-surface,#F3F1ED)]/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color-brand-text,#292824)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--color-brand-muted,#8A8580)]" />
                <span>Physical Auditions / Screening Round</span>
              </span>
              {!isAuditionSet && (
                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Unset &bull; Shows "To Be Announced"
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
                  Audition Date
                </Label>
                <Input
                  type="date"
                  value={data.auditionDate}
                  onChange={(e) => onChange({ auditionDate: e.target.value })}
                  className="h-10 text-xs font-mono border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
                  Audition Time / Shift
                </Label>
                <Input
                  value={data.auditionTime}
                  onChange={(e) => onChange({ auditionTime: e.target.value })}
                  placeholder="e.g. 10:00 AM - 4:00 PM (Batch-wise slots)"
                  className="h-10 text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
                />
              </div>
            </div>
          </div>

          {/* General Schedule Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
                General Public Schedule Text
              </Label>
              <Input
                value={data.eventSchedule}
                onChange={(e) => onChange({ eventSchedule: e.target.value })}
                placeholder="To Be Announced (e.g. Spring 2026 / Baishakh 2083)"
                className="h-10 text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
              <p className="text-[11px] text-[var(--color-brand-muted,#8A8580)]">
                Displayed in the public bulletin bar and navigation pills.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
                Date Instructions / Rescheduling Notes
              </Label>
              <Input
                value={data.dateInstructions}
                onChange={(e) => onChange({ dateInstructions: e.target.value })}
                placeholder="Exact time slots will be messaged to verified participants."
                className="h-10 text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Venue & Location Card */}
      <Card className="border-[var(--color-brand-border,#DCD8D1)] bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-[var(--color-brand-border,#DCD8D1)]/60 bg-[var(--color-brand-surface,#F3F1ED)]/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[var(--color-brand-primary,#5C5751)] text-white flex items-center justify-center">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <CardTitle className="text-base font-serif font-bold text-[var(--color-brand-text,#292824)]">
                Venue & Geographic Location
              </CardTitle>
              <CardDescription className="text-xs text-[var(--color-brand-muted,#8A8580)]">
                Auditorium name, physical address, and participant arrival directions.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
                Venue Name / Hall
              </Label>
              <Input
                value={data.eventVenue}
                onChange={(e) => onChange({ eventVenue: e.target.value })}
                placeholder="To Be Announced (or e.g. Janakpur Town Hall)"
                className="h-10 text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
              <p className="text-[11px] text-[var(--color-brand-muted,#8A8580)]">
                Leave as "To Be Announced" if venue contract is not yet finalized.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
                City / Location
              </Label>
              <Input
                value={data.venueCity}
                onChange={(e) => onChange({ venueCity: e.target.value })}
                placeholder="Janakpur Dham, Nepal"
                className="h-10 text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
              Venue Physical Address
            </Label>
            <Input
              value={data.venueAddress}
              onChange={(e) => onChange({ venueAddress: e.target.value })}
              placeholder="e.g. Near Janaki Mandir Road, Ward No. 4, Janakpur Dham, Madhesh Province"
              className="h-10 text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[var(--color-brand-muted,#8A8580)]" />
                <span>Directions & Landmarks</span>
              </Label>
              <Textarea
                value={data.venueDirections}
                onChange={(e) => onChange({ venueDirections: e.target.value })}
                placeholder="e.g. 5 minutes walk from Ramanand Chowk. Landmark: opposite District Post Office."
                rows={3}
                className="text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)] resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[var(--color-brand-muted,#8A8580)]" />
                <span>Venue Notes & Entry Instructions</span>
              </Label>
              <Textarea
                value={data.venueInstructions}
                onChange={(e) => onChange({ venueInstructions: e.target.value })}
                placeholder="e.g. Bring your official Registration ID and citizen identity card for entry gate check."
                rows={3}
                className="text-xs border-[var(--color-brand-border,#DCD8D1)] focus-visible:ring-[var(--color-brand-primary,#5C5751)] resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

