const DAY_MS = 24 * 60 * 60 * 1000;
const EARLY_BIRD_PERCENT = 15;
const COMPANY_PERCENT = 10;

export interface PriceInput {
  basePrice: number;
  sessionStart: Date;
  enrolledAt: Date;            // ALWAYS the original enrollment date, even for waitlist acceptance
  companyConfirmedCount: number; // confirmed people from the company, INCLUDING this person
}

export interface PriceResult {
  originalPrice: number;
  discountName: "Early bird" | "Company" | null;
  discountPercent: number;
  discountAmount: number;
  amountDue: number;
}

export function isEarlyBird(enrolledAt: Date, sessionStart: Date): boolean {
  return sessionStart.getTime() - enrolledAt.getTime() >= 7 * DAY_MS;
}

export function hasCompanyDiscount(companyConfirmedCount: number): boolean {
  return companyConfirmedCount >= 3;
}

export function normalizeCompany(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function calculatePrice(input: PriceInput): PriceResult {
  const { basePrice, sessionStart, enrolledAt, companyConfirmedCount } = input;

  const candidates: { name: "Early bird" | "Company"; percent: number }[] = [];
  if (isEarlyBird(enrolledAt, sessionStart)) candidates.push({ name: "Early bird", percent: EARLY_BIRD_PERCENT });
  if (hasCompanyDiscount(companyConfirmedCount)) candidates.push({ name: "Company", percent: COMPANY_PERCENT });

  // only one discount: the bigger saving wins (first in the list wins a tie)
  const winner = candidates.sort((a, b) => b.percent - a.percent)[0];

  if (!winner) {
    return { originalPrice: basePrice, discountName: null, discountPercent: 0, discountAmount: 0, amountDue: basePrice };
  }
  const discountAmount = Math.round((basePrice * winner.percent) / 100);
  return {
    originalPrice: basePrice,
    discountName: winner.name,
    discountPercent: winner.percent,
    discountAmount,
    amountDue: basePrice - discountAmount,
  };
}