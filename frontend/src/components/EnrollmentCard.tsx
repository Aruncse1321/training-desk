import type { EnrollmentRow } from "../types";
import { formatDateTime } from "../utils/format";
import PriceBreakdown from "./PriceBreakdown";
import StatusBadge from "./StatusBadge";

interface Props {
  row: EnrollmentRow;
  busy: boolean;
  onCancel: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

const btn = "rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-60";

export default function EnrollmentCard({ row, busy, onCancel, onAccept, onDecline }: Props) {
  const { status, person } = row;

  return (
    <li className="flex flex-col gap-3 p-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 md:flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{person.name}</span>
          <StatusBadge status={status} />
        </div>
        <p className="break-all text-sm text-slate-600">{person.email}</p>
        <p className="text-sm text-slate-600">{person.company}</p>
        <p className="mt-1 text-xs text-slate-500">Enrolled {formatDateTime(row.enrolledAt)}</p>
      </div>

      <div className="text-sm md:w-64">
        {status === "confirmed" && row.price && <PriceBreakdown price={row.price} />}
        {status === "waitlisted" && <p className="text-slate-600">On the waitlist. Not charged.</p>}
        {status === "offered" && (
          <p className="text-slate-600">
            Seat is held{row.offeredAt ? ` since ${formatDateTime(row.offeredAt)}` : ""}. The price is set when you accept.
          </p>
        )}
        {status === "cancelled" && <p className="text-slate-500">Cancelled. Not charged.</p>}
      </div>

      <div className="flex flex-wrap gap-2 md:w-44 md:justify-end">
        {status === "offered" && (
          <>
            <button type="button" disabled={busy} onClick={onAccept} className={`${btn} bg-indigo-600 text-white hover:bg-indigo-700`}>
              Accept seat
            </button>
            <button type="button" disabled={busy} onClick={onDecline} className={`${btn} border border-slate-300 hover:bg-slate-100`}>
              Decline
            </button>
          </>
        )}
        {(status === "confirmed" || status === "waitlisted") && (
          <button type="button" disabled={busy} onClick={onCancel} className={`${btn} border border-red-300 text-red-700 hover:bg-red-50`}>
            Cancel
          </button>
        )}
      </div>
    </li>
  );
}