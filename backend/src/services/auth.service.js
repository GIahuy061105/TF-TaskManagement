import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function registerUser({ fullName, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error('Email already exists')

  const passwordHash = await bcrypt.hash(password, 10)
  const slug = email.split('@')[0] + '-' + Date.now()

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      workspace: {
        create: {
          name: `${fullName}'s Workspace`,
          slug
        }
      }
    },
    include: { workspace: true }
  })

  return user
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { workspace: true }
  })

  if (!user) throw new Error('Invalid credentials')

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw new Error('Invalid credentials')

  return user
}