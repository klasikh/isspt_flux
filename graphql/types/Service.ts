// /graphql/types/Link.ts
import { builder } from "../builder";

builder.prismaObject('Service', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    description: t.exposeString('description'),
  }),
})


builder.queryField('services', (t) =>
  t.prismaConnection({
    type: 'Service',
    cursor: 'id',
    resolve: (query, _parent, _args, _ctx, _info) =>
      prisma.service.findMany({ ...query })
  })
)

builder.queryField('service', (t) =>
  t.prismaField({
    type: 'Service',
    nullable: true,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: (query, _parent, args, _info) =>
      prisma.service.findUnique({
        ...query,
        where: {
          id: args.id,
        }
      })
  })
)


builder.mutationField('createService', (t) =>
  t.prismaField({
    type: 'Service',
    args: {
      name: t.arg.string({ required: true }),
      description: t.arg.string({ required: true }),
    },
    resolve: async (query, _parent, args, ctx) => {
      
      const { name, description, } = args

      if (!(await ctx).user) {
        throw new Error("You have to be logged in to perform this action")
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

      if (!user || user.role !== "ADMIN") {
        throw new Error("You don have permission ot perform this action")
      }

      return await prisma.service.create({
        ...query,
        data: {
          name,
          description,
        }
      })
    }
  })
)

builder.mutationField('updateService', (t) =>
  t.prismaField({
    type: 'Service',
    args: {
      id: t.arg.id({ required: true }),
      name: t.arg.string(),
      description: t.arg.string(),
    },
    resolve: async (query, _parent, args, _ctx) =>
      prisma.service.update({
        ...query,
        where: {
          id: args.id,
        },
        data: {
          name: args.name ? args.name : undefined,
          description: args.description ? args.description : undefined,
        }
      })
  })
)

builder.mutationField('deleteService', (t) =>
  t.prismaField({
    type: 'Service',
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, args, _ctx) =>
      prisma.service.delete({
        ...query,
        where: {
          id: args.id
        }
      })
  })
)
