import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components'
import { PAGE_CONTAINER, TYPO, cx } from '../constants/colors'

export default function Dashboard() {
  const indicadores = [
    {
      id: 'kpi-1',
      etiqueta: 'Tareas activas',
      valor: '19',
      detalle: '+2 esta semana',
      variante: 'info' as const,
    },
    {
      id: 'kpi-2',
      etiqueta: 'Completadas esta semana',
      valor: '7',
      detalle: '+1 vs semana pasada',
      variante: 'success' as const,
    },
    {
      id: 'kpi-3',
      etiqueta: 'Tareas vencidas',
      valor: '3',
      detalle: 'Requieren atención',
      variante: 'danger' as const,
    },
    {
      id: 'kpi-4',
      etiqueta: 'Proyectos activos',
      valor: '4',
      detalle: 'En operación',
      variante: 'brand' as const,
    },
  ]

  return (
    <section className={PAGE_CONTAINER}>
      <div className="space-y-6">
        <div>
          <h1 className={TYPO.H1}>Dashboard</h1>
          <p className={TYPO.BODY_MUTED}>
            Vista general del sistema, indicadores clave y estado actual del equipo.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {indicadores.map((item) => (
            <Card key={item.id} variante="hover">
              <CardHeader>
                <CardDescription>{item.etiqueta}</CardDescription>
                <CardTitle className="mt-2 text-3xl font-bold">{item.valor}</CardTitle>
              </CardHeader>

              <CardContent>
                <Badge variante={item.variante}>{item.detalle}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Siguiente paso</CardTitle>
            <CardDescription>
              El siguiente bloque del dashboard puede ser alertas y actividad reciente.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p className={cx(TYPO.BODY_MUTED)}>
              Por ahora esta sección deja listo el encabezado y los KPI principales.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}