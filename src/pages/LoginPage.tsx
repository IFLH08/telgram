import { useState, type FormEvent } from 'react'
import { Boton } from '../components/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card'
import { ALERT, INPUT, TYPO, cx } from '../constants/colors'

interface LoginPageProps {
  onLogin: (nombre: string, contrasena: string) => Promise<unknown>
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [nombre, setNombre] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setCargando(true)

    try {
      await onLogin(nombre.trim(), contrasena)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'No se pudo iniciar sesion.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#FBFAF8] px-6 py-10 text-[#161513]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col items-center justify-center gap-6">
        <div className="space-y-2 text-center">
          <p className={cx(TYPO.CAPTION, 'uppercase tracking-[0.08em]')}>
            Portal de administracion
          </p>
          <h1 className="text-[36px] font-medium leading-tight text-[#161513]">
            DevTracker
          </h1>
        </div>

          <Card padding="lg" className="w-full">
            <CardHeader>
              <CardTitle>Iniciar sesion</CardTitle>
              <p className={TYPO.BODY_MUTED}>
                Usa tus credenciales de desarrollador. 
              </p>
            </CardHeader>

            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="login-nombre" className="mb-1 block text-[14px] font-medium">
                    Nombre
                  </label>
                  <input
                    id="login-nombre"
                    value={nombre}
                    onChange={(event) => setNombre(event.target.value)}
                    className={cx(INPUT.BASE, error ? INPUT.ERROR : INPUT.DEFAULT)}
                    autoComplete="username"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="login-contrasena" className="mb-1 block text-[14px] font-medium">
                    Contrasena
                  </label>
                  <input
                    id="login-contrasena"
                    type="password"
                    value={contrasena}
                    onChange={(event) => setContrasena(event.target.value)}
                    className={cx(INPUT.BASE, error ? INPUT.ERROR : INPUT.DEFAULT)}
                    autoComplete="current-password"
                    required
                  />
                </div>

                {error && <div className={cx(ALERT.BASE, ALERT.DANGER)}>{error}</div>}

                <Boton type="submit" tamano="lg" anchoCompleto disabled={cargando}>
                  {cargando ? 'Validando...' : 'Entrar'}
                </Boton>
              </form>
            </CardContent>
          </Card>
      </div>
    </main>
  )
}
