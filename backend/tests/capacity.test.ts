import { describe, it, expect } from "vitest";
import { decideStatus, seatsTaken, EnrollmentLike, Status } from "../src/rules";

const e = (id: number, status: Status): EnrollmentLike => ({
  id, sessionId: 1, status, enrolledAt: new Date("2026-11-01T00:00:00Z"),
});

describe("seat capacity", () => {
  it("a session with a free seat confirms the person", () => {
    expect(decideStatus(4, [e(1, "confirmed")])).toBe("confirmed");
  });

  it("a full session sends the person to the waitlist", () => {
    const full = [e(1, "confirmed"), e(2, "confirmed")];
    expect(decideStatus(2, full)).toBe("waitlisted");
  });

  it("an offered seat is held, so a new person cannot take it", () => {
    expect(decideStatus(2, [e(1, "confirmed"), e(2, "offered")])).toBe("waitlisted");
  });

  it("cancelled and waitlisted people do not use a seat", () => {
    expect(seatsTaken([e(1, "cancelled"), e(2, "waitlisted"), e(3, "confirmed")])).toBe(1);
  });

  it("cancelling a confirmed seat frees it for the next enrollment", () => {
    const before = [e(1, "confirmed"), e(2, "confirmed")];
    const after = [e(1, "cancelled"), e(2, "confirmed")];
    expect(decideStatus(2, before)).toBe("waitlisted");
    expect(decideStatus(2, after)).toBe("confirmed");
  });
});