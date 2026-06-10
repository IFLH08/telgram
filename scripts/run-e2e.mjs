import { spawn } from 'node:child_process'
import { createServer } from 'vite'

const server = await createServer({
  server: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
})

await server.listen()

const child = spawn(
  process.execPath,
  ['node_modules/@playwright/test/cli.js', 'test', '--config=playwright.p0.config.ts'],
  {
    stdio: 'inherit',
    shell: false,
  },
)

child.on('exit', async (code) => {
  await server.close()
  process.exit(code ?? 1)
})

child.on('error', async (error) => {
  console.error(error)
  await server.close()
  process.exit(1)
})
