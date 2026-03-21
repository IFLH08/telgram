import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components'

interface EstadoGeneralCardProps {
  pendientes: number
  enProgreso: number
  completadas: number
  bloqueadas: number
}

export default function EstadoGeneralCard({
  pendientes,
  enProgreso,
  completadas,
  bloqueadas,
}: EstadoGeneralCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado general</CardTitle>
        <CardDescription>Distribución de tareas según su estatus.</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <Badge variante="warning">Pendiente</Badge>
            </div>
            <p className="text-sm font-semibold text-[#312D2A]">{pendientes}</p>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <Badge variante="info">En progreso</Badge>
            </div>
            <p className="text-sm font-semibold text-[#312D2A]">{enProgreso}</p>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <Badge variante="success">Completada</Badge>
            </div>
            <p className="text-sm font-semibold text-[#312D2A]">{completadas}</p>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <Badge variante="danger">Bloqueada</Badge>
            </div>
            <p className="text-sm font-semibold text-[#312D2A]">{bloqueadas}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}