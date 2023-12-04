// /graphql/types/Link.ts
import { builder } from "../builder";
import type { GetServerSideProps } from 'next'
import { getSession } from "next-auth/react"

builder.prismaObject('Payment', {
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    name: t.exposeString('name'),
    description: t.exposeString('description'),
    filiereId: t.exposeString('filiereId'),
    motifId: t.exposeString('motifId'),
    amount: t.exposeString('amount'),
    step: t.exposeString('step'),
    status: t.exposeString('status'),
    filePath: t.exposeString('filePath', { nullable: true, }),
    createdYear: t.exposeString('createdYear'),
    addedBy: t.exposeString('addedBy'),
    rejectMotif: t.exposeString('rejectMotif'),
    isNotified: t.boolean(),
    fromId: t.exposeString('fromId', { nullable: true, }),
    toId: t.exposeString('toId', { nullable: true, }),
  }),
})


builder.queryField('payments', (t) =>
  t.prismaConnection({
    type: 'Payment',
    cursor: 'id',
    resolve: (query, _parent, _args, _ctx, _info) =>
      prisma.payment.findMany({ ...query })
  })
)

builder.queryField('payment', (t) =>
  t.prismaField({
    type: 'Payment',
    nullable: true,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: (query, _parent, args, _info) =>
      prisma.payment.findUnique({
        ...query,
        where: {
          id: args.id,
        }
      })
  })
)


builder.mutationField('createPayment', (t) =>
  t.prismaField({
    type: 'Payment',
    args: {
      title: t.arg.string({ required: true }),
      description: t.arg.string({ required: false }),
      name: t.arg.string({ required: true }),
      motifId: t.arg.id({ required: true }),
      filiereId: t.arg.id({ required: true }),
      amount: t.arg.string({ required: true }),
      step: t.arg.string({ required: true }),
      filePath: t.arg.string({ required: false }),
      createdYear: t.arg.string({ required: true }),
      addedBy: t.arg.string({ required: true }),
      status: t.arg.string({ required: false }),
      isNotified: t.arg.boolean({ required: false }),
      fromId: t.arg.string({ required: false }),
      toId: t.arg.string({ required: false }),
    },
    resolve: async (query, _parent, args, ctx) => {
      
      const { title, description, name, motifId, filiereId, amount, step, createdYear, addedBy  } = args


      const getServerSideProps: GetServerSideProps = async (context) => {

        let session;
        session = await getSession(context);

        if (!session.user) {
          throw new Error("Vous devez être connectés pour effectuer cette action");
        }

        const user = await prisma.user.findUnique({
          where: {
            username: session.user?.username,
          },
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
          }
        })

        if (!user || (user.role !== "USER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
          throw new Error("Vous n'avez pas les permissions requises pour effectuer cette action");
          // return 'toto est Ok'
        }

        const getUserPriorities = await prisma.userModulePriority.findMany({
          where: {
            userId: user.id
          },
          select: {
            userId: true,
            moduleId: true,
            priority: true
          },
        })

        // return {
        //   props: {},
        // };
      };

      try {
        const getSess = await getServerSideProps(ctx);

      } catch (error) {
        return error;
      }

      return await prisma.payment.create({
        ...query,
        data: {
          title,
          name,
          description,
          filiereId,
          motifId,
          step,
          amount,
          createdYear,
          addedBy,
        }
      })
    }
  })
)

builder.mutationField('updatePayment', (t) =>
  t.prismaField({
    type: 'Payment',
    args: {
      id: t.arg.id({ required: true }),
      title: t.arg.string(),
      name: t.arg.string(),
      description: t.arg.string(),
      motifId: t.arg.id(),
      filiereId: t.arg.id(),
      amount: t.arg.string(),
      step: t.arg.string(),
      createdYear: t.arg.string(),
      addedBy: t.arg.string(),
    },
    resolve: async (query, _parent, args, _ctx) =>
      prisma.payment.update({
        ...query,
        where: {
          id: args.id,
        },
        data: {
          title: args.title ? args.title : undefined,
          name: args.name ? args.name : undefined,
          description: args.description ? args.description : undefined,
          motifId: args.motifId ? args.motifId : undefined,
          filiereId: args.filiereId ? args.filiereId : undefined,
          amount: args.amount ? args.amount : undefined,
          step: args.step ? args.step : undefined,
          createdYear: args.createdYear ? args.createdYear : undefined,
          addedBy: args.addedBy ? args.addedBy : undefined,
        }
      })
  })
)

builder.mutationField('sendPayment', (t) =>
  t.prismaField({
    type: 'Payment',
    args: {
      id: t.arg.id({ required: true }),
      userId: t.arg.id({ required: true }),
      title: t.arg.string(),
      name: t.arg.string(),
      motifId: t.arg.id(),
      filiereId: t.arg.id(),
      amount: t.arg.string(),
      createdYear: t.arg.string(),
    },
    resolve: async (query, _parent, args, ctx) => {

      const getServerSideProps: GetServerSideProps = async (context) => {

        let session;
        session = await getSession(context);

        if (!session.user) {
          throw new Error("Vous devez être connectés pour effectuer cette action");
        }

        const user = await prisma.user.findUnique({
          where: {
            username: session.user?.username,
          },
          select: {
            username: true
          }
        })


        if (!user || (user.role !== "USER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
          throw new Error("Vous n'avez pas les permissions requises pour effectuer cette action");
          // return 'toto est Ok'
        }

        // return {
        //   props: {},
        // };
      };

      const payment = await prisma.payment.update({
        ...query,
        where: {
          id: args.id
        },
        data: {
          step: "1",
          status: "ONPROCESS"
        }
      })

      const updateUserPayments = await prisma.user.update({
        ...query,
        where: {
          id: args.userId
        },
        data: {
          payments: {
            connectOrCreate: {
              where: {
                id: args.id,
              },
              create: {
                id: args.id,
                title: args.title ? args.title : undefined,
                name: args.name ? args.name : undefined,
                motifId: args.motifId ? args.motifId : undefined,
                filiereId: args.filiereId ? args.filiereId : undefined,
                amount: args.amount ? args.amount : undefined,
                step: "1",
                createdYear: args.createdYear ? args.createdYear : undefined,
                rejectMotif: "",
              },
            },
          }
        }
      })

      return payment;
    }
  })
)

builder.mutationField('rejectPayment', (t) =>
  t.prismaField({
    type: 'Payment',
    args: {
      id: t.arg.id({ required: true }),
      rejectMotif: t.arg.string(),
      userId: t.arg.id(),
      status: t.arg.string(),
      step: t.arg.string(),
    },
    resolve: async (query, _parent, args, _ctx) => {

      const getServerSideProps: GetServerSideProps = async (context) => {

        let session;
        session = await getSession(context);

        if (!session.user) {
          throw new Error("Vous devez être connectés pour effectuer cette action");
        }

        const user = await prisma.user.findUnique({
          where: {
            username: session.user?.username,
          },
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
          }
        })

        if (!user || (user.role !== "USER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
          throw new Error("Vous n'avez pas les permissions requises pour effectuer cette action");
          // return 'toto est Ok'
        }

        const getUserPriorities = await prisma.userModulePriority.findMany({
          where: {
            userId: user.id
          },
          select: {
            userId: true,
            moduleId: true,
            module: {
              select: {
                id: true,
                name: true,
              }
            },
            priority: true
          },
        })

        for(let i=0; i<getUserPriorities.length; i++) {
          if(getUserPriorities[i].module?.name === "PROFORMA") {
            if(!getUserPriorities[i] || (getUserPriorities[i].priority !== "UPDATE" && getUserPriorities[i].priority !== "R_UPDATE_DELETE" && getUserPriorities[i].priority !== "C_R_UPDATE_DELETE")) {
              throw new Error("Vous n'avez pas les permissions requises pour effectuer cette action.")
            }
          } else {
            throw new Error("Vous n'avez aucune priorité sur ce module")
          }
        }

        // return {
        //   props: {},
        // };
      };

      try {
        const getSess = await getServerSideProps(_ctx);
      } catch (error) {
        return error;
      }

      return prisma.payment.update({
        ...query,
        where: {
          id: args.id,
        },
        data: {
          rejectMotif: args.rejectMotif ? args.rejectMotif : undefined,
          status: args.status ? args.status : undefined,
          step: args.step ? args.step : undefined,
        }
      })
    }
  })
)

builder.mutationField('validPayment', (t) =>
  t.prismaField({
    type: 'Payment',
    args: {
      id: t.arg.id({ required: true }),
      userId: t.arg.id(),
      status: t.arg.string(),
      step: t.arg.string(),
      filePath: t.arg.string(),
    },
    resolve: async (query, _parent, args, _ctx) => {

      const getServerSideProps: GetServerSideProps = async (context) => {

        let session;
        session = await getSession(context);

        if (!session.user) {
          throw new Error("Vous devez être connectés pour effectuer cette action");
        }

        const user = await prisma.user.findUnique({
          where: {
            username: session.user?.username,
          },
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
          }
        })

        if (!user || (user.role !== "USER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
          throw new Error("Vous n'avez pas les permissions requises pour effectuer cette action.");
          // return 'toto est Ok'
        }

        const getUserPriorities = await prisma.userModulePriority.findMany({
          where: {
            userId: user.id
          },
          select: {
            userId: true,
            moduleId: true,
            module: {
              select: {
                id: true,
                name: true,
              }
            },
            priority: true
          },
        })

        for(let i=0; i<getUserPriorities.length; i++) {
          if(getUserPriorities[i].module?.name === "PROFORMA") {
            if(!getUserPriorities[i] || (getUserPriorities[i].priority !== "UPDATE" && getUserPriorities[i].priority !== "R_UPDATE_DELETE" && getUserPriorities[i].priority !== "C_R_UPDATE_DELETE")) {
              throw new Error("Vous n'avez pas les permissions requises pour effectuer cette action.")
            }
          } else {
            throw new Error("Vous n'avez aucune priorité sur ce module")
          }
        }

        // return {
        //   props: {},
        // };
      };

      try {
        const getSess = await getServerSideProps(_ctx);
      } catch (error) {
        return error;
      }

      return prisma.payment.update({
        ...query,
        where: {
          id: args.id,
        },
        data: {
          status: args.status ? args.status : undefined,
          step: args.step ? args.step : undefined,
          filePath: args.filePath ? args.filePath : undefined,
        }
      })
    }
  })
)

builder.mutationField('deletePayment', (t) =>
  t.prismaField({
    type: 'Payment',
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, args, _ctx) =>
      prisma.payment.delete({
        ...query,
        where: {
          id: args.id
        }
      })
  })
)
