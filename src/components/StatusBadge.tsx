interface Props {
  status: "ok" | "warning" | "overdue" | "expired" | "expiring" | "none" | "valid" | "low";
  label: string;
}

const config = {
  ok: "bg-green-100 text-green-700 border-green-200",
  valid: "bg-green-100 text-green-700 border-green-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  expiring: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-amber-100 text-amber-700 border-amber-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
  expired: "bg-red-100 text-red-700 border-red-200",
  none: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function StatusBadge({ status, label }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config[status]}`}>
      {label}
    </span>
  );
}
