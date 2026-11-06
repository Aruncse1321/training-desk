import { EnrollmentLike } from "./types";

// confirmed and offered both hold a seat
export function seatsTaken(enrollments: EnrollmentLike[]): number {
  return enrollments.filter((e) => e.status === "confirmed" || e.status === "offered").length;
}

export function hasFreeSeat(capacity: number, enrollments: EnrollmentLike[]): boolean {
  return seatsTaken(enrollments) < capacity;
}

export function decideStatus(capacity: number, enrollments: EnrollmentLike[]): "confirmed" | "waitlisted" {
  return hasFreeSeat(capacity, enrollments) ? "confirmed" : "waitlisted";
}