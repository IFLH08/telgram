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
  await expect(page.getByRole('heading', { name: 'Proyectos', level: 1 })).toBeVisible()

  await page.getByRole('button', { name: 'Nuevo proyecto' }).click()
  await page.getByLabel('Nombre').fill(projectName)
  await page.getByLabel('Descripcion').fill('Proyecto creado desde pruebas con API real.')
  await page.getByLabel('Fecha de inicio').fill(formatDateOffset(0))
  await page.getByLabel('Fecha de fin').fill(formatDateOffset(12))
  await page.getByRole('button', { name: 'Crear proyecto' }).click()

  await expect(
    page.getByText('Proyecto creado correctamente con codigo y Sprint 1 inicial.'),
  ).toBeVisible()
}

test.describe('Portal funcional', () => {
  test.beforeEach(async ({ page }) => {
    await mockPortalApi(page)
  })

  test('carga dashboard real y navega por secciones principales', async ({ page }) => {
    await page.goto('/')
    await switchDemoUser(page, portalMockIds.admin)

    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible()
    await expect(page.getByLabel('Developer', { exact: true })).toHaveValue('todos')
    await expect(page.getByLabel('Sprint')).toHaveValue('todos')

    await page.getByRole('button', { name: 'Tareas' }).click()
    await expect(page.getByRole('heading', { name: 'Tareas', level: 1 })).toBeVisible()

    await page.getByRole('button', { name: 'Proyectos' }).click()
    await expect(page.getByRole('heading', { name: 'Proyectos', level: 1 })).toBeVisible()

    await page.getByRole('button', { name: 'Codigos de acceso' }).click()
    await expect(
      page.getByRole('heading', { name: 'Codigos de acceso', level: 1 }),
    ).toBeVisible()
  })

  test('vista developer oculta acciones admin y conserva navegacion basica', async ({ page }) => {
    await page.goto('/')
    await switchDemoUser(page, portalMockIds.ian)

    await expect(page.getByText('Mis tareas')).toBeVisible()
    await expect(page.getByText('Filtros de seguimiento')).toHaveCount(0)

    await page.getByRole('button', { name: 'Tareas' }).click()
    await expect(page.getByRole('button', { name: 'Agregar tarea' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Generar con IA' })).toHaveCount(0)
  })

  test('valida y crea una tarea manual con sprint y developer reales', async ({ page }) => {
    const suffix = Date.now()
    const projectName = `Proyecto portal ${suffix}`
    const taskName = `Tarea portal ${suffix}`

    await page.goto('/')
    await switchDemoUser(page, portalMockIds.admin)
    await createProject(page, projectName)

    await page.getByRole('button', { name: 'Tareas' }).click()
    await page.getByRole('button', { name: 'Agregar tarea' }).click()
    await page.getByRole('button', { name: 'Crear tarea' }).click()

    await expect(
      page.getByText(
        'Completa nombre, descripcion, persona asignada, proyecto, sprint y fecha de entrega.',
      ),
    ).toBeVisible()

    const taskDialog = page.getByRole('dialog', { name: 'Agregar tarea' })
    await taskDialog.getByLabel('Task name').fill(taskName)
    await taskDialog.getByLabel('Description').fill('Validacion automatizada del flujo real.')
    await taskDialog.getByLabel('Assign').selectOption(portalMockIds.ian)
    await taskDialog.getByLabel('Project').selectOption({ label: projectName })
    await taskDialog.getByLabel('Sprint').selectOption({ label: 'Sprint 1' })
    await taskDialog.getByLabel('Due').fill(formatDateOffset(5))
    await taskDialog.getByRole('button', { name: 'Crear tarea' }).click()

    await expect(page.getByText('La tarea fue creada correctamente.')).toBeVisible()
    await expect(page.locator('tbody tr').filter({ hasText: taskName })).toHaveCount(1)
  })

  test('mantiene navegacion y contenido principal en viewport movil basico', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await switchDemoUser(page, portalMockIds.admin)

    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible()
    await expect(page.getByLabel('Usuario demo')).toBeVisible()

    await page.getByRole('button', { name: 'Tareas' }).click()
    await expect(page.getByRole('button', { name: 'Agregar tarea' })).toBeVisible()

    const hasLargeOverflow = await page.evaluate(() => {
      const width = document.documentElement.clientWidth
      const scrollWidth = document.documentElement.scrollWidth
      return scrollWidth - width > 24
    })

    expect(hasLargeOverflow).toBeFalsy()
  })
})
