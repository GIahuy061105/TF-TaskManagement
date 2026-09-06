import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'

export async function registerPlugins(app) {
  await app.register(cors, {
  origin: 'https://tf-taskmanagement.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-workspace-id']
  })

  await app.register(cookie)

  await app.register(jwt, {
    secret: process.env.JWT_SECRET,
    cookie: {
      cookieName: 'refreshToken',
      signed: false
    }
  })
  app.addHook('onSend', async (request, reply) => {
      reply.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
      reply.header('Cross-Origin-Embedder-Policy', 'unsafe-none')
    })
}
