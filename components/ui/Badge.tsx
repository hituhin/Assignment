import { cn } from "@/lib/utils/cn";

type Variant = "green" | "red" | "blue" | "gray";

const map: Record<Variant, string> = {
  green: "bg-green-100 text-green-700",
  red:   "bg-red-100 text-red-700",
  blue:  "bg-blue-100 text-blue-700",
  gray:  "bg-gray-100 text-gray-600",
};

export default function Badge({ label, variant = "gray" }: { label: string; variant?: Variant }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", map[variant])}>
      {label}
    </span>
  );
}
