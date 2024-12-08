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
  username: string;
  gradeId: string;
  role: string;
}

const AllGradesQuery = gql`
  query allGradesQuery($first: Int, $after: ID) {
    grades(first: $first, after: $after) {
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

const EditUserMutation = gql`
  mutation($id: ID!, $name: String!, $username: String!, $gradeId: String!, $role: String!, $image: String ) {
    updateUser(id: $id, name: $name, username: $username, gradeId: $gradeId, role: $role, image: $image) {
      id
      name
      username
      gradeId
      role
      image
    }
  }
`

const EditUser = ({ user, grades }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const {data:session}=useSession()
  const theUserSession = session;

  const { data: allGrades } = useQuery(AllGradesQuery);

  const [editUser, { data, loading, error }] = useMutation(EditUserMutation)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ mode: 'onBlur' });

  useEffect(() => {
    if (user) {
        reset({
          name: user.name ,
          username: user.username,
          gradeId: user.gradeId,
          role: user.role,
        });
    }
  }, [user]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { id, name, username, gradeId, role } = data

    const variables = { id: user.id, name, username, gradeId, role, }
    try {
      const theEditedUser = await toast.promise(editUser({ variables }), {
        loading: 'Opération en cours..',
        success: 'Compte utilisateur modifié avec succès!🎉',
        error: `Une erreur s'est produite 😥 Veuillez re-essayer SVP - ${error}`,
      })

      if(theEditedUser.data.updateUser) {
        router.push(`/users/list`)
      }

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <Head>
        <title>Modifier un compte utilisateur</title>
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
        <h1 className="text-3xl font-medium mb-5 uppercase text-center">Modifier un compte utilisateur</h1>
        <form className="grid grid-cols-1 gap-y-6 bg-white shadow-lg p-8 rounded-lg" onSubmit={handleSubmit(onSubmit)}>
           <label className="block">
            <span className="text-gray-700">Nom complet de l&apos;utilisateur</span>
            <input
              placeholder="Nom et prénoms"
              {...register('name', { required: true })}
              name="name"
              type="text" required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
           <label className="block">
            <span className="text-gray-700">Nom d&apos;utilisateur de l&apos;utilisateur</span>
            <input
              placeholder="Nom d'utilisateur de l'utlisateur"
              {...register('username', { required: true })}
              name="username"
              type="text" required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Attribuer un profil</span>
            <select id="grades" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" name="gradeId" {...register('gradeId', { required: true })} required>
              <option value="" selected disabled>Profil</option>
              { grades.map((node: any) => (
                <option value={node.id} key={node.id}>{node.name}</option>
                )
              )}
            </select>
          </label>
          <label className="block">
            <span className="text-gray-700">Attribuer un rôle</span>
            <select id="grades" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" name="role" {...register('role', { required: true })}  required>
              <option value="" selected disabled>Rôle</option>
              <option value="USER">Utilisateur</option>
              <option value="ADMIN">Admin</option>
              {/* <option value="SUPER_ADMIN">Super Admin</option> */}
            </select>
          </label>
          <label className="block">
            <span className="text-gray-700">Photo de l&apos;utlisateur</span>
            <input
              placeholder="Sélectionnez une photo"
              {...register('image', { required: false })}
              name="image"
              type="file"
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

export default EditUser;

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

    const userConnected = await prisma.user.findUnique({
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

    if (!userConnected || (userConnected?.role !== "ADMIN" && userConnected?.role !== "SUPER_ADMIN")) {
        return {
          redirect: {
              permanent: false,
              destination: '/404',
          },
          props: {},
        };
    }

    const user = await prisma.user.findUnique({
        where: {
          id: id
        },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          gradeId: true,
          grade: {
            select: {
              name: true
            },
          },
          role: true,
        },
    });

    const grades = await prisma.grade.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!user) return {
        notFound: true
    }

    return {
        props: {
          user,
          grades,
        },
    };
};
