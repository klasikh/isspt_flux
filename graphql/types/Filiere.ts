// /graphql/types/Filiere.ts
import { builder } from "../builder";
import type { GetServerSideProps } from 'next'
import { getSession } from "next-auth/react"

builder.prismaObject('Filiere', {
  name: 'Filiere',
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    description: t.exposeString('description'),
    payments: t.relation('payments')
  }),
})

builder.queryField('filieres', (t) =>
  t.prismaConnection({
    type: 'Filiere',
    cursor: 'id',
    resolve: (query, _parent, _args, _ctx, _info) =>
      prisma.filiere.findMany({ ...query })
  })
)

builder.queryField('filiere', (t) =>
  t.prismaField({
    type: 'Filiere',
    nullable: true,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: (query, _parent, args, _info) =>
      prisma.filiere.findUnique({
        ...query,
        where: {
          id: args.id.toString(),
        }
      })
  })
)

builder.mutationField('createFiliere', (t) =>
  t.prismaField({
    type: 'Filiere',
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

      return await prisma.filiere.create({
        ...query,
        data: {
          name,
          description,
        }
      })
    }
  })
)

builder.mutationField('updateFiliere', (t) =>
  t.prismaField({
    type: 'Filiere',
    args: {
      id: t.arg.id({ required: true }),
      name: t.arg.string(),
      description: t.arg.string(),
    },
    resolve: async (query, _parent, args, _ctx) =>
      prisma.filiere.update({
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

builder.mutationField('deleteFiliere', (t) =>
  t.prismaField({
    type: 'Filiere',
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

      const deletedFiliere = prisma.filiere.delete({
        where: {
          id: args.id
        },
      });

       return deletedFiliere;

    }
  })
)
