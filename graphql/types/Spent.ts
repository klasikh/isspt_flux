// /graphql/types/Link.ts
import { builder } from "../builder";

builder.prismaObject('Spent', {
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    name: t.exposeString('name'),
    description: t.exposeString('description'),
    nature: t.exposeString('nature'),
    motif: t.exposeString('motif'),
    amount: t.exposeString('amount'),
    status: t.exposeString('status'),
    createdYear: t.exposeString('createdYear'),
    isNotified: t.exposeString('isNotified'),
    fromId: t.exposeString('fromId'),
    toId: t.exposeString('toId'),
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
          id: Number(args.id),
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
      nature: t.arg.string({ required: true }),
      motif: t.arg.string({ required: true }),
      amount: t.arg.string({ required: true }),
      status: t.arg.string({ required: true }),
      createdYear: t.arg.string({ required: true }),
      isNotified: t.arg.string({ required: false }),
      fromId: t.arg.string({ required: false }),
      toId: t.arg.string({ required: false }),
    },
    resolve: async (query, _parent, args, ctx) => {
      
      const { title, name, description, nature, motif, amount, status, createdYear, isNotified, fromId, toId,  } = args

      if (!(await ctx).user) {
        throw new Error("You have to be logged in to perform this action")
      }

      const user = await prisma.user.findUnique({
        where: {
          email: (await ctx).user?.email,
        }
      })

      if (!user || user.role !== "USER") {
        throw new Error("You don have permission ot perform this action")
      }

      return await prisma.spent.create({
        ...query,
        data: {
          title, 
          name, 
          description, 
          nature, 
          motif, 
          amount, 
          status, 
          createdYear, 
          isNotified, 
          fromId, 
          toId,
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
      status: t.arg.string(),
      createdYear: t.arg.string(),
      isNotified: t.arg.string(),
      fromId: t.arg.string(),
      toId: t.arg.string(),
    },
    resolve: async (query, _parent, args, _ctx) =>
      prisma.spent.update({
        ...query,
        where: {
          id: Number(args.id),
        },
        data: {
          title: args.title ? args.title : undefined,
          name: args.name ? args.name : undefined,
          description: args.description ? args.description : undefined,
          nature: args.nature ? args.nature : undefined,
          motif: args.motif ? args.motif : undefined,
          amount: args.amount ? args.amount : undefined,
          status: args.status ? args.status : undefined,
          createdYear: args.createdYear ? args.createdYear : undefined,
          isNotified: args.isNotified ? args.isNotified : undefined,
          fromId: args.fromId ? args.fromId : undefined,
          toId: args.toId ? args.toId : undefined,
        }
      })
  })
)

builder.mutationField('deleteSpent', (t) =>
  t.prismaField({
    type: 'Spent',
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, args, _ctx) =>
      prisma.spent.delete({
        ...query,
        where: {
          id: Number(args.id)
        }
      })
  })
)
