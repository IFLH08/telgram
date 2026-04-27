import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function OkrProgress() {
  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>Avance de OKRs</CardTitle>
        <CardDescription>Progreso vs Objetivo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="font-medium">Reducir Lead Time a 10 días</div>
            <div className="text-muted-foreground">75% (Actual: 14.5d)</div>
          </div>
          <Progress value={75} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="font-medium">Aumentar Velocity a 40 pts</div>
            <div className="text-muted-foreground">80% (Actual: 32pts)</div>
          </div>
          <Progress value={80} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="font-medium">Cero Bugs Críticos en Prod</div>
            <div className="text-muted-foreground">60% (Actual: 3)</div>
          </div>
          {/* Using custom color for progress */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-primary/20">
            <div className="h-full bg-orange-500 transition-all" style={{ width: "60%" }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
