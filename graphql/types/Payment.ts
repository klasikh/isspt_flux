// /graphql/types/Link.ts
import { builder } from "../builder";
import type { GetServerSideProps } from 'next'
import { getSession } from "next-auth/react"

builder.prismaObject('Payment', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    surname: t.exposeString('surname'),
    description: t.exposeString('description'),
    filiereId: t.exposeString('filiereId'),
    filiere: t.relation('filiere'),
    motifId: t.exposeString('motifId'),
    motif: t.relation('motif'),
    amount: t.exposeString('amount'),
    step: t.exposeString('step'),
    status: t.exposeString('status'),
    filePath: t.exposeString('filePath', { nullable: true, }),
    createdYear: t.exposeString('createdYear'),
    addedBy: t.exposeString('addedBy'),
    rejectMotif: t.exposeString('rejectMotif'),
    resendMotif: t.exposeString('resendMotif'),
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

builder.queryField('payments', (t) =>
  t.prismaConnection({
    type: 'Payment',
    cursor: 'id',
    resolve: (query, _parent, _args, _ctx, _info) =>
      prisma.payment.findMany({ ...query, orderBy: {createdAt: 'desc'} })
  })
)

builder.queryField('payment', (t) =>
  t.prismaField({
    type: 'Payment',
    nullable: true,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: (query, _parent, args, _info) => {
      prisma.payment.findUnique({
        ...query,
        where: {
          id: args.id,
        }
      })
    }
  })
)

builder.queryField('getDatasByFilter', (t) =>
  t.prismaConnection({
    type: 'Payment',
    cursor: 'id',
    args: {
      inputvalue: t.arg.string({ required: true })
    },
    resolve: (query, _parent, args, _info) => {
      // console.log(args.inputvalue)
      const theDatas = prisma.payment.findMany({
        ...query,
        where: {
          OR: [
            { createdYear: args.inputvalue, },
            { name: args.inputvalue, },
            { name: '%' + args.inputvalue + '%', },
            { name: '\\_' + args.inputvalue, },
            { surname: args.inputvalue, },
            { surname: '%' + args.inputvalue + '%', },
            { surname: '\\_' + args.inputvalue, },
            { motif:  { name: args.inputvalue, } },
            { motif:  { name: '%' + args.inputvalue + '%',} },
            { motif:  { name: '\\_' + args.inputvalue,} },
            { filiere:  { name: args.inputvalue, } },
            { filiere:  { name: '%' + args.inputvalue + '%',} },
            { filiere:  { name: '\\_' + args.inputvalue,} },
            { filiere:  { sigle: args.inputvalue, } },
            { filiere:  { sigle: '%' + args.inputvalue + '%',} },
            { filiere:  { sigle: '\\_' + args.inputvalue,} },
            { amount: args.inputvalue, },
            { amount: '%' + args.inputvalue + '%', },
            { amount: '\\_' + args.inputvalue, },
          ],
        },
        orderBy: {createdAt: 'desc'}
      })

      return theDatas;
    }
  })
)

builder.queryField('getDatasByFilterInterval', (t) =>
  t.prismaConnection({
    type: 'Payment',
    cursor: 'id',
    args: {
      leftSide: t.arg.string({ required: true }),
      rightSide: t.arg.string({ required: true })
    },
    resolve: (query, _parent, args, _info) => {
      // console.log(args.inputvalue)
      const theDatas = prisma.payment.findMany({
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

builder.mutationField('createPayment', (t) =>
  t.prismaField({
    type: 'Payment',
    args: {
      name: t.arg.string({ required: true }),
      surname: t.arg.string({ required: true }),
      description: t.arg.string({ required: false }),
      motifId: t.arg.id({ required: true }),
      filiereId: t.arg.id({ required: true }),
      amount: t.arg.string({ required: true }),
      step: t.arg.string({ required: true }),
      filePath: t.arg.string({ required: false }),
      createdYear: t.arg.string({ required: true }),
      addedBy: t.arg.string({ required: true }),
      status: t.arg.string({ required: false }),
      isNotified: t.arg.boolean({ required: false }),
      fromId: t.arg.string({ required: false }),
      toId: t.arg.string({ required: false }),
    },
    resolve: async (query, _parent, args, ctx) => {
      
      const { name, surname, description, motifId, filiereId, amount, step, createdYear, addedBy  } = args

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

      const thePayment = await prisma.payment.create({
        ...query,
        data: {
          name,
          surname,
          description,
          filiereId,
          motifId,
          step,
          amount,
          createdYear,
          addedBy,
        }
      })

      const addLog = await prisma.logInfo.create({
        data : {
          title: "Paiement ajouté",
          description: author + " a ajouté un paiement le " + formatDate() + " à " + funcTime() + ". Le paiement est accessible au lien :",
          link: "/payments/" + thePayment.id,
          createdYear
        }
      }) 

      return thePayment;
    }
  })
)

builder.mutationField('updatePayment', (t) =>
  t.prismaField({
    type: 'Payment',
    args: {
      id: t.arg.id({ required: true }),
      name: t.arg.string(),
      surname: t.arg.string(),
      description: t.arg.string(),
      motifId: t.arg.id(),
      filiereId: t.arg.id(),
      amount: t.arg.string(),
      step: t.arg.string(),
      createdYear: t.arg.string(),
      addedBy: t.arg.string(),
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

      const payment = prisma.payment.update({
        ...query,
        where: {
          id: args.id,
        },
        data: {
          name: args.name ? args.name : undefined,
          surname: args.surname ? args.surname : undefined,
          description: args.description ? args.description : undefined,
          motifId: args.motifId ? args.motifId : undefined,
          filiereId: args.filiereId ? args.filiereId : undefined,
          amount: args.amount ? args.amount : undefined,
          step: args.step ? args.step : undefined,
          createdYear: args.createdYear ? args.createdYear : undefined,
          addedBy: args.addedBy ? args.addedBy : undefined,
        }
      });

      const currentYear = new Date().getFullYear();
      const yearToString = currentYear.toString();
      const addLog = await prisma.logInfo.create({
        data : {
          title: "Paiement modifié",
          description: author + " a modifié un paiement le " + formatDate() + " à " + funcTime() + ". Le paiement est accessible au lien :",
          link: "/payments/" + args.id,
          createdYear: yearToString,
        }
      }) 

      return payment;

    }
  })
)

builder.mutationField('sendPayment', (t) =>
  t.prismaField({
    type: 'Payment',
    args: {
      id: t.arg.id({ required: true }),
      userId: t.arg.id({ required: true }),
      name: t.arg.string(),
      surname: t.arg.string(),
      motifId: t.arg.id(),
      filiereId: t.arg.id(),
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

      const payment = await prisma.payment.update({
        ...query,
        where: {
          id: args.id
        },
        data: {
          resendMotif: null,
          rejectMotif: null,
          step: "1",
          status: "ONPROCESS"
        }
      })

      const currentYear = new Date().getFullYear();
      const yearToString = currentYear.toString();
      const addLog = await prisma.logInfo.create({
        data : {
          title: "Paiement envoyé",
          description: author + " a envoyé un paiement le " + formatDate() + " à " + funcTime() + ". Le paiement est accessible au lien :",
          link: "/payments/" + payment.id,
          createdYear: yearToString,
        }
      }) 

      return payment;
    }
  })
)

builder.mutationField('rejectPayment', (t) =>
  t.prismaField({
    type: 'Payment',
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
              name: "PAIEMENT"
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
            if(getUserPriorities[i].module?.name === "PAIEMENT") {
              if(!getUserPriorities[i] || (getUserPriorities[i].priority !== "UPDATE" && getUserPriorities[i].priority !== "APPROV_REJECT" && getUserPriorities[i].priority !== "R_UPDATE_DELETE" && getUserPriorities[i].priority !== "C_R_UPDATE_DELETE" && getUserPriorities[i].priority !== "C_R_U_APPROV_REJECT")) {
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
        author = user?.name;
      };

      try {
        const getSess = await getServerSideProps(_ctx);
      } catch (error) {
        return error;
      }

      const payment = prisma.payment.update({
        ...query,
        where: {
          id: args.id,
        },
        data: {
          rejectMotif: args.rejectMotif ? args.rejectMotif : undefined,
          resendMotif: null,
          status: args.status ? args.status : undefined,
          step: args.step ? args.step : undefined,
        }
      })

      const currentYear = new Date().getFullYear();
      const yearToString = currentYear.toString();
      const addLog = await prisma.logInfo.create({
        data : {
          title: "Paiement rejeté",
          description: author + " a rejeté un paiement le " + formatDate() + " à " + funcTime() + ". Le paiement est accessible au lien :",
          link: "/payments/" + args.id,
          createdYear: yearToString,
        }
      }) 

      return payment;
    }
  })
)

builder.mutationField('resendPayment', (t) =>
  t.prismaField({
    type: 'Payment',
    args: {
      id: t.arg.id({ required: true }),
      resendMotif: t.arg.string(),
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
        author = user.name;
      };

      try {
        const getSess = await getServerSideProps(_ctx);
      } catch (error) {
        return error;
      }

      const payment = prisma.payment.update({
        ...query,
        where: {
          id: args.id,
        },
        data: {
          resendMotif: args.resendMotif ? args.resendMotif : undefined,
          status: args.status ? args.status : undefined,
          step: args.step ? args.step : undefined,
        }
      })

      const currentYear = new Date().getFullYear();
      const yearToString = currentYear.toString();
      const addLog = await prisma.logInfo.create({
        data : {
          title: "Paiement renvoyé",
          description: author + " a renvoyé un paiement le " + formatDate() + " à " + funcTime() + ". Le paiement est accessible au lien :",
          link: "/payments/" + args.id,
          createdYear: yearToString,
        }
      }) 

      return payment;

    }
  })
)

builder.mutationField('validPayment', (t) =>
  t.prismaField({
    type: 'Payment',
    args: {
      id: t.arg.id({ required: true }),
      userId: t.arg.id(),
      status: t.arg.string(),
      step: t.arg.string(),
      filePath: t.arg.string(),
    },
    resolve: async (query, _parent, args, _ctx) => {

      let author;
      const getServerSideProps: GetServerSideProps = async (context) => {

        let session;
        session = await getSession(context);

        if (!session?.user) {
          throw new Error("Vous devez être connectés pour effectuer cette action");
        }

        const user = await prisma.user.findUnique({
          where: {
            username: session?.user?.username,
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
              name: "PAIEMENT"
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
            if(getUserPriorities[i].module?.name === "PAIEMENT") {
              if(!getUserPriorities[i] || (getUserPriorities[i].priority !== "UPDATE" && getUserPriorities[i].priority !== "APPROV_REJECT" && getUserPriorities[i].priority !== "R_UPDATE_DELETE" && getUserPriorities[i].priority !== "C_R_UPDATE_DELETE" && getUserPriorities[i].priority !== "C_R_U_APPROV_REJECT")) {
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

      const payment = prisma.payment.update({
        ...query,
        where: {
          id: args.id,
        },
        data: {
          rejectMotif: null,
          resendMotif: null,
          status: args.status ? args.status : undefined,
          step: args.step ? args.step : undefined,
          filePath: args.filePath ? args.filePath : undefined,
        }
      })

      const currentYear = new Date().getFullYear();
      const yearToString = currentYear.toString();
      const addLog = await prisma.logInfo.create({
        data : {
          title: "Paiement validé",
          description: author + " a validé un paiement le " + formatDate() + " à " + funcTime() + ". Le paiement est accessible au lien :",
          link: "/payments/" + args.id,
          createdYear: yearToString,
        }
      }) 

      return payment;
    }
  })
)

builder.mutationField('deletePayment', (t) =>
  t.prismaField({
    type: 'Payment',
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
      const deletedPayment = prisma.payment.delete({
        where: {
          id: args.id
        },
      });
      
      const currentYear = new Date().getFullYear();
      const yearToString = currentYear.toString();
      const addLog = await prisma.logInfo.create({
        data : {
          title: "Paiement supprimé",
          description: author + " a supprimé un paiement le " + formatDate() + " à " + funcTime() + ".",
          createdYear: yearToString,
        }
      }) 

      return deletedPayment;

    }
  })
)
