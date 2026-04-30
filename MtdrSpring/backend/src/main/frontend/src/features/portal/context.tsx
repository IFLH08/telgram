import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { obtenerUsuarios } from '../../services/auth.service'
import type { Usuario } from '../../types'
import {
  actualizarPortalTask,
  actualizarPortalTaskStatus,
  crearPortalProject,
  crearPortalTask,
  eliminarPortalTask,
  detenerPortalTaskSession,
  iniciarPortalTaskSession,
  regenerarPortalAccessCode,
  obtenerPortalSnapshot,
  unirUsuarioAProyectoConCodigo,
} from './service'
import type {
  PortalProject,
  PortalProjectInput,
  PortalSnapshot,
  PortalTask,
  PortalTaskInput,
} from './types'

interface PortalState extends PortalSnapshot {
  users: Usuario[]
}

interface PortalContextValue extends PortalState {
  createTask: (input: PortalTaskInput) => Promise<PortalTask>
  updateTask: (taskId: string, changes: Partial<PortalTaskInput>) => Promise<PortalTask>
  updateTaskStatus: (taskId: string, status: PortalTask['estatus']) => Promise<PortalTask>
  startTaskSession: (taskId: string, userId: string) => Promise<PortalTask>
  stopTaskSession: (taskId: string, userId: string) => Promise<PortalTask>
  deleteTask: (taskId: string) => Promise<void>
  createProject: (input: PortalProjectInput) => Promise<PortalProject>
  generateAccessCode: (projectId: string) => Promise<PortalProject>
  joinWithCode: (
    code: string,
    userId: string,
  ) => Promise<{ message: string; proyectoId: string }>
}

const PortalContext = createContext<PortalContextValue | undefined>(undefined)

const estadoInicial: PortalState = {
  users: [],
  tasks: [],
  projects: [],
  sprints: [],
  notifications: [],
  memberships: [],
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PortalState>(estadoInicial)

  const refreshSnapshot = useCallback(async () => {
    const [snapshot, users] = await Promise.all([
      obtenerPortalSnapshot(),
      obtenerUsuarios(),
    ])

    setState({
      ...snapshot,
      users,
    })
  }, [])

  useEffect(() => {
    void refreshSnapshot()
  }, [refreshSnapshot])

  const createTask = useCallback(
    async (input: PortalTaskInput) => {
      const task = await crearPortalTask(input)
      await refreshSnapshot()
      return task
    },
    [refreshSnapshot],
  )

  const updateTask = useCallback(
    async (taskId: string, changes: Partial<PortalTaskInput>) => {
      const task = await actualizarPortalTask(taskId, changes)
      await refreshSnapshot()
      return task
    },
    [refreshSnapshot],
  )

  const updateTaskStatus = useCallback(
    async (taskId: string, status: PortalTask['estatus']) => {
      const task = await actualizarPortalTaskStatus(taskId, status)
      await refreshSnapshot()
      return task
    },
    [refreshSnapshot],
  )

  const startTaskSession = useCallback(
    async (taskId: string, userId: string) => {
      const task = await iniciarPortalTaskSession(taskId, userId)
      await refreshSnapshot()
      return task
    },
    [refreshSnapshot],
  )

  const stopTaskSession = useCallback(
    async (taskId: string, userId: string) => {
      const task = await detenerPortalTaskSession(taskId, userId)
      await refreshSnapshot()
      return task
    },
    [refreshSnapshot],
  )

  const deleteTask = useCallback(
    async (taskId: string) => {
      await eliminarPortalTask(taskId)
      await refreshSnapshot()
    },
    [refreshSnapshot],
  )

  const createProject = useCallback(
    async (input: PortalProjectInput) => {
      const project = await crearPortalProject(input)
      await refreshSnapshot()
      return project
    },
    [refreshSnapshot],
  )

  const generateAccessCode = useCallback(
    async (projectId: string) => {
      const project = await regenerarPortalAccessCode(projectId)
      await refreshSnapshot()
      return project
    },
    [refreshSnapshot],
  )

  const joinWithCode = useCallback(
    async (code: string, userId: string) => {
      const result = await unirUsuarioAProyectoConCodigo(code, userId)
      await refreshSnapshot()
      return result
    },
    [refreshSnapshot],
  )

  const value = useMemo<PortalContextValue>(
    () => ({
      ...state,
      createTask,
      updateTask,
      updateTaskStatus,
      startTaskSession,
      stopTaskSession,
      deleteTask,
      createProject,
      generateAccessCode,
      joinWithCode,
    }),
    [
      state,
      createTask,
      updateTask,
      updateTaskStatus,
      startTaskSession,
      stopTaskSession,
      deleteTask,
      createProject,
      generateAccessCode,
      joinWithCode,
    ],
  )

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
}

export function usePortal() {
  const context = useContext(PortalContext)

  if (!context) {
    throw new Error('usePortal debe usarse dentro de PortalProvider')
  }

  return context
}
