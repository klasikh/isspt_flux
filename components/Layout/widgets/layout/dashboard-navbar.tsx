import React, { createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation'
import { signOut } from "next-auth/react";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from "@material-tailwind/react";
import {
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  ClockIcon,
  CreditCardIcon,
  Bars3Icon,
} from "@heroicons/react/24/solid";
import {
  MaterialTailwind,
  useMaterialTailwindController,
  setOpenConfigurator,
  setOpenSidenav,
} from "../../../context";

// import { authOptions } from "../../../../pages/api/auth/[...nextauth]";
// import { getServerSession } from "next-auth/next";
// import SignOut from "../../../SignOut"
// import { useSession } from "next-auth/react"

interface ControllerType {
  fixedNavbar: any; // Remplacez le type par le type approprié
  openSidenav: any; // Remplacez le type par le type approprié
  // Ajoutez d'autres propriétés si nécessaire
}

export function DashboardNavbar() {

  const {controller, dispatch} = useMaterialTailwindController() as any;

  const { fixedNavbar, openSidenav } = controller;
  const pathname = usePathname();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");
  // const session = await getServerSession(authOptions);
  // const { data: session, status } = useSession()

  const signOutHandler = async () => {
    signOut({
      callbackUrl: '/',
      redirect: true,
    });
  }

  return (

    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${
        fixedNavbar
          ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
          : "px-0 py-1"
      }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="capitalize">
          {/* <Breadcrumbs
            className={`bg-transparent p-0 transition-all ${
              fixedNavbar ? "mt-1" : ""
            }`}
          >
            <Link href={`/${page}`}>
              <Typography

          {
            payment.status === "APPROVED"
            ? <div className="w-full mx-4 my-2 p-4 bg-gray-300 shadow rounded-md">
                <iframe src={`/upload/payments` + payment?.filePath} style={{ width: "100%", height: "500px" }}>
                </iframe>
              </div>
            : ""
          }

                variant="small"
                color="blue-gray"
                className="font-normal opacity-50 transition-all hover:text-blue-500 hover:opacity-100"
              >
                {page}
              </Typography>
            </Link>
            <Typography
              variant="small"
              color="blue-gray"
              className="font-normal"
            >
              { page }
            </Typography>
          </Breadcrumbs> */}
          {/* <Typography variant="h6" color="blue-gray">
            { page }
          </Typography> */}
        </div>
        <div className="flex items-center">
          <div className="mr-auto md:mr-4 md:w-56">
            {/* <Input label="Type here" /> */}
          </div>
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-6 w-6 text-blue-gray-500" />
          </IconButton>
          {/* <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => setOpenConfigurator(dispatch, true)}
          >
            <Cog6ToothIcon className="h-5 w-5 text-blue-gray-500" />
          </IconButton> */}
          {/* <Menu>
            <MenuHandler>
              <IconButton variant="text" color="blue-gray">
                <BellIcon className="h-5 w-5 text-blue-gray-500" />
              </IconButton>
            </MenuHandler>
            <MenuList className="w-max border-0">
              <MenuItem className="flex items-center gap-3">
                <Avatar
                  src="https://demos.creative-tim.com/material-dashboard/assets/img/team-2.jpg"
                  alt="item-1"
                  size="sm"
                  variant="circular"
                />
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-1 font-normal"
                  >
                    <strong>New message</strong> from Laur
                  </Typography>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center gap-1 text-xs font-normal opacity-60"
                  >
                    <ClockIcon className="h-3.5 w-3.5" /> 13 minutes ago
                  </Typography>
                </div>
              </MenuItem>
              <MenuItem className="flex items-center gap-4">
                <Avatar
                  src="https://demos.creative-tim.com/material-dashboard/assets/img/small-logos/logo-spotify.svg"
                  alt="item-1"
                  size="sm"
                  variant="circular"
                />
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-1 font-normal"
                  >
                    <strong>New album</strong> by Travis Scott
                  </Typography>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center gap-1 text-xs font-normal opacity-60"
                  >
                    <ClockIcon className="h-3.5 w-3.5" /> 1 day ago
                  </Typography>
                </div>
              </MenuItem>
              <MenuItem className="flex items-center gap-4">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-blue-gray-800 to-blue-gray-900">
                  <CreditCardIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-1 font-normal"
                  >
                    Payment successfully completed
                  </Typography>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center gap-1 text-xs font-normal opacity-60"
                  >
                    <ClockIcon className="h-3.5 w-3.5" /> 2 days ago
                  </Typography>
                </div>
              </MenuItem>
            </MenuList>
          </Menu> */}
          <Menu>
            <MenuHandler>
              <IconButton
                variant="text"
                color="blue-gray"
                className="items-center gap-1 px-4 xl:flex"
              >
                <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
              </IconButton>
            </MenuHandler>
            <MenuList className="w-max border-0">
              <MenuItem className="flex items-center gap-3">
                <Link href="/profile" className="inline-flex items-center text-none">
                  <IconButton
                    variant="text"
                    color="blue-gray"
                    className="items-center gap-1 px-4 xl:flex"
                  >
                    <UserCircleIcon className="h-5 w-5 text-red-gray-500" />
                  </IconButton>
                  Profil
                </Link>
              </MenuItem>
              <MenuItem className="flex items-center gap-3">
                <Link href="#" className="inline-flex items-center text-none text-red-800 bold" onClick={signOutHandler}>
                  <IconButton
                    variant="text"
                    color="red"
                    className="items-center gap-1 px-4 xl:flex"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-800" />
                  </IconButton>
                  Déconnecter
                </Link>
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "../../dashboard-navbar.tsx";

export default DashboardNavbar;
