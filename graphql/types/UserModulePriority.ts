// /graphql/types/Link.ts
import { builder } from "../builder";
import type { GetServerSideProps } from 'next'
import { getSession } from "next-auth/react"

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
          id: Number(args.id),
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
          throw new Error("You have to be logged in to perform this action");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: session.user?.email,
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

        // let findModulePriority = await prisma.module.findMany({
        //   ...query,
        //   where: {
        //     userId: userId,
        //     moduleId: moduleId,
        //   }
        // })
        //
        // console.log(findModulePriority)
        //
        // if(findModulePriority) {
        //   throw new Error("Désolé, ce module a déjà été attribué à cet utitlisateur");
        // }

      } catch (error) {
        console.log(error)
        return error;
      }

      return await prisma.userModulePriority.create({
        ...query,
        data: {
          userId,
          moduleId,
          priority,
        }
      })
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
    resolve: async (query, _parent, args, _ctx) =>
      prisma.userModulePriority.update({
        ...query,
        where: {
          id: Number(args.id),
        },
        data: {
          userId: args.userId ? args.userId : undefined,
          moduleId: args.moduleId ? args.moduleId : undefined,
          priority: args.priority ? args.priority : undefined,
        }
      })
  })
)

builder.mutationField('deleteUserModulePriority', (t) =>
  t.prismaField({
    type: 'UserModulePriority',
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, args, _ctx) =>
      prisma.userModulePriority.delete({
        ...query,
        where: {
          id: Number(args.id)
        }
      })
  })
)
