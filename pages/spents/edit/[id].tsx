import React, { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form'
import prisma from '../../../lib/prisma';
import { gql, useQuery, useMutation } from '@apollo/client';
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { getSession, useSession } from "next-auth/react";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from "next/navigation";
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

type FormValues = {
  id: string;
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

const EditSpentMutation = gql`
  mutation($id: ID!, $title: String!, $description: String!, $name: String!, $motif: String!, $nature: String!, $step: String!, $amount: String!, $createdYear: String!, $addedBy: ID!) {
    updateSpent(id: $id, title: $title, description: $description, name: $name, motif: $motif, nature: $nature, amount: $amount, step: $step, createdYear: $createdYear, addedBy: $addedBy) {
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

const EditSpent = ({ spent }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const {data:session}=useSession()
  const theUserSession = session;

  const [editSpent, { data, loading, error }] = useMutation(EditSpentMutation)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ mode: 'onBlur' });

  useEffect(() => {
    if (spent) {
        reset({
          title: spent.title,
          description: spent.description,
          name: spent.name ,
          motif: spent.motif,
          nature: spent.nature,
          amount: spent.amount,
          step: spent.step,
        });
    }
  }, [spent]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { id, title, description, name, motif, nature, amount, step, createdYear, addedBy } = data

    const theStep = "0";
    const year = new Date().getFullYear();
    const yearToString = year.toString()
    const variables = { id: spent.id, title, description, name, motif, nature, amount, step: theStep, createdYear: yearToString, addedBy: session?.user.id }
    try {
      const theEditedSpent = await toast.promise(editSpent({ variables }), {
        loading: 'Opération en cours..',
        success: 'Dépense mise à jour avec succès!🎉',
        error: `Une erreur s'est produite 😥 Veuillez re-essayer SVP - ${error}`,
      })

      if(theEditedSpent.data.updateSpent) {
        router.push(`/spents/${theEditedSpent.data.updateSpent.id}`)
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
        <h1 className="text-3xl font-medium mb-5 uppercase text-center">Editer une dépense</h1>
        <form className="grid grid-cols-1 gap-y-4 bg-white shadow-lg p-8 rounded-lg" onSubmit={handleSubmit(onSubmit)}>
        <strong className="text-red-600">Tous les champs sont obligatoires</strong>
        <label className="block">
          <span className="text-gray-700">Titre</span>
          <input
            placeholder="Dépense ..."
            {...register('title', { required: true })}
            name="title"
            type="text" required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </label>
        <label for="description" className="block">
          <span className="text-gray-700">Description</span>
          <textarea id="description" rows="4" {...register('description', { required: true })} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="Description de la dépense" name="description"></textarea>
        </label>
        <label className="block">
          <span className="text-gray-700">Nom du bénéficiaire</span>
          <input
            placeholder="Nom du bénéficiaire"
            {...register('name', { required: true })}
            name="name"
            type="text" required
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
              type="text" required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
          <label className="block w-full">
            <span className="text-gray-700">Motif de la dépense</span>
            <input
              placeholder="Motif de la dépense"
              {...register('motif', { required: true })}
              name="motif"
              type="text" required
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
            type="number" required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </label>

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

export default EditSpent;

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

  if(session?.user.id !== spent.addedBy) {
    toast.error("Désolé, vous ne pouvez pas modifier cette dépense");
    return {
      redirect: {
        permanent: false,
        destination: '/dashboard',
      },
      props: {},
    };
  }

  if(spent?.step !== "0") {
    toast.error("Désolé, vous ne pouvez plus modifier cette dépense");
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
      spent,
    },
  };
};
