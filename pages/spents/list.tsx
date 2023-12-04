// /pages/index.tsx
import React, { Fragment, useRef, useState } from 'react'
import Head from "next/head";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import type { Link as Node } from "@prisma/client";
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, useSession } from "next-auth/react";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from "next/navigation";
import Link from "next/link";
// import { useUser } from "@auth0/nextjs-auth0/client";
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

const DeleteSpentMutation = gql`
  mutation($id: ID!, $userId: ID!,) {
    deleteSpent(id: $id, userId: $userId,) {
      id
    }
  }
`

const SpentsList = ({ spents }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
/*
  const { data, loading, error, fetchMore } = useQuery(AllSpentsQuery, {
    variables: { first: 10 },
  });

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Oh no... {error.message}</p>;

  const { endCursor, hasNextPage } = data?.spents.pageInfo;*/

  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const [openDeletionModal, setOpenDeletionModal] = useState(false)

  const cancelDeletionButtonRef = useRef(null)

  const {data:session}=useSession()
  const theUserSession = session;

  const [deleteSpent, { data: dataDelSpent, loading: loadDelSpent, error: errorDelSpent }] = useMutation(DeleteSpentMutation)

  const deleteClickSpent = () => {
    setOpenDeletionModal(true)
  }

  const delSpent = async (spentId) => {
    setIsDeleteLoading(true);
    const variables = { id: spentId, userId: session?.user?.id, }
    try {
      const theValidatedSpent = await toast.promise(deleteSpent({ variables }), {
        loading: 'Opération en cours..',
        success: 'Dépense approuvée avec succès!🎉',
        error: `Une erreur s'est produite 😥 Veuillez re-essayer SVP - ${error}`,
      })

      if(theValidatedSpent.data.validSpent) {
        router.push(`/spents/list`)
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
        <title>Liste des dépenses</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto max-w-5xl mt-7">
        <div className="mb-12">
          <Link href="/spents/add">
            <Button variant="outlined" size="sm" className="bg-blue-500 hover:text-white">
              Ajouter une dépense
            </Button>
          </Link>
        </div>
        <div className="mt-12">
          <Card>
            <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
              <Typography variant="h6" color="white">
                Liste des dépenses ({spents.length})
              </Typography>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["titre", "nom de l'étudiant", "motif", "montant", "status", "action",].map(
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
                  { spents.map((node) => (
                        <tr key={node.id}>
                          <td className={`py-3 px-5`}>
                            <div className="flex items-center gap-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="text-xs font-medium text-blue-gray-600"
                              >
                                {node.title}
                              </Typography>
                            </div>
                          </td>
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
                            <div className="flex items-center gap-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-bold"
                              >
                                {node.motif}
                              </Typography>
                            </div>
                          </td>
                          <td className={`py-3 px-5`}>
                            <div className="flex items-center gap-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-bold"
                              >
                                {node.amount}
                              </Typography>
                            </div>
                          </td>
                          <td className={`py-3 px-5`}>
                            <div className="flex items-center gap-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="text-xs font-medium text-blue-gray-600"
                              >
                                <span className={
                                    node.status === "CREATED"
                                    ? "inline-block bg-gray-400 rounded-full px-3 py-1 text-xs font-semibold text-gray-900 mr-2 mb-2"
                                    : node.status === "CANCELED"
                                    ? "inline-block bg-black rounded-full px-3 py-1 text-xs font-semibold text-white mr-2 mb-2"
                                    : node.status === "ONPROCESS"
                                    ? "inline-block bg-yellow-500 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2 mb-2"
                                    : node.status === "APPROVED"
                                    ? "inline-block bg-green-500 rounded-full px-3 py-1 text-xs font-semibold text-white mr-2 mb-2"
                                    : node.status === "REJECTED"
                                    ? "inline-block bg-red-500 rounded-full px-3 py-1 text-xs font-semibold text-white mr-2 mb-2"
                                    : ""
                                  }
                                >
                                  {
                                    node.status === "CREATED"
                                    ? "En attente"
                                    : node.status === "CANCELED"
                                    ? "Annuler"
                                    : node.status === "ONPROCESS"
                                    ? "Traitement..."
                                    : node.status === "APPROVED"
                                    ? "Approuvée"
                                    : node.status === "REJECTED"
                                    ? "Rejetée"
                                    : ""
                                  }
                                </span>
                              </Typography>
                            </div>
                          </td>
                          <td className={`py-3 px-5`}>
                             <Typography
                              className="text-xs font-semibold text-blue-gray-600"
                             >
                              <Link href={`/spents/${node.id}`} alt="Voir">
                                <IconButton variant="text" color="white" className="text-sm bg-gray-600 hover:bg-gray-400">
                                  <EyeIcon className="h-5 w-5 text-white-500" />
                                </IconButton>
                              </Link>
                              {
                                ((node.status === "CREATED" || node.status === "CANCELED"|| node.status === "REJECTED") && node.addedBy === theUserSession?.user?.id)
                                ?
                                  (
                                    <Link href={`/spents/edit/${node.id}`}>
                                      <IconButton variant="text" color="white" className="text-sm bg-blue-600 hover:bg-blue-400 mx-3">
                                        <PencilIcon className="h-5 w-5 text-white-500" />
                                      </IconButton>
                                    </Link>
                                  )
                                : (node.status === "CREATED" || node.status === "CANCELED")
                                ? (
                                    <Link href="#">
                                      <IconButton variant="text" color="white" className="text-sm bg-red-600 hover:bg-red-400">
                                        <TrashIcon className="h-5 w-5 text-white-500" />
                                      </IconButton>
                                    </Link>
                                  )
                                : ""
                              }
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

      </div>
    </div>
  );
}

export default SpentsList;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: '/api/auth/login',
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
        destination: '/404',
      },
      props: {},
    };
  }

  const spents = await prisma.spent.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      name: true,
      nature: true,
      motif: true,
      amount: true,
      step: true,
      status: true,
      rejectMotif: true,
      isNotified: true,
      createdYear: true,
      addedBy: true,
      fromId: true,
      toId: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!spents) return {
    notFound: true
  }

  const getUserPriorities = await prisma.userModulePriority.findMany({
    where: {
      userId: user.id,
      module: {
        name: "FACTURATION"
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

  if(getUserPriorities[0] && getUserPriorities[0]?.module?.name === "FACTURATION") {
    if(getUserPriorities[0].priority !== "READ" && getUserPriorities[0].priority !== "CREATE_READ" && getUserPriorities[0].priority !== "C_READ_UPDATE" && getUserPriorities[0].priority !== "C_READ_DELETE" && getUserPriorities[0].priority !== "C_R_UPDATE_DELETE" && getUserPriorities[0].priority !== "R_UPDATE_DELETE") {

      toast.error("Vous n'avez pas les permissions requises pour effectuer cette action.");
      return {
        redirect: {
          permanent: false,
          destination: '/dashboard',
        },
        props: {},
      };
    }

  } else {

    toast.error("Vous n'avez aucune priorité sur ce module")
    return {
      redirect: {
        permanent: false,
        destination: '/dashboard',
      },
      props: {},
    };
  }

  return {
    props: {
      spents,
    },
  };

};
