import { authRoutes } from './auth.js'
import { projectRoutes } from './projects.js'
import { taskRoutes } from './tasks.js'

export async function registerRoutes(app) {
  await app.register(authRoutes, { prefix: '/api' })
  await app.register(projectRoutes, { prefix: '/api' })
  await app.register(taskRoutes, { prefix: '/api' })
}