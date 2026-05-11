import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getCommentsByTask(taskId) {
  return prisma.comment.findMany({
    where: { taskId },
    include: {
      user: {
        select: { id: true, fullName: true, avatarUrl: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  })
}

export async function createComment(taskId, userId, content) {
  return prisma.comment.create({
    data: {
      taskId,
      userId,
      content
    },
    include: {
      user: {
        select: { id: true, fullName: true, avatarUrl: true }
      }
    }
  })
}