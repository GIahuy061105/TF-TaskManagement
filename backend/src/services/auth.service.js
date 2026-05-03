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
        ownedWorkspaces: {
          create: {
            name: `${fullName}'s Workspace`,
            slug: `${email.split('@')[0]}-${Date.now()}`,
            members: {
              create: {
                role: 'ADMIN'
              }
            }
          }
        }
      },
      include: {
        ownedWorkspaces: {
          include: {
            members: true
          }
        }
      }
    })
    return {
        ...user,
        workspace: user.ownedWorkspaces[0]
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
    slug: m.workspace.slug,
    ownerId: m.workspace.ownerId,
    role: m.workspace.ownerId === user.id ? 'ADMIN' : m.role
  }))
  return { user, workspaces }
}