import { authenticate } from '../middlewares/authenticate.js'
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
} from '../services/client.service.js'

export async function clientRoutes(app) {
  app.get('/clients', { preHandler: authenticate }, async (request, reply) => {
    const workspaceId = request.headers['x-workspace-id'];
    const clients = await getClients(workspaceId)
    return reply.send(clients)
  })

  app.post('/clients', { preHandler: authenticate }, async (request, reply) => {
    try {
      const workspaceId = request.headers['x-workspace-id'];
      const client = await createClient(workspaceId, request.body)
      return reply.code(201).send(client)
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })

  app.get('/clients/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const workspaceId = request.headers['x-workspace-id'];
      const client = await getClientById(request.params.id, workspaceId)
      return reply.send(client)
    } catch (err) {
      reply.code(404).send({ message: err.message })
    }
  })

  app.patch('/clients/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const workspaceId = request.headers['x-workspace-id'];
      const client = await updateClient(request.params.id, workspaceId, request.body)
      return reply.send(client)
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })

  app.delete('/clients/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const workspaceId = request.headers['x-workspace-id'];
      await deleteClient(request.params.id, workspaceId)
      return reply.code(204).send()
    } catch (err) {
      reply.code(404).send({ message: err.message })
    }
  })
}