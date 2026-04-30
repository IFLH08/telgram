# Guia de Migracion del Dashboard KPI a `main`

## Objetivo

Migrar a `main` la integracion del Dashboard KPI implementada en `dashboardTequi`.

El resultado esperado es:

- Dashboard disponible en `/dashboard`.
- Endpoint real disponible en `/api/dashboard/sprint-developer-metrics`.
- Dos graficas visibles:
  - `Tasks Completed by Developer per Sprint`
  - `Total Horas Reales por usuario / sprint`
- Sin uso de mocks para esas metricas.

## Archivos a Migrar

Origen del codigo:

```text
Repositorio: https://github.com/IFLH08/telgram.git
Rama fuente: dashboardTequi
Rama destino: main
```

Copiar estos archivos desde `dashboardTequi` hacia `main`:

```text
DASHBOARD_MIGRATION_GUIDE.md
integration_plan.md
MtdrSpring/backend/pom.xml
MtdrSpring/backend/src/main/frontend/package.json
MtdrSpring/backend/src/main/frontend/package-lock.json
MtdrSpring/backend/src/main/frontend/src/App.js
MtdrSpring/backend/src/main/frontend/src/index.css
MtdrSpring/backend/src/main/frontend/src/dashboard/DashboardPage.jsx
MtdrSpring/backend/src/main/frontend/src/dashboard/SprintDeveloperGroupedBar.jsx
MtdrSpring/backend/src/main/frontend/src/dashboard/dashboard.css
MtdrSpring/backend/src/main/frontend/src/dashboard/dashboardApi.js
MtdrSpring/backend/src/main/frontend/src/dashboard/dashboardData.js
MtdrSpring/backend/src/main/frontend/src/dashboard/useSprintDeveloperMetrics.js
MtdrSpring/backend/src/main/java/com/springboot/MyTodoList/controller/DashboardMetricsController.java
MtdrSpring/backend/src/main/java/com/springboot/MyTodoList/controller/SpaRouteController.java
MtdrSpring/backend/src/main/java/com/springboot/MyTodoList/dto/DashboardSprintDeveloperMetricDTO.java
MtdrSpring/backend/src/main/java/com/springboot/MyTodoList/service/DashboardMetricsService.java
MtdrSpring/backend/src/main/java/com/springboot/MyTodoList/repository/TareaRepository.java
```

## Fragmentos Clave a Replicar

Estos son los cambios minimos que deben existir en `main` despues de migrar.

### Backend: Endpoint

Ruta:

```text
MtdrSpring/backend/src/main/java/com/springboot/MyTodoList/controller/DashboardMetricsController.java
```

```java
@RestController
@RequestMapping("/api/dashboard")
public class DashboardMetricsController {
    private final DashboardMetricsService dashboardMetricsService;

    public DashboardMetricsController(DashboardMetricsService dashboardMetricsService) {
        this.dashboardMetricsService = dashboardMetricsService;
    }

    @GetMapping("/sprint-developer-metrics")
    public List<DashboardSprintDeveloperMetricDTO> getSprintDeveloperMetrics() {
        return dashboardMetricsService.getSprintDeveloperMetrics();
    }
}
```

### Backend: Query Real

Ruta:

```text
MtdrSpring/backend/src/main/java/com/springboot/MyTodoList/repository/TareaRepository.java
```

```java
@Query("SELECT new com.springboot.MyTodoList.dto.DashboardSprintDeveloperMetricDTO(" +
       "s.idSprint, s.nombre, u.idUsuario, u.nombre, " +
       "SUM(CASE WHEN UPPER(e.nombreEstado) = 'COMPLETADA' OR UPPER(e.nombreEstado) = 'COMPLETADO' OR UPPER(e.nombreEstado) = 'DONE' OR UPPER(e.nombreEstado) = 'COMPLETED' THEN 1L ELSE 0L END), " +
       "COALESCE(SUM(t.horasReales), 0.0)) " +
       "FROM Tarea t " +
       "JOIN t.sprint s " +
       "JOIN t.usuarioAsignado u " +
       "LEFT JOIN t.estado e " +
       "WHERE t.eliminada = false " +
       "GROUP BY s.idSprint, s.nombre, s.fechaInicio, u.idUsuario, u.nombre " +
       "ORDER BY s.fechaInicio ASC, s.idSprint ASC, u.nombre ASC")
List<DashboardSprintDeveloperMetricDTO> findSprintDeveloperMetrics();
```

### Frontend: Consumo del Endpoint

Ruta:

```text
MtdrSpring/backend/src/main/frontend/src/dashboard/dashboardApi.js
```

```js
const DASHBOARD_METRICS_URL = '/api/dashboard/sprint-developer-metrics';

export async function fetchSprintDeveloperMetrics(signal) {
  const response = await fetch(DASHBOARD_METRICS_URL, {
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`No se pudieron cargar las metricas (${response.status}).`);
  }

  return response.json();
}
```

### Frontend: Ruta del Dashboard

Ruta:

```text
MtdrSpring/backend/src/main/frontend/src/App.js
```

```jsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<TodoPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
  </Routes>
</BrowserRouter>
```

### Frontend: Graficas Requeridas

Ruta:

```text
MtdrSpring/backend/src/main/frontend/src/dashboard/DashboardPage.jsx
```

```jsx
<SprintDeveloperGroupedBar
  title="Tasks Completed by Developer per Sprint"
  data={dashboardData.completedBySprint}
  series={dashboardData.series}
  unit="tasks"
/>

<SprintDeveloperGroupedBar
  title="Total Horas Reales por usuario / sprint"
  data={dashboardData.realHoursBySprint}
  series={dashboardData.series}
  unit="hrs"
  allowDecimals
/>
```

### Spring: Fallback para `/dashboard`

Ruta:

```text
MtdrSpring/backend/src/main/java/com/springboot/MyTodoList/controller/SpaRouteController.java
```

```java
@Controller
public class SpaRouteController {
    @RequestMapping({"/dashboard", "/dashboard/"})
    public String forwardDashboardRoute() {
        return "forward:/index.html";
    }
}
```

## Migracion con Git

Desde cualquier clon del repositorio:

```bash
git clone https://github.com/IFLH08/telgram.git
cd telgram
git fetch origin
git checkout main
git pull --ff-only origin main
git checkout -b migrate-dashboard-kpi
```

Copiar los archivos desde la rama `dashboardTequi`:

```bash
git checkout origin/dashboardTequi -- DASHBOARD_MIGRATION_GUIDE.md
git checkout origin/dashboardTequi -- integration_plan.md
git checkout origin/dashboardTequi -- MtdrSpring/backend/pom.xml
git checkout origin/dashboardTequi -- MtdrSpring/backend/src/main/frontend/package.json
git checkout origin/dashboardTequi -- MtdrSpring/backend/src/main/frontend/package-lock.json
git checkout origin/dashboardTequi -- MtdrSpring/backend/src/main/frontend/src/App.js
git checkout origin/dashboardTequi -- MtdrSpring/backend/src/main/frontend/src/index.css
git checkout origin/dashboardTequi -- MtdrSpring/backend/src/main/frontend/src/dashboard
git checkout origin/dashboardTequi -- MtdrSpring/backend/src/main/java/com/springboot/MyTodoList/controller/DashboardMetricsController.java
git checkout origin/dashboardTequi -- MtdrSpring/backend/src/main/java/com/springboot/MyTodoList/controller/SpaRouteController.java
git checkout origin/dashboardTequi -- MtdrSpring/backend/src/main/java/com/springboot/MyTodoList/dto/DashboardSprintDeveloperMetricDTO.java
git checkout origin/dashboardTequi -- MtdrSpring/backend/src/main/java/com/springboot/MyTodoList/service/DashboardMetricsService.java
git checkout origin/dashboardTequi -- MtdrSpring/backend/src/main/java/com/springboot/MyTodoList/repository/TareaRepository.java
```

Revisar cambios:

```bash
git status
git diff --stat
```

## Validacion

### 1. Frontend

```bash
cd MtdrSpring/backend/src/main/frontend
npm install
npm run build
```

Debe terminar con:

```text
Compiled successfully.
```

### 2. Backend

Usar JDK 17 o superior.

```bash
cd MtdrSpring/backend
./mvnw -DskipTests package
```

En Windows:

```powershell
cd MtdrSpring\backend
.\mvnw.cmd -DskipTests package
```

Debe terminar con:

```text
BUILD SUCCESS
```

### 3. Variables de Oracle

Antes de levantar el backend, configurar la conexion real:

```bash
driver_class_name=oracle.jdbc.OracleDriver
db_url=<jdbc-oracle-url>
db_user=<oracle-user>
dbpassword=<oracle-password>
```

En PowerShell:

```powershell
$env:driver_class_name = 'oracle.jdbc.OracleDriver'
$env:db_url = '<jdbc-oracle-url>'
$env:db_user = '<oracle-user>'
$env:dbpassword = '<oracle-password>'
```

### 4. Levantar la Aplicacion

```bash
cd MtdrSpring/backend
./mvnw spring-boot:run
```

En Windows:

```powershell
cd MtdrSpring\backend
.\mvnw.cmd spring-boot:run
```

### 5. Probar el Endpoint

```bash
curl http://localhost:8080/api/dashboard/sprint-developer-metrics
```

Respuesta esperada:

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

Si devuelve `[]`, revisar que existan tareas con:

- `ID_SPRINT`
- `ID_USUARIO_ASIGNADO`
- `ELIMINADA = 0`
- `HORAS_REALES`

### 6. Probar el Dashboard

Abrir:

```text
http://localhost:8080/dashboard
```

Debe mostrar:

- Tarjetas resumen.
- Grafica de tareas completadas por developer/sprint.
- Grafica de horas reales por usuario/sprint.
- Tabla de detalle con las metricas observadas.

## SQL de Verificacion

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

## Commit y PR a `main`

```bash
git add DASHBOARD_MIGRATION_GUIDE.md integration_plan.md MtdrSpring/backend
git commit -m "Integrate KPI dashboard into main frontend"
git push -u origin migrate-dashboard-kpi
```

Crear PR:

```text
base: main
compare: migrate-dashboard-kpi
```

Antes de mergear:

- `npm run build` aprobado.
- `mvnw -DskipTests package` aprobado.
- Endpoint devuelve datos reales.
- `/dashboard` muestra ambas graficas.
