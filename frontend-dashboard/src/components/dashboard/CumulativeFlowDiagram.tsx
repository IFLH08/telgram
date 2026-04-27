"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cfdData } from "@/lib/mock-metrics"

export function CumulativeFlowDiagram() {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Diagrama de Flujo Acumulado (CFD)</CardTitle>
        <CardDescription>Visualización de cuellos de botella por bandas de color</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cfdData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} tickMargin={10} />
              <Tooltip />
              <Legend iconType="circle" />
              <Area type="monotone" dataKey="done" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" name="Done" />
              <Area type="monotone" dataKey="review" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" name="Review" />
              <Area type="monotone" dataKey="inProgress" stackId="1" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" name="In Progress" />
              <Area type="monotone" dataKey="backlog" stackId="1" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" name="Backlog" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
