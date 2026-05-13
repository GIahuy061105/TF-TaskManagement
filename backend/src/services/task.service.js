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
      },
      include: {
        assignees: {
          include: { user: true }
        }
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
    },
    include: {
        assignees: {
            include: { user: true }
        }
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
export async function createAttachment(taskId, userId, data) {
  return prisma.attachment.create({
    data: {
      ...data,
      taskId,
      userId
    }
  })
}
export async function getAttachmentsByTask(taskId) {
  return prisma.attachment.findMany({
    where: { taskId },
    orderBy: { createdAt: 'desc' }
  })
}

export async function deleteAttachment(id) {
  return prisma.attachment.delete({
    where: { id }
  })
}
export const sendTaskAssignmentEmail = async (memberEmail, memberName, taskTitle, dueDate) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px;">
      <h2 style="color: #4f46e5;">Bạn có nhiệm vụ mới! ⚡</h2>
      <p>Chào <strong>${memberName}</strong>,</p>
      <p>Admin vừa giao cho bạn một công việc mới trên TaskFlow:</p>
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #4f46e5;">
        <p><strong>Công việc:</strong> ${taskTitle}</p>
        <p><strong>Hạn chót:</strong> ${dueDate ? new Date(dueDate).toLocaleDateString('vi-VN') : 'Không có'}</p>
      </div>
      <p style="margin-top: 20px;">Vui lòng đăng nhập để kiểm tra chi tiết.</p>
    </div>`;

  await sendEmail(memberEmail, `[TaskFlow] Bạn đã được giao task: ${taskTitle}`, htmlContent);
};