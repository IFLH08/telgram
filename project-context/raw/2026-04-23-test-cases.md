# Test cases

Fuente: documento compartido por el usuario el 2026-04-23.

## Template

Campos del template:

- TestCaseId
- Component
- Priority
- Description/Test Summary
- Pre-requisites
- Test Steps
- Expected Result
- Designed By

## Casos de prueba

### TC-01

- Component: Página web / Visualización de tarea
- Priority: Alta
- Summary: Se requiere que el administrador pueda observar todas las tareas existentes.
- Pre-requisites:
  - Usuario con rol de administrador.
  - Base de datos funcionando y con datos previamente ingresados.
  - Conexión con la base de datos.
- Test Steps:
  - Iniciar sesión como administrador.
  - Observar las tareas pertenecientes a cada uno de sus proyectos.
  - Tener un ambiente de pruebas.
- Expected Result: El sistema puede mostrar todas las tareas asignadas.
- Designed By: Equipo Frontend y Backend

### TC-02

- Component: Página web / Gestión de tarea
- Priority: Alta
- Summary: Se requiere que el administrador pueda crear tareas.
- Pre-requisites:
  - Usuario con rol de administrador.
  - Base de datos funcionando.
  - Conexión con la base de datos.
- Test Steps:
  - Iniciar sesión como administrador.
  - Seleccionar un proyecto específico.
  - Crear tareas.
- Expected Result: El sistema debe permitirle al administrador crear tareas para cualquiera de los proyectos que éste gestione.
- Designed By: Equipo Frontend y Backend

### TC-03

- Component: Chatbot Telegram / Gestión de tarea
- Priority: Alta
- Summary: Verificar que el administrador pueda registrar una tarea para un integrante usando el comando `/additem`.
- Pre-requisites:
  - Usuario con rol administrador autenticado o identificado en el bot.
  - Integrante del equipo registrado en el sistema.
  - Base de datos y API disponibles con conectividad correcta.
- Test Steps:
  - Iniciar sesión como un usuario de tipo administrador.
  - Abrir chat con el bot en Telegram.
  - Enviar comando `/addItem`.
  - Enviar los datos requeridos de la tarea según el formato definido.
  - Confirmar el alta.
  - Consultar en el portal o vía listado del bot que la tarea exista.
- Expected Result: El bot confirma creación exitosa, la tarea se guarda en la base de datos con los campos correctos y la tarea aparece para el desarrollador asignado.
- Designed By: Equipo Frontend y Backend

### TC-04

- Component: Chatbot Telegram / Edición de tareas
- Priority: Alta
- Summary: Verificar que el administrador pueda editar una tarea existente con `/EditItem`.
- Pre-requisites:
  - Usuario con rol administrador autenticado o identificado en el bot.
  - Existe al menos una tarea creada previamente para editar.
  - Base de datos y API disponibles.
- Test Steps:
  - Abrir chat con el bot.
  - Enviar `/EditItem` incluyendo identificador de tarea.
  - Consultar la tarea en el portal o en el listado del bot.
- Expected Result: El bot confirma edición exitosa, la tarea refleja el cambio exacto y el cambio persiste en base de datos y en el portal.
- Designed By: Equipo Frontend y Backend

### TC-05

- Component: Chatbot Telegram / Eliminación de tareas
- Priority: Alta
- Summary: Verificar que el administrador pueda eliminar una tarea existente con el comando `/deleteItem`.
- Pre-requisites:
  - Usuario con rol administrador autenticado o identificado en el bot.
  - Existe al menos una tarea creada previamente para eliminar.
  - Base de datos y API disponibles.
- Test Steps:
  - Abrir chat con el bot.
  - Enviar `/deleteItem` incluyendo identificador de tarea.
  - Confirmar acción en el bot.
- Expected Result: El bot confirma eliminación, la tarea deja de existir en la base de datos y no se ve en el portal.
- Designed By: Equipo Frontend y Backend

### TC-06

- Component: Chatbot Telegram / Seguridad y permisos
- Priority: Alta
- Summary: Verificar que un desarrollador no pueda ejecutar comandos de administrador.
- Pre-requisites:
  - Usuario con rol desarrollador autenticado o identificado en el bot.
  - Base de datos y API disponibles.
- Test Steps:
  - Abrir chat con el bot como desarrollador.
  - Enviar `/addItem`.
  - Enviar `/EditItem`.
  - Enviar `/deleteItem`.
- Expected Result: El bot rechaza cada acción por permisos insuficientes, muestra un mensaje claro y no se crea, edita ni elimina nada en la base de datos.
- Designed By: Equipo Backend

### TC-07

- Component: Notificaciones / Chatbot Telegram
- Priority: Media
- Summary: Verificar que el sistema envíe notificaciones al desarrollador cuando se le asigna una tarea nueva y la fecha de vencimiento está cercana.
- Pre-requisites:
  - Desarrollador con Telegram vinculado o identificado en el sistema.
  - Notificaciones habilitadas con servicio, cron o worker activo.
  - Base de datos y API disponibles.
- Test Steps:
  - Como administrador, crear una nueva tarea para un desarrollador.
  - Validar recepción de notificación en Telegram del desarrollador.
  - Crear o ajustar una tarea con fecha de entrega cercana.
  - Esperar a que corra el disparador o ejecutarlo manualmente en entorno de prueba.
- Expected Result: El desarrollador recibe notificación por nueva asignación y por vencimiento cercano, incluyendo al menos nombre de tarea y fecha de entrega y/o estatus.
- Designed By: Equipo Backend

### TC-08

- Component: Página web / Visualización de tarea
- Priority: Alta
- Summary: Se requiere que el desarrollador pueda observar las tareas asignadas dentro de un proyecto.
- Pre-requisites:
  - Usuario con rol de desarrollador.
  - Base de datos funcionando y con datos previamente ingresados.
  - Conexión con la base de datos.
- Test Steps:
  - Iniciar sesión como desarrollador.
  - Seleccionar un proyecto específico.
  - Observar las tareas asignadas.
  - Tener un ambiente de pruebas.
- Expected Result: El sistema puede mostrar todas las tareas asignadas dentro del proyecto en el que se encuentre el usuario.
- Designed By: Equipo Frontend y Backend

### TC-09

- Component: Página web / Visualización de tarea
- Priority: Alta
- Summary: Se requiere que el desarrollador pueda observar las tareas asignadas dentro de un proyecto.
- Pre-requisites:
  - Usuario con rol de desarrollador.
  - Base de datos funcionando y con datos previamente ingresados.
  - Conexión con la base de datos.
- Test Steps:
  - Iniciar sesión como desarrollador.
  - Seleccionar un proyecto específico.
  - Observar las tareas asignadas.
  - Tener un ambiente de pruebas.
- Expected Result: El sistema puede mostrar todas las tareas asignadas dentro del proyecto en el que se encuentre el usuario.
- Designed By: Equipo Frontend y Backend
