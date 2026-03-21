import {
  Badge,
  Boton,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components'
import { SELECT, TYPO, cx } from '../../constants/colors'
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
  obtenerVarianteEstado: (
    estado: EstadoTarea
  ) => 'warning' | 'info' | 'success' | 'danger' | 'neutral'
  obtenerTextoPrioridad: (prioridad: PrioridadTarea) => string
  obtenerVariantePrioridad: (
    prioridad: PrioridadTarea
  ) => 'warning' | 'info' | 'success' | 'danger' | 'neutral'
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
          Busca la tarea en la que quieres trabajar y controla tu tiempo desde aquí.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr_auto_auto]">
            <div className="relative">
              <select
                value={busquedaTareaActiva}
                onChange={(e) => onCambiarBusquedaTareaActiva(e.target.value)}
                className={cx(SELECT.BASE, SELECT.DEFAULT, 'appearance-none pr-12')}
                disabled={enSeguimiento}
              >
                <option value="">Buscar tarea o proyecto</option>
                {opcionesTareaActiva.map((tarea) => {
                  const valor = tarea.proyectoNombre
                    ? `${tarea.titulo} · ${tarea.proyectoNombre}`
                    : tarea.titulo

                  return (
                    <option key={tarea.id} value={valor}>
                      {valor}
                    </option>
                  )
                })}
              </select>
              <FlechaSelect />
            </div>

            <div className="relative">
              <select
                value={tareaActivaId}
                onChange={(e) => onCambiarTareaActivaId(e.target.value)}
                className={cx(SELECT.BASE, SELECT.DEFAULT, 'appearance-none pr-12')}
                disabled={enSeguimiento}
              >
                <option value="">Selecciona una tarea</option>
                {opcionesTareaActiva.map((tarea) => (
                  <option key={tarea.id} value={tarea.id}>
                    {tarea.titulo}
                    {tarea.proyectoNombre ? ` · ${tarea.proyectoNombre}` : ''}
                  </option>
                ))}
              </select>
              <FlechaSelect />
            </div>

            <Boton onClick={onIniciarSeguimiento} disabled={!tareaActiva || enSeguimiento}>
              Iniciar
            </Boton>

            <Boton variante="secundario" onClick={onDetenerSeguimiento} disabled={!enSeguimiento}>
              Detener
            </Boton>
          </div>

          {tareaActiva ? (
            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 lg:grid-cols-[1.4fr_auto]">
              <div className="space-y-3">
                <div>
                  <p className={TYPO.CAPTION}>Tarea seleccionada</p>
                  <h3 className={TYPO.H3}>{tareaActiva.titulo}</h3>
                </div>

                <p className={TYPO.BODY_MUTED}>
                  {tareaActiva.descripcion || tareaActiva.subtitulo || 'Sin descripción.'}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variante={obtenerVarianteEstado(tareaActiva.estado)}>
                    {obtenerTextoEstado(tareaActiva.estado)}
                  </Badge>

                  <Badge variante={obtenerVariantePrioridad(tareaActiva.prioridad)}>
                    {obtenerTextoPrioridad(tareaActiva.prioridad)}
                  </Badge>

                  <Badge variante="neutral">
                    {tareaActiva.proyectoNombre || 'Sin proyecto'}
                  </Badge>
                </div>
              </div>

              <div className="flex min-w-[220px] flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4">
                <div>
                  <p className={TYPO.CAPTION}>Tiempo actual</p>
                  <div className="mt-2 text-3xl font-bold tracking-tight text-[#312D2A]">
                    {tiempoActivoFormateado}
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <p className={TYPO.BODY}>Estimadas: {tareaActiva.horasEstimadas ?? 0} h</p>
                  <p className={TYPO.BODY_MUTED}>Reales: {horasRealesEnPantalla} h</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className={TYPO.BODY_MUTED}>
                Selecciona una tarea para verla aquí como tarea principal.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}