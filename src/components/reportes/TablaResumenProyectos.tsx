import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components'
import { TABLE } from '../../constants/colors'

interface ResumenProyectoItem {
  proyecto: string
  total: number
  pendientes: number
  enProgreso: number
  completadas: number
  bloqueadas: number
  horasEstimadas: number
  horasReales: number
  avance: number
}

interface TablaResumenProyectosProps {
  resumenPorProyecto: ResumenProyectoItem[]
}

export default function TablaResumenProyectos({
  resumenPorProyecto,
}: TablaResumenProyectosProps) {
  return (
    <Card padding="none">
      <CardHeader className="p-5 pb-0">
        <CardTitle>Resumen por proyecto</CardTitle>
        <CardDescription>
          Totales, avance y control de tiempo por proyecto.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <div className={TABLE.WRAPPER}>
          <table className={TABLE.TABLE}>
            <thead className={TABLE.THEAD}>
              <tr>
                <th className={TABLE.TH}>Proyecto</th>
                <th className={TABLE.TH}>Total</th>
                <th className={TABLE.TH}>Completadas</th>
                <th className={TABLE.TH}>En progreso</th>
                <th className={TABLE.TH}>Pendientes</th>
                <th className={TABLE.TH}>Horas est.</th>
                <th className={TABLE.TH}>Horas real.</th>
                <th className={TABLE.TH}>Avance</th>
              </tr>
            </thead>

            <tbody>
              {resumenPorProyecto.map((proyecto) => (
                <tr key={proyecto.proyecto} className={TABLE.TR}>
                  <td className={TABLE.TD}>{proyecto.proyecto}</td>
                  <td className={TABLE.TD}>{proyecto.total}</td>
                  <td className={TABLE.TD}>{proyecto.completadas}</td>
                  <td className={TABLE.TD}>{proyecto.enProgreso}</td>
                  <td className={TABLE.TD}>{proyecto.pendientes}</td>
                  <td className={TABLE.TD}>{proyecto.horasEstimadas} h</td>
                  <td className={TABLE.TD}>{proyecto.horasReales} h</td>
                  <td className={TABLE.TD}>{proyecto.avance}%</td>
                </tr>
              ))}

              {resumenPorProyecto.length === 0 && (
                <tr className={TABLE.TR}>
                  <td className={TABLE.TD} colSpan={8}>
                    No hay datos por proyecto con los filtros actuales.
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