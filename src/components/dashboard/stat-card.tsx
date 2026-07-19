import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
  color?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendType = "neutral",
  color = "blue",
}: StatCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case "emerald":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/20",
          text: "text-emerald-600 dark:text-emerald-400",
          border: "border-emerald-100 dark:border-emerald-900/30",
        };
      case "amber":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/20",
          text: "text-amber-600 dark:text-amber-400",
          border: "border-amber-100 dark:border-amber-900/30",
        };
      case "purple":
        return {
          bg: "bg-purple-50 dark:bg-purple-950/20",
          text: "text-purple-600 dark:text-purple-400",
          border: "border-purple-100 dark:border-purple-900/30",
        };
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-950/20",
          text: "text-blue-600 dark:text-blue-400",
          border: "border-blue-100 dark:border-blue-900/30",
        };
    }
  };

  const colors = getColorClasses();

  return (
    <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
      {/* Background Accent Highlight */}
      <div className={`absolute top-0 left-0 w-1 h-full ${color === "emerald" ? "bg-emerald-500" : color === "amber" ? "bg-amber-500" : color === "purple" ? "bg-purple-500" : "bg-blue-500"}`} />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-xl border ${colors.bg} ${colors.border} ${colors.text} transition-transform group-hover:scale-110`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{value}</div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
          {trend && (
            <span
              className={`font-semibold ${
                trendType === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : trendType === "down"
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-zinc-500"
              }`}
            >
              {trend}
            </span>
          )}
          <span>{description}</span>
        </p>
      </CardContent>
    </Card>
  );
}
