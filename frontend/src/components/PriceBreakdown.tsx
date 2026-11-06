import type { PriceBreakdown as PriceData } from "../types";
import { formatINR } from "../utils/format";

export default function PriceBreakdown({ price }: { price: PriceData }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-sm">
      <dt className="text-slate-500">Original price</dt>
      <dd className="text-right">{formatINR(price.original)}</dd>

      <dt className="text-slate-500">Discount</dt>
      <dd className="text-right">
        {price.discountName ? `${price.discountName} (−${formatINR(price.discountAmount)})` : "None"}
      </dd>

      <dt className="font-medium">Amount due</dt>
      <dd className="text-right font-semibold">{formatINR(price.amountDue)}</dd>
    </dl>
  );
}