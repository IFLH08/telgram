import type { Proyecto, RolUsuario, Tarea, Usuario } from '../types'
import { PERMISOS, type Permiso } from './permissions.constants'

const permisosPorRol: Record<RolUsuario, Permiso[]> = {
  admin: [
    PERMISOS.VER_DASHBOARD,
    PERMISOS.VER_TAREAS,
    PERMISOS.CREAR_TAREA,
    PERMISOS.EDITAR_CUALQUIER_TAREA,
    PERMISOS.EDITAR_TAREA_PROPIA,
    PERMISOS.ELIMINAR_TAREA,
    PERMISOS.REGISTRAR_TIEMPO_TAREA,
    PERMISOS.VER_REPORTES,
    PERMISOS.VER_REPORTES_GLOBALES,
    PERMISOS.VER_PROYECTOS,
    PERMISOS.CREAR_PROYECTO,
    PERMISOS.EDITAR_PROYECTO,
    PERMISOS.ELIMINAR_PROYECTO,
    PERMISOS.GESTIONAR_USUARIOS,
  ],
  manager: [
    PERMISOS.VER_DASHBOARD,
    PERMISOS.VER_TAREAS,
    PERMISOS.CREAR_TAREA,
    PERMISOS.EDITAR_CUALQUIER_TAREA,
    PERMISOS.REGISTRAR_TIEMPO_TAREA,
    PERMISOS.VER_REPORTES,
    PERMISOS.VER_REPORTES_GLOBALES,
    PERMISOS.VER_PROYECTOS,
    PERMISOS.CREAR_PROYECTO,
    PERMISOS.EDITAR_PROYECTO,
  ],
  developer: [
    PERMISOS.VER_DASHBOARD,
    PERMISOS.VER_TAREAS,
    PERMISOS.EDITAR_TAREA_PROPIA,
    PERMISOS.REGISTRAR_TIEMPO_TAREA,
    PERMISOS.VER_REPORTES,
    PERMISOS.VER_PROYECTOS,
  ],
}

const obtenerValorRegistro = (valor: unknown, clave: string): unknown => {
  if (!valor || typeof valor !== 'object') {
    return undefined
  }

  return (valor as Record<string, unknown>)[clave]
}

const obtenerResponsableTarea = (tarea: Tarea): { responsableId?: string; responsableNombre?: string } => {
  const responsable = obtenerValorRegistro(tarea, 'responsable')
  const responsableId = obtenerValorRegistro(tarea, 'responsableId')
  const responsableNombreDirecto = obtenerValorRegistro(tarea, 'responsableNombre')

  if (typeof responsable === 'string') {
    return {
      responsableNombre: responsable,
      responsableId: typeof responsableId === 'string' ? responsableId : undefined,
    }
  }

  if (responsable && typeof responsable === 'object') {
    const id = obtenerValorRegistro(responsable, 'id')
    const nombre = obtenerValorRegistro(responsable, 'nombre')

    return {
      responsableId: typeof id === 'string' ? id : undefined,
      responsableNombre: typeof nombre === 'string' ? nombre : undefined,
    }
  }

  return {
    responsableId: typeof responsableId === 'string' ? responsableId : undefined,
    responsableNombre: typeof responsableNombreDirecto === 'string' ? responsableNombreDirecto : undefined,
  }
}

const obtenerResponsableProyecto = (proyecto: Proyecto): { responsableId?: string; responsableNombre?: string } => {
  const responsable = obtenerValorRegistro(proyecto, 'responsable')
  const responsableId = obtenerValorRegistro(proyecto, 'responsableId')
  const responsableNombreDirecto = obtenerValorRegistro(proyecto, 'responsableNombre')

  if (typeof responsable === 'string') {
    return {
      responsableNombre: responsable,
      responsableId: typeof responsableId === 'string' ? responsableId : undefined,
    }
  }

  if (responsable && typeof responsable === 'object') {
    const id = obtenerValorRegistro(responsable, 'id')
    const nombre = obtenerValorRegistro(responsable, 'nombre')

    return {
      responsableId: typeof id === 'string' ? id : undefined,
      responsableNombre: typeof nombre === 'string' ? nombre : undefined,
    }
  }

  return {
    responsableId: typeof responsableId === 'string' ? responsableId : undefined,
    responsableNombre: typeof responsableNombreDirecto === 'string' ? responsableNombreDirecto : undefined,
  }
}

export const obtenerPermisosPorRol = (rol: RolUsuario | null | undefined): Permiso[] => {
  if (!rol) {
    return []
  }

  return permisosPorRol[rol] ?? []
}

export const tienePermiso = (usuario: Usuario | null | undefined, permiso: Permiso): boolean => {
  if (!usuario) {
    return false
  }

  return obtenerPermisosPorRol(usuario.rol).includes(permiso)
}

export const esAdmin = (usuario: Usuario | null | undefined): boolean => usuario?.rol === 'admin'
export const esManager = (usuario: Usuario | null | undefined): boolean => usuario?.rol === 'manager'
export const esDeveloper = (usuario: Usuario | null | undefined): boolean => usuario?.rol === 'developer'

export const puedeVerDashboard = (usuario: Usuario | null | undefined): boolean => {
  return tienePermiso(usuario, PERMISOS.VER_DASHBOARD)
}

export const puedeVerTareas = (usuario: Usuario | null | undefined): boolean => {
  return tienePermiso(usuario, PERMISOS.VER_TAREAS)
}

export const puedeCrearTarea = (usuario: Usuario | null | undefined): boolean => {
  return tienePermiso(usuario, PERMISOS.CREAR_TAREA)
}

export const puedeEliminarTarea = (usuario: Usuario | null | undefined): boolean => {
  return tienePermiso(usuario, PERMISOS.ELIMINAR_TAREA)
}

export const puedeRegistrarTiempoTarea = (usuario: Usuario | null | undefined, tarea?: Tarea | null): boolean => {
  if (!usuario) {
    return false
  }

  if (tienePermiso(usuario, PERMISOS.REGISTRAR_TIEMPO_TAREA) && (esAdmin(usuario) || esManager(usuario))) {
    return true
  }

  if (!tarea) {
    return tienePermiso(usuario, PERMISOS.REGISTRAR_TIEMPO_TAREA)
  }

  return puedeEditarTarea(usuario, tarea)
}

export const puedeEditarTarea = (usuario: Usuario | null | undefined, tarea: Tarea | null | undefined): boolean => {
  if (!usuario || !tarea) {
    return false
  }

  if (tienePermiso(usuario, PERMISOS.EDITAR_CUALQUIER_TAREA)) {
    return true
  }

  if (!tienePermiso(usuario, PERMISOS.EDITAR_TAREA_PROPIA)) {
    return false
  }

  const { responsableId, responsableNombre } = obtenerResponsableTarea(tarea)

  if (responsableId && responsableId === usuario.id) {
    return true
  }

  if (responsableNombre && responsableNombre.trim().toLowerCase() === usuario.nombre.trim().toLowerCase()) {
    return true
  }

  return false
}

export const puedeVerReportes = (usuario: Usuario | null | undefined): boolean => {
  return tienePermiso(usuario, PERMISOS.VER_REPORTES)
}

export const puedeVerReportesGlobales = (usuario: Usuario | null | undefined): boolean => {
  return tienePermiso(usuario, PERMISOS.VER_REPORTES_GLOBALES)
}

export const puedeVerProyectos = (usuario: Usuario | null | undefined): boolean => {
  return tienePermiso(usuario, PERMISOS.VER_PROYECTOS)
}

export const puedeCrearProyecto = (usuario: Usuario | null | undefined): boolean => {
  return tienePermiso(usuario, PERMISOS.CREAR_PROYECTO)
}

export const puedeEditarProyecto = (usuario: Usuario | null | undefined, _proyecto?: Proyecto | null): boolean => {
  return tienePermiso(usuario, PERMISOS.EDITAR_PROYECTO)
}

export const puedeEliminarProyecto = (usuario: Usuario | null | undefined, _proyecto?: Proyecto | null): boolean => {
  return tienePermiso(usuario, PERMISOS.ELIMINAR_PROYECTO)
}

export const puedeGestionarUsuarios = (usuario: Usuario | null | undefined): boolean => {
  return tienePermiso(usuario, PERMISOS.GESTIONAR_USUARIOS)
}

export const filtrarTareasVisiblesPorRol = (usuario: Usuario | null | undefined, tareas: Tarea[]): Tarea[] => {
  if (!usuario) {
    return []
  }

  if (esAdmin(usuario) || esManager(usuario)) {
    return tareas
  }

  return tareas.filter((tarea) => puedeEditarTarea(usuario, tarea))
}

export const filtrarProyectosVisiblesPorRol = (
  usuario: Usuario | null | undefined,
  proyectos: Proyecto[],
  tareas: Tarea[] = [],
): Proyecto[] => {
  if (!usuario) {
    return []
  }

  if (esAdmin(usuario) || esManager(usuario)) {
    return proyectos
  }

  const idsProyectosConTareasPropias = new Set(
    tareas
      .filter((tarea) => puedeEditarTarea(usuario, tarea))
      .map((tarea) => {
        const proyectoId = obtenerValorRegistro(tarea, 'proyectoId')
        return typeof proyectoId === 'string' ? proyectoId : null
      })
      .filter((proyectoId): proyectoId is string => Boolean(proyectoId)),
  )

  return proyectos.filter((proyecto) => {
    if (idsProyectosConTareasPropias.has(proyecto.id)) {
      return true
    }

    const { responsableId, responsableNombre } = obtenerResponsableProyecto(proyecto)

    if (responsableId && responsableId === usuario.id) {
      return true
    }

    if (responsableNombre && responsableNombre.trim().toLowerCase() === usuario.nombre.trim().toLowerCase()) {
      return true
    }

    return false
  })
}