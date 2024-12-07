import { useRouter } from "next/navigation"
import { getSession, useSession } from "next-auth/react"
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
//   DashboardNavbar,
//   Configurator,
  Footer,
} from "./widgets/layout";
import Sidenav from "./widgets/layout/Sidenav"
import DashboardNavbar from "./widgets/layout/dashboard-navbar"
import { useMaterialTailwindController, setOpenConfigurator } from "../context";
import Link from "next/link";

import toast, { Toaster } from 'react-hot-toast';
import routes from "../../protected/links";

export function Dashboard ({
    children, // will be a page or nested layout
  }: {
    children: React.ReactNode
  }) {
    const router = useRouter();
    const {controller, dispatch} = useMaterialTailwindController();
    const sidenavType = controller;
    const { data: session, status } = useSession();

    return (
        <div className="min-h-screen bg-blue-gray-50/50">
            <Sidenav
                routes={routes}
                brandImg={
                    sidenavType === "dark" ? "/images/logo.png" : "/images/logo.png"
                }
                brandName="ISSPT"
            />
            <div className="flex flex-col h-screen justify-between p-4 xl:ml-80">
                <DashboardNavbar />
                <Toaster />

                {/* <Configurator /> */}
                {/* <IconButton
                    size="lg"
                    color="white"
                    className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
                    ripple={false}
                    onClick={() => setOpenConfigurator(dispatch, true)}
                >
                    <Cog6ToothIcon className="h-5 w-5" />
                </IconButton> */}
                <div>
                    {children}
                </div>
                <div className="text-blue-gray-600 mt-12 my-8" >
                    {/* <Footer /> */}
                </div>
            </div>
        </div>
    );
}

Dashboard.displayName = "./Dashboard.tsx";

export default Dashboard;
