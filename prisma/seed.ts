import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('123456', 10)

  const users = [
    { name: 'Wadson', username: 'wadson', role: 'ADMIN', password: 'default_password_placeholder' },
    { name: 'Romulo', username: 'romulo', role: 'USER', password: 'default_password_placeholder' },
    { name: 'Raffael', username: 'raffael', role: 'USER', password: 'default_password_placeholder' },
    { name: 'Geral', username: 'geral', role: 'USER', password: 'horaextra' },
    { name: '3AM', username: '3am', role: 'ADMIN', password: 'horas2026' },
  ]

  for (const user of users) {
    const existingUser = await prisma.user.findUnique({
      where: { username: user.username },
    })

    if (!existingUser) {
      const passwordHash = await bcrypt.hash(
        user.password === 'default_password_placeholder' ? '123456' : user.password,
        10
      )

      await prisma.user.create({
        data: {
          name: user.name,
          username: user.username,
          password: passwordHash,
          role: user.role,
        },
      })
      console.log(`Created user: ${user.username}`)
    }
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
