import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components'
import { TABLE } from '../../constants/colors'

interface ResumenResponsableItem {
  responsable: string
  total: number
  pendientes: number
  enProgreso: number
  completadas: number
  bloqueadas: number
  horasReales: number
  horasEstimadas: number
  eficiencia: number
}

interface TablaResumenResponsablesProps {
  resumenPorResponsable: ResumenResponsableItem[]
}

export default function TablaResumenResponsables({
  resumenPorResponsable,
}: TablaResumenResponsablesProps) {
  return (
    <Card padding="none">
      <CardHeader className="p-5 pb-0">
        <CardTitle>Resumen por responsable</CardTitle>
        <CardDescription>
          Distribución de carga, avance y tiempo por responsable.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <div className={TABLE.WRAPPER}>
          <table className={TABLE.TABLE}>
            <thead className={TABLE.THEAD}>
              <tr>
                <th className={TABLE.TH}>Responsable</th>
                <th className={TABLE.TH}>Total</th>
                <th className={TABLE.TH}>Completadas</th>
                <th className={TABLE.TH}>En progreso</th>
                <th className={TABLE.TH}>Pendientes</th>
                <th className={TABLE.TH}>Bloqueadas</th>
                <th className={TABLE.TH}>Horas est.</th>
                <th className={TABLE.TH}>Horas real.</th>
                <th className={TABLE.TH}>Uso tiempo</th>
              </tr>
            </thead>

            <tbody>
              {resumenPorResponsable.map((responsable) => (
                <tr key={responsable.responsable} className={TABLE.TR}>
                  <td className={TABLE.TD}>{responsable.responsable}</td>
                  <td className={TABLE.TD}>{responsable.total}</td>
                  <td className={TABLE.TD}>{responsable.completadas}</td>
                  <td className={TABLE.TD}>{responsable.enProgreso}</td>
                  <td className={TABLE.TD}>{responsable.pendientes}</td>
                  <td className={TABLE.TD}>{responsable.bloqueadas}</td>
                  <td className={TABLE.TD}>{responsable.horasEstimadas} h</td>
                  <td className={TABLE.TD}>{responsable.horasReales} h</td>
                  <td className={TABLE.TD}>{responsable.eficiencia}%</td>
                </tr>
              ))}

              {resumenPorResponsable.length === 0 && (
                <tr className={TABLE.TR}>
                  <td className={TABLE.TD} colSpan={9}>
                    No hay datos por responsable con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}