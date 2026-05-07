import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getInvoices(workspaceId) {
  return prisma.invoice.findMany({
    where: { workspaceId },
    include: { client: true },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getInvoiceById(id, workspaceId) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, workspaceId },
    include: { client: true, workspace: true }
  })
  if (!invoice) throw new Error('Invoice not found')
  return invoice
}

export async function createInvoice(workspaceId, data) {
  const count = await prisma.invoice.count({ where: { workspaceId } })
  const invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`

  const subtotal = data.lineItems.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice
  }, 0)

  const taxRate = data.taxRate || 0
  const total = subtotal + (subtotal * taxRate) / 100

  return prisma.invoice.create({
    data: {
      workspaceId,
      clientId: data.clientId,
      invoiceNumber,
      status: 'DRAFT',
      lineItems: data.lineItems,
      subtotal,
      taxRate,
      total,
      dueDate: data.dueDate ? new Date(data.dueDate) : null
    },
    include: { client: true }
  })
}

export async function updateInvoice(id, workspaceId, data) {
  const invoice = await prisma.invoice.findFirst({ where: { id, workspaceId } })
  if (!invoice) throw new Error('Invoice not found')
  if (invoice.status !== 'DRAFT') throw new Error('Chỉ có thể sửa invoice ở trạng thái draft')

  const subtotal = data.lineItems.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice
  }, 0)
  const taxRate = data.taxRate || 0
  const total = subtotal + (subtotal * taxRate) / 100

  return prisma.invoice.update({
    where: { id },
    data: {
      clientId: data.clientId,
      lineItems: data.lineItems,
      subtotal,
      taxRate,
      total,
      dueDate: data.dueDate ? new Date(data.dueDate) : null
    }
  })
}

export async function sendInvoice(id, workspaceId) {
  const invoice = await prisma.invoice.findFirst({ where: { id, workspaceId } })
  if (!invoice) throw new Error('Invoice not found')

  return prisma.invoice.update({
    where: { id },
    data: { status: 'SENT', sentAt: new Date() }
  })
}

export async function markAsPaid(id, workspaceId) {
  const invoice = await prisma.invoice.findFirst({ where: { id, workspaceId } })
  if (!invoice) throw new Error('Invoice not found')

  return prisma.invoice.update({
    where: { id },
    data: { status: 'PAID', paidAt: new Date() }
  })
}

export async function deleteInvoice(id, workspaceId) {
  const invoice = await prisma.invoice.findFirst({ where: { id, workspaceId } })
  if (!invoice) throw new Error('Invoice not found')
  return prisma.invoice.delete({ where: { id } })
}