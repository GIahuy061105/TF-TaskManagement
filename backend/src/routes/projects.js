import { authenticate } from '../middlewares/authenticate.js'
import { authorize } from '../middlewares/rbac.js'
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../services/project.service.js'
import { getTasksByProject, createTask } from '../services/task.service.js'

export async function projectRoutes(app) {
  app.get('/projects', { preHandler: [authenticate,authorize(['ADMIN', 'MEMBER' ,'VIEWER'])] }, async (request, reply) => {
    const workspaceId = request.headers['x-workspace-id'];
    const projects = await getProjects(workspaceId)
    return reply.send(projects)
  })

  app.post('/projects', { preHandler: [authenticate,authorize(['ADMIN'])]}, async (request, reply) => {
    try {
      const workspaceId = request.headers['x-workspace-id'];
      const project = await createProject(workspaceId, request.body)
      return reply.code(201).send(project)
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })

  app.get('/projects/:id', { preHandler: [authenticate,authorize(['ADMIN', 'MEMBER' ,'VIEWER'])]}, async (request, reply) => {
    try {
      const workspaceId = request.headers['x-workspace-id'];
      const project = await getProjectById(request.params.id, workspaceId)
      return reply.send(project)
    } catch (err) {
      reply.code(404).send({ message: err.message })
    }
  })

  app.patch('/projects/:id', { preHandler:[authenticate,authorize(['ADMIN'])] }, async (request, reply) => {
    try {
      const workspaceId = request.headers['x-workspace-id'];
      const project = await updateProject(request.params.id, workspaceId, request.body)
      return reply.send(project)
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })

  app.delete('/projects/:id', { preHandler: [authenticate,authorize(['ADMIN'])] }, async (request, reply) => {
    try {
      const workspaceId = request.headers['x-workspace-id'];
      await deleteProject(request.params.id, workspaceId)
      return reply.code(204).send()
    } catch (err) {
      reply.code(404).send({ message: err.message })
    }
  })

  app.get('/projects/:id/tasks', { preHandler: [authenticate, authorize(['ADMIN', 'MEMBER', 'VIEWER'])] }, async (request, reply) => {
    const tasks = await getTasksByProject(request.params.id)
    return reply.send(tasks)
  })

  app.post('/projects/:id/tasks', { preHandler: [authenticate,authorize(['ADMIN', 'MEMBER'])] }, async (request, reply) => {
    try {
      const task = await createTask(request.params.id, request.body)
      return reply.code(201).send(task)
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })
}