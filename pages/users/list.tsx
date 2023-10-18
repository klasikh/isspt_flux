// /pages/index.tsx
import Head from "next/head";
import { gql, useQuery, useMutation } from "@apollo/client";
import { AwesomeLink } from "../../components/AwesomeLink";
import type { Link as Node } from "@prisma/client";
import { useEffect } from "react";
import type { GetServerSideProps } from 'next'
import { getSession } from "next-auth/react"
import Link from "next/link";
// import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Tooltip,
  Progress,
} from "@material-tailwind/react";
import { EllipsisVerticalIcon, EyeIcon, PencilIcon, TrashIcon, } from "@heroicons/react/24/outline";

const AllUsersQuery = gql`
  query allUsersQuery($first: Int, $after: ID) {
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
          email
          gradeId
          role
          image
        }
      }
    }
  }
`;

const GetGradeQuery = gql`
  query getGradeQuery($id: String) {
    grade(id: $id) {
      name
      email
      gradeId
      role
      image
    }
  }
`;
/*
function getEGrade(gradeId) {

  useEffect(() => {
    const { data: getEachGrade } = useQuery(GetGradeQuery, {
      variables: { id: gradeId },
    });
  })

  return getEachGrade?.name

}*/

function UsersList() {
//   const { user } = useUser()
  const { data, loading, error, fetchMore } = useQuery(AllUsersQuery, {
    variables: { first: 10 },
  });

  {/* if (!user) {
    return (
      <div className="flex items-center justify-center">
        To view the awesome links you need to{' '}
        <Link href="/api/auth/login" className=" block bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0">
          Login
        </Link>
      </div>
    );
  } */}

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Oh no... {error.message}</p>;

  const { endCursor, hasNextPage } = data?.users.pageInfo;

  return (
    <div>
      <Head>
        <title>Liste des utilisateurs</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto max-w-5xl mt-7">
        <div className="mb-12">
          <Link href="/users/add">
            <Button variant="outlined" size="sm" className="bg-blue-500 hover:text-white">
              Ajouter un utilisateur
            </Button>
          </Link>
        </div>
        <div className="mt-12">
          <Card>
            <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
              <Typography variant="h6" color="white">
                Utilisateurs ({data?.users.edges.length})
              </Typography>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["photo", "nom", "email", "grade", "role", "action",].map(
                      (el) => (
                        <th
                          key={el}
                          className="border-b border-blue-gray-50 py-3 px-5 text-left"
                        >
                          <Typography
                            variant="small"
                            className="text-[11px] font-bold uppercase text-blue-gray-400"
                          >
                            {el}
                          </Typography>
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  { data?.users.edges.map(({ node }: { node: Node }) => (
                        <tr key={node.id}>
                          <td className={`py-3 px-5`}>
                              <Tooltip content={node.image}>
                                <Avatar
                                  src={``}
                                  alt={node.image}
                                  size="xs"
                                  variant="circular"
                                  className={`cursor-pointer border-2 border-white `}
                                />
                              </Tooltip>
                          </td>
                          <td className={`py-3 px-5`}>
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-bold"
                              >
                                {node.name}
                              </Typography>
                          </td>
                          <td className={`py-3 px-5`}>
                            <Typography
                              variant="small"
                              className="text-xs font-medium text-blue-gray-600"
                            >
                              {node.email}
                            </Typography>
                          </td>
                          <td className={`py-3 px-5`}>
                            <div className="w-10/12">
                              <Typography
                                variant="small"
                                className="mb-1 block text-xs font-medium text-blue-gray-600"
                              >
                                { node.gradeId.name }
                              </Typography>
                              <Progress
                                value={node.name}
                                variant="gradient"
                                color={node.name === 100 ? "green" : "blue"}
                                className="h-1"
                              />
                            </div>
                          </td>
                          <td className={`py-3 px-5`}>
                            <Typography
                              variant="small"
                              className="text-xs font-medium text-blue-gray-600"
                            >
                              {node.role}
                            </Typography>
                          </td>
                          <td className={`py-3 px-5`}>
                            <Typography
                              className="text-xs font-semibold text-blue-gray-600"
                            >
                              <Link href={`/users/${node.id}`}>
                                <IconButton variant="text" color="white" className="text-sm bg-gray-600 hover:bg-gray-400">
                                  <EyeIcon className="h-5 w-5 text-white-500" />
                                </IconButton>
                              </Link>
                              <Link href={`/users/edit/${node.id}`}>
                                <IconButton variant="text" color="white" className="text-sm bg-blue-600 hover:bg-blue-400 mx-3">
                                  <PencilIcon className="h-5 w-5 text-white-500" />
                                </IconButton>
                              </Link>
                              <Link href={`/users/delete/${node.id}`}>
                                <IconButton variant="text" color="white" className="text-sm bg-red-600 hover:bg-red-400">
                                  <TrashIcon className="h-5 w-5 text-white-500" />
                                </IconButton>
                              </Link>
                            </Typography>
                          </td>
                        </tr>
                    )
                  )}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default UsersList;

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
