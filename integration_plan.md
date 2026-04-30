# MyTodoList Dashboard Integration Plan

## 1. Alcance y Estado Local

- Rama actual: `dashboardTequi`.
- Repositorio local: `C:\Users\yeric\telgram-main`.
- No hay `package.json` en la raiz; hoy el repo no funciona como workspace/monorepo npm.
- Hay dos frontends reales:
  - Frontend principal: `MtdrSpring/backend/src/main/frontend`.
  - Frontend dashboard separado: `frontend-dashboard`.
- El backend esta en `MtdrSpring/backend` y se empaqueta como aplicacion Spring Boot. El `pom.xml` ya construye el frontend principal con `frontend-maven-plugin` y copia `src/main/frontend/build` a `target/classes/static`.

## 2. Inventario Tecnico

### Backend Spring Boot

Ubicacion: `MtdrSpring/backend`.

- Framework: Spring Boot `3.5.6`, Spring Web, Spring Data JPA, Spring Security, Oracle JDBC/UCP.
- Observacion de compatibilidad: el `pom.xml` declara `java.version=11`; Spring Boot 3.x normalmente requiere Java 17+. Conviene verificar el JDK de build/runtime antes de endurecer CI/CD.
- Persistencia: Oracle, con `spring.jpa.hibernate.ddl-auto=update`.
- Seguridad actual: `WebSecurityConfiguration` permite todas las requests y desactiva CSRF, basic auth y form login.
- CORS: existe `CorsConfig`, pero el metodo `corsFilter()` no esta anotado con `@Bean`. Si se usa un frontend en otro origen/puerto, esta configuracion podria no estar registrandose como filtro.

Endpoints relevantes existentes:

- `/todolist`: CRUD historico para `ToDoItem`, usado por el frontend principal actual.
- `/api/tareas`: CRUD de `Tarea`.
- `/api/tareas/reporte/sprint-actual`: tareas del sprint actual.
- `/api/tareas/reporte/kpi-avances`: KPI agregado por sprint, pero no por desarrollador.
- `/api/sprints`: CRUD de sprints.
- `/api/usuarios`: CRUD de usuarios.
- `/api/proyectos`: CRUD de proyectos.

Modelo disponible para KPIs reales:

- `Tarea` tiene `sprint`, `usuarioAsignado`, `estado`, `horasReales`, `horasEstimadas`, `puntosHistoria`, `eliminada`.
- `Sprint` tiene `idSprint`, `nombre`, `fechaInicio`, `fechaFin`, `proyecto`.
- `Usuario` tiene `idUsuario`, `nombre`, `username`, `rol`.
- `EstadoTarea` tiene `nombreEstado`.

Conclusion de datos:

- La base de datos ya tiene los campos necesarios para las dos graficas obligatorias.
- Falta un endpoint agregado que agrupe por `Sprint` y `Usuario`.
- El endpoint actual `/api/tareas/reporte/kpi-avances` solo calcula avance por sprint, sin desglose por desarrollador ni suma de horas reales.

### Frontend Principal

Ubicacion: `MtdrSpring/backend/src/main/frontend`.

- Stack: Create React App, React `17.0.2`, ReactDOM `17.0.2`, MUI `5.8`, `react-scripts 5.0.0`.
- Scripts:
  - `npm start`
  - `npm run build`
- Proxy dev: `http://localhost:8080`.
- Routing: no hay React Router; `App.js` renderiza una sola pantalla.
- API actual: `src/API.js` apunta a `/todolist`.
- Despliegue: integrado al JAR Spring Boot por Maven.

Riesgos/limitaciones:

- No existe navegacion interna para `/dashboard`.
- React 17 puede usar Recharts y React Router, pero no se debe copiar el dashboard Next.js literalmente sin adaptar dependencias, TSX y estilos.
- Si se usa `BrowserRouter`, Spring debe reenviar rutas SPA como `/dashboard` a `index.html`. Alternativamente se puede usar `HashRouter`, pero la URL queda menos limpia.

### Frontend Dashboard Separado

Ubicacion: `frontend-dashboard`.

- Stack: Next.js `16.1.7`, React `19.2.3`, TypeScript, Tailwind CSS 4, shadcn-like components, Recharts `3.8.0`, lucide-react.
- Scripts:
  - `npm run dev`
  - `npm run build`
  - `npm run start`
  - `npm run lint`
- Rutas:
  - `/`: chat local con `@ai-sdk/react` y `/api/chat`.
  - `/dashboard`: dashboard de metricas agiles.
- Dashboard actual:
  - Usa `src/lib/mock-metrics.ts`.
  - No consume backend para las graficas.
  - Tiene componentes visuales ya armados en `src/components/dashboard/*`.
- Hay textos con problemas de encoding visible, por ejemplo `MÃ©tricas Ãgiles`.
- `src/lib/useWebSocket.ts` apunta a `NEXT_PUBLIC_API_URL || http://localhost:8080` y `/ws`, pero no se encontro soporte WebSocket correspondiente en el backend.

Conclusion:

- El dashboard tiene buen punto de partida visual, pero hoy es mock-driven.
- Next.js no aporta una necesidad clara para las dos graficas KPI si el producto final debe vivir junto al backend Spring.

## 3. Rubrica de Negocio y Contrato de Datos Propuesto

Las dos graficas obligatorias deben salir de datos reales:

1. `Tasks Completed by Developer per Sprint`
   - Eje X: sprint.
   - Barras agrupadas: desarrolladores.
   - Valor: conteo de tareas completadas.
   - Filtro recomendado: `t.eliminada = false`.
   - Estado completado: normalizar `COMPLETADA`, `COMPLETADO`, `DONE`, `COMPLETED`.

2. `Total Horas Reales por usuario / sprint`
   - Eje X: sprint.
   - Barras agrupadas: desarrolladores.
   - Valor: `SUM(t.horasReales)`.
   - Filtro recomendado: `t.eliminada = false`.
   - `horasReales = null` debe contar como `0`.

Endpoint recomendado:

`GET /api/dashboard/sprint-developer-metrics`

Respuesta en formato largo, facil de versionar y transformar:

```json
[
  {
    "sprintId": 1,
    "sprintName": "Sprint 1",
    "developerId": 1,
    "developerName": "Jose Angel",
    "completedTasks": 1,
    "realHours": 5.0
  }
]
```

Motivos:

- Evita hardcodear nombres de desarrolladores como propiedades dinamicas en el backend.
- Permite que el frontend derive automaticamente series, leyendas y colores.
- Sirve para ambas graficas sin duplicar endpoints.
- Mantiene el backend como fuente de verdad de agregacion.

Componentes backend propuestos:

- `DashboardMetricsController`
- `DashboardSprintDeveloperMetricDTO`
- Metodo agregado en `TareaRepository` con JPQL constructor expression.

## 4. Deliberacion Arquitectonica

### Opcion A: Micro-frontends / servicios separados

Descripcion:

- Mantener `MtdrSpring/backend/src/main/frontend` y `frontend-dashboard` como apps separadas.
- El frontend principal agrega un boton `Dashboard`.
- En local redirige a `http://localhost:3000/dashboard` o puerto configurado.
- En produccion se publica Spring Boot y Next.js como dos servicios, idealmente detras de reverse proxy bajo el mismo dominio.

Pros:

- Menor migracion inicial de UI: se conserva Next.js, Tailwind, shadcn y React 19.
- Equipos pueden evolucionar dashboard y app principal con independencia.
- Si el dashboard crece con features server-side de Next.js, esta opcion mantiene esa capacidad.
- Permite una entrega rapida si solo se necesita enlazar apps y conectar datos.

Contras:

- Produccion mas compleja: dos builds, dos runtimes, dos procesos, health checks y observabilidad separada.
- Requiere CORS o reverse proxy. La configuracion CORS actual del backend debe corregirse con `@Bean` si se consumira desde otro origen.
- Gestion de auth/sesion, permisos, errores y estilos puede duplicarse.
- El boton que redirige a otro puerto es aceptable en local, pero fragil para produccion si no se formaliza un `DASHBOARD_URL`.
- El dashboard seguiria fuera del pipeline Maven/JAR que ya existe.
- Es mas facil que vuelvan a aparecer mocks o contratos divergentes entre apps.

Buenas practicas si se elige A:

- Agregar scripts raiz para levantar ambos servicios.
- Usar variable de entorno `NEXT_PUBLIC_API_URL`.
- Configurar reverse proxy en produccion para servir dashboard bajo `/dashboard`.
- Corregir CORS en backend.
- Documentar contrato API y errores.

### Opcion B: Fusion / modulo interno en el frontend principal

Descripcion:

- Integrar el dashboard como modulo del frontend principal.
- Agregar navegacion interna, preferentemente React Router.
- Portar los componentes utiles del dashboard a React del frontend principal.
- Consumir `/api/dashboard/sprint-developer-metrics` desde el mismo origen Spring Boot.
- Mantener un solo build frontend dentro del flujo Maven existente.

Pros:

- Despliegue mas simple: un backend Spring Boot sirviendo una sola app.
- Sin CORS para produccion si todo se sirve desde el mismo origen.
- Una sola navegacion, un solo contexto de producto y un solo pipeline.
- Mejor mantenibilidad para este alcance: las graficas son parte natural de MyTodoList, no un producto independiente.
- Menor costo operativo y menor riesgo de variables de entorno/puertos mal configurados.
- Facilita que el dashboard comparta servicios, manejo de errores y futura auth del frontend principal.

Contras:

- Hay costo de migracion: el dashboard esta en Next.js/React 19/TSX/Tailwind y el frontend principal en CRA/React 17/JS.
- No conviene copiar `app/`, route handlers ni componentes shadcn sin adaptacion.
- Si se quiere conservar exactamente Tailwind/shadcn, hay que configurar Tailwind en CRA o reescribir estilos en CSS.
- Si se usa `BrowserRouter`, hay que agregar fallback SPA en Spring Boot o usar `HashRouter`.

Buenas practicas si se elige B:

- No migrar todo el proyecto a Next.js en esta fase; el backend ya tiene un flujo probado de JAR + static.
- Portar solo lo necesario para las dos graficas obligatorias.
- Crear una capa `api`/`hooks` limpia en frontend.
- Agregar estados de loading, error, vacio y responsive.
- Mantener `frontend-dashboard` como referencia temporal hasta validar paridad visual, luego decidir si se elimina o se archiva.

## 5. Recomendacion

Recomiendo la Opcion B: fusionar el dashboard como modulo interno del frontend principal.

La razon principal es que el producto y el despliegue actual ya giran alrededor de Spring Boot sirviendo el frontend principal. Para dos graficas KPI que consumen el mismo backend, un micro-frontend Next.js introduce mas complejidad operacional de la que aporta. La integracion interna reduce superficie de fallo, evita CORS en produccion y deja el dashboard como parte del flujo normal de MyTodoList.

La implementacion recomendada no es "meter Next.js dentro de CRA". Es portar el dashboard a componentes React reutilizables dentro del frontend principal, apoyado por un endpoint agregado del backend. Esto preserva lo valioso del dashboard (composicion visual y Recharts) sin arrastrar un segundo runtime.

## 6. Plan de Accion Propuesto

### Fase 3.1 - Backend KPI real

1. Crear `DashboardSprintDeveloperMetricDTO`.
2. Crear `DashboardMetricsController` con `GET /api/dashboard/sprint-developer-metrics`.
3. Agregar query agregada en `TareaRepository`.
4. Filtrar tareas eliminadas.
5. Normalizar estados completados.
6. Ordenar por `Sprint.fechaInicio`, `Sprint.idSprint`, `Usuario.nombre`.
7. Verificar que el endpoint no exponga entidades JPA completas, solo DTOs.

### Fase 3.2 - Frontend principal como host

1. Agregar dependencias necesarias al frontend principal:
   - `react-router-dom`
   - `recharts`
   - `lucide-react` si se conservan iconos del dashboard.
2. Crear rutas:
   - `/` para la vista actual de tareas.
   - `/dashboard` para KPIs.
3. Agregar boton/enlace `Dashboard` en la UI principal.
4. Agregar fallback SPA en Spring Boot si se usa `BrowserRouter`.

### Fase 3.3 - Modulo dashboard

1. Crear `src/dashboard/DashboardPage.jsx`.
2. Crear `src/dashboard/SprintDeveloperGroupedBar.jsx`.
3. Crear `src/dashboard/dashboardApi.js`.
4. Crear `src/dashboard/useSprintDeveloperMetrics.js`.
5. Crear `src/dashboard/dashboard.css`.
6. Transformar la respuesta larga del endpoint a forma compatible con Recharts:

```js
[
  { sprint: "Sprint 1", "Jose Angel": 1, "Nicolas": 0 },
  { sprint: "Sprint 2", "Jose Angel": 0, "Nicolas": 2 }
]
```

7. Renderizar dos graficas:
   - `Tasks Completed by Developer per Sprint`
   - `Total Horas Reales por usuario / sprint`
8. Implementar loading, error recuperable, estado vacio y responsive layout.
9. No usar `mock-metrics` en la ruta productiva.

### Fase 3.4 - Limpieza y coherencia

1. Mantener `frontend-dashboard` como referencia durante la migracion.
2. Despues de validar, decidir si:
   - se elimina,
   - se mueve a `archive/`,
   - o se conserva solo como prototipo documentado.
3. Corregir textos con encoding roto si se reutiliza cualquier copy del dashboard.

### Fase 4 - Verificacion

1. Probar endpoint con datos reales:
   - debe devolver sprints con desarrolladores.
   - debe contar completadas por usuario/sprint.
   - debe sumar `horasReales` por usuario/sprint.
2. Probar frontend:
   - `npm run build` en `MtdrSpring/backend/src/main/frontend`.
   - verificar UI responsive.
   - validar que no hay mocks en las graficas obligatorias.
3. Probar backend:
   - al menos compilacion Maven.
   - si el entorno Oracle local esta disponible, ejecutar pruebas/manual smoke del endpoint.
4. Probar empaquetado:
   - `mvn package` desde `MtdrSpring/backend`.
   - verificar que el build React queda en `target/classes/static`.

## 7. Alternativa si se Aprueba Opcion A

Si se prefiere velocidad inicial sobre simplicidad operativa:

1. Crear o ajustar scripts para levantar:
   - Spring Boot en `8080`.
   - React principal en `3000` o puerto disponible.
   - Next dashboard en otro puerto, por ejemplo `3001`.
2. Agregar boton `Dashboard` en frontend principal con URL configurable.
3. Corregir CORS con `@Bean` o usar rewrites de Next.js hacia el backend.
4. Conectar `frontend-dashboard/src/app/dashboard/page.tsx` al endpoint real.
5. Reemplazar `mock-metrics.ts` para las dos graficas obligatorias.
6. Documentar despliegue con reverse proxy para evitar puertos expuestos al usuario final.

## 8. Decision y Estado

Decision aprobada por negocio: Opcion B.

Se avanzo con la arquitectura recomendada:

- Dashboard como modulo interno del frontend principal.
- Backend con endpoint agregado real para KPIs por sprint/desarrollador.
- Un solo despliegue final servido por Spring Boot.

Verificacion ejecutada:

- `npm.cmd run build` en `MtdrSpring/backend/src/main/frontend`.
- `mvnw.cmd -DskipTests package` en `MtdrSpring/backend` usando `JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.10.7-hotspot`.

Nota operativa: Spring Boot 3.x requiere Java 17 o superior. Por eso el `pom.xml` quedo alineado a `java.version=17`; en esta maquina Maven Wrapper usa Java 11 si no se sobreescribe `JAVA_HOME`, mientras que el JDK 21 instalado si permite compilar y empaquetar correctamente.

## 9. Observabilidad de Metricas

El dashboard integrado ya no depende de mocks para las graficas obligatorias. La ruta productiva consume:

`GET /api/dashboard/sprint-developer-metrics`

Ese endpoint alimenta tres superficies visibles en `/dashboard`:

1. Tarjetas resumen:
   - Total de sprints observados.
   - Total de developers observados.
   - Total de completed tasks.
   - Total de horas reales.
2. Grafica `Tasks Completed by Developer per Sprint`.
3. Grafica `Total Horas Reales por usuario / sprint`.
4. Tabla `Detalle de metricas observadas`, que muestra el payload real por sprint/desarrollador.

La tabla se agrego deliberadamente como evidencia visual directa, para que las barras no sean la unica forma de comprobar el dato.

### Contrato Real del Endpoint

Ejemplo de respuesta esperada:

```json
[
  {
    "sprintId": 1,
    "sprintName": "Sprint 1",
    "developerId": 1,
    "developerName": "Jose Angel",
    "completedTasks": 1,
    "realHours": 5.0
  }
]
```

### SQL de Validacion Equivalente

Esta consulta debe devolver los mismos totales que el endpoint:

```sql
SELECT
    s.ID_SPRINT AS sprint_id,
    s.NOMBRE AS sprint_name,
    u.ID_USUARIO AS developer_id,
    u.NOMBRE AS developer_name,
    SUM(
        CASE
            WHEN UPPER(e.NOMBRE_ESTADO) IN ('COMPLETADA', 'COMPLETADO', 'DONE', 'COMPLETED')
            THEN 1
            ELSE 0
        END
    ) AS completed_tasks,
    COALESCE(SUM(t.HORAS_REALES), 0) AS real_hours
FROM ADMIN.TAREAS t
JOIN ADMIN.SPRINTS s
    ON s.ID_SPRINT = t.ID_SPRINT
JOIN ADMIN.USUARIOS u
    ON u.ID_USUARIO = t.ID_USUARIO_ASIGNADO
LEFT JOIN ADMIN.ESTADOS_TAREA e
    ON e.ID_ESTADO = t.ID_ESTADO
WHERE t.ELIMINADA = 0
GROUP BY
    s.ID_SPRINT,
    s.NOMBRE,
    s.FECHA_INICIO,
    u.ID_USUARIO,
    u.NOMBRE
ORDER BY
    s.FECHA_INICIO ASC,
    s.ID_SPRINT ASC,
    u.NOMBRE ASC;
```

### Datos Semilla Esperados

Con los inserts actuales de `schema_combined.sql` / `reset_database.sql`, si la base fue cargada con esos datos:

| Sprint | Developer | Completed tasks | Horas reales |
| --- | --- | ---: | ---: |
| Sprint 1 | Jose Angel | 1 | 5 |
| Sprint 1 | Nicolas | 0 | 4 |
| Sprint 2 | Santiago | 0 | 0 |
| Sprint Bot 1 | Maria Fernanda | 0 | 6 |

Estos valores salen de los estados y horas de `ADMIN.TAREAS`, excluyendo tareas con `ELIMINADA = 1`.

### Como Observarlo en Local

1. Asegurar que `JAVA_HOME` use JDK 17+:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Microsoft\jdk-21.0.10.7-hotspot'
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
```

2. Asegurar que el backend tenga variables Oracle reales:

```powershell
$env:driver_class_name = 'oracle.jdbc.OracleDriver'
$env:db_url = '<jdbc-oracle-url-real>'
$env:db_user = '<usuario-real>'
$env:dbpassword = '<password-real>'
```

3. Levantar el backend:

```powershell
cd C:\Users\yeric\telgram-main\MtdrSpring\backend
.\mvnw.cmd spring-boot:run
```

4. Abrir:

```text
http://localhost:8080/dashboard
```

5. Verificar directamente el JSON:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:8080/api/dashboard/sprint-developer-metrics
```

### Estado de Observacion en Esta Maquina

Se intento arrancar el JAR empaquetado en `8081`, pero la aplicacion no pudo iniciar por configuracion de Oracle:

```text
ORA-17067: La direccion URL de Oracle especificada no es valida: OracleDataSource.makeURL
```

Causa raiz local:

- `OracleConfiguration` lee `driver_class_name`, `db_url`, `db_user` y `dbpassword` desde variables de entorno.
- En esta sesion esas variables no existen.
- En `application.properties` la URL local de Oracle esta comentada.

Por eso la compilacion y empaquetado estan verificados, pero la observacion runtime contra base real queda bloqueada hasta configurar la conexion Oracle real o reutilizar una instancia backend ya levantada con esas variables.
