// /graphql/types/User.ts
import { builder } from "../builder";
import type { GetServerSideProps } from 'next'
import { getSession } from "next-auth/react"
import bcrypt from "bcryptjs";
import prisma from '../../lib/prisma';

const Role = builder.enumType('Role', {
  values: ['USER', 'ADMIN'] as const,
})

builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name', { nullable: true, }),
    username: t.exposeString('username', { nullable: false, }),
    gradeId: t.exposeString('gradeId',),
    grade: t.relation('grade', {
      args: {
        gradeId: t.arg.string('gradeId'),
      },
      // Define custom query options that are applied when
      // loading the post relation
      query: (args, context) => ({

      }),
    }),
    image: t.exposeString('image', { nullable: true, }),
    role: t.expose('role', { type: Role, }),
    bookmarks: t.relation('bookmarks'),
    payments: t.relation('payments'),
    spents: t.relation('spents'),
  //   spents: t.field({
  //     select: (args, ctx, nestedSelection) => ({
  //       spents: {
  //         select: {
  //           // This will look at what fields are queried on Media
  //           // and automatically select uploadedBy if that relation is requested
  //           spents: nestedSelection(
  //             // This arument is the default query for the media relation
  //             // It could be something like: `{ select: { id: true } }` instead
  //             true,
  //           ),
  //         },
  //       },
  //     }),
  //     type: [Spent],
  //     resolve: (user) => user.spents.map(({ spent }) => spent),
  //   }),
  })
})

builder.queryField('users', (t) =>
  t.prismaConnection({
    type: 'User',
    cursor: 'id',
    resolve: (query, _parent, _args, _ctx, _info) =>
      prisma.user.findMany({ ...query })
  })
)

builder.mutationField('createUser', (t) =>
  t.prismaField({
    type: 'User',
    args: {
      name: t.arg.string({ required: true }),
      username: t.arg.string({ required: true }),
      gradeId: t.arg.string({ required: true }),
      role: t.arg.string({ required: true }),
      image: t.arg.string({ required: false }),
    },
    resolve: async (query, _parent, args, ctx) => {

      const { name, username, gradeId, role, image } = args

      const passwordHashed = bcrypt.hashSync("00000000", 12);

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

      } catch (error) {
        console.log(error)
        return error;
      }

      return await prisma.user.create({
        ...query,
        data: {
          name,
          username,
          gradeId,
          role,
          image,
          password: passwordHashed,
        }
      })
    }
  })
)

builder.mutationField('updateUser', (t) =>
  t.prismaField({
    type: 'User',
    args: {
      id: t.arg.id({ required: true }),
      name: t.arg.string(),
      username: t.arg.string(),
      gradeId: t.arg.string(),
      role: t.arg.string(),
      image: t.arg.string({ required: false }),
    },
    resolve: async (query, _parent, args, _ctx) =>
      prisma.user.update({
        ...query,
        where: {
          id: args.id,
        },
        data: {
          name: args.name ? args.name : undefined,
          username: args.username ? args.username : undefined,
          gradeId: args.gradeId ? args.gradeId : undefined,
          role: args.role ? args.role : undefined,
        }
      })
  })
)

builder.mutationField('deleteUser', (t) =>
  t.prismaField({
    type: 'User',
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

      const deletedUser = prisma.user.delete({
        where: {
          id: args.id
        },
      });

       return deletedUser;

    }
  })
)

builder.queryField('favorites', (t) =>
  t.prismaField({
    type: 'User',
    resolve: async (query, _parent, _args, ctx) => {
      if (!(await ctx).user) {
        throw new Error("You have to be logged in to perform this action")
      }

      const user = await prisma.user.findUnique({
        ...query,
        where: {
          username: (await ctx).user?.username,
        }
      })

      if (!user) throw Error('User does not exist');

      return user
    }
  })
)
