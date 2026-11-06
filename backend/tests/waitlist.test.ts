import { describe, it, expect } from "vitest";
import { nextToOffer, EnrollmentLike, Status } from "../src/rules";

const e = (id: number, status: Status, enrolledAt: string): EnrollmentLike => ({
  id, sessionId: 1, status, enrolledAt: new Date(enrolledAt),
});

describe("waitlist offer", () => {
  it("the person waiting longest gets the freed seat", () => {
    const list = [
      e(1, "waitlisted", "2026-11-03T10:00:00Z"),
      e(2, "waitlisted", "2026-11-01T10:00:00Z"),
      e(3, "waitlisted", "2026-11-02T10:00:00Z"),
    ];
    expect(nextToOffer(list)?.id).toBe(2);
  });

  it("two people who joined at the same moment are ordered by enrollment id", () => {
    const list = [
      e(8, "waitlisted", "2026-11-01T10:00:00Z"),
      e(5, "waitlisted", "2026-11-01T10:00:00Z"),
    ];
    expect(nextToOffer(list)?.id).toBe(5);
  });

  it("nobody is offered when the waitlist is empty", () => {
    expect(nextToOffer([e(1, "confirmed", "2026-11-01T10:00:00Z")])).toBeNull();
  });

  it("cancelled and already offered people are skipped", () => {
    const list = [
      e(1, "cancelled", "2026-11-01T10:00:00Z"),
      e(2, "offered", "2026-11-01T11:00:00Z"),
      e(3, "waitlisted", "2026-11-02T10:00:00Z"),
    ];
    expect(nextToOffer(list)?.id).toBe(3);
  });
});