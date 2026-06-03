import { expect, test, type Page } from '@playwright/test'
import { mockPortalApi, portalMockIds } from './portal-api-mocks'

function formatDateOffset(daysFromToday: number) {
  const date = new Date()
  date.setDate(date.getDate() + daysFromToday)
  return date.toISOString().split('T')[0]
}

async function switchDemoUser(page: Page, userId: string) {
  await page.getByLabel('Usuario demo').selectOption(userId)
  await expect(page.getByLabel('Usuario demo')).toHaveValue(userId)
}

async function createProject(page: Page, projectName: string, description: string) {
  await page.getByRole('button', { name: 'Proyectos' }).click()
  await expect(page.getByRole('heading', { name: 'Proyectos', level: 1 })).toBeVisible()

  await page.getByRole('button', { name: 'Nuevo proyecto' }).click()
  await page.getByLabel('Nombre').fill(projectName)
  await page.getByLabel('Descripcion').fill(description)
  await page.getByLabel('Fecha de inicio').fill(formatDateOffset(0))
  await page.getByLabel('Fecha de fin').fill(formatDateOffset(20))
  await page.getByRole('button', { name: 'Crear proyecto' }).click()

  await expect(
    page.getByText('Proyecto creado correctamente con codigo y Sprint 1 inicial.'),
  ).toBeVisible()
}

async function createTaskForAssignee(
  page: Page,
  {
    taskName,
    description,
    assigneeId,
    projectName,
    dueInDays,
  }: {
    taskName: string
    description: string
    assigneeId: string
    projectName: string
    dueInDays: number
  },
) {
  await page.getByRole('button', { name: 'Agregar tarea' }).click()

  const taskDialog = page.getByRole('dialog', { name: 'Agregar tarea' })
  await taskDialog.getByLabel('Task name').fill(taskName)
  await taskDialog.getByLabel('Description').fill(description)
  await taskDialog.getByLabel('Assign').selectOption(assigneeId)
  await taskDialog.getByLabel('Project').selectOption({ label: projectName })
  await taskDialog.getByLabel('Sprint').selectOption({ label: 'Sprint 1' })
  await taskDialog.getByLabel('Due').fill(formatDateOffset(dueInDays))
  await taskDialog.getByRole('button', { name: 'Crear tarea' }).click()

  await expect(page.getByText('La tarea fue creada correctamente.')).toBeVisible()
}

test.describe('Pipelines reales del portal', () => {
  test.beforeEach(async ({ page }) => {
    await mockPortalApi(page)
  })

  test('pipeline admin: crea proyecto, agrega tareas y las asigna con IDs reales', async ({
    page,
  }) => {
    const suffix = Date.now()
    const projectName = `Proyecto admin pipeline ${suffix}`
    const ianTask = `Tarea Ian ${suffix}`
    const santiTask = `Tarea Santiago ${suffix}`

    await page.goto('/')
    await switchDemoUser(page, portalMockIds.admin)

    await createProject(
      page,
      projectName,
      'Proyecto creado por admin para validar pipeline real de asignacion de trabajo.',
    )

    await page.getByRole('button', { name: 'Tareas' }).click()
    await expect(page.getByRole('heading', { name: 'Tareas', level: 1 })).toBeVisible()

    await createTaskForAssignee(page, {
      taskName: ianTask,
      description: 'Tarea real asignada a Ian desde el pipeline admin.',
      assigneeId: portalMockIds.ian,
      projectName,
      dueInDays: 2,
    })

    await createTaskForAssignee(page, {
      taskName: santiTask,
      description: 'Tarea real asignada a Santiago desde el pipeline admin.',
      assigneeId: portalMockIds.santiago,
      projectName,
      dueInDays: 4,
    })

    await page.getByLabel('Busqueda').fill(projectName)

    const ianRow = page.locator('tbody tr').filter({ hasText: ianTask })
    const santiRow = page.locator('tbody tr').filter({ hasText: santiTask })

    await expect(ianRow).toHaveCount(1)
    await expect(santiRow).toHaveCount(1)
    await expect(ianRow).toContainText('Ian Leon')
    await expect(santiRow).toContainText('Santiago Borbolla Regato')
    await expect(ianRow).toContainText(projectName)
    await expect(santiRow).toContainText(projectName)
  })

  test('pipeline developer: ve tarea, completa con horas reales y dashboard actualiza KPIs', async ({
    page,
  }) => {
    const suffix = Date.now()
    const projectName = `Proyecto dev pipeline ${suffix}`
    const taskName = `Tarea dev pipeline ${suffix}`
    const taskDescription =
      'Tarea real para validar que el developer ve el detalle y completa con horas reales.'

    await page.goto('/')
    await switchDemoUser(page, portalMockIds.admin)

    await createProject(
      page,
      projectName,
      'Proyecto creado para validar el flujo developer en ambiente real del portal.',
    )

    await page.getByRole('button', { name: 'Tareas' }).click()
    await expect(page.getByRole('heading', { name: 'Tareas', level: 1 })).toBeVisible()

    await createTaskForAssignee(page, {
      taskName,
      description: taskDescription,
      assigneeId: portalMockIds.ian,
      projectName,
      dueInDays: 2,
    })

    await switchDemoUser(page, portalMockIds.ian)
    await page.getByLabel('Busqueda').fill(taskName)

    const developerTaskRow = page.locator('tbody tr').filter({ hasText: taskName })
    await expect(developerTaskRow).toHaveCount(1)
    await expect(developerTaskRow).toContainText('Ian Leon')

    await developerTaskRow
      .getByRole('button', { name: `Ver descripcion completa de ${taskName}` })
      .click()

    const detailDialog = page.getByRole('dialog')
    await expect(detailDialog).toBeVisible()
    await expect(detailDialog.getByText(taskDescription)).toBeVisible()
    await expect(detailDialog.getByText('Registro de horas')).toBeVisible()
    await expect(detailDialog.getByText('Tiempo registrado')).toBeVisible()
    await expect(detailDialog.getByRole('button', { name: 'Iniciar sesion' })).toHaveCount(0)
    await detailDialog.getByRole('button', { name: 'Cerrar' }).click()

    await developerTaskRow.locator('select').selectOption('completada')

    const completeDialog = page.getByRole('dialog', { name: 'Registrar horas reales' })
    await expect(completeDialog).toBeVisible()
    await completeDialog.getByLabel('Horas reales').fill('4.5')
    await completeDialog.getByRole('button', { name: 'Marcar completada' }).click()

    await expect(
      page.getByText('La tarea fue marcada como completada y las horas reales fueron registradas.'),
    ).toBeVisible()
    await expect(developerTaskRow).toContainText('Completada')
    await expect(developerTaskRow).toContainText('4.50 h')

    await switchDemoUser(page, portalMockIds.admin)
    await page.getByRole('button', { name: 'Dashboard' }).click()
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible()

    await expect(page.getByText('Tasks completed', { exact: true })).toBeVisible()
    await expect(page.getByText('Hours worked', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: '4.5 h' })).toBeVisible()

    const developerFilter = page.getByLabel('Developer', { exact: true })
    await developerFilter.selectOption(portalMockIds.ian)
    await expect(developerFilter).toHaveValue(portalMockIds.ian)
    await expect(page.getByRole('heading', { name: '4.5 h' })).toBeVisible()
  })
})
