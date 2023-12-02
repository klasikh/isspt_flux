// pages/admin.tsx
import React from 'react'
import Head from "next/head";
import { type SubmitHandler, useForm } from 'react-hook-form'
import { gql, useQuery, useMutation } from '@apollo/client'
import { useRouter } from "next/navigation"
import toast, { Toaster } from 'react-hot-toast'
import type { GetServerSideProps } from 'next'
import { getSession } from "next-auth/react"

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

const CreateModuleAttributeMutation = gql`
  mutation($userId: String!, $moduleId: String!, $priority: String!) {
    createUserModulePriority(userId: $userId, moduleId: $moduleId, priority: $priority) {
      userId
      moduleId
      priority
    }
  }
`
const ModuleAttribute = () => {
  const router = useRouter();

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
      name: "Tous les privilèges",
      value: "C_R_UPDATE_DELETE"
    },
  ]
  const [createUserModulePriority, { data, loading, error }] = useMutation(CreateModuleAttributeMutation)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()
  
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { userId, moduleId, priority, } = data
    const variables = { userId, moduleId, priority, }
    try {
      const createTheAttributeModule = await toast.promise(createUserModulePriority({ variables }), {
        loading: 'Opération en cours..',
        success: 'Module attribué avec succès!🎉',
        error: `Une erreur s'est produite 😥 Veuillez re-essayer SVP - ${error}`,
      })

      if(createTheAttributeModule.data.createUserModulePriority) {
        router.push('/modules/list')
      }

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <Head>
        <title>Attribuer un module à un utilisateur</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto max-w-md py-12">
        <Toaster />
        <h1 className="text-3xl font-medium my-5">Attribuer un module à un utilisateur</h1>
        <form className="grid grid-cols-1 gap-y-6 bg-white shadow-lg p-8 rounded-lg" onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="text-gray-700">Sélectionnez un utilisateur</span>
            <select id="users" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" name="userId" {...register('userId', { required: true })}>
              <option value="" selected disabled>Utilisateur</option>
              { allUsers?.users.edges.map(({ node }: { node: Node }) => (
                <option value={node.id}>{node.name}</option>
                )
              )}
            </select>
          </label>
          <label className="block">
            <span className="text-gray-700">Sélectionnez le module</span>
            <select id="modules" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" name="moduleId" {...register('moduleId', { required: true })}>
              <option value="" selected disabled>Module</option>
              { allModules?.modules.edges.map(({ node }: { node: Node }) => (
                <option value={node.id}>{node.name}</option>
                )
              )}
            </select>
          </label>
          <label className="block">
            <span className="text-gray-700">Privilège</span>
            <select id="priorities" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" name="priority" {...register('priority', { required: true })}>
              <option value="" selected disabled>Privilège</option>
              { priorities.map((node) => (
                <option key={node.name} value={node.value}>{node.name}</option>
                )
              )}
            </select>
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
                Ajout en cours...
              </span>
            ) : (
              <span>Valider</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ModuleAttribute;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  // console.log(session)
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
        destination: '/404',
      },
      props: {},
    };
  }

  return {
    props: {},
  };
};
