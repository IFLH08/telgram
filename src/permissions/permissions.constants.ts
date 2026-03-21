export const PERMISOS = {
  VER_DASHBOARD: 'verDashboard',
  VER_TAREAS: 'verTareas',
  CREAR_TAREA: 'crearTarea',
  EDITAR_CUALQUIER_TAREA: 'editarCualquierTarea',
  EDITAR_TAREA_PROPIA: 'editarTareaPropia',
  ELIMINAR_TAREA: 'eliminarTarea',
  REGISTRAR_TIEMPO_TAREA: 'registrarTiempoTarea',
  VER_REPORTES: 'verReportes',
  VER_REPORTES_GLOBALES: 'verReportesGlobales',
  VER_PROYECTOS: 'verProyectos',
  CREAR_PROYECTO: 'crearProyecto',
  EDITAR_PROYECTO: 'editarProyecto',
  ELIMINAR_PROYECTO: 'eliminarProyecto',
  GESTIONAR_USUARIOS: 'gestionarUsuarios',
} as const

export type Permiso = (typeof PERMISOS)[keyof typeof PERMISOS]