import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components'
import { BUTTON, TABLE, TYPO, cx } from '../../constants/colors'
import type { EstadoTarea, PrioridadTarea, Tarea } from '../../types'

interface TablaTareasProps {
  tareasFiltradas: Tarea[]
  cargando: boolean
  error: string | null
  tareaActivaId: string
  enSeguimiento: boolean
  horasRealesEnPantalla: number
  redondearHoras: (valor: number) => number
  obtenerTextoEstado: (estado: EstadoTarea) => string
  obtenerVarianteEstado: (estado: EstadoTarea) => 'warning' | 'info' | 'success' | 'danger' | 'neutral'
  obtenerTextoPrioridad: (prioridad: PrioridadTarea) => string
  obtenerVariantePrioridad: (
    prioridad: PrioridadTarea
  ) => 'warning' | 'info' | 'success' | 'danger' | 'neutral'
  onEditar: (tarea: Tarea) => void
  onEliminar: (id: string) => void
  puedeMostrarEditar?: (tarea: Tarea) => boolean
  puedeMostrarEliminar?: (tarea: Tarea) => boolean
}

export default function TablaTareas({
  tareasFiltradas,
  cargando,
  error,
  tareaActivaId,
  enSeguimiento,
  horasRealesEnPantalla,
  redondearHoras,
  obtenerTextoEstado,
  obtenerVarianteEstado,
  obtenerTextoPrioridad,
  obtenerVariantePrioridad,
  onEditar,
  onEliminar,
  puedeMostrarEditar,
  puedeMostrarEliminar,
}: TablaTareasProps) {
  const mostrarColumnaAcciones = tareasFiltradas.some((tarea) => {
    const mostrarEditar = puedeMostrarEditar ? puedeMostrarEditar(tarea) : true
    const mostrarEliminar = puedeMostrarEliminar ? puedeMostrarEliminar(tarea) : true
    return mostrarEditar || mostrarEliminar
  })

  return (
    <Card padding="none">
      <CardHeader className="p-5 pb-0">
        <CardTitle>Listado de tareas</CardTitle>
        <CardDescription>Información obtenida desde el service de tareas.</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {cargando && (
          <div className="p-5">
            <p className={TYPO.BODY_MUTED}>Cargando tareas...</p>
          </div>
        )}

        {error && (
          <div className="p-5">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        )}

        {!cargando && !error && (
          <div className={TABLE.WRAPPER}>
            <table className={TABLE.TABLE}>
              <thead className={TABLE.THEAD}>
                <tr>
                  <th className={TABLE.TH}>Tarea</th>
                  <th className={TABLE.TH}>Responsable</th>
                  <th className={TABLE.TH}>Prioridad</th>
                  <th className={TABLE.TH}>Estado</th>
                  <th className={TABLE.TH}>Proyecto</th>
                  <th className={TABLE.TH}>Tiempo</th>
                  {mostrarColumnaAcciones && <th className={TABLE.TH}>Acciones</th>}
                </tr>
              </thead>

              <tbody>
                {tareasFiltradas.map((tarea) => {
                  const esTareaActiva = tarea.id === tareaActivaId
                  const horasRealesMostradas =
                    esTareaActiva && enSeguimiento
                      ? horasRealesEnPantalla
                      : redondearHoras(tarea.horasReales ?? 0)

                  const mostrarEditar = puedeMostrarEditar ? puedeMostrarEditar(tarea) : true
                  const mostrarEliminar = puedeMostrarEliminar ? puedeMostrarEliminar(tarea) : true
                  const mostrarAccionesFila = mostrarEditar || mostrarEliminar

                  return (
                    <tr key={tarea.id} className={TABLE.TR}>
                      <td className={TABLE.TD}>
                        <div>
                          <p className="font-medium text-[#312D2A]">{tarea.titulo}</p>
                          {tarea.subtitulo && (
                            <p className="mt-1 text-xs text-gray-500">{tarea.subtitulo}</p>
                          )}
                        </div>
                      </td>

                      <td className={TABLE.TD}>
                        {tarea.responsableNombre || 'Sin responsable'}
                      </td>

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

                      <td className={TABLE.TD}>{tarea.proyectoNombre || 'Sin proyecto'}</td>

                      <td className={TABLE.TD}>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-[#312D2A]">
                            Est.: {tarea.horasEstimadas ?? 0} h
                          </p>
                          <p className="text-xs text-gray-500">
                            Real: {horasRealesMostradas} h
                          </p>
                          {esTareaActiva && (
                            <p className="text-xs font-medium text-[#C74634]">
                              {enSeguimiento ? 'En seguimiento' : 'Tarea principal'}
                            </p>
                          )}
                        </div>
                      </td>

                      {mostrarColumnaAcciones && (
                        <td className={TABLE.TD}>
                          {mostrarAccionesFila ? (
                            <div className="flex gap-2">
                              {mostrarEditar && (
                                <button
                                  type="button"
                                  onClick={() => onEditar(tarea)}
                                  className={cx(BUTTON.BASE, BUTTON.SECONDARY, BUTTON.SM)}
                                >
                                  Editar
                                </button>
                              )}

                              {mostrarEliminar && (
                                <button
                                  type="button"
                                  onClick={() => onEliminar(tarea.id)}
                                  className={cx(BUTTON.BASE, BUTTON.DANGER, BUTTON.SM)}
                                >
                                  Eliminar
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Sin acciones</span>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}

                {tareasFiltradas.length === 0 && (
                  <tr className={TABLE.TR}>
                    <td className={TABLE.TD} colSpan={mostrarColumnaAcciones ? 7 : 6}>
                      No hay tareas que coincidan con los filtros actuales.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}