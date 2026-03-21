import { Card, CardDescription, CardHeader, CardTitle } from '../../components'

interface ResumenTareasProps {
  tareasPendientes: number
  tareasEnProgreso: number
  tareasCompletadas: number
}

export default function ResumenTareas({
  tareasPendientes,
  tareasEnProgreso,
  tareasCompletadas,
}: ResumenTareasProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardDescription>Pendientes</CardDescription>
          <CardTitle className="mt-2 text-3xl font-bold">{tareasPendientes}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>En progreso</CardDescription>
          <CardTitle className="mt-2 text-3xl font-bold">{tareasEnProgreso}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Completadas</CardDescription>
          <CardTitle className="mt-2 text-3xl font-bold">{tareasCompletadas}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}