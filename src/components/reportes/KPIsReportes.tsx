import { Card, CardDescription, CardHeader, CardTitle } from '../../components'

interface KPIsReportesProps {
  totalTareas: number
  completadas: number
  enProgreso: number
  horasEstimadas: number
  horasReales: number
  cumplimiento: number
}

export default function KPIsReportes({
  totalTareas,
  completadas,
  enProgreso,
  horasEstimadas,
  horasReales,
  cumplimiento,
}: KPIsReportesProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
      <Card>
        <CardHeader>
          <CardDescription>Total de tareas</CardDescription>
          <CardTitle className="mt-2 text-3xl font-bold">{totalTareas}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Completadas</CardDescription>
          <CardTitle className="mt-2 text-3xl font-bold">{completadas}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>En progreso</CardDescription>
          <CardTitle className="mt-2 text-3xl font-bold">{enProgreso}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Horas estimadas</CardDescription>
          <CardTitle className="mt-2 text-3xl font-bold">{horasEstimadas}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Horas reales</CardDescription>
          <CardTitle className="mt-2 text-3xl font-bold">{horasReales}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Cumplimiento</CardDescription>
          <CardTitle className="mt-2 text-3xl font-bold">{cumplimiento}%</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}