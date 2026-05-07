import { registerUser, loginUser } from '../services/auth.service.js'
import { authenticate } from '../middlewares/authenticate.js'
import { authorize } from '../middlewares/rbac.js'
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
}