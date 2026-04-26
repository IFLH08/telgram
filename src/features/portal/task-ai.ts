import type { PrioridadTareaPortal } from './types'

export interface TaskAIFormState {
  ideaGeneral: string
  contexto: string
  proyectoId: string
  proyectoNombre: string
  sprintId: string
  sprintNombre: string
  personaAsignadaId: string
  personaAsignadaNombre: string
  prioridadObjetivo: PrioridadTareaPortal
}

export interface TaskAIDraft {
  nombre: string
  descripcion: string
  fechaEntrega: string
  horasEstimadas: number
  puntosHistoria: number
  prioridad: PrioridadTareaPortal
}

function capitalizar(texto: string) {
  if (!texto.trim()) {
    return ''
  }

  const limpio = texto.trim()
  return limpio.charAt(0).toUpperCase() + limpio.slice(1)
}

function limpiarMarkdownBasico(texto: string) {
  return texto
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/^\s*\d+\.\s+/gm, '• ')
    .trim()
}

function extraerSeccion(texto: string, etiqueta: string, siguienteEtiquetas: string[]) {
  const inicioRegex = new RegExp(`${etiqueta}:`, 'i')
  const inicioMatch = texto.match(inicioRegex)

  if (!inicioMatch || inicioMatch.index === undefined) {
    return ''
  }

  const inicio = inicioMatch.index + inicioMatch[0].length
  const resto = texto.slice(inicio)

  let fin = resto.length

  for (const siguienteEtiqueta of siguienteEtiquetas) {
    const regex = new RegExp(`\\n${siguienteEtiqueta}:`, 'i')
    const match = resto.match(regex)

    if (match && match.index !== undefined) {
      fin = Math.min(fin, match.index)
    }
  }

  return resto.slice(0, fin).trim()
}

function generarFechaEntregaSugerida() {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + 7)
  return fecha.toISOString().split('T')[0]
}

function obtenerEstimacionBase(prioridad: PrioridadTareaPortal) {
  switch (prioridad) {
    case 'alta':
      return { horasEstimadas: 16, puntosHistoria: 8 }
    case 'media':
      return { horasEstimadas: 8, puntosHistoria: 5 }
    case 'baja':
      return { horasEstimadas: 4, puntosHistoria: 3 }
    default:
      return { horasEstimadas: 8, puntosHistoria: 5 }
  }
}

function normalizarNumeroPositivo(valor: string, fallback: number) {
  const numero = Number(valor.replace(/[^\d.]/g, ''))

  if (!Number.isFinite(numero) || numero <= 0) {
    return fallback
  }

  return numero
}

export function crearFormularioIAInicial(
  projectId = '',
  projectName = '',
  sprintId = '',
  sprintName = '',
  assigneeId = '',
  assigneeName = '',
): TaskAIFormState {
  return {
    ideaGeneral: '',
    contexto: '',
    proyectoId: projectId,
    proyectoNombre: projectName,
    sprintId,
    sprintNombre: sprintName,
    personaAsignadaId: assigneeId,
    personaAsignadaNombre: assigneeName,
    prioridadObjetivo: 'media',
  }
}

export function construirPromptGeneracion(formularioIA: TaskAIFormState) {
  const proyecto = formularioIA.proyectoNombre.trim() || 'Sin proyecto definido'
  const sprint = formularioIA.sprintNombre.trim() || 'Sin sprint definido'
  const responsable =
    formularioIA.personaAsignadaNombre.trim() || 'Sin responsable sugerido'

  return `
Genera un borrador profesional de tarea para un portal de gestion de tareas llamado DevTask.

Responde unicamente en este formato exacto:

TITULO: ...
DESCRIPCION:
...
HORAS_ESTIMADAS: ...
PUNTOS_HISTORIA: ...

Reglas:
- todo en espanol
- no uses markdown
- el titulo debe ser corto y claro
- la descripcion debe estar lista para pegarse en un textarea del sistema
- horas estimadas debe ser un numero positivo realista
- puntos historia debe ser un numero entero positivo
- no agregues campos extra

Contexto de entrada:
Idea general: ${formularioIA.ideaGeneral.trim()}
Contexto adicional: ${formularioIA.contexto.trim() || 'Sin contexto adicional'}
Proyecto: ${proyecto}
Sprint: ${sprint}
Responsable sugerido: ${responsable}
Prioridad objetivo: ${formularioIA.prioridadObjetivo}
`.trim()
}

export function convertirRespuestaIABorrador(
  respuesta: string,
  formularioIA: TaskAIFormState,
): TaskAIDraft {
  const texto = limpiarMarkdownBasico(respuesta)
  const estimacionBase = obtenerEstimacionBase(formularioIA.prioridadObjetivo)

  const nombre =
    extraerSeccion(texto, 'TITULO', [
      'DESCRIPCION',
      'HORAS_ESTIMADAS',
      'PUNTOS_HISTORIA',
    ]) ||
    capitalizar(formularioIA.ideaGeneral) ||
    'Nueva tarea generada con IA'

  const descripcion =
    extraerSeccion(texto, 'DESCRIPCION', ['HORAS_ESTIMADAS', 'PUNTOS_HISTORIA']) ||
    [
      `Objetivo principal: ${formularioIA.ideaGeneral.trim() || 'Definir alcance de la tarea.'}`,
      formularioIA.contexto.trim()
        ? `Contexto adicional: ${formularioIA.contexto.trim()}`
        : '',
      formularioIA.proyectoNombre.trim()
        ? `Proyecto relacionado: ${formularioIA.proyectoNombre.trim()}`
        : '',
      formularioIA.sprintNombre.trim()
        ? `Sprint sugerido: ${formularioIA.sprintNombre.trim()}`
        : '',
      formularioIA.personaAsignadaNombre.trim()
        ? `Responsable sugerido: ${formularioIA.personaAsignadaNombre.trim()}`
        : '',
      'Entregable esperado: tarea lista para ejecutarse, revisarse y registrarse en el portal.',
    ]
      .filter(Boolean)
      .join('\n\n')

  const horasEstimadas = normalizarNumeroPositivo(
    extraerSeccion(texto, 'HORAS_ESTIMADAS', ['PUNTOS_HISTORIA']),
    estimacionBase.horasEstimadas,
  )

  const puntosHistoria = Math.round(
    normalizarNumeroPositivo(
      extraerSeccion(texto, 'PUNTOS_HISTORIA', []),
      estimacionBase.puntosHistoria,
    ),
  )

  return {
    nombre,
    descripcion,
    fechaEntrega: generarFechaEntregaSugerida(),
    horasEstimadas,
    puntosHistoria,
    prioridad: formularioIA.prioridadObjetivo,
  }
}
