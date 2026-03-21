import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components'
import { BUTTON, TABLE, cx } from '../../constants/colors'
import type { EstadoTarea, PrioridadTarea, Tarea } from '../../types'

interface TablaDetalleTareasReporteProps {
  tareasFiltradas: Tarea[]
  redondearHoras: (valor: number) => number
  obtenerTextoEstado: (estado: EstadoTarea) => string
  obtenerVarianteEstado: (estado: EstadoTarea) => 'warning' | 'info' | 'success' | 'danger' | 'neutral'
  obtenerTextoPrioridad: (prioridad: PrioridadTarea) => string
  obtenerVariantePrioridad: (
    prioridad: PrioridadTarea
  ) => 'warning' | 'info' | 'success' | 'danger' | 'neutral'
  onAbrirReporte: (tarea: Tarea) => void
}

export default function TablaDetalleTareasReporte({
  tareasFiltradas,
  redondearHoras,
  obtenerTextoEstado,
  obtenerVarianteEstado,
  obtenerTextoPrioridad,
  obtenerVariantePrioridad,
  onAbrirReporte,
}: TablaDetalleTareasReporteProps) {
  return (
    <Card padding="none">
      <CardHeader className="p-5 pb-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>Detalle de tareas incluidas</CardTitle>
            <CardDescription>
              Vista operativa de las tareas consideradas en el análisis actual.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className={TABLE.WRAPPER}>
          <table className={TABLE.TABLE}>
            <thead className={TABLE.THEAD}>
              <tr>
                <th className={TABLE.TH}>Tarea</th>
                <th className={TABLE.TH}>Responsable</th>
                <th className={TABLE.TH}>Proyecto</th>
                <th className={TABLE.TH}>Prioridad</th>
                <th className={TABLE.TH}>Estado</th>
                <th className={TABLE.TH}>Tiempo</th>
                <th className={TABLE.TH}>Reporte</th>
              </tr>
            </thead>

            <tbody>
              {tareasFiltradas.map((tarea) => (
                <tr key={tarea.id} className={TABLE.TR}>
                  <td className={TABLE.TD}>
                    <div>
                      <p className="font-medium text-[#312D2A]">{tarea.titulo}</p>
                      {tarea.subtitulo && (
                        <p className="mt-1 text-xs text-gray-500">{tarea.subtitulo}</p>
                      )}
                    </div>
                  </td>

                  <td className={TABLE.TD}>{tarea.responsableNombre || 'Sin responsable'}</td>

                  <td className={TABLE.TD}>{tarea.proyectoNombre || 'Sin proyecto'}</td>

                  <td className={TABLE.TD}>
                    <Badge variante={obtenerVariantePrioridad(tarea.prioridad)}>
                      {obtenerTextoPrioridad(tarea.prioridad)}
                    </Badge>
                  </td>

                  <td className={TABLE.TD}>
                    <Badge variante={obtenerVarianteEstado(tarea.estado)}>
                      {obtenerTextoEstado(tarea.estado)}
                    </Badge>
                  </td>

                  <td className={TABLE.TD}>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-[#312D2A]">
                        Est.: {tarea.horasEstimadas ?? 0} h
                      </p>
                      <p className="text-xs text-gray-500">
                        Real: {redondearHoras(tarea.horasReales ?? 0)} h
                      </p>
                    </div>
                  </td>

                  <td className={TABLE.TD}>
                    <button
                      type="button"
                      onClick={() => onAbrirReporte(tarea)}
                      className={cx(BUTTON.BASE, BUTTON.SECONDARY, BUTTON.SM)}
                    >
                      Generar reporte
                    </button>
                  </td>
                </tr>
              ))}

              {tareasFiltradas.length === 0 && (
                <tr className={TABLE.TR}>
                  <td className={TABLE.TD} colSpan={7}>
                    No hay tareas para analizar con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}