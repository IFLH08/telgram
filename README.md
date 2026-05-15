# Estructura del proyecto

Este repositorio contiene una aplicacion de gestion de tareas/proyectos basada en Spring Boot, con una interfaz frontend en React/Vite y recursos de despliegue para contenedores e infraestructura.

## Carpetas principales

### `MtdrSpring/`
Carpeta principal de la aplicacion. Agrupa el backend Spring Boot, recursos auxiliares de infraestructura y utilidades del proyecto.

- `backend/`: aplicacion principal Java/Spring Boot. Tambien contiene el frontend React dentro de `src/main/frontend`.
- `terraform/`: archivos relacionados con infraestructura como codigo.
- `utils/`: utilidades o scripts auxiliares del proyecto.

### `MtdrSpring/backend/`
Modulo principal del backend. Contiene la configuracion Maven, scripts de build/despliegue, Dockerfiles, wallet de conexion y codigo fuente de la aplicacion.

Archivos relevantes:

- `pom.xml`: dependencias y configuracion Maven del proyecto Spring Boot.
- `mvnw` y `mvnw.cmd`: Maven Wrapper para ejecutar Maven sin instalarlo globalmente.
- `Dockerfile` y `DockerfileDev`: definiciones para construir imagenes Docker.
- `build.sh`, `deploy.sh`, `undeploy.sh`: scripts de construccion y despliegue.
- `buildImgContainer.ps1`, `updateJarContainer.ps1`: scripts PowerShell para flujos de contenedor.

### `MtdrSpring/backend/.mvn/`
Configuracion interna del Maven Wrapper.

- `wrapper/maven-wrapper.jar`: ejecutable del wrapper.
- `wrapper/maven-wrapper.properties`: configuracion de version/distribucion de Maven usada por el proyecto.

### `MtdrSpring/backend/src/main/`
Codigo fuente principal de la aplicacion.

- `java/`: codigo Java del backend Spring Boot.
- `resources/`: configuraciones, SQL y recursos cargados por Spring.
- `frontend/`: aplicacion frontend React/Vite y un backend Node/Express auxiliar para IA.

## Frontend

### `MtdrSpring/backend/src/main/frontend/`
Aplicacion web construida con React, Vite y Tailwind. Incluye dependencias Node, configuracion de lint/build, artefactos generados y codigo fuente.

Archivos relevantes:

- `package.json`: scripts y dependencias del frontend.
- `vite.config.js`: configuracion de Vite.
- `eslint.config.js`: reglas de linting.
- `index.html`: entrada HTML usada por Vite.
- `package-lock.json` y `pnpm-lock.yaml`: archivos de bloqueo de dependencias.

### `MtdrSpring/backend/src/main/frontend/backend/`
Backend auxiliar en Node/Express usado por el frontend, principalmente para rutas relacionadas con IA.

- `src/server.ts`: servidor Express.
- `src/routes/`: definicion de rutas del backend auxiliar.

### `MtdrSpring/backend/src/main/frontend/backend/src/routes/`
Contiene rutas del backend Node/Express.

- `ia.routes.ts`: endpoints relacionados con servicios de IA.

### `MtdrSpring/backend/src/main/frontend/build/`
Build generado del frontend. Incluye archivos estaticos listos para servirse en produccion.

- `index.html`, `asset-manifest.json`, `manifest.json`: archivos generados o copiados para el build.
- `static/css` y `static/js`: assets compilados.
- `swagger_APIs_definition.json` y `swagger_APIs_definition.yaml`: definiciones Swagger incluidas en el build.

### `MtdrSpring/backend/src/main/frontend/node_modules/`
Dependencias instaladas del frontend y del backend Node/Express auxiliar. Es una carpeta generada por el gestor de paquetes y normalmente no se edita manualmente.

### `MtdrSpring/backend/src/main/frontend/public/`
Archivos publicos que se copian o sirven como recursos estaticos.

- `index.html`: HTML base publico.
- `manifest.json`: manifiesto de la aplicacion.
- `swagger_APIs_definition.json` y `swagger_APIs_definition.yaml`: documentacion/definicion de APIs en formato Swagger/OpenAPI.

### `MtdrSpring/backend/src/main/frontend/src/`
Codigo fuente principal del frontend React.

- `App.tsx`: componente raiz de la aplicacion.
- `main.tsx`: punto de entrada de React.
- `index.css`: estilos globales.
- `auth/`: contexto, tipos y exportaciones de autenticacion.
- `components/`: componentes reutilizables como botones, cards, badges e iconos.
- `components/ui/`: componentes UI base y elementos de visualizacion como charts y progress.
- `constants/`: constantes compartidas, como paletas de color.
- `dashboard/`: pantalla, estilos, datos y llamadas API del dashboard.
- `features/portal/`: logica principal del portal, tipos, selectores, servicio y contexto.
- `lib/`: utilidades, mocks de metricas, WebSocket y helpers.
- `mocks/`: datos simulados para desarrollo.
- `services/`: servicios para autenticacion e IA.
- `types/`: tipos TypeScript compartidos.

## Backend Java

### `MtdrSpring/backend/src/main/java/com/springboot/MyTodoList/`
Paquete principal del backend Spring Boot.

- `MyTodoListApplication.java`: clase de arranque de Spring Boot.
- `config/`: configuraciones de la aplicacion.
- `controller/`: controladores REST y rutas web.
- `dto/`: objetos de transferencia de datos.
- `model/`: entidades y modelos de dominio.
- `repository/`: interfaces de acceso a datos.
- `security/`: configuracion de seguridad.
- `service/`: logica de negocio e integraciones.
- `util/`: clases auxiliares, especialmente relacionadas con el bot.

### `config/`
Configuracion de componentes transversales.

- Propiedades del bot.
- Configuracion CORS.
- Configuracion de base de datos y Oracle.
- Configuracion de servicios de IA como DeepSeek.

### `controller/`
Controladores que exponen endpoints y rutas de la aplicacion.

Incluye controladores para dashboard, IA, proyectos, sprints, tareas, usuarios, ToDo items, bot y rutas SPA.

### `dto/`
Clases usadas para transportar datos entre capas o como respuestas especificas de API.

Incluye DTOs para metricas de dashboard, KPIs de sprint y tareas asociadas a sprint.

### `model/`
Entidades y modelos principales del dominio.

Incluye modelos como `Tarea`, `Proyecto`, `Sprint`, `Usuario`, `User`, `ToDoItem`, `DashboardMetric`, `Kpi`, `Notificacion`, `Rol`, `Prioridad`, `Medio` y `EstadoTarea`.

### `repository/`
Interfaces de persistencia basadas en Spring Data. Conectan los modelos con la base de datos y definen consultas personalizadas cuando se necesitan.

Incluye repositorios para usuarios, tareas, proyectos, sprints, KPIs, metricas de dashboard, notificaciones, prioridades, roles y ToDo items.

### `security/`
Configuracion de seguridad web de Spring.

- `WebSecurityConfiguration.java`: reglas de seguridad y acceso HTTP.

### `service/`
Logica de negocio y servicios de integracion.

Incluye servicios para bot conversacional, metricas de dashboard, integracion con DeepSeek, ToDo items y usuarios.

### `util/`
Clases auxiliares para operaciones comunes, especialmente alrededor del bot de Telegram/Oracle.

Incluye acciones, cliente, comandos, mensajes, etiquetas, helpers de JSON, manejo de sesiones y clase del bot.

## Resources

### `MtdrSpring/backend/src/main/resources/`
Recursos de configuracion y scripts SQL usados por Spring Boot.

- `application.properties`: configuracion principal de la aplicacion.
- `schema_combined.sql`: definicion combinada del esquema de base de datos.
- `reset_database.sql`: script para reiniciar o reconstruir datos/esquema.
- `todolistapp-springboot.yaml`: configuracion YAML relacionada con despliegue de la aplicacion.

## Recurso adicional

Presentacion o material visual del proyecto:

https://www.canva.com/design/DAG7Ug0g8SE/sWtF6hIbjp1lNv7ra0aN9w/edit?utm_content=DAG7Ug0g8SE&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton
