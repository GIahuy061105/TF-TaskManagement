import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getProjects(workspaceId , userId , userRole) {
  let whereCondition = { workspaceId };
  if (userRole !== 'ADMIN') {
    whereCondition = {
      workspaceId,
      OR: [
        { visibility: 'PUBLIC' },
        { members: { some: { userId: userId } } }
      ]
    };
  }
  return prisma.project.findMany({
    where: whereCondition,
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
      members: { include: { user: true } },
      tasks: {
        include:{
        assignees:{
            include: { user: true }
            }
        },
        orderBy: { position: 'asc' }
      }
    }
  })
  if (!project) throw new Error('Project not found')
  return project
}

export async function createProject(workspaceId, data , creatorId) {
  return prisma.project.create({
    data: {
      workspaceId,
      name: data.name,
      clientId: data.clientId || null,
      hourlyRate: data.hourlyRate || null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      status: data.status ? data.status.toUpperCase() : 'ACTIVE',
      visibility: data.visibility || 'PUBLIC',
      color: data.color || '#6366f1',
      icon: data.icon || '📁',
      description: data.description || null,
      members: {
        create: {
            userId: creatorId
        }
      }
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
      visibility: data.visibility,
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
export async function addMemberToProject(projectId, userId) {
  const existingMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } }
  })
  if (existingMember) {
      throw new Error('Thành viên này đã có trong dự án rồi!');
  }

  return prisma.projectMember.create({
    data: { projectId, userId },
    include: {
        user: {
            select: { id: true, fullName: true, email: true, avatarUrl: true }
        }
    }
  })
}
export async function removeMemberFromProject(projectId, userId) {
  return prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId } }
  })
}