import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getInvoices(workspaceId) {
  return prisma.invoice.findMany({
    where: { workspaceId },
    include: { client: true , project: true },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getInvoiceById(id, workspaceId) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, workspaceId },
    include: { client: true, workspace: true , project: true}
  })
  if (!invoice) throw new Error('Invoice not found')
  return invoice
}

export async function createInvoice(workspaceId, data) {
  if (data.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, workspaceId }
    })
  if (!project) throw new Error('Dự án không tồn tại')
  if (project.clientId && project.clientId !== data.clientId) {
      throw new Error('Dự án này không thuộc về Khách hàng đã chọn!')
    }
  }
  const count = await prisma.invoice.count({ where: { workspaceId } })
  const invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`

  const subtotal = data.lineItems.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice
  }, 0)

  const taxRate = data.taxRate || 0
  const taxAmount = (subtotal * taxRate) / 100
  const total = subtotal + taxAmount

  return prisma.invoice.create({
    data: {
          workspaceId,
          clientId: data.clientId,
          projectId: data.projectId || null,
          invoiceNumber,
          formSymbol: data.formSymbol || null,
          invoiceSymbol: data.invoiceSymbol || null,
          paymentMethod: data.paymentMethod || 'CK',
          status: 'DRAFT',
          lineItems: data.lineItems,
          subtotal,
          taxRate,
          taxAmount,
          total,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          notes: data.notes || null,
          terms: data.terms || null
    },
    include: { client: true , project: true}
  })
}

export async function updateInvoice(id, workspaceId, data) {
  const invoice = await prisma.invoice.findFirst({ where: { id, workspaceId } })
  if (!invoice) throw new Error('Invoice not found')
  if (invoice.status !== 'DRAFT') throw new Error('Chỉ có thể sửa invoice ở trạng thái draft')
  if (data.projectId) {
      const project = await prisma.project.findFirst({
        where: { id: data.projectId, workspaceId }
      })
      if (!project) throw new Error('Dự án không tồn tại')
      if (project.clientId && project.clientId !== data.clientId) {
        throw new Error('Dự án này không thuộc về Khách hàng đã chọn!')
      }
  }
  const subtotal = data.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const taxRate = data.taxRate || 0
  const taxAmount = (subtotal * taxRate) / 100
  const total = subtotal + taxAmount

  return prisma.invoice.update({
    where: { id },
    data: {
          clientId: data.clientId,
          projectId: data.projectId || null,
          formSymbol: data.formSymbol || null,
          invoiceSymbol: data.invoiceSymbol || null,
          paymentMethod: data.paymentMethod || 'CK',
          lineItems: data.lineItems,
          subtotal,
          taxRate,
          taxAmount,
          total,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          notes: data.notes || null,
          terms: data.terms || null
    },
    include: { client: true, project: true }
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