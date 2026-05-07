import { authenticate } from '../middlewares/authenticate.js'
import { authorize } from '../middlewares/rbac.js'
import { PrismaClient } from '@prisma/client'
import {
  getWorkspaceMembers,
  addMember,
  updateWorkspace,
  removeMember
} from '../services/workspace.service.js'
import {
  inviteMember,
  acceptInvitation,
  declineInvitation,
  getInvitationByToken,
  getPendingInvitations
} from '../services/invitation.service.js'
const prisma = new PrismaClient()
export async function workspaceRoutes(app) {
  // Lấy danh sách members
  app.get('/workspace/members', { preHandler: authenticate }, async (request, reply) => {
    const workspaceId = request.headers['x-workspace-id']
    const members = await getWorkspaceMembers(workspaceId)
    return reply.send(members)
  })

  // Cập nhật workspace
  app.patch('/workspace', { preHandler: authenticate }, async (request, reply) => {
    try {
      const workspaceId = request.headers['x-workspace-id']
      const workspace = await updateWorkspace(workspaceId, request.body)
      return reply.send(workspace)
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })

  // Xóa member
  app.delete('/workspace/members/:userId', { preHandler: [authenticate,authorize(['ADMIN'])] }, async (request, reply) => {
    try {
      const workspaceId = request.headers['x-workspace-id']
      await removeMember(workspaceId, request.params.userId)
      return reply.code(204).send()
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })

  // Gửi invitation
  app.post('/workspace/invite', { preHandler: [authenticate,authorize(['ADMIN'])] }, async (request, reply) => {
    try {
      const workspaceId = request.headers['x-workspace-id']
      const inviterId = request.user.userId || request.user.id
      if (!workspaceId) return reply.code(400).send({ message: 'Thiếu Workspace ID' })
      const invitation = await inviteMember(workspaceId, inviterId, request.body)
      return reply.code(201).send(invitation)
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })

  // Lấy danh sách pending invitations
  app.get('/workspace/invitations', { preHandler: authenticate }, async (request, reply) => {
    try {
        const workspaceId = request.headers['x-workspace-id']
        if (!workspaceId) return reply.code(400).send({ message: 'Thiếu Workspace ID' })
        const invitations = await getPendingInvitations(workspaceId)
        return reply.send(invitations)
      } catch (err) {
        reply.code(500).send({ message: err.message })
      }
  })
  app.get('/my-invitations', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userEmail = request.user.email
      const invitations = await prisma.invitation.findMany({
        where: {
          email: userEmail,
          status: 'PENDING'
        },
        include: {
          workspace: true,
          inviter: { select: { fullName: true } }
        }
      })
      return reply.send(invitations)
    } catch (err) {
      reply.code(500).send({ message: err.message })
    }
  })

  // Xem thông tin invitation
  app.get('/invitations/:token', async (request, reply) => {
    try {
      const invitation = await getInvitationByToken(request.params.token)
      return reply.send(invitation)
    } catch (err) {
      reply.code(404).send({ message: err.message })
    }
  })

  // Accept invitation
  app.post('/invitations/:token/accept', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId || request.user.id;
      const workspace = await acceptInvitation(request.params.token, userId)
      return reply.send(workspace)
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })

  // Decline invitation
  app.post('/invitations/:token/decline', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId || request.user.id;
      await declineInvitation(request.params.token, userId)
      return reply.send({ message: 'Đã từ chối lời mời' })
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })
}