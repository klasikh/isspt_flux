import React, { useEffect, useState } from 'react';
import Head from "next/head";
import { type SubmitHandler, useForm } from 'react-hook-form'
import prisma from '../../../../lib/prisma';
import { gql, useQuery, useMutation } from '@apollo/client';
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { getSession, useSession } from "next-auth/react";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from "next/navigation";
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import axios from "axios";

type FormValues = {
  userId: string;
  moduleId: string;
  priority: string;
}

const AllUsersQuery = gql`
  query allGradesQuery($first: Int, $after: ID) {
    users(first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          name
          username
          image
        }
      }
    }
  }
`;

const AllModulesQuery = gql`
  query allGradesQuery($first: Int, $after: ID) {
    modules(first: $first, after: $after) {
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

const EditUserModuleMutation = `
  mutation($id: ID!, $userId: String!, $moduleId: String!, $priority: String!) {
    updateUserModulePriority(id: $id, userId: $userId, moduleId: $moduleId, priority: $priority) {
      id
      userId
      moduleId
      priority
    }
  }
`

const EditUserModulePriority = ({ userModuled, users, modules }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const {data:session}=useSession()
  const theUserSession = session;

//   const [editUserModule, { data, loading, error }] = useMutation(EditUserModuleMutation)

  const { data: allUsers } = useQuery(AllUsersQuery);

  const { data: allModules } = useQuery(AllModulesQuery);

  const priorities = [
    {
      name: "Aucun",
      value: "NONE"
    },
    {
      name: "Créer seul",
      value: "CREATE"
    },
    {
      name: "Lire seul",
      value: "READ"
    },
    {
      name: "Modifier seul",
      value: "UPDATE"
    },
    {
      name: "Supprimer seul",
      value: "DELETE"
    },
    {
      name: "Créer, lire",
      value: "CREATE_READ"
    },
    {
      name: "Créer, lire, modifier",
      value: "C_READ_UPDATE"
    },
    {
      name: "Créer, lire, supprimer",
      value: "C_READ_DELETE"
    },
    {
      name: "Lire, modifier, supprimer",
      value: "R_UPDATE_DELETE"
    },
    {
      name: "Lire, approuver, rejeter",
      value: "APPROV_REJECT"
    },
    {
      name: "Créer, approuver, rejeter",
      value: "C_R_U_APPROV_REJECT"
    },
    {
      name: "Tous les privilèges",
      value: "C_R_UPDATE_DELETE"
    },
  ]

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ mode: 'onBlur' });

  useEffect(() => {
    if (userModuled) {
        reset({
          userId: userModuled.userId ,
          moduleId: userModuled.moduleId,
          priority: userModuled.priority,
        });
    }
  }, [userModuled]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { id, userId, moduleId, priority } = data

    const variables = { id: userModuled.id, userId, moduleId, priority, }
    try {
//       const theEditedUserModule = await toast.promise(editUserModule({ variables }), {
//         loading: 'Opération en cours..',
//         success: 'Privilège de module modifié avec succès!🎉',
//         error: `Une erreur s'est produite 😥 Veuillez re-essayer SVP - ${error}`,
//       })

      setIsLoading(true)
      const theEditedUserModule = await axios.post('/api/graphql', {
                                       "query": EditUserModuleMutation,
                                       "variables" : variables
                                      },
                                   { headers: { 'Content-Type': 'application/json' } }
                                  );

      if(theEditedUserModule?.data.errors) {
        toast.error(`${theEditedUserModule?.data.errors[0].extensions.originalError.message}`)
        setIsLoading(false)
      } else {
        toast.success('Privilège de module modifié avec succès!🎉');
        setIsLoading(false)
        if(theEditedUserModule.data.data.updateUserModulePriority) {
           router.push(`/modules/list`)
        }
      }
      setIsLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <Head>
        <title>Modifier le privilège d'un utilisateur</title>
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
        <h1 className="text-3xl font-medium mb-5 uppercase text-center">Modifier un privilège de module</h1>
        <form className="grid grid-cols-1 gap-y-6 bg-white shadow-lg p-8 rounded-lg" onSubmit={handleSubmit(onSubmit)}>
          <strong className="text-red-600">Tous les champs sont obligatoires</strong>
           <label className="block">
            <span className="text-gray-700">Sélectionnez un utilisateur</span>
            <select id="users" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" name="userId" {...register('userId', { required: true })} required>
              <option value="" selected disabled>Utilisateur</option>
              { users.map((node: any) => (
                <option value={node.id} key={node.id}>{node.name}</option>
                )
              )}
            </select>
          </label>
          <label className="block">
            <span className="text-gray-700">Sélectionnez le module</span>
            <select id="modules" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" name="moduleId" {...register('moduleId', { required: true })} required>
              <option value="" selected disabled>Module</option>
              { modules.map((node: any) => (
                <option value={node.id} key={node.id}>{node.name}</option>
                )
              )}
            </select>
          </label>
          <label className="block">
            <span className="text-gray-700">Privilège</span>
            <select id="priorities" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" name="priority" {...register('priority', { required: true })} required>
              <option value="" selected disabled>Privilège</option>
              { priorities.map((node) => (
                <option key={node.name} value={node.value}>{node.name}</option>
                )
              )}
            </select>
          </label>

          <button
            disabled={isLoading}
            type="submit"
            className="my-4 capitalize text-white font-medium py-2 px-4 rounded-md bg-red-700 hover:bg-red-400"
          >
            {isLoading ? (
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

export default EditUserModulePriority;

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

    const userModuled = await prisma.userModulePriority.findUnique({
        where: {
          id: id
        },
        select: {
          id: true,
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            }
          },
          moduleId: true,
          module: {
            select: {
              id: true,
              name: true,
            }
          },
          priority: true
        },
    });

    if (!userModuled) return {
        notFound: true
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        grade: {
          select: {
            name: true
          },
        },
        role: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const modules = await prisma.module.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
        props: {
          users,
          modules,
          userModuled,
        },
    };
};
