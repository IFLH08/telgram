# Requerimientos del sistema

Fuente: documento compartido por el usuario el 2026-04-23.

## Project tasks

Campos de tarea:

- Task name
- Assign
- Description
- Due
- Is Current Sprint
- Planned Hours
- Priority
- Project
- Real Hours
- Sprint
- Status

## Lista de requerimientos funcionales y no funcionales

### Funcionales

- RF01: El usuario de tipo desarrollador podrá visualizar sus tareas (nombre, descripción, estatus, persona asignada, fecha de entrega, sprint, prioridad, horas planeadas, horas reales) dentro de un proyecto en la sección “Tareas” del portal de administración.
- RF02: El usuario de tipo administrador podrá editar tareas (nombre, descripción, estatus, persona asignada, fecha de entrega, sprint, prioridad, horas planeadas, horas reales) de forma manual para cada integrante de su equipo dentro de un proyecto al presionar el botón “Editar tarea” en la sección “Tareas” del portal de administración.
- RF03: El usuario de tipo administrador podrá editar tareas (nombre, descripción, estatus, persona asignada, fecha de entrega, sprint, prioridad, horas planeadas, horas reales) para cada integrante de su equipo dentro de un proyecto al pedírselo al chatbot de Telegram al mandarle el siguiente mensaje: “/EditItem, /ValueAssigned”.
- RF04: El usuario de tipo administrador podrá crear tareas de forma manual (nombre, descripción, estatus, persona asignada, fecha de entrega, sprint, prioridad, horas planeadas, horas reales) para cada integrante de su equipo dentro de un proyecto al presionar el botón “Agregar tarea” en la sección “Tareas” del portal de administración.
- RF05: El usuario de tipo administrador podrá registrar tareas (nombre, descripción, estatus, persona asignada, fecha de entrega, sprint, prioridad, horas planeadas, horas reales) para cada integrante de su equipo dentro de un proyecto al pedírselo al chatbot de Telegram al mandarle el siguiente mensaje: “/addItem”.
- RF06: El usuario de tipo administrador podrá eliminar tareas de forma manual para cada integrante de su equipo dentro de un proyecto al presionar el botón “Eliminar tarea” en la sección “Tareas” del portal de administración.
- RF07: El usuario de tipo administrador podrá eliminar tareas para cada integrante de su equipo dentro de un proyecto al pedírselo al chatbot de Telegram al mandarle el siguiente mensaje: “/deleteItem”.
- RF08: El sistema enviará notificaciones al usuario de tipo desarrollador cuando se le asigne una nueva tarea dentro de un proyecto ó exista una fecha de vencimiento cercana.
- RF09: El sistema debe permitir al usuario de tipo administrador filtrar KPIs por proyecto y periodo de desarrollo en el portal de administración.
- RF10: El sistema calculará y presentará KPIs de proyectos en un dashboard general.
- RF11: El usuario de tipo desarrollador podrá cambiar el estatus de sus tareas (completadas, en progreso, pendientes, canceladas) asignadas dentro de un proyecto al seleccionar el ícono donde se muestre el estado actual de dicha tarea en la sección “Tareas” del portal de administración.
- RF12: El usuario de tipo administrador podrá visualizar todas las tareas (nombre, descripción, estatus, persona asignada, fecha de entrega, sprint, prioridad, horas planeadas, horas reales) de un proyecto específico en la sección “Tareas” del portal de administración.
- RF13: El usuario de tipo administrador podrá crear uno ó más proyectos (id, nombre, descripción, fecha de inicio, fecha de entrega, estatus, progreso) dentro de los cuales se podrán crear, eliminar, y/o editar tareas.
- RF14: El usuario de tipo administrador podrá generar códigos de acceso en la sección “Códigos de acceso” en el dashboard del portal de administración para proporcionárselos a los desarrolladores de forma que éstos accedan a un proyecto específico.
- RF15: El usuario de tipo desarrollador podrá acceder a uno ó más proyectos de desarrollo de software al ingresar el código de acceso proporcionado por el administrador en un espacio de texto ubicado en la parte superior de la sección “Códigos de acceso” en el dashboard del portal de administración.
- RF16: El usuario de tipo administrador podrá crear uno ó más proyectos (id, nombre, descripción, fecha de inicio, fecha de entrega, estatus, progreso) dentro de los cuales se podrán crear, eliminar, y/o editar tarea, al mandarle un mensaje de texto al chatbot de Telegram al mandarle el siguiente mensaje: “AddProject”.

Notas de ideas de requerimientos funcionales:

- Login.
- Sign up.
- Cómo usar las modalidades remotas e híbridas para convertirlas en requerimientos.
- Dashboard: cuál es su contenido: códigos de acceso, proyectos, perfil de usuario, sign out.
- Otorgar y quitar permisos a usuarios.
- Cómo configurar el chatbot con la sesión del usuario.
- El chatbot está muy enfocado en el administrador, cómo es que el desarrollador podría mejorar su productividad usando el chatbot.
- Agregar proyectos para administrador.
- Definir vista y acciones para administrador y usuarios para proyectos.
- Asignación de miembros a su equipo.
- Hace falta especificar los KPIs del proyecto.
- El chatbot debería permitir hacer consultas de cada tarea.

### No funcionales

- RNF01 Seguridad: Se debe implementar seguridad en todos los componentes de la arquitectura.
- RNF02 Base de datos: El almacenamiento de datos debe realizarse en Oracle Autonomous Database.
- RNF03 Usabilidad: La interfaz web y el chatbot deben ser intuitivos y fáciles de utilizar.
- RNF04 Compatibilidad: El sistema debe ser accesible desde navegadores web modernos y dispositivos móviles.
- RNF05 Infraestructura: Se debe contener en Docker y orquestación en cluster OKE de Oracle Cloud Infrastructure.
- RNF06 Entorno: Aprovisionamiento de infraestructura declarativo mediante scripts de Terraform.

## Matriz de priorización Valor vs. Esfuerzo

| RF | Valor para el usuario | Esfuerzo de desarrollo | Cuadrante |
| --- | --- | --- | --- |
| RF01 | alto | medio | Proyectos prin. |
| RF02 | alto | alto | quick win |
| RF03 | alto | medio | quick win |
| RF04 | alto | medio | quick win |
| RF05 | alto | alto | quick win |
| RF06 | alto | medio | quick win |
| RF07 | alto | alto | quick win |
| RF08 | medio | medio | tarea menor |
| RF09 | medio | medio | tarea menor |
| RF10 | medio | medio | Proyectos prin. |

## Historias de usuario

### HU01 - Visualizar tareas (RF01)

Puntos de historia: 3

Historia de Usuario:

Como desarrollador, quiero visualizar mis tareas y su estatus en la sección “Tareas” para saber en qué debo trabajar.

Criterios de Aceptación:

- El desarrollador solo ve sus propias tareas.
- Se muestra el estatus (pendiente, en progreso, terminada).
- La información se actualiza al cargar la página.
- La vista está disponible en el portal web.

### HU02 - Editar tarea desde portal (UPDATE – CRUD)

Puntos de historia: 5

Historia de Usuario:

Como administrador, quiero editar tareas (fechas de entrega, miembros encargados y estatus) desde el portal de administración para mantener actualizada la planificación del equipo y asegurar el correcto seguimiento del proyecto.

Criterios de aceptación:

- El administrador puede visualizar la lista de tareas registradas en el portal.
- El administrador puede seleccionar una tarea y presionar el botón “Editar tarea”.
- El sistema muestra un formulario con los datos actuales de la tarea.
- El administrador puede modificar fecha de entrega, miembro asignado y estatus.
- Los cambios se guardan correctamente en la base de datos.
- La información actualizada se refleja inmediatamente en la sección de tareas del desarrollador correspondiente.
- El sistema valida que los campos obligatorios no estén vacíos antes de guardar los cambios.

### HU03 - Editar tarea vía Telegram

Puntos de historia: 8

Historia de Usuario:

Como administrador, quiero editar tareas mediante el chatbot de Telegram usando los comandos “/EditItem” o “/ValueAssigned” para gestionar tareas de forma remota y rápida.

Criterios de aceptación:

- El chatbot reconoce los comandos “/EditItem” o “/ValueAssigned”.
- El sistema solicita los datos necesarios para identificar la tarea.
- El administrador puede modificar los valores correspondientes.
- Los cambios se actualizan correctamente en la base de datos.
- El desarrollador asignado visualiza la actualización en el portal.

### HU04 - Registrar tarea desde portal (CREATE – CRUD)

Puntos de historia: 8

Historia de Usuario:

Como administrador, quiero registrar tareas manualmente desde el portal de administración para asignarlas a los integrantes del equipo y organizar el trabajo del proyecto.

Criterios de aceptación:

- El administrador puede acceder al botón “Agregar tarea”.
- El sistema permite ingresar nombre, descripción, fecha de entrega, horas estimadas y miembro asignado.
- La tarea se guarda correctamente en la base de datos.
- La tarea aparece en la sección del desarrollador asignado.
- El sistema valida campos obligatorios antes de guardar.

### HU05 - Registrar tarea vía Telegram

Puntos de historia: 5

Historia de Usuario:

Como administrador, quiero registrar tareas mediante el chatbot de Telegram usando el comando “/addItem” para gestionar tareas sin necesidad de ingresar al portal.

Criterios de aceptación:

- El chatbot reconoce el comando “/addItem”.
- El sistema solicita los datos necesarios para crear la tarea.
- La tarea se guarda correctamente en la base de datos.
- El desarrollador asignado recibe la tarea en su sección correspondiente.
- El chatbot confirma que la tarea fue creada exitosamente.

### HU06 - Eliminar tarea desde portal (DELETE – CRUD)

Puntos de historia: 3

Historia de Usuario:

Como administrador, quiero eliminar tareas manualmente desde el portal de administración para corregir errores o eliminar tareas innecesarias.

Criterios de aceptación:

- El administrador puede seleccionar una tarea existente.
- Al presionar “Eliminar tarea” el sistema solicita confirmación.
- La tarea se elimina correctamente de la base de datos.
- La tarea deja de aparecer en la sección del desarrollador.
- No se generan errores ni registros duplicados.

### HU07 - Eliminar tarea vía Telegram (DELETE – CRUD)

Puntos de historia: 5

Historia de Usuario:

Como administrador, quiero eliminar tareas mediante el chatbot de Telegram usando el comando “/deleteItem” para administrar tareas de manera remota.

Criterios de aceptación:

- El chatbot reconoce correctamente el comando “/deleteItem”.
- El sistema solicita el identificador o nombre de la tarea.
- La tarea se elimina correctamente de la base de datos.
- El chatbot confirma que la tarea fue eliminada exitosamente.
- La tarea deja de aparecer en el portal.

### HU08 - Notificaciones automáticas

Puntos de historia: 8

Historia de Usuario:

Como desarrollador, quiero recibir notificaciones cuando se me asigne una nueva tarea o cuando la fecha de vencimiento esté próxima para cumplir con mis responsabilidades a tiempo.

Criterios de aceptación:

- El sistema envía una notificación automática cuando se asigna una nueva tarea.
- El sistema envía una notificación antes de la fecha de vencimiento, por ejemplo 24 o 48 horas antes.
- La notificación incluye nombre de la tarea y fecha límite.
- Solo el desarrollador asignado recibe la notificación.
- Las notificaciones se generan sin afectar el rendimiento del sistema.

### HU09 - Filtrar KPIs por proyecto y periodo

Puntos de historia: 4

Historia de Usuario:

Como administrador, quiero filtrar los KPIs por proyecto y periodo de desarrollo en el portal para analizar el rendimiento del equipo y tomar decisiones informadas.

Criterios de aceptación:

- El administrador puede acceder a un dashboard de KPIs.
- El sistema permite seleccionar un proyecto específico.
- El sistema permite seleccionar un rango de fechas o periodo.
- Los KPIs se actualizan según los filtros seleccionados.
- Los datos mostrados corresponden a la información almacenada en la base de datos.

### HU10 - Dashboard general de KPIs

Puntos de historia: 7

Historia de Usuario:

Como administrador, quiero visualizar un dashboard general con los KPIs de los proyectos para monitorear el avance global y evaluar el desempeño del equipo.

Criterios de aceptación:

- El dashboard muestra métricas como tareas completadas, tareas pendientes y cumplimiento de fechas.
- El sistema calcula automáticamente los KPIs a partir de los datos almacenados.
- Los indicadores se muestran de manera gráfica y clara.
- La información se actualiza cuando cambian los datos de las tareas.
- Solo usuarios con rol administrador pueden acceder al dashboard.

## Product backlog organizado por prioridad

| Historia | Story Points | Valor | Esfuerzo | Prioridad |
| --- | --- | --- | --- | --- |
| HU01 - Visualizar tareas | 3 | Alto | Bajo | Alta |
| HU04 - Registrar tarea desde portal | 8 | Alto | Medio | Alta |
| HU02 - Editar tarea desde portal | 5 | Alto | Medio | Alta |
| HU06 - Eliminar tarea desde portal | 3 | Alto |  | Alta |
| HU08 - Notificaciones automáticas | 5 | Alto | Medio | Alta |
| HU05 - Registrar tarea vía Telegram | 5 | Alto | Alto | Media |
| HU03 - Editar tarea vía Telegram | 8 | Alto | Alto | Media |
| HU07 - Eliminar tarea vía Telegram | 5 | Medio | Alto | Media |
| HU09 - Filtrar KPIs | 5 | Medio | Medio | Baja |
| HU010 - Dashboard general de KPIs | 8 | Medio | Medio | Baja |
