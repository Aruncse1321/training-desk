export type Status = "confirmed" | "waitlisted" | "offered" | "cancelled";

export interface SessionLike {
  id: number;
  name: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  price: number;
}

export interface EnrollmentLike {
  id: number;
  sessionId: number;
  status: Status;
  enrolledAt: Date;
}