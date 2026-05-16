import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { sendEmail } from './mailer.service.js'
import { OAuth2Client } from 'google-auth-library'
const prisma = new PrismaClient()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
export async function registerUser({ fullName, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error('Email already exists')

  const passwordHash = await bcrypt.hash(password, 10)
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      isVerified: false,
      verificationToken: otp,
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
  const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #4f46e5; text-align: center;">Chào mừng đến với TaskFlow!</h2>
        <p style="color: #333; font-size: 16px;">Xin chào <strong>${fullName}</strong>,</p>
        <p style="color: #333; font-size: 16px;">Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất đăng ký, vui lòng nhập mã xác thực (OTP) dưới đây:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 5px; background: #e0e7ff; padding: 12px 24px; border-radius: 10px;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px; text-align: center;">Mã này sẽ có hiệu lực một lần duy nhất. Vui lòng không chia sẻ cho bất kỳ ai.</p>
      </div>`
  try {
    await sendEmail(email, 'Xác thực tài khoản TaskFlow', htmlContent)
  } catch (error) {
    console.error("Lỗi khi gửi email đăng ký:", error)
  }
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
  if (!user.isVerified) {
    const error = new Error('Tài khoản chưa được xác thực. Vui lòng kiểm tra email!')
    error.code = 'NOT_VERIFIED'
    throw error
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
export async function loginWithGoogle(idToken, googleUserInfo = null) {
  let email, name, googleId

  if (googleUserInfo) {
    // Từ access token flow
    email = googleUserInfo.email
    name = googleUserInfo.name
    googleId = googleUserInfo.sub
  } else {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload()
    email = payload.email
    name = payload.name
    googleId = payload.sub
  }

  let user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        include: { workspace: true }
      }
    }
  })
  if (!user) {
    user = await prisma.user.create({
      data: {
        fullName: name,
        email: email,
        provider: 'GOOGLE',
        providerId: googleId,
        isVerified: true,
        ownedWorkspaces: {
          create: {
            name: `${name}'s Workspace`,
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
                  name: `${name}'s Workspace`,
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