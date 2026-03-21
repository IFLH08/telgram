import { useEffect, useMemo, useState } from 'react'
import { Boton, Card, CardContent } from '../components'
import { useAuth } from '../auth'
import { PAGE_CONTAINER, TYPO } from '../constants/colors'
import {
  FiltrosProyectos,
  ResumenProyectos,
  TarjetaProyecto,
} from '../components/proyectos'
import {
  filtrarProyectosVisiblesPorRol,
  filtrarTareasVisiblesPorRol,
  puedeCrearProyecto,
} from '../permissions'
import { obtenerProyectos } from '../services/projects.service'
import { obtenerTareas } from '../services/tasks.service'
import type { Proyecto, Tarea } from '../types'

type EstadoProyectoFiltro = 'todos' | string

function obtenerTextoEstadoProyecto(estado: string) {
  switch (estado) {
    case 'en_progreso':
      return 'En progreso'
    case 'completado':
      return 'Completado'
    case 'pendiente':
      return 'Pendiente'
    case 'bloqueado':
      return 'Bloqueado'
    case 'activo':
      return 'Activo'
    case 'pausado':
      return 'Pausado'
    case 'cancelado':
      return 'Cancelado'
    default:
      return estado
        .split('_')
        .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
        .join(' ')
  }
}

function obtenerVarianteEstadoProyecto(estado: string) {
  switch (estado) {
    case 'completado':
      return 'success' as const
    case 'en_progreso':
    case 'activo':
      return 'info' as const
    case 'pendiente':
      return 'warning' as const
    case 'bloqueado':
    case 'cancelado':
      return 'danger' as const
    case 'pausado':
      return 'neutral' as const
    default:
      return 'neutral' as const
  }
}

function calcularPorcentajeAvance(total: number, completadas: number) {
  if (total <= 0) return 0
  return Math.round((completadas / total) * 100)
}

export default function Proyectos() {
  const { usuarioActual } = useAuth()

  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<EstadoProyectoFiltro>('todos')

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true)
        setError(null)

        const [proyectosData, tareasData] = await Promise.all([
          obtenerProyectos(),
          obtenerTareas(),
        ])

        setProyectos(proyectosData)
        setTareas(tareasData)
      } catch {
        setError('No se pudieron cargar los proyectos.')
      } finally {
        setCargando(false)
      }
    }

    void cargarDatos()
  }, [])

  const tareasVisibles = useMemo(() => {
    return filtrarTareasVisiblesPorRol(usuarioActual, tareas)
  }, [usuarioActual, tareas])

  const proyectosVisibles = useMemo(() => {
    return filtrarProyectosVisiblesPorRol(usuarioActual, proyectos, tareasVisibles)
  }, [usuarioActual, proyectos, tareasVisibles])

  const estadosDisponibles = useMemo(() => {
    return Array.from(
      new Set(proyectosVisibles.map((proyecto) => String(proyecto.estado)).filter(Boolean)),
    )
  }, [proyectosVisibles])

  const proyectosConMetricas = useMemo(() => {
    return proyectosVisibles.map((proyecto) => {
      const tareasProyecto = tareasVisibles.filter(
        (tarea) => tarea.proyectoNombre === proyecto.nombre,
      )

      const totalTareas = tareasProyecto.length
      const tareasCompletadas = tareasProyecto.filter(
        (tarea) => tarea.estado === 'completada',
      ).length
      const tareasEnProgreso = tareasProyecto.filter(
        (tarea) => tarea.estado === 'en_progreso',
      ).length
      const tareasPendientes = tareasProyecto.filter(
        (tarea) => tarea.estado === 'pendiente',
      ).length
      const porcentajeAvance = calcularPorcentajeAvance(totalTareas, tareasCompletadas)

      return {
        ...proyecto,
        totalTareas,
        tareasCompletadas,
        tareasEnProgreso,
        tareasPendientes,
        porcentajeAvance,
      }
    })
  }, [proyectosVisibles, tareasVisibles])

  const proyectosFiltrados = useMemo(() => {
    return proyectosConMetricas.filter((proyecto) => {
      const coincideBusqueda =
        proyecto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (proyecto.descripcion || '').toLowerCase().includes(busqueda.toLowerCase()) ||
        (proyecto.responsableNombre || '').toLowerCase().includes(busqueda.toLowerCase())

      const coincideEstado =
        filtroEstado === 'todos' || String(proyecto.estado) === filtroEstado

      return coincideBusqueda && coincideEstado
    })
  }, [proyectosConMetricas, busqueda, filtroEstado])

  const totalProyectos = proyectosFiltrados.length
  const proyectosEnProgreso = proyectosFiltrados.filter(
    (proyecto) => String(proyecto.estado) === 'en_progreso',
  ).length
  const proyectosCompletados = proyectosFiltrados.filter(
    (proyecto) => String(proyecto.estado) === 'completado',
  ).length

  const puedeCrear = puedeCrearProyecto(usuarioActual)

  return (
    <section className={PAGE_CONTAINER}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className={TYPO.H1}>Proyectos</h1>
            <p className={TYPO.BODY_MUTED}>
              Vista general de proyectos, responsables, tareas y avance actual.
            </p>
          </div>

          {puedeCrear && (
            <div className="flex justify-start lg:justify-end">
              <Boton type="button">
                Nuevo proyecto
              </Boton>
            </div>
          )}
        </div>

        {!puedeCrear && (
          <Card>
            <CardContent>
              <p className={TYPO.BODY_MUTED}>
                Vista de solo lectura para tu rol actual.
              </p>
            </CardContent>
          </Card>
        )}

        <FiltrosProyectos
          busqueda={busqueda}
          onCambiarBusqueda={setBusqueda}
          filtroEstado={filtroEstado}
          onCambiarFiltroEstado={setFiltroEstado}
          estadosDisponibles={estadosDisponibles}
          obtenerTextoEstadoProyecto={obtenerTextoEstadoProyecto}
        />

        <ResumenProyectos
          totalProyectos={totalProyectos}
          proyectosEnProgreso={proyectosEnProgreso}
          proyectosCompletados={proyectosCompletados}
        />

        {cargando && (
          <Card>
            <CardContent>
              <p className={TYPO.BODY_MUTED}>Cargando proyectos...</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card>
            <CardContent>
              <p className="text-sm font-medium text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {!cargando && !error && (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {proyectosFiltrados.map((proyecto) => (
              <TarjetaProyecto
                key={proyecto.id}
                proyecto={proyecto}
                obtenerTextoEstadoProyecto={obtenerTextoEstadoProyecto}
                obtenerVarianteEstadoProyecto={obtenerVarianteEstadoProyecto}
              />
            ))}

            {proyectosFiltrados.length === 0 && (
              <Card>
                <CardContent>
                  <p className={TYPO.BODY_MUTED}>
                    No hay proyectos que coincidan con los filtros actuales.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </section>
  )
}