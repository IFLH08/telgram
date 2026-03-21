import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components'
import { INPUT, SELECT, cx } from '../../constants/colors'

interface FiltrosProyectosProps {
  busqueda: string
  onCambiarBusqueda: (valor: string) => void
  filtroEstado: string
  onCambiarFiltroEstado: (valor: string) => void
  estadosDisponibles: string[]
  obtenerTextoEstadoProyecto: (estado: string) => string
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

export default function FiltrosProyectos({
  busqueda,
  onCambiarBusqueda,
  filtroEstado,
  onCambiarFiltroEstado,
  estadosDisponibles,
  obtenerTextoEstadoProyecto,
}: FiltrosProyectosProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
        <CardDescription>
          Busca proyectos por nombre, responsable o descripción.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="relative">
            <input
              value={busqueda}
              onChange={(e) => onCambiarBusqueda(e.target.value)}
              placeholder="Buscar proyecto o responsable"
              className={cx(INPUT.BASE, INPUT.DEFAULT, 'pr-12')}
            />
            <FlechaSelect />
          </div>

          <div className="relative">
            <select
              value={filtroEstado}
              onChange={(e) => onCambiarFiltroEstado(e.target.value)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'appearance-none pr-12')}
            >
              <option value="todos">Todos los estados</option>
              {estadosDisponibles.map((estado) => (
                <option key={estado} value={estado}>
                  {obtenerTextoEstadoProyecto(estado)}
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