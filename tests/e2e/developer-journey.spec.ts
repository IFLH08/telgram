import { expect, test, type Page } from '@playwright/test'

function formatDateOffset(daysFromToday: number) {
  const date = new Date()
  date.setDate(date.getDate() + daysFromToday)
  return date.toISOString().split('T')[0]
}

async function switchDemoUser(page: Page, userId: string) {
  await page.getByLabel('Usuario demo').selectOption(userId)
  await expect(page.getByLabel('Usuario demo')).toHaveValue(userId)
}

test.describe('Portal developer journey', () => {
  test('developer recorre su jornada diaria desde dashboard hasta trabajo activo en tareas', async ({ page }) => {
    await page.goto('/')

    await switchDemoUser(page, 'usuario-dev-ian')

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('Mis alertas operativas')).toBeVisible()
    await expect(page.getByText('Proximas fechas de entrega')).toBeVisible()
    await expect(page.getByText('Diseñar base de datos', { exact: true })).toBeVisible()
    await expect(page.getByText('Filtros de KPIs')).toHaveCount(0)

    await page.getByRole('button', { name: 'Tareas' }).click()
    await expect(page.getByRole('heading', { name: 'Tareas', level: 1 })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Agregar tarea' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Generar con IA' })).toHaveCount(0)

    await page.getByLabel('Busqueda').fill('Diseñar base de datos')
    const designRow = page.locator('tbody tr').filter({ hasText: 'Diseñar base de datos' })
    await expect(designRow).toHaveCount(1)

    await designRow
      .getByRole('button', { name: 'Ver descripcion completa de Diseñar base de datos' })
      .click()

    const detailDialog = page.getByRole('dialog')
    await expect(detailDialog).toBeVisible()
    await expect(detailDialog.getByText('Detalle de tarea')).toBeVisible()
    await expect(
      detailDialog.getByText('Modelo relacional inicial alineado con Oracle Autonomous Database.'),
    ).toBeVisible()
    await expect(detailDialog.getByText('Tracking profesional')).toBeVisible()
    await detailDialog.getByRole('button', { name: 'Cerrar' }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)

    const statusSelect = designRow.locator('select')
    await statusSelect.selectOption('en_progreso')
    await expect(page.getByText('El estatus de la tarea fue actualizado.')).toBeVisible()
    await expect(statusSelect).toHaveValue('en_progreso')

    await page.getByLabel('Estatus').selectOption('en_progreso')
    await expect(page.locator('tbody tr')).toHaveCount(1)
    await expect(designRow).toContainText('Diseñar base de datos')
  })

  test('developer completa pipeline real con onboarding a proyecto nuevo y trabajo asignado', async ({ page }) => {
    const projectName = 'Proyecto pipeline developer E2E'
    const taskName = 'Tarea pipeline Ian E2E'
    const taskDescription =
      'Completar flujo end-to-end del developer en un proyecto nuevo usando el portal.'

    await page.goto('/')

    await page.getByRole('button', { name: 'Proyectos' }).click()
    await page.getByRole('button', { name: 'Nuevo proyecto' }).click()
    await page.getByLabel('Nombre').fill(projectName)
    await page.getByLabel('Descripcion').fill(
      'Proyecto creado para validar onboarding, acceso y trabajo completo del developer.',
    )
    await page.getByLabel('Fecha de inicio').fill(formatDateOffset(0))
    await page.getByLabel('Fecha de fin').fill(formatDateOffset(20))
    await page.getByRole('button', { name: 'Crear proyecto' }).click()

    await expect(
      page.getByText('Proyecto creado correctamente con codigo y Sprint 1 inicial.'),
    ).toBeVisible()
    await expect(page.getByText(projectName)).toBeVisible()

    await page.getByRole('button', { name: 'Codigos de acceso' }).click()
    const projectRow = page.locator('tbody tr').filter({ hasText: projectName })
    await expect(projectRow).toHaveCount(1)
    const accessCode = (await projectRow.locator('td').nth(1).innerText()).trim()
    expect(accessCode).not.toBe('')

    await switchDemoUser(page, 'usuario-dev-ian')
    await expect(page.getByText('Ingresar codigo')).toBeVisible()
    await page.getByLabel('Codigo de acceso').fill(accessCode)
    await page.getByRole('button', { name: 'Unirme al proyecto' }).click()

    await expect(page.getByText(`Acceso concedido a ${projectName}.`)).toBeVisible()
    await expect(page.getByText(projectName, { exact: true })).toBeVisible()

    await switchDemoUser(page, 'usuario-admin-jose')
    await page.getByRole('button', { name: 'Tareas' }).click()
    await page.getByRole('button', { name: 'Agregar tarea' }).click()
    const taskDialog = page.getByRole('dialog', { name: 'Agregar tarea' })
    await taskDialog.getByLabel('Task name').fill(taskName)
    await taskDialog.getByLabel('Description').fill(taskDescription)
    await taskDialog.getByLabel('Assign').selectOption('usuario-dev-ian')
    await taskDialog.getByLabel('Project').selectOption({ label: projectName })
    await taskDialog.getByLabel('Sprint').selectOption({ label: 'Sprint 1' })
    await taskDialog.getByLabel('Due').fill(formatDateOffset(2))
    await taskDialog.getByRole('button', { name: 'Crear tarea' }).click()

    await expect(page.getByText('La tarea fue creada correctamente.')).toBeVisible()
    await expect(page.getByText(taskName)).toBeVisible()

    await switchDemoUser(page, 'usuario-dev-ian')
    await page.getByLabel('Busqueda').fill(taskName)

    const developerTaskRow = page.locator('tbody tr').filter({ hasText: taskName })
    await expect(developerTaskRow).toHaveCount(1)

    await developerTaskRow
      .getByRole('button', { name: `Ver descripcion completa de ${taskName}` })
      .click()

    const previewDialog = page.getByRole('dialog')
    await expect(previewDialog).toBeVisible()
    await expect(previewDialog.getByText(taskDescription)).toBeVisible()

    await previewDialog.getByRole('button', { name: 'Iniciar sesion' }).click()
    await expect(page.getByText('Sesion de trabajo iniciada.')).toBeVisible()
    await expect(previewDialog.getByText('Sesion activa')).toBeVisible()
    await expect(previewDialog.getByRole('button', { name: 'Detener sesion' })).toBeVisible()

    await page.waitForTimeout(1200)

    await previewDialog.getByRole('button', { name: 'Detener sesion' }).click()
    await expect(page.getByText('Sesion de trabajo detenida.')).toBeVisible()
    await expect(previewDialog.getByText('Sesion cerrada')).toBeVisible()
    await expect(previewDialog.getByText('Sesiones registradas')).toBeVisible()
    await previewDialog.getByRole('button', { name: 'Cerrar' }).click()

    const statusSelect = developerTaskRow.locator('select')
    await statusSelect.selectOption('en_progreso')
    await expect(page.getByText('El estatus de la tarea fue actualizado.')).toBeVisible()
    await expect(statusSelect).toHaveValue('en_progreso')

    await page.getByRole('button', { name: 'Dashboard' }).click()
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText(taskName, { exact: true })).toBeVisible()
    await expect(page.getByText('Mis alertas operativas')).toBeVisible()
  })
})
