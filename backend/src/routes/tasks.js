import { authenticate } from '../middlewares/authenticate.js'
import { authorize } from '../middlewares/rbac.js'
import { updateTask, moveTask, deleteTask, logTime , requestTaskApprove , approveTask ,createAttachment , getAttachmentsByTask , deleteAttachment} from '../services/task.service.js'
import { getCommentsByTask, createComment } from '../services/comment.service.js'
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
  app.post('/tasks/:id/request-approval', { preHandler: [authenticate, authorize(['ADMIN', 'MEMBER'])] }, async (request, reply) => {
    try{
      const task = await requestTaskApprove(request.params.id)
      return reply.send(task)
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })

  app.post('/tasks/:id/approve', { preHandler: [authenticate, authorize(['ADMIN'])] }, async (request, reply) => {
    try{
      const task = await approveTask(request.params.id)
      return reply.send(task)
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })
  app.get('/tasks/:id/comments', { preHandler: [authenticate, authorize(['ADMIN', 'MEMBER', 'VIEWER'])] }, async (request, reply) => {
    try {
      const comments = await getCommentsByTask(request.params.id)
      return reply.send(comments)
    } catch (err) {
      reply.code(404).send({ message: err.message })
    }
  })
  app.post('/tasks/:id/comments', { preHandler: [authenticate, authorize(['ADMIN', 'MEMBER'])] }, async (request, reply) => {
    try {
      const taskId = request.params.id
      const userId = request.user.userId || request.user.id
      const { content } = request.body
    if (!content || content.trim() === '') {
      throw new Error('Nội dung bình luận không được để trống')
    }
      const comment = await createComment(taskId, userId, content)
      return reply.code(201).send(comment)
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })
  app.post('/tasks/:id/attachments', { preHandler: [authenticate] }, async (req, reply) => {
    const attachment = await createAttachment(req.params.id, req.user.userId, req.body);
    return reply.send(attachment);
  })
  app.get('/tasks/:id/attachments', { preHandler: [authenticate] }, async (request, reply) => {
      try {
        const attachments = await getAttachmentsByTask(request.params.id)
        return reply.send(attachments)
      } catch (err) {
        reply.code(400).send({ message: err.message })
      }
    })

  app.delete('/tasks/:taskId/attachments/:attachmentId', { preHandler: [authenticate] }, async (request, reply) => {
     try {
       await deleteAttachment(request.params.attachmentId)
       return reply.code(204).send()
     } catch (err) {
       reply.code(400).send({ message: err.message })
     }
  })
}