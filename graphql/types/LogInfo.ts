// /graphql/types/LogInfo.ts
import { builder } from "../builder";
import type { GetServerSideProps } from 'next'
import { getSession } from "next-auth/react"

builder.prismaObject('LogInfo', {
  name: 'LogInfo',
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    description: t.exposeString('description', { nullable: true, }),
    link: t.exposeString('link', { nullable: true, }),
    createdYear: t.exposeString('createdYear', { nullable: true, })
  }),
})

builder.queryField('logInfos', (t) =>
  t.prismaConnection({
    type: 'LogInfo',
    cursor: 'id',
    resolve: (query, _parent, _args, _ctx, _info) =>
      prisma.logInfo.findMany({ ...query, orderBy: {createdAt: 'desc'}  })
  })
)

builder.queryField('logInfo', (t) =>
  t.prismaField({
    type: 'LogInfo',
    nullable: true,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: (query, _parent, args, _info) =>
      prisma.logInfo.findUnique({
        ...query,
        where: {
          id: args.id.toString(),
        }
      })
  })
)

builder.queryField('getLogInfosDatasByFilter', (t) =>
  t.prismaConnection({
    type: 'LogInfo',
    cursor: 'id',
    args: {
      inputvalue: t.arg.string({ required: true })
    },
    resolve: (query, _parent, args, _info) => {
      // console.log(args.inputvalue)
      const theDatas = prisma.logInfo.findMany({
        ...query,
        where: {
          OR: [
            { createdYear: args.inputvalue, },
            { title: args.inputvalue, },
            { title: '%' + args.inputvalue + '%', },
            { title: '\\_' + args.inputvalue, },
            { link: args.inputvalue, },
            { link: '%' + args.inputvalue + '%', },
            { link: '\\_' + args.inputvalue, },
          ],
        },
        orderBy: {createdAt: 'desc'}
      })

      return theDatas;
    }
  })
)

builder.queryField('getLogInfosDatasByFilterInterval', (t) =>
  t.prismaConnection({
    type: 'LogInfo',
    cursor: 'id',
    args: {
      leftSide: t.arg.string({ required: true }),
      rightSide: t.arg.string({ required: true })
    },
    resolve: (query, _parent, args, _info) => {
      // console.log(args.inputvalue)
      const theDatas = prisma.logInfo.findMany({
        ...query,
        where: {
          createdAt: {
            gte: new Date(args.leftSide), // Start of date range
            lte: new Date(args.rightSide), // End of date range
          },
        },
        orderBy: {createdAt: 'desc'}
      })

      return theDatas;
    }
  })
)