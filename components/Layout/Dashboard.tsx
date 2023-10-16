import { useRouter } from "next/navigation"
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "./widgets/layout";
import { useMaterialTailwindController, setOpenConfigurator } from "../context";
import Link from "next/link";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../../pages/api/auth/[...nextauth]";
import routes from "../../protected/links";

const Dashboard = async () => {
    const router = useRouter();
    const [controller, dispatch] = useMaterialTailwindController();
    const { sidenavType } = controller;
    const session = await getServerSession(authOptions);

    return (
        <div className="min-h-screen bg-blue-gray-50/50">
            <Sidenav
                routes={routes}
                brandImg={
                    sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
                }
            />
            <div className="p-4 xl:ml-80">
                <DashboardNavbar />
                <Configurator />
                <IconButton
                    size="lg"
                    color="white"
                    className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
                    ripple={false}
                    onClick={() => setOpenConfigurator(dispatch, true)}
                >
                <Cog6ToothIcon className="h-5 w-5" />
                </IconButton>
                <div>
                    {routes.map(
                        ({ layout, pages }) =>
                        layout === "dashboard" &&
                        pages.map(({ path, element }) => (
                            <Link exact path={path} element={element} ></Link>
                        ))
                    )}
                </div>
                <div className="text-blue-gray-600">
                    <Footer />
                </div>
            </div>
        </div>
    );
}

Dashboard.displayName = "./Dashboard.tsx";

export default Dashboard;
