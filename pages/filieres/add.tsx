// pages/admin.tsx
import React from 'react'
import Head from "next/head";
import { type SubmitHandler, useForm } from 'react-hook-form'
import { gql, useMutation } from '@apollo/client'
import { useRouter } from "next/navigation"
import toast, { Toaster } from 'react-hot-toast'
import type { GetServerSideProps } from 'next'
import { getSession } from "next-auth/react"
import prisma from '../../lib/prisma'

type FormValues = {
  sigle: string;
  name: string;
  description: string;
}

const CreateFiliereMutation = gql`
  mutation($sigle: String!, $name: String!, $description: String!) {
    createFiliere(sigle: $sigle, name: $name, description: $description) {
      sigle
      name
      description
    }
  }
`

const FiliereAdd = () => {
  const router = useRouter();
  const [createFiliere, { data, loading, error }] = useMutation(CreateFiliereMutation)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()
  
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { sigle, name, description, } = data
    const variables = { sigle, name, description, }
    try {
      const createTheFiliere = await toast.promise(createFiliere({ variables }), {
        loading: 'Opération en cours..',
        success: 'Filière créée avec succès!🎉',
        error: `Une erreur s'est produite 😥 Veuillez re-essayer SVP - ${error}`,
      })

      if(createTheFiliere.data.createFiliere) {
        router.push('/filieres/list')
      }

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <Head>
        <title>Ajouter une filière</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto max-w-md py-12">
        <Toaster />
        <h1 className="text-3xl font-medium my-5">Ajouter une filière</h1>
        <form className="grid grid-cols-1 gap-y-6 bg-white shadow-lg p-8 rounded-lg" onSubmit={handleSubmit(onSubmit)}>
          <strong className="text-red-600">Tous les champs sont obligatoires</strong>
          <label className="block">
            <span className="text-gray-700">Sigle de la filière</span>
            <input
              placeholder="Sigle de la filière"
              {...register('sigle', { required: true })}
              name="sigle"
              type="text" required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Nom de la filière</span>
            <input
              placeholder="Nom de la filière"
              {...register('name', { required: true })}
              name="name"
              type="text" required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
          <label for="descrption" className="block">
            <span className="text-gray-700">Description</span>
            <textarea id="descrption" rows="4" {...register('description', { required: true })} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="Description de la filière" name="description"></textarea>
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
                Ajout en cours...
              </span>
            ) : (
              <span>Ajouter</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default FiliereAdd;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  // console.log(session)
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

  return {
    props: {},
  };
};
