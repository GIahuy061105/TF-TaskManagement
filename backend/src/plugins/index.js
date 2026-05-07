import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'

export async function registerPlugins(app) {
  await app.register(cors, {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
  })

  await app.register(cookie)

  await app.register(jwt, {
    secret: process.env.JWT_SECRET,
    cookie: {
      cookieName: 'refreshToken',
      signed: false
    }
  })
}
