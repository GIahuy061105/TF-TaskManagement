import { authenticate } from '../middlewares/authenticate.js'
import { authorize } from '../middlewares/rbac.js'
import { updateTask, moveTask, deleteTask, logTime } from '../services/task.service.js'

export async function taskRoutes(app) {
  app.patch('/tasks/:id', { preHandler: [authenticate, authorize(['ADMIN', 'MEMBER'])] }, async (request, reply) => {
    try {
      const task = await updateTask(request.params.id, request.body)
      return reply.send(task)
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })

  app.patch('/tasks/:id/move', { preHandler: [authenticate, authorize(['ADMIN', 'MEMBER'])] }, async (request, reply) => {
    try {
      const task = await moveTask(request.params.id, request.body)
      return reply.send(task)
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })

  app.delete('/tasks/:id', { preHandler: [authenticate, authorize(['ADMIN', 'MEMBER'])] }, async (request, reply) => {
    try {
      await deleteTask(request.params.id)
      return reply.code(204).send()
    } catch (err) {
      reply.code(404).send({ message: err.message })
    }
  })

  app.post('/tasks/:id/time-logs', { preHandler: [authenticate, authorize(['ADMIN', 'MEMBER'])] }, async (request, reply) => {
    try {
      const { userId } = request.user
      const log = await logTime(request.params.id, userId, request.body)
      return reply.code(201).send(log)
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })
}