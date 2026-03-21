import { useEffect, useMemo, useState } from 'react'
import { Boton } from '../components'
import { useAuth } from '../auth'
import { PAGE_CONTAINER, TYPO } from '../constants/colors'
import {
  FiltrosTareas,
  ModalGenerarTareaIA,
  ModalTarea,
  PanelTareaPrincipal,
  ResumenTareas,
  TablaTareas,
} from '../components/tareas'
import {
  puedeCrearTarea,
  puedeEditarTarea,
  puedeEliminarTarea,
  puedeRegistrarTiempoTarea,
  filtrarTareasVisiblesPorRol,
} from '../permissions'
import {
  actualizarTarea,
  crearTarea,
  eliminarTarea,
  obtenerTareas,
} from '../services/tasks.service'
import type { EstadoTarea, PrioridadTarea, Tarea } from '../types'

type EstadoFiltro = 'todos' | EstadoTarea
type PrioridadFiltro = 'todas' | PrioridadTarea

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

interface FormularioGeneracionIA {
  ideaGeneral: string
  contexto: string
  proyectoNombre: string
  responsableNombre: string
  prioridadObjetivo: PrioridadTarea
}

const formularioInicial: FormularioTarea = {
  titulo: '',
  subtitulo: '',
  descripcion: '',
  estado: 'pendiente',
  prioridad: 'media',
  categoria: '',
  responsableNombre: '',
  proyectoNombre: '',
  fechaLimite: '',
}

const formularioIAInicial: FormularioGeneracionIA = {
  ideaGeneral: '',
  contexto: '',
  proyectoNombre: '',
  responsableNombre: '',
  prioridadObjetivo: 'media',
}

function obtenerTextoEstado(estado: EstadoTarea) {
  switch (estado) {
    case 'pendiente':
      return 'Pendiente'
    case 'en_progreso':
      return 'En progreso'
    case 'completada':
      return 'Completada'
    case 'bloqueada':
      return 'Bloqueada'
    default:
      return estado
  }
}

function obtenerVarianteEstado(estado: EstadoTarea) {
  switch (estado) {
    case 'pendiente':
      return 'warning' as const
    case 'en_progreso':
      return 'info' as const
    case 'completada':
      return 'success' as const
    case 'bloqueada':
      return 'danger' as const
    default:
      return 'neutral' as const
  }
}

function obtenerTextoPrioridad(prioridad: PrioridadTarea) {
  switch (prioridad) {
    case 'alta':
      return 'Alta'
    case 'media':
      return 'Media'
    case 'baja':
      return 'Baja'
    default:
      return prioridad
  }
}

function obtenerVariantePrioridad(prioridad: PrioridadTarea) {
  switch (prioridad) {
    case 'alta':
      return 'danger' as const
    case 'media':
      return 'warning' as const
    case 'baja':
      return 'info' as const
    default:
      return 'neutral' as const
  }
}

function formatearSegundos(segundos: number) {
  const horas = Math.floor(segundos / 3600)
  const minutos = Math.floor((segundos % 3600) / 60)
  const restantes = segundos % 60

  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(
    restantes,
  ).padStart(2, '0')}`
}

function redondearHoras(valor: number) {
  return Math.round(valor * 100) / 100
}

function capitalizar(texto: string) {
  if (!texto.trim()) return ''
  return texto.trim().charAt(0).toUpperCase() + texto.trim().slice(1)
}

function generarFechaLimiteSugerida() {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + 7)
  return fecha.toISOString().split('T')[0]
}

function generarBorradorTareaIA(formularioIA: FormularioGeneracionIA): FormularioTarea {
  const idea = formularioIA.ideaGeneral.trim()
  const contexto = formularioIA.contexto.trim()
  const proyecto = formularioIA.proyectoNombre.trim()
  const responsable = formularioIA.responsableNombre.trim()

  const tituloBase = capitalizar(idea) || 'Nueva tarea generada con IA'
  const subtituloBase = proyecto
    ? `Tarea propuesta para ${proyecto}`
    : 'Tarea propuesta automáticamente'

  const descripcionPartes = [
    `Objetivo principal: ${idea || 'Definir alcance de la tarea.'}`,
    contexto ? `Contexto adicional: ${contexto}` : '',
    proyecto ? `Proyecto relacionado: ${proyecto}` : '',
    responsable ? `Responsable sugerido: ${responsable}` : '',
    'Entregable esperado: actividad lista para ejecutarse, revisar y registrar en el portal.',
  ].filter(Boolean)

  let categoria = 'General'

  if (
    idea.toLowerCase().includes('frontend') ||
    idea.toLowerCase().includes('interfaz') ||
    idea.toLowerCase().includes('pantalla') ||
    idea.toLowerCase().includes('ui')
  ) {
    categoria = 'Frontend'
  } else if (
    idea.toLowerCase().includes('backend') ||
    idea.toLowerCase().includes('api') ||
    idea.toLowerCase().includes('servicio')
  ) {
    categoria = 'Backend'
  } else if (
    idea.toLowerCase().includes('reporte') ||
    idea.toLowerCase().includes('dashboard') ||
    idea.toLowerCase().includes('métrica')
  ) {
    categoria = 'Reportes'
  } else if (
    idea.toLowerCase().includes('bug') ||
    idea.toLowerCase().includes('error') ||
    idea.toLowerCase().includes('ajuste')
  ) {
    categoria = 'Mantenimiento'
  }

  return {
    titulo: tituloBase,
    subtitulo: subtituloBase,
    descripcion: descripcionPartes.join('\n\n'),
    estado: 'pendiente',
    prioridad: formularioIA.prioridadObjetivo,
    categoria,
    responsableNombre: responsable,
    proyectoNombre: proyecto,
    fechaLimite: generarFechaLimiteSugerida(),
  }
}

export default function Tareas() {
  const { usuarioActual } = useAuth()

  const [tareas, setTareas] = useState<Tarea[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [busquedaTarea, setBusquedaTarea] = useState('')
  const [busquedaResponsable, setBusquedaResponsable] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>('todos')
  const [filtroPrioridad, setFiltroPrioridad] = useState<PrioridadFiltro>('todas')
  const [filtroProyecto, setFiltroProyecto] = useState('todos')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalIAAbierto, setModalIAAbierto] = useState(false)
  const [modoFormulario, setModoFormulario] = useState<'crear' | 'editar'>('crear')
  const [tareaSeleccionada, setTareaSeleccionada] = useState<Tarea | null>(null)
  const [formulario, setFormulario] = useState<FormularioTarea>(formularioInicial)
  const [formularioIA, setFormularioIA] = useState<FormularioGeneracionIA>(formularioIAInicial)
  const [guardando, setGuardando] = useState(false)
  const [generandoIA, setGenerandoIA] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const [busquedaTareaActiva, setBusquedaTareaActiva] = useState('')
  const [tareaActivaId, setTareaActivaId] = useState<string>('')
  const [enSeguimiento, setEnSeguimiento] = useState(false)
  const [tiempoActivoSegundos, setTiempoActivoSegundos] = useState(0)

  const cargarTareas = async () => {
    try {
      setCargando(true)
      setError(null)
      const data = await obtenerTareas()
      setTareas(data)
    } catch {
      setError('No se pudieron cargar las tareas.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    void cargarTareas()
  }, [])

  useEffect(() => {
    if (!enSeguimiento) return

    const intervalo = window.setInterval(() => {
      setTiempoActivoSegundos((prev) => prev + 1)
    }, 1000)

    return () => window.clearInterval(intervalo)
  }, [enSeguimiento])

  const tareasVisibles = useMemo(() => {
    return filtrarTareasVisiblesPorRol(usuarioActual, tareas)
  }, [usuarioActual, tareas])

  useEffect(() => {
    if (!tareaActivaId) return

    const tareaSigueVisible = tareasVisibles.some((tarea) => tarea.id === tareaActivaId)

    if (!tareaSigueVisible) {
      setTareaActivaId('')
      setEnSeguimiento(false)
      setTiempoActivoSegundos(0)
      setBusquedaTareaActiva('')
    }
  }, [tareaActivaId, tareasVisibles])

  const proyectos = useMemo(() => {
    return Array.from(
      new Set(
        tareasVisibles
          .map((tarea) => tarea.proyectoNombre)
          .filter((valor): valor is string => Boolean(valor)),
      ),
    )
  }, [tareasVisibles])

  const responsablesDisponibles = useMemo(() => {
    return Array.from(
      new Set(
        tareasVisibles
          .map((tarea) => tarea.responsableNombre)
          .filter((valor): valor is string => Boolean(valor)),
      ),
    )
  }, [tareasVisibles])

  const proyectosDisponibles = useMemo(() => {
    return Array.from(
      new Set(
        tareasVisibles
          .map((tarea) => tarea.proyectoNombre)
          .filter((valor): valor is string => Boolean(valor)),
      ),
    )
  }, [tareasVisibles])

  const categoriasDisponibles = useMemo(() => {
    const categoriasBase = ['Frontend', 'Backend', 'Reportes', 'Mantenimiento', 'General']

    const categoriasExistentes = tareasVisibles
      .map((tarea) => tarea.categoria)
      .filter((valor): valor is string => Boolean(valor))

    return Array.from(new Set([...categoriasBase, ...categoriasExistentes]))
  }, [tareasVisibles])

  const opcionesBusquedaTareas = useMemo(() => {
    return Array.from(
      new Set(
        tareasVisibles
          .map((tarea) => tarea.titulo?.trim())
          .filter((valor): valor is string => Boolean(valor)),
      ),
    )
  }, [tareasVisibles])

  const opcionesBusquedaResponsables = useMemo(() => {
    return Array.from(
      new Set(
        tareasVisibles
          .map((tarea) => tarea.responsableNombre?.trim())
          .filter((valor): valor is string => Boolean(valor)),
      ),
    )
  }, [tareasVisibles])

  const tareasFiltradas = useMemo(() => {
    return tareasVisibles.filter((tarea) => {
      const terminoTarea = busquedaTarea.toLowerCase()
      const terminoResponsable = busquedaResponsable.toLowerCase()

      const coincideBusquedaTarea =
        !terminoTarea ||
        tarea.titulo.toLowerCase().includes(terminoTarea) ||
        (tarea.subtitulo || '').toLowerCase().includes(terminoTarea)

      const coincideBusquedaResponsable =
        !terminoResponsable ||
        (tarea.responsableNombre || '').toLowerCase().includes(terminoResponsable)

      const coincideEstado = filtroEstado === 'todos' || tarea.estado === filtroEstado

      const coincidePrioridad =
        filtroPrioridad === 'todas' || tarea.prioridad === filtroPrioridad

      const coincideProyecto =
        filtroProyecto === 'todos' || tarea.proyectoNombre === filtroProyecto

      return (
        coincideBusquedaTarea &&
        coincideBusquedaResponsable &&
        coincideEstado &&
        coincidePrioridad &&
        coincideProyecto
      )
    })
  }, [
    tareasVisibles,
    busquedaTarea,
    busquedaResponsable,
    filtroEstado,
    filtroPrioridad,
    filtroProyecto,
  ])

  const opcionesTareaActiva = useMemo(() => {
    const termino = busquedaTareaActiva.trim().toLowerCase()

    if (!termino) return tareasVisibles

    return tareasVisibles.filter((tarea) => {
      const etiqueta = tarea.proyectoNombre
        ? `${tarea.titulo} · ${tarea.proyectoNombre}`.toLowerCase()
        : tarea.titulo.toLowerCase()

      return (
        tarea.titulo.toLowerCase().includes(termino) ||
        (tarea.proyectoNombre || '').toLowerCase().includes(termino) ||
        etiqueta.includes(termino)
      )
    })
  }, [tareasVisibles, busquedaTareaActiva])

  const tareaActiva = useMemo(() => {
    return tareasVisibles.find((tarea) => tarea.id === tareaActivaId) || null
  }, [tareasVisibles, tareaActivaId])

  const horasRealesEnPantalla = useMemo(() => {
    if (!tareaActiva) return 0

    const horasBase = tareaActiva.horasReales ?? 0
    const horasSesion = tiempoActivoSegundos / 3600

    return redondearHoras(horasBase + horasSesion)
  }, [tareaActiva, tiempoActivoSegundos])

  const tareasPendientes = tareasFiltradas.filter((t) => t.estado === 'pendiente').length
  const tareasEnProgreso = tareasFiltradas.filter((t) => t.estado === 'en_progreso').length
  const tareasCompletadas = tareasFiltradas.filter((t) => t.estado === 'completada').length

  const puedeCrear = puedeCrearTarea(usuarioActual)

  const abrirModalCrear = () => {
    if (!puedeCrear) {
      setMensaje('Tu rol actual no puede crear tareas.')
      return
    }

    setModoFormulario('crear')
    setTareaSeleccionada(null)
    setFormulario(formularioInicial)
    setModalAbierto(true)
  }

  const abrirModalGenerarIA = () => {
    if (!puedeCrear) {
      setMensaje('Tu rol actual no puede crear tareas.')
      return
    }

    setFormularioIA(formularioIAInicial)
    setModalIAAbierto(true)
  }

  const abrirModalEditar = (tarea: Tarea) => {
    if (!puedeEditarTarea(usuarioActual, tarea)) {
      setMensaje('Tu rol actual no puede editar esta tarea.')
      return
    }

    setModoFormulario('editar')
    setTareaSeleccionada(tarea)
    setFormulario({
      titulo: tarea.titulo,
      subtitulo: tarea.subtitulo || '',
      descripcion: tarea.descripcion || '',
      estado: tarea.estado,
      prioridad: tarea.prioridad,
      categoria: tarea.categoria || '',
      responsableNombre: tarea.responsableNombre || '',
      proyectoNombre: tarea.proyectoNombre || '',
      fechaLimite: tarea.fechaLimite || '',
    })
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setTareaSeleccionada(null)
    setFormulario(formularioInicial)
  }

  const cerrarModalIA = () => {
    setModalIAAbierto(false)
    setFormularioIA(formularioIAInicial)
  }

  const manejarCambioFormulario = <K extends keyof FormularioTarea>(
    campo: K,
    valor: FormularioTarea[K],
  ) => {
    setFormulario((prev) => ({ ...prev, [campo]: valor }))
  }

  const manejarCambioFormularioIA = <K extends keyof FormularioGeneracionIA>(
    campo: K,
    valor: FormularioGeneracionIA[K],
  ) => {
    setFormularioIA((prev) => ({ ...prev, [campo]: valor }))
  }

  const manejarGuardar = async () => {
    if (!formulario.titulo.trim()) {
      setMensaje('El título es obligatorio.')
      return
    }

    if (modoFormulario === 'crear' && !puedeCrear) {
      setMensaje('Tu rol actual no puede crear tareas.')
      return
    }

    if (
      modoFormulario === 'editar' &&
      tareaSeleccionada &&
      !puedeEditarTarea(usuarioActual, tareaSeleccionada)
    ) {
      setMensaje('Tu rol actual no puede editar esta tarea.')
      return
    }

    try {
      setGuardando(true)
      setMensaje(null)

      if (modoFormulario === 'crear') {
        const nueva = await crearTarea({
          titulo: formulario.titulo,
          subtitulo: formulario.subtitulo,
          descripcion: formulario.descripcion,
          estado: formulario.estado,
          prioridad: formulario.prioridad,
          categoria: formulario.categoria || undefined,
          responsableNombre: formulario.responsableNombre || undefined,
          proyectoNombre: formulario.proyectoNombre || undefined,
          fechaLimite: formulario.fechaLimite || undefined,
        })

        setTareas((prev) => [nueva, ...prev])
        setMensaje('Tarea creada correctamente.')
      }

      if (modoFormulario === 'editar' && tareaSeleccionada) {
        const actualizada = await actualizarTarea(tareaSeleccionada.id, {
          titulo: formulario.titulo,
          subtitulo: formulario.subtitulo,
          descripcion: formulario.descripcion,
          estado: formulario.estado,
          prioridad: formulario.prioridad,
          categoria: formulario.categoria || undefined,
          responsableNombre: formulario.responsableNombre || undefined,
          proyectoNombre: formulario.proyectoNombre || undefined,
          fechaLimite: formulario.fechaLimite || undefined,
        })

        if (actualizada) {
          setTareas((prev) =>
            prev.map((t) => (t.id === tareaSeleccionada.id ? actualizada : t)),
          )
          setMensaje('Tarea actualizada correctamente.')
        }
      }

      cerrarModal()
    } catch {
      setMensaje('Ocurrió un error al guardar la tarea.')
    } finally {
      setGuardando(false)
    }
  }

  const manejarGenerarConIA = async () => {
    if (!puedeCrear) {
      setMensaje('Tu rol actual no puede crear tareas.')
      return
    }

    if (!formularioIA.ideaGeneral.trim()) {
      setMensaje('La idea general es obligatoria para generar la tarea.')
      return
    }

    try {
      setGenerandoIA(true)
      setMensaje(null)

      const borrador = generarBorradorTareaIA(formularioIA)

      setModoFormulario('crear')
      setTareaSeleccionada(null)
      setFormulario(borrador)
      setModalIAAbierto(false)
      setModalAbierto(true)
      setMensaje('Se generó un borrador de tarea con IA. Revísalo y guárdalo.')
    } catch {
      setMensaje('No se pudo generar la tarea con IA.')
    } finally {
      setGenerandoIA(false)
    }
  }

  const manejarEliminar = async (id: string) => {
    const tareaAEliminar = tareas.find((tarea) => tarea.id === id)

    if (!tareaAEliminar || !puedeEliminarTarea(usuarioActual)) {
      setMensaje('Tu rol actual no puede eliminar esta tarea.')
      return
    }

    const confirmar = window.confirm('¿Seguro que quieres eliminar esta tarea?')
    if (!confirmar) return

    try {
      const respuesta = await eliminarTarea(id)
      if (respuesta.ok) {
        setTareas((prev) => prev.filter((t) => t.id !== id))

        if (tareaActivaId === id) {
          setTareaActivaId('')
          setEnSeguimiento(false)
          setTiempoActivoSegundos(0)
          setBusquedaTareaActiva('')
        }

        setMensaje('Tarea eliminada correctamente.')
      } else {
        setMensaje('No se pudo eliminar la tarea.')
      }
    } catch {
      setMensaje('Ocurrió un error al eliminar la tarea.')
    }
  }

  const iniciarSeguimiento = async () => {
    if (!tareaActiva) {
      setMensaje('Selecciona una tarea principal antes de iniciar.')
      return
    }

    if (!puedeRegistrarTiempoTarea(usuarioActual, tareaActiva)) {
      setMensaje('Tu rol actual no puede registrar tiempo en esta tarea.')
      return
    }

    setMensaje(null)
    setEnSeguimiento(true)
  }

  const detenerSeguimiento = async () => {
    if (!tareaActiva || tiempoActivoSegundos <= 0) {
      setEnSeguimiento(false)
      setTiempoActivoSegundos(0)
      return
    }

    if (!puedeRegistrarTiempoTarea(usuarioActual, tareaActiva)) {
      setMensaje('Tu rol actual no puede registrar tiempo en esta tarea.')
      setEnSeguimiento(false)
      setTiempoActivoSegundos(0)
      return
    }

    try {
      const nuevasHorasReales = redondearHoras(
        (tareaActiva.horasReales ?? 0) + tiempoActivoSegundos / 3600,
      )

      const actualizada = await actualizarTarea(tareaActiva.id, {
        horasReales: nuevasHorasReales,
      })

      setTareas((prev) =>
        prev.map((t) =>
          t.id === tareaActiva.id
            ? {
                ...(actualizada || t),
                horasReales: nuevasHorasReales,
              }
            : t,
        ),
      )

      setMensaje('Tiempo registrado correctamente.')
    } catch {
      setMensaje('No se pudo registrar el tiempo de la tarea.')
    } finally {
      setEnSeguimiento(false)
      setTiempoActivoSegundos(0)
    }
  }

  return (
    <section className={PAGE_CONTAINER}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className={TYPO.H1}>Tareas</h1>
            <p className={TYPO.BODY_MUTED}>
              Gestión de tareas del equipo, estatus, prioridades y tiempo de trabajo.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {puedeCrear && (
              <>
                <Boton variante="secundario" onClick={abrirModalGenerarIA}>
                  Generar tarea con IA
                </Boton>
                <Boton onClick={abrirModalCrear}>Nueva tarea</Boton>
              </>
            )}
          </div>
        </div>

        {!puedeCrear && (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#312D2A] shadow-sm">
            Vista ajustada a tu rol actual. Puedes trabajar solo con las tareas permitidas.
          </div>
        )}

        {mensaje && (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#312D2A] shadow-sm">
            {mensaje}
          </div>
        )}

        <PanelTareaPrincipal
          busquedaTareaActiva={busquedaTareaActiva}
          onCambiarBusquedaTareaActiva={setBusquedaTareaActiva}
          tareaActivaId={tareaActivaId}
          onCambiarTareaActivaId={setTareaActivaId}
          opcionesTareaActiva={opcionesTareaActiva}
          tareaActiva={tareaActiva}
          enSeguimiento={enSeguimiento}
          tiempoActivoFormateado={formatearSegundos(tiempoActivoSegundos)}
          horasRealesEnPantalla={horasRealesEnPantalla}
          onIniciarSeguimiento={iniciarSeguimiento}
          onDetenerSeguimiento={detenerSeguimiento}
          obtenerTextoEstado={obtenerTextoEstado}
          obtenerVarianteEstado={obtenerVarianteEstado}
          obtenerTextoPrioridad={obtenerTextoPrioridad}
          obtenerVariantePrioridad={obtenerVariantePrioridad}
        />

        <FiltrosTareas
          busquedaTarea={busquedaTarea}
          onCambiarBusquedaTarea={setBusquedaTarea}
          busquedaResponsable={busquedaResponsable}
          onCambiarBusquedaResponsable={setBusquedaResponsable}
          filtroEstado={filtroEstado}
          onCambiarFiltroEstado={setFiltroEstado}
          filtroPrioridad={filtroPrioridad}
          onCambiarFiltroPrioridad={setFiltroPrioridad}
          filtroProyecto={filtroProyecto}
          onCambiarFiltroProyecto={setFiltroProyecto}
          proyectos={proyectos}
          opcionesBusquedaTareas={opcionesBusquedaTareas}
          opcionesBusquedaResponsables={opcionesBusquedaResponsables}
        />

        <ResumenTareas
          tareasPendientes={tareasPendientes}
          tareasEnProgreso={tareasEnProgreso}
          tareasCompletadas={tareasCompletadas}
        />

        <TablaTareas
          tareasFiltradas={tareasFiltradas}
          cargando={cargando}
          error={error}
          tareaActivaId={tareaActivaId}
          enSeguimiento={enSeguimiento}
          horasRealesEnPantalla={horasRealesEnPantalla}
          redondearHoras={redondearHoras}
          obtenerTextoEstado={obtenerTextoEstado}
          obtenerVarianteEstado={obtenerVarianteEstado}
          obtenerTextoPrioridad={obtenerTextoPrioridad}
          obtenerVariantePrioridad={obtenerVariantePrioridad}
          onEditar={abrirModalEditar}
          onEliminar={manejarEliminar}
        />
      </div>

      <ModalGenerarTareaIA
        abierto={modalIAAbierto}
        formularioIA={formularioIA}
        generandoIA={generandoIA}
        responsablesDisponibles={responsablesDisponibles}
        proyectosDisponibles={proyectosDisponibles}
        onCerrar={cerrarModalIA}
        onGenerar={manejarGenerarConIA}
        onCambiarFormularioIA={manejarCambioFormularioIA}
      />

      <ModalTarea
        abierto={modalAbierto}
        modoFormulario={modoFormulario}
        formulario={formulario}
        guardando={guardando}
        responsablesDisponibles={responsablesDisponibles}
        proyectosDisponibles={proyectosDisponibles}
        categoriasDisponibles={categoriasDisponibles}
        onCerrar={cerrarModal}
        onGuardar={manejarGuardar}
        onCambiarFormulario={manejarCambioFormulario}
      />
    </section>
  )
}