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

const CreateUserMutation = gql`
  mutation($name: String!, $username: String!, $gradeId: String!, $role: String!, $image: String) {
    createUser(name: $name, username: $username, gradeId: $gradeId, role: $role, image: $image) {
      name
      username
      gradeId
      role
      image
    }
  }
`

const UserAdd = () => {
  const router = useRouter();

  const { data: allGrades } = useQuery(AllGradesQuery);

  const [createUser, { data, loading, error }] = useMutation(CreateUserMutation);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()
  
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { name, username, gradeId, role, } = data
    const variables = { name, username, gradeId, role, }
    try {
      const createTheUser = await toast.promise(createUser({ variables }), {
        loading: 'Opération en cours..',
        success: 'Utilisateur ajouté avec succès!🎉',
        error: `Une erreur s'est produite 😥 Veuillez re-essayer SVP - ${error}`,
      })

      if(createTheUser.data.createUser) {
        router.push('/users/list')
      }

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <Head>
        <title>Ajouter un utilisateur</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto max-w-md py-12">
        <Toaster />
        <h1 className="text-3xl font-medium my-5">Ajouter un utilisateur</h1>
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
            <span className="text-gray-700">Attribuer un grade</span>
            <select id="grades" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" name="gradeId" {...register('gradeId', { required: true })} required>
              <option value="" selected disabled>Grade</option>
              { allGrades?.grades.edges.map(({ node }: { node: Node }) => (
                <option value={node.id}>{node.name}</option>
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

export default UserAdd;

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
