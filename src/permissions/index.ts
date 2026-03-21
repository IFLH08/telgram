export { PERMISOS } from './permissions.constants'
export type { Permiso } from './permissions.constants'
export {
  obtenerPermisosPorRol,
  tienePermiso,
  esAdmin,
  esManager,
  esDeveloper,
  puedeVerDashboard,
  puedeVerTareas,
  puedeCrearTarea,
  puedeEditarTarea,
  puedeEliminarTarea,
  puedeRegistrarTiempoTarea,
  puedeVerReportes,
  puedeVerReportesGlobales,
  puedeVerProyectos,
  puedeCrearProyecto,
  puedeEditarProyecto,
  puedeEliminarProyecto,
  puedeGestionarUsuarios,
  filtrarTareasVisiblesPorRol,
  filtrarProyectosVisiblesPorRol,
} from './permissions.helpers'