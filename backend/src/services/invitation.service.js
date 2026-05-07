import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

export async function inviteMember(workspaceId, invitedBy, { email, role }) {
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (!existingUser) {
    throw new Error('Email này chưa đăng ký tài khoản TaskFlow. Không thể gửi lời mời.')
  }
  const existingMember = await prisma.member.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: existingUser.id } }
    })
  if (existingMember) throw new Error('Người này đã là thành viên rồi')
  const validRoles = ['ADMIN', 'MEMBER', 'VIEWER']
  const normalizedRole = role?.toUpperCase() || 'MEMBER'
  if (!validRoles.includes(normalizedRole)) throw new Error('Role không hợp lệ')

  // Kiểm tra invitation pending chưa
  const existingInvite = await prisma.invitation.findFirst({
    where: { workspaceId, email, status: 'PENDING' }
  })
  if (existingInvite) throw new Error('Đã gửi lời mời cho email này rồi')

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
  const inviter = await prisma.user.findUnique({ where: { id: invitedBy } })

  // Tạo invitation — hết hạn sau 7 ngày
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const invitation = await prisma.invitation.create({
    data: {
      workspaceId,
      email,
      role: normalizedRole,
      invitedBy,
      expiresAt
    }
  })

  // Gửi email
  await resend.emails.send({
    from: 'TaskFlow <onboarding@resend.dev>',
    to: email,
    subject: `${inviter.fullName} đã mời bạn vào workspace "${workspace.name}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #6366f1;">TaskFlow</h2>
        <p>Xin chào,</p>
        <p><strong>${inviter.fullName}</strong> đã mời bạn tham gia workspace <strong>${workspace.name}</strong> với role <strong>${normalizedRole}</strong>.</p>
        <a href="${process.env.FRONTEND_URL}/invite/accept?token=${invitation.token}"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
          Chấp nhận lời mời
        </a>
        <p style="margin-top:16px;color:#94a3b8;font-size:13px;">Link hết hạn sau 7 ngày.</p>
      </div>
    `
  })

  return invitation
}

export async function acceptInvitation(token, userId) {
  const invitation = await prisma.invitation.findUnique({ where: { token } , include: {workspace : true}})

  if (!invitation) throw new Error('Lời mời không tồn tại')
  if (invitation.status !== 'PENDING') throw new Error('Lời mời này đã được xử lý rồi')
  if (new Date() > invitation.expiresAt) throw new Error('Lời mời đã hết hạn')

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new Error('Email tài khoản hiện tại không khớp với email nhận lời mời');
    }


  await prisma.member.create({
    data: {
      workspaceId: invitation.workspaceId,
      userId,
      role: invitation.role
    }
  })

  await prisma.invitation.update({
    where: { token },
    data: { status: 'ACCEPTED' }
  })
  return {
       ...invitation.workspace,
       role: invitation.role
  }
}

export async function declineInvitation(token, userId) {
  const invitation = await prisma.invitation.findUnique({ where: { token } })
  if (!invitation) throw new Error('Lời mời không tồn tại')

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user.email !== invitation.email) throw new Error('Email không khớp')

  return prisma.invitation.update({
    where: { token },
    data: { status: 'DECLINED' }
  })
}

export async function getInvitationByToken(token) {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      workspace: true,
      inviter: { select: { fullName: true, email: true } }
    }
  })
  if (!invitation) throw new Error('Lời mời không tồn tại')
  return invitation
}

export async function getPendingInvitations(workspaceId) {
  return prisma.invitation.findMany({
    where: { workspaceId, status: 'PENDING' },
    include: {
          workspace: true,
          inviter: {
            select: { fullName: true, email: true }
          }
        },
    orderBy: { createdAt: 'desc' }
  })
}