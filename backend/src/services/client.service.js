import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getClients(workspaceId) {
  return prisma.client.findMany({
    where: { workspaceId },
    include: {
      _count: { select: { projects: true, invoices: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getClientById(id, workspaceId) {
  const client = await prisma.client.findFirst({
    where: { id, workspaceId },
    include: {
      projects: true,
      invoices: true
    }
  })
  if (!client) throw new Error('Client not found')
  return client
}

export async function createClient(workspaceId, data) {
  return prisma.client.create({
    data: {
      workspaceId,
      name: data.name,
      email: data.email || null,
      company: data.company || null,
      phone: data.phone || null,
      address: data.address || null,
      taxCode: data.taxCode || null,
      personalId: data.personalId || null,
      currency: data.currency || 'VND' // Mặc định ở VN là VND
      }
  })
}

export async function updateClient(id, workspaceId, data) {
  const client = await prisma.client.findFirst({ where: { id, workspaceId } })
  if (!client) throw new Error('Client not found')

  return prisma.client.update({
    where: { id },
    data: {
        name: data.name,
        email: data.email || null,
        company: data.company || null,
        phone: data.phone || null,
        address: data.address || null,
        taxCode: data.taxCode || null,
        personalId: data.personalId || null,
        currency: data.currency || 'VND'
    }
  })
}

export async function deleteClient(id, workspaceId) {
  const client = await prisma.client.findFirst({ where: { id, workspaceId } })
  if (!client) throw new Error('Client not found')
  return prisma.client.delete({ where: { id } })
}