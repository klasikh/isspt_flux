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
          id: Number(args.id),
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
      motifId: t.arg.string({ required: true }),
      filiereId: t.arg.string({ required: true }),
      amount: t.arg.string({ required: true }),
      step: t.arg.string({ required: true }),
      filePath: t.arg.string({ required: false }),
      createdYear: t.arg.string({ required: true }),
      status: t.arg.string({ required: false }),
      isNotified: t.arg.boolean({ required: false }),
      fromId: t.arg.string({ required: false }),
      toId: t.arg.string({ required: false }),
    },
    resolve: async (query, _parent, args, ctx) => {
      
      const { title, description, name, motifId, filiereId, amount, step, createdYear,  } = args


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

        if (!user || (user.role !== "USER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
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
      filiereId: t.arg.string(),
      motifId: t.arg.string(),
      amount: t.arg.string(),
      status: t.arg.string(),
      createdYear: t.arg.string(),
      isNotified: t.arg.string(),
      fromId: t.arg.string(),
      toId: t.arg.string(),
    },
    resolve: async (query, _parent, args, _ctx) =>
      prisma.payment.update({
        ...query,
        where: {
          id: Number(args.id),
        },
        data: {
          title: args.title ? args.title : undefined,
          name: args.name ? args.name : undefined,
          description: args.description ? args.description : undefined,
          filiereId: args.filiereId ? args.filiereId : undefined,
          motifId: args.motifId ? args.motifId : undefined,
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
          id: Number(args.id)
        }
      })
  })
)
