import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getProjects(workspaceId) {
  return prisma.project.findMany({
    where: { workspaceId },
    include: {
      client: true,
      _count: { select: { tasks: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getProjectById(id, workspaceId) {
  const project = await prisma.project.findFirst({
    where: { id, workspaceId },
    include: {
      client: true,
      tasks: {
        orderBy: { position: 'asc' }
      }
    }
  })
  if (!project) throw new Error('Project not found')
  return project
}

export async function createProject(workspaceId, data) {
  return prisma.project.create({
    data: {
      workspaceId,
      name: data.name,
      clientId: data.clientId || null,
      hourlyRate: data.hourlyRate || null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      status: data.status ? data.status.toUpperCase() : 'ACTIVE',
      color: data.color || '#6366f1',
      icon: data.icon || '📁',
      description: data.description || null
    },
    include: { client: true }
  })
}

export async function updateProject(id, workspaceId, data) {
  const project = await prisma.project.findFirst({ where: { id, workspaceId } })
  if (!project) throw new Error('Project not found')

  return prisma.project.update({
    where: { id },
    data: {
      name: data.name,
      status: data.status,
      hourlyRate: data.hourlyRate,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      clientId: data.clientId
    }
  })
}

export async function deleteProject(id, workspaceId) {
  const project = await prisma.project.findFirst({ where: { id, workspaceId } })
  if (!project) throw new Error('Project not found')

  return prisma.project.delete({ where: { id } })
}