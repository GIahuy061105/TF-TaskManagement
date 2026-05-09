import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getTasksByProject(projectId) {
  return prisma.task.findMany({
    where: { projectId },
    orderBy: { position: 'asc' }
  })
}

export async function createTask(projectId, data) {
  const taskStatus = data.status ? data.status.toUpperCase() : 'TODO'
  const lastTask = await prisma.task.findFirst({
    where: { projectId, status: taskStatus },
    orderBy: { position: 'desc' }
  })

  const nextPosition = lastTask ? lastTask.position + 1 : 0

  return prisma.task.create({
      data: {
        projectId,
        title: data.title,
        description: data.description || null,
        status: taskStatus,
        position: data.position ?? nextPosition,
        priority: data.priority ? data.priority.toUpperCase() : 'MEDIUM',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        estimatedMins: data.estimatedMins ? parseInt(data.estimatedMins) : null,

        assignees: (data.assigneeIds && data.assigneeIds.length > 0)
          ? {create: data.assigneeIds.map(id => ({user: { connect: { id } } }))}: undefined
      }
    })
  }
export async function updateTask(id, data) {
  return prisma.task.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      status: data.status ? data.status.toUpperCase() : undefined,
      priority: data.priority ? data.priority.toUpperCase() : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      assignees: data.assigneeIds
        ? {deleteMany: {}, create: data.assigneeIds.map(id => ({user: { connect: { id } }}))}: undefined
    }
  })
}

export async function moveTask(id, data) {
  return prisma.task.update({
    where: { id },
    data: {
      status: data.status ? data.status.toUpperCase() : undefined,
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
export async function requestTaskApprove(id) {
  return prisma.task.update({
    where: { id },
    data: { isPendingApproval: true }
  })
}

export async function approveTask(id) {
  return prisma.task.update({
    where: { id },
    data: { isPendingApproval: false, status: 'DONE' }
  })
}