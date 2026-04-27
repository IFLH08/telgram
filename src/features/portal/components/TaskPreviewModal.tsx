import { useEffect, useMemo, useState } from 'react'
import { Badge, Boton } from '../../../components'
import { TYPO, cx } from '../../../constants/colors'
import {
  calcularSegundosRegistradosTask,
  formatearDuracionSegundos,
  formatearFecha,
  formatearMomentoSesion,
  formatearTiempoRestanteEntrega,
  obtenerSesionActivaTask,
  obtenerTextoEstatusTask,
  obtenerTextoPrioridadTask,
  obtenerVarianteEstatusTask,
  obtenerVariantePrioridadTask,
} from '../selectors'
import type { PortalTask } from '../types'

interface TaskPreviewModalProps {
  open: boolean
  task: PortalTask | null
  sessionBusy: boolean
  onClose: () => void
  onStartSession: () => void
  onStopSession: () => void
}

export default function TaskPreviewModal({
  open,
  task,
  sessionBusy,
  onClose,
  onStartSession,
  onStopSession,
}: TaskPreviewModalProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open])

  useEffect(() => {
    if (!open) {
      return
    }

    setNow(new Date())

    const intervalId = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [open])

  const activeSession = useMemo(() => {
    if (!task) {
      return null
    }

    return obtenerSesionActivaTask(task)
  }, [task])

  const totalTrackedSeconds = useMemo(() => {
    if (!task) {
      return 0
    }

    return calcularSegundosRegistradosTask(task, true, now)
  }, [now, task])

  const remainingEstimatedSeconds = useMemo(() => {
    if (!task) {
      return 0
    }

    return Math.max(task.horasEstimadas * 3600 - totalTrackedSeconds, 0)
  }, [task, totalTrackedSeconds])

  const recentSessions = useMemo(() => {
    if (!task) {
      return []
    }

    return [...task.sesionesTrabajo]
      .sort((left, right) => right.iniciadaEn.localeCompare(left.iniciadaEn))
      .slice(0, 5)
  }, [task])

  if (!open || !task) {
    return null
  }

  const canStartSession =
    !sessionBusy &&
    !activeSession &&
    task.estatus !== 'completada' &&
    task.estatus !== 'cancelada'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-preview-modal-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[12px] uppercase tracking-[0.08em] text-[#8B857E]">
              Detalle de tarea
            </p>
            <h2
              id="task-preview-modal-title"
              className={cx(TYPO.H3, 'mt-2 portal-wrap-anywhere')}
            >
              {task.nombre}
            </h2>
            <p className={cx(TYPO.CAPTION, 'mt-2')}>
              {task.proyectoNombre} · {task.sprintNombre}
            </p>
          </div>

          <Boton variante="secundario" onClick={onClose}>
            Cerrar
          </Boton>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[4px] border border-[#E2DDD6] bg-[#FBFAF8] px-3 py-3">
            <p className="text-[12px] uppercase tracking-[0.08em] text-[#8B857E]">
              Estatus
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variante={obtenerVarianteEstatusTask(task.estatus)}>
                {obtenerTextoEstatusTask(task.estatus)}
              </Badge>
              {activeSession && <Badge variante="info">Sesion activa</Badge>}
            </div>
          </div>

          <div className="rounded-[4px] border border-[#E2DDD6] bg-[#FBFAF8] px-3 py-3">
            <p className="text-[12px] uppercase tracking-[0.08em] text-[#8B857E]">
              Prioridad
            </p>
            <div className="mt-2">
              <Badge variante={obtenerVariantePrioridadTask(task.prioridad)}>
                {obtenerTextoPrioridadTask(task.prioridad)}
              </Badge>
            </div>
          </div>

          <div className="rounded-[4px] border border-[#E2DDD6] bg-[#FBFAF8] px-3 py-3">
            <p className="text-[12px] uppercase tracking-[0.08em] text-[#8B857E]">
              Entrega
            </p>
            <p className="mt-2 text-[15px] font-medium leading-6 text-[#161513]">
              {formatearFecha(task.fechaEntrega)}
            </p>
            <p className="mt-1 text-[13px] leading-5 text-[#66635E]">
              {formatearTiempoRestanteEntrega(task.fechaEntrega, now)}
            </p>
          </div>

          <div className="rounded-[4px] border border-[#E2DDD6] bg-[#FBFAF8] px-3 py-3">
            <p className="text-[12px] uppercase tracking-[0.08em] text-[#8B857E]">
              Tiempo registrado
            </p>
            <p className="mt-2 text-[15px] font-medium leading-6 text-[#161513]">
              {formatearDuracionSegundos(totalTrackedSeconds)}
            </p>
            <p className="mt-1 text-[13px] leading-5 text-[#66635E]">
              {task.horasEstimadas} h planeadas · {task.horasReales.toFixed(2)} h cerradas
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.95fr]">
          <div className="rounded-[4px] border border-[#E2DDD6] bg-white px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[12px] uppercase tracking-[0.08em] text-[#8B857E]">
                  Tracking profesional
                </p>
                <p className="mt-2 text-[15px] leading-6 text-[#4D4A45]">
                  El tiempo real se suma solo cuando una sesion de trabajo se cierra.
                </p>
              </div>

              {activeSession ? (
                <Boton variante="peligro" onClick={onStopSession} disabled={sessionBusy}>
                  {sessionBusy ? 'Deteniendo...' : 'Detener sesion'}
                </Boton>
              ) : (
                <Boton onClick={onStartSession} disabled={!canStartSession}>
                  {sessionBusy ? 'Iniciando...' : 'Iniciar sesion'}
                </Boton>
              )}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-[4px] border border-[#E2DDD6] bg-[#FBFAF8] px-3 py-3">
                <p className="text-[12px] uppercase tracking-[0.08em] text-[#8B857E]">
                  Sesion actual
                </p>
                <p className="mt-2 text-[18px] font-medium leading-6 text-[#161513]">
                  {activeSession
                    ? formatearDuracionSegundos(totalTrackedSeconds - calcularSegundosRegistradosTask(task))
                    : 'Sin sesion activa'}
                </p>
                <p className="mt-1 text-[13px] leading-5 text-[#66635E]">
                  {activeSession
                    ? `Iniciada por ${activeSession.iniciadaPorNombre}`
                    : 'Inicia una sesion cuando empieces a trabajar.'}
                </p>
              </div>

              <div className="rounded-[4px] border border-[#E2DDD6] bg-[#FBFAF8] px-3 py-3">
                <p className="text-[12px] uppercase tracking-[0.08em] text-[#8B857E]">
                  Tiempo estimado restante
                </p>
                <p className="mt-2 text-[18px] font-medium leading-6 text-[#161513]">
                  {formatearDuracionSegundos(remainingEstimatedSeconds)}
                </p>
                <p className="mt-1 text-[13px] leading-5 text-[#66635E]">
                  Basado en horas planeadas menos el tiempo ya registrado.
                </p>
              </div>
            </div>

            {(task.estatus === 'completada' || task.estatus === 'cancelada') && !activeSession && (
              <p className="mt-4 text-[13px] leading-5 text-[#8B857E]">
                Esta tarea ya no admite nuevas sesiones mientras conserve su estatus actual.
              </p>
            )}
          </div>

          <div className="rounded-[4px] border border-[#E2DDD6] bg-white px-4 py-4">
            <p className="text-[12px] uppercase tracking-[0.08em] text-[#8B857E]">
              Sesiones registradas
            </p>

            <div className="mt-4 space-y-3">
              {recentSessions.length === 0 && (
                <p className="text-[14px] leading-6 text-[#66635E]">
                  Aun no hay sesiones registradas para esta tarea.
                </p>
              )}

              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-[4px] border border-[#E2DDD6] bg-[#FBFAF8] px-3 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[14px] font-medium leading-5 text-[#161513]">
                      {session.finalizadaEn ? 'Sesion cerrada' : 'Sesion en curso'}
                    </p>
                    <Badge variante={session.finalizadaEn ? 'success' : 'info'}>
                      {session.finalizadaEn
                        ? formatearDuracionSegundos(session.duracionSegundos)
                        : formatearDuracionSegundos(
                            Math.max(
                              0,
                              Math.round(
                                (now.getTime() - new Date(session.iniciadaEn).getTime()) / 1000,
                              ),
                            ),
                          )}
                    </Badge>
                  </div>

                  <p className="mt-2 text-[13px] leading-5 text-[#66635E]">
                    {formatearMomentoSesion(session)}
                  </p>
                  <p className="mt-1 text-[13px] leading-5 text-[#8B857E]">
                    Iniciada por {session.iniciadaPorNombre}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[4px] border border-[#E2DDD6] bg-white px-4 py-4">
          <p className="text-[12px] uppercase tracking-[0.08em] text-[#8B857E]">
            Descripcion completa
          </p>
          <p className="mt-3 text-[15px] leading-7 text-[#4D4A45]">
            {task.descripcion}
          </p>
        </div>
      </div>
    </div>
  )
}
