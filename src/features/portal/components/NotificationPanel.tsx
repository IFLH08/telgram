import { Badge } from '../../../components'
import { ALERT, TYPO, cx } from '../../../constants/colors'
import {
  formatearFechaHoraCorta,
} from '../selectors'
import type { PortalAlertItem } from '../types'

interface NotificationPanelProps {
  items: PortalAlertItem[]
  onNavigateToTasks: () => void
}

function obtenerBadgeCategoria(categoria: PortalAlertItem['categoria']) {
  switch (categoria) {
    case 'nueva_tarea':
      return { texto: 'Nueva tarea', variante: 'success' as const }
    case 'vencimiento':
      return { texto: 'Vencimiento', variante: 'danger' as const }
    case 'timer_activo':
      return { texto: 'Timer activo', variante: 'info' as const }
    case 'cambio_estado':
      return { texto: 'Estatus', variante: 'warning' as const }
    default:
      return { texto: 'Alerta', variante: 'brand' as const }
  }
}

function obtenerEstiloAlerta(tipo: PortalAlertItem['tipo']) {
  switch (tipo) {
    case 'alerta':
      return ALERT.DANGER
    case 'success':
      return ALERT.SUCCESS
    case 'info':
    default:
      return ALERT.INFO
  }
}

export default function NotificationPanel({
  items,
  onNavigateToTasks,
}: NotificationPanelProps) {
  return (
    <div
      id="portal-notifications-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="portal-notifications-title"
      className="absolute right-0 top-[calc(100%+12px)] z-50 w-[360px] max-w-[calc(100vw-3rem)] rounded-[4px] border border-[#E2DDD6] bg-white shadow-[0_12px_30px_rgba(22,21,19,0.12)]"
    >
      <div className="border-b border-[#ECE7E1] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              id="portal-notifications-title"
              className={cx(TYPO.H4, 'leading-6')}
            >
              Notificaciones y alertas
            </p>
            <p className={cx(TYPO.CAPTION, 'mt-1')}>
              {items.length === 0
                ? 'No hay novedades activas por ahora.'
                : `${items.length} alertas activas vinculadas al trabajo del portal.`}
            </p>
          </div>

          <Badge variante={items.length > 0 ? 'info' : 'neutral'}>
            {items.length}
          </Badge>
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto px-3 py-3">
        {items.length === 0 ? (
          <div className="rounded-[4px] border border-[#E2DDD6] bg-[#FBFAF8] px-4 py-4">
            <p className={TYPO.BODY_MUTED}>
              Cuando haya nuevas tareas, vencimientos, timers activos o cambios de
              estado, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const badge = obtenerBadgeCategoria(item.categoria)

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={onNavigateToTasks}
                  className={cx(
                    'block w-full rounded-[4px] border px-4 py-3 text-left transition hover:border-[#D3CDC5] hover:bg-[#FBFAF8]',
                    obtenerEstiloAlerta(item.tipo),
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variante={badge.variante}>{badge.texto}</Badge>
                        <span className="text-[12px] uppercase tracking-[0.06em] text-current/70">
                          {formatearFechaHoraCorta(item.fecha)}
                        </span>
                      </div>

                      <p className="mt-3 text-[15px] font-medium leading-5 text-current">
                        {item.titulo}
                      </p>
                      <p className="mt-1 text-[14px] leading-5 text-current/85">
                        {item.mensaje}
                      </p>
                    </div>

                    <span className="pt-1 text-[12px] uppercase tracking-[0.08em] text-current/65">
                      Ver
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
