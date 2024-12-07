import React, { Fragment, useRef, useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon, ArrowLeftIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline'
import prisma from '../../lib/prisma';
import Link from "next/link";
import { gql, useMutation } from '@apollo/client';
import { getSession, useSession } from "next-auth/react";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from "next/navigation";
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import axios from "axios";

type FormValues = {
  id: string;
  rejectMotif: string;
  userId: string;
  status: string;
  step: string;
}

const SendSpentMutation = gql`
  mutation ($id: ID!, $userId: ID!, $title: String!, $name: String!, $motif: String!, $nature: String!, $amount: String!, $createdYear: String!,) {
    sendSpent(id: $id, userId: $userId, title: $title, name: $name, motif: $motif, nature: $nature, amount: $amount, createdYear: $createdYear,) {
      title
      description
      name
      motif
      nature
      amount
      createdYear
    }
  }
`;

const RejectSpentMutation = `
  mutation($id: ID!, $rejectMotif: String!, $userId: ID!, $status: String!, $step: String!) {
    rejectSpent(id: $id, rejectMotif: $rejectMotif, userId: $userId, status: $status, step: $step,) {
      id
      title
      description
      name
      motif
      nature
      amount
      step
      createdYear
      addedBy
    }
  }
`

const ValidSpentMutation = `
  mutation($id: ID!, $userId: ID!, $status: String!, $step: String!) {
    validSpent(id: $id, userId: $userId, status: $status, step: $step,) {
      id
      title
      description
      name
      motif
      nature
      amount
      step
      createdYear
      addedBy
    }
  }
`

const DeleteSpentMutation = `
  mutation($id: ID!, $userId: ID!,) {
    deleteSpent(id: $id, userId: $userId,) {
      id
    }
  }
`

const Spent = ({ spent, spentVar }: InferGetServerSidePropsType<typeof getServerSideProps>) => {

  const router = useRouter();

  const [isSendLoading, setIsSendLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isValidateLoading, setIsValidateLoading] = useState(false);
  const [isRejectLoading, setIsRejectLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const [openRejectModal, setOpenRejectModal] = useState(false)
  const [openDeletionModal, setOpenDeletionModal] = useState(false)

  const cancelRejectButtonRef = useRef(null)
  const cancelDeletionButtonRef = useRef(null)

  const {data:session}=useSession()
  const theUserSession = session;

  const [sendSpent] = useMutation(SendSpentMutation);

//   const [rejectSpent, { data, loading, error }] = useMutation(RejectSpentMutation)

  // const [validSpent, { data: dataValSpent, loading: loadValSpent, error: errorValSpent }] = useMutation(ValidSpentMutation)

//   const [deleteSpent, { data: dataDelSpent, loading: loadDelSpent, error: errorDelSpent }] = useMutation(DeleteSpentMutation)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ mode: 'onBlur' });

  const sendTSpent = async () => {
    setIsSendLoading(true);
    const sendTheSpent = await toast.promise(sendSpent({ variables: { id: spent.id, userId: theUserSession?.user.id, title: spent.title, name: spent.name, motif: spent.motif, nature: spent.nature, amount: spent.amount, createdYear: spent.createdYear } }), {
      loading: 'Envoi en cours',
      success: 'Envoyée avec succès! 🎉',
      error: `Désolé, une erreur s'est produite 😥`,
    });

    if(sendTheSpent?.data.sendSpent) {
      router.push(`/spents/list`);
      setIsSendLoading(false);
    }
    setIsSendLoading(false);
  };

  const editSpent = () => {
    setIsEditLoading(true);
    router.push(`/spents/edit/${spent.id}`)
  }

  const deleteClickSpent = () => {
    setOpenDeletionModal(true)
  }

  const rejectClickSpent = () => {
    setOpenRejectModal(true)
  }

  const onRejectSubmit: SubmitHandler<FormValues> = async (data) => {
    const { id, rejectMotif, userId, status, step, } = data

    const theStep = "0";
    const theStatus = "REJECTED";

    const variables = { id: spent.id, rejectMotif, userId: session?.user.id, status: theStatus, step: theStep }
    try {
      setIsRejectLoading(true)
      const theRejectedSpent = await axios.post('/api/graphql',                                   {
                                       "query": RejectSpentMutation,
                                       "variables" : variables
                                      },
                                   { headers: { 'Content-Type': 'application/json' } }
                                  );

      if(theRejectedSpent?.data.errors) {
        toast.error(`${theRejectedSpent?.data.errors[0].extensions.originalError.message}`)
        setOpenRejectModal(false);
        setIsRejectLoading(false)
      } else {
        toast.success('Dépense rejetée avec succès!🎉');
        if(theRejectedSpent.data.data.rejectSpent) {
          setIsRejectLoading(false)
          setOpenRejectModal(false);
          router.push(`/spents/list`)
        }
        setIsRejectLoading(false)
        setOpenRejectModal(false);
      }

    } catch (error) {
      console.error(error)
    }
  }

  const validateSpent = async () => {
    setIsValidateLoading(true);
    const theStep = "2";
    const theStatus = "APPROVED";

    const variables = { id: spent.id, userId: session?.user.id, status: theStatus, step: theStep }
    try {

      // const theValidatedSpent = await toast.promise(validSpent({ variables }), {
      //    loading: 'Opération en cours..',
      //    success: 'Dépense approuvée avec succès!🎉',
      //    error: `Une erreur s'est produite 😥 Veuillez re-essayer SVP - ${errors}`,
      // })

      const theValidatedSpent = await axios.post('/api/graphql',                                   {
                                       "query": ValidSpentMutation,
                                       "variables" : variables
                                      },
                                   { headers: { 'Content-Type': 'application/json' } }
                                  );

      if(theValidatedSpent?.data.errors) {
        toast.error(`${theValidatedSpent?.data.errors[0].extensions.originalError.message}`)
        setIsValidateLoading(false);
      } else {
        toast.success('Dépense approuvée avec succès!🎉');
        if(theValidatedSpent.data.data.validSpent) {
          setIsValidateLoading(false);
          router.push(`/spents/list`)
        }
        setIsValidateLoading(false);
      }

    } catch (error) {
      console.error(error)
    }
  }

  const delSpent = async () => {
    setIsDeleteLoading(true);
    const variables = { id: spent.id, userId: session?.user.id, }
    try {
//       const theValidatedSpent = await toast.promise(deleteSpent({ variables }), {
//         loading: 'Opération en cours..',
//         success: 'Dépense supprimée avec succès!🎉',
//         error: `Une erreur s'est produite 😥 Veuillez re-essayer SVP - ${error}`,
//       })

      const theDeletedSpent =  await axios.post('/api/graphql',                                   {
                                       "query": DeleteSpentMutation,
                                       "variables" : variables
                                      },
                                   { headers: { 'Content-Type': 'application/json' } }
                                  );

      if(theDeletedSpent?.data.errors) {
        toast.error(`${theDeletedSpent?.data.errors[0].extensions.originalError.message}`)
        setIsValidateLoading(false);
      } else {
        toast.success('Dépense supprimée avec succès!🎉');
        setIsDeleteLoading(false);
        setOpenDeletionModal(false)
        router.push(`/spents/list`)
      }
      setIsDeleteLoading(false);
      setOpenDeletionModal(false);

    } catch (error) {
      console.error(error)
    }
  }


  return (
    <div>
      <div className="container mx-auto px-8 mt-10">
        <Toaster />
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-500 text-white font-bold px-4 py-2 mb-6 rounded-md hover:bg-gray-600 flex"
        >
          <ArrowLeftIcon className="h-6 w-6 text-white font-bold mr-2" aria-hidden="true" />
          Retour
        </button>
        <h1 className="text-2xl font-bold mb-3 uppercase text-center">Informations de la dépense</h1>
        <div className="w-full bg-white rounded overflow-hidden shadow-lg">
          <div className="px-6 py-4">
            <div className="font-bold text-xl mb-4 block bg-gray-600 p-1 text-white">Titre: {spent.title}</div>
            <div className="font-bold text-xl block bg-gray-600 p-1 text-white">Description</div>
            <div className="text-gray-700 mb-4 text-base block bg-gray-300 p-2">
              <span>{spent.description}</span>
            </div>
            <div className="flex gap-x-4">
              <div className="md:w-1/2 sm:w-full sm:block">
                <div className="font-bold text-xl bg-gray-600 p-1 text-white">Nom du matériel</div>
                <div className="text-gray-700 mb-4 text-base bg-gray-300 p-2">
                  <span>{spent.name}</span>
                </div>
              </div>
              <div className="md:w-1/2 sm:w-full sm:block">
                <div className="font-bold text-xl bg-gray-600 p-1 text-white">Nature de la dépense</div>
                <div className="text-gray-700 mb-4 text-base bg-gray-300 p-2">
                  <span>{spent.nature}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-x-4">
              <div className="md:w-1/2 sm:w-full sm:block">
                <div className="font-bold text-xl block bg-gray-600 p-1 text-white">Motif de la dépense</div>
                <div className="text-gray-700 mb-4 text-base block bg-gray-300 p-2">
                  <span>{spent.motif}</span>
                </div>
             </div>
              <div className="md:w-1/2 sm:w-full sm:block">
                <div className="font-bold text-xl block bg-gray-600 p-1 text-white">Montant à dépenser</div>
                <div className="text-gray-700 mb-4 text-base block bg-gray-300 p-2">
                  <span>{spent.amount}</span>
                </div>
               </div>
            </div>
          </div>

          { spent.status === "REJECTED"
            ? <div className="mx-4 my-2 p-4 bg-gray-300 shadow rounded-md">
                  <h4 className="font-bold text-md">Motif(s) du rejet:</h4>
                  <span className="text-sm text-gray-700">{ spent.rejectMotif }</span>
                </div>
            : ""
          }

          <div className="px-6 pt-2 pb-6">
            <span className="font-bold">Statut: </span>
            <span className={
                    spent.status === "CREATED"
                    ? "inline-block bg-gray-400 rounded-full px-3 py-1 text-sm font-semibold text-gray-900 mr-2 mb-2"
                    : spent.status === "CANCELED"
                    ? "inline-block bg-black rounded-full px-3 py-1 text-sm font-semibold text-white mr-2 mb-2"
                    : spent.status === "ONPROCESS"
                    ? "inline-block bg-yellow-500 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                    : spent.status === "APPROVED"
                    ? "inline-block bg-green-500 rounded-full px-3 py-1 text-sm font-semibold text-white mr-2 mb-2"
                    : spent.status === "REJECTED"
                    ? "inline-block bg-red-500 rounded-full px-3 py-1 text-sm font-semibold text-white mr-2 mb-2"
                    : ""
              }
            >
              {
                spent.status === "CREATED"
                ? "En attente"
                : spent.status === "CANCELED"
                ? "Annuler"
                : spent.status === "ONPROCESS"
                ? "Traitement en cours"
                : spent.status === "APPROVED"
                ? "Approuvée"
                : spent.status === "REJECTED"
                ? "Rejetée"
                : ""
              }
            </span>
            <div className="float-right">
             {
                (spent.step === "0" && spent.addedBy === theUserSession?.user?.id)
                  ? (
                      <span>
                        <button
                          onClick={() => sendTSpent()}
                          className="capitalize bg-green-500 text-white font-medium px-4 py-2 rounded-md hover:bg-green-600"
                        >
                          {isSendLoading ? (
                            <span className="flex items-center justify-center">
                              <svg
                                className="w-6 h-6 animate-spin mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                              </svg>
                              Envoi...
                            </span>
                          ) : (
                            <span className="font-bold">Envoyer</span>
                          )}
                        </button>
                        <button
                            onClick={() => editSpent()}
                            className="bg-blue-500 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-600 mx-4"
                          >
                            {isEditLoading ? (
                              <span className="flex items-center justify-center">
                                <svg
                                  className="w-6 h-6 animate-spin mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                                </svg>
                                En cours...
                              </span>
                            ) : (
                              <span className="font-bold">Modifier</span>
                            )}
                          </button>
                        </span>
                )

                : (spentVar && spent.step === "1")

                ? ( <span>
                      <button
                        onClick={() => validateSpent()}
                        className="bg-green-500 text-white font-medium px-4 py-2 rounded-md hover:bg-green-600 mx-4"
                      >
                        {isValidateLoading ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="w-6 h-6 animate-spin mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                            </svg>
                            En cours...
                          </span>
                        ) : (
                          <span className="font-bold">Approuver</span>
                        )}
                      </button>
                      <button
                          onClick={() => rejectClickSpent()}
                          className="bg-red-500 text-white font-medium px-4 py-2 rounded-md hover:bg-red-600 mx-4"
                        >
                          {isRejectLoading ? (
                            <span className="flex items-center justify-center">
                              <svg
                                className="w-6 h-6 animate-spin mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                              </svg>
                              En cours...
                            </span>
                          ) : (
                            <span className="font-bold">Rejeter</span>
                          )}
                        </button>
                    </span> )
                : ""
              }
              {
                (spentVar && (theUserSession?.user?.role === "ADMIN" || theUserSession?.user?.role === "SUPER_ADMIN"))
                ? (
                      <button
                        onClick={() => deleteClickSpent()}
                        className="bg-red-500 text-white font-medium px-4 py-2 rounded-md hover:bg-red-600"
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
                          <span className="font-bold">Supprimer</span>
                        )}
                      </button>
                   )
                  : ""
                }
            </div>
          </div>
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
                              Êtes-vous sûr(e) de vouloir supprimer cette dépense ?
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                        onClick={() => delSpent()}
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


        <Transition.Root show={openRejectModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" initialFocus={cancelRejectButtonRef} onClose={setOpenRejectModal}>
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
                            Rejet
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Veuillez renseigner la(les) raison(s) de votre rejet.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <form className="grid grid-cols-1 gap-y-2 bg-white shadow-lg p-4 rounded-lg" onSubmit={handleSubmit(onRejectSubmit)}>
                      <label for="rejectMotif" class="block mx-7">
                        <span className="text-gray-700">Raison(s) du rejet</span>
                        <textarea id="rejectMotif" rows="4" {...register('rejectMotif', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="Raison(s)" name="rejectMotif"></textarea>
                      </label>
                      <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                          type="submit"
                          className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                        >
                          {isRejectLoading ? (
                            <span className="flex items-center justify-center">
                              <svg
                                className="w-6 h-6 animate-spin mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                              </svg>
                              Rejet ...
                            </span>
                          ) : (
                            <span className="font-bold">Rejeter</span>
                          )}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                          onClick={() => setOpenRejectModal(false)}
                          ref={cancelRejectButtonRef}
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>


      </div>
    </div>
  );
};

export default Spent;

export const getServerSideProps: GetServerSideProps = async (ctx) => {

  const id = ctx.params?.id;
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

  const spent = await prisma.spent.findUnique({
    where: {
      id: id
    },
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
  });

  if (!spent) return {
    notFound: true
  }

  const getUserProformaProp = await prisma.userModulePriority.findMany({
    where: {
      userId: user?.id,
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

  let spentVar = false;
  
  if(getUserProformaProp[0] && getUserProformaProp[0]?.module?.name === "DEPENSE") {
    if(getUserProformaProp[0].priority !== "APPROV_REJECT" && getUserProformaProp[0].priority !== "R_UPDATE_DELETE" && getUserProformaProp[0].priority !== "C_R_UPDATE_DELETE") {
      spentVar = false;
    } else {
      spentVar = true
    }

  } else {
    spentVar = false;
  }

  return {
    props: {
      spent,
      spentVar,
    },
  };
};
