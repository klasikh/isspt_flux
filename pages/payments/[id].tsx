import React, { Fragment, useRef, useState } from 'react'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Link from "next/link";
import { type SubmitHandler, useForm } from 'react-hook-form'
import prisma from '../../lib/prisma';
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { gql, useMutation } from '@apollo/client';
import { getSession, useSession } from "next-auth/react";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from "next/navigation";
import axios from "axios";
import ModalTransition from '../../components/ModalTransition';

type FormValues = {
  id: string;
  rejectMotif: string;
  userId: string;
  status: string;
  step: string;
}

const SendPaymentMutation = gql`
  mutation ($id: ID!, $userId: ID!, $name: String!, $surname: String!, $motifId: ID!, $filiereId: ID!, $amount: String!, $createdYear: String!,) {
    sendPayment(id: $id, userId: $userId, name: $name, surname: $surname, motifId: $motifId, filiereId: $filiereId, amount: $amount, createdYear: $createdYear,) {
      name
      surname
      description
      motifId
      filiereId
      amount
      step
    }
  }
`;

const RejectPaymentMutation = `
  mutation($id: ID!, $rejectMotif: String!, $userId: ID!, $status: String!, $step: String!) {
    rejectPayment(id: $id, rejectMotif: $rejectMotif, userId: $userId, status: $status, step: $step,) {
      id
      description
      name
      motifId
      filiereId
      amount
      step
      filePath
      createdYear
      addedBy
    }
  }
`

const ResendPaymentMutation = `
  mutation($id: ID!, $resendMotif: String!, $userId: ID!, $status: String!, $step: String!) {
    resendPayment(id: $id, resendMotif: $resendMotif, userId: $userId, status: $status, step: $step,) {
      id
      description
      name
      motifId
      filiereId
      amount
      step
      filePath
      createdYear
      addedBy
    }
  }
`
const DeletePaymentMutation = `
  mutation($id: ID!, $userId: ID!,) {
    deletePayment(id: $id, userId: $userId,) {
      id
    }
  }
`
const Payment = ({ payment, proformaVar, }: InferGetServerSidePropsType<typeof getServerSideProps>) => {

  const router = useRouter();
  
  const [isSendLoading, setIsSendLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isValidateLoading, setIsValidateLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isRejectLoading, setIsRejectLoading] = useState(false);

  const [openRejectModal, setOpenRejectModal] = useState(false)
  const [openResendModal, setOpenResendModal] = useState(false)
  const [openDeletionModal, setOpenDeletionModal] = useState(false)
  const [rejectMotifText, setRejectMotifText] = useState("")
  const [resendMotifText, setResendMotifText] = useState("")

  const cancelResendButtonRef = useRef(null)
  const cancelRejectButtonRef = useRef(null)
  const cancelDeletionButtonRef = useRef(null)

  const {data:session}=useSession()
  const theUserSession = session;

  const [sendPayment] = useMutation(SendPaymentMutation);

//   const [rejectPayment, { data, loading, error }] = useMutation(RejectPaymentMutation)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ mode: 'onBlur' });

  const sendTPayment = async () => {
    setIsSendLoading(true);
    const sendThePay = await toast.promise(sendPayment({ variables: { id: payment.id, userId: theUserSession?.user.id, name: payment.name, surname: payment.surname, motifId: payment.motifId, filiereId: payment.filiereId, amount: payment.amount, createdYear: payment.createdYear } }), {
      loading: 'Envoi en cours',
      success: 'Envoyé avec succès! 🎉',
      error: `${Error}`,
    });

    if(sendThePay?.data.sendPayment) {
      router.push(`/payments/list`);
      setIsSendLoading(false);
    }
    setIsSendLoading(false);
  };

  const editPayment = () => {
    setIsEditLoading(true);
    router.push(`/payments/edit/${payment.id}`)
  }

  const deletePayment = () => {
    setOpenDeletionModal(true)
  }

  const validatePayment = () => {
    setIsValidateLoading(true);
    router.push(`/payments/validate/${payment.id}`)
  }

  const rejectClickPayment = () => {
    setOpenRejectModal(true)
  }

  const resendClickPayment = () => {
    setOpenResendModal(true)
  }

  const configRejectMotif = (e: any) => {
    setRejectMotifText(e.target.value)
  }

  const onRejectSubmit = async (e: any) => {
    e.preventDefault();

    const theStep = "0";
    const theStatus = "REJECTED";
    setIsRejectLoading(true)

    const variables = { id: payment.id, rejectMotif: rejectMotifText, userId: session?.user.id, status: theStatus, step: theStep }
    try {
      setIsRejectLoading(true)
      const theRejectedPayment = await axios.post('/api/graphql', {
                                       "query": RejectPaymentMutation,
                                       "variables" : variables
                                      },
                                   { headers: { 'Content-Type': 'application/json' } }
                                  );

      if(theRejectedPayment?.data.errors) {
        toast.error(`${theRejectedPayment?.data.errors[0].extensions.originalError.message}`)
        setIsRejectLoading(false)
        setOpenRejectModal(false);
      } else {
        toast.success('Paiement rejeté avec succès!🎉');
        if(theRejectedPayment.data.data.rejectPayment) {
          router.push(`/payments/list`);
          setOpenRejectModal(false);
          setIsRejectLoading(false)
        }
        setIsRejectLoading(false)
        setOpenRejectModal(false);
      }

    } catch (error) {
      console.error(error)
    }
  }

  const configResendMotif = (e: any) => {
    setResendMotifText(e.target.value)
  }

  const onResendSubmit = async (e: any) => {
    e.preventDefault();
    // const { id, resendMotif, userId, status, step, } = data

    const theStep = "1";
    const theStatus = "ONPROCESS";

    const variables = { id: payment.id, resendMotif: resendMotifText, userId: session?.user.id, status: theStatus, step: theStep }
    try {
      setIsResendLoading(true)
      const theResentPayment = await axios.post('/api/graphql', {
                                       "query": ResendPaymentMutation,
                                       "variables" : variables
                                      },
                                   { headers: { 'Content-Type': 'application/json' } }
                                  );

      if(theResentPayment?.data.errors) {
        toast.error(`${theResentPayment?.data.errors[0].extensions.originalError.message}`)
        setIsResendLoading(false)
        setOpenResendModal(false);
      } else {
        toast.success('Paiement renvoyé avec succès!🎉');
        if(theResentPayment.data.data.resendPayment) {
          router.push(`/payments/list`)
          setOpenResendModal(false);
          setIsResendLoading(false)
        }
        setIsResendLoading(false)
        setOpenResendModal(false);
      }

    } catch (error) {
      console.error(error)
    }
  }
  const delPaym = async () => {
    setIsDeleteLoading(true);
    const variables = { id: payment.id, userId: session?.user.id, }
    try {

      const theDeletedPayment =  await axios.post('/api/graphql',                                   {
                                       "query": DeletePaymentMutation,
                                       "variables" : variables
                                      },
                                   { headers: { 'Content-Type': 'application/json' } }
                                  );

      if(theDeletedPayment?.data.errors) {
        toast.error(`${theDeletedPayment?.data.errors[0].extensions.originalError.message}`)
        setIsValidateLoading(false);
      } else {
        toast.success('Paiement supprimé avec succès!🎉');
        router.push(`/payments/list`)
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
        <h1 className="text-2xl font-bold mb-3 uppercase text-center">Informations du paiement</h1>
        <div className="w-full bg-white rounded overflow-hidden shadow-lg">
          <div className="px-6 py-4">
            <div className="flex gap-x-4">

              <div className="md:w-1/2 sm:w-full sm:block">
                <div className="font-bold text-xl bg-gray-600 p-1 text-white">Nom et prénoms de l&apos;étudiant</div>
                <div className="text-gray-700 mb-4 text-base bg-gray-300 p-2">
                  <span>{payment.name + " " + payment.surname}</span>
                </div>
              </div>
              <div className="md:w-1/2 sm:w-full sm:block">
                <div className="font-bold text-xl block bg-gray-600 p-1 text-white">Motif de paiement</div>
                <div className="text-gray-700 mb-4 text-base block bg-gray-300 p-2">
                  <span>{payment.motif.name}</span>
                </div>
             </div>
            </div>
            <div className="font-bold text-xl block bg-gray-600 p-1 text-white">Description</div>
            <div className="text-gray-700 mb-4 text-base block bg-gray-300 p-2">
              <span>{payment.description}</span>
            </div>
            <div className="flex gap-x-4">
              <div className="md:w-1/2 sm:w-full sm:block">
                <div className="font-bold text-xl bg-gray-600 p-1 text-white">Filière</div>
                <div className="text-gray-700 mb-4 text-base bg-gray-300 p-2">
                  <span>{payment.filiere.name}</span>
                </div>
              </div>
              <div className="md:w-1/2 sm:w-full sm:block">
                <div className="font-bold text-xl block bg-gray-600 p-1 text-white">Montant payé</div>
                <div className="text-gray-700 mb-4 text-base block bg-gray-300 p-2">
                  <span>{payment.amount}</span>
                </div>
               </div>
            </div>
            <div className="flex gap-x-4">
            </div>
          </div>

          { (payment.status === "REJECTED" || (payment.status === "ONPROCESS" && payment.resendMotif !== null))
            ? <div className="mx-4 my-2 p-4 bg-gray-300 shadow rounded-md">
                <h4 className="font-bold text-md">Motif(s) du rejet:</h4>
                <span className="text-sm text-gray-700">{ payment.rejectMotif }</span>
              </div>
            : ""
          }

          { (payment.status === "ONPROCESS" && payment.resendMotif !== null)
            ? <div className="mx-4 my-2 p-4 bg-gray-300 shadow rounded-md">
                <h4 className="font-bold text-md">Note de renvoie:</h4>
                <span className="text-sm text-gray-700">{ payment.resendMotif }</span>
              </div>
            : ""
          }

          {
            payment.status === "APPROVED"
            ? <div className="mx-4 my-2 p-4 bg-gray-300 shadow rounded-md">
                <h4 className="font-bold text-md mb-5">Quittance de paiement</h4>
                <iframe src={`/upload/payments/` + payment?.filePath} style={{ width: "100%", height: "500px" }}>
                </iframe>
              </div>
            : ""
          }

          <div className="px-6 pt-2 pb-6">
            <span className="font-bold">Statut: </span>
            <span className={
                    payment.status === "CREATED"
                    ? "inline-block bg-gray-400 rounded-full px-3 py-1 text-sm font-semibold text-gray-900 mr-2 mb-2"
                    : payment.status === "CANCELED"
                    ? "inline-block bg-black rounded-full px-3 py-1 text-sm font-semibold text-white mr-2 mb-2"
                    : payment.status === "ONPROCESS"
                    ? "inline-block bg-yellow-500 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                    : payment.status === "APPROVED"
                    ? "inline-block bg-green-500 rounded-full px-3 py-1 text-sm font-semibold text-white mr-2 mb-2"
                    : payment.status === "REJECTED"
                    ? "inline-block bg-red-500 rounded-full px-3 py-1 text-sm font-semibold text-white mr-2 mb-2"
                    : ""
              }
            >
              {
                payment.status === "CREATED"
                ? "En attente"
                : payment.status === "CANCELED"
                ? "Annuler"
                : payment.status === "ONPROCESS"
                ? "Traitement en cours"
                : payment.status === "APPROVED"
                ? "Approuvé"
                : payment.status === "REJECTED"
                ? "Rejeté"
                : ""
              }
            </span>
            <div className="float-right">
             {
                (payment.step === "0" && payment.addedBy === theUserSession?.user?.id && !payment.rejectMotif)
                ? (
                    <span>
                      <button
                        onClick={() => sendTPayment()}
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
                        onClick={() => editPayment()}
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
                : (payment.step === "0" && payment.addedBy === theUserSession?.user?.id && payment.rejectMotif)
                ? (
                    <span>
                      <button
                        onClick={() => resendClickPayment()}
                        className="capitalize bg-green-500 text-white font-medium px-4 py-2 rounded-md hover:bg-green-600"
                      >
                        {isResendLoading ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="w-6 h-6 animate-spin mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                            </svg>
                            Renvoi...
                          </span>
                        ) : (
                          <span className="font-bold">Renvoyer</span>
                        )}
                      </button>
                      <button
                        onClick={() => editPayment()}
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

                : (proformaVar && payment.step === "1")

                ? ( <span>
                      <Link
                        onClick={() => validatePayment()}
                        href="https://sirah.isspt-edu.org"
                        className="bg-green-500 text-white font-medium px-4 py-3 rounded-md hover:bg-green-600 mx-4"
                        target="_blank"
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
                          <span className="font-bold">Valider</span>
                        )}
                      </Link>
                      <button
                          onClick={() => rejectClickPayment()}
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
                (proformaVar && theUserSession?.user?.role === "ADMIN")
                ? (
                      <button
                        onClick={() => deletePayment()}
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

        {/* <ModalTransition
          openModal={openDeletionModal}
          cancelButtonRef={cancelDeletionButtonRef}
          setOpenModalFunc={setOpenDeletionModal}
          setOpenModalClose={setOpenDeletionModal}
          onSubmit={delPaym}
          registerTextarea={".."}
          isLoading={isDeleteLoading}
        ></ModalTransition> */}

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
                              Êtes-vous sûr(e) de vouloir supprimer ce paiement ?
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                        onClick={() => delPaym()}
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

        <div className="">

<Transition.Root show={openResendModal} as={Fragment}>
<Dialog as="div" className="relative z-10" initialFocus={cancelResendButtonRef} onClose={setOpenResendModal}>
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
                  Renvoie après rejet
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Veuillez renseigner une petite note de renvoie.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <form className="grid grid-cols-1 gap-y-2 bg-white shadow-lg p-4 rounded-lg" onSubmit={onResendSubmit}>
            <label htmlFor="resendMotif" className="block mx-7">
              {/* <span className="text-gray-700">Raison(s) du rejet</span> */}
              <textarea id="resendMotif" rows={4} onChange={(e) => configResendMotif(e)} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="Note de renvoie" name="resendMotif" required></textarea>
            </label>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
              >
                {isResendLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="w-6 h-6 animate-spin mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                    </svg>
                    Renvoie ...
                  </span>
                ) : (
                  <span className="font-bold">Renvoyer</span>
                )}
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-red-600 sm:mt-0 sm:w-auto"
                onClick={() => setOpenResendModal(false)}
                ref={cancelResendButtonRef}
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
                    <form className="grid grid-cols-1 gap-y-2 bg-white shadow-lg p-4 rounded-lg" onSubmit={onRejectSubmit} >
                      <label htmlFor="rejectMotif" className="block mx-7">
                        <span className="text-gray-700">Raison(s) du rejet</span>
                        <textarea id="rejectMotif" rows={4} onChange={(e) => configRejectMotif(e)} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="Raison(s)" name="rejectMotif" required></textarea>
                      </label>
                      <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                          type="submit"
                          className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                          // onClick={() => (onRejectSubmit)}
                        >
                          {isRejectLoading ? (
                            <span className="flex items-center justify-center">
                              <svg
                                className="w-6 h-6 animate-spin mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9+
                                .236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
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

export default Payment;

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

  const payment = await prisma.payment.findUnique({
    where: {
      id: id
    },
    select: {
      id: true,
      name: true,
      surname: true,
      description: true,
      filiereId: true,
      filiere: {
        select: {
          name: true
        },
      },
      motifId: true,
      motif: {
        select: {
          id: true,
          name: true
        },
      },
      amount: true,
      step: true,
      status: true,
      filePath: true,
      rejectMotif: true,
      resendMotif: true,
      isNotified: true,
      createdYear: true,
      addedBy: true,
      fromId: true,
      toId: true,
    },
  });

  if (!payment) return {
    notFound: true
  }

  const getUserProformaProp = await prisma.userModulePriority.findMany({
    where: {
      userId: user?.id,
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

  let proformaVar = false;
  
  if(getUserProformaProp[0] && getUserProformaProp[0]?.module?.name === "PAIEMENT") {
    if(getUserProformaProp[0].priority !== "APPROV_REJECT" && getUserProformaProp[0].priority !== "R_UPDATE_DELETE" && getUserProformaProp[0].priority !== "C_R_UPDATE_DELETE" && getUserProformaProp[0].priority !== "C_R_U_APPROV_REJECT") {
      proformaVar = false;
    } else {
      proformaVar = true
    }

  } else {
    proformaVar = false;
  }

  return {
    props: {
      payment,
      proformaVar,
    },
  };
};
