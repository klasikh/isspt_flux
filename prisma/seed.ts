import { PrismaClient } from '@prisma/client';
import { links } from '../data/links';
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {

  const passwordHashed = await bcrypt.hash("00000000", 12);

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
      name: "PAIEMENT",
      description: 'Module PAIEMENT',
    },
  });

  const createdModuleTwo = await prisma.module.create({
    data: {
      name: "DEPENSE",
      description: 'Module DEPENSE',
    },
  });

  // USERS SEED
  const createdUserOne = await prisma.user.create({
    data: {
        name: "Admin",
        username: "admin",
        gradeId: createdGradeOne.id,
        role: 'ADMIN',
        password: passwordHashed,
      },
  });

  const createdUserTwo = await prisma.user.create({
    data: {
        name: "AHOUANNOU Bertine",
        username: "ahouannoubertine",
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
        userId: createdUserOne.id,
        moduleId: createdModuleTwo.id,
        priority: "C_R_UPDATE_DELETE",
      },
      {
        userId: createdUserTwo.id,
        moduleId: createdModuleOne.id,
        priority: "C_READ_UPDATE",
      }
    ]
  });

  // FILIERE SEED
  await prisma.filiere.createMany({
    data: [
      {
        sigle: "IG",
        name: "Informatique de Gestion",
        description: 'Description ...',
      },
      {
        sigle: "IM",
        name: "Internet et Multimédia",
        description: 'Description ...',
      },
      {
        sigle: "CG",
        name: "Comptabilité Gestion",
        description: 'Description ...',
      },
      {
        sigle: "FCA",
        name: "Finances-Comptabilité et Audit",
        description: 'Description ...',
      },
      {
        sigle: "MRH",
        name: "Management des Ressources Humaines",
        description: 'Description ...',
      },
      {
        sigle: "MAC",
        name: "Marketing et Action Commerciale",
        description: 'Description ...',
      },
      {
        sigle: "MCC",
        name: "Marketing, Communication et Commerce",
        description: 'Description ...',
      },
      {
        sigle: "BFA",
        name: "Banque, Finances et Assurances",
        description: 'Description ...',
      },
      {
        sigle: "GBMP",
        name: "Gestion Budgétaire et Marchés Public",
        description: 'Description ...',
      },
      {
        sigle: "TL",
        name: "Transport et Logistique",
        description: 'Description ...',
      },
      {
        sigle: "ESA",
        name: "Économétrie et Statistique Appliquée",
        description: 'Description ...',
      },
      {
        sigle: "EA",
        name: "Économie Appliquée",
        description: 'Description ...',
      },
      {
        sigle: "GEPP",
        name: "Gestion et Évaluation des Politiques Publiques",
        description: 'Description ...',
      },
      {
        sigle: "SIL",
        name: "Système Informatique et Logiciel",
        description: 'Description ...',
      },
      {
        sigle: "SI",
        name: "Sécurité Informatique",
        description: 'Description ...',
      },
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
