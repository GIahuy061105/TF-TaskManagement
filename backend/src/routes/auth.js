import { registerUser, loginUser } from '../services/auth.service.js'

export async function authRoutes(app) {
  app.post('/auth/register', async (request, reply) => {
    try {
      const { fullName, email, password } = request.body
      const user = await registerUser({ fullName, email, password })

      const accessToken = app.jwt.sign(
        { userId: user.id, workspaceId: user.workspace.id },
        { expiresIn: '15m' }
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
          workspace: user.workspace
        }
      })
    } catch (err) {
      reply.code(400).send({ message: err.message })
    }
  })

  app.post('/auth/login', async (request, reply) => {
    try {
      const { email, password } = request.body
      const user = await loginUser({ email, password })

      const accessToken = app.jwt.sign(
        { userId: user.id, workspaceId: user.workspace.id },
        { expiresIn: '15m' }
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
          fullName: user.fullName,
          email: user.email,
          workspace: user.workspace
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
}