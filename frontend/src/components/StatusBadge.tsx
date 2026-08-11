import { cx } from "../lib/format";

const STYLES: Record<string, string> = {
  LEAD: "bg-amber-50 text-amber-700 ring-amber-600/20",
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  INACTIVE: "bg-slate-100 text-slate-600 ring-slate-500/20",
  DRAFT: "bg-slate-100 text-slate-600 ring-slate-500/20",
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-600/20",
  IN: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  OUT: "bg-rose-50 text-rose-700 ring-rose-600/20",
  LOW: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STYLES[status] ?? "bg-slate-100 text-slate-600 ring-slate-500/20"
      )}
    >
      {status}
    </span>
  );
}
