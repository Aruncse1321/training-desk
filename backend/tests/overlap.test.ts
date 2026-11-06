import { describe, it, expect } from "vitest";
import { findClash, overlaps } from "../src/rules";
import { SessionLike } from "../src/rules";

const s = (id: number, name: string, start: string, end: string): SessionLike => ({
  id, name, capacity: 5, price: 1000,
  startsAt: new Date(`2026-11-30T${start}:00Z`),
  endsAt: new Date(`2026-11-30T${end}:00Z`),
});

const html = s(1, "HTML and CSS", "09:00", "11:00");
const react = s(2, "React", "09:30", "12:00");
const testing = s(3, "Testing", "13:00", "15:00");
const design = s(4, "System design", "15:30", "17:30");

describe("session clash", () => {
  it("React clashes with HTML and CSS because it starts before HTML ends", () => {
    expect(overlaps(html, react)).toBe(true);
  });

  it("names the confirmed session that clashes", () => {
    expect(findClash(react, [html])?.name).toBe("HTML and CSS");
  });

  it("sessions that end exactly when the next starts do not clash", () => {
    const a = s(5, "A", "09:00", "11:00");
    const b = s(6, "B", "11:00", "12:00");
    expect(overlaps(a, b)).toBe(false);
  });

  it("no clash when the person has no confirmed seats", () => {
    expect(findClash(react, [])).toBeNull();
  });

  it("Testing and System design never clash", () => {
    expect(findClash(design, [testing])).toBeNull();
  });

  it("a session is never a clash with itself", () => {
    expect(findClash(react, [react])).toBeNull();
  });
});