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
        }
      },
      memberships: {
        create: {
          role: 'ADMIN',
          workspace: {
            connectOrCreate: {
              where: { slug: `${email.split('@')[0]}-${Date.now()}` },
              create: {
                name: `${fullName}'s Workspace`,
                slug: `${email.split('@')[0]}-${Date.now()}`,
                owner: { connect: { email: email } }
              }
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
    slug: m.workspace.slug,
    ownerId: m.workspace.ownerId,
    role: m.workspace.ownerId === user.id ? 'ADMIN' : m.role
  }))
  const { passwordHash, ...userWithoutPassword } = user
  return { user: userWithoutPassword, workspaces }
}