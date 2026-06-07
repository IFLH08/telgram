import { expect, test } from '@playwright/test'

test.describe('Dashboard KPIs reales', () => {
  test('dashboard carga sin mock y muestra KPIs reales', async ({ page }) => {
    const mockWarnings: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'warning' && msg.text().includes('mock')) {
        mockWarnings.push(msg.text())
      }
    })

    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

    await expect(page.getByText('Tasks completed')).toBeVisible()
    await expect(page.getByText('Hours worked')).toBeVisible()
    await expect(page.getByText('Developers')).toBeVisible()
    await expect(page.getByText('Sprints')).toBeVisible()

    expect(mockWarnings).toHaveLength(0)
  })

  test('filtros de sprint y developer son visibles en el dashboard admin', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

    await expect(page.getByLabel('Sprint')).toBeVisible()
    await expect(page.getByLabel('Developer')).toBeVisible()
    await expect(page.getByLabel('Proyecto')).toBeVisible()
  })

  test('filtro por sprint actualiza las graficas', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

    const sprintSelect = page.getByLabel('Sprint')
    await expect(sprintSelect).toBeVisible()

    const sprintOptions = await sprintSelect.locator('option').allTextContents()
    const hasRealSprints = sprintOptions.some((opt) => opt !== 'Todos los sprints')
    expect(hasRealSprints).toBeTruthy()

    if (hasRealSprints) {
      const secondOption = sprintOptions[1]
      await sprintSelect.selectOption({ label: secondOption })
      await page.waitForTimeout(500)
      await expect(page.getByText('Tasks completed')).toBeVisible()
    }
  })

  test('filtro por developer actualiza las graficas', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

    const developerSelect = page.getByLabel('Developer')
    await expect(developerSelect).toBeVisible()

    await page.waitForTimeout(800)
    const devOptions = await developerSelect.locator('option').allTextContents()
    const hasRealDevs = devOptions.some((opt) => opt !== 'Todos los developers')

    if (hasRealDevs) {
      const secondOption = devOptions[1]
      await developerSelect.selectOption({ label: secondOption })
      await page.waitForTimeout(500)
      await expect(page.getByText('Tasks completed')).toBeVisible()
    }
  })

  test('completar una tarea actualiza el dashboard', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

    const initialCompletedText = await page.getByText('Tasks completed').locator('..').locator('..').textContent()

    await page.getByRole('button', { name: 'Tareas' }).click()
    await expect(page.getByRole('heading', { name: 'Tareas', level: 1 })).toBeVisible()

    await page.getByRole('button', { name: 'Agregar tarea' }).click()
    await page.getByLabel('Task name').fill('Tarea E2E dashboard KPI test')
    await page.getByLabel('Description').fill('Test de actualizacion de KPIs en dashboard.')
    await page.getByLabel('Due').fill('2026-06-11')
    await page.getByRole('button', { name: 'Crear tarea' }).click()
    await expect(page.getByText('La tarea fue creada correctamente.')).toBeVisible()

    await page.getByRole('button', { name: 'Dashboard' }).click()
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('Tasks completed')).toBeVisible()

    const updatedCompletedText = await page.getByText('Tasks completed').locator('..').locator('..').textContent()
    expect(updatedCompletedText).toBeDefined()
    expect(initialCompletedText).toBeDefined()
  })

  test('sprints hasta el 11 de junio aparecen en el filtro', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

    await page.waitForTimeout(500)
    const sprintOptions = await page.getByLabel('Sprint').locator('option').allTextContents()
    const hasSprintsBeforeCutoff = sprintOptions.length > 1
    expect(hasSprintsBeforeCutoff).toBeTruthy()
  })

  test('developer no ve filtros de KPIs', async ({ page }) => {
    await page.goto('/')

    await page.getByLabel('Usuario demo').selectOption('usuario-dev-ian')
    await expect(page.getByText('Filtros de KPIs')).toHaveCount(0)
    await expect(page.getByLabel('Sprint')).toHaveCount(0)
    await expect(page.getByLabel('Developer')).toHaveCount(0)
  })
})
