import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '../components'
import { useAuth } from '../auth'
import { PAGE_CONTAINER, TYPO } from '../constants/colors'
import {
  AlertasReportesCard,
  ControlTiempoCard,
  EstadoGeneralCard,
  FiltrosReportes,
  KPIsReportes,
  ModalReporteTarea,
  TablaDetalleTareasReporte,
  TablaResumenProyectos,
  TablaResumenResponsables,
} from '../components/reportes'
import {
  filtrarTareasVisiblesPorRol,
  puedeVerReportesGlobales,
} from '../permissions'
import { obtenerTareas } from '../services/tasks.service'
import type {
  EstadoFiltro,
  EstadoTarea,
  PrioridadFiltro,
  PrioridadTarea,
  Tarea,
} from '../types'
import {
  obtenerTextoEstado,
  obtenerTextoPrioridad,
  obtenerVarianteEstado,
  obtenerVariantePrioridad,
  redondearHoras,
} from '../utils/taskFormatters'

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

function calcularPorcentaje(parte: number, total: number) {
  if (total <= 0) return 0
  return Math.round((parte / total) * 100)
}

function generarReporteTarea(tarea: Tarea): ReporteGenerado {
  const horasEstimadas = redondearHoras(tarea.horasEstimadas ?? 0)
  const horasReales = redondearHoras(tarea.horasReales ?? 0)

  let eficienciaTiempo = 'Sin datos suficientes'
  if (horasEstimadas > 0 && horasReales > 0) {
    const porcentaje = Math.round((horasReales / horasEstimadas) * 100)

    if (porcentaje <= 100) {
      eficienciaTiempo = `Dentro de lo estimado (${porcentaje}%)`
    } else {
      eficienciaTiempo = `Por encima de lo estimado (${porcentaje}%)`
    }
  }

  const objetivo =
    tarea.descripcion ||
    tarea.subtitulo ||
    'No se registró una descripción detallada del objetivo de la tarea.'

  const resultado =
    tarea.estado === 'completada'
      ? 'La tarea fue completada y quedó registrada como finalizada dentro del sistema.'
      : tarea.estado === 'en_progreso'
        ? 'La tarea sigue en progreso, por lo que el reporte refleja un avance parcial.'
        : tarea.estado === 'bloqueada'
          ? 'La tarea se encuentra bloqueada y requiere seguimiento adicional.'
          : 'La tarea aún no ha sido completada.'

  const observaciones: string[] = []

  if ((tarea.horasReales ?? 0) > (tarea.horasEstimadas ?? 0) && (tarea.horasEstimadas ?? 0) > 0) {
    observaciones.push('Las horas reales superaron las horas estimadas.')
  }

  if ((tarea.horasReales ?? 0) === 0) {
    observaciones.push('La tarea no registra horas reales aún.')
  }

  if (!tarea.responsableNombre) {
    observaciones.push('La tarea no tiene responsable asignado.')
  }

  if (!tarea.proyectoNombre) {
    observaciones.push('La tarea no está asociada a un proyecto.')
  }

  if (observaciones.length === 0) {
    observaciones.push('La tarea no presenta alertas operativas relevantes con la información actual.')
  }

  return {
    titulo: `Reporte de tarea: ${tarea.titulo}`,
    resumen:
      'Resumen generado a partir de la información actual de la tarea dentro del sistema.',
    objetivo,
    resultado,
    responsable: tarea.responsableNombre || 'Sin responsable',
    proyecto: tarea.proyectoNombre || 'Sin proyecto',
    estado: obtenerTextoEstado(tarea.estado),
    prioridad: obtenerTextoPrioridad(tarea.prioridad),
    horasEstimadas,
    horasReales,
    eficienciaTiempo,
    observaciones,
  }
}

export default function Reportes() {
  const { usuarioActual } = useAuth()

  const [tareas, setTareas] = useState<Tarea[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>('todos')
  const [filtroPrioridad, setFiltroPrioridad] = useState<PrioridadFiltro>('todas')
  const [filtroProyecto, setFiltroProyecto] = useState('todos')
  const [filtroResponsable, setFiltroResponsable] = useState('todos')

  const [modalReporteAbierto, setModalReporteAbierto] = useState(false)
  const [tareaParaReporte, setTareaParaReporte] = useState<Tarea | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)

  useEffect(() => {
    const cargarTareas = async () => {
      try {
        setCargando(true)
        setError(null)
        const data = await obtenerTareas()
        setTareas(data)
      } catch {
        setError('No se pudieron cargar los reportes.')
      } finally {
        setCargando(false)
      }
    }

    void cargarTareas()
  }, [])

  const puedeVerGlobal = useMemo(() => {
    return puedeVerReportesGlobales(usuarioActual)
  }, [usuarioActual])

  const tareasVisibles = useMemo(() => {
    return filtrarTareasVisiblesPorRol(usuarioActual, tareas)
  }, [usuarioActual, tareas])

  const proyectos = useMemo(() => {
    return Array.from(
      new Set(
        tareasVisibles
          .map((tarea) => tarea.proyectoNombre)
          .filter((valor): valor is string => Boolean(valor)),
      ),
    )
  }, [tareasVisibles])

  const responsables = useMemo(() => {
    return Array.from(
      new Set(
        tareasVisibles
          .map((tarea) => tarea.responsableNombre)
          .filter((valor): valor is string => Boolean(valor)),
      ),
    )
  }, [tareasVisibles])

  const tareasFiltradas = useMemo(() => {
    return tareasVisibles.filter((tarea) => {
      const termino = busqueda.trim().toLowerCase()

      const coincideBusqueda =
        !termino ||
        tarea.titulo.toLowerCase().includes(termino) ||
        (tarea.subtitulo || '').toLowerCase().includes(termino) ||
        (tarea.proyectoNombre || '').toLowerCase().includes(termino) ||
        (tarea.responsableNombre || '').toLowerCase().includes(termino)

      const coincideEstado = filtroEstado === 'todos' || tarea.estado === filtroEstado
      const coincidePrioridad =
        filtroPrioridad === 'todas' || tarea.prioridad === filtroPrioridad
      const coincideProyecto =
        filtroProyecto === 'todos' || tarea.proyectoNombre === filtroProyecto
      const coincideResponsable =
        filtroResponsable === 'todos' || tarea.responsableNombre === filtroResponsable

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincidePrioridad &&
        coincideProyecto &&
        coincideResponsable
      )
    })
  }, [
    tareasVisibles,
    busqueda,
    filtroEstado,
    filtroPrioridad,
    filtroProyecto,
    filtroResponsable,
  ])

  const metricasGenerales = useMemo(() => {
    const totalTareas = tareasFiltradas.length
    const pendientes = tareasFiltradas.filter((tarea) => tarea.estado === 'pendiente').length
    const enProgreso = tareasFiltradas.filter(
      (tarea) => tarea.estado === 'en_progreso',
    ).length
    const completadas = tareasFiltradas.filter(
      (tarea) => tarea.estado === 'completada',
    ).length
    const bloqueadas = tareasFiltradas.filter((tarea) => tarea.estado === 'bloqueada').length

    const horasEstimadas = redondearHoras(
      tareasFiltradas.reduce((total, tarea) => total + (tarea.horasEstimadas ?? 0), 0),
    )

    const horasReales = redondearHoras(
      tareasFiltradas.reduce((total, tarea) => total + (tarea.horasReales ?? 0), 0),
    )

    const diferenciaHoras = redondearHoras(horasReales - horasEstimadas)
    const cumplimiento = calcularPorcentaje(completadas, totalTareas)

    return {
      totalTareas,
      pendientes,
      enProgreso,
      completadas,
      bloqueadas,
      horasEstimadas,
      horasReales,
      diferenciaHoras,
      cumplimiento,
    }
  }, [tareasFiltradas])

  const resumenPorProyecto = useMemo(() => {
    const mapa = new Map<
      string,
      {
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
    >()

    tareasFiltradas.forEach((tarea) => {
      const proyecto = tarea.proyectoNombre || 'Sin proyecto'

      if (!mapa.has(proyecto)) {
        mapa.set(proyecto, {
          proyecto,
          total: 0,
          pendientes: 0,
          enProgreso: 0,
          completadas: 0,
          bloqueadas: 0,
          horasEstimadas: 0,
          horasReales: 0,
          avance: 0,
        })
      }

      const actual = mapa.get(proyecto)!

      actual.total += 1
      actual.horasEstimadas += tarea.horasEstimadas ?? 0
      actual.horasReales += tarea.horasReales ?? 0

      if (tarea.estado === 'pendiente') actual.pendientes += 1
      if (tarea.estado === 'en_progreso') actual.enProgreso += 1
      if (tarea.estado === 'completada') actual.completadas += 1
      if (tarea.estado === 'bloqueada') actual.bloqueadas += 1
    })

    return Array.from(mapa.values())
      .map((item) => ({
        ...item,
        horasEstimadas: redondearHoras(item.horasEstimadas),
        horasReales: redondearHoras(item.horasReales),
        avance: calcularPorcentaje(item.completadas, item.total),
      }))
      .sort((a, b) => b.total - a.total)
  }, [tareasFiltradas])

  const resumenPorResponsable = useMemo(() => {
    const mapa = new Map<
      string,
      {
        responsable: string
        total: number
        pendientes: number
        enProgreso: number
        completadas: number
        bloqueadas: number
        horasReales: number
        horasEstimadas: number
      }
    >()

    tareasFiltradas.forEach((tarea) => {
      const responsable = tarea.responsableNombre || 'Sin responsable'

      if (!mapa.has(responsable)) {
        mapa.set(responsable, {
          responsable,
          total: 0,
          pendientes: 0,
          enProgreso: 0,
          completadas: 0,
          bloqueadas: 0,
          horasReales: 0,
          horasEstimadas: 0,
        })
      }

      const actual = mapa.get(responsable)!

      actual.total += 1
      actual.horasEstimadas += tarea.horasEstimadas ?? 0
      actual.horasReales += tarea.horasReales ?? 0

      if (tarea.estado === 'pendiente') actual.pendientes += 1
      if (tarea.estado === 'en_progreso') actual.enProgreso += 1
      if (tarea.estado === 'completada') actual.completadas += 1
      if (tarea.estado === 'bloqueada') actual.bloqueadas += 1
    })

    return Array.from(mapa.values())
      .map((item) => ({
        ...item,
        horasEstimadas: redondearHoras(item.horasEstimadas),
        horasReales: redondearHoras(item.horasReales),
        eficiencia:
          item.horasEstimadas > 0
            ? redondearHoras((item.horasReales / item.horasEstimadas) * 100)
            : 0,
      }))
      .sort((a, b) => b.total - a.total)
  }, [tareasFiltradas])

  const alertas = useMemo(() => {
    const proyectoConMasCarga = resumenPorProyecto[0]
    const responsableConMasCarga = resumenPorResponsable[0]
    const tareasExcedidas = tareasFiltradas.filter(
      (tarea) => (tarea.horasReales ?? 0) > (tarea.horasEstimadas ?? 0),
    ).length

    return {
      proyectoConMasCarga: proyectoConMasCarga?.proyecto || 'Sin datos',
      responsableConMasCarga: responsableConMasCarga?.responsable || 'Sin datos',
      tareasExcedidas,
      tareasBloqueadas: metricasGenerales.bloqueadas,
    }
  }, [resumenPorProyecto, resumenPorResponsable, tareasFiltradas, metricasGenerales])

  const reporteGenerado = useMemo(() => {
    if (!tareaParaReporte) return null
    return generarReporteTarea(tareaParaReporte)
  }, [tareaParaReporte])

  const abrirReporte = (tarea: Tarea) => {
    setTareaParaReporte(tarea)
    setModalReporteAbierto(true)
    setMensaje(`Reporte listo para: ${tarea.titulo}`)
  }

  const cerrarReporte = () => {
    setModalReporteAbierto(false)
    setTareaParaReporte(null)
  }

  const imprimirReporte = () => {
    window.print()
  }

  return (
    <section className={PAGE_CONTAINER}>
      <div className="space-y-6">
        <div>
          <h1 className={TYPO.H1}>Reportes</h1>
          <p className={TYPO.BODY_MUTED}>
            Resumen operativo de tareas, tiempos y avance del equipo.
          </p>
        </div>

        {!puedeVerGlobal && (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#312D2A] shadow-sm">
            Vista ajustada a tu rol actual. Solo ves información de tus tareas permitidas.
          </div>
        )}

        {mensaje && (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#312D2A] shadow-sm">
            {mensaje}
          </div>
        )}

        <FiltrosReportes
          busqueda={busqueda}
          onCambiarBusqueda={setBusqueda}
          filtroProyecto={filtroProyecto}
          onCambiarFiltroProyecto={setFiltroProyecto}
          filtroResponsable={filtroResponsable}
          onCambiarFiltroResponsable={setFiltroResponsable}
          filtroEstado={filtroEstado}
          onCambiarFiltroEstado={setFiltroEstado}
          filtroPrioridad={filtroPrioridad}
          onCambiarFiltroPrioridad={setFiltroPrioridad}
          proyectos={proyectos}
          responsables={responsables}
          onLimpiarFiltros={() => {
            setBusqueda('')
            setFiltroEstado('todos')
            setFiltroPrioridad('todas')
            setFiltroProyecto('todos')
            setFiltroResponsable('todos')
          }}
        />

        {cargando && (
          <Card>
            <CardContent>
              <p className={TYPO.BODY_MUTED}>Cargando reportes...</p>
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
          <>
            <KPIsReportes
              totalTareas={metricasGenerales.totalTareas}
              completadas={metricasGenerales.completadas}
              enProgreso={metricasGenerales.enProgreso}
              horasEstimadas={metricasGenerales.horasEstimadas}
              horasReales={metricasGenerales.horasReales}
              cumplimiento={metricasGenerales.cumplimiento}
            />

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <EstadoGeneralCard
                pendientes={metricasGenerales.pendientes}
                enProgreso={metricasGenerales.enProgreso}
                completadas={metricasGenerales.completadas}
                bloqueadas={metricasGenerales.bloqueadas}
              />

              <ControlTiempoCard
                horasEstimadas={metricasGenerales.horasEstimadas}
                horasReales={metricasGenerales.horasReales}
                diferenciaHoras={metricasGenerales.diferenciaHoras}
              />

              <AlertasReportesCard
                proyectoConMasCarga={alertas.proyectoConMasCarga}
                responsableConMasCarga={alertas.responsableConMasCarga}
                tareasExcedidas={alertas.tareasExcedidas}
                tareasBloqueadas={alertas.tareasBloqueadas}
              />
            </div>

            {puedeVerGlobal && (
              <>
                <TablaResumenProyectos resumenPorProyecto={resumenPorProyecto} />
                <TablaResumenResponsables resumenPorResponsable={resumenPorResponsable} />
              </>
            )}

            <TablaDetalleTareasReporte
              tareasFiltradas={tareasFiltradas}
              redondearHoras={redondearHoras}
              obtenerTextoEstado={obtenerTextoEstado}
              obtenerVarianteEstado={obtenerVarianteEstado}
              obtenerTextoPrioridad={obtenerTextoPrioridad}
              obtenerVariantePrioridad={obtenerVariantePrioridad}
              onAbrirReporte={abrirReporte}
            />
          </>
        )}
      </div>

      <ModalReporteTarea
        abierto={modalReporteAbierto}
        reporteGenerado={reporteGenerado}
        tareaParaReporte={tareaParaReporte}
        onCerrar={cerrarReporte}
        onImprimir={imprimirReporte}
        obtenerVarianteEstado={obtenerVarianteEstado}
        obtenerVariantePrioridad={obtenerVariantePrioridad}
      />
    </section>
  )
}