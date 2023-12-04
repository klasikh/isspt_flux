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

const DeleteFiliereMutation = `
  mutation($id: ID!, $userId: ID!,) {
    deleteFiliere(id: $id, userId: $userId,) {
      id
    }
  }
`

const FilieresList = ({ filieres }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const router = useRouter();

    const {data:session}=useSession()
    const theUserSession = session;

    const [isValidateLoading, setIsValidateLoading] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [openDeletionModal, setOpenDeletionModal] = useState(false)
    const [filiereToDel, setFiliereToDel] = useState()

    const cancelRejectButtonRef = useRef(null)
    const cancelDeletionButtonRef = useRef(null)

    const deleteClickFiliere = (theFiliere) => {
      setFiliereToDel(theFiliere)
      setOpenDeletionModal(true)
    }

    const delFiliere = async () => {
      setIsDeleteLoading(true);
      const variables = { id: filiereToDel, userId: session?.user.id, }
      try {

        const theDeletedFiliere =  await axios.post('/api/graphql', {
                                        "query": DeleteFiliereMutation,
                                        "variables" : variables
                                        },
                                    { headers: { 'Content-Type': 'application/json' } }
                                    );

        if(theDeletedFiliere?.data.errors) {
          toast.error(`${theDeletedFiliere?.data.errors[0].extensions.originalError.message}`)
          setIsValidateLoading(false);
        } else {
          toast.success('Filière supprimée avec succès!🎉');
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


    return (
      <div>
        <Head>
          <title>Liste des filieres</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="container mx-auto max-w-5xl mt-7">
          <div className="mb-12">
            <Link href="/filieres/add">
              <Button variant="outlined" size="sm" className="bg-blue-500 hover:text-white">
                Ajouter une filière
              </Button>
            </Link>
          </div>
          <div className="mt-12">
            <Card>
              <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
                <Typography variant="h6" color="white">
                  Filière ({filieres.length})
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
                    { filieres.map((node) => (
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
                                <Link href={`/filieres/${node.id}`}>
                                  <IconButton variant="text" color="white" className="text-sm bg-gray-600 hover:bg-gray-400">
                                    <EyeIcon className="h-5 w-5 text-white-500" />
                                  </IconButton>
                                </Link>
                                <Link href={`/filieres/edit/${node.id}`}>
                                  <IconButton variant="text" color="white" className="text-sm bg-blue-600 hover:bg-blue-400 mx-3">
                                    <PencilIcon className="h-5 w-5 text-white-500" />
                                  </IconButton>
                                </Link>
                                <Link href={`#`} onClick={() => deleteClickFiliere(node.id)}>
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
                                Êtes-vous sûr(e) de vouloir supprimer cette filière ?
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
                          onClick={() => delFiliere()}
                        >
                          Confirmer la suppression
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
        </div>
      </div>
    );
}

export default FilieresList;

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
        destination: '/404',
      },
      props: {},
    };
  }

  const filieres = await prisma.filiere.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!filieres) return {
    notFound: true
  }

  return {
    props: {
      filieres,
    },
  };
};
