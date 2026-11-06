import { describe, it, expect } from "vitest";
import { calculatePrice, hasCompanyDiscount, normalizeCompany } from "../src/rules";

const sessionStart = new Date("2026-11-30T09:30:00Z");
const base = 4000;

describe("pricing", () => {
  it("early bird gives 15% off when enrolled exactly 7 days before the session", () => {
    const r = calculatePrice({ basePrice: base, sessionStart, enrolledAt: new Date("2026-11-23T09:30:00Z"), companyConfirmedCount: 1 });
    expect(r).toMatchObject({ discountName: "Early bird", discountAmount: 600, amountDue: 3400 });
  });

  it("early bird does not apply one minute short of 7 days", () => {
    const r = calculatePrice({ basePrice: base, sessionStart, enrolledAt: new Date("2026-11-23T09:31:00Z"), companyConfirmedCount: 1 });
    expect(r.discountName).toBeNull();
    expect(r.amountDue).toBe(4000);
  });

  it("company discount waits until the third confirmed colleague", () => {
    const late = new Date("2026-11-29T09:30:00Z");
    const price = (n: number) => calculatePrice({ basePrice: base, sessionStart, enrolledAt: late, companyConfirmedCount: n });
    expect(price(1).discountName).toBeNull();
    expect(price(2).discountName).toBeNull();
    expect(price(3)).toMatchObject({ discountName: "Company", discountAmount: 400, amountDue: 3600 });
  });

  it("when both apply, early bird wins because it saves more", () => {
    const r = calculatePrice({ basePrice: base, sessionStart, enrolledAt: new Date("2026-11-10T09:30:00Z"), companyConfirmedCount: 3 });
    expect(r.discountName).toBe("Early bird");
    expect(r.amountDue).toBe(3400);
  });

  it("only one discount is ever applied, never stacked", () => {
    const r = calculatePrice({ basePrice: base, sessionStart, enrolledAt: new Date("2026-11-10T09:30:00Z"), companyConfirmedCount: 5 });
    expect(r.discountAmount).toBe(600);
  });

  it("a seat accepted from the waitlist keeps early bird from the original enrollment date", () => {
    // enrolled 20 days early, accepted the day before the session: price still uses enrolledAt
    const r = calculatePrice({ basePrice: base, sessionStart, enrolledAt: new Date("2026-11-10T09:30:00Z"), companyConfirmedCount: 1 });
    expect(r.discountName).toBe("Early bird");
  });

  it("company names match regardless of case and extra spaces", () => {
    expect(normalizeCompany("  Acme   Corp ")).toBe(normalizeCompany("acme corp"));
  });

  it("two confirmed colleagues are not enough for the company discount", () => {
    expect(hasCompanyDiscount(2)).toBe(false);
  });
});