import React from "react";
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession, useSession } from "next-auth/react"
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Tooltip,
  Progress,
} from "@material-tailwind/react";
import {
  BellAlertIcon,
  PlusSmallIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ArrowDownCircleIcon,
  PresentationChartLineIcon,
  ViewfinderCircleIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "../../components/Layout/widgets/cards";
// import { StatisticsChart } from "../../components/Layout/widgets/charts";
import {
  statisticsCardsData,
  // statisticsChartsData,
  projectsTableData,
  ordersOverviewData,
} from "../../data";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import prisma from '../../lib/prisma'

const Dashboard = ({ user, paymentVar, depenseVar }: InferGetServerSidePropsType<typeof getServerSideProps>) => {

  const dashboardMenu = [
    {
      color: "green",
      icon: PresentationChartLineIcon,
      title: "PROFILS",
      role: "ADMIN",
      path: "/grades/list",
      value: "",
      footer:"",
    },
    {
      color: "red",
      icon: ArrowDownCircleIcon,
      title: "MODULES",
      role: "ADMIN",
      path: "/modules/list",
      value: "",
      footer:"",
    },
    
    {
      color: "gray",
      icon: UserCircleIcon,
      title: "UTILISATEURS",
      role: "ADMIN",
      path: "/users/list",
      value: "",
      footer:"",
    },
    {
      color: "yellow",
      icon: ViewfinderCircleIcon,
      title: "FILIERES",
      role: "ADMIN",
      path: "/filieres/list",
      value: "",
      footer:"",
    },
    {
      color: "orange",
      icon: ExclamationCircleIcon,
      title: "MOTIFS",
      role: "ADMIN",
      path: "/motifs/list",
      value: "",
      footer:"",
    },
    {
      color: "pink",
      icon: DocumentTextIcon,
      title: "Module PAIEMENT",
      role: "USER",
      moduled: "PAIEMENT",
      path: "/payments/list",
      value: "",
      footer:"",
    },
    {
      color: "blue",
      icon: BanknotesIcon,
      title: "Module DEPENSE",
      role: "USER",
      moduled: "DEPENSE",
      path: "/spents/list",
      value: "",
      footer: {
        color: "text-green-500",
        value: "+55%",
        label: "than last week",
      },
    },
  ]
  return (
    <div className="mt-12">
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-2">
        { dashboardMenu.map(({ icon, title, footer, role, moduled, ...rest }) => (
            (role && user?.role === role)
              ? ( 
                (role === "ADMIN")
                ? (<StatisticsCard
                    key={title}
                    {...rest}
                    title={title}
                    icon={React.createElement(icon, {
                      className: "w-6 h-6 text-white",
                    })} 
                  />
                  )
                : (role === "USER" && paymentVar && moduled === "PAIEMENT")
                ? (<StatisticsCard
                    key={title}
                    {...rest}
                    title={title}
                    icon={React.createElement(icon, {
                      className: "w-6 h-6 text-white",
                    })} 
                  />
                )
                : (role === "USER" && depenseVar && moduled === "DEPENSE")
                ? (<StatisticsCard
                    key={title}
                    {...rest}
                    title={title}
                    icon={React.createElement(icon, {
                      className: "w-6 h-6 text-white",
                    })} 
                  />
                )
                : ""
              )
            : ""
        )) }
      </div>
      <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        {/* { statisticsChartsData.map((props) => (
          <StatisticsChart
            key={props.title}
            {...props}
            footer={
              <Typography
                variant="small"
                className="flex items-center font-normal text-blue-gray-600"
              >
                <ClockIcon strokeWidth={2} className="h-4 w-4 text-inherit" />
                &nbsp;{props.footer}
              </Typography>
            }
          />
        )) } */}
      </div>
      {/* <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <Typography variant="h6" color="blue-gray" className="mb-1">
            Projects
          </Typography>
        </Card>
        <Card>
          <Typography variant="h6" color="blue-gray" className="mb-2">
            Orders Overview
          </Typography>
        </Card>
      </div> */}
    </div>
  );
}

export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: '/auth/signin',
      },
      props: {},
    };
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
  });

  if (!user || (user && user?.role !== "USER" && user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN")) {
    return {
      redirect: {
        permanent: false,
        destination: '/404',
      },
      props: {},
    };
  }
  
  // PAYMENT module verification
  const getUserPaymentProp = await prisma.userModulePriority.findMany({
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
    take: 1,
  })

  let paymentVar = false;
  if(getUserPaymentProp[0] && getUserPaymentProp[0]?.module?.name === "PAIEMENT") {
    paymentVar = true;
  } else {
    paymentVar = false;
  }
  
  // DEPENSE Module verification
  const getUserDepenseProp = await prisma.userModulePriority.findMany({
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
    take: 1,
  })

  let depenseVar = false;
  if(getUserDepenseProp[0] && getUserDepenseProp[0]?.module?.name === "DEPENSE") {
    depenseVar = true;
  } else {
    depenseVar = false;
  }
  return {
    props: {
      user,
      paymentVar,
      depenseVar,
    },
  };
};
