import { PrismaClient } from '@prisma/client';
import { links } from '../data/links';
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {

  const passwordHashed = bcrypt.hashSync("00000000", 12);

  await prisma.user.create({
    data: {
      name: "Toto",
      email: 'toto@mail.com',
      role: 'ADMIN',
      password: passwordHashed,
    },
  });

  await prisma.link.createMany({
    data: links,
  });
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
