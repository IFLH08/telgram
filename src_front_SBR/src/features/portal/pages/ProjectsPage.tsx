import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../auth'
import {
  Badge,
  Boton,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components'
import { ALERT, PAGE_CONTAINER, SELECT, TEXTAREA, TYPO, cx } from '../../../constants/colors'
import { usePortal } from '../context'
import {
  calcularResumenProyecto,
  esAdminPortal,
  filtrarProjectsPortal,
  formatearFecha,
  obtenerProyectosVisibles,
} from '../selectors'
import type { PortalProjectInput, ProjectFilters } from '../types'

interface ProjectFormState extends PortalProjectInput {}

const initialProjectFilters: ProjectFilters = {
  busqueda: '',
}

function createEmptyProjectForm(): ProjectFormState {
  return {
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
  }
}

function ProjectModal({
  open,
  saving,
  value,
  onChange,
  onClose,
  onSave,
}: {
  open: boolean
  saving: boolean
  value: ProjectFormState
  onChange: <K extends keyof ProjectFormState>(field: K, nextValue: ProjectFormState[K]) => void
  onClose: () => void
  onSave: () => void
}) {
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

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        className="w-full max-w-2xl rounded-3xl border border-gray-200 bg-white p-6 shadow-xl"
      >
        <div className="mb-6">
          <h2 id="project-modal-title" className={TYPO.H3}>Nuevo proyecto</h2>
          <p className={TYPO.BODY_MUTED}>
            Registra nombre, descripcion y fechas. El portal genera el codigo de acceso
            y crea un Sprint 1 inicial para que el proyecto quede listo.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="project-name" className={TYPO.LABEL}>Nombre</label>
            <input
              id="project-name"
              value={value.nombre}
              onChange={(event) => onChange('nombre', event.target.value)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
              placeholder="Ejemplo: Proyecto de notificaciones"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="project-description" className={TYPO.LABEL}>Descripcion</label>
            <textarea
              id="project-description"
              value={value.descripcion}
              onChange={(event) => onChange('descripcion', event.target.value)}
              className={cx(TEXTAREA.BASE, TEXTAREA.DEFAULT, 'mt-2')}
            />
          </div>

          <div>
            <label htmlFor="project-start-date" className={TYPO.LABEL}>Fecha de inicio</label>
            <input
              id="project-start-date"
              type="date"
              value={value.fechaInicio}
              onChange={(event) => onChange('fechaInicio', event.target.value)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
            />
          </div>

          <div>
            <label htmlFor="project-end-date" className={TYPO.LABEL}>Fecha de fin</label>
            <input
              id="project-end-date"
              type="date"
              value={value.fechaFin}
              onChange={(event) => onChange('fechaFin', event.target.value)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Boton variante="secundario" onClick={onClose}>
            Cancelar
          </Boton>
          <Boton onClick={onSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Crear proyecto'}
          </Boton>
        </div>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const { usuarioActual } = useAuth()
  const { createProject, memberships, projects, sprints, tasks } = usePortal()
  const isAdmin = esAdminPortal(usuarioActual)

  const visibleProjects = useMemo(() => {
    return obtenerProyectosVisibles(usuarioActual, projects, memberships, tasks)
  }, [usuarioActual, projects, memberships, tasks])

  const [filters, setFilters] = useState<ProjectFilters>(initialProjectFilters)
  const [form, setForm] = useState<ProjectFormState>(createEmptyProjectForm)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filteredProjects = useMemo(() => {
    return filtrarProjectsPortal(visibleProjects, filters)
  }, [visibleProjects, filters])

  const projectSummaries = useMemo(() => {
    return filteredProjects.map((project) => calcularResumenProyecto(project, tasks, sprints))
  }, [filteredProjects, tasks, sprints])

  const updateForm = <K extends keyof ProjectFormState>(
    field: K,
    nextValue: ProjectFormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: nextValue,
    }))
  }

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.descripcion.trim() || !form.fechaInicio || !form.fechaFin) {
      setError('Completa nombre, descripcion, fecha de inicio y fecha de fin.')
      return
    }

    if (form.fechaInicio > form.fechaFin) {
      setError('La fecha de inicio no puede ser posterior a la fecha de fin.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await createProject(form)
      setMessage('Proyecto creado correctamente con codigo y Sprint 1 inicial.')
      setModalOpen(false)
      setForm(createEmptyProjectForm())
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'No se pudo crear el proyecto.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className={PAGE_CONTAINER}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className={TYPO.H1}>Proyectos</h1>
            <p className={TYPO.BODY_MUTED}>
              {isAdmin
                ? 'Administra proyectos usando los campos base de la tabla PROYECTOS.'
                : 'Consulta los proyectos a los que ya tienes acceso y su avance derivado.'}
            </p>
          </div>

          {isAdmin && <Boton onClick={() => setModalOpen(true)}>Nuevo proyecto</Boton>}
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

        <Card>
          <CardHeader>
            <CardTitle>Busqueda</CardTitle>
            <CardDescription>
              Filtra proyectos por nombre, descripcion o codigo de acceso.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div>
              <label htmlFor="project-search" className={TYPO.LABEL}>Busqueda</label>
              <input
                id="project-search"
                value={filters.busqueda}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, busqueda: event.target.value }))
                }
                className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
                placeholder="Buscar proyecto o codigo"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          {projectSummaries.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle>{project.nombre}</CardTitle>
                    <CardDescription className="mt-2">{project.descripcion}</CardDescription>
                  </div>

                  <Badge variante="brand">{project.progreso}% completado</Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <p className={TYPO.CAPTION}>Fecha de inicio</p>
                      <p className={cx(TYPO.BODY, 'mt-1 font-semibold')}>
                        {formatearFecha(project.fechaInicio)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <p className={TYPO.CAPTION}>Fecha de fin</p>
                      <p className={cx(TYPO.BODY, 'mt-1 font-semibold')}>
                        {formatearFecha(project.fechaFin)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#D8E3DA] bg-[#EEF3EF] p-4">
                    <p className={TYPO.CAPTION}>Codigo de acceso</p>
                    <p className="mt-1 font-mono text-lg font-medium tracking-[0.18em] text-[#161513]">
                      {project.codigoAcceso}
                    </p>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className={TYPO.CAPTION}>Progreso derivado por tareas completadas</p>
                      <p className={cx(TYPO.BODY, 'font-semibold')}>{project.progreso}%</p>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-[#33553C]"
                        style={{ width: `${project.progreso}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <p className={TYPO.CAPTION}>Sprints</p>
                      <p className={cx(TYPO.BODY, 'mt-1 font-semibold')}>{project.totalSprints}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <p className={TYPO.CAPTION}>Tareas</p>
                      <p className={cx(TYPO.BODY, 'mt-1 font-semibold')}>{project.totalTareas}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <p className={TYPO.CAPTION}>Completadas</p>
                      <p className={cx(TYPO.BODY, 'mt-1 font-semibold')}>
                        {project.tareasCompletadas}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <p className={TYPO.CAPTION}>En progreso</p>
                      <p className={cx(TYPO.BODY, 'mt-1 font-semibold')}>
                        {project.tareasEnProgreso}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {projectSummaries.length === 0 && (
            <Card>
              <CardContent>
                <p className={TYPO.BODY_MUTED}>
                  No hay proyectos que coincidan con la busqueda actual.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {isAdmin && (
        <ProjectModal
          open={modalOpen}
          saving={saving}
          value={form}
          onChange={updateForm}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </section>
  )
}
