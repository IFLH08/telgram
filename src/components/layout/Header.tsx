import { useEffect, useMemo, useRef, useState } from 'react'
import type { Pagina, RolUsuario } from '../../types'
import {
  AVATAR,
  INPUT_BASE,
  SELECT,
  TOKENS,
  TYPO,
  cx,
} from '../../constants/colors'
import { useAuth } from '../../auth'
import { obtenerUsuarios } from '../../services/auth.service'
import { BotonIcono } from '../Button'
import {
  IconoBuscar,
  IconoCampana,
  IconoConfiguracion,
} from '../Icons'

interface HeaderProps {
  cantidadNotificaciones?: number
  onClickNotificaciones?: () => void
  onCerrarSesion: () => void
  paginaActual: Pagina
  onNavegar?: (pagina: Pagina) => void
}

interface ItemNavegacion {
  etiqueta: string
  pagina: Pagina
}

interface OpcionUsuarioDemo {
  id: string
  nombreCompleto: string
  correo: string
  rol: RolUsuario
}

const itemsNavegacion: ItemNavegacion[] = [
  { etiqueta: 'Dashboard', pagina: 'dashboard' },
  { etiqueta: 'Tareas', pagina: 'tareas' },
  { etiqueta: 'Reportes', pagina: 'reportes' },
  { etiqueta: 'Proyectos', pagina: 'proyectos' },
]

function ItemNavegacionTop({
  etiqueta,
  activo,
  onClick,
}: {
  etiqueta: string
  activo?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'inline-flex items-center rounded-full px-4 py-2 text-sm font-bold transition',
        activo
          ? 'bg-[#d5d5d5] text-[#312D2A] shadow-sm'
          : 'text-gray-600 hover:bg-gray-50 hover:text-[#312D2A]',
      )}
    >
      {etiqueta}
    </button>
  )
}

function CajaBusqueda() {
  return (
    <div className="relative w-full min-w-[220px] xl:w-60">
      <IconoBuscar className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        className={cx(INPUT_BASE, 'w-full pl-10 pr-3')}
        placeholder="Buscar…"
      />
    </div>
  )
}

function formatearRol(rol: RolUsuario | null | undefined) {
  switch (rol) {
    case 'admin':
      return 'Admin'
    case 'manager':
      return 'Manager'
    case 'developer':
      return 'Developer'
    default:
      return 'Sin rol'
  }
}

export default function Header({
  cantidadNotificaciones = 0,
  onClickNotificaciones,
  onCerrarSesion,
  paginaActual,
  onNavegar,
}: HeaderProps) {
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false)
  const [usuariosDemo, setUsuariosDemo] = useState<OpcionUsuarioDemo[]>([])
  const menuRef = useRef<HTMLDivElement | null>(null)

  const {
    usuarioActual,
    rolActual,
    cambiarUsuarioActualDemo,
  } = useAuth()

  useEffect(() => {
    const cargarUsuarios = async () => {
      const usuarios = await obtenerUsuarios()
      setUsuariosDemo(
        usuarios.map((usuario) => ({
          id: usuario.id,
          nombreCompleto: usuario.nombreCompleto,
          correo: usuario.correo,
          rol: usuario.rol,
        })),
      )
    }

    void cargarUsuarios()
  }, [])

  useEffect(() => {
    const manejarClickFuera = (event: MouseEvent) => {
      if (!menuRef.current) {
        return
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setMostrarMenuUsuario(false)
      }
    }

    document.addEventListener('mousedown', manejarClickFuera)

    return () => {
      document.removeEventListener('mousedown', manejarClickFuera)
    }
  }, [])

  const inicialesUsuario = useMemo(() => {
    if (usuarioActual?.iniciales?.trim()) {
      return usuarioActual.iniciales.trim().slice(0, 2).toUpperCase()
    }

    if (usuarioActual?.nombreCompleto?.trim()) {
      return usuarioActual.nombreCompleto
        .trim()
        .split(' ')
        .slice(0, 2)
        .map((parte) => parte[0]?.toUpperCase() ?? '')
        .join('')
    }

    return 'DT'
  }, [usuarioActual])

  return (
    <header
      className={cx(
        'sticky top-0 z-40 border-b shadow-sm',
        TOKENS.border.subtle,
        TOKENS.bg.page,
      )}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex min-h-[88px] items-center justify-between gap-4 xl:gap-6">
          <div className="flex w-[220px] shrink-0 flex-col justify-center">
            <button
              type="button"
              onClick={() => onNavegar?.('dashboard')}
              className="text-left"
            >
              <div className={cx(TYPO.H2, 'leading-none')}>DevTask</div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.30em] text-gray-500">
                Powered by OCI
              </div>
            </button>
          </div>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-2 lg:flex">
            {itemsNavegacion.map((item) => (
              <ItemNavegacionTop
                key={item.pagina}
                etiqueta={item.etiqueta}
                activo={paginaActual === item.pagina}
                onClick={() => onNavegar?.(item.pagina)}
              />
            ))}
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-3">
            <div className="hidden xl:block">
              <CajaBusqueda />
            </div>

            <div className="relative">
              <BotonIcono
                icono={<IconoCampana className="h-5 w-5" />}
                label="Notificaciones"
                variante="secundario"
                onClick={onClickNotificaciones}
              />
              {cantidadNotificaciones > 0 && (
                <span
                  className={cx(
                    'absolute right-1 top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white',
                    TOKENS.bg.danger,
                  )}
                >
                  {cantidadNotificaciones > 9 ? '9+' : cantidadNotificaciones}
                </span>
              )}
            </div>

            <BotonIcono
              icono={<IconoConfiguracion className="h-5 w-5" />}
              label="Configuración"
              variante="secundario"
            />

            <div
              ref={menuRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() => setMostrarMenuUsuario((prev) => !prev)}
                className={cx(
                  'flex items-center gap-3 rounded-3xl border px-3 py-2 shadow-sm transition hover:bg-gray-50',
                  TOKENS.border.subtle,
                  TOKENS.bg.surface,
                )}
              >
                <div className={cx(AVATAR.BASE, AVATAR.BRAND)}>
                  {inicialesUsuario}
                </div>

                <div className="hidden text-left sm:block">
                  <div className={cx(TYPO.BODY, 'max-w-[180px] truncate font-semibold')}>
                    {usuarioActual?.nombreCompleto ?? 'Usuario DevTask'}
                  </div>
                  <div className={TYPO.CAPTION}>{formatearRol(rolActual)}</div>
                </div>
              </button>

              {mostrarMenuUsuario && (
                <div
                  className={cx(
                    'absolute right-0 z-50 mt-2 w-72 rounded-2xl border bg-white shadow-lg',
                    TOKENS.border.subtle,
                  )}
                >
                  <div className={cx('space-y-3 border-b p-3', TOKENS.border.subtle)}>
                    <div>
                      <div className={cx(TYPO.BODY, 'font-semibold')}>
                        {usuarioActual?.nombreCompleto ?? 'Usuario DevTask'}
                      </div>
                      <div className={TYPO.CAPTION}>
                        {usuarioActual?.correo ?? 'sin-correo@devtask.local'}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="selector-usuario-demo"
                        className={cx(TYPO.CAPTION, 'mb-1 block font-semibold uppercase tracking-[0.12em] text-gray-500')}
                      >
                        Usuario demo
                      </label>

                      <div className="relative">
                        <select
                          id="selector-usuario-demo"
                          value={usuarioActual?.id ?? ''}
                          onChange={(event) => {
                            void cambiarUsuarioActualDemo(event.target.value)
                          }}
                          className={cx(SELECT.BASE, SELECT.DEFAULT, 'pr-10')}
                        >
                          {usuariosDemo.map((usuario) => (
                            <option
                              key={usuario.id}
                              value={usuario.id}
                            >
                              {usuario.nombreCompleto} · {formatearRol(usuario.rol)}
                            </option>
                          ))}
                        </select>

                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                          ▾
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMostrarMenuUsuario(false)
                      onCerrarSesion()
                    }}
                    className={cx(
                      'w-full rounded-b-2xl px-4 py-3 text-left text-sm font-medium transition hover:bg-red-50',
                      TOKENS.text.danger,
                    )}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pb-4 lg:hidden">
          <div className="flex flex-wrap items-center gap-2">
            {itemsNavegacion.map((item) => (
              <ItemNavegacionTop
                key={item.pagina}
                etiqueta={item.etiqueta}
                activo={paginaActual === item.pagina}
                onClick={() => onNavegar?.(item.pagina)}
              />
            ))}

            <div className="mt-2 w-full">
              <CajaBusqueda />
            </div>
          </div>
        </div>

        <div className="hidden pb-4 lg:block xl:hidden">
          <CajaBusqueda />
        </div>
      </div>
    </header>
  )
}