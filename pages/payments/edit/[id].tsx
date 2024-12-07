import React, { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form'
import prisma from '../../../lib/prisma';
import { gql, useQuery, useMutation } from '@apollo/client';
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { getSession, useSession } from "next-auth/react";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from "next/navigation";
import Router from 'next/router'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

type FormValues = {
  id: string;
  name: string;
  surname: string;
  description: string;
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

const EditPaymentMutation = gql`
  mutation($id: ID!, $name: String!, $surname: String!, $description: String!, $motifId: ID!, $filiereId: ID!, $step: String!, $amount: String!, $createdYear: String!, $addedBy: String!) {
    updatePayment(id: $id, name: $name, surname: $surname, description: $description, motifId: $motifId, filiereId: $filiereId, amount: $amount, step: $step, createdYear: $createdYear, addedBy: $addedBy) {
      id
      name
      surname
      description
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

const EditPayment = ({ payment }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const {data:session}=useSession()
  const theUserSession = session;

  const { data: allMotifs } = useQuery(AllMotifsQuery);

  const { data: allFilieres } = useQuery(AllFilieresQuery);

  const [editPayment, { data, loading, error }] = useMutation(EditPaymentMutation)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ mode: 'onBlur' });

  useEffect(() => {
    if (payment) {
        reset({
          name: payment.name ,
          surname: payment.surname ,
          description: payment.description,
          motifId: payment.motifId,
          filiereId: payment.filiereId,
          amount: payment.amount,
          step: payment.step,
        });
    }
  }, [payment]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { id, name, surname, description, motifId, filiereId, amount, step, createdYear, addedBy } = data

    const theStep = "0";
    const year = new Date().getFullYear();
    const yearToString = year.toString()
    
    const variables = { id: payment.id, name, surname, description, motifId, filiereId, amount, step: theStep, createdYear: yearToString, addedBy: session?.user.id }
    try {
      const theEditedPayment = await toast.promise(editPayment({ variables }), {
        loading: 'Opération en cours..',
        success: 'Paiement mis à jour avec succès!🎉',
        error: `${Error}`,
      })

      // console.log(theEditedPayment)

      if(theEditedPayment.data.updatePayment) {
        router.push(`/payments/${theEditedPayment.data.updatePayment.id}`)
      }

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
        <h1 className="text-3xl font-medium mb-5 uppercase text-center">Editer un paiement</h1>
        <form className="grid grid-cols-1 gap-y-4 bg-white shadow-lg p-8 rounded-lg" onSubmit={handleSubmit(onSubmit)}>
          <strong className="text-red-600">Tous les champs sont obligatoires</strong>
            <label className="block w-full">
              <span className="text-gray-700">Motif de paiement</span>
              <select id="motifs" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" name="motifId" {...register('motifId', { required: true })} required>
                <option value="" disabled>Motif</option>
                { allMotifs?.motifs.edges.map(({ node }: { node: Node }) => (
                    <option value={node.id} >{node.name}</option>
                  )
                )}
              </select>
            </label>
          <label for="description" class="block">
            <span className="text-gray-700">Description</span>
            <textarea id="description" rows="4" {...register('description', { required: true })} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="Description du paiement" name="description"></textarea>
          </label>
          <div className="flex gap-x-4 w-full">
            <label className="block w-full">
              <span className="text-gray-700">Nom de l&apos;étudiant</span>
              <input
                placeholder="Nom de l'étudiant"
                {...register('name', { required: true })}
                name="name"
                type="text" required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
            <label className="block w-full">
              <span className="text-gray-700">Prénoms de l&apos;étudiant</span>
              <input
                placeholder="Prénoms de l'étudiant"
                {...register('surname', { required: true })}
                name="surname"
                type="text" required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
          </div>
          <div className="flex gap-x-4 w-full">
            <label className="block w-full">
              <span className="text-gray-700">Filière de l&apos;étudiant</span>
              <select id="filieres" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" name="filiereId" {...register('filiereId', { required: true })} required>
                <option value="" disabled>Filière</option>
                { allFilieres?.filieres.edges.map(({ node }: { node: Node }) => (
                    <option value={node.id} >{node.name}</option>
                  )
                )}
              </select>
            </label>
            <label className="block w-full">
              <span className="text-gray-700">Montant</span>
              <input
                placeholder="Montant à payer"
                {...register('amount', { required: true })}
                name="amount"
                type="number" required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
          </div>
          {/* <label className="block">
            <span className="text-gray-700">Upload a .png or .jpg image (max 1MB).</span>
            <input
              {...register('image', { required: false })}
              onChange={uploadPhoto}
              type="file"
              accept="image/png, image/jpeg"
              name="image"
            />
          </label> */}

          <button
            disabled={loading}
            type="submit"
            className="my-4 capitalize text-white font-medium py-2 px-4 rounded-md bg-red-700 hover:bg-red-400"
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
              <span>Modifier</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPayment;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  const id = ctx.params?.id;

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: '/auth/login',
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

  const payment = await prisma.payment.findUnique({
    where: {
      id: id
    },
    select: {
      id: true,
      description: true,
      name: true,
      surname: true,
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
  
  if(session?.user.id !== payment.addedBy) {
    toast.error("Désolé, vous ne pouvez pas modifier ce paiement");
    return {
      redirect: {
        permanent: false,
        destination: '/dashboard',
      },
      props: {},
    };
  }

  if(payment?.step !== "0") {
    toast.error("Désolé, vous ne pouvez plus modifier ce paiement");
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
      payment,
    },
  };
};
