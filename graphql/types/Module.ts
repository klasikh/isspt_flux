// /graphql/types/Module.ts
import { builder } from "../builder";
import type { GetServerSideProps } from 'next'
import { getSession } from "next-auth/react"

builder.prismaObject('Module', {
  name: 'Module',
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    description: t.exposeString('description'),
    userModulesPriorities: t.relation('userModulesPriorities')
  }),
})

builder.queryField('modules', (t) =>
  t.prismaConnection({
    type: 'Module',
    cursor: 'id',
    resolve: (query, _parent, _args, _ctx, _info) =>
      prisma.module.findMany({ ...query })
  })
)

builder.queryField('module', (t) =>
  t.prismaField({
    type: 'Module',
    nullable: true,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: (query, _parent, args, _info) =>
      prisma.module.findUnique({
        ...query,
        where: {
          id: args.id,
        }
      })
  })
)

builder.mutationField('createModule', (t) =>
  t.prismaField({
    type: 'Module',
    args: {
      name: t.arg.string({ required: true }),
      description: t.arg.string({ required: true }),
    },
    resolve: async (query, _parent, args, ctx) => {
      
      const { name, description, } = args

      const getServerSideProps: GetServerSideProps = async (context) => {

        let session;
        session = await getSession(context);

        if (!session.user) {
          throw new Error("You have to be logged in to perform this action");
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

        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
          throw new Error("You don't have permission to perform this action");
          // return 'toto est Ok'
        }

        // return {
        //   props: {},
        // };
      };

      try {
        const getSess = await getServerSideProps(ctx);

      } catch (error) {
        return error;
      }

      return await prisma.module.create({
        ...query,
        data: {
          name,
          description,
        }
      })
    }
  })
)

builder.mutationField('updateModule', (t) =>
  t.prismaField({
    type: 'Module',
    args: {
      id: t.arg.id({ required: true }),
      name: t.arg.string(),
      description: t.arg.string(),
    },
    resolve: async (query, _parent, args, _ctx) =>
      prisma.module.update({
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

builder.mutationField('deleteModule', (t) =>
  t.prismaField({
    type: 'Module',
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

        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
          throw new Error("Vous n'avez pas les permissions requises pour effectuer cette action");
        }
      };

      const deletedModule = prisma.module.delete({
        where: {
          id: args.id
        },
      });

       return deletedModule;

    }
  })
)
