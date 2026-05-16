import { registerUser, loginUser ,loginWithGoogle } from '../services/auth.service.js'
import { authenticate } from '../middlewares/authenticate.js'
import { authorize } from '../middlewares/rbac.js'
import { sendEmail } from '../services/mailer.service.js'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export async function authRoutes(app) {
  app.post('/auth/register', async (request, reply) => {
    try {
      const { fullName, email, password } = request.body
      const user = await registerUser({ fullName, email, password })

      const accessToken = app.jwt.sign(
        {
          userId: user.id,
          email: user.email,
          workspaceId: user.workspace.id,
          role: 'ADMIN'
        },
        { expiresIn: '1d' }
      )

      const refreshToken = app.jwt.sign(
        { userId: user.id },
        { expiresIn: '30d' }
      )

      reply.setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30
      })

      return reply.code(201).send({
        accessToken,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          workspace: user.workspace,
          role: 'ADMIN'
        }
      })
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })

  app.post('/auth/login', async (request, reply) => {
    try {
      const { email, password } = request.body
      const { user, workspaces } = await loginUser({ email, password })

      const membership = user.memberships?.[0]
      if (!membership) throw new Error('Người dùng không thuộc về Workspace nào')

      const accessToken = app.jwt.sign(
        {
          userId: user.id,
          email: user.email,
          workspaceId: membership.workspace.id,
          role: membership.role
        },
        { expiresIn: '1d' }
      )

      const refreshToken = app.jwt.sign(
        { userId: user.id },
        { expiresIn: '30d' }
      )

      reply.setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30
      })

      return reply.send({
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
        workspaces,
        activeWorkspace: {
          id: membership.workspace.id,
          name: membership.workspace.name,
          slug: membership.workspace.slug,
          ownerId: membership.workspace.ownerId,
          role: membership.role
        }
      })
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })

  app.post('/auth/logout', async (request, reply) => {
    reply.clearCookie('refreshToken')
    return reply.send({ message: 'Logged out' })
  })
  app.get('/auth/me', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.userId || request.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: { include: { workspace: true } }
      }
    })

    const workspaces = user.memberships.map(m => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      ownerId: m.workspace.ownerId,
      role: m.role
    }))
    const { passwordHash, ...userSafe } = user
    return reply.send({ user: userSafe, workspaces })
  })
  app.post('/auth/google', async (request, reply) => {
    try {
      const { credential } = request.body
      const data = await loginWithGoogle(credential)
      const activeWs = data.workspaces[0]
      const accessToken = app.jwt.sign(
        {
            userId: data.user.id,
            email: data.user.email,
            workspaceId: activeWs?.id,
            role: activeWs?.role || 'ADMIN'
        },
       { expiresIn: '1d' }
      )
      return reply.send({ accessToken, user: data.user, workspaces: data.workspaces,activeWorkspace: activeWs })
    } catch (err) {
        console.log(err)
        reply.code(401).send({ message: 'Xác thực Google thất bại!' })
    }
  })
  app.post('/auth/verify-email', async (request, reply) => {
      const { email, otp } = request.body
      const user = await prisma.user.findUnique({ where: { email } })

      if (!user || user.verificationToken !== otp) {
        return reply.code(400).send({ message: 'Mã OTP không hợp lệ hoặc sai email!' })
      }
      await prisma.user.update({
        where: { email },
        data: { isVerified: true, verificationToken: null }
      })
      return reply.send({ message: 'Xác thực tài khoản thành công!' })
  })

  app.post('/auth/forgot-password', async (request, reply) => {
      const { email } = request.body
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) return reply.code(404).send({ message: 'Email không tồn tại trong hệ thống!' })
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      const expireTime = new Date(Date.now() + 15 * 60 * 1000)

      await prisma.user.update({
        where: { email },
        data: { resetPasswordToken: otp, resetPasswordExpires: expireTime }
      })
      const html = `<h3>Yêu cầu lấy lại mật khẩu</h3>
                    <p>Mã OTP đổi mật khẩu của bạn là: <b style="font-size:24px; color: blue;">${otp}</b></p>
                    <p>Mã này có hiệu lực trong 15 phút.</p>`
      await sendEmail(email, 'Khôi phục mật khẩu TaskFlow', html)

      return reply.send({ message: 'Đã gửi mã OTP khôi phục vào email của bạn.' })
  })
  app.post('/auth/reset-password', async (request, reply) => {
      const { email, otp, newPassword } = request.body
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user || user.resetPasswordToken !== otp || user.resetPasswordExpires < new Date()) {
        return reply.code(400).send({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn!' })
      }
      const bcrypt = await import('bcrypt')
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      await prisma.user.update({
        where: { email },
        data: {
          passwordHash: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null
        }
      })
      return reply.send({ message: 'Đổi mật khẩu thành công! Bạn có thể đăng nhập.' })
  })
  app.post('/auth/google-token', async (request, reply) => {
    try {
      const { accessToken } = request.body
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const googleUser = await response.json()

      if (!googleUser.email) {
        return reply.code(401).send({ message: 'Không lấy được thông tin Google' })
      }

      const data = await loginWithGoogle(null, googleUser)
      const activeWs = data.workspaces[0]

      const token = app.jwt.sign(
        {
          userId: data.user.id,
          email: data.user.email,
          workspaceId: activeWs?.id,
          role: activeWs?.role || 'ADMIN'
        },
        { expiresIn: '1d' }
      )

      return reply.send({
        accessToken: token,
        user: data.user,
        workspaces: data.workspaces,
        activeWorkspace: activeWs
      })
    } catch (err) {
      console.log(err)
      reply.code(401).send({ message: 'Xác thực Google thất bại!' })
    }
  })
}