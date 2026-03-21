import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components'
import { TYPO } from '../../constants/colors'

interface ControlTiempoCardProps {
  horasEstimadas: number
  horasReales: number
  diferenciaHoras: number
}

export default function ControlTiempoCard({
  horasEstimadas,
  horasReales,
  diferenciaHoras,
}: ControlTiempoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Control de tiempo</CardTitle>
        <CardDescription>
          Comparación entre horas estimadas y horas reales.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className={TYPO.CAPTION}>Horas estimadas</p>
            <p className="mt-1 text-2xl font-bold text-[#312D2A]">{horasEstimadas} h</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className={TYPO.CAPTION}>Horas reales</p>
            <p className="mt-1 text-2xl font-bold text-[#312D2A]">{horasReales} h</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className={TYPO.CAPTION}>Diferencia</p>
            <p className="mt-1 text-2xl font-bold text-[#312D2A]">{diferenciaHoras} h</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}