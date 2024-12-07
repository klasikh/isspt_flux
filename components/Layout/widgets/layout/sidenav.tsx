import { useState } from "react";
import PropTypes from "prop-types";
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSession, useSession } from "next-auth/react"
import toast, { Toaster } from 'react-hot-toast';
import { XMarkIcon, LifebuoyIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
  Avatar,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "../../../context";

interface ControllerType {
  sidenavColor: any; // Remplacez le type par le type approprié
  sidenavType: any; // Remplacez le type par le type approprié
  openSidenav: any; // Remplacez le type par le type approprié
  // Ajoutez d'autres propriétés si nécessaire
}

function Icon({ id, open }: { id: any, open: any }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={`${id === open ? "rotate-180" : ""} h-5 w-5 transition-transform`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}
const Sidenav = ({ user, routes, proformaVar }: InferGetServerSidePropsType<typeof getServerSideProps>) => {

  const location = usePathname();
  // console.log(proformaVar)
  
  const [open, setOpen] = useState(0);
 
  const handleOpen = (value: any) => setOpen(open === value ? 0 : value);

  const {controller, dispatch} = useMaterialTailwindController() as any;

  const { sidenavColor, sidenavType, openSidenav } = controller;
  const sidenavTypes = {
    dark: "bg-[#1a1930]",
    white: "bg-white shadow-lg",
    transparent: "bg-transparent",
  };

  const {data:session}=useSession()
  const theUserSession = session;

  return (
    <aside
      className={`bg-[#1a1930] ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 overflow-y-scroll`}
    >
      <div
        className={`relative border-b ${
          sidenavType === "dark" ? "border-white/20" : "border-blue-gray-50"
        }`}
      >
        <Link href="/" className="flex items-center gap-4 py-6 px-8">
          <img src="/images/logo.png" alt="" className="h-12 rounded" />
          <Typography
            variant="h6"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
          >
            ISSPT
          </Typography>
        </Link>
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
      </div>
      <Link href={`/dashboard`}>
          <Button
            variant="gradient"
            className={
              "flex items-center gap-2 px-3 mx-3 mt-2 bg-none hover:bg-gray-300 hover:text-black " +
              (location === "/dashboard"
                ? " bg-blue-500"
                : ""
              )
            }
            style={{ width: "90%" }}
          >
            <LifebuoyIcon className="w-6 h-6 text-white hover:text-black" />
            <Typography
              color="inherit"
              className="font-medium text-sm"
            >
              Tableau de bord
            </Typography>
          </Button>
      </Link>
      <div className="m-2">
        {routes.map(({ layout, title, pages, role, number }: { layout: any, title: any, pages: any, role: any, number: any }, key: any) => (
              
            <Accordion 
              key={number} 
              open={open === number}
              icon={<Icon id={number} open={open} />}
              className="mb-2 rounded-lg border border-blue-gray-100 px-4"
            >
              {title && (
                <AccordionHeader 
                  className={`text-white text-md border-b-0 transition-colors uppercase hover:!text-white ${
                    open === number ? "text-[#bb303b]" : ""
                  }`}
                  onClick={() => handleOpen(number)}
                >
                  {title}
                </AccordionHeader>
              )}
              {pages && pages.map(({ icon, name, path, module }: { icon: any, name: any, path: any, module: any }) => (

                      <AccordionBody className="pt-0">
                        <Link href={`${path}`}>
                          <Button
                            variant="gradient"
                            className={
                              "flex items-center gap-2 text-sm px-3 mx-1 bg-none -mb-3 hover:bg-gray-300 hover:text-black " +
                              (location === `${path}`
                                ? " bg-[#cb6e35]"
                                : ""
                              )
                            }
                            style={{ width: "97%" }}
                          >
                            {icon}
                            <Typography
                              color="inherit"
                              className="font-medium text-xs"
                            >
                              {name}
                            </Typography>
                          </Button>
                        </Link>
                      </AccordionBody>
                        
              ))}
            </Accordion>
        ))}
      </div>
      <Link href={`/profile`}>
          <Button
            variant="gradient"
            className={
              "flex items-center gap-2 px-3 mx-3 mt-2 bg-none hover:bg-gray-300 hover:text-black " +
              (location === "/profile"
                ? " bg-blue-500"
                : ""
              )
            }
            style={{ width: "90%" }}
          >
            <UserCircleIcon className="w-6 h-6 text-white hover:text-black" />
            <Typography
              color="inherit"
              className="font-medium text-sm"
            >
              Profil
            </Typography>
          </Button>
      </Link>
    </aside>
  );
}

export default Sidenav;

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

  if (!user || (user?.role !== "USER" && user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN")) {
    return {
      redirect: {
        permanent: false,
        destination: '/dashboard',
      },
      props: {},
    };
  }
  
  const getUserProformaProp = await prisma.userModulePriority.findMany({
    where: {
      userId: user.id,
      module: {
        name: "PROFORMA"
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

  let proformaVar = false;
  if(getUserProformaProp[0] && getUserProformaProp[0]?.module?.name === "PROFORMA") {
    if(getUserProformaProp[0].priority !== "READ" && getUserProformaProp[0].priority !== "CREATE_READ" && getUserProformaProp[0].priority !== "C_READ_UPDATE" && getUserProformaProp[0].priority !== "C_READ_DELETE" && getUserProformaProp[0].priority !== "C_R_UPDATE_DELETE" && getUserProformaProp[0].priority !== "R_UPDATE_DELETE") {
      proformaVar = true;
    }

  } else {
    proformaVar = false;
  }

  return {
    props: {
      proformaVar,
      user
    },
  };
};
