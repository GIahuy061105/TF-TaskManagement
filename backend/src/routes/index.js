import { authRoutes } from './auth.js'
import { projectRoutes } from './projects.js'
import { taskRoutes } from './tasks.js'
import { clientRoutes } from './clients.js'
import { invoiceRoutes } from './invoices.js'
import { workspaceRoutes } from './workspace.js'
import { settingRoutes } from './settings.js'
export async function registerRoutes(app) {
  await app.register(authRoutes, { prefix: '/api' })
  await app.register(projectRoutes, { prefix: '/api' })
  await app.register(taskRoutes, { prefix: '/api' })
  await app.register(clientRoutes, { prefix: '/api'})
  await app.register(invoiceRoutes, { prefix: '/api' })
  await app.register(workspaceRoutes, { prefix: '/api' })
  await app.register(settingRoutes , { prefix: '/api'})
}