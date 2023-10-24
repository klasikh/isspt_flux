// pages/admin.tsx
import React from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { gql, useQuery, useMutation } from '@apollo/client'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from "next/navigation"
import type { GetServerSideProps } from 'next'
import { getSession, useSession } from "next-auth/react"

type FormValues = {
  title: string;
  description: string;
  name: string;
  motif: string;
  nature: string;
  amount: string;
  step: string;
  createdYear: string;
  addedBy: string;
}

const CreateSpentMutation = gql`
  mutation($title: String!, $description: String!, $name: String!, $motif: String!, $nature: String!, $step: String!, $amount: String!, $createdYear: String!, $addedBy: ID!) {
    createSpent(title: $title, description: $description, name: $name, motif: $motif, nature: $nature, amount: $amount, step: $step, createdYear: $createdYear, addedBy: $addedBy) {
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

const SpentAdd = () => {

  const router = useRouter();

  const {data:session}=useSession()

  const [createSpent, { data, loading, error }] = useMutation(CreateSpentMutation)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { title, description, name, motif, nature, amount, step, createdYear, addedBy } = data

    const theStep = "0";
    const year = new Date().getFullYear();
    const yearToString = year.toString()
    const variables = { title, description, name, motif, nature, amount, step: theStep, createdYear: yearToString, addedBy: session?.user.id }
    try {
      const theAddedSpent = await toast.promise(createSpent({ variables }), {
        loading: 'Opération en cours..',
        success: 'Dépense ajoutée avec succès!🎉',
        error: `Une erreur s'est produite 😥 Veuillez re-essayer SVP - ${error}`,
      })

      if(theAddedSpent.data.createSpent) {
        router.push(`/spents/${theAddedSpent.data.createSpent.id}`)
      }

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="container mx-auto px-12 pt-4 pb-12">
      <Toaster />
      <h1 className="text-3xl font-medium mb-5">Ajouter une dépense</h1>
      <form className="grid grid-cols-1 gap-y-4 bg-white shadow-lg p-8 rounded-lg" onSubmit={handleSubmit(onSubmit)}>
        <label className="block">
          <span className="text-gray-700">Titre</span>
          <input
            placeholder="Dépense ..."
            {...register('title', { required: true })}
            name="title"
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </label>
        <label for="description" class="block">
          <span className="text-gray-700">Description</span>
          <textarea id="description" rows="4" {...register('description', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="Description de la dépense" name="description"></textarea>
        </label>
        <label className="block">
          <span className="text-gray-700">Nom du matériel</span>
          <input
            placeholder="Nom du matériel"
            {...register('name', { required: true })}
            name="name"
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </label>
        <div className="flex gap-x-4 w-full">
          <label className="block w-full">
            <span className="text-gray-700">Nature de la dépense</span>
            <input
              placeholder="Nature de la dépense"
              {...register('nature', { required: true })}
              name="nature"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
          <label className="block w-full">
            <span className="text-gray-700">Motif de la dépense</span>
            <input
              placeholder="Motif de la dépense"
              {...register('motif', { required: true })}
              name="motif"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-gray-700">Montant</span>
          <input
            placeholder="Montant à dépenser"
            {...register('amount', { required: true })}
            name="amount"
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </label>

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
            <span>Valider</span>
          )}
        </button>
      </form>
    </div>
  )
}

export default SpentAdd;

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
    select: {
      email: true,
      role: true,
    },
    where: {
      email: session.user?.email,
    },
  });

  if (!user || (user.role !== "USER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return {
      redirect: {
        permanent: false,
        destination: '/404',
      },
      props: {},
    };
  }

  return {
    props: {},
  };
};
