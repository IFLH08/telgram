import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { bugsByModule } from "@/lib/mock-metrics"

export function BugsHeatmap() {
  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>Bugs por Módulo</CardTitle>
        <CardDescription>Mapa de calor de problemas reportados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2 text-sm text-center">
          <div className="font-semibold text-muted-foreground">Módulo</div>
          <div className="font-semibold text-muted-foreground">Crítico</div>
          <div className="font-semibold text-muted-foreground">Alto</div>
          <div className="font-semibold text-muted-foreground">Medio</div>
          
          {bugsByModule.map((item) => (
            <div key={item.module} className="contents">
              <div className="flex items-center text-left text-sm font-medium border-b border-border/50 py-2">
                {item.module}
              </div>
              <div 
                className={`flex items-center justify-center p-2 rounded-md ${item.critical > 0 ? 'bg-red-500/80 text-white font-bold' : 'bg-muted/30'}`}
              >
                {item.critical}
              </div>
              <div 
                className={`flex items-center justify-center p-2 rounded-md ${item.high > 2 ? 'bg-orange-500/80 text-white' : item.high > 0 ? 'bg-orange-500/50 text-white' : 'bg-muted/30'}`}
              >
                {item.high}
              </div>
              <div 
                className={`flex items-center justify-center p-2 rounded-md ${item.medium > 4 ? 'bg-yellow-500/80 text-white' : item.medium > 0 ? 'bg-yellow-500/50 text-white' : 'bg-muted/30'}`}
              >
                {item.medium}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
