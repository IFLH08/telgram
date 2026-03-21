import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components'
import { TYPO } from '../../constants/colors'
import type { Proyecto } from '../../types'

interface ProyectoConMetricas extends Proyecto {
  totalTareas: number
  tareasCompletadas: number
  tareasEnProgreso: number
  tareasPendientes: number
  porcentajeAvance: number
}

interface TarjetaProyectoProps {
  proyecto: ProyectoConMetricas
  obtenerTextoEstadoProyecto: (estado: string) => string
  obtenerVarianteEstadoProyecto: (
    estado: string
  ) => 'warning' | 'info' | 'success' | 'danger' | 'neutral'
}

export default function TarjetaProyecto({
  proyecto,
  obtenerTextoEstadoProyecto,
  obtenerVarianteEstadoProyecto,
}: TarjetaProyectoProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>{proyecto.nombre}</CardTitle>
            <CardDescription className="mt-2">
              {proyecto.descripcion || 'Sin descripción.'}
            </CardDescription>
          </div>

          <Badge variante={obtenerVarianteEstadoProyecto(String(proyecto.estado))}>
            {obtenerTextoEstadoProyecto(String(proyecto.estado))}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className={TYPO.CAPTION}>Responsable</p>
              <p className="mt-1 text-sm font-medium text-[#312D2A]">
                {proyecto.responsableNombre || 'Sin responsable'}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className={TYPO.CAPTION}>Avance</p>
              <p className="mt-1 text-sm font-medium text-[#312D2A]">
                {proyecto.porcentajeAvance}%
              </p>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className={TYPO.CAPTION}>Progreso del proyecto</p>
              <p className="text-sm font-medium text-[#312D2A]">
                {proyecto.tareasCompletadas} de {proyecto.totalTareas} tareas
              </p>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-[#C74634] transition-all"
                style={{ width: `${proyecto.porcentajeAvance}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className={TYPO.CAPTION}>Total</p>
              <p className="mt-1 text-lg font-bold text-[#312D2A]">
                {proyecto.totalTareas}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className={TYPO.CAPTION}>Completadas</p>
              <p className="mt-1 text-lg font-bold text-[#312D2A]">
                {proyecto.tareasCompletadas}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className={TYPO.CAPTION}>En progreso</p>
              <p className="mt-1 text-lg font-bold text-[#312D2A]">
                {proyecto.tareasEnProgreso}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className={TYPO.CAPTION}>Pendientes</p>
            <p className="mt-1 text-sm font-medium text-[#312D2A]">
              {proyecto.tareasPendientes} tareas pendientes
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}