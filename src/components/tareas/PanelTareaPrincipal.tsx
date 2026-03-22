import { Badge, Boton, Card, CardContent, CardDescription, CardHeader, CardTitle, FlechaSelect } from '../../components'
import { INPUT, SELECT, TYPO, cx } from '../../constants/colors'
import type { EstadoTarea, PrioridadTarea, Tarea } from '../../types'

interface PanelTareaPrincipalProps {
  busquedaTareaActiva: string
  onCambiarBusquedaTareaActiva: (valor: string) => void
  tareaActivaId: string
  onCambiarTareaActivaId: (valor: string) => void
  opcionesTareaActiva: Tarea[]
  tareaActiva: Tarea | null
  enSeguimiento: boolean
  tiempoActivoFormateado: string
  horasRealesEnPantalla: number
  onIniciarSeguimiento: () => void
  onDetenerSeguimiento: () => void
  obtenerTextoEstado: (estado: EstadoTarea) => string
  obtenerVarianteEstado: (estado: EstadoTarea) => 'warning' | 'info' | 'success' | 'danger' | 'neutral'
  obtenerTextoPrioridad: (prioridad: PrioridadTarea) => string
  obtenerVariantePrioridad: (prioridad: PrioridadTarea) => 'warning' | 'info' | 'success' | 'danger' | 'neutral'
}

export default function PanelTareaPrincipal({
  busquedaTareaActiva,
  onCambiarBusquedaTareaActiva,
  tareaActivaId,
  onCambiarTareaActivaId,
  opcionesTareaActiva,
  tareaActiva,
  enSeguimiento,
  tiempoActivoFormateado,
  horasRealesEnPantalla,
  onIniciarSeguimiento,
  onDetenerSeguimiento,
  obtenerTextoEstado,
  obtenerVarianteEstado,
  obtenerTextoPrioridad,
  obtenerVariantePrioridad,
}: PanelTareaPrincipalProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tarea principal</CardTitle>
        <CardDescription>
          Selecciona la tarea en la que vas a trabajar y registra el tiempo activo.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1.1fr_0.8fr]">
          <div>
            <label className={TYPO.LABEL}>Busca la tarea en la que quieres trabajar</label>
            <input
              value={busquedaTareaActiva}
              onChange={(e) => onCambiarBusquedaTareaActiva(e.target.value)}
              placeholder="Buscar tarea o proyecto"
              className={cx(INPUT.BASE, INPUT.DEFAULT, 'mt-2')}
            />
          </div>

          <div>
            <label className={TYPO.LABEL}>Tarea activa</label>
            <div className="relative mt-2">
              <select
                value={tareaActivaId}
                onChange={(e) => onCambiarTareaActivaId(e.target.value)}
                className={cx(SELECT.BASE, SELECT.DEFAULT, 'appearance-none pr-12')}
              >
                <option value="">Selecciona una tarea</option>
                {opcionesTareaActiva.map((tarea) => (
                  <option key={tarea.id} value={tarea.id}>
                    {tarea.proyectoNombre
                      ? `${tarea.titulo} · ${tarea.proyectoNombre}`
                      : tarea.titulo}
                  </option>
                ))}
              </select>
              <FlechaSelect />
            </div>
          </div>

          <div className="flex items-end">
            {enSeguimiento ? (
              <Boton className="w-full" onClick={onDetenerSeguimiento}>
                Detener seguimiento
              </Boton>
            ) : (
              <Boton className="w-full" onClick={onIniciarSeguimiento}>
                Iniciar seguimiento
              </Boton>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-4">
          {tareaActiva ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <h3 className={TYPO.H3}>{tareaActiva.titulo}</h3>
                  {tareaActiva.subtitulo ? (
                    <p className={TYPO.BODY_MUTED}>{tareaActiva.subtitulo}</p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variante={obtenerVarianteEstado(tareaActiva.estado)}>
                    {obtenerTextoEstado(tareaActiva.estado)}
                  </Badge>
                  <Badge variante={obtenerVariantePrioridad(tareaActiva.prioridad)}>
                    {obtenerTextoPrioridad(tareaActiva.prioridad)}
                  </Badge>
                </div>
              </div>

              {tareaActiva.descripcion ? (
                <p className={TYPO.BODY_MUTED}>{tareaActiva.descripcion}</p>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className={TYPO.LABEL}>Proyecto</p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {tareaActiva.proyectoNombre || 'Sin proyecto'}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className={TYPO.LABEL}>Responsable</p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {tareaActiva.responsableNombre || 'Sin responsable'}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className={TYPO.LABEL}>Tiempo actual</p>
                  <p className="mt-2 text-sm font-medium text-white">{tiempoActivoFormateado}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className={TYPO.LABEL}>Horas reales</p>
                  <p className="mt-2 text-sm font-medium text-white">{horasRealesEnPantalla} h</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <p className={TYPO.BODY_MUTED}>
                Selecciona una tarea para verla aquí y registrar el tiempo de trabajo.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}