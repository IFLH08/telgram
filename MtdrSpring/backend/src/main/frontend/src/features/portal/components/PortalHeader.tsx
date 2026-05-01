import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Pagina } from '../../../types'
import { useAuth } from '../../../auth'
import { BotonIcono } from '../../../components/Button'
import {
  IconoCampana,
  IconoProyectos,
  IconoTareas,
} from '../../../components/Icons'
import { AVATAR, SELECT, TOKENS, TYPO, cx } from '../../../constants/colors'
import { usePortal } from '../context'
import NotificationPanel from './NotificationPanel'
import type { PortalAlertItem } from '../types'

interface PortalHeaderProps {
  currentPage: Pagina
  notifications: PortalAlertItem[]
  onNavigate: (page: Pagina) => void
}

const navigationItems: Array<{
  icon: ReactNode
  label: string
  page: Pagina
}> = [
  {
    page: 'tareas',
    label: 'Tareas',
    icon: <IconoTareas className="h-4 w-4" />,
  },
  {
    page: 'proyectos',
    label: 'Proyectos',
    icon: <IconoProyectos className="h-4 w-4" />,
  },
  {
    page: 'codigos',
    label: 'Codigos de acceso',
    icon: <span className="text-xs font-bold">#</span>,
  },
  {
    page: 'tequi',
    label: 'Dashboard',
    icon: <span className="text-xs font-bold">📊</span>,
  },
]

function formatRole(role: string | null | undefined) {
  return role === 'admin' ? 'Administrador' : 'Desarrollador'
}

export default function PortalHeader({
  currentPage,
  notifications,
  onNavigate,
}: PortalHeaderProps) {
  const { usuarioActual, cambiarUsuarioActualDemo } = useAuth()
  const { users } = usePortal()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement | null>(null)
  const notificationCount = notifications.length

  useEffect(() => {
    if (!notificationsOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target

      if (
        target instanceof Node &&
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setNotificationsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNotificationsOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [notificationsOpen])

  return (
    <header
      className={cx(
        'sticky top-0 z-40 border-b bg-white/95 backdrop-blur-sm',
        TOKENS.border.subtle,
      )}
    >
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex min-w-0 flex-col gap-2">
              <button
                type="button"
                onClick={() => onNavigate('tequi')}
                className="group inline-flex w-fit flex-col text-left"
              >
                <span
                  className={cx(
                    TYPO.H1,
                    'block text-[32px] leading-none transition group-hover:text-[#33553C]',
                  )}
                >
                  DevTask
                </span>
                <span className={cx(TYPO.CAPTION, 'mt-1 block')}>
                  Portal de administracion
                </span>
              </button>
            </div>

            <div className="flex flex-col gap-3 xl:items-end">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end">
                <div className="flex min-h-[56px] items-center gap-3 rounded-[4px] border border-[#E2DDD6] bg-[#FBFAF8] px-4 py-3 shadow-[0_1px_2px_rgba(22,21,19,0.03)]">
                  <div className={cx(AVATAR.BASE, AVATAR.BRAND, 'shrink-0')}>
                    {usuarioActual?.iniciales ?? 'DT'}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[12px] uppercase tracking-[0.08em] text-[#8B857E]">
                      Rol activo
                    </p>
                    <p className={cx(TYPO.BODY, 'font-medium')}>
                      {formatRole(usuarioActual?.rol)}
                    </p>
                  </div>
                </div>

                <div className="flex items-end gap-3">
                  <div ref={notificationsRef} className="relative shrink-0">
                    <span className="mb-1 block text-[12px] uppercase tracking-[0.08em] text-[#8B857E]">
                      Alertas
                    </span>
                    <div className="relative">
                      <BotonIcono
                        icono={<IconoCampana className="h-5 w-5" />}
                        label={`Notificaciones (${notificationCount})`}
                        variante="secundario"
                        aria-haspopup="dialog"
                        aria-expanded={notificationsOpen}
                        aria-controls="portal-notifications-panel"
                        onClick={() => setNotificationsOpen((current) => !current)}
                        className={cx(
                          'h-[56px] w-[56px] shadow-none',
                          notificationsOpen
                            ? 'border-[#33553C] bg-white text-[#33553C] ring-2 ring-[#D8E3DA]'
                            : 'border-[#D8E3DA] bg-[#FBFAF8] text-[#33553C] hover:border-[#BCD0C1] hover:bg-white',
                        )}
                      />
                      {notificationCount > 0 && (
                        <span
                          className={cx(
                            'absolute -right-1 -top-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white px-1.5 text-[10px] font-bold text-white shadow-[0_2px_6px_rgba(0,107,143,0.24)]',
                            TOKENS.bg.info,
                          )}
                        >
                          {notificationCount > 9 ? '9+' : notificationCount}
                        </span>
                      )}
                    </div>

                    {notificationsOpen && (
                      <NotificationPanel
                        items={notifications}
                        onNavigateToTasks={() => {
                          onNavigate('tareas')
                          setNotificationsOpen(false)
                        }}
                      />
                    )}
                  </div>

                  <div className="min-w-[250px] flex-1 sm:w-[310px] sm:flex-none">
                    <label
                      htmlFor="portal-demo-user"
                      className="mb-1 block text-[12px] uppercase tracking-[0.08em] text-[#8B857E]"
                    >
                      Usuario demo
                    </label>
                    <select
                      id="portal-demo-user"
                      aria-label="Usuario demo"
                      value={usuarioActual?.id ?? ''}
                      onChange={(event) => {
                        void cambiarUsuarioActualDemo(event.target.value)
                      }}
                      className={cx(SELECT.BASE, SELECT.DEFAULT, 'h-[56px]')}
                    >
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.nombreCompleto} · {formatRole(user.rol)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <nav aria-label="Navegacion principal" className="overflow-x-auto pb-1">
            <div className="inline-flex min-w-max items-center gap-1 rounded-[4px] border border-[#E2DDD6] bg-[#FBFAF8] p-1">
              {navigationItems.map((item) => {
                const active = item.page === currentPage

                return (
                  <button
                    key={item.page}
                    type="button"
                    aria-current={active ? 'page' : undefined}
                    onClick={() => onNavigate(item.page)}
                    className={cx(
                      'inline-flex h-11 items-center gap-2 rounded-[4px] px-4 text-[16px] font-medium transition',
                      active
                        ? 'border border-[#D8E3DA] bg-white text-[#33553C] shadow-[0_1px_2px_rgba(22,21,19,0.04)]'
                        : 'border border-transparent text-[#66635E] hover:border-[#E2DDD6] hover:bg-white hover:text-[#161513]',
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                )
              })}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
