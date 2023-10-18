import { PrismaClient } from '@prisma/client';
import { links } from '../data/links';
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {

  const passwordHashed = bcrypt.hashSync("00000000", 12);

  // GRADE SEED
  const createdGradeOne = await prisma.grade.create({
    data: {
      name: "Super Admin",
      description: 'Grade Super Admin',
    },
  });

  const createdGradeTwo = await prisma.grade.create({
    data: {
      name: "Assistante DAF",
      description: 'Grade Assistante de la DAF',
    },
  });

  // MODULE SEED
  const createdModuleOne = await prisma.module.create({
    data: {
      name: "PROFORMA",
      description: 'Module PROFORMA',
    },
  });

  const createdModuleTwo = await prisma.module.create({
    data: {
      name: "ENGAGEMENT",
      description: 'Module ENGAGEMENT',
    },
  });

  // USERS SEED
  const createdUserOne = await prisma.user.create({
    data: {
        name: "Toto",
        email: 'toto@mail.com',
        gradeId: createdGradeOne.id,
        role: 'ADMIN',
        password: passwordHashed,
      },
  });
  
  const createdUserTwo = await prisma.user.create({
    data: {
        name: "AHOUANNOU Bertine",
        email: 'bertine@mail.com',
        gradeId: createdGradeTwo.id,
        role: 'USER',
        password: passwordHashed,
      },
  });
  
  // USERMODULEPRIORITY SEED
  await prisma.userModulePriority.createMany({
    data: [
      {
        userId: createdUserOne.id,
        moduleId: createdModuleOne.id,
        priority: "C_R_UPDATE_DELETE",
      },
      {
        userId: createdUserTwo.id,
        moduleId: createdModuleTwo.id,
        priority: "C_READ_UPDATE",
      }
    ]
  });

  // LINK SEED
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
