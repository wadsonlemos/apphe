import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('123456', 10)

  const users = [
    { name: 'Geral', username: 'geral', role: 'ADMIN', password: 'horaextra' },
    { name: '3AM', username: '3am', role: 'ADMIN', password: 'horas2026' },
  ]

  for (const user of users) {
    const passwordHash = await bcrypt.hash(
      user.password === 'default_password_placeholder' ? '123456' : user.password,
      10
    )

    await prisma.user.upsert({
      where: { username: user.username },
      update: {
        role: user.role,
        password: passwordHash, // Update password if it changed
      },
      create: {
        name: user.name,
        username: user.username,
        password: passwordHash,
        role: user.role,
      },
    })
    console.log(`Upserted user: ${user.username}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
