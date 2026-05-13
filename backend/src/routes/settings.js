import { authenticate } from '../middlewares/authenticate.js'
import { authorize } from '../middlewares/rbac.js'
import { getSettings, updateSettings } from '../services/setting.service.js'

export async function settingRoutes(app) {
  app.get('/settings', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const settings = await getSettings()
      return reply.send(settings)
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })
  app.put('/settings', { preHandler: [authenticate, authorize(['ADMIN'])] }, async (request, reply) => {
    try {
      const settings = await updateSettings(request.body)
      return reply.send(settings)
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })
}