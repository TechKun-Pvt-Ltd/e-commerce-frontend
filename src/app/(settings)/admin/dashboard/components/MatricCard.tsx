import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  className?: string;
}

export function MetricCard({ title, value, change, changeLabel, icon, iconColor, className }: MetricCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card className={cn("bg-white border border-gray-200 shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon && (
          <div className={cn("p-2 rounded-full", iconColor || "bg-gray-100 text-gray-600")}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        {change !== undefined && (
          <p className="text-xs text-gray-500">
            <span
              className={cn(
                "font-medium",
                isPositive && "text-green-600",
                isNegative && "text-red-600"
              )}
            >
              {isPositive ? "+" : ""}{change}%
            </span>{" "}
            {changeLabel || "from last month"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}