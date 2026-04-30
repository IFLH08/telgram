"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { burndownData } from "@/lib/mock-metrics"

export function BurndownChart() {
  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>Burndown Chart (Sprint Actual)</CardTitle>
        <CardDescription>Progreso diario vs tendencia ideal</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={burndownData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} tickMargin={10} />
              <Tooltip />
              <Legend iconType="circle" />
              <Line 
                type="monotone" 
                dataKey="ideal" 
                name="Línea Ideal" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
                dot={false} 
              />
              <Line 
                type="monotone" 
                dataKey="remaining" 
                name="Restantes" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={3} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
