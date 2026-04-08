import { authRoutes } from './auth.js'

export async function registerRoutes(app) {
  await app.register(authRoutes, { prefix: '/api' })
}
