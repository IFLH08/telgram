import { useEffect } from 'react'
import { Boton } from '../../../components'
import { INPUT, SELECT, TEXTAREA, TYPO, cx } from '../../../constants/colors'
import type { PrioridadTareaPortal } from '../types'
import type { TaskAIFormState } from '../task-ai'

interface TaskAIModalProps {
  assigneeOptions: Array<{ id: string; nombreCompleto: string }>
  generating: boolean
  open: boolean
  onAssigneeChange: (assigneeId: string) => void
  projectOptions: Array<{ id: string; nombre: string }>
  onClose: () => void
  onChange: <K extends keyof TaskAIFormState>(
    field: K,
    nextValue: TaskAIFormState[K],
  ) => void
  onGenerate: () => void
  onProjectChange: (projectId: string) => void
  onSprintChange: (sprintId: string) => void
  sprintOptions: Array<{ id: string; nombre: string }>
  value: TaskAIFormState
}

export default function TaskAIModal({
  assigneeOptions,
  generating,
  open,
  onAssigneeChange,
  projectOptions,
  onClose,
  onChange,
  onGenerate,
  onProjectChange,
  onSprintChange,
  sprintOptions,
  value,
}: TaskAIModalProps) {
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
        aria-labelledby="task-ai-modal-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 shadow-xl"
      >
        <div className="mb-6">
          <h2 id="task-ai-modal-title" className={TYPO.H3}>Generar tarea con IA</h2>
          <p className={TYPO.BODY_MUTED}>
            Describe la idea general y el contexto para generar un borrador alineado al
            proyecto, sprint y responsable seleccionados.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="task-ai-idea" className={TYPO.LABEL}>Idea general</label>
            <textarea
              id="task-ai-idea"
              value={value.ideaGeneral}
              onChange={(event) => onChange('ideaGeneral', event.target.value)}
              className={cx(TEXTAREA.BASE, TEXTAREA.DEFAULT, 'mt-2')}
              placeholder="Ejemplo: definir un flujo para registrar tareas desde Telegram"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="task-ai-context" className={TYPO.LABEL}>Contexto o detalles</label>
            <textarea
              id="task-ai-context"
              value={value.contexto}
              onChange={(event) => onChange('contexto', event.target.value)}
              className={cx(TEXTAREA.BASE, TEXTAREA.DEFAULT, 'mt-2')}
              placeholder="Objetivo, alcance, restricciones, criterios de aceptacion o entregables"
            />
          </div>

          <div>
            <label htmlFor="task-ai-project" className={TYPO.LABEL}>Proyecto</label>
            <select
              id="task-ai-project"
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
            <label htmlFor="task-ai-sprint" className={TYPO.LABEL}>Sprint</label>
            <select
              id="task-ai-sprint"
              value={value.sprintId}
              onChange={(event) => onSprintChange(event.target.value)}
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
            <label htmlFor="task-ai-assignee" className={TYPO.LABEL}>Responsable sugerido</label>
            <select
              id="task-ai-assignee"
              value={value.personaAsignadaId}
              onChange={(event) => onAssigneeChange(event.target.value)}
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
            <label htmlFor="task-ai-priority" className={TYPO.LABEL}>Prioridad sugerida</label>
            <select
              id="task-ai-priority"
              value={value.prioridadObjetivo}
              onChange={(event) =>
                onChange(
                  'prioridadObjetivo',
                  event.target.value as PrioridadTareaPortal,
                )
              }
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="task-ai-summary" className={TYPO.LABEL}>Resumen de contexto</label>
            <input
              id="task-ai-summary"
              value={[
                value.proyectoNombre || 'Sin proyecto',
                value.sprintNombre || 'Sin sprint',
                value.personaAsignadaNombre || 'Sin responsable',
              ].join(' · ')}
              readOnly
              className={cx(INPUT.BASE, INPUT.SUBTLE, 'mt-2')}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Boton variante="secundario" onClick={onClose}>
            Cancelar
          </Boton>
          <Boton onClick={onGenerate} disabled={generating}>
            {generating ? 'Generando...' : 'Generar borrador'}
          </Boton>
        </div>
      </div>
    </div>
  )
}
