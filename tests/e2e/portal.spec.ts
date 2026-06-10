import { expect, test, type Page } from '@playwright/test'
import { mockPortalApi, type PortalMockState } from './portal-api-mocks'

let mockState: PortalMockState

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!window.sessionStorage.getItem('p0-e2e-storage-cleared')) {
      window.localStorage.clear()
      window.sessionStorage.setItem('p0-e2e-storage-cleared', 'true')
    }
  })
  mockState = await mockPortalApi(page)
})

async function loginAs(page: Page, userId: string) {
  await page.goto('/')
  await page.getByLabel('Usuario demo').selectOption(userId)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
}

test.describe('P0 demo final', () => {
  test('login carga usuarios reales y mantiene sesion local', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'DevTracker' })).toBeVisible()
    await expect(page.getByLabel('Usuario demo')).toContainText('Jose Admin')
    await expect(page.getByLabel('Usuario demo')).toContainText('Ian Leon')

    await page.getByLabel('Usuario demo').selectOption('2')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByLabel('Usuario demo')).toHaveValue('2')
    await expect(page.getByText('Mis tareas')).toBeVisible()

    await page.reload()

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByLabel('Usuario demo')).toHaveValue('2')
  })

  test('admin crea tarea, developer la completa con 3 horas y dashboard refleja KPIs reales', async ({ page }) => {
    await loginAs(page, '1')

    await page.getByRole('button', { name: 'Tareas' }).click()
    await page.getByRole('button', { name: 'Agregar tarea' }).click()

    const taskDialog = page.getByRole('dialog', { name: 'Agregar tarea' })
    await taskDialog.getByLabel('Task name').fill('Cerrar flujo P0 desde portal')
    await taskDialog.getByLabel('Description').fill('Validar asignacion, cierre y KPIs reales.')
    await taskDialog.getByLabel('Assign').selectOption('2')
    await taskDialog.getByLabel('Project').selectOption('10')
    await taskDialog.getByLabel('Sprint').selectOption('100')
    await taskDialog.getByLabel('Due').fill('2026-06-11')
    await taskDialog.getByLabel('Planned Hours').fill('4')
    await taskDialog.getByRole('button', { name: 'Crear tarea' }).click()

    await expect(page.getByText('La tarea fue creada correctamente.')).toBeVisible()
    await expect(page.getByText('Cerrar flujo P0 desde portal')).toBeVisible()

    await page.getByLabel('Usuario demo').selectOption('2')
    await page.getByLabel('Busqueda').fill('Cerrar flujo P0 desde portal')

    const developerTaskRow = page.locator('tbody tr').filter({ hasText: 'Cerrar flujo P0 desde portal' })
    await expect(developerTaskRow).toHaveCount(1)
    await developerTaskRow.locator('select').selectOption('completada')

    const completeDialog = page.getByRole('dialog', { name: 'Registrar horas reales' })
    await completeDialog.getByLabel('Horas reales').fill('3')
    await completeDialog.getByRole('button', { name: 'Marcar completada' }).click()

    await expect(
      page.getByText('La tarea fue marcada como completada y las horas reales fueron registradas.'),
    ).toBeVisible()
    await expect(developerTaskRow).toContainText('3.00 h')

    await page.getByLabel('Usuario demo').selectOption('1')
    await page.getByRole('button', { name: 'Dashboard' }).click()

    await expect(page.getByText('Tasks completed', { exact: true })).toBeVisible()
    await expect(page.getByText('Hours worked', { exact: true })).toBeVisible()
    await expect(page.getByText('1', { exact: true }).first()).toBeVisible()
    await expect(page.getByRole('heading', { name: '3.0 h' })).toBeVisible()
  })

  test('dashboard envia filtros reales de sprint y developer e incluye sprints hasta 11 de junio', async ({ page }) => {
    await loginAs(page, '1')

    await expect(page.getByLabel('Sprint', { exact: true })).toContainText('Sprint Demo')
    await expect(page.getByLabel('Sprint', { exact: true })).not.toContainText('Sprint Posterior')

    await page.getByLabel('Sprint', { exact: true }).selectOption('100')
    await page.getByLabel('Developer', { exact: true }).selectOption('2')

    await expect
      .poll(() => mockState.dashboardMetricRequests.some((url) =>
        url.includes('sprintId=100') && url.includes('developerId=2'),
      ))
      .toBeTruthy()
  })
})
