import React, { useCallback, useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form'
import prisma from '../../../lib/prisma';
import { gql, useQuery, useMutation } from '@apollo/client';
import { ExclamationTriangleIcon, ArrowLeftIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { getSession, useSession } from "next-auth/react";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from "next/navigation";
import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next';
import axios from "axios";
import fs from "fs/promises";
import path from "path";

interface Props {
  dirs: string[];
}

type FormValues = {
  id: string;
  title: string;
  description: string;
  name: string;
  motifId: string;
  filiereId: string;
  amount: string;
  step: string;
  filePath: FileList;
  createdYear: string;
  addedBy: string;
}

const AllMotifsQuery = gql`
  query allFilieresQuery($first: Int, $after: ID) {
    motifs(first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          name
          description
        }
      }
    }
  }
`;

const AllFilieresQuery = gql`
  query allFilieresQuery($first: Int, $after: ID) {
    filieres(first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          name
          description
        }
      }
    }
  }
`;

const ValidPaymentMutation = `
  mutation($id: ID!, $userId: ID!, $status: String!, $step: String!, $filePath: String!) {
    validPayment(id: $id, userId: $userId, status: $status, step: $step, filePath: $filePath) {
      id
      title
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

const ValidateAPayment: NextPage<Props> = ({ payment, dirs }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File>();

  const [loading, setIsLoading] = useState(false);

  const {data:session}=useSession()
  const theUserSession = session;

  const { data: allMotifs } = useQuery(AllMotifsQuery);

  const { data: allFilieres } = useQuery(AllFilieresQuery);

//   const [validPayment, { data, loading, error }] = useMutation(ValidPaymentMutation)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ mode: 'onBlur' });

  useEffect(() => {
    if (payment) {
        reset({
          title: payment.title,
          description: payment.description,
          name: payment.name ,
          motifId: payment.motifId,
          filiereId: payment.filiereId,
          amount: payment.amount,
          step: payment.step,
        });
    }
}, [payment]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const theStep = "2";
    const theStatus = "APPROVED";

    const variables = { id: payment.id, userId: session?.user.id, status: theStatus, step: theStep, }
    setIsLoading(true);
    try {
      if (!selectedFile) return;
      const formData = new FormData();
      formData.append("fileUpload", selectedFile);
      const { data } = await axios.post("/api/upload-api", formData);

//       const theValidatedPayment = await toast.promise(validPayment({ variables: { ...variables, filePath: data[0].filepath } }), {
//         loading: 'Opération en cours..',
//         success: 'Paiement traité avec succès!🎉',
//         error: `Une erreur s'est produite 😥 Veuillez re-essayer SVP - ${error}`,
//       })

      const theValidatedPayment = await axios.post('/api/graphql',
                                                  {
                                                    "query": ValidPaymentMutation,
                                                    "variables" : { ...variables, filePath: data[0].filepath },
                                                  },
                                                  { headers: { 'Content-Type': 'application/json' } }
                                    );

      if(theValidatedPayment?.data.errors) {
        toast.error(`${theValidatedPayment?.data.errors[0].extensions.originalError.message}`);
      } else {
        toast.success('Paiement traité avec succès!🎉');
        if(theValidatedPayment.data.data.validPayment) {
          router.push(`/payments/${theValidatedPayment.data.data.validPayment.id}`)
        }
        setOpenRejectModal(false);
      }

    } catch (error: any) {
      console.log(error);
    }
    setIsLoading(false);
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
        <h1 className="text-2xl font-medium mb-5">Valider un paiement <span className="text-sm">(Veuillez attacher le fichier de la quittance au formulaire)</span></h1>
        <form className="grid grid-cols-1 gap-y-4 bg-white shadow-lg p-8 rounded-lg" encType="multipart/form-data" onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="text-gray-700">Titre</span>
            <input
              placeholder="Paiement ..."
              {...register('title', { required: true })}
              name="title"
              type="text"
              className="mt-1 text-gray-600 cursor-not-allowed block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              disabled
            />
          </label>
          <label for="description" class="block">
            <span className="text-gray-700">Description</span>
            <textarea id="description" rows="4" {...register('description', { required: true })} className="mt-1 text-gray-600 cursor-not-allowed block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="Description du paiement" name="description" disabled></textarea>
          </label>
          <label className="block">
            <span className="text-gray-700">Nom de l&apos;étudiant</span>
            <input
              placeholder="Nom complet de l'étudiant"
              {...register('name', { required: true })}
              name="name"
              type="text"
              className="mt-1 text-gray-600 cursor-not-allowed block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              disabled
            />
          </label>
          <div className="flex gap-x-4 w-full">
            <label className="block w-full">
              <span className="text-gray-700">Motif de paiement</span>
              <select id="motifs" className="mt-1 text-gray-600 cursor-not-allowed block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" name="motifId" {...register('motifId', { required: true })} disabled>
                <option value="" disabled>Motif</option>
                { allMotifs?.motifs.edges.map(({ node }: { node: Node }) => (
                    <option value={node.id} >{node.name}</option>
                  )
                )}
              </select>
            </label>
            <label className="block w-full">
              <span className="text-gray-700">Filière de l&apos;étudiant</span>
              <select id="filieres" className="mt-1 text-gray-600 cursor-not-allowed block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" name="filiereId" {...register('filiereId', { required: true })} disabled>
                <option value="" disabled>Filière</option>
                { allFilieres?.filieres.edges.map(({ node }: { node: Node }) => (
                    <option value={node.id} >{node.name}</option>
                  )
                )}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-gray-700">Montant</span>
            <input
              placeholder="Montant à payer"
              {...register('amount', { required: true })}
              name="amount"
              type="number"
              className="mt-1 text-gray-600 cursor-not-allowed block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              disabled
            />
          </label>

          <div className="text-center justify-center flex">
            <label className="block p-3 bg-gray-200 w-1/3 h-18 rounded">
              <span className="text-gray-700">Cliquez ou glissez déposer pour charger un document .docx ou .pdf (max 2MB)</span>
              <div className="justify-center my-2 flex"><ArrowUpTrayIcon className="h-10 w-10 text-blue-600 font-bold" aria-hidden="true" /></div>
              <input
                {...register('filePath', { required: false })}
                onChange={({ target }) => {
                  if (target.files) {
                    const file = target.files[0];
                    setSelectedImage(URL.createObjectURL(file));
                    setSelectedFile(file);
                  }
                }}
                type="file"
                accept="application/docx, application/pdf"
                name="filePath"
                className="text-none w-1/2"
              />
            </label>
            <div className="w-40 aspect-video rounded flex items-center justify-center border-2 border-dashed cursor-pointer">
              {selectedImage ? (
                <img src={selectedImage} alt="" />
              ) : (
                <span>Fichier non sélectionné</span>
              )}
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="my-4 capitalize bg-blue-500 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-600"
          >
            {loading ? (
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
              <span>Traiter</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ValidateAPayment;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id;
  const payment = await prisma.payment.findUnique({
    where: {
      id: id
    },
    select: {
      id: true,
      title: true,
      description: true,
      name: true,
      filiereId: true,
      motifId: true,
      amount: true,
      step: true,
      status: true,
      filePath: true,
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

  if(payment.status === "APPROVED") {
    return {
      redirect: {
        permanent: false,
        destination: `/payments/${payment.id}`,
      },
      props: {},
    };
  }

  const dirProps = { dirs: [] };
    const dirs = await fs.readdir(path.join(process.cwd(), "./public/upload"));
    dirProps.dirs = dirs as any;
  return {
    props: {
      payment,
      dirProps
    },
  };
};
