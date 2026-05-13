import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function getSettings() {
  let setting = await prisma.setting.findFirst()
  if (!setting) {
    setting = await prisma.setting.create({ data: {} })
  }
  return setting
}

export async function updateSettings(data) {
  const setting = await getSettings()
  return prisma.setting.update({
    where: { id: setting.id },
    data
  })
}