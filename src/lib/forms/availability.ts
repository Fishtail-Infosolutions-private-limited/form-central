import { prisma } from "@/lib/db/prisma";
import { formatNepalDateTime, isPastDeadline } from "@/lib/utils/timezone";
import { FormStatus, Prisma } from "@prisma/client";

export type FormAvailabilityStatus =
  | "OPEN"
  | "UNPUBLISHED"
  | "CLOSED"
  | "NOT_OPEN_YET"
  | "DEADLINE_PASSED"
  | "CAPACITY_FULL";

export interface FormAvailabilityResult {
  isAvailable: boolean;
  status: FormAvailabilityStatus;
  headline: string;
  message: string;
  currentSubmissions: number;
  maxParticipants: number | null;
  isUnlimited: boolean;
  formattedDeadline: string | null;
}

export type CheckableForm = {
  id: string;
  name: string;
  status: FormStatus | string;
  opensAt?: Date | null;
  closesAt?: Date | null;
  isUnlimitedCapacity?: boolean;
  maxParticipants?: number | null;
  isDeadlineEnabled?: boolean;
  registrationDeadline?: Date | null;
};

/**
 * Centralized, reusable logic to evaluate whether a registration form is accepting new submissions.
 * Enforces:
 * 1. Published status
 * 2. Not manually closed
 * 3. Schedule / opensAt
 * 4. Registration deadline (Nepal Time UTC+05:45)
 * 5. Maximum participant capacity
 */
export async function checkFormAvailability(
  form: CheckableForm,
  tx?: Prisma.TransactionClient
): Promise<FormAvailabilityResult> {
  const db = tx || prisma;

  // 1. Check publication and manual closure
  if (form.status === FormStatus.CLOSED) {
    return {
      isAvailable: false,
      status: "CLOSED",
      headline: "Registration Closed",
      message: "Registration for this event has been closed by the event administrator.",
      currentSubmissions: 0,
      maxParticipants: form.maxParticipants ?? null,
      isUnlimited: Boolean(form.isUnlimitedCapacity),
      formattedDeadline: form.registrationDeadline ? formatNepalDateTime(form.registrationDeadline) : null,
    };
  }

  if (form.status !== FormStatus.PUBLISHED) {
    return {
      isAvailable: false,
      status: "UNPUBLISHED",
      headline: "Registration Unavailable",
      message: "This registration form is currently unpublished or in draft status.",
      currentSubmissions: 0,
      maxParticipants: form.maxParticipants ?? null,
      isUnlimited: Boolean(form.isUnlimitedCapacity),
      formattedDeadline: form.registrationDeadline ? formatNepalDateTime(form.registrationDeadline) : null,
    };
  }

  const now = new Date();

  // 2. Check opening schedule (if configured)
  if (form.opensAt && form.opensAt > now) {
    return {
      isAvailable: false,
      status: "NOT_OPEN_YET",
      headline: "Registration Opening Soon",
      message: `Registration for this event has not yet opened. It opens on ${formatNepalDateTime(form.opensAt)}.`,
      currentSubmissions: 0,
      maxParticipants: form.maxParticipants ?? null,
      isUnlimited: Boolean(form.isUnlimitedCapacity),
      formattedDeadline: form.registrationDeadline ? formatNepalDateTime(form.registrationDeadline) : null,
    };
  }

  // 3. Check Registration Deadline (Nepal Time)
  const effectiveDeadline = form.isDeadlineEnabled ? form.registrationDeadline : form.closesAt;
  if (form.isDeadlineEnabled && effectiveDeadline && isPastDeadline(effectiveDeadline)) {
    return {
      isAvailable: false,
      status: "DEADLINE_PASSED",
      headline: "Registration Closed",
      message: "Registration for this event has closed. The registration deadline has passed.",
      currentSubmissions: 0,
      maxParticipants: form.maxParticipants ?? null,
      isUnlimited: Boolean(form.isUnlimitedCapacity),
      formattedDeadline: formatNepalDateTime(effectiveDeadline),
    };
  }

  // Fallback check for legacy closesAt if configured
  if (form.closesAt && isPastDeadline(form.closesAt)) {
    return {
      isAvailable: false,
      status: "DEADLINE_PASSED",
      headline: "Registration Closed",
      message: "Registration for this event has closed. The registration deadline has passed.",
      currentSubmissions: 0,
      maxParticipants: form.maxParticipants ?? null,
      isUnlimited: Boolean(form.isUnlimitedCapacity),
      formattedDeadline: formatNepalDateTime(form.closesAt),
    };
  }

  // 4. Count successful submissions for capacity check
  const currentCount = await db.registrationSubmission.count({
    where: { formId: form.id },
  });

  const isLimited = form.isUnlimitedCapacity === false && typeof form.maxParticipants === "number" && form.maxParticipants > 0;

  if (isLimited && currentCount >= (form.maxParticipants as number)) {
    return {
      isAvailable: false,
      status: "CAPACITY_FULL",
      headline: "Event Registration Full",
      message: "Sorry, registration for this event is full. The maximum number of participants has been reached.",
      currentSubmissions: currentCount,
      maxParticipants: form.maxParticipants ?? null,
      isUnlimited: false,
      formattedDeadline: form.registrationDeadline ? formatNepalDateTime(form.registrationDeadline) : null,
    };
  }

  return {
    isAvailable: true,
    status: "OPEN",
    headline: "Registration Open",
    message: "Registration is active and accepting participant submissions.",
    currentSubmissions: currentCount,
    maxParticipants: form.maxParticipants ?? null,
    isUnlimited: !isLimited,
    formattedDeadline: form.registrationDeadline ? formatNepalDateTime(form.registrationDeadline) : null,
  };
}
