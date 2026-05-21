import { useMemo } from 'react'
import { useAuth } from '../../../auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components'
import { ALERT, PAGE_CONTAINER, TABLE, TYPO, cx } from '../../../constants/colors'
import { usePortal } from '../context'
import { esAdminPortal, formatearFecha, obtenerProyectosVisibles } from '../selectors'

export default function AccessCodesPage() {
  const { usuarioActual } = useAuth()
  const { memberships, projects, tasks } = usePortal()

  const isAdmin = esAdminPortal(usuarioActual)
  const visibleProjects = useMemo(() => {
    return obtenerProyectosVisibles(usuarioActual, projects, memberships, tasks)
  }, [usuarioActual, projects, memberships, tasks])

  return (
    <section className={PAGE_CONTAINER}>
      <div className="space-y-6">
        <div>
          <h1 className={TYPO.H1}>Codigos de acceso</h1>
          <p className={TYPO.BODY_MUTED}>
            Los codigos visibles se leen desde los proyectos reales de /api/proyectos.
          </p>
        </div>

        <div className={cx(ALERT.BASE, ALERT.WARNING)}>
          Regenerar codigos y unirse por codigo queda fuera del demo real hasta
          que exista un endpoint backend para esas acciones.
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader>
              <CardTitle>Acciones no conectadas</CardTitle>
              <CardDescription>
                La base actual expone el codigo almacenado en cada proyecto, pero
                no una API para rotarlo o validar altas por codigo.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className={TYPO.BODY_MUTED}>
                Esta pantalla no se considera parte del recorrido de demo con
                datos reales. El flujo principal queda en proyectos, sprints,
                tareas y usuarios conectados.
              </p>
            </CardContent>
          </Card>

          <Card padding="none">
            <CardHeader className="p-5 pb-0">
              <CardTitle>{isAdmin ? 'Codigos vigentes' : 'Proyectos con acceso'}</CardTitle>
              <CardDescription>
                {isAdmin
                  ? 'Listado actual del codigo almacenado en cada proyecto visible.'
                  : 'Proyectos visibles para tu usuario a partir de tareas asignadas o membresias conectadas.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
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
                            {project.codigoAcceso || 'Sin codigo'}
                          </span>
                        </td>
                        <td className={TABLE.TD}>{formatearFecha(project.fechaInicio)}</td>
                        <td className={TABLE.TD}>{formatearFecha(project.fechaFin)}</td>
                      </tr>
                    ))}

                    {visibleProjects.length === 0 && (
                      <tr className={TABLE.TR}>
                        <td className={TABLE.TD} colSpan={4}>
                          No hay proyectos visibles para el usuario actual.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
