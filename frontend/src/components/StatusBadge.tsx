import type { Status } from "../types";

const styles: Record<Status, string> = {
  confirmed: "bg-green-100 text-green-800",
  waitlisted: "bg-amber-100 text-amber-800",
  offered: "bg-blue-100 text-blue-800",
  cancelled: "bg-slate-200 text-slate-600",
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}