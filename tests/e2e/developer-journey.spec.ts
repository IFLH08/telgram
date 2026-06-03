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

async function createProject(page: Page, projectName: string) {
  await page.getByRole('button', { name: 'Proyectos' }).click()
  await page.getByRole('button', { name: 'Nuevo proyecto' }).click()
  await page.getByLabel('Nombre').fill(projectName)
  await page.getByLabel('Descripcion').fill('Proyecto E2E con datos de API real.')
  await page.getByLabel('Fecha de inicio').fill(formatDateOffset(0))
  await page.getByLabel('Fecha de fin').fill(formatDateOffset(14))
  await page.getByRole('button', { name: 'Crear proyecto' }).click()
  await expect(
    page.getByText('Proyecto creado correctamente con codigo y Sprint 1 inicial.'),
  ).toBeVisible()
}

async function createAssignedTask(page: Page, taskName: string, projectName: string) {
  await page.getByRole('button', { name: 'Tareas' }).click()
  await page.getByRole('button', { name: 'Agregar tarea' }).click()

  const dialog = page.getByRole('dialog', { name: 'Agregar tarea' })
  await dialog.getByLabel('Task name').fill(taskName)
  await dialog.getByLabel('Description').fill('Implementar el flujo real del developer.')
  await dialog.getByLabel('Assign').selectOption(portalMockIds.ian)
  await dialog.getByLabel('Project').selectOption({ label: projectName })
  await dialog.getByLabel('Sprint').selectOption({ label: 'Sprint 1' })
  await dialog.getByLabel('Due').fill(formatDateOffset(3))
  await dialog.getByRole('button', { name: 'Crear tarea' }).click()

  await expect(page.getByText('La tarea fue creada correctamente.')).toBeVisible()
}

test.describe('Portal developer journey', () => {
  test.beforeEach(async ({ page }) => {
    await mockPortalApi(page)
  })

  test('developer ve una tarea asignada y la completa con horas reales', async ({ page }) => {
    const suffix = Date.now()
    const projectName = `Proyecto developer ${suffix}`
    const taskName = `Tarea developer ${suffix}`

    await page.goto('/')
    await switchDemoUser(page, portalMockIds.admin)
    await createProject(page, projectName)
    await createAssignedTask(page, taskName, projectName)

    await switchDemoUser(page, portalMockIds.ian)
    await expect(page.getByRole('heading', { name: 'Tareas', level: 1 })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Agregar tarea' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Generar con IA' })).toHaveCount(0)

    await page.getByLabel('Busqueda').fill(taskName)
    const taskRow = page.locator('tbody tr').filter({ hasText: taskName })
    await expect(taskRow).toHaveCount(1)

    await taskRow.getByRole('button', { name: `Ver descripcion completa de ${taskName}` }).click()
    const detailDialog = page.getByRole('dialog')
    await expect(detailDialog.getByText('Registro de horas')).toBeVisible()
    await expect(detailDialog.getByRole('button', { name: 'Iniciar sesion' })).toHaveCount(0)
    await detailDialog.getByRole('button', { name: 'Cerrar' }).click()

    await taskRow.locator('select').selectOption('completada')
    const completeDialog = page.getByRole('dialog', { name: 'Registrar horas reales' })
    await completeDialog.getByLabel('Horas reales').fill('3.25')
    await completeDialog.getByRole('button', { name: 'Marcar completada' }).click()

    await expect(
      page.getByText('La tarea fue marcada como completada y las horas reales fueron registradas.'),
    ).toBeVisible()
    await expect(taskRow).toContainText('Completada')
    await expect(taskRow).toContainText('3.25 h')
  })
})
