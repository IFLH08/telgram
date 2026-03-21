import { Card, CardDescription, CardHeader, CardTitle } from '../../components'

interface ResumenProyectosProps {
  totalProyectos: number
  proyectosEnProgreso: number
  proyectosCompletados: number
}

export default function ResumenProyectos({
  totalProyectos,
  proyectosEnProgreso,
  proyectosCompletados,
}: ResumenProyectosProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardDescription>Total de proyectos</CardDescription>
          <CardTitle className="mt-2 text-3xl font-bold">{totalProyectos}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>En progreso</CardDescription>
          <CardTitle className="mt-2 text-3xl font-bold">{proyectosEnProgreso}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Completados</CardDescription>
          <CardTitle className="mt-2 text-3xl font-bold">{proyectosCompletados}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}