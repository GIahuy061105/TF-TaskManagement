import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import { Server } from 'socket.io'
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
  const io = new Server(app.server, {
      cors: {
        origin: ['http://localhost:5173', 'https://tf-taskmanagement.vercel.app'],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
      }
  })
  app.decorate('io', io)

  io.on('connection', (socket) => {
        console.log('🟢 Một client đã kết nối Socket:', socket.id)
      socket.on('disconnect', () => {
        console.log('🔴 Client đã ngắt kết nối:', socket.id)
      })
    })
}
