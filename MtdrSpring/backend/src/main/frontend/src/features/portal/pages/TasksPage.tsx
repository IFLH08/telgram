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
import { ALERT, PAGE_CONTAINER, SELECT, TABLE, TEXTAREA, TYPO, cx } from '../../../constants/colors'
import { usePortal } from '../context'
import {
  esAdminPortal,
  filtrarTareasPortal,
  formatearFecha,
  obtenerProyectosVisibles,
  obtenerSprintsDeProyecto,
  obtenerSprintsDisponibles,
  obtenerTareasVisibles,
  obtenerTextoEstatusTask,
  obtenerTextoPrioridadTask,
  obtenerVarianteEstatusTask,
  obtenerVariantePrioridadTask,
} from '../selectors'
import TaskAIModal from '../components/TaskAIModal'
import TaskPreviewModal from '../components/TaskPreviewModal'
import {
  construirPromptGeneracion,
  convertirRespuestaIABorrador,
  crearFormularioIAInicial,
  type TaskAIFormState,
} from '../task-ai'
import type {
  EstadoTareaPortal,
  PortalTask,
  PortalTaskInput,
  PrioridadTareaPortal,
  TaskFilters,
} from '../types'
import { generarContenidoIA } from '../../../services/ia.service'

interface TaskFormState extends PortalTaskInput {
  proyectoId: string
}

const initialFilters: TaskFilters = {
  busqueda: '',
  estatus: 'todos',
  prioridad: 'todas',
  proyectoId: 'todos',
  sprintId: 'todos',
}

function createEmptyTaskForm(
  projectId = '',
  sprintId = '',
  assigneeId = '',
): TaskFormState {
  return {
    nombre: '',
    descripcion: '',
    estatus: 'pendiente',
    personaAsignadaId: assigneeId,
    fechaEntrega: '',
    horasEstimadas: 1,
    puntosHistoria: 1,
    prioridad: 'media',
    sprintId,
    proyectoId: projectId,
  }
}

function TaskModal({
  assigneeOptions,
  mode,
  open,
  projectOptions,
  saving,
  sprintOptions,
  value,
  onChange,
  onProjectChange,
  onClose,
  onSave,
}: {
  assigneeOptions: Array<{ id: string; nombreCompleto: string }>
  mode: 'create' | 'edit'
  open: boolean
  projectOptions: Array<{ id: string; nombre: string }>
  saving: boolean
  sprintOptions: Array<{ id: string; nombre: string }>
  value: TaskFormState
  onChange: <K extends keyof TaskFormState>(field: K, nextValue: TaskFormState[K]) => void
  onProjectChange: (projectId: string) => void
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
        aria-labelledby="task-modal-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 shadow-xl"
      >
        <div className="mb-6">
          <h2 id="task-modal-title" className={TYPO.H3}>
            {mode === 'create' ? 'Agregar tarea' : 'Editar tarea'}
          </h2>
          <p className={TYPO.BODY_MUTED}>
            La tarea queda asociada a un sprint, conserva trazabilidad de horas y usa
            borrado logico cuando se elimina.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="task-name" className={TYPO.LABEL}>Task name</label>
            <input
              id="task-name"
              value={value.nombre}
              onChange={(event) => onChange('nombre', event.target.value)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
              placeholder="Ejemplo: Implementar API REST"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="task-description" className={TYPO.LABEL}>Description</label>
            <textarea
              id="task-description"
              value={value.descripcion}
              onChange={(event) => onChange('descripcion', event.target.value)}
              className={cx(TEXTAREA.BASE, TEXTAREA.DEFAULT, 'mt-2')}
              placeholder="Describe el entregable esperado y el objetivo tecnico"
            />
          </div>

          <div>
            <label htmlFor="task-assignee" className={TYPO.LABEL}>Assign</label>
            <select
              id="task-assignee"
              value={value.personaAsignadaId}
              onChange={(event) => onChange('personaAsignadaId', event.target.value)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
            >
              <option value="">Selecciona un desarrollador</option>
              {assigneeOptions.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nombreCompleto}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task-project" className={TYPO.LABEL}>Project</label>
            <select
              id="task-project"
              value={value.proyectoId}
              onChange={(event) => onProjectChange(event.target.value)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
            >
              <option value="">Selecciona un proyecto</option>
              {projectOptions.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task-sprint" className={TYPO.LABEL}>Sprint</label>
            <select
              id="task-sprint"
              value={value.sprintId}
              onChange={(event) => onChange('sprintId', event.target.value)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
            >
              <option value="">Selecciona un sprint</option>
              {sprintOptions.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task-due" className={TYPO.LABEL}>Due</label>
            <input
              id="task-due"
              type="date"
              value={value.fechaEntrega}
              onChange={(event) => onChange('fechaEntrega', event.target.value)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
            />
          </div>

          <div>
            <label htmlFor="task-status" className={TYPO.LABEL}>Status</label>
            <select
              id="task-status"
              value={value.estatus}
              onChange={(event) => onChange('estatus', event.target.value as EstadoTareaPortal)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En progreso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div>
            <label htmlFor="task-priority" className={TYPO.LABEL}>Priority</label>
            <select
              id="task-priority"
              value={value.prioridad}
              onChange={(event) =>
                onChange('prioridad', event.target.value as PrioridadTareaPortal)
              }
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>

          <div>
            <label htmlFor="task-planned-hours" className={TYPO.LABEL}>Planned Hours</label>
            <input
              id="task-planned-hours"
              type="number"
              min="1"
              step="0.5"
              value={value.horasEstimadas}
              onChange={(event) => onChange('horasEstimadas', Number(event.target.value))}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
            />
          </div>

          <div>
            <label htmlFor="task-story-points" className={TYPO.LABEL}>Story Points</label>
            <input
              id="task-story-points"
              type="number"
              min="1"
              step="1"
              value={value.puntosHistoria}
              onChange={(event) => onChange('puntosHistoria', Number(event.target.value))}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Boton variante="secundario" onClick={onClose}>
            Cancelar
          </Boton>
          <Boton onClick={onSave} disabled={saving}>
            {saving ? 'Guardando...' : mode === 'create' ? 'Crear tarea' : 'Guardar cambios'}
          </Boton>
        </div>
      </div>
    </div>
  )
}

export default function TasksPage() {
  const { usuarioActual } = useAuth()
  const {
    createTask,
    deleteTask,
    memberships,
    projects,
    sprints,
    startTaskSession,
    stopTaskSession,
    tasks,
    updateTask,
    updateTaskStatus,
    users,
  } = usePortal()

  const isAdmin = esAdminPortal(usuarioActual)
  const developerOptions = useMemo(() => {
    return users.filter((user) => user.rol === 'developer')
  }, [users])

  const visibleProjects = useMemo(() => {
    return obtenerProyectosVisibles(usuarioActual, projects, memberships, tasks)
  }, [usuarioActual, projects, memberships, tasks])

  const visibleTasks = useMemo(() => {
    return obtenerTareasVisibles(usuarioActual, tasks, memberships, projects)
  }, [usuarioActual, tasks, memberships, projects])

  const [filters, setFilters] = useState<TaskFilters>(initialFilters)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<PortalTask | null>(null)
  const [previewTaskId, setPreviewTaskId] = useState<string | null>(null)
  const [sessionBusy, setSessionBusy] = useState(false)

  const [form, setForm] = useState<TaskFormState>(() => {
    const defaultProjectId = visibleProjects[0]?.id ?? ''
    const defaultSprintId = obtenerSprintsDeProyecto(sprints, defaultProjectId)[0]?.id ?? ''
    return createEmptyTaskForm(
      defaultProjectId,
      defaultSprintId,
      developerOptions[0]?.id ?? '',
    )
  })

  const [aiForm, setAiForm] = useState<TaskAIFormState>(() => {
    const defaultProject = visibleProjects[0]
    const defaultSprint = defaultProject
      ? obtenerSprintsDeProyecto(sprints, defaultProject.id)[0]
      : undefined
    const defaultAssignee = developerOptions[0]

    return crearFormularioIAInicial(
      defaultProject?.id ?? '',
      defaultProject?.nombre ?? '',
      defaultSprint?.id ?? '',
      defaultSprint?.nombre ?? '',
      defaultAssignee?.id ?? '',
      defaultAssignee?.nombreCompleto ?? '',
    )
  })

  const filteredTasks = useMemo(() => {
    return filtrarTareasPortal(visibleTasks, filters)
  }, [visibleTasks, filters])

  const previewTask = useMemo(() => {
    if (!previewTaskId) {
      return null
    }

    return visibleTasks.find((task) => task.id === previewTaskId) ?? null
  }, [previewTaskId, visibleTasks])

  useEffect(() => {
    if (previewTaskId && !previewTask) {
      setPreviewTaskId(null)
    }
  }, [previewTask, previewTaskId])

  const sprintFilters = useMemo(() => {
    return obtenerSprintsDisponibles(visibleTasks)
  }, [visibleTasks])

  const formSprints = useMemo(() => {
    return obtenerSprintsDeProyecto(sprints, form.proyectoId)
  }, [form.proyectoId, sprints])

  const aiFormSprints = useMemo(() => {
    return obtenerSprintsDeProyecto(sprints, aiForm.proyectoId)
  }, [aiForm.proyectoId, sprints])

  const resumen = useMemo(() => {
    return {
      total: filteredTasks.length,
      pendientes: filteredTasks.filter((task) => task.estatus === 'pendiente').length,
      enProgreso: filteredTasks.filter((task) => task.estatus === 'en_progreso').length,
      completadas: filteredTasks.filter((task) => task.estatus === 'completada').length,
    }
  }, [filteredTasks])

  const buildInitialAiForm = () => {
    const defaultProject = visibleProjects[0]
    const defaultSprint = defaultProject
      ? obtenerSprintsDeProyecto(sprints, defaultProject.id)[0]
      : undefined
    const defaultAssignee = developerOptions[0]

    return crearFormularioIAInicial(
      defaultProject?.id ?? '',
      defaultProject?.nombre ?? '',
      defaultSprint?.id ?? '',
      defaultSprint?.nombre ?? '',
      defaultAssignee?.id ?? '',
      defaultAssignee?.nombreCompleto ?? '',
    )
  }

  const handleProjectSelection = (projectId: string) => {
    const nextSprintId = obtenerSprintsDeProyecto(sprints, projectId)[0]?.id ?? ''

    setForm((current) => ({
      ...current,
      proyectoId: projectId,
      sprintId: nextSprintId,
    }))
  }

  const handleAIProjectSelection = (projectId: string) => {
    const project = visibleProjects.find((item) => item.id === projectId)
    const nextSprint = obtenerSprintsDeProyecto(sprints, projectId)[0]

    setAiForm((current) => ({
      ...current,
      proyectoId: projectId,
      proyectoNombre: project?.nombre ?? '',
      sprintId: nextSprint?.id ?? '',
      sprintNombre: nextSprint?.nombre ?? '',
    }))
  }

  const handleAISprintSelection = (sprintId: string) => {
    const sprint = aiFormSprints.find((item) => item.id === sprintId)

    setAiForm((current) => ({
      ...current,
      sprintId,
      sprintNombre: sprint?.nombre ?? '',
    }))
  }

  const handleAIAssigneeSelection = (assigneeId: string) => {
    const assignee = developerOptions.find((item) => item.id === assigneeId)

    setAiForm((current) => ({
      ...current,
      personaAsignadaId: assigneeId,
      personaAsignadaNombre: assignee?.nombreCompleto ?? '',
    }))
  }

  const openCreate = () => {
    setError(null)
    setMessage(null)
    setEditingTask(null)

    const defaultProjectId = visibleProjects[0]?.id ?? ''
    const defaultSprintId = obtenerSprintsDeProyecto(sprints, defaultProjectId)[0]?.id ?? ''

    setForm(
      createEmptyTaskForm(
        defaultProjectId,
        defaultSprintId,
        developerOptions[0]?.id ?? '',
      ),
    )
    setModalOpen(true)
  }

  const openGenerateWithAI = () => {
    setError(null)
    setMessage(null)
    setEditingTask(null)
    setAiForm(buildInitialAiForm())
    setAiModalOpen(true)
  }

  const openEdit = (task: PortalTask) => {
    setError(null)
    setMessage(null)
    setEditingTask(task)
    setForm({
      nombre: task.nombre,
      descripcion: task.descripcion,
      estatus: task.estatus,
      personaAsignadaId: task.personaAsignadaId,
      fechaEntrega: task.fechaEntrega,
      horasEstimadas: task.horasEstimadas,
      puntosHistoria: task.puntosHistoria,
      prioridad: task.prioridad,
      sprintId: task.sprintId,
      proyectoId: task.proyectoId,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingTask(null)
  }

  const closeAIModal = () => {
    setAiModalOpen(false)
    setAiForm(buildInitialAiForm())
  }

  const updateForm = <K extends keyof TaskFormState>(field: K, nextValue: TaskFormState[K]) => {
    setForm((current) => ({
      ...current,
      [field]: nextValue,
    }))
  }

  const updateAIForm = <K extends keyof TaskAIFormState>(
    field: K,
    nextValue: TaskAIFormState[K],
  ) => {
    setAiForm((current) => ({
      ...current,
      [field]: nextValue,
    }))
  }

  const validateForm = () => {
    if (
      !form.nombre.trim() ||
      !form.descripcion.trim() ||
      !form.personaAsignadaId ||
      !form.proyectoId ||
      !form.sprintId ||
      !form.fechaEntrega
    ) {
      return 'Completa nombre, descripcion, persona asignada, proyecto, sprint y fecha de entrega.'
    }

    if (form.horasEstimadas <= 0 || form.puntosHistoria <= 0) {
      return 'Las horas estimadas y los puntos de historia deben ser mayores a cero.'
    }

    return null
  }

  const handleSave = async () => {
    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError(null)

    const taskPayload: PortalTaskInput = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      estatus: form.estatus,
      personaAsignadaId: form.personaAsignadaId,
      fechaEntrega: form.fechaEntrega,
      horasEstimadas: form.horasEstimadas,
      puntosHistoria: form.puntosHistoria,
      prioridad: form.prioridad,
      sprintId: form.sprintId,
    }

    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskPayload)
        setMessage('La tarea fue actualizada correctamente.')
      } else {
        await createTask(taskPayload)
        setMessage('La tarea fue creada correctamente.')
      }

      closeModal()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'No se pudo guardar la tarea.',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateWithAI = async () => {
    if (!aiForm.ideaGeneral.trim()) {
      setError('La idea general es obligatoria para generar la tarea con IA.')
      return
    }

    if (!aiForm.proyectoId || !aiForm.sprintId || !aiForm.personaAsignadaId) {
      setError('Selecciona proyecto, sprint y responsable antes de generar el borrador.')
      return
    }

    setGeneratingAI(true)
    setError(null)

    try {
      const prompt = construirPromptGeneracion(aiForm)
      const respuesta = await generarContenidoIA(prompt)
      const borrador = convertirRespuestaIABorrador(respuesta.texto, aiForm)

      setForm({
        nombre: borrador.nombre,
        descripcion: borrador.descripcion,
        estatus: 'pendiente',
        personaAsignadaId: aiForm.personaAsignadaId,
        fechaEntrega: borrador.fechaEntrega,
        horasEstimadas: borrador.horasEstimadas,
        puntosHistoria: borrador.puntosHistoria,
        prioridad: borrador.prioridad,
        sprintId: aiForm.sprintId,
        proyectoId: aiForm.proyectoId,
      })

      setEditingTask(null)
      closeAIModal()
      setModalOpen(true)
      setMessage('Se generó un borrador de tarea con IA. Revísalo y guárdalo.')
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'No se pudo generar la tarea con IA.',
      )
    } finally {
      setGeneratingAI(false)
    }
  }

  const handleDelete = async (taskId: string) => {
    setError(null)

    try {
      await deleteTask(taskId)
      setMessage('La tarea fue eliminada logicamente.')
    } catch {
      setError('No se pudo eliminar la tarea.')
    }
  }

  const handleStatusChange = async (taskId: string, status: EstadoTareaPortal) => {
    setError(null)

    try {
      await updateTaskStatus(taskId, status)
      setMessage('El estatus de la tarea fue actualizado.')
    } catch {
      setError('No se pudo actualizar el estatus de la tarea.')
    }
  }

  const handleOpenTaskPreview = (task: PortalTask) => {
    if (isAdmin) {
      return
    }

    setPreviewTaskId(task.id)
  }

  const handleStartTaskSession = async () => {
    if (!previewTask || !usuarioActual?.id) {
      return
    }

    setSessionBusy(true)
    setError(null)

    try {
      await startTaskSession(previewTask.id, usuarioActual.id)
      setMessage('Sesion de trabajo iniciada.')
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'No se pudo iniciar la sesion de trabajo.',
      )
    } finally {
      setSessionBusy(false)
    }
  }

  const handleStopTaskSession = async () => {
    if (!previewTask || !usuarioActual?.id) {
      return
    }

    setSessionBusy(true)
    setError(null)

    try {
      await stopTaskSession(previewTask.id, usuarioActual.id)
      setMessage('Sesion de trabajo detenida.')
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'No se pudo detener la sesion de trabajo.',
      )
    } finally {
      setSessionBusy(false)
    }
  }

  return (
    <section className={PAGE_CONTAINER}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className={TYPO.H1}>Tareas</h1>
            <p className={TYPO.BODY_MUTED}>
              {isAdmin
                ? 'Administra tareas por proyecto y sprint con campos alineados a la base Oracle.'
                : 'Consulta tus tareas asignadas y actualiza unicamente el estatus.'}
            </p>
          </div>

          {isAdmin && (
            <div className="flex flex-wrap gap-3">
              <Boton variante="secundario" onClick={openGenerateWithAI}>
                Generar con IA
              </Boton>
              <Boton onClick={openCreate}>Agregar tarea</Boton>
            </div>
          )}
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

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardDescription>Total visibles</CardDescription>
              <CardTitle className={cx('mt-2', TYPO.METRIC)}>{resumen.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Pendientes</CardDescription>
              <CardTitle className={cx('mt-2', TYPO.METRIC)}>{resumen.pendientes}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>En progreso</CardDescription>
              <CardTitle className={cx('mt-2', TYPO.METRIC)}>{resumen.enProgreso}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Completadas</CardDescription>
              <CardTitle className={cx('mt-2', TYPO.METRIC)}>{resumen.completadas}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Filtra por nombre, proyecto, sprint, prioridad o estatus.
            </CardDescription>
          </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <label htmlFor="task-filter-search" className={TYPO.LABEL}>Busqueda</label>
              <input
                id="task-filter-search"
                value={filters.busqueda}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, busqueda: event.target.value }))
                }
                className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
                placeholder="Buscar tarea o responsable"
              />
            </div>

            <div>
              <label htmlFor="task-filter-project" className={TYPO.LABEL}>Proyecto</label>
              <select
                id="task-filter-project"
                value={filters.proyectoId}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, proyectoId: event.target.value }))
                }
                className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
              >
                <option value="todos">Todos los proyectos</option>
                {visibleProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-filter-sprint" className={TYPO.LABEL}>Sprint</label>
              <select
                id="task-filter-sprint"
                value={filters.sprintId}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, sprintId: event.target.value }))
                }
                className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
              >
                <option value="todos">Todos los sprints</option>
                {sprintFilters.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-filter-status" className={TYPO.LABEL}>Estatus</label>
              <select
                id="task-filter-status"
                value={filters.estatus}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    estatus: event.target.value as TaskFilters['estatus'],
                  }))
                }
                className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
              >
                <option value="todos">Todos los estatus</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En progreso</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-filter-priority" className={TYPO.LABEL}>Prioridad</label>
              <select
                id="task-filter-priority"
                value={filters.prioridad}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    prioridad: event.target.value as TaskFilters['prioridad'],
                  }))
                }
                className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
              >
                <option value="todas">Todas las prioridades</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

        <Card padding="none">
          <CardHeader className="p-5 pb-0">
            <CardTitle>Listado de tareas</CardTitle>
            <CardDescription>
              {isAdmin
                ? 'Vista completa por proyecto y sprint con acciones manuales para administrar tareas.'
                : 'Tus tareas asignadas dentro de los proyectos a los que tienes acceso.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto rounded-b-2xl">
              <table className={TABLE.TABLE}>
                <thead className={TABLE.THEAD}>
                  <tr>
                    <th className={TABLE.TH}>Task name</th>
                    <th className={TABLE.TH}>Assign</th>
                    <th className={TABLE.TH}>Project</th>
                    <th className={TABLE.TH}>Sprint</th>
                    <th className={TABLE.TH}>Due</th>
                    <th className={TABLE.TH}>Priority</th>
                    <th className={TABLE.TH}>Planned</th>
                    <th className={TABLE.TH}>Points</th>
                    <th className={TABLE.TH}>Real</th>
                    <th className={TABLE.TH}>Status</th>
                    {isAdmin && <th className={TABLE.TH}>Acciones</th>}
                  </tr>
                </thead>

                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className={TABLE.TR}>
                      <td className={TABLE.TD}>
                        {isAdmin ? (
                          <div className="min-w-[240px] max-w-[360px] space-y-1">
                            <p
                              title={task.nombre}
                              className={cx(TYPO.BODY, 'portal-line-clamp-1 portal-wrap-anywhere font-medium')}
                            >
                              {task.nombre}
                            </p>
                            <p
                              title={task.descripcion}
                              className={cx(
                                TYPO.CAPTION,
                                'portal-task-description portal-line-clamp-1 portal-wrap-anywhere leading-5',
                              )}
                            >
                              {task.descripcion}
                            </p>
                          </div>
                        ) : (
                          <button
                            type="button"
                            aria-haspopup="dialog"
                            aria-label={`Ver descripcion completa de ${task.nombre}`}
                            onClick={() => handleOpenTaskPreview(task)}
                            className={cx(
                              'group -mx-2 block w-full rounded-[4px] px-2 py-2 text-left transition',
                              'hover:bg-[#FBFAF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8E3DA]',
                            )}
                          >
                            <div className="min-w-[240px] max-w-[360px] space-y-1">
                              <p
                                title={task.nombre}
                                className={cx(
                                  TYPO.BODY,
                                  'portal-line-clamp-1 portal-wrap-anywhere font-medium transition-colors group-hover:text-[#33553C]',
                                )}
                              >
                                {task.nombre}
                              </p>
                              <p
                                title={task.descripcion}
                                className={cx(
                                  TYPO.CAPTION,
                                  'portal-task-description portal-line-clamp-1 portal-wrap-anywhere leading-5',
                                )}
                              >
                                {task.descripcion}
                              </p>
                              <p className="text-[12px] font-medium leading-5 text-[#8C7126] transition-colors group-hover:text-[#33553C]">
                                Ver descripcion completa
                              </p>
                              {task.sesionesTrabajo.some((session) => !session.finalizadaEn) && (
                                <div className="pt-1">
                                  <Badge variante="info">Sesion activa</Badge>
                                </div>
                              )}
                            </div>
                          </button>
                        )}
                      </td>
                      <td className={TABLE.TD}>{task.personaAsignadaNombre}</td>
                      <td className={TABLE.TD}>{task.proyectoNombre}</td>
                      <td className={TABLE.TD}>
                        <div className="space-y-1">
                          <p>{task.sprintNombre}</p>
                          {task.sprintEsActual && <Badge variante="brand">Sprint actual</Badge>}
                        </div>
                      </td>
                      <td className={TABLE.TD}>{formatearFecha(task.fechaEntrega)}</td>
                      <td className={TABLE.TD}>
                        <Badge variante={obtenerVariantePrioridadTask(task.prioridad)}>
                          {obtenerTextoPrioridadTask(task.prioridad)}
                        </Badge>
                      </td>
                      <td className={TABLE.TD}>{task.horasEstimadas} h</td>
                      <td className={TABLE.TD}>{task.puntosHistoria}</td>
                      <td className={TABLE.TD}>{task.horasReales.toFixed(2)} h</td>
                      <td className={TABLE.TD}>
                        {isAdmin ? (
                          <Badge variante={obtenerVarianteEstatusTask(task.estatus)}>
                            {obtenerTextoEstatusTask(task.estatus)}
                          </Badge>
                        ) : (
                          <select
                            value={task.estatus}
                            onChange={(event) =>
                              void handleStatusChange(
                                task.id,
                                event.target.value as EstadoTareaPortal,
                              )
                            }
                            className={cx(SELECT.BASE, SELECT.DEFAULT, 'min-w-[150px]')}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="en_progreso">En progreso</option>
                            <option value="completada">Completada</option>
                            <option value="cancelada">Cancelada</option>
                          </select>
                        )}
                      </td>
                      {isAdmin && (
                        <td className={TABLE.TD}>
                          <div className="flex gap-2">
                            <Boton variante="secundario" tamano="sm" onClick={() => openEdit(task)}>
                              Editar
                            </Boton>
                            <Boton
                              variante="peligro"
                              tamano="sm"
                              onClick={() => void handleDelete(task.id)}
                            >
                              Eliminar
                            </Boton>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}

                  {filteredTasks.length === 0 && (
                    <tr className={TABLE.TR}>
                      <td className={TABLE.TD} colSpan={isAdmin ? 11 : 10}>
                        No hay tareas que coincidan con los filtros actuales.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {isAdmin && (
        <>
          <TaskAIModal
            assigneeOptions={developerOptions}
            generating={generatingAI}
            open={aiModalOpen}
            projectOptions={visibleProjects}
            sprintOptions={aiFormSprints}
            value={aiForm}
            onAssigneeChange={handleAIAssigneeSelection}
            onChange={updateAIForm}
            onClose={closeAIModal}
            onGenerate={handleGenerateWithAI}
            onProjectChange={handleAIProjectSelection}
            onSprintChange={handleAISprintSelection}
          />
          <TaskModal
            assigneeOptions={developerOptions}
            mode={editingTask ? 'edit' : 'create'}
            open={modalOpen}
            projectOptions={visibleProjects}
            saving={saving}
            sprintOptions={formSprints}
            value={form}
            onChange={updateForm}
            onProjectChange={handleProjectSelection}
            onClose={closeModal}
            onSave={handleSave}
          />
        </>
      )}

      {!isAdmin && (
        <TaskPreviewModal
          open={Boolean(previewTask)}
          task={previewTask}
          sessionBusy={sessionBusy}
          onClose={() => setPreviewTaskId(null)}
          onStartSession={handleStartTaskSession}
          onStopSession={handleStopTaskSession}
        />
      )}
    </section>
  )
}
