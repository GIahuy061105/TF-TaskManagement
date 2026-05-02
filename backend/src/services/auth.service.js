import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function registerUser({ fullName, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error('Email already exists')

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      memberships: {
        create: {
          role: 'ADMIN',
          workspace: {
            create: {
              name: `${fullName}'s Workspace`,
              slug: `${email.split('@')[0]}-${Date.now()}`,
              owner: { connect: { email: email } }
            }
          }
        }
      }
    },
    include: {
      memberships: {
        include: { workspace: true }
      }
    }
  })

  return {
    ...user,
    workspace: user.memberships[0].workspace
  }
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        include: { workspace: true }
      }
    }
  })

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error('Invalid credentials')
  }

  const workspaces = user.memberships.map(m => ({
    id: m.workspace.id,
    name: m.workspace.name,
    role: m.role
  }))
  return { user, workspaces }
}