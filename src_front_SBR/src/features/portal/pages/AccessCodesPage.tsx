import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../auth'
import {
  Boton,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components'
import { ALERT, PAGE_CONTAINER, SELECT, TABLE, TYPO, cx } from '../../../constants/colors'
import { usePortal } from '../context'
import { esAdminPortal, formatearFecha, obtenerProyectosVisibles } from '../selectors'

export default function AccessCodesPage() {
  const { usuarioActual } = useAuth()
  const {
    generateAccessCode,
    joinWithCode,
    memberships,
    projects,
    tasks,
  } = usePortal()

  const isAdmin = esAdminPortal(usuarioActual)
  const visibleProjects = useMemo(() => {
    return obtenerProyectosVisibles(usuarioActual, projects, memberships, tasks)
  }, [usuarioActual, projects, memberships, tasks])

  const [selectedProjectId, setSelectedProjectId] = useState(visibleProjects[0]?.id ?? '')
  const [codeInput, setCodeInput] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedProjectId && visibleProjects[0]?.id) {
      setSelectedProjectId(visibleProjects[0].id)
    }
  }, [selectedProjectId, visibleProjects])

  const handleGenerate = async () => {
    if (!selectedProjectId) {
      setError('Selecciona un proyecto para actualizar el codigo.')
      return
    }

    setError(null)

    try {
      const project = await generateAccessCode(selectedProjectId)
      setMessage(`Codigo actualizado: ${project.codigoAcceso}`)
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'No se pudo actualizar el codigo de acceso.',
      )
    }
  }

  const handleJoin = async () => {
    if (!usuarioActual?.id || !codeInput.trim()) {
      setError('Ingresa un codigo de acceso valido.')
      return
    }

    setError(null)

    try {
      const result = await joinWithCode(codeInput, usuarioActual.id)
      setMessage(result.message)
      setCodeInput('')
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'No se pudo procesar el codigo de acceso.',
      )
    }
  }

  return (
    <section className={PAGE_CONTAINER}>
      <div className="space-y-6">
        <div>
          <h1 className={TYPO.H1}>Codigos de acceso</h1>
          <p className={TYPO.BODY_MUTED}>
            {isAdmin
              ? 'Cada proyecto conserva un codigo unico y puede regenerarse cuando sea necesario.'
              : 'Ingresa el codigo compartido por el administrador para obtener acceso a un proyecto.'}
          </p>
        </div>

        {message && (
          <div className={cx(ALERT.BASE, ALERT.SUCCESS)}>
            {message}
          </div>
        )}

        {error && (
          <div className={cx(ALERT.BASE, ALERT.DANGER)}>
            {error}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          {isAdmin ? (
            <Card>
              <CardHeader>
                <CardTitle>Actualizar codigo</CardTitle>
                <CardDescription>
                  Selecciona el proyecto para regenerar su codigo de acceso.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <label htmlFor="access-code-project" className={TYPO.LABEL}>
                    Proyecto
                  </label>
                  <select
                    id="access-code-project"
                    value={selectedProjectId}
                    onChange={(event) => setSelectedProjectId(event.target.value)}
                    className={cx(SELECT.BASE, SELECT.DEFAULT)}
                  >
                    <option value="">Selecciona un proyecto</option>
                    {visibleProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.nombre}
                      </option>
                    ))}
                  </select>

                  <Boton anchoCompleto onClick={() => void handleGenerate()}>
                    Regenerar codigo
                  </Boton>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Ingresar codigo</CardTitle>
                <CardDescription>
                  Introduce el codigo recibido del administrador para habilitar acceso al proyecto.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <label htmlFor="access-code-input" className={TYPO.LABEL}>
                    Codigo de acceso
                  </label>
                  <input
                    id="access-code-input"
                    value={codeInput}
                    onChange={(event) => setCodeInput(event.target.value.toUpperCase())}
                    className={cx(SELECT.BASE, SELECT.DEFAULT)}
                    placeholder="Ejemplo: ABC12345"
                  />

                  <Boton anchoCompleto onClick={() => void handleJoin()}>
                    Unirme al proyecto
                  </Boton>
                </div>
              </CardContent>
            </Card>
          )}

          <Card padding="none">
            <CardHeader className="p-5 pb-0">
              <CardTitle>{isAdmin ? 'Codigos vigentes' : 'Proyectos con acceso'}</CardTitle>
              <CardDescription>
                {isAdmin
                  ? 'Listado actual del codigo almacenado en cada proyecto visible.'
                  : 'Proyectos visibles para tu usuario a partir de tareas asignadas o codigos validos.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              {isAdmin ? (
                <div className="overflow-x-auto">
                  <table className={TABLE.TABLE}>
                    <thead className={TABLE.THEAD}>
                      <tr>
                        <th className={TABLE.TH}>Proyecto</th>
                        <th className={TABLE.TH}>Codigo</th>
                        <th className={TABLE.TH}>Inicio</th>
                        <th className={TABLE.TH}>Fin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleProjects.map((project) => (
                        <tr key={project.id} className={TABLE.TR}>
                          <td className={TABLE.TD}>{project.nombre}</td>
                          <td className={TABLE.TD}>
                            <span className="font-semibold tracking-[0.18em]">
                              {project.codigoAcceso}
                            </span>
                          </td>
                          <td className={TABLE.TD}>{formatearFecha(project.fechaInicio)}</td>
                          <td className={TABLE.TD}>{formatearFecha(project.fechaFin)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="space-y-3 p-5">
                  {visibleProjects.map((project) => (
                    <div
                      key={project.id}
                      className="rounded-2xl border border-gray-200 bg-white p-4"
                    >
                      <p className={cx(TYPO.BODY, 'font-semibold')}>{project.nombre}</p>
                      <p className={TYPO.CAPTION}>{project.descripcion}</p>
                    </div>
                  ))}

                  {visibleProjects.length === 0 && (
                    <p className={TYPO.BODY_MUTED}>
                      Todavia no tienes acceso a proyectos. Usa un codigo valido para unirte.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
