import React, { useEffect, useState } from 'react';
import Head from "next/head";
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
  name: string;
  description: string;
}

const EditMotifMutation = gql`
  mutation($id: ID!, $name: String!, $description: String!, ) {
    updateMotif(id: $id, name: $name, description: $description,) {
      id
      name
      description
    }
  }
`

const EditMotif = ({ motif }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const {data:session}=useSession()
  const theUserSession = session;

  const [editMotif, { data, loading, error }] = useMutation(EditMotifMutation)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ mode: 'onBlur' });

  useEffect(() => {
    if (motif) {
        reset({
          name: motif.name ,
          description: motif.description,
        });
    }
  }, [motif]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { id, name, description } = data

    const variables = { id: motif.id, name, description, }
    try {
      const theEditedmotif = await toast.promise(editMotif({ variables }), {
        loading: 'Opération en cours..',
        success: 'Motif modifié avec succès!🎉',
        error: `Une erreur s'est produite 😥 Veuillez re-essayer SVP - ${error}`,
      })

      if(theEditedmotif.data.updateMotif) {
        router.push(`/motifs/${theEditedmotif.data.updateMotif.id}`)
      }

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <Head>
        <title>Modifier un motif</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto max-w-lg mt-10">
        <Toaster />
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-500 text-white font-bold px-4 py-2 mb-6 rounded-md hover:bg-gray-600 flex"
        >
          <ArrowLeftIcon className="h-6 w-6 text-white font-bold mr-2" aria-hidden="true" />
          Retour
        </button>
        <h1 className="text-3xl font-medium mb-5 uppercase text-center">Modifier un motif</h1>
        <form className="grid grid-cols-1 gap-y-6 bg-white shadow-lg p-8 rounded-lg" onSubmit={handleSubmit(onSubmit)}>
          <strong className="text-red-600">Tous les champs sont obligatoires</strong>
          <label className="block">
            <span className="text-gray-700">Nom du motif</span>
            <input
              placeholder="Nom du motif"
              {...register('name', { required: true })}
              name="name"
              type="text" required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
          <label for="description" className="block">
            <span className="text-gray-700">Description</span>
            <textarea id="description" rows="4" {...register('description', { required: true })} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="Description du motif" name="description"></textarea>
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
                Modification en cours...
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

export default EditMotif;

export const getServerSideProps: GetServerSideProps = async ( ctx, params ) => {
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

    if (!user || (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN")) {
        return {
          redirect: {
              permanent: false,
              destination: '/404',
          },
          props: {},
        };
    }

    const motif = await prisma.motif.findUnique({
        where: {
          id: id
        },
        select: {
          id: true,
          name: true,
          description: true,
        },
    });

    if (!motif) return {
        notFound: true
    }

    return {
        props: {
          motif,
        },
    };
};
