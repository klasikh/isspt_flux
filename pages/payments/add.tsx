// pages/admin.tsx
import React, { useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { gql, useQuery, useMutation } from '@apollo/client'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from "next/navigation"
import type { GetServerSideProps } from 'next'
import { ExclamationTriangleIcon, ArrowLeftIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline'
import { getSession, useSession } from "next-auth/react"
import prisma from '../../lib/prisma'

type FormValues = {
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

const CreatePaymentMutation = gql`
  mutation($name: String!, $surname: String!, $description: String!, $motifId: ID!, $filiereId: ID!, $step: String!, $amount: String!, $createdYear: String!, $addedBy: String!) {
    createPayment(name: $name, surname: $surname, description: $description, motifId: $motifId, filiereId: $filiereId, amount: $amount, step: $step, createdYear: $createdYear, addedBy: $addedBy) {
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

const PaymentAdd = ({ motifs, filieres, }: InferGetServerSidePropsType<typeof getServerSideProps>) => {

  const router = useRouter();
  const [amountVal, setAmountVal] = useState("")

  const {data:session}=useSession()

  const { data: allMotifs } = useQuery(AllMotifsQuery);

  const { data: allFilieres } = useQuery(AllFilieresQuery);

  const [createPayment, { data, loading, error }] = useMutation(CreatePaymentMutation)

  // const incrementNumber = (e: any) => {
  //   console.log(e.target.value)
  //   return setAmountVal(e.target.value);
  // }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { name, surname, description, motifId, filiereId, amount, step, createdYear, addedBy } = data

    // const filePath = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${image[0]?.name}`

    const theStep = "0";
    const year = new Date().getFullYear();
    const yearToString = year.toString()
    // const variables = { description, name, motifId, filiereId, amount, theStep, filePath, createdYear, }
    const variables = { name, surname, description, motifId, filiereId, amount, step: theStep, createdYear: yearToString, addedBy: session?.user.id }
    try {
      const theAddedPayment = await toast.promise(createPayment({ variables }), {
        loading: 'Opération en cours..',
        success: 'Paiement ajouté avec succès!🎉',
        error: `Une erreur s'est produite 😥 Veuillez re-essayer SVP - ${error}`,
      })

      // console.log(theAddedPayment)

      if(theAddedPayment.data.createPayment) {
        router.push(`/payments/${theAddedPayment.data.createPayment.id}`)
      }

    } catch (error) {
      console.error(error)
    }
  }

  return (

    <div className="container mx-auto px-12 pt-4 pb-12">
      <Toaster />
      <button
        type="button"
        onClick={() => router.back()}
        className="bg-gray-500 text-white font-bold px-4 py-2 mb-6 rounded-md hover:bg-gray-600 flex"
      >
        <ArrowLeftIcon className="h-6 w-6 text-white font-bold mr-2" aria-hidden="true" />
        Retour
      </button>
      <h1 className="text-3xl font-medium mb-5">Ajouter un paiement</h1>
      <form className="grid grid-cols-1 gap-y-4 bg-white shadow-lg p-8 rounded-lg" onSubmit={handleSubmit(onSubmit)}>
        <strong className="text-red-600">Tous les champs sont obligatoires</strong>
          <label className="block w-full">
            <span className="text-gray-700">Motif de paiement</span>
            <select id="motifs" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" name="motifId" {...register('motifId', { required: true })} required>
              <option value="" selected disabled>Motif</option>
              { motifs.map((node: any) => (
                  <option value={node.id} key={node.id}>{node.name}</option>
                )
              )}
            </select>
          </label>
        <label htmlFor="description" className="block">
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
              <option value="" selected disabled>Filière</option>
              { filieres.map((node: any) => (
                  <option value={node.id} key={node.id}>{node.name}</option>
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
              min="1"
            />
          </label>
        </div>

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
            <span>Enregistrer</span>
          )}
        </button>
      </form>
    </div>
  )
}

export default PaymentAdd;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

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

   const getUserPriorities = await prisma.userModulePriority.findMany({
    where: {
      userId: user.id,
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

  if(getUserPriorities[0] && getUserPriorities[0]?.module?.name === "PAIEMENT") {
    if(getUserPriorities[0].priority !== "CREATE" && getUserPriorities[0].priority !== "CREATE_READ" && getUserPriorities[0].priority !== "C_READ_UPDATE" && getUserPriorities[0].priority !== "C_READ_DELETE" && getUserPriorities[0].priority !== "C_R_UPDATE_DELETE" && getUserPriorities[0].priority !== "C_R_U_APPROV_REJECT") {

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

  const motifs = await prisma.motif.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const filieres = await prisma.filiere.findMany({
    select: {
      id: true,
      sigle: true,
      name: true,
      description: true,
    },
    orderBy: { sigle: "asc" },
  });

  return {
    props: {
      motifs,
      filieres,
    },
  };
};
