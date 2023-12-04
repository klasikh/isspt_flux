import React from "react";
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
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "../../components/Layout/widgets/cards";
// import { StatisticsChart } from "../../components/Layout/widgets/charts";
import {
  statisticsCardsData,
  // statisticsChartsData,
  projectsTableData,
  ordersOverviewData,
} from "../../data";

export function Dashboard() {

  const dashboardMenu = [
    {
      color: "pink",
      icon: DocumentTextIcon,
      title: "Module PROFORMA",
      path: "/payments/list",
      value: "",
      footer:"",
    },
    {
      color: "blue",
      icon: BanknotesIcon,
      title: "Module FACTURATION",
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
        { dashboardMenu.map(({ icon, title, footer, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })} 
          />
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
