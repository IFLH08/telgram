import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components'
import { TYPO } from '../../constants/colors'

interface AlertasReportesCardProps {
  proyectoConMasCarga: string
  responsableConMasCarga: string
  tareasExcedidas: number
  tareasBloqueadas: number
}

export default function AlertasReportesCard({
  proyectoConMasCarga,
  responsableConMasCarga,
  tareasExcedidas,
  tareasBloqueadas,
}: AlertasReportesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas rápidas</CardTitle>
        <CardDescription>
          Hallazgos inmediatos con los datos actuales.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className={TYPO.CAPTION}>Proyecto con más carga</p>
            <p className="mt-1 text-sm font-semibold text-[#312D2A]">{proyectoConMasCarga}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className={TYPO.CAPTION}>Responsable con más carga</p>
            <p className="mt-1 text-sm font-semibold text-[#312D2A]">{responsableConMasCarga}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className={TYPO.CAPTION}>Tareas excedidas</p>
            <p className="mt-1 text-sm font-semibold text-[#312D2A]">{tareasExcedidas}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className={TYPO.CAPTION}>Tareas bloqueadas</p>
            <p className="mt-1 text-sm font-semibold text-[#312D2A]">{tareasBloqueadas}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}