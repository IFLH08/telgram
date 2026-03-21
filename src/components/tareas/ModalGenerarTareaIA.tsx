import { Boton } from '../../components'
import { INPUT, SELECT, SURFACE, TEXTAREA, TYPO, cx } from '../../constants/colors'
import type { PrioridadTarea } from '../../types'

interface FormularioGeneracionIA {
  ideaGeneral: string
  contexto: string
  proyectoNombre: string
  responsableNombre: string
  prioridadObjetivo: PrioridadTarea
}

interface ModalGenerarTareaIAProps {
  abierto: boolean
  formularioIA: FormularioGeneracionIA
  generandoIA: boolean
  responsablesDisponibles: string[]
  proyectosDisponibles: string[]
  onCerrar: () => void
  onGenerar: () => void
  onCambiarFormularioIA: <K extends keyof FormularioGeneracionIA>(
    campo: K,
    valor: FormularioGeneracionIA[K]
  ) => void
}

export default function ModalGenerarTareaIA({
  abierto,
  formularioIA,
  generandoIA,
  responsablesDisponibles,
  proyectosDisponibles,
  onCerrar,
  onGenerar,
  onCambiarFormularioIA,
}: ModalGenerarTareaIAProps) {
  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className={cx(SURFACE.CARD, 'w-full max-w-2xl p-6')}>
        <div className="mb-6">
          <h2 className={TYPO.H3}>Generar tarea con IA</h2>
          <p className={TYPO.BODY_MUTED}>
            Describe la idea general, el contexto y el proyecto para generar un borrador
            completo de tarea.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={TYPO.LABEL}>Idea general</label>
            <textarea
              value={formularioIA.ideaGeneral}
              onChange={(e) => onCambiarFormularioIA('ideaGeneral', e.target.value)}
              className={cx(TEXTAREA.BASE, TEXTAREA.DEFAULT, 'mt-2')}
              placeholder="Ejemplo: crear una vista para controlar el tiempo de trabajo de las tareas"
            />
          </div>

          <div className="md:col-span-2">
            <label className={TYPO.LABEL}>Contexto o detalles</label>
            <textarea
              value={formularioIA.contexto}
              onChange={(e) => onCambiarFormularioIA('contexto', e.target.value)}
              className={cx(TEXTAREA.BASE, TEXTAREA.DEFAULT, 'mt-2')}
              placeholder="Agrega objetivo, alcance, restricciones o entregables esperados"
            />
          </div>

          <div>
            <label className={TYPO.LABEL}>Proyecto</label>
            <input
              list="proyectos-disponibles-ia"
              value={formularioIA.proyectoNombre}
              onChange={(e) => onCambiarFormularioIA('proyectoNombre', e.target.value)}
              className={cx(INPUT.BASE, INPUT.DEFAULT, 'mt-2')}
              placeholder="Escribe o selecciona un proyecto"
            />
            <datalist id="proyectos-disponibles-ia">
              {proyectosDisponibles.map((proyecto) => (
                <option key={proyecto} value={proyecto} />
              ))}
            </datalist>
          </div>

          <div>
            <label className={TYPO.LABEL}>Responsable sugerido</label>
            <input
              list="responsables-disponibles-ia"
              value={formularioIA.responsableNombre}
              onChange={(e) => onCambiarFormularioIA('responsableNombre', e.target.value)}
              className={cx(INPUT.BASE, INPUT.DEFAULT, 'mt-2')}
              placeholder="Escribe o selecciona un responsable"
            />
            <datalist id="responsables-disponibles-ia">
              {responsablesDisponibles.map((responsable) => (
                <option key={responsable} value={responsable} />
              ))}
            </datalist>
          </div>

          <div>
            <label className={TYPO.LABEL}>Prioridad sugerida</label>
            <select
              value={formularioIA.prioridadObjetivo}
              onChange={(e) =>
                onCambiarFormularioIA('prioridadObjetivo', e.target.value as PrioridadTarea)
              }
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Boton variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton onClick={onGenerar} disabled={generandoIA}>
            {generandoIA ? 'Generando...' : 'Generar borrador'}
          </Boton>
        </div>
      </div>
    </div>
  )
}