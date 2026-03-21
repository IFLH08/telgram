import { Badge, Boton } from '../../components'
import { SURFACE, TYPO, cx } from '../../constants/colors'
import type { EstadoTarea, PrioridadTarea, Tarea } from '../../types'

interface ReporteGenerado {
  titulo: string
  resumen: string
  objetivo: string
  resultado: string
  responsable: string
  proyecto: string
  estado: string
  prioridad: string
  horasEstimadas: number
  horasReales: number
  eficienciaTiempo: string
  observaciones: string[]
}

interface ModalReporteTareaProps {
  abierto: boolean
  reporteGenerado: ReporteGenerado | null
  tareaParaReporte: Tarea | null
  onCerrar: () => void
  onImprimir: () => void
  obtenerVarianteEstado: (estado: EstadoTarea) => 'warning' | 'info' | 'success' | 'danger' | 'neutral'
  obtenerVariantePrioridad: (
    prioridad: PrioridadTarea
  ) => 'warning' | 'info' | 'success' | 'danger' | 'neutral'
}

export default function ModalReporteTarea({
  abierto,
  reporteGenerado,
  tareaParaReporte,
  onCerrar,
  onImprimir,
  obtenerVarianteEstado,
  obtenerVariantePrioridad,
}: ModalReporteTareaProps) {
  if (!abierto || !reporteGenerado || !tareaParaReporte) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className={cx(SURFACE.CARD, 'w-full max-w-3xl p-6')}>
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className={TYPO.H3}>{reporteGenerado.titulo}</h2>
            <p className={TYPO.BODY_MUTED}>{reporteGenerado.resumen}</p>
          </div>

          <div className="flex gap-3">
            <Boton variante="secundario" onClick={onImprimir}>
              Imprimir
            </Boton>
            <Boton variante="secundario" onClick={onCerrar}>
              Cerrar
            </Boton>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className={TYPO.CAPTION}>Tarea</p>
              <p className="mt-1 text-sm font-semibold text-[#312D2A]">
                {tareaParaReporte.titulo}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className={TYPO.CAPTION}>Proyecto</p>
              <p className="mt-1 text-sm font-semibold text-[#312D2A]">
                {reporteGenerado.proyecto}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className={TYPO.CAPTION}>Responsable</p>
              <p className="mt-1 text-sm font-semibold text-[#312D2A]">
                {reporteGenerado.responsable}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className={TYPO.CAPTION}>Estado actual</p>
              <div className="mt-2">
                <Badge variante={obtenerVarianteEstado(tareaParaReporte.estado)}>
                  {reporteGenerado.estado}
                </Badge>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className={TYPO.CAPTION}>Prioridad</p>
              <div className="mt-2">
                <Badge variante={obtenerVariantePrioridad(tareaParaReporte.prioridad)}>
                  {reporteGenerado.prioridad}
                </Badge>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className={TYPO.CAPTION}>Tiempo</p>
              <p className="mt-1 text-sm font-semibold text-[#312D2A]">
                Est.: {reporteGenerado.horasEstimadas} h · Real: {reporteGenerado.horasReales} h
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className={TYPO.CAPTION}>Objetivo / contexto</p>
            <p className="mt-2 whitespace-pre-line text-sm text-[#312D2A]">
              {reporteGenerado.objetivo}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className={TYPO.CAPTION}>Resultado</p>
            <p className="mt-2 text-sm text-[#312D2A]">{reporteGenerado.resultado}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className={TYPO.CAPTION}>Lectura de tiempo</p>
            <p className="mt-2 text-sm text-[#312D2A]">{reporteGenerado.eficienciaTiempo}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className={TYPO.CAPTION}>Observaciones</p>
            <div className="mt-2 space-y-2">
              {reporteGenerado.observaciones.map((observacion, index) => (
                <p key={`${observacion}-${index}`} className="text-sm text-[#312D2A]">
                  - {observacion}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}