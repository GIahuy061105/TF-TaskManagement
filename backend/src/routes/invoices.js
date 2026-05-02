import { authenticate } from '../middlewares/authenticate.js'
import { authorize } from '../middlewares/rbac.js'
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  sendInvoice,
  markAsPaid,
  deleteInvoice
} from '../services/invoice.service.js'

export async function invoiceRoutes(app) {
  app.get('/invoices', { preHandler: [authenticate , authorize(['ADMIN'])] }, async (request, reply) => {
    const workspaceId = request.headers['x-workspace-id'];
    const invoices = await getInvoices(workspaceId)
    return reply.send(invoices)
  })

  app.post('/invoices', { preHandler: authenticate }, async (request, reply) => {
    try {
      const workspaceId = request.headers['x-workspace-id'];
      const invoice = await createInvoice(workspaceId, request.body)
      return reply.code(201).send(invoice)
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })

  app.get('/invoices/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const workspaceId = request.headers['x-workspace-id'];
      const invoice = await getInvoiceById(request.params.id, workspaceId)
      return reply.send(invoice)
    } catch (err) {
      reply.code(404).send({ message: err.message })
    }
  })

  app.patch('/invoices/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const workspaceId = request.headers['x-workspace-id'];
      const invoice = await updateInvoice(request.params.id, workspaceId, request.body)
      return reply.send(invoice)
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })

  app.post('/invoices/:id/send', { preHandler: authenticate }, async (request, reply) => {
    try {
      const workspaceId = request.headers['x-workspace-id'];
      const invoice = await sendInvoice(request.params.id, workspaceId)
      return reply.send(invoice)
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })

  app.post('/invoices/:id/mark-paid', { preHandler: authenticate }, async (request, reply) => {
    try {
      const workspaceId = request.headers['x-workspace-id'];
      const invoice = await markAsPaid(request.params.id, workspaceId)
      return reply.send(invoice)
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })

  app.delete('/invoices/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const workspaceId = request.headers['x-workspace-id'];
      await deleteInvoice(request.params.id, workspaceId)
      return reply.code(204).send()
    } catch (err) {
      reply.code(404).send({ message: err.message })
    }
  })
}