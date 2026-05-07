import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function getWorkspaceMembers(workspaceId) {
  return prisma.member.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, avatarUrl: true }
      }
    }
  })
}

export async function addMember(workspaceId, { email, role }) {
  const validRoles = ['ADMIN', 'MEMBER', 'VIEWER']
  const normalizedRole = role ? role.toUpperCase() : 'MEMBER'

  if (!validRoles.includes(normalizedRole)) {
    throw new Error('Role không hợp lệ. Phải là ADMIN, MEMBER hoặc VIEWER')
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('Người dùng này chưa có tài khoản hệ thống')

  const existingMember = await prisma.member.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: workspaceId,
        userId: user.id
      }
    }
  })

  if (existingMember) {
    throw new Error('Người dùng này đã là thành viên của workspace')
  }

  return prisma.member.create({
    data: {
      workspaceId,
      userId: user.id,
      role: normalizedRole
    }
  })
}

export async function updateWorkspace(id, data) {
  return prisma.workspace.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description !== undefined ? data.description : undefined,
      logoUrl: data.logoUrl !== undefined ? data.logoUrl : undefined,
      settings: data.settings !== undefined ? data.settings : undefined,
    }
  })
}

export async function removeMember(workspaceId, userId) {
  return prisma.member.delete({
    where: {
      workspaceId_userId: { workspaceId, userId }
    }
  })
}