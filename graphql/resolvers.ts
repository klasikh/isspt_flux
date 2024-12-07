import prisma from '../lib/prisma'

export const resolvers = {
  Query: {
    links: () => {
      return prisma.link.findMany()
    },
    grades: () => {
      return prisma.grade.findMany()
    },
    filieres: () => {
      return prisma.filiere.findMany()
    },
    services: () => {
      return prisma.service.findMany()
    },
    users: () => {
      return prisma.user.findMany()
    },
    motifs: () => {
      return prisma.motif.findMany()
    },
    modules: () => {
      return prisma.module.findMany()
    },
    allModulesQuery: () => {
      return prisma.module.findMany()
    },
    userModulePriorities: () => {
      return prisma.userModulePriority.findMany()
    },
    payments: () => {
      return prisma.payment.findMany()
    },
    spents: () => {
      return prisma.spent.findMany()
    },
    logs: () => {
      return prisma.logInfo.findMany()
    },
  },
}
