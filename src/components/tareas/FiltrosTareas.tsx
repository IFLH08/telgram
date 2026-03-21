import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components'
import { SELECT, cx } from '../../constants/colors'
import type { EstadoTarea, PrioridadTarea } from '../../types'

type EstadoFiltro = 'todos' | EstadoTarea
type PrioridadFiltro = 'todas' | PrioridadTarea

interface FiltrosTareasProps {
  busquedaTarea: string
  onCambiarBusquedaTarea: (valor: string) => void
  busquedaResponsable: string
  onCambiarBusquedaResponsable: (valor: string) => void
  filtroEstado: EstadoFiltro
  onCambiarFiltroEstado: (valor: EstadoFiltro) => void
  filtroPrioridad: PrioridadFiltro
  onCambiarFiltroPrioridad: (valor: PrioridadFiltro) => void
  filtroProyecto: string
  onCambiarFiltroProyecto: (valor: string) => void
  proyectos: string[]
  opcionesBusquedaTareas: string[]
  opcionesBusquedaResponsables: string[]
}

function FlechaSelect() {
  return (
    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5">
      <svg viewBox="0 0 10 6" aria-hidden="true" className="h-3 w-3 fill-[#312D2A]">
        <path d="M0.8 0.6h8.4L5 5.4 0.8 0.6Z" />
      </svg>
    </span>
  )
}

export default function FiltrosTareas({
  busquedaTarea,
  onCambiarBusquedaTarea,
  busquedaResponsable,
  onCambiarBusquedaResponsable,
  filtroEstado,
  onCambiarFiltroEstado,
  filtroPrioridad,
  onCambiarFiltroPrioridad,
  filtroProyecto,
  onCambiarFiltroProyecto,
  proyectos,
  opcionesBusquedaTareas,
  opcionesBusquedaResponsables,
}: FiltrosTareasProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
        <CardDescription>
          Busca y filtra tareas por estado, prioridad o proyecto.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative">
            <select
              value={busquedaTarea}
              onChange={(e) => onCambiarBusquedaTarea(e.target.value)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'appearance-none pr-12')}
            >
              <option value="">Buscar tarea</option>
              {opcionesBusquedaTareas.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
            <FlechaSelect />
          </div>

          <div className="relative">
            <select
              value={busquedaResponsable}
              onChange={(e) => onCambiarBusquedaResponsable(e.target.value)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'appearance-none pr-12')}
            >
              <option value="">Buscar responsable</option>
              {opcionesBusquedaResponsables.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
            <FlechaSelect />
          </div>

          <div className="relative">
            <select
              value={filtroEstado}
              onChange={(e) => onCambiarFiltroEstado(e.target.value as EstadoFiltro)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'appearance-none pr-12')}
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En progreso</option>
              <option value="completada">Completada</option>
              <option value="bloqueada">Bloqueada</option>
            </select>
            <FlechaSelect />
          </div>

          <div className="relative">
            <select
              value={filtroPrioridad}
              onChange={(e) => onCambiarFiltroPrioridad(e.target.value as PrioridadFiltro)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'appearance-none pr-12')}
            >
              <option value="todas">Todas las prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
            <FlechaSelect />
          </div>

          <div className="relative">
            <select
              value={filtroProyecto}
              onChange={(e) => onCambiarFiltroProyecto(e.target.value)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'appearance-none pr-12')}
            >
              <option value="todos">Todos los proyectos</option>
              {proyectos.map((proyecto) => (
                <option key={proyecto} value={proyecto}>
                  {proyecto}
                </option>
              ))}
            </select>
            <FlechaSelect />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}