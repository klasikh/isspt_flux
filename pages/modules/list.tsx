// /pages/index.tsx
import React, { Fragment, useRef, useState } from 'react'
import Head from "next/head";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import type { Link as Node } from "@prisma/client";
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, useSession } from "next-auth/react";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import PaginationNew from "../../components/PaginationNew";

import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Progress,
} from "@material-tailwind/react";
import { EllipsisVerticalIcon, EyeIcon, PencilIcon, TrashIcon, } from "@heroicons/react/24/outline";

const DeleteModuleMutation = `
  mutation($id: ID!, $userId: ID!,) {
    deleteModule(id: $id, userId: $userId,) {
      id
    }
  }
`

const DeleteUserModuleMutation = `
  mutation($id: ID!, $userId: ID!,) {
    deleteUserModulePriority(id: $id, userId: $userId,) {
      id
    }
  }
`
const ModulesList = ({ modules, usersModuleProperties }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const router = useRouter();

    const {data:session}=useSession()
    const theUserSession = session;

    const [isValidateLoading, setIsValidateLoading] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [openDeletionModal, setOpenDeletionModal] = useState(false)
    const [moduleToDel, setModuleToDel] = useState()

    const cancelRejectButtonRef = useRef(null)
    const cancelDeletionButtonRef = useRef(null)

    const [isUsValidateLoading, setIsUsValidateLoading] = useState(false);
    const [isUsDeleteLoading, setIsUsDeleteLoading] = useState(false);
    const [openUsDeletionModal, setOpenUsDeletionModal] = useState(false)
    const [userModuleToDel, setUserModuleToDel] = useState()

    const cancelUsRejectButtonRef = useRef(null)
    const cancelUsDeletionButtonRef = useRef(null)

    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage] = useState(10);
  
    // Get current posts
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = modules.slice(indexOfFirstPost, indexOfLastPost);

    // Change page
    const paginate = (pageNumber: any) => setCurrentPage(pageNumber);

    // SCRIPT FOR USER MODULE PRIORITIES
    const [currentPageUs, setCurrentPageUs] = useState(1);
    const [postsPerPageUs] = useState(10);
  
    // Get current posts
    const indexOfLastPostUs = currentPageUs * postsPerPageUs;
    const indexOfFirstPostUs = indexOfLastPostUs - postsPerPageUs;
    const currentPostsUs = usersModuleProperties.slice(indexOfFirstPostUs, indexOfLastPostUs);

    // Change page
    const paginateUs = (pageNumberUs: any) => setCurrentPageUs(pageNumberUs);

    const deleteClickModule = (theModule: any) => {
      setModuleToDel(theModule)
      setOpenDeletionModal(true)
    }

    const deleteClickUserModule = (theUserModule: any) => {
      setUserModuleToDel(theUserModule)
      setOpenUsDeletionModal(true)
    }

    const delModule = async () => {
      setIsDeleteLoading(true);
      const variables = { id: moduleToDel, userId: session?.user.id, }
      try {

        const theDeletedModule =  await axios.post('/api/graphql', {
                                        "query": DeleteModuleMutation,
                                        "variables" : variables
                                        },
                                    { headers: { 'Content-Type': 'application/json' } }
                                    );

        if(theDeletedModule?.data.errors) {
          toast.error(`${theDeletedModule?.data.errors[0].extensions.originalError.message}`)
          setIsValidateLoading(false);
        } else {
          toast.success('Module supprimé avec succès!🎉');
          router.reload()
          setIsDeleteLoading(false);
          setOpenDeletionModal(false)
        }
        setIsDeleteLoading(false);
        setOpenDeletionModal(false);

      } catch (error) {
        console.error(error)
      }
    }

    const delUserModule = async () => {
      setIsUsDeleteLoading(true);
      const variables = { id: userModuleToDel, userId: session?.user.id, }
      try {

        const theDeletedUserModule =  await axios.post('/api/graphql', {
                                        "query": DeleteUserModuleMutation,
                                        "variables" : variables
                                        },
                                    { headers: { 'Content-Type': 'application/json' } }
                                    );

        if(theDeletedUserModule?.data.errors) {
          toast.error(`${theDeletedUserModule?.data.errors[0].extensions.originalError.message}`)
          setIsUsValidateLoading(false);
        } else {
          toast.success('Privilège sur module supprimé avec succès!🎉');
          router.reload()
          setIsUsDeleteLoading(false);
          setOpenUsDeletionModal(false)
        }
        setIsUsDeleteLoading(false);
        setOpenUsDeletionModal(false);

      } catch (error) {
        console.error(error)
      }
    }

  return (
    <div>
      <Head>
        <title>Liste des modules</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto max-w-5xl mt-7">
        <div className="mb-12">
          <Link href="/modules/add">
            <Button variant="outlined" size="sm" className="bg-[#bb303b] text-white hover:text-[#1a1930]">
              Ajouter un module
            </Button>
          </Link>
          <Link href="/modules/attribute">
            <Button variant="outlined" size="sm" className="bg-[#bb303b] text-white hover:text-[#1a1930] float-right">
              Attribuer un module
            </Button>
          </Link>
        </div>
        <div className="mt-12">
          <Card>
            <CardHeader variant="gradient" color="" className="bg-[#1a1930] mb-8 p-6">
              <Typography variant="h6" color="white">
                Modules ({modules.length})
              </Typography>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["nom", "description", "action",].map(
                      (el) => (
                        <th
                          key={el}
                          className="border-b border-blue-gray-50 py-3 px-5 text-left"
                        >
                          <Typography
                            variant="small"
                            className="text-[11px] font-bold uppercase text-blue-gray-400"
                          >
                            {el}
                          </Typography>
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  { currentPosts.map((node: any) => (
                        <tr key={node.id}>
                          <td className={`py-3 px-5`}>
                            <div className="flex items-center gap-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-bold"
                              >
                                {node.name}
                              </Typography>
                            </div>
                          </td>
                          <td className={`py-3 px-5`}>
                            <Typography
                              variant="small"
                              className="text-xs font-medium text-blue-gray-600"
                            >
                              {
                                node.description.length > 30
                                ? node.description.substr(0, 30) + '...'
                                : node.description
                              }
                            </Typography>
                          </td>
                          <td className={`py-3 px-5`}>
                             <Typography
                              className="text-xs font-semibold text-blue-gray-600"
                            >
                              <Link href={`/modules/${node.id}`}>
                                <IconButton variant="text" color="white" className="text-sm bg-gray-600 hover:bg-gray-400">
                                  <EyeIcon className="h-5 w-5 text-white-500" />
                                </IconButton>
                              </Link>
                              <Link href={`/modules/edit/${node.id}`}>
                                <IconButton variant="text" color="white" className="text-sm bg-blue-600 hover:bg-blue-400 mx-3">
                                  <PencilIcon className="h-5 w-5 text-white-500" />
                                </IconButton>
                              </Link>
                              <Link href={`#`} onClick={() => deleteClickModule(node.id)}>
                                <IconButton variant="text" color="white" className="text-sm bg-red-600 hover:bg-red-400">
                                  <TrashIcon className="h-5 w-5 text-white-500" />
                                </IconButton>
                              </Link>
                            </Typography>
                          </td>
                        </tr>
                    )
                  )}
                </tbody>
              </table>
              <PaginationNew
                postsPerPage={postsPerPage}
                totalPosts={modules.length}
                paginate={paginate}
                currentPage={currentPage}
              />
            </CardBody>
          </Card>
        </div>

        <div className="mt-20">
          <Card>
            <CardHeader variant="gradient" color="" className="bg-[#1a1930]  mb-8 p-6">
              <Typography variant="h6" color="white">
                Modules attribués ({usersModuleProperties.length})
              </Typography>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["utilisateur", "module", "privilège", "action",].map(
                      (el) => (
                        <th
                          key={el}
                          className="border-b border-blue-gray-50 py-3 px-5 text-left"
                        >
                          <Typography
                            variant="small"
                            className="text-[11px] font-bold uppercase text-blue-gray-400"
                          >
                            {el}
                          </Typography>
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  { usersModuleProperties.map((node: any) => (
                        <tr key={node.id}>
                          <td className={`py-3 px-5`}>
                            <div className="flex items-center gap-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-bold"
                              >
                                {node.user.name}
                              </Typography>
                            </div>
                          </td>
                          <td className={`py-3 px-5`}>
                            <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-bold"
                              >
                                {node.module.name}
                              </Typography>
                          </td>
                          <td className={`py-3 px-5`}>
                            <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-bold"
                              >
                                {
                                  node.priority === "NONE"
                                    ? "Aucun"
                                    : node.priority === "CREATE"
                                    ? "Créer seul"
                                    : node.priority === "READ"
                                    ? "Lire seul"
                                    : node.priority === "UPDATE"
                                    ? "Modifier seul"
                                    : node.priority === "DELETE"
                                    ? "Supprimer seul"
                                    : node.priority === "CREATE_READ"
                                    ? "Créer, lire"
                                    : node.priority === "C_READ_UPDATE"
                                    ? "Créer, lire, modifier"
                                    : node.priority === "C_READ_DELETE"
                                    ? "Créer, lire, supprimer"
                                    : node.priority === "R_UPDATE_DELETE"
                                    ? "Lire, modifier, supprimer"
                                    : node.priority === "C_R_UPDATE_DELETE"
                                    ? "Tous les privilèges"
                                    : ""
                                }
                              </Typography>
                          </td>
                          <td className={`py-3 px-5`}>
                             <Typography
                              className="text-xs font-semibold text-blue-gray-600"
                            >
                              <Link href={`/modules/attribute/edit/${node.id}`}>
                                <IconButton variant="text" color="white" className="text-sm bg-blue-600 hover:bg-blue-400 mx-3">
                                  <PencilIcon className="h-5 w-5 text-white-500" />
                                </IconButton>
                              </Link>
                              <Link href={`#`} onClick={() => deleteClickUserModule(node.id)}>
                                <IconButton variant="text" color="white" className="text-sm bg-red-600 hover:bg-red-400">
                                  <TrashIcon className="h-5 w-5 text-white-500" />
                                </IconButton>
                              </Link>
                            </Typography>
                          </td>
                        </tr>
                    )
                  )}
                </tbody>
              </table>
              <PaginationNew
                postsPerPage={postsPerPageUs}
                totalPosts={usersModuleProperties.length}
                paginate={paginateUs}
                currentPage={currentPageUs}
              />
            </CardBody>
          </Card>
        </div>


        <Transition.Root show={openDeletionModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" initialFocus={cancelDeletionButtonRef} onClose={setOpenDeletionModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                          <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                            Suppression
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-700">
                              Êtes-vous sûr(e) de vouloir supprimer ce module ?
                            </p>
                            <p className="text-sm text-red-600">
                              Notez bien que cette action est irréversible et pourra compremettre les données existantes.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                        onClick={() => delModule()}
                      >
                        {isDeleteLoading ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="w-6 h-6 animate-spin mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                            </svg>
                            Suppression...
                          </span>
                        ) : (
                          <span className="font-bold">Confirmer la suppression</span>
                        )}
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={() => setOpenDeletionModal(false)}
                        ref={cancelDeletionButtonRef}
                      >
                        Annuler
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        <Transition.Root show={openUsDeletionModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" initialFocus={cancelUsDeletionButtonRef} onClose={setOpenUsDeletionModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                          <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                            Suppression
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-700">
                              Êtes-vous sûr(e) de vouloir supprimer ce privilège de module sur cet utilisateur ?
                            </p>
                            <p className="text-sm text-red-600">
                              Notez bien que cette action est irréversible et pourra compremettre les données existantes.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                        onClick={() => delUserModule()}
                      >
                        {isUsDeleteLoading ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="w-6 h-6 animate-spin mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                            </svg>
                            Suppression...
                          </span>
                        ) : (
                          <span className="font-bold">Confirmer la suppression</span>
                        )}
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={() => setOpenUsDeletionModal(false)}
                        ref={cancelUsDeletionButtonRef}
                      >
                        Annuler
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>

      </div>
    </div>
  );
}

export default ModulesList;

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
    select: {
      username: true,
      role: true,
    },
    where: {
      username: session.user?.username,
    },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return {
      redirect: {
        permanent: false,
        destination: '/dashboard',
      },
      props: {},
    };
  }

  const modules = await prisma.module.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const usersModuleProperties = await prisma.userModulePriority.findMany({
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          username: true,
        }
      },
      moduleId: true,
      module: {
        select: {
          id: true,
          name: true,
        }
      },
      priority: true
    },
    orderBy: { createdAt: "desc" },
  })

  if (!modules) return {
    notFound: true
  }

  if (!usersModuleProperties) return {
    notFound: true
  }

  return {
    props: {
      modules,
      usersModuleProperties,
    },
  };
};
