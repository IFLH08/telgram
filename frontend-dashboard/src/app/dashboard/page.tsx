import { Metadata } from "next"
import { KPIs } from "@/components/dashboard/ThroughputKPI"
import { VelocityChart } from "@/components/dashboard/VelocityChart"
import { BurndownChart } from "@/components/dashboard/BurndownChart"
import { CumulativeFlowDiagram } from "@/components/dashboard/CumulativeFlowDiagram"
import { CycleTimeScatter } from "@/components/dashboard/CycleTimeScatter"
import { BugsHeatmap } from "@/components/dashboard/BugsHeatmap"
import { BacklogChart } from "@/components/dashboard/BacklogChart"
import { OkrProgress } from "@/components/dashboard/OkrProgress"

export const metadata: Metadata = {
  title: "Dashboard de Métricas Ágiles",
  description: "Visualización de métricas de rendimiento y flujo de trabajo",
}

export default function DashboardPage() {
  return (
    <div className="flex-col md:flex">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Métricas Ágiles</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Última actualización: Hoy, 11:45 AM</span>
          </div>
        </div>
        
        {/* Top KPIs Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPIs />
        </div>
        
        {/* Main Charts Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <VelocityChart />
          </div>
          <div className="col-span-3">
            <BurndownChart />
          </div>
        </div>
        
        {/* Flow & Delivery Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <CumulativeFlowDiagram />
        </div>

        {/* Third Row: Variablity and Debt */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <CycleTimeScatter />
          <BugsHeatmap />
        </div>

        {/* Bottom Row: Backlog and OKRs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <BacklogChart />
          <OkrProgress />
        </div>
      </div>
    </div>
  )
}
