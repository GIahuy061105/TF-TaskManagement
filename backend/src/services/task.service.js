import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getTasksByProject(projectId) {
  return prisma.task.findMany({
    where: { projectId },
    orderBy: { position: 'asc' }
  })
}

export async function createTask(projectId, data) {
  const lastTask = await prisma.task.findFirst({
    where: { projectId, status: data.status || 'todo' },
    orderBy: { position: 'desc' }
  })

  return prisma.task.create({
    data: {
      projectId,
      title: data.title,
      description: data.description || null,
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      position: lastTask ? lastTask.position + 1 : 0,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      assigneeId: data.assigneeId || null
    }
  })
}

export async function updateTask(id, data) {
  return prisma.task.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      assigneeId: data.assigneeId
    }
  })
}

export async function moveTask(id, data) {
  return prisma.task.update({
    where: { id },
    data: {
      status: data.status,
      position: data.position
    }
  })
}

export async function deleteTask(id) {
  return prisma.task.delete({ where: { id } })
}

export async function logTime(taskId, userId, data) {
  return prisma.timeLog.create({
    data: {
      taskId,
      userId,
      minutes: data.minutes,
      note: data.note || null,
      loggedOn: data.loggedOn ? new Date(data.loggedOn) : new Date()
    }
  })
}