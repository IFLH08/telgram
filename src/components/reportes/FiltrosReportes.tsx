import { Boton, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components'
import { INPUT, SELECT, cx } from '../../constants/colors'
import type { EstadoTarea, PrioridadTarea } from '../../types'

type EstadoFiltro = 'todos' | EstadoTarea
type PrioridadFiltro = 'todas' | PrioridadTarea

interface FiltrosReportesProps {
  busqueda: string
  onCambiarBusqueda: (valor: string) => void
  filtroProyecto: string
  onCambiarFiltroProyecto: (valor: string) => void
  filtroResponsable: string
  onCambiarFiltroResponsable: (valor: string) => void
  filtroEstado: EstadoFiltro
  onCambiarFiltroEstado: (valor: EstadoFiltro) => void
  filtroPrioridad: PrioridadFiltro
  onCambiarFiltroPrioridad: (valor: PrioridadFiltro) => void
  proyectos: string[]
  responsables: string[]
  onLimpiarFiltros: () => void
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

export default function FiltrosReportes({
  busqueda,
  onCambiarBusqueda,
  filtroProyecto,
  onCambiarFiltroProyecto,
  filtroResponsable,
  onCambiarFiltroResponsable,
  filtroEstado,
  onCambiarFiltroEstado,
  filtroPrioridad,
  onCambiarFiltroPrioridad,
  proyectos,
  responsables,
  onLimpiarFiltros,
}: FiltrosReportesProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Filtros de análisis</CardTitle>
            <CardDescription>
              Filtra métricas por proyecto, responsable, estado o prioridad.
            </CardDescription>
          </div>

          <Boton variante="secundario" tamano="sm" onClick={onLimpiarFiltros}>
            Limpiar filtros
          </Boton>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative">
            <input
              value={busqueda}
              onChange={(e) => onCambiarBusqueda(e.target.value)}
              placeholder="Buscar tarea, proyecto o responsable"
              className={cx(INPUT.BASE, INPUT.DEFAULT, 'pr-12')}
            />
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

          <div className="relative">
            <select
              value={filtroResponsable}
              onChange={(e) => onCambiarFiltroResponsable(e.target.value)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'appearance-none pr-12')}
            >
              <option value="todos">Todos los responsables</option>
              {responsables.map((responsable) => (
                <option key={responsable} value={responsable}>
                  {responsable}
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
        </div>
      </CardContent>
    </Card>
  )
}