// /graphql/types/User.ts
import { builder } from "../builder";
import type { GetServerSideProps } from 'next'
import { getSession } from "next-auth/react"
import bcrypt from "bcryptjs";

builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name', { nullable: true, }),
    email: t.exposeString('email', { nullable: true, }),
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

const Role = builder.enumType('Role', {
  values: ['USER', 'ADMIN'] as const,
})


builder.mutationField('createUser', (t) =>
  t.prismaField({
    type: 'User',
    args: {
      name: t.arg.string({ required: true }),
      email: t.arg.string({ required: true }),
      gradeId: t.arg.string({ required: true }),
      role: t.arg.string({ required: true }),
      image: t.arg.string({ required: false }),
    },
    resolve: async (query, _parent, args, ctx) => {

      const { name, email, gradeId, role, image } = args

      const passwordHashed = bcrypt.hashSync("00000000", 12);

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

      } catch (error) {
        console.log(error)
        return error;
      }

      return await prisma.user.create({
        ...query,
        data: {
          name,
          email,
          gradeId,
          role,
          image,
          password: passwordHashed,
        }
      })
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
          email: (await ctx).user?.email,
        }
      })

      if (!user) throw Error('User does not exist');

      return user
    }
  })
)
