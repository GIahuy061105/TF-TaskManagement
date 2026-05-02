import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export function authorize(allowedRoles) {
  return async (request, reply) => {
    const { userId } = request.user
    const workspaceId = request.headers['x-workspace-id']

    if (!workspaceId) {
      return reply.code(400).send({ message: 'Thiếu Workspace ID trong header' })
    }

    const membership = await prisma.member.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId }
      }
    })

    if (!membership) {
      return reply.code(403).send({ message: 'Bạn không thuộc workspace này' })
    }

    if (!allowedRoles.includes(membership.role)) {
      return reply.code(403).send({
        message: `Quyền ${membership.role} không đủ để thực hiện hành động này`
      })
    }
  }
}