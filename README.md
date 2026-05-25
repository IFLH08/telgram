https://www.canva.com/design/DAG7Ug0g8SE/sWtF6hIbjp1lNv7ra0aN9w/edit?utm_content=DAG7Ug0g8SE&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton
# DevTask

## Spring AI en el backend Spring Boot

La integracion de IA del backend Spring Boot vive en `MtdrSpring/backend` y usa Spring AI con un proveedor remoto compatible con OpenAI. Para la entrega actual se usa Groq como proveedor remoto porque el proyecto ya maneja `GROQ_API_KEY`.

Variables requeridas para levantar el backend real:

```env
DB_URL=jdbc:oracle:thin:@...
TNS_ADMIN_PATH=/ruta/a/wallet
DB_USER=...
DB_PASSWORD=...
GROQ_API_KEY=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_BOT_NAME=...
```

Variables opcionales para cambiar el proveedor OpenAI-compatible, por ejemplo un modelo dockerizado en OCI:

```env
SPRING_AI_OPENAI_BASE_URL=http://host-del-modelo:puerto
SPRING_AI_OPENAI_CHAT_MODEL=nombre-del-modelo
SPRING_AI_TEMPERATURE=0.2
```

Endpoint de verificacion:

```http
GET /api/spring-ai/ask?prompt=Explica brevemente Spring AI
```

El flujo real del bot conserva `/AddTask ...`, pero ahora la generacion del JSON de tareas pasa por Spring AI. El modelo debe devolver un arreglo JSON con `nombre`, `descripcion`, `horasEstimadas` e `idPrioridad`; despues el bot mantiene la confirmacion del usuario y guarda las tareas en Oracle.

Pendiente de infraestructura: si el equipo de OCI provee un modelo administrado en OCI GenAI, se puede migrar a `spring-ai-starter-model-oci-genai`. Si provee un modelo dockerizado compatible con OpenAI, basta apuntar `SPRING_AI_OPENAI_BASE_URL` al endpoint del contenedor. Kubernetes queda como integracion opcional.

DevTask es una plataforma de gestión de proyectos y tareas moderna, diseñada para equipos de desarrollo. Construida con React 19 y Node.js, cuenta con una sólida arquitectura y está integrada nativamente con la inteligencia artificial de Google Gemini para agilizar la redacción y planeación de tareas.

## Características Principales

- **Gestión Integral de Tareas:** Crea, edita, filtra y busca tareas por estado (pendiente, en progreso, completada, bloqueada), prioridad, categoría, proyecto o responsable.
- **Asistente de IA Incorporado (Gemini):** Genera borradores estructurados automáticos de tareas con solo describir una idea general y el contexto. Utiliza el modelo `gemini-2.5-flash`.
- **Seguimiento de Tiempo Continuo:** Cronómetro nativo incorporado en el flujo de trabajo para registrar horas exactas por cada tarea.
- **Métricas de Proyectos Compartidos:** Monitoreo del porcentaje de avance en tiempo real de cada proyecto basado en el estatus y comportamiento de sus tareas internas.
- **Control de Permisos de Usuario:** Lógica robusta para determinar quién puede registrar horas, eliminar o modificar los componentes según roles establecidos.
- **Dashboard de Reportes:** Exportación y visualización del estatus global del sprint o la compañía.

## Stack Tecnológico

- **Frontend:** React 19, TypeScript, Vite 8, diseño basado en Utility Classes (Tailwind CSS).
- **Backend:** Node.js, Express.js, SDK `@google/genai` , motor de persistencia [tsx](cci:7://file:///Users/joseangel/Documents/Port/Dev-task/Dev-Task-/src/pages/Tareas.tsx:0:0-0:0).
- **Gestor de Paquetes:** `pnpm`.

## Instalación y Configuración

### 1. Requisitos previos
- Node.js (v18 o superior recomendado)
- **pnpm** instalado globalmente (`npm install -g pnpm`)
- Una clave de API de Google Gemini (Obténla gratis en [Google AI Studio](https://aistudio.google.com/))

### 2. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/Aleman1205/Dev-Task-.git
cd Dev-Task-
pnpm install
```

### 3. Configurar tus Variables de Entorno
Crea un archivo nuevo llamado `.env` en la raíz de la carpeta del proyecto y agrega tu pase para la inteligencia artificial:
```env
# Clave obligatoria para el asistente virtual de creación de tareas
GEMINI_API_KEY=tu_clave_secreta_aqui

# Puedes cambiar el puerto en caso de que el 3001 esté ocupado
PORT=3001
```

### 4. Lanzar la Aplicación (Modo de Desarrollo)
DevTask incluye un script unificado en su [package.json](cci:7://file:///Users/joseangel/Documents/Port/Dev-task/Dev-Task-/package.json:0:0-0:0) para levantar el ecosistema completo con un comando:

- ** Recomendado: Iniciar frontend y backend simultáneamente en la misma terminal**
  ```bash
  pnpm run dev:full
  ```
  *(El frontend se abrirá usualmente en `http://localhost:5173` o `5174`, y el backend estará escuchando desde tu puerto `3001`)*

- **Si prefieres iniciar los servicios por separado en distintas terminales:**
  ```bash
  # Iniciar solo el Frontend (Vite)
  pnpm run dev
  
  # Iniciar solo el Backend y dejarlo vigilando cambios (tsx watch)
  pnpm run dev:backend
  ```

##  Topología del Proyecto

```text
Dev-Task-/
├── backend/            # Lógica pura del servidor y consumo de APIs
│   └── src/
│       ├── routes/     # Endpoints de Express (ej. /api/ia/generar)
│       └── server.ts   # Corazón del servidor y configuración de CORS
|
├── src/                # Código fuente del Frontend / UI (React)
│   ├── components/     # Piezas reutilizables, tablas, modales e íconos (DRY)
│   ├── constants/      # Colores estructurales y Constantes globales
│   ├── pages/          # Páginas principales (Tareas, Proyectos, Reportes)
│   ├── permissions/    # Funciones ayudantes que determinan accesos (RBAC)
│   ├── services/       # Falsa persistencia y comunicación con el verdadero Backend
│   ├── types/          # Centralización obligatoria de definiciones de Typescript
│   └── utils/          # Formateadores compartidos (taskFormatters.ts)
|
├── package.json
└── README.md
```
