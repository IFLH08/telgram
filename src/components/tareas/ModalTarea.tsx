import { Boton, FlechaSelect } from '../../components'
import { SELECT, SURFACE, TEXTAREA, TYPO, cx } from '../../constants/colors'
import type { EstadoTarea, PrioridadTarea } from '../../types'

interface FormularioTarea {
  titulo: string
  subtitulo: string
  descripcion: string
  estado: EstadoTarea
  prioridad: PrioridadTarea
  categoria: string
  responsableNombre: string
  proyectoNombre: string
  fechaLimite: string
}

interface ModalTareaProps {
  abierto: boolean
  modoFormulario: 'crear' | 'editar'
  formulario: FormularioTarea
  guardando: boolean
  responsablesDisponibles: string[]
  proyectosDisponibles: string[]
  categoriasDisponibles: string[]
  onCerrar: () => void
  onGuardar: () => void
  onCambiarFormulario: <K extends keyof FormularioTarea>(
    campo: K,
    valor: FormularioTarea[K]
  ) => void
}

export default function ModalTarea({
  abierto,
  modoFormulario,
  formulario,
  guardando,
  responsablesDisponibles,
  proyectosDisponibles,
  categoriasDisponibles,
  onCerrar,
  onGuardar,
  onCambiarFormulario,
}: ModalTareaProps) {
  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className={cx(SURFACE.CARD, 'w-full max-w-2xl p-6')}>
        <div className="mb-6">
          <h2 className={TYPO.H3}>
            {modoFormulario === 'crear' ? 'Nueva tarea' : 'Editar tarea'}
          </h2>
          <p className={TYPO.BODY_MUTED}>
            {modoFormulario === 'crear'
              ? 'Completa o ajusta los datos principales de la tarea.'
              : 'Edita los datos principales de la tarea.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={TYPO.LABEL}>Título</label>
            <input
              value={formulario.titulo}
              onChange={(e) => onCambiarFormulario('titulo', e.target.value)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
              placeholder="Título de la tarea"
            />
          </div>

          <div className="md:col-span-2">
            <label className={TYPO.LABEL}>Subtítulo</label>
            <input
              value={formulario.subtitulo}
              onChange={(e) => onCambiarFormulario('subtitulo', e.target.value)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
              placeholder="Subtítulo o resumen"
            />
          </div>

          <div className="md:col-span-2">
            <label className={TYPO.LABEL}>Descripción</label>
            <textarea
              value={formulario.descripcion}
              onChange={(e) => onCambiarFormulario('descripcion', e.target.value)}
              className={cx(TEXTAREA.BASE, TEXTAREA.DEFAULT, 'mt-2')}
              placeholder="Descripción"
            />
          </div>

          <div>
            <label className={TYPO.LABEL}>Estado</label>
            <div className="relative mt-2">
              <select
                value={formulario.estado}
                onChange={(e) => onCambiarFormulario('estado', e.target.value as EstadoTarea)}
                className={cx(SELECT.BASE, SELECT.DEFAULT, 'appearance-none pr-12')}
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En progreso</option>
                <option value="completada">Completada</option>
                <option value="bloqueada">Bloqueada</option>
              </select>
              <FlechaSelect />
            </div>
          </div>

          <div>
            <label className={TYPO.LABEL}>Prioridad</label>
            <div className="relative mt-2">
              <select
                value={formulario.prioridad}
                onChange={(e) => onCambiarFormulario('prioridad', e.target.value as PrioridadTarea)}
                className={cx(SELECT.BASE, SELECT.DEFAULT, 'appearance-none pr-12')}
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
              <FlechaSelect />
            </div>
          </div>

          <div>
            <label className={TYPO.LABEL}>Responsable</label>
            <div className="relative mt-2">
              <select
                value={formulario.responsableNombre}
                onChange={(e) => onCambiarFormulario('responsableNombre', e.target.value)}
                className={cx(SELECT.BASE, SELECT.DEFAULT, 'appearance-none pr-12')}
              >
                <option value="">Escribe o selecciona un responsable</option>
                {responsablesDisponibles.map((responsable) => (
                  <option key={responsable} value={responsable}>
                    {responsable}
                  </option>
                ))}
              </select>
              <FlechaSelect />
            </div>
          </div>

          <div>
            <label className={TYPO.LABEL}>Proyecto</label>
            <div className="relative mt-2">
              <select
                value={formulario.proyectoNombre}
                onChange={(e) => onCambiarFormulario('proyectoNombre', e.target.value)}
                className={cx(SELECT.BASE, SELECT.DEFAULT, 'appearance-none pr-12')}
              >
                <option value="">Escribe o selecciona un proyecto</option>
                {proyectosDisponibles.map((proyecto) => (
                  <option key={proyecto} value={proyecto}>
                    {proyecto}
                  </option>
                ))}
              </select>
              <FlechaSelect />
            </div>
          </div>

          <div>
            <label className={TYPO.LABEL}>Categoría</label>
            <div className="relative mt-2">
              <select
                value={formulario.categoria}
                onChange={(e) => onCambiarFormulario('categoria', e.target.value)}
                className={cx(SELECT.BASE, SELECT.DEFAULT, 'appearance-none pr-12')}
              >
                <option value="">Escribe o selecciona una categoría</option>
                {categoriasDisponibles.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
              <FlechaSelect />
            </div>
          </div>

          <div>
            <label className={TYPO.LABEL}>Fecha límite</label>
            <input
              type="date"
              value={formulario.fechaLimite}
              onChange={(e) => onCambiarFormulario('fechaLimite', e.target.value)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Boton variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton onClick={onGuardar} disabled={guardando}>
            {guardando
              ? 'Guardando...'
              : modoFormulario === 'crear'
                ? 'Crear tarea'
                : 'Guardar cambios'}
          </Boton>
        </div>
      </div>
    </div>
  )
}