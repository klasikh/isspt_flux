// /graphql/types/Link.ts
import { builder } from "../builder";
import type { GetServerSideProps } from 'next'
import { getSession } from "next-auth/react"

builder.prismaObject('Spent', {
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    name: t.exposeString('name'),
    description: t.exposeString('description'),
    nature: t.exposeString('nature'),
    motif: t.exposeString('motif'),
    amount: t.exposeString('amount'),
    step: t.exposeString('step'),
    status: t.exposeString('status'),
    createdYear: t.exposeString('createdYear'),
    addedBy: t.exposeString('addedBy'),
    rejectMotif: t.exposeString('rejectMotif'),
    isNotified: t.boolean(),
    fromId: t.exposeString('fromId', { nullable: true, }),
    toId: t.exposeString('toId', { nullable: true, }),
  }),
})


builder.queryField('spents', (t) =>
  t.prismaConnection({
    type: 'Spent',
    cursor: 'id',
    resolve: (query, _parent, _args, _ctx, _info) =>
      prisma.spent.findMany({ ...query })
  })
)

builder.queryField('spent', (t) =>
  t.prismaField({
    type: 'Spent',
    nullable: true,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: (query, _parent, args, _info) =>
      prisma.spent.findUnique({
        ...query,
        where: {
          id: args.id,
        }
      })
  })
)


builder.mutationField('createSpent', (t) =>
  t.prismaField({
    type: 'Spent',
    args: {
      title: t.arg.string({ required: true }),
      name: t.arg.string({ required: true }),
      description: t.arg.string({ required: false }),
      motif: t.arg.string({ required: true }),
      nature: t.arg.string({ required: true }),
      amount: t.arg.string({ required: true }),
      status: t.arg.string({ required: false }),
      step: t.arg.string({ required: true }),
      createdYear: t.arg.string({ required: true }),
      addedBy: t.arg.id({ required: true }),
      isNotified: t.arg.string({ required: false }),
      fromId: t.arg.string({ required: false }),
      toId: t.arg.string({ required: false }),
    },
    resolve: async (query, _parent, args, ctx) => {
      
      const { title, name, description, motif, nature, amount, step, createdYear, addedBy,  } = args

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

      return await prisma.spent.create({
        ...query,
        data: {
          title, 
          name, 
          description, 
          motif, 
          nature,
          amount, 
          step,
          createdYear, 
          addedBy,
        }
      })
    }
  })
)

builder.mutationField('updateSpent', (t) =>
  t.prismaField({
    type: 'Spent',
    args: {
      id: t.arg.id({ required: true }),
      title: t.arg.string(),
      name: t.arg.string(),
      description: t.arg.string(),
      nature: t.arg.string(),
      motif: t.arg.string(),
      amount: t.arg.string(),
      step: t.arg.string(),
      createdYear: t.arg.string(),
      addedBy: t.arg.id(),
    },
    resolve: async (query, _parent, args, _ctx) =>
      prisma.spent.update({
        ...query,
        where: {
          id: args.id,
        },
        data: {
          title: args.title ? args.title : undefined,
          name: args.name ? args.name : undefined,
          description: args.description ? args.description : undefined,
          nature: args.nature ? args.nature : undefined,
          motif: args.motif ? args.motif : undefined,
          amount: args.amount ? args.amount : undefined,
          step: args.step ? args.step : undefined,
          createdYear: args.createdYear ? args.createdYear : undefined,
          addedBy: args.addedBy ? args.addedBy : undefined,
        }
      })
  })
)

builder.mutationField('sendSpent', (t) =>
  t.prismaField({
    type: 'Spent',
    args: {
      id: t.arg.id({ required: true }),
      userId: t.arg.id({ required: true }),
      title: t.arg.string(),
      name: t.arg.string(),
      motif: t.arg.string(),
      nature: t.arg.string(),
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

        // return {
        //   props: {},
        // };
      };

      const spent = await prisma.spent.update({
        ...query,
        where: {
          id: args.id
        },
        data: {
          step: "1",
          status: "ONPROCESS",
          rejectMotif: "",
        }
      })

      const updateUserPayments = await prisma.user.update({
        ...query,
        where: {
          id: args.userId
        },
        data: {
          spents: {
            connectOrCreate: {
              where: {
                id: args.id,
              },
              create: {
                id: args.id,
                title: args.title ? args.title : undefined,
                name: args.name ? args.name : undefined,
                motif: args.motif ? args.motif : undefined,
                nature: args.nature ? args.nature : undefined,
                amount: args.amount ? args.amount : undefined,
                step: "1",
                createdYear: args.createdYear ? args.createdYear : undefined,
                rejectMotif: "",
              },
            },
          }
        }
      })

      return spent;
    }
  })
)

builder.mutationField('rejectSpent', (t) =>
  t.prismaField({
    type: 'Spent',
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
          if(getUserPriorities[i].module?.name === "FACTURATION") {
            if(getUserPriorities[i].priority !== "C_R_UPDATE_DELETE") {
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

      return prisma.spent.update({
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

builder.mutationField('validSpent', (t) =>
  t.prismaField({
    type: 'Spent',
    args: {
      id: t.arg.id({ required: true }),
      userId: t.arg.id(),
      status: t.arg.string(),
      step: t.arg.string(),
    },
    resolve: async (query, _parent, args, _ctx) => {

      const getServerSideProps: GetServerSideProps = async (context) => {

        let session;
        session = await getSession(context);

        if (!session.user) {
          throw new Error("Vous devez être connectés pour effectuer cette action.");
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
          if(getUserPriorities[i].module?.name === "FACTURATION") {
            if(getUserPriorities[i].priority !== "C_R_UPDATE_DELETE") {
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

      return prisma.spent.update({
        ...query,
        where: {
          id: args.id,
        },
        data: {
          status: args.status ? args.status : undefined,
          step: args.step ? args.step : undefined,
        }
      })
    }
  })
)

builder.mutationField('deleteSpent', (t) =>
  t.prismaField({
    type: 'Spent',
    args: {
      id: t.arg.id({ required: true }),
      userId: t.arg.id({ required: true }),
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

        // CHECK
        const checkedSpent = prisma.spent.findUnique({
          ...query,
          where: {
            id: args.id,
          }
        });

        if(user.role === "USER") {
          if(checkedSpent.addedBy !== userId) {
            throw new Error("Désolé, vous n'êtes pas l'utilisateur qui a ajouté cette dépense");
          }
        }
      };

      prisma.spent.delete({
        ...query,
        where: {
          id: args.id
        },
      });

      return args.id

    }
  })
)
