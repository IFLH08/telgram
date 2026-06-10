import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Boton } from '../components'
import { ALERT, LAYOUT, SELECT, SURFACE, TYPO, cx } from '../constants/colors'
import { useAuth } from './auth.context'

function formatRole(role: string) {
  return role === 'admin' ? 'Administrador' : 'Desarrollador'
}

export default function LoginPage() {
  const {
    usuarios,
    cargando,
    error,
    cambiarUsuarioActualDemo,
    refrescarUsuarioActual,
  } = useAuth()
  const [usuarioId, setUsuarioId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const defaultUserId = useMemo(() => {
    return usuarios.find((usuario) => usuario.rol === 'admin')?.id ?? usuarios[0]?.id ?? ''
  }, [usuarios])

  useEffect(() => {
    if (!usuarioId && defaultUserId) {
      setUsuarioId(defaultUserId)
    }
  }, [defaultUserId, usuarioId])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!usuarioId || submitting) {
      return
    }

    setSubmitting(true)
    try {
      await cambiarUsuarioActualDemo(usuarioId)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#161513]">
      <div className={cx(LAYOUT.PAGE_CONTAINER_SM, 'flex min-h-screen items-center')}>
        <section className="w-full space-y-6">
          <div className="space-y-2">
            <p className={TYPO.CAPTION}>Portal de administracion</p>
            <h1 className={TYPO.DISPLAY}>DevTracker</h1>
            <p className={TYPO.BODY_MUTED}>
              Selecciona un usuario cargado desde la base para iniciar la demo.
            </p>
          </div>

          <form className={cx(SURFACE.CARD, 'space-y-5 p-5')} onSubmit={handleSubmit}>
            <div>
              <label htmlFor="login-demo-user" className={TYPO.LABEL}>
                Usuario demo
              </label>
              <select
                id="login-demo-user"
                value={usuarioId}
                onChange={(event) => setUsuarioId(event.target.value)}
                className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
                disabled={cargando || usuarios.length === 0}
              >
                {usuarios.length === 0 && <option value="">Sin usuarios disponibles</option>}
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombreCompleto} - {formatRole(usuario.rol)}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className={cx(ALERT.BASE, ALERT.DANGER)} role="alert">
                {error}
              </div>
            )}

            {!error && !cargando && usuarios.length === 0 && (
              <div className={cx(ALERT.BASE, ALERT.WARNING)} role="alert">
                No hay usuarios reales disponibles en /api/usuarios.
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Boton
                type="button"
                variante="secundario"
                onClick={() => void refrescarUsuarioActual()}
                disabled={cargando || submitting}
              >
                Reintentar
              </Boton>
              <Boton
                type="submit"
                disabled={cargando || submitting || !usuarioId}
              >
                {submitting ? 'Entrando...' : 'Entrar'}
              </Boton>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}
