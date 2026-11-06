export const formatINR = (n: number | null | undefined) =>
  n == null ? "-" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const timeFmt = new Intl.DateTimeFormat("en-IN", {
  hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata",
});

export const formatTimeRange = (start: string, end: string) =>
  `${timeFmt.format(new Date(start))}–${timeFmt.format(new Date(end))}`;

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(iso));