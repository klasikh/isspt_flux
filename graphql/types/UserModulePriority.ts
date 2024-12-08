// /graphql/types/Link.ts
import { builder } from "../builder";
import type { GetServerSideProps } from 'next'
import { getSession } from "next-auth/react"
import prisma from '../../lib/prisma';

builder.prismaObject('UserModulePriority', {
  fields: (t) => ({
    id: t.exposeID('id'),
    userId: t.exposeString('userId'),
    moduleId: t.exposeString('moduleId'),
    priority: t.exposeString('priority'),
  }),
})


builder.queryField('userModulePriorities', (t) =>
  t.prismaConnection({
    type: 'UserModulePriority',
    cursor: 'id',
    resolve: (query, _parent, _args, _ctx, _info) =>
      prisma.userModulePriority.findMany({ ...query })
  })
)

builder.queryField('userModulePriority', (t) =>
  t.prismaField({
    type: 'UserModulePriority',
    nullable: true,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: (query, _parent, args, _info) =>
      prisma.link.findUnique({
        ...query,
        where: {
          id: args.id,
        }
      })
  })
)


builder.mutationField('createUserModulePriority', (t) =>
  t.prismaField({
    type: 'UserModulePriority',
    args: {
      userId: t.arg.string({ required: true }),
      moduleId: t.arg.string({ required: true }),
      priority: t.arg.string({ required: true }),
    },
    resolve: async (query, _parent, args, ctx) => {
      
      const { userId, moduleId, priority } = args

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
          // return 'toto est Ok'
        }

        // return {
        //   props: {},
        // };
      };

      try {
        const getSess = await getServerSideProps(ctx);

        let findModulePriority = await prisma.userModulePriority.findMany({
          ...query,
          where: {
            userId: userId,
            moduleId: moduleId,
          }
        })

        if(findModulePriority[0]) {
          throw new Error("Désolé, ce module a déjà été attribué à cet utitlisateur");
        }

      } catch (error) {
        console.log(error)
        return error;
      }

      const addedModule = await prisma.userModulePriority.create({
        ...query,
        data: {
          userId,
          moduleId,
          priority,
        }
      });

      //  const concernedUser = await prisma.user.findUnique({
      //   where: {
      //     id: userId,
      //   }
      // })

      //  const updateUserModule = await prisma.user.update({
      //   ...query,
      //   where: {
      //     id: userId
      //   },
      //   data: {
      //     userModulesPriorities: {
      //       connect: [{ id: args.userId }]
      //     }
      //   }
      // })

       return addedModule;
    }
  })
)

builder.mutationField('updateUserModulePriority', (t) =>
  t.prismaField({
    type: 'UserModulePriority',
    args: {
      id: t.arg.id({ required: true }),
      userId: t.arg.string(),
      moduleId: t.arg.string(),
      priority: t.arg.string(),
    },
    resolve: async (query, _parent, args, ctx) =>
    {

      const { userId, moduleId, priority } = args

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
          // return 'toto est Ok'
        }

      };

      try {
        const getSess = await getServerSideProps(ctx);

        let findModulePriority = await prisma.userModulePriority.findMany({
          ...query,
          where: {
            userId: userId,
            moduleId: moduleId,
          }
        })

        if(findModulePriority[0]) {
          throw new Error("Désolé, ce module a déjà été attribué à cet utitlisateur");
        }

      } catch (error) {
        console.log(error)
        return error;
      }

      const updatedModule = prisma.userModulePriority.update({
        ...query,
        where: {
          id: args.id,
        },
        data: {
          userId: args.userId ? args.userId : undefined,
          moduleId: args.moduleId ? args.moduleId : undefined,
          priority: args.priority ? args.priority : undefined,
        }
      })

      return updatedModule;
    }
  })
)

builder.mutationField('deleteUserModulePriority', (t) =>
  t.prismaField({
    type: 'UserModulePriority',
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

      const deletedUserModulePriority = prisma.userModulePriority.delete({
        where: {
          id: args.id
        },
      });

       return deletedUserModulePriority;

    }
  })
)
