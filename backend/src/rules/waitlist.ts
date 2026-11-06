import { EnrollmentLike } from "./types";

// longest waiting = earliest enrolledAt; id breaks ties
export function nextToOffer(enrollments: EnrollmentLike[]): EnrollmentLike | null {
  const waiting = enrollments
    .filter((e) => e.status === "waitlisted")
    .sort((a, b) => a.enrolledAt.getTime() - b.enrolledAt.getTime() || a.id - b.id);
  return waiting[0] ?? null;
}