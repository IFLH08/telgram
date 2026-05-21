import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, TrendingUp } from "lucide-react"

type ThroughputKPIProps = {
  title: string
  value: number | string
  trend?: number
}

export function ThroughputKPI({ title, value, trend = 0 }: ThroughputKPIProps) {
  const isPositive = trend >= 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={isPositive ? "text-xs text-emerald-600" : "text-xs text-red-600"}>
          {isPositive ? "+" : ""}
          {trend}% desde el periodo anterior
        </p>
      </CardContent>
    </Card>
  )
}
