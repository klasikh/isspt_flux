// /graphql/types/Link.ts
import { builder } from "../builder";
import type { GetServerSideProps } from 'next'
import { getSession } from "next-auth/react"
import { NextResponse } from "next/server";
import prisma from '../../lib/prisma';

builder.prismaObject('Spent', {
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    name: t.exposeString('name'),
    description: t.exposeString('description'),
    nature: t.exposeString('nature'),
    motif: t.exposeString('motif'),
    amount: t.exposeString('amount'),
    step: t.exposeString('step'),
    status: t.exposeString('status'),
    createdYear: t.exposeString('createdYear'),
    addedBy: t.exposeString('addedBy'),
    rejectMotif: t.exposeString('rejectMotif'),
    isNotified: t.boolean(),
    fromId: t.exposeString('fromId', { nullable: true, }),
    toId: t.exposeString('toId', { nullable: true, }),
  }),
})

function formatDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Months start at 0!
  let mmToStr = mm.toString();
  let dd = today.getDate();
  let ddToStr = dd.toString();
  
  if (dd < 10) ddToStr = '0' + dd;
  if (mm < 10) mmToStr = '0' + mm;
  
  const formattedToday = dd + '/' + mm + '/' + yyyy;
  return formattedToday;
}

function checkTime(i: any) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function funcTime() {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  // add a zero in front of numbers<10
  m = checkTime(m);
  s = checkTime(s);
  const theTime = h + ":" + m + ":" + s;
  return theTime;
}

builder.queryField('spents', (t) =>
  t.prismaConnection({
    type: 'Spent',
    cursor: 'id',
    resolve: (query, _parent, _args, _ctx, _info) =>
      prisma.spent.findMany({ ...query, orderBy: {createdAt: 'desc'}  })
  })
)

builder.queryField('spent', (t) =>
  t.prismaField({
    type: 'Spent',
    nullable: true,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: (query, _parent, args, _info) => {
      prisma.spent.findUnique({
        ...query,
        where: {
          id: args.id,
        }
      })
    }
  })
)

builder.queryField('getSpentsDatasByFilter', (t) =>
  t.prismaConnection({
    type: 'Spent',
    cursor: 'id',
    args: {
      inputvalue: t.arg.string({ required: true })
    },
    resolve: (query, _parent, args, _info) => {
      // console.log(args.inputvalue)
      const theDatas = prisma.spent.findMany({
        ...query,
        where: {
          OR: [
            { createdYear: args.inputvalue, },
            { name: args.inputvalue, },
            { name: '%' + args.inputvalue + '%', },
            { name: '\\_' + args.inputvalue, },
            { title: args.inputvalue, },
            { title: '%' + args.inputvalue + '%', },
            { title: '\\_' + args.inputvalue, },
            { motif: args.inputvalue, },
            { motif: '%' + args.inputvalue + '%', },
            { motif: '\\_' + args.inputvalue, },
            { amount: args.inputvalue, },
            { amount: '%' + args.inputvalue + '%', },
            { amount: '\\_' + args.inputvalue, },
            { nature: args.inputvalue, },
            { nature: '%' + args.inputvalue + '%', },
            { nature: '\\_' + args.inputvalue, },
          ],
        },
        orderBy: {createdAt: 'desc'} 
      })

      return theDatas;
    }
  })
)

builder.queryField('getSpentsDatasByFilterInterval', (t) =>
  t.prismaConnection({
    type: 'Spent',
    cursor: 'id',
    args: {
      leftSide: t.arg.string({ required: true }),
      rightSide: t.arg.string({ required: true })
    },
    resolve: (query, _parent, args, _info) => {
      // console.log(args.inputvalue)
      const theDatas = prisma.spent.findMany({
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

builder.mutationField('createSpent', (t) =>
  t.prismaField({
    type: 'Spent',
    args: {
      title: t.arg.string({ required: true }),
      name: t.arg.string({ required: true }),
      description: t.arg.string({ required: false }),
      motif: t.arg.string({ required: true }),
      nature: t.arg.string({ required: true }),
      amount: t.arg.string({ required: true }),
      status: t.arg.string({ required: false }),
      step: t.arg.string({ required: true }),
      createdYear: t.arg.string({ required: true }),
      addedBy: t.arg.id({ required: true }),
      isNotified: t.arg.string({ required: false }),
      fromId: t.arg.string({ required: false }),
      toId: t.arg.string({ required: false }),
    },
    resolve: async (query, _parent, args, ctx) => {
      
      const { title, name, description, motif, nature, amount, step, createdYear, addedBy,  } = args

      let author;
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

        if (!user || (user.role !== "USER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
          throw new Error("Vous n'avez pas les permissions requises pour effectuer cette action");
          // return 'toto est Ok'
        }

        const getUserPriorities = await prisma.userModulePriority.findMany({
          where: {
            userId: user.id
          },
          select: {
            userId: true,
            moduleId: true,
            priority: true
          },
        })

        // return {
        //   props: {},
        // };
        author = user.name;
      };

      try {
        const getSess = await getServerSideProps(ctx);

      } catch (error) {
        return error;
      }

      const spent = await prisma.spent.create({
        ...query,
        data: {
          title, 
          name, 
          description, 
          motif, 
          nature,
          amount, 
          step,
          createdYear, 
          addedBy,
        }
      })

      const addLog = await prisma.logInfo.create({
        data : {
          title: "Dépense ajoutée",
          description: author + " a ajouté une dépense le " + formatDate() + " à " + funcTime() + ". La dépense est accessible au lien :",
          link: "/spents/" + spent.id,
          createdYear
        }
      }) 

      return spent;
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
      step: t.arg.string(),
      createdYear: t.arg.string(),
      addedBy: t.arg.id(),
    },
    resolve: async (query, _parent, args, _ctx) => {
      
      let author;
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

      if (!user || (user.role !== "USER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        throw new Error("Vous n'avez pas les permissions requises pour effectuer cette action");
        // return 'toto est Ok'
      }

      const getUserPriorities = await prisma.userModulePriority.findMany({
        where: {
          userId: user.id
        },
        select: {
          userId: true,
          moduleId: true,
          priority: true
        },
      })

      // return {
      //   props: {},
      // };
      author = user.name;
    };

    try {
      const getSess = await getServerSideProps(_ctx);
    } catch (error) {
      return error;
    }

    const spent = prisma.spent.update({
        ...query,
        where: {
          id: args.id,
        },
        data: {
          title: args.title ? args.title : undefined,
          name: args.name ? args.name : undefined,
          description: args.description ? args.description : undefined,
          nature: args.nature ? args.nature : undefined,
          motif: args.motif ? args.motif : undefined,
          amount: args.amount ? args.amount : undefined,
          step: args.step ? args.step : undefined,
          createdYear: args.createdYear ? args.createdYear : undefined,
          addedBy: args.addedBy ? args.addedBy : undefined,
        }
      })
      
      const currentYear = new Date().getFullYear();
      const yearToString = currentYear.toString();
      const addLog = await prisma.logInfo.create({
        data : {
          title: "Dépense modifiée",
          description: author + " a modifié une dépense le " + formatDate() + " à " + funcTime() + ". La dépense est accessible au lien :",
          link: "/spents/" + args.id,
          createdYear: yearToString,
        }
      }) 

      return spent;
    }
    
  })
)

builder.mutationField('sendSpent', (t) =>
  t.prismaField({
    type: 'Spent',
    args: {
      id: t.arg.id({ required: true }),
      userId: t.arg.id({ required: true }),
      title: t.arg.string(),
      name: t.arg.string(),
      motif: t.arg.string(),
      nature: t.arg.string(),
      amount: t.arg.string(),
      createdYear: t.arg.string(),
    },
    resolve: async (query, _parent, args, ctx) => {

      let author;
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

        if (!user || (user.role !== "USER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
          throw new Error("Vous n'avez pas les permissions requises pour effectuer cette action");
          // return 'toto est Ok'
        }

        // return {
        //   props: {},
        // };
        author = user.name;
      };

      try {
        const getSess = await getServerSideProps(ctx);
      } catch (error) {
        return error;
      }

      const spent = await prisma.spent.update({
        ...query,
        where: {
          id: args.id
        },
        data: {
          step: "1",
          status: "ONPROCESS",
          rejectMotif: "",
        }
      })

      const currentYear = new Date().getFullYear();
      const yearToString = currentYear.toString();
      const addLog = await prisma.logInfo.create({
        data : {
          title: "Dépense envoyée",
          description: author + " a envoyé une dépense le " + formatDate() + " à " + funcTime() + ". La dépense est accessible au lien :",
          link: "/spents/" + spent.id,
          createdYear: yearToString,
        }
      }) 

      return spent;
    }
  })
)

builder.mutationField('rejectSpent', (t) =>
  t.prismaField({
    type: 'Spent',
    args: {
      id: t.arg.id({ required: true }),
      rejectMotif: t.arg.string(),
      userId: t.arg.id(),
      status: t.arg.string(),
      step: t.arg.string(),
    },
    resolve: async (query, _parent, args, _ctx) => {

      let author;
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

        if (!user || (user.role !== "USER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
          throw new Error("Vous n'avez pas les permissions requises pour effectuer cette action");
          // return 'toto est Ok'
        }

        const getUserPriorities = await prisma.userModulePriority.findMany({
          where: {
            userId: user.id,
            module: {
              name: "DEPENSE"
            }
          },
          select: {
            userId: true,
            moduleId: true,
            module: {
              select: {
                id: true,
                name: true,
              }
            },
            priority: true
          },
        })

        if(getUserPriorities) {
          for(let i=0; i<getUserPriorities.length; i++) {
            if(getUserPriorities[i].module?.name === "DEPENSE") {
              if(!getUserPriorities[i] || (getUserPriorities[i].priority !== "UPDATE" && getUserPriorities[i].priority !== "APPROV_REJECT" && getUserPriorities[i].priority !== "R_UPDATE_DELETE" && getUserPriorities[i].priority !== "C_R_UPDATE_DELETE")) {
                throw new Error("Vous n'avez pas les permissions requises pour effectuer cette action.")
              }
            } else {
              throw new Error("Vous n'avez aucune priorité sur ce module")
            }
          }
        } else {
          throw new Error("Vous n'avez aucune priorité sur ce module")
        }

        // return {
        //   props: {},
        // };
        author = user.name;
      };

      try {
        const getSess = await getServerSideProps(_ctx);
      } catch (error) {
        return error;
      }

      const spent = prisma.spent.update({
        ...query,
        where: {
          id: args.id,
        },
        data: {
          rejectMotif: args.rejectMotif ? args.rejectMotif : undefined,
          status: args.status ? args.status : undefined,
          step: args.step ? args.step : undefined,
        }
      });
      
      const currentYear = new Date().getFullYear();
      const yearToString = currentYear.toString();
      const addLog = await prisma.logInfo.create({
        data : {
          title: "Dépense rejetée",
          description: author + " a rejeté une dépense le " + formatDate() + " à " + funcTime() + ". La dépense est accessible au lien :",
          link: "/spents/" + args.id,
          createdYear: yearToString,
        }
      }) 

      return spent;
    }
  })
)

builder.mutationField('validSpent', (t) =>
  t.prismaField({
    type: 'Spent',
    args: {
      id: t.arg.id({ required: true }),
      userId: t.arg.id(),
      status: t.arg.string(),
      step: t.arg.string(),
    },
    resolve: async (query, _parent, args, _ctx) => {

      let author;
      const getServerSideProps: GetServerSideProps = async (context) => {

        let session;
        session = await getSession(context);

        if (!session.user) {
          throw new Error("Vous devez être connectés pour effectuer cette action.");
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

        if (!user || (user.role !== "USER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
          throw new Error("Vous n'avez pas les permissions requises pour effectuer cette action.");
          // return 'toto est Ok'
        }

        const getUserPriorities = await prisma.userModulePriority.findMany({
          where: {
            userId: user.id,
            module: {
              name: "DEPENSE"
            }
          },
          select: {
            userId: true,
            moduleId: true,
            module: {
              select: {
                id: true,
                name: true,
              }
            },
            priority: true
          },
        })

        if(getUserPriorities) {
          for(let i=0; i<getUserPriorities.length; i++) {
            if(getUserPriorities[i].module?.name === "DEPENSE") {
              if(!getUserPriorities[i] || (getUserPriorities[i].priority !== "UPDATE" && getUserPriorities[i].priority !== "APPROV_REJECT" && getUserPriorities[i].priority !== "R_UPDATE_DELETE" && getUserPriorities[i].priority !== "C_R_UPDATE_DELETE")) {
                throw new Error("Vous n'avez pas les permissions requises pour effectuer cette action.")
              }
            } else {
              throw new Error("Vous n'avez aucune priorité sur ce module")
            }
          }
        } else {
          throw new Error("Vous n'avez aucune priorité sur ce module")
        }

        // return {
        //   props: {},
        // };
        author = user.name;
      };

      try {
        const getSess = await getServerSideProps(_ctx);
      } catch (error) {
        return error;
      }

      const spent = prisma.spent.update({
        ...query,
        where: {
          id: args.id,
        },
        data: {
          status: args.status ? args.status : undefined,
          step: args.step ? args.step : undefined,
        }
      });
      
      const currentYear = new Date().getFullYear();
      const yearToString = currentYear.toString();
      const addLog = await prisma.logInfo.create({
        data : {
          title: "Dépense validée",
          description: author + " a validé une dépense le " + formatDate() + " à " + funcTime() + ". La dépense est accessible au lien :",
          link: "/spents/" + args.id,
          createdYear: yearToString,
        }
      }) 

      return spent;
    }
  })
)

builder.mutationField('deleteSpent', (t) =>
  t.prismaField({
    type: 'Spent',
    args: {
      id: t.arg.id({ required: true }),
      userId: t.arg.id({ required: true }),
    },
    resolve: async (query, _parent, args, _ctx) => {

      let author;
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
        author = user.name;
      };

      try {
        const getSess = await getServerSideProps(_ctx);
      } catch (error) {
        return error;
      }

      const deletedSpent = prisma.spent.delete({
        where: {
          id: args.id
        },
      });
 
      const currentYear = new Date().getFullYear();
      const yearToString = currentYear.toString();
      const addLog = await prisma.logInfo.create({
        data : {
          title: "Dépense supprimée",
          description: author + " a supprimé une dépense le " + formatDate() + " à " + funcTime() + ".",
          createdYear: yearToString,
        }
      }) 

      return deletedSpent;

    }
  })
)
