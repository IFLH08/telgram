"use client"

import { Scatter, ScatterChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ZAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { leadAndCycleTime } from "@/lib/mock-metrics"

export function CycleTimeScatter() {
  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>Distribución de Cycle Time vs Lead Time</CardTitle>
        <CardDescription>Muestra variabilidad en la entrega (días)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="leadTime" name="Lead Time" unit="d" axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis type="number" dataKey="cycleTime" name="Cycle Time" unit="d" axisLine={false} tickLine={false} tickMargin={10} />
              <ZAxis type="category" dataKey="id" name="Task ID" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend iconType="circle" />
              <Scatter name="Tareas" data={leadAndCycleTime} fill="hsl(var(--chart-1))" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
