import { SessionLike } from "./types";

type Range = Pick<SessionLike, "startsAt" | "endsAt">;

export function overlaps(a: Range, b: Range): boolean {
  return a.startsAt < b.endsAt && b.startsAt < a.endsAt;
}

// confirmedSessions = sessions where this person already has a CONFIRMED seat
export function findClash(target: SessionLike, confirmedSessions: SessionLike[]): SessionLike | null {
  return confirmedSessions.find((s) => s.id !== target.id && overlaps(s, target)) ?? null;
}