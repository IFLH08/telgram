import { expect, test } from '@playwright/test'

test.describe('Portal funcional', () => {
  test('carga el dashboard y permite navegar por las secciones principales', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('Portal de administracion')).toBeVisible()

    await page.getByRole('button', { name: 'Tareas' }).click()
    await expect(page.getByRole('heading', { name: 'Tareas', level: 1 })).toBeVisible()

    await page.getByRole('button', { name: 'Proyectos' }).click()
    await expect(page.getByRole('heading', { name: 'Proyectos', level: 1 })).toBeVisible()

    await page.getByRole('button', { name: 'Codigos de acceso' }).click()
    await expect(
      page.getByRole('heading', { name: 'Codigos de acceso', level: 1 }),
    ).toBeVisible()
  })

  test('dashboard cambia entre vista admin y developer con filtros visibles solo para admin', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Filtros de KPIs')).toBeVisible()
    await page.getByLabel('Proyecto').selectOption('proyecto-chatbot')
    await expect(
      page.getByText('Integracion Telegram · Sprint 1', { exact: true }).first(),
    ).toBeVisible()

    await page.getByLabel('Usuario demo').selectOption('usuario-dev-ian')
    await expect(page.getByText('Mis tareas')).toBeVisible()
    await expect(page.getByText('Filtros de KPIs')).toHaveCount(0)
  })

  test('valida y crea una tarea manual desde el portal', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Tareas' }).click()

    await page.getByRole('button', { name: 'Agregar tarea' }).click()
    await page.getByRole('button', { name: 'Crear tarea' }).click()

    await expect(
      page.getByText(
        'Completa nombre, descripcion, persona asignada, proyecto, sprint y fecha de entrega.',
      ),
    ).toBeVisible()

    await page.getByLabel('Task name').fill('Prueba E2E crear tarea')
    await page.getByLabel('Description').fill('Validacion automatizada del flujo de alta.')
    await page.getByLabel('Due').fill('2026-05-10')
    await page.getByRole('button', { name: 'Crear tarea' }).click()

    await expect(page.getByText('La tarea fue creada correctamente.')).toBeVisible()
    await expect(page.getByText('Prueba E2E crear tarea')).toBeVisible()
  })

  test('developer puede cambiar estatus de sus tareas pero no ve acciones de admin', async ({ page }) => {
    await page.goto('/')

    await page.getByLabel('Usuario demo').selectOption('usuario-dev-ian')
    await page.getByRole('button', { name: 'Tareas' }).click()

    await expect(page.getByRole('button', { name: 'Agregar tarea' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Generar con IA' })).toHaveCount(0)

    const designRow = page.locator('tbody tr').filter({ hasText: 'Diseñar base de datos' })
    await expect(designRow).toHaveCount(1)
    await expect(designRow.getByRole('button', { name: 'Editar' })).toHaveCount(0)

    const statusSelect = designRow.locator('select')
    await statusSelect.selectOption('en_progreso')
    await expect(page.getByText('El estatus de la tarea fue actualizado.')).toBeVisible()
    await expect(statusSelect).toHaveValue('en_progreso')
  })

  test('developer puede abrir una ventana con la descripcion completa de la tarea', async ({ page }) => {
    await page.goto('/')

    await page.getByLabel('Usuario demo').selectOption('usuario-dev-ian')
    await page.getByRole('button', { name: 'Tareas' }).click()

    const designRow = page.locator('tbody tr').filter({ hasText: 'Diseñar base de datos' })
    await expect(designRow).toHaveCount(1)
    await expect(page.getByRole('dialog')).toHaveCount(0)

    await designRow
      .getByRole('button', { name: 'Ver descripcion completa de Diseñar base de datos' })
      .click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('Detalle de tarea')).toBeVisible()
    await expect(
      dialog.getByText('Modelo relacional inicial alineado con Oracle Autonomous Database.'),
    ).toBeVisible()

    await dialog.getByRole('button', { name: 'Cerrar' }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('el header abre un panel de notificaciones con alertas reales de tarea, vencimiento y timer activo', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Tareas' }).click()

    await page.getByRole('button', { name: 'Agregar tarea' }).click()
    await page.getByLabel('Task name').fill('Tarea E2E panel de alertas')
    await page.getByLabel('Description').fill('Validacion real del panel de notificaciones.')
    await page.getByLabel('Assign').selectOption('usuario-dev-ian')
    await page.getByLabel('Due').fill('2026-04-26')
    await page.getByRole('button', { name: 'Crear tarea' }).click()
    await expect(page.getByText('La tarea fue creada correctamente.')).toBeVisible()

    await page.getByLabel('Usuario demo').selectOption('usuario-dev-ian')

    const notificationButton = page.getByRole('button', { name: /Notificaciones/ })
    await notificationButton.click()

    const notificationPanel = page.getByRole('dialog', {
      name: 'Notificaciones y alertas',
    })
    await expect(notificationPanel).toBeVisible()
    await expect(notificationPanel.getByText('Nueva tarea asignada')).toBeVisible()
    await expect(notificationPanel.getByText('Entrega cercana').first()).toBeVisible()
    await expect(notificationPanel.getByText('Tarea E2E panel de alertas').first()).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(notificationPanel).toHaveCount(0)

    const taskRow = page.locator('tbody tr').filter({ hasText: 'Tarea E2E panel de alertas' })
    await taskRow
      .getByRole('button', { name: 'Ver descripcion completa de Tarea E2E panel de alertas' })
      .click()

    const taskDialog = page.getByRole('dialog')
    await taskDialog.getByRole('button', { name: 'Iniciar sesion' }).click()
    await expect(page.getByText('Sesion de trabajo iniciada.')).toBeVisible()
    await taskDialog.getByRole('button', { name: 'Cerrar' }).click()

    await notificationButton.click()
    await expect(notificationPanel.getByText('Timer activo').first()).toBeVisible()
    await expect(
      notificationPanel.getByText('Tu timer esta corriendo en Tarea E2E panel de alertas.'),
    ).toBeVisible()
  })

  test('edita y elimina tareas existentes desde el portal', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Tareas' }).click()

    await page.getByLabel('Busqueda').fill('Diseñar base de datos')
    const designRow = page.locator('tbody tr').filter({ hasText: 'Diseñar base de datos' })
    await expect(designRow).toHaveCount(1)

    await designRow.getByRole('button', { name: 'Editar' }).click()
    await page.getByLabel('Task name').fill('Diseñar base de datos v2')
    await page.getByLabel('Description').fill('Modelo relacional inicial actualizado para validacion E2E.')
    await page.getByRole('button', { name: 'Guardar cambios' }).click()

    await expect(page.getByText('La tarea fue actualizada correctamente.')).toBeVisible()
    await expect(page.getByText('Diseñar base de datos v2')).toBeVisible()

    await page.getByLabel('Busqueda').fill('Panel de KPIs por sprint')
    const deleteRow = page.locator('tbody tr').filter({ hasText: 'Panel de KPIs por sprint' })
    await expect(deleteRow).toHaveCount(1)

    await deleteRow.getByRole('button', { name: 'Eliminar' }).click()
    await expect(page.getByText('La tarea fue eliminada logicamente.')).toBeVisible()
    await expect(page.locator('tbody tr').filter({ hasText: 'Panel de KPIs por sprint' })).toHaveCount(0)
    await expect(page.getByText('No hay tareas que coincidan con los filtros actuales.')).toBeVisible()
  })

  test('el listado de tareas mantiene armonia visual con descripciones muy largas', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Tareas' }).click()

    const longDescription = Array.from({ length: 12 })
      .map(
        (_, index) =>
          `Bloque ${index + 1}: esta descripcion extensa valida que el listado siga limpio, legible y proporcionado aunque el texto sea muy largo.`,
      )
      .join(' ')

    await page.getByRole('button', { name: 'Agregar tarea' }).click()
    await page.getByLabel('Task name').fill('Tarea E2E descripcion extensa')
    await page.getByLabel('Description').fill(longDescription)
    await page.getByLabel('Due').fill('2026-05-15')
    await page.getByRole('button', { name: 'Crear tarea' }).click()

    await expect(page.getByText('La tarea fue creada correctamente.')).toBeVisible()

    await page.getByLabel('Busqueda').fill('Tarea E2E descripcion extensa')
    const row = page.locator('tbody tr').filter({ hasText: 'Tarea E2E descripcion extensa' })
    await expect(row).toHaveCount(1)

    const description = row.locator('.portal-task-description')
    const descriptionBox = await description.boundingBox()
    const rowBox = await row.boundingBox()
    const hasLargeOverflow = await page.evaluate(() => {
      const width = document.documentElement.clientWidth
      const scrollWidth = document.documentElement.scrollWidth
      return scrollWidth - width > 24
    })

    expect(descriptionBox).not.toBeNull()
    expect(rowBox).not.toBeNull()
    expect(descriptionBox!.height).toBeLessThanOrEqual(28)
    expect(hasLargeOverflow).toBeFalsy()
    await expect(description).toHaveAttribute('title', longDescription)
  })

  test('genera una tarea con IA usando mock y muestra error visible si la IA falla', async ({ page }) => {
    await page.route('**/api/ia/generar', async (route) => {
      const body = route.request().postDataJSON()

      if (String(body?.prompt ?? '').includes('forzar-error')) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Servicio de IA no disponible para la prueba.' }),
        })
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          texto: [
            'TITULO: Tablero de seguimiento automatizado',
            'DESCRIPCION:',
            'Crear un tablero de seguimiento para tareas y responsables.',
            'HORAS_ESTIMADAS: 6',
            'PUNTOS_HISTORIA: 3',
          ].join('\n'),
        }),
      })
    })

    await page.goto('/')
    await page.getByRole('button', { name: 'Tareas' }).click()

    await page.getByRole('button', { name: 'Generar con IA' }).click()
    await page.getByLabel('Idea general').fill('Crear tablero automatizado')
    await page.getByLabel('Contexto o detalles').fill('forzar-error')
    await page.getByRole('button', { name: 'Generar borrador' }).click()
    await expect(page.getByText('Servicio de IA no disponible para la prueba.')).toBeVisible()

    await page.getByLabel('Contexto o detalles').fill('Generar borrador funcional para el portal')
    await page.getByRole('button', { name: 'Generar borrador' }).click()

    await expect(page.getByText('Se generó un borrador de tarea con IA. Revísalo y guárdalo.')).toBeVisible()
    await expect(page.getByLabel('Task name')).toHaveValue('Tablero de seguimiento automatizado')
    await expect(page.getByLabel('Description')).toHaveValue(
      'Crear un tablero de seguimiento para tareas y responsables.',
    )

    await page.getByRole('button', { name: 'Crear tarea' }).click()
    await expect(page.getByText('La tarea fue creada correctamente.')).toBeVisible()
    await expect(page.getByText('Tablero de seguimiento automatizado')).toBeVisible()
  })

  test('los modales principales pueden cerrarse con Escape', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Tareas' }).click()
    await page.getByRole('button', { name: 'Agregar tarea' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)

    await page.getByRole('button', { name: 'Generar con IA' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)

    await page.getByRole('button', { name: 'Proyectos' }).click()
    await page.getByRole('button', { name: 'Nuevo proyecto' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('valida y crea un proyecto desde el portal', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Proyectos' }).click()

    await page.getByRole('button', { name: 'Nuevo proyecto' }).click()
    await page.getByRole('button', { name: 'Crear proyecto' }).click()

    await expect(
      page.getByText('Completa nombre, descripcion, fecha de inicio y fecha de fin.'),
    ).toBeVisible()

    await page.getByLabel('Nombre').fill('Proyecto E2E portal')
    await page.getByLabel('Descripcion').fill('Proyecto creado para validar el flujo funcional.')
    await page.getByLabel('Fecha de inicio').fill('2026-05-01')
    await page.getByLabel('Fecha de fin').fill('2026-05-20')
    await page.getByRole('button', { name: 'Crear proyecto' }).click()

    await expect(
      page.getByText('Proyecto creado correctamente con codigo y Sprint 1 inicial.'),
    ).toBeVisible()
    await expect(page.getByText('Proyecto E2E portal')).toBeVisible()
  })

  test('valida fechas de proyecto y bloquea inicio posterior a fin', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Proyectos' }).click()

    await page.getByRole('button', { name: 'Nuevo proyecto' }).click()
    await page.getByLabel('Nombre').fill('Proyecto con fechas invalidas')
    await page.getByLabel('Descripcion').fill('Validacion E2E para fechas invertidas.')
    await page.getByLabel('Fecha de inicio').fill('2026-06-10')
    await page.getByLabel('Fecha de fin').fill('2026-06-01')
    await page.getByRole('button', { name: 'Crear proyecto' }).click()

    await expect(
      page.getByText('La fecha de inicio no puede ser posterior a la fecha de fin.'),
    ).toBeVisible()
  })

  test('filtra proyectos por nombre y muestra estado vacio cuando no hay coincidencias', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Proyectos' }).click()

    await page.getByLabel('Busqueda').fill('TEL483KD')
    await expect(page.getByText('Integracion Telegram')).toBeVisible()
    await expect(page.getByText('Sistema de Gestion de Tareas')).toHaveCount(0)

    await page.getByLabel('Busqueda').fill('Proyecto inexistente E2E')
    await expect(page.getByText('No hay proyectos que coincidan con la busqueda actual.')).toBeVisible()
  })

  test('regenera un codigo y permite unirse con el nuevo valor, rechazando el viejo y el duplicado', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Codigos de acceso' }).click()

    const chatbotRow = page.locator('tbody tr').filter({ hasText: 'Integracion Telegram' })
    const oldCode = (await chatbotRow.locator('td').nth(1).innerText()).trim()

    await page.getByLabel('Proyecto').selectOption('proyecto-chatbot')
    await page.getByRole('button', { name: 'Regenerar codigo' }).click()
    await expect(page.getByText('Codigo actualizado:')).toBeVisible()

    const newCode = (await chatbotRow.locator('td').nth(1).innerText()).trim()
    expect(newCode).not.toBe(oldCode)

    await page.getByLabel('Usuario demo').selectOption('usuario-dev-ian')

    await page.getByLabel('Codigo de acceso').fill(oldCode)
    await page.getByRole('button', { name: 'Unirme al proyecto' }).click()
    await expect(page.getByText('El codigo de acceso no es valido.')).toBeVisible()

    await page.getByLabel('Codigo de acceso').fill(newCode)
    await page.getByRole('button', { name: 'Unirme al proyecto' }).click()
    await expect(page.getByText('Acceso concedido a Integracion Telegram.')).toBeVisible()
    await expect(page.getByText('Integracion Telegram', { exact: true })).toBeVisible()

    await page.getByLabel('Codigo de acceso').fill(newCode)
    await page.getByRole('button', { name: 'Unirme al proyecto' }).click()
    await expect(page.getByText('El usuario ya tiene acceso a ese proyecto.')).toBeVisible()
  })

  test('muestra errores visibles en codigos de acceso para un desarrollador', async ({ page }) => {
    await page.goto('/')

    await page.getByLabel('Usuario demo').selectOption('usuario-dev-ian')
    await expect(page.getByLabel('Usuario demo')).toHaveValue('usuario-dev-ian')

    await page.getByRole('button', { name: 'Codigos de acceso' }).click()
    await expect(
      page.getByRole('heading', { name: 'Codigos de acceso', level: 1 }),
    ).toBeVisible()

    await page.getByRole('button', { name: 'Unirme al proyecto' }).click()
    await expect(page.getByText('Ingresa un codigo de acceso valido.')).toBeVisible()
  })

  test('mantiene navegacion y contenido principal en un viewport movil basico', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
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
